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
      <div className="p-12 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">暂无文章</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop */}
      <div className="hidden md:block space-y-3">
        {paged.map((post) => (
          <div key={post.slug} className="pui-glass-card p-5">
            <ArticleCard post={post} />
          </div>
        ))}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 pt-4">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors">
              ← 上一页
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500 mx-2 font-mono">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors">
              下一页 →
            </button>
          </div>
        )}
      </div>

      {/* Mobile - list view with glass cards */}
      <div className="md:hidden px-4 space-y-3">
        {mobilePosts.map((post) => (
          <div key={post.slug} className="liquid-glass rounded-xl p-4">
            <ArticleCard post={post} compact />
          </div>
        ))}
        {hasMore && (
          <div className="pt-2">
            <button onClick={() => setMobileCount((c) => c + PAGE_SIZE)}
              className="w-full py-3 text-[13px] font-medium text-gray-500 dark:text-gray-400 liquid-glass-strong rounded-xl active:scale-[0.98] transition-all">
              加载更多
            </button>
          </div>
        )}
      </div>
    </div>
  );
}