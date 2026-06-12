"use client";

import type { HFModel } from "@/lib/hf-models";
import { TrendingUp, Download, Heart, ExternalLink } from "lucide-react";

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

const BADGE_COLORS: Record<string, string> = {
  "text-generation": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

function getBadge(tag: string) {
  return (
    BADGE_COLORS[tag] ||
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
  );
}

export default function ModelsLeaderboard({ models }: { models: HFModel[] }) {
  if (!models || models.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        模型数据加载中，请稍后再来...
      </div>
    );
  }

  return (
    <div className="pui-glass overflow-hidden">
      {/* 桌面端表格 */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-10">#</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">模型</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-700 dark:text-gray-300 w-20">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> 热度
                </div>
              </th>
              <th className="text-center px-3 py-3 font-semibold text-gray-700 dark:text-gray-300 w-20">
                <div className="flex items-center justify-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> 点赞
                </div>
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {models.slice(0, 20).map((m, i) => (
              <tr
                key={m.id}
                className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-4 py-2.5 text-gray-400 dark:text-gray-500 font-mono text-xs">
                  {i < 3 ? (
                    <span className={i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-amber-600"}>
                      {i + 1}
                    </span>
                  ) : (
                    i + 1
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div>
                      <a
                        href={`https://huggingface.co/${m.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-xs truncate block max-w-[180px] md:max-w-xs"
                      >
                        {m.id}
                      </a>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getBadge(m.pipeline_tag)}`}>
                        {m.pipeline_tag}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-600 dark:text-gray-400">
                  {formatNum(m.downloads)}
                </td>
                <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-600 dark:text-gray-400">
                  {formatNum(m.likes)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <a
                    href={`https://huggingface.co/${m.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 移动端卡片 */}
      <div className="sm:hidden space-y-2">
        {models.slice(0, 20).map((m, i) => (
          <div key={m.id} className="pui-glass-card px-4 py-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-xs font-mono shrink-0 ${i < 3 ? "font-bold text-yellow-500" : "text-gray-400"}`}>
                  #{i + 1}
                </span>
                <a
                  href={`https://huggingface.co/${m.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  {m.id}
                </a>
              </div>
              <a
                href={`https://huggingface.co/${m.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {formatNum(m.downloads)}</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNum(m.likes)}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${getBadge(m.pipeline_tag)}`}>{m.pipeline_tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
