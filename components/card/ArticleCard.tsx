import Link from "next/link";
import type { Post } from "@/types";
import { getColorStyle } from "@/constant";

interface ArticleCardProps {
  post: Post;
  compact?: boolean;
}

export default function ArticleCard({ post, compact = false }: ArticleCardProps) {
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

  if (compact) {
    return (
      <article className="group cursor-pointer">
        <div className="flex items-center gap-2 mb-1">
          {category && (
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${badgeClassName}`}>
              {categoryLabel}
            </span>
          )}
        </div>
        <h2 className="text-[15px] font-medium leading-snug text-black dark:text-white tracking-tight">
          {title || "Untitled"}
        </h2>
        {excerpt && (
          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mt-1 line-clamp-2">
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {displayDate && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500">{displayDate}</span>
          )}
          <Link href={href} className="text-[12px] text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            阅读 →
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group cursor-pointer">
      <div className="flex items-center gap-2 mb-1.5">
        {category && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${badgeClassName}`}>
            {categoryLabel}
          </span>
        )}
        {displayDate && (
          <span className="text-[11px] text-gray-400 dark:text-gray-500">{displayDate}</span>
        )}
      </div>
      <h2 className="text-[15px] font-semibold leading-snug text-black dark:text-white mb-1 line-clamp-2 tracking-tight">
        {title || "Untitled"}
      </h2>
      {excerpt && (
        <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2">
          {excerpt}
        </p>
      )}
      <Link href={href} className="inline-block">
        <span className="text-[13px] font-medium text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">
          阅读全文
        </span>
      </Link>
    </article>
  );
}