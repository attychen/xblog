import { NextRequest, NextResponse } from "next/server";
import { readApproved, readPending, addPending } from "@/lib/friend-links-store";
import type { FriendLink } from "@/lib/friend-links-store";

// 简易内存速率限制（IP -> 最近提交时间）
const rateMap = new Map<string, number>();

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// 用 AI 检查 URL 是否合法、是否为垃圾
async function aiReview(
  url: string,
  title: string,
  description: string
): Promise<{ pass: boolean; reason?: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return { pass: true };

  const isDeepseek = !!process.env.DEEPSEEK_API_KEY;
  const endpoint = isDeepseek
    ? "https://api.deepseek.com/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const model = isDeepseek ? "deepseek-chat" : "gpt-4o-mini";

  const prompt = `你是一个友链审核助手。请严格检查以下申请是否为合法技术/AI相关的个人网站或博客。

要求：
1. 网址必须可访问，看起来是合法网站（非色情、赌博、诈骗、广告联盟）
2. 网站内容应和技术、AI、开发、开源相关
3. 标题和描述不能是乱填的垃圾内容
4. 不能是短链接跳转、镜像站、采集站

请返回严格 JSON：
{"pass": true/false, "reason": "通过/不通过的原因（中文，一句话）"}

申请信息：
- URL: ${url}
- 标题: ${title}
- 描述: ${description}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "你是一个严格的友链审核员，回复必须为严格 JSON。",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!res.ok) return { pass: true };

    const data = await res.json();
    const txt = data.choices?.[0]?.message?.content || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (m) {
      const p = JSON.parse(m[0]);
      return { pass: !!p.pass, reason: p.reason || "" };
    }
  } catch {
    // fallthrough
  }

  return { pass: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, description } = body;

    // --- 基础校验 ---
    if (!url || !title) {
      return NextResponse.json(
        { error: "URL 和标题为必填项" },
        { status: 400 }
      );
    }

    // URL 格式校验
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      return NextResponse.json(
        { error: "请输入有效的网址（以 http:// 或 https:// 开头）" },
        { status: 400 }
      );
    }

    if (title.length < 2 || title.length > 50) {
      return NextResponse.json(
        { error: "标题长度应在 2-50 字之间" },
        { status: 400 }
      );
    }

    // --- 反垃圾：速率限制 ---
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const lastSubmit = rateMap.get(ip);
    if (lastSubmit && Date.now() - lastSubmit < 60000) {
      return NextResponse.json(
        { error: "提交过于频繁，请 1 分钟后再试" },
        { status: 429 }
      );
    }
    rateMap.set(ip, Date.now());

    // --- 反垃圾：去重 ---
    const domain = extractDomain(url);
    const existing = [
      ...readApproved().map((l: FriendLink) => extractDomain(l.url)),
      ...readPending().map((l: FriendLink) => extractDomain(l.url)),
    ];
    if (existing.includes(domain)) {
      return NextResponse.json(
        { error: "该网站已经提交过友链申请" },
        { status: 409 }
      );
    }

    // --- AI 审核 ---
    const review = await aiReview(url, title, description || "");
    if (!review.pass) {
      return NextResponse.json(
        { error: `审核未通过: ${review.reason}` },
        { status: 400 }
      );
    }

    // --- 存储到 pending（写入 /tmp/，安全） ---
    const newLink: FriendLink = {
      title,
      url,
      description: description || "",
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    const ok = addPending(newLink);
    if (!ok) {
      // 写入失败但不阻止用户 — 数据仍可通过重新提交恢复
      console.error("addPending failed");
    }

    return NextResponse.json({
      success: true,
      message: "友链申请已提交，AI 审核通过后将在一段时间后展示",
    });
  } catch (err) {
    console.error("friend-links submit error:", err);
    return NextResponse.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}
