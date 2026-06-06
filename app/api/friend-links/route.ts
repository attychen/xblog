import { NextResponse } from "next/server";
import { readApproved } from "@/lib/friend-links-store";

export async function GET() {
  const approved = readApproved().sort(
    (a, b) => new Date(b.approvedAt || "").getTime() - new Date(a.approvedAt || "").getTime()
  );
  return NextResponse.json({ links: approved });
}
