"use client";

import { useEffect, useState } from "react";
import type { FriendLink } from "@/lib/friend-links-store";

interface Props {
  initialLinks?: FriendLink[];
}

// 简易域名提取，用于显示 favicon
function faviconUrl(url: string): string {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch {
    return "";
  }
}

export default function FriendLinks({ initialLinks }: Props) {
  const [links, setLinks] = useState<FriendLink[]>(initialLinks || []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ url: "", title: "", description: "" });
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialLinks) {
      fetch("/api/friend-links")
        .then((r) => r.json())
        .then((d) => setLinks(d.links || []))
        .catch(() => {});
    }
  }, [initialLinks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/friend-links/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", text: data.message || "提交成功！AI 审核通过后将展示。" });
        setForm({ url: "", title: "", description: "" });
        setShowForm(false);
      } else {
        setStatus({ type: "error", text: data.error || "提交失败，请重试" });
      }
    } catch {
      setStatus({ type: "error", text: "网络错误，请稍后重试" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">友情链接</h4>

      {links.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {links.slice(0, 12).map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 
                         hover:text-orange-600 dark:hover:text-orange-400 transition-colors
                         bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md"
            >
              {faviconUrl(link.url) && (
                <img src={faviconUrl(link.url)} alt="" className="w-3.5 h-3.5 rounded-sm" />
              )}
              {link.title}
            </a>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500">暂无友链，欢迎申请</p>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-2 pt-1">
          <input
            type="url"
            placeholder="网站地址 (https://...)"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            required
            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 
                       rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
                       placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          <input
            type="text"
            placeholder="网站名称"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            maxLength={50}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 
                       rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
                       placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          <textarea
            placeholder="一句话描述你的网站（可选）"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            maxLength={200}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 
                       rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
                       placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 text-xs font-semibold text-white bg-orange-500 
                         hover:bg-orange-600 rounded transition-colors disabled:opacity-50"
            >
              {loading ? "审核中..." : "提交申请"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 
                         dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              取消
            </button>
          </div>
          {status && (
            <p className={`text-xs ${status.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
              {status.text}
            </p>
          )}
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 
                     transition-colors font-medium"
        >
          + 申请友链
        </button>
      )}
    </div>
  );
}
