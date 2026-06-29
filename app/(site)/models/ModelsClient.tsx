'use client';

import { useState, useMemo } from 'react';
import { Star, GitFork, ExternalLink } from 'lucide-react';
import type { HFModel } from '@/lib/hf-models';
import { getModelCategory } from '@/lib/hf-models';

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

// 简介：优先 HF 描述，回退到标签拼接
function getSummary(m: HFModel): string {
  if (m.description && m.description.length > 10) return m.description.slice(0, 200);
  const tagStr = m.tags.slice(0, 5).join(', ');
  return tagStr ? `标签: ${tagStr}` : '暂无简介';
}

export default function ModelsClient({ models }: { models: HFModel[] }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    models.forEach(m => set.add(getModelCategory(m)));
    return Array.from(set).sort();
  }, [models]);

  const filtered = useMemo(() => {
    return models.filter(m => {
      const matchSearch = !search
        || m.id.toLowerCase().includes(search.toLowerCase())
        || m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchCat = !catFilter || getModelCategory(m) === catFilter;
      return matchSearch && matchCat;
    });
  }, [models, search, catFilter]);

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-bitcount tracking-[0.2em] pui-grad-text transition-colors">
            大模型榜
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            HuggingFace 开源文本生成模型 · 按下载量排序 · 实时更新
          </p>
        </div>

        {/* Filter bar */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索模型名称或标签..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-xl pui-input text-sm"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl pui-input pui-select text-sm w-36 sm:w-40"
            >
              <option value="">全部分类</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          共 {filtered.length} 个模型
        </p>

        {/* Table - Desktop */}
        <div className="hidden md:block pui-glass overflow-hidden shadow-sm transition-shadow hover:shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-12">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">模型</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">简介</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-24">分类</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-20">
                    <Star className="w-4 h-4 inline" />
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-20">
                    <GitFork className="w-4 h-4 inline" />
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr
                    key={m.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group relative"
                  >
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <a
                            href={`https://huggingface.co/${m.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-xs block max-w-[200px] md:max-w-sm truncate"
                          >
                            {m.id}
                          </a>
                        </div>
                      </div>
                      {/* Hover tooltip */}
                      <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block">
                        <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-sm whitespace-normal leading-relaxed">
                          {getSummary(m)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden lg:table-cell max-w-xs">
                      <span className="text-xs leading-relaxed line-clamp-2">
                        {getSummary(m)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {getModelCategory(m)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-gray-700 dark:text-gray-300">
                      {formatNum(m.likes)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-gray-500 dark:text-gray-400">
                      {formatNum(m.downloads)}
                    </td>
                    <td className="px-4 py-3 text-right">
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
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {filtered.map((m, i) => (
            <div
              key={m.id}
              className="pui-glass-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-400 font-mono shrink-0">#{i + 1}</span>
                  <a
                    href={`https://huggingface.co/${m.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
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
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2">
                <span className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide">简介</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{getSummary(m)}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {formatNum(m.likes)}</span>
                <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {formatNum(m.downloads)}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {getModelCategory(m)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-lg">未找到匹配的模型</p>
          </div>
        )}
      </div>
    </div>
  );
}
