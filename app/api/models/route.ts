import { NextResponse } from "next/server";

export const revalidate = 604800;

export async function GET() {
  try {
    const res = await fetch(
      "https://huggingface.co/api/models?sort=downloads&direction=-1&limit=50&filter=text-generation&full=true",
      { next: { revalidate: 604800 } }
    );
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    const models = (data || []).map((m: Record<string, unknown>) => ({
      id: String(m.id || ""),
      author: String(m.author || ""),
      likes: Number(m.likes || 0),
      downloads: Number(m.downloads || 0),
      pipeline_tag: String(m.pipeline_tag || "text-generation"),
      tags: Array.isArray(m.tags) ? m.tags.map(String) : [],
      description: String(m.description || ""),
    }));
    return NextResponse.json(models, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json([]);
  }
}