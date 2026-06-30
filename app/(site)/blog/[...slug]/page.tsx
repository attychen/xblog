import { renderMDX } from "@/lib/mdx";
import { getAllPosts, getPostBySlug, normalizeTags } from "@/lib/post";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { mdxComponents } from "@/components/ui/MdxContent";
import ReadingEnhancements from "@/components/ui/ReadingEnhancements";
import CodeCopyButton from "@/components/ui/CodeCopyButton";
import { extractHeadingsFromMdx } from "@/lib/headings";
import ArticleList from "@/components/card/ArticleList";
import { getDynamicCategories } from "@/constant";

export const revalidate = 3600;

type BlogPageProps = { params: Promise<{ slug: string[] }> };

async function resolveSlug(paramsPromise: BlogPageProps["params"]) {
  const params = await paramsPromise;
  if (!params?.slug) return null;
  return Array.isArray(params.slug) ? params.slug.join("/") : params.slug;
}

function getCategoryMeta(slug: string | null) {
  if (!slug || slug.includes("/")) return null;
  return getDynamicCategories(getAllPosts())[slug] ?? null;
}

function formatDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  const categories = getDynamicCategories(posts);
  return [
    ...posts.map((p) => ({ slug: p.slug.split("/") })),
    ...Object.keys(categories).map((c) => ({ slug: [c] })),
  ];
}

export async function generateMetadata({ params }: BlogPageProps) {
  const slug = await resolveSlug(params);
  if (!slug) return {};
  const cat = getCategoryMeta(slug);
  if (cat) return { title: `${cat.name} 动态` };
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    openGraph: { title: post.frontmatter.title, description: post.frontmatter.excerpt, type: "article" as const, publishedTime: post.frontmatter.date },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const slug = await resolveSlug(params);
  if (!slug) return notFound();

  const categoryMeta = getCategoryMeta(slug);
  if (categoryMeta) {
    const posts = getAllPosts().filter((p) => p.category === slug);
    return (
      <div className="pt-14 md:pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6">
          <header className="space-y-2">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">分类</p>
            <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">{categoryMeta.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{posts.length} 条动态</p>
          </header>
          {posts.length > 0 ? <ArticleList posts={posts} /> : <p className="text-gray-400 py-12 text-center">暂无动态</p>}
        </div>
      </div>
    );
  }

  const post = getPostBySlug(slug);
  if (!post) return notFound();

  const { frontmatter, content } = post;
  const MDXContent = await renderMDX(content);
  const readingMinutes = Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / 300));
  const displayDate = formatDate(frontmatter.date);
  const tags = normalizeTags(frontmatter.tags);
  const headings = extractHeadingsFromMdx(content);

  return (
    <>
      <ReadingEnhancements headings={headings} />
      <CodeCopyButton />

      {/* Mobile: full-width reading */}
      <article className="md:hidden pt-2 pb-20 px-4">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
          <ArrowLeft size={12} /> 返回
        </Link>
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {frontmatter.category && <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-gray-600 dark:text-gray-400">{frontmatter.category}</span>}
            {displayDate && <span className="text-[11px] text-gray-400">{displayDate}</span>}
            <span className="text-[11px] text-gray-400">{readingMinutes} 分钟</span>
          </div>
          {frontmatter.title && <h1 className="text-xl font-bold tracking-tight text-black dark:text-white leading-snug">{frontmatter.title}</h1>}
          {tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{tags.map((t: string) => <span key={t} className="text-[11px] text-gray-400">#{t}</span>)}</div>}
        </header>
        <div className="prose prose-sm dark:prose-invert max-w-none"><MDXContent components={mdxComponents} /></div>
      </article>

      {/* PC: spacious content-first */}
      <div className="hidden md:block pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors mb-8">
            <ArrowLeft size={14} /> 返回
          </Link>
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              {frontmatter.category && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-gray-600 dark:text-gray-400">{frontmatter.category}</span>}
              {displayDate && <span className="text-xs text-gray-400">{displayDate}</span>}
              <span className="text-xs text-gray-400">{readingMinutes} 分钟</span>
            </div>
            {frontmatter.title && <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white leading-tight">{frontmatter.title}</h1>}
            {frontmatter.subtitle && <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">{frontmatter.subtitle}</p>}
            {tags.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{tags.map((t: string) => <span key={t} className="text-xs text-gray-400">#{t}</span>)}</div>}
          </header>
          <article className="prose prose-lg prose-slate dark:prose-invert max-w-none"><MDXContent components={mdxComponents} /></article>
        </div>
      </div>
    </>
  );
}