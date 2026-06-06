'use client';
import SelfCard from "@/components/card/SelfCard";
import ArticleList from "@/components/card/ArticleList";
import CategoryCard from "@/components/card/CategoryCard";
import Link from "next/link";
import { getDynamicCategories } from "@/constant";
import type { Post } from "@/types";

export default function HomeClient({ posts }: { posts: Post[] }) {
  const dynamicCategories = getDynamicCategories(posts);
  const categoryEntries = Object.entries(dynamicCategories);

  return (
    <div className="pt-20 pb-8">
      {/* 博客导语 */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <SelfCard postCount={posts.length} categoryCount={categoryEntries.length} />
      </div>

      {/* 移动端：横向滚动分类 chips */}
      {categoryEntries.length > 0 && (
        <div className="md:hidden max-w-7xl mx-auto px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {categoryEntries.map(([key, meta]) => (
              <Link
                key={key}
                href={`/blog/${key}`}
                className="flex-shrink-0 px-2 py-1 border border-black dark:border-white font-mono text-xs font-bold tracking-wider text-black dark:text-white transition-all"
              >
                {meta.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 主要内容区域：文章列表 + 侧边栏 */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：文章列表 */}
          <div className="lg:col-span-3">
            <div className="mb-2">
              <h2 className="text-xl md:text-3xl font-bold text-black mb-2 dark:text-white">
                最新动态
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                每天 8:00 UTC 自动更新 · AI 大模型与智能体前沿动态
              </p>
            </div>
            <ArticleList posts={posts} />
          </div>

          {/* 右侧：侧边栏（移动端隐藏） */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <CategoryCard posts={posts} />
          </div>
        </div>
      </div>
    </div>
  );
}
