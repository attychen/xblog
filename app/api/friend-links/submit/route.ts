import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { FriendLink } from "../route";

const DATA_FILE = path.join(process.cwd(), "public/links/data.json");

// 简易内存速率限制（IP -> 最近提交时间）
const rateMap = new Map<string, number>();

function readData(): { approved: FriendLink[]; pending: FriendLink[] } {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return { approved: [], pending: [] };
  }
}

function writeData(data: { approved: FriendLink[]; pending: FriendLink[] }) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// 用 AI 检查 URL 是否合法、是否为垃圾
async function aiReview(url: string, title: string, description: string): Promise<{ pass: boolean; reason?: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return { pass: true }; // 无 key 时放行

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
          { role: "system", content: "你是一个严格的友链审核员，回复必须为严格 JSON。" },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!res.ok) return { pass: true }; // AI 不可用时放行

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

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, description } = body;

    // --- 基础校验 ---
    if (!url || !title) {
      return NextResponse.json({ error: "URL 和标题为必填项" }, { status: 400 });
    }

    // URL 格式校验
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      return NextResponse.json({ error: "请输入有效的网址（以 http:// 或 https:// 开头）" }, { status: 400 });
    }

    // 标题长度
    if (title.length < 2 || title.length > 50) {
      return NextResponse.json({ error: "标题长度应在 2-50 字之间" }, { status: 400 });
    }

    // --- 反垃圾：速率限制 ---
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const lastSubmit = rateMap.get(ip);
    if (lastSubmit && Date.now() - lastSubmit < 60000) {
      return NextResponse.json({ error: "提交过于频繁，请 1 分钟后再试" }, { status: 429 });
    }
    rateMap.set(ip, Date.now());

    // --- 反垃圾：去重 ---
    const data = readData();
    const domain = extractDomain(url);
    const allUrls = [
      ...(data.approved || []).map((l: FriendLink) => extractDomain(l.url)),
      ...(data.pending || []).map((l: FriendLink) => extractDomain(l.url)),
    ];
    if (allUrls.includes(domain)) {
      return NextResponse.json({ error: "该网站已经提交过友链申请" }, { status: 409 });
    }

    // --- AI 审核 ---
    const review = await aiReview(url, title, description || "");
    if (!review.pass) {
      return NextResponse.json({ error: `审核未通过: ${review.reason}` }, { status: 400 });
    }

    // --- 存储到 pending ---
    const newLink: FriendLink = {
      title,
      url,
      description: description || "",
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    data.pending = data.pending || [];
    data.pending.push(newLink);
    writeData(data);

    return NextResponse.json({
      success: true,
      message: "友链申请已提交，AI 审核通过后将在一段时间后展示",
    });
  } catch (err) {
    console.error("friend-links submit error:", err);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
