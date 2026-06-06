// Cron endpoint: 自动将 pending >2h 的友链移到 approved
// 由 daily-ai-post workflow 定时调用
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "public/links/data.json");

export async function GET() {
  // 安全检查：只有含有 GITHUB_TOKEN 的环境才执行
  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    const now = Date.now();
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    const pending = data.pending || [];
    const approved = data.approved || [];

    // 找出超过 2 小时的 pending 申请
    const toApprove = pending.filter((l: { submittedAt: string }) => {
      return now - new Date(l.submittedAt).getTime() >= TWO_HOURS;
    });
    const stillPending = pending.filter((l: { submittedAt: string }) => {
      return now - new Date(l.submittedAt).getTime() < TWO_HOURS;
    });

    if (toApprove.length === 0) {
      return NextResponse.json({ message: "no links to approve", pending: stillPending.length });
    }

    // 批准
    const nowStr = new Date().toISOString();
    for (const link of toApprove) {
      link.status = "approved";
      link.approvedAt = nowStr;
    }
    data.approved = [...approved, ...toApprove];
    data.pending = stillPending;

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({
      message: `approved ${toApprove.length} links`,
      approved: toApprove.length,
      pending: stillPending.length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
