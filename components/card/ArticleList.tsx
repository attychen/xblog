"use client";

import { useState } from "react";
import ArticleCard from "./ArticleCard";
import type { Post } from "@/types";

const PAGE_SIZE = 9;

export default function ArticleList({ posts }: { posts: Post[] }) {
  const [page, setPage] = useState(1);
  const [mobileCount, setMobileCount] = useState(PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paged = posts.slice(start, start + PAGE_SIZE);
  const mobilePosts = posts.slice(0, mobileCount);
  const hasMore = mobileCount < posts.length;

  if (posts.length === 0) {
    return (
      <div className="pui-glass-card p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">暂无文章，敬请期待！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {/* Desktop */}
      <div className="hidden md:block space-y-3">
        {paged.map((post) => (
          <div key={post.slug} className="pui-glass-card p-4">
            <ArticleCard post={post} />
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700
                         text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >← 上一页</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 text-xs rounded-lg transition-all duration-200 ${
                  n === page
                    ? "bg-[#7c3aed] dark:bg-[#00d4ff] text-white dark:text-black font-semibold shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >{n}</button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700
                         text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >下一页 →</button>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-2 font-mono">{page}/{totalPages}</span>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {mobilePosts.map((post) => (
          <div key={post.slug} className="pui-glass-card p-3">
            <ArticleCard post={post} />
          </div>
        ))}

        {hasMore && (
          <button
            onClick={() => setMobileCount((c) => c + PAGE_SIZE)}
            className="w-full py-3 text-xs font-medium text-[#7c3aed] dark:text-[#00d4ff]
                       border border-dashed border-[#7c3aed]/30 dark:border-[#00d4ff]/30 rounded-xl
                       active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            加载更多 · 还有 {posts.length - mobileCount} 条
          </button>
        )}
      </div>
    </div>
  );
}