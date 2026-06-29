// Hugging Face 开源大模型排行榜 — 服务端获取
export interface HFModel {
  id: string;
  author: string;
  likes: number;
  downloads: number;
  pipeline_tag: string;
  tags: string[];
  lastModified: string;
  createdAt: string;
  description?: string;
  modelId: string;
}

export async function fetchTopModels(): Promise<HFModel[]> {
  try {
    // full=false 速度快，拿基础字段；再用 pipeline_tag 做分类筛选
    const url =
      "https://huggingface.co/api/models?sort=downloads&direction=-1&limit=50&filter=text-generation&full=true";
    const res = await fetch(url, {
      headers: { "User-Agent": "Fazhouji/1.0" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map(
      (m: Record<string, unknown>): HFModel => ({
        id: String(m.id || ""),
        modelId: String(m.modelId || m.id || ""),
        author: String((m as { author?: string }).author || ""),
        likes: Number(m.likes || 0),
        downloads: Number(m.downloads || 0),
        pipeline_tag: String(m.pipeline_tag || "text-generation"),
        tags: Array.isArray(m.tags) ? m.tags.map(String) : [],
        lastModified: String(m.lastModified || ""),
        createdAt: String(m.createdAt || ""),
        description: String(
          (m as { cardData?: { model_description?: string } }).cardData?.model_description ||
          (m as { description?: string }).description ||
          ""
        ),
      })
    );
  } catch {
    return [];
  }
}

// 模型分类的中文映射
export const PIPELINE_LABELS: Record<string, string> = {
  "text-generation": "文本生成",
  "text2text-generation": "文本转换",
  "translation": "翻译",
  "summarization": "摘要",
  "conversational": "对话",
  "question-answering": "问答",
  "text-classification": "文本分类",
  "token-classification": "标记分类",
  "fill-mask": "填空",
  "sentence-similarity": "语义相似",
  "zero-shot-classification": "零样本分类",
  "feature-extraction": "特征提取",
  "image-to-text": "图生文",
  "automatic-speech-recognition": "语音识别",
  "text-to-image": "文生图",
};

export function getModelCategory(m: HFModel): string {
  return PIPELINE_LABELS[m.pipeline_tag] || m.pipeline_tag || "其他";
}
