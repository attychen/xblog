import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/post";

export const revalidate = 3600;

export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json(posts, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
