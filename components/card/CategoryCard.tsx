import Link from "next/link";
import type { Post } from "@/types";
import { getDynamicCategories } from "@/constant";

export default function CategoryCard({ posts }: { posts: Post[] }) {
  const categories = getDynamicCategories(posts);
  const entries = Object.entries(categories);

  if (entries.length === 0) return null;

  return (
    <div className="liquid-glass rounded-2xl p-5 sticky top-24">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        分类
      </h3>
      <div className="space-y-2">
        {entries.map(([key, meta]) => (
          <Link
            key={key}
            href={`/blog/category/${key}`}
            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {meta.name}
            </span>
            
          </Link>
        ))}
      </div>
    </div>
  );
}