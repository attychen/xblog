// Hugging Face 开源模型排行榜 — 服务端获取
export interface HFModel {
  id: string;
  author: string;
  likes: number;
  downloads: number;
  pipeline_tag: string;
  tags: string[];
  lastModified: string;
  createdAt: string;
}

export async function fetchTopModels(): Promise<HFModel[]> {
  try {
    const url =
      "https://huggingface.co/api/models?sort=likes&direction=-1&limit=20&filter=text-generation&full=false";
    const res = await fetch(url, {
      headers: { "User-Agent": "Fazhouji/1.0" },
      next: { revalidate: 86400 }, // 一天刷新一次
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map(
      (m: Record<string, unknown>): HFModel => ({
        id: String(m.id || ""),
        author: String((m as { author?: string }).author || m.id || "").split("/")[0] || "",
        likes: Number(m.likes || 0),
        downloads: Number(m.downloads || 0),
        pipeline_tag: String(m.pipeline_tag || "text-generation"),
        tags: Array.isArray(m.tags) ? m.tags.map(String) : [],
        lastModified: String(m.lastModified || ""),
        createdAt: String(m.createdAt || ""),
      })
    );
  } catch {
    return [];
  }
}
