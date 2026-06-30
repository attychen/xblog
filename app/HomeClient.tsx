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
    <div className="pt-2 md:pt-4 pb-8">
      {/* Mobile: SelfCard */}
      <div className="md:hidden px-4 mb-4">
        <SelfCard postCount={posts.length} categoryCount={categoryEntries.length} />
      </div>

      {/* Mobile: Category chips */}
      {categoryEntries.length > 0 && (
        <div className="md:hidden px-4 mb-4 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2">
            {categoryEntries.map(([key, meta]) => (
              <Link
                key={key}
                href={`/blog/category/${key}`}
                className="flex-shrink-0 px-3 py-1.5 liquid-glass 
                           text-[12px] font-medium text-gray-700 dark:text-gray-300 
                           rounded-full active:scale-95 transition-all duration-200"
              >
                {meta.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="hidden md:block max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <SelfCard postCount={posts.length} categoryCount={categoryEntries.length} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-1">
                最新动态
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                每天 8:00 UTC 自动更新 · AI 大模型与智能体前沿动态
              </p>
            </div>
            <ArticleList posts={posts} />
          </div>
          <div className="lg:col-span-1">
            <CategoryCard posts={posts} />
          </div>
        </div>
      </div>

      {/* Mobile: Article list - full width */}
      <div className="md:hidden">
        <div className="px-4 mb-3">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            最新动态
          </h2>
        </div>
        <ArticleList posts={posts} />
      </div>
    </div>
  );
}