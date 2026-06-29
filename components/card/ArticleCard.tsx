import Link from "next/link";
import type { Post } from "@/types";
import { getColorStyle } from "@/constant";

interface ArticleCardProps {
  post: Post;
}

export default function ArticleCard({ post }: ArticleCardProps) {
  const { slug, title, subtitle, excerpt, date, category } = post;
  const href = `/blog/${slug}`;
  const categoryLabel = category || "随笔";
  const badgeClassName = getColorStyle(undefined, 'badge');

  const displayDate = date
    ? new Date(date).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <article className="group">
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
        {category && (
          <Link
            href={`/blog/${category}`}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${badgeClassName}`}
          >
            {categoryLabel}
          </Link>
        )}
        {displayDate && (
          <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">
            {displayDate}
          </span>
        )}
      </div>

      <h2 className="text-sm md:text-lg font-bold tracking-tight mb-1.5 text-black dark:text-white line-clamp-2 transition-colors">
        {title || "Untitled"}
      </h2>
      
      {excerpt && (
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2 transition-colors">
          {excerpt}
        </p>
      )}
      
      <Link
        href={href}
        className="inline-flex items-center text-xs font-semibold text-[#7c3aed] dark:text-[#a855f7] hover:underline transition-colors"
      >
        阅读全文 →
      </Link>
    </article>
  );
}