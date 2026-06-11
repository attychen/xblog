'use client';
import Link from "next/link";
import { getDynamicCategories } from "@/constant";
import type { Post } from "@/types";

interface CategoryCardProps {
  posts: Post[];
}

export default function CategoryCard({ posts }: CategoryCardProps) {
  const categories = getDynamicCategories(posts);

  if (Object.keys(categories).length === 0) return null;

  return (
    <div className="sticky top-24">
      <div className="pui-glass-card p-5">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 tracking-wide uppercase">
          Categories
        </h2>
        <div className="flex flex-col gap-1">
          {Object.entries(categories).map(([key, meta]) => (
            <Link
              key={key}
              href={`/blog/${key}`}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {meta.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
