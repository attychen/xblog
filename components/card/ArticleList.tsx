"use client";

import { useState } from "react";
import ArticleCard from "./ArticleCard";
import type { Post } from "@/types";

const PAGE_SIZE = 9;

export default function ArticleList({ posts }: { posts: Post[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paged = posts.slice(start, start + PAGE_SIZE);

  if (posts.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No articles yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {paged.map((post) => (
        <div
          key={post.slug}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800 dark:border dark:border-gray-700"
        >
          <ArticleCard post={post} />
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700
                       text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                n === page
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700
                       text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
