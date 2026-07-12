import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const res = await fetch(
      `https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=30`,
      {
        headers: {
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "Fazhouji-Skill",
        },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    return NextResponse.json(data.items || [], {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json([]);
  }
}