import { SkillClient } from './SkillClient';

// GitHub trending: 最近一周创建的最热开源项目
// 使用 GitHub Search API（无需认证即可 60 req/h）
export const revalidate = 86400; // 每天刷新一次

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

async function fetchTrendingRepos(): Promise<GitHubRepo[]> {
  // 获取最近 7 天创建的最热项目
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const url = `https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=30`;

  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Fazhouji-Skill/1.0',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers, next: { revalidate: 86400 } });
  if (!res.ok) {
    console.warn('GitHub API error:', res.status);
    return [];
  }

  const data = await res.json();
  return (data.items || []) as GitHubRepo[];
}

export default async function SkillPage() {
  const repos = await fetchTrendingRepos();

  return <SkillClient repos={repos} />;
}
