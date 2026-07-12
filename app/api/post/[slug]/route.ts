import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/post";
import { renderMDX } from "@/lib/mdx";

export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let html = "";
  try {
    const MDXContent = await renderMDX(post.content);
    // For mini program, return raw markdown content
    html = post.content;
  } catch {
    html = post.content;
  }

  return NextResponse.json(
    {
      title: post.frontmatter.title,
      date: post.frontmatter.date,
      category: post.frontmatter.category,
      tags: post.frontmatter.tags,
      excerpt: post.frontmatter.excerpt,
      content: html,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
