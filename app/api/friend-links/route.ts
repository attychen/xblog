import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface FriendLink {
  title: string;
  url: string;
  description?: string;
  avatar?: string;
  submittedAt: string;
  approvedAt?: string;
  status: "approved" | "pending" | "rejected";
}

const DATA_FILE = path.join(process.cwd(), "public/links/data.json");

function readLinks(): { approved: FriendLink[]; pending: FriendLink[] } {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { approved: [], pending: [] };
  }
}

export async function GET() {
  const data = readLinks();
  // 只返回已批准的，且排序：最新在前
  const approved = (data.approved || []).sort(
    (a, b) => new Date(b.approvedAt || "").getTime() - new Date(a.approvedAt || "").getTime()
  );
  return NextResponse.json({ links: approved });
}
