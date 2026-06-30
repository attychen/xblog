import Link from "next/link";
import Image from "next/image";

interface SelfCardProps {
  postCount: number;
  categoryCount: number;
}

export default function SelfCard({ postCount, categoryCount }: SelfCardProps) {
  return (
    <div className="liquid-glass rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-4 mb-4">
        <Image
          src="/logo.png"
          alt="法舟记"
          width={48}
          height={48}
          className="w-12 h-12 rounded-xl"
        />
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white">
            法舟记
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI 大模型与前沿技术笔记
          </p>
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-black dark:text-white">{postCount}</span> 篇文章
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-black dark:text-white">{categoryCount}</span> 个分类
        </span>
      </div>
      <Link href="/about" className="inline-block mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
        了解更多 →
      </Link>
    </div>
  );
}