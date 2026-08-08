"use client";

import { useState } from "react";
import ArticleCard from "./ArticleCard";
import type { Post } from "@/types";

const PAGE_SIZE = 9;
const MOBILE_PAGE_SIZE = 4;

export default function ArticleList({ posts }: { posts: Post[] }) {
  const [page, setPage] = useState(1);
  const [mobileCount, setMobileCount] = useState(1);

  // 桌面端分页
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const displayedPosts = posts.slice(0, page * PAGE_SIZE);
  const hasMore = page < totalPages;

  // 移动端加载更多
  const mobileDisplayedPosts = posts.slice(0, mobileCount * MOBILE_PAGE_SIZE);
  const mobileHasMore = mobileDisplayedPosts.length < posts.length;

  return (
    <div>
      {/* 桌面端网格 */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        {displayedPosts.map((post) => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>

      {/* 桌面端分页 */}
      {hasMore && (
        <div className="hidden md:flex justify-center mt-8">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            加载更多
          </button>
        </div>
      )}

      {/* 移动端列表 */}
      <div className="md:hidden space-y-4">
        {mobileDisplayedPosts.map((post) => (
          <ArticleCard key={post.slug} post={post} />
        ))}
        {mobileHasMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setMobileCount((c) => c + 1)}
              className="px-5 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
            >
              加载更多
            </button>
          </div>
        )}
      </div>
    </div>
  );
}