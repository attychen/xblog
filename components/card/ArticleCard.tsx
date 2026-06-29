import Link from "next/link";
import type { Post } from "@/types";
import { getColorStyle } from "@/constant";

interface ArticleCardProps {
  post: Post;
}

export default function ArticleCard({ post }: ArticleCardProps) {
  const { slug, title, excerpt, date, category } = post;
  const href = `/blog/${slug}`;
  const categoryLabel = category || "随笔";
  const badgeClassName = getColorStyle(undefined, 'badge');

  const displayDate = date
    ? new Date(date).toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <article className="group cursor-pointer">
      {/* Category + Date row */}
      <div className="flex items-center gap-2 mb-1.5">
        {category && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${badgeClassName}`}>
            {categoryLabel}
          </span>
        )}
        {displayDate && (
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {displayDate}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="text-[15px] font-semibold leading-snug text-black dark:text-white mb-1 line-clamp-2 tracking-tight">
        {title || "Untitled"}
      </h2>
      
      {/* Excerpt */}
      {excerpt && (
        <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2">
          {excerpt}
        </p>
      )}
      
      {/* Read more */}
      <Link href={href} className="inline-block">
        <span className="text-[13px] font-medium text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">
          阅读全文
        </span>
      </Link>
    </article>
  );
}