'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Star, GitFork, ExternalLink, Calendar } from 'lucide-react';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  license: { name: string } | null;
}

const LANG_COLORS: Record<string, string> = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'Rust': '#dea584',
  'Go': '#00ADD8',
  'Java': '#b07219',
  'C++': '#f34b7d',
  'C': '#555555',
  'Ruby': '#701516',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'Zig': '#ec915c',
  'MDX': '#fcb32c',
};

function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toISOString().slice(0, 10);
}

export function SkillClient({ repos }: { repos: GitHubRepo[] }) {
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('');

  const languages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach(r => { if (r.language) set.add(r.language); });
    return Array.from(set).sort();
  }, [repos]);

  const filtered = useMemo(() => {
    return repos.filter(r => {
      const matchSearch = !search
        || r.full_name.toLowerCase().includes(search.toLowerCase())
        || (r.description && r.description.toLowerCase().includes(search.toLowerCase()));
      const matchLang = !langFilter || r.language === langFilter;
      return matchSearch && matchLang;
    });
  }, [repos, search, langFilter]);

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-bitcount tracking-[0.2em] text-gray-800 dark:text-gray-400 transition-colors">
            Skill榜单
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            GitHub 本周最热开源项目 · 每日刷新 · Top 30
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="搜索项目名称或描述..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 bg-white/90 backdrop-blur-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400
                         text-sm transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={langFilter}
            onChange={e => setLangFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white/90 backdrop-blur-sm text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
          >
            <option value="">全部语言</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          共 {filtered.length} 个项目
        </p>

        {/* Table - Desktop */}
        <div className="hidden md:block pui-glass overflow-hidden shadow-sm transition-shadow hover:shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-12">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">项目</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">一句话简介</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-20">
                    <Star className="w-4 h-4 inline" />
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-16">
                    <GitFork className="w-4 h-4 inline" />
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-24">语言</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((repo, i) => (
                  <tr
                    key={repo.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          width={24}
                          height={24}
                          className="rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                          unoptimized
                        />
                        <div>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {repo.full_name}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell max-w-xs">
                      <span className="text-xs leading-relaxed line-clamp-2" title={repo.description || ''}>
                        {repo.description || '暂无简介'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-gray-700 dark:text-gray-300">
                      {formatNum(repo.stargazers_count)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-gray-500 dark:text-gray-400">
                      {formatNum(repo.forks_count)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {repo.language && (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: LANG_COLORS[repo.language] || '#8b8b8b' }}
                          />
                          {repo.language}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
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
          {filtered.map((repo, i) => (
            <div
              key={repo.id}
              className="pui-glass-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-400 font-mono shrink-0">#{i + 1}</span>
                  <Image
                    src={repo.owner.avatar_url}
                    alt={repo.owner.login}
                    width={20}
                    height={20}
                    className="rounded-full shrink-0 ring-2 ring-gray-200 dark:ring-gray-600"
                    unoptimized
                  />
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
                  >
                    {repo.full_name}
                  </a>
                </div>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {repo.description ? (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2">
                  <span className="text-[10px] font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wide">简介</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{repo.description}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">暂无项目简介</p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" /> {formatNum(repo.stargazers_count)}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5" /> {formatNum(repo.forks_count)}
                </span>
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: LANG_COLORS[repo.language] || '#8b8b8b' }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1 ml-auto">
                  <Calendar className="w-3 h-3" /> {timeAgo(repo.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-lg">未找到匹配的项目</p>
          </div>
        )}
      </div>
    </div>
  );
}
