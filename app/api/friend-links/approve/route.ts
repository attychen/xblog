// Cron endpoint: 自动将 pending >2h 的友链移到 approved
import { NextResponse } from "next/server";
import { readApproved, readPending, writePending } from "@/lib/friend-links-store";
import type { FriendLink } from "@/lib/friend-links-store";

export async function GET() {
  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const pending = readPending();
    const now = Date.now();
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    const toApprove = pending.filter((l) => now - new Date(l.submittedAt).getTime() >= TWO_HOURS);
    const stillPending = pending.filter((l) => now - new Date(l.submittedAt).getTime() < TWO_HOURS);

    if (toApprove.length === 0) {
      return NextResponse.json({ message: "no links to approve", pending: stillPending.length });
    }

    const nowStr = new Date().toISOString();
    const approved: FriendLink[] = readApproved();
    for (const link of toApprove) {
      link.status = "approved" as const;
      link.approvedAt = nowStr;
      approved.push(link);
    }

    writePending(stillPending);

    return NextResponse.json({
      message: `approved ${toApprove.length} links`,
      approved: approved.length,
      pending: stillPending.length,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
