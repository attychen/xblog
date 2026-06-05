// 统一颜色配置 - Tailwind 需要完整类名
export const COLOR_STYLES = {
  blue: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    card: "bg-blue-200 dark:bg-blue-800/30",
  },
  green: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    card: "bg-emerald-200 dark:bg-emerald-800/30",
  },
  purple: {
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    card: "bg-purple-200 dark:bg-purple-800/30",
  },
  orange: {
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    card: "bg-orange-200 dark:bg-orange-800/30",
  },
  pink: {
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    card: "bg-pink-200 dark:bg-pink-800/30",
  },
  teal: {
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    card: "bg-teal-200 dark:bg-teal-800/30",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    card: "bg-amber-200 dark:bg-amber-800/30",
  },
  gray: {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    card: "bg-gray-200 dark:bg-gray-700/40",
  },
} as const;

export type ColorKey = keyof typeof COLOR_STYLES;

// 分类中文显示名映射
const CATEGORY_DISPLAY: Record<string, string> = {
  "ai-tools": "AI 工具",
  "programming": "编程",
  "startup": "创业",
  "crypto": "加密/web3",
  "hardware": "硬件",
  "science": "科学",
  "design": "设计",
  "policy": "政策",
  "mobile": "移动端",
  "gaming": "游戏",
  "tech": "技术",
  "about": "关于",
  "frontend": "前端",
  "ai-news": "AI 资讯",
};

// 获取颜色样式的辅助函数
export const getColorStyle = (color: string | undefined, type: 'badge' | 'card') => {
  const key = (color && color in COLOR_STYLES ? color : 'gray') as ColorKey;
  return COLOR_STYLES[key][type];
};

// 分类颜色轮换（按出现顺序分配）
const CATEGORY_COLORS: ColorKey[] = ['blue', 'green', 'purple', 'orange', 'pink', 'teal', 'amber', 'gray'];

// 从文章列表动态生成分类映射
export function getDynamicCategories(posts: { category?: string }[]): Record<string, { name: string; color: ColorKey }> {
  const catSet = new Map<string, number>();
  const result: Record<string, { name: string; color: ColorKey }> = {};

  for (const post of posts) {
    const cat = post.category?.trim();
    if (cat && !catSet.has(cat)) {
      catSet.set(cat, catSet.size);
    }
  }

  for (const [cat, idx] of catSet) {
    result[cat] = {
      name: CATEGORY_DISPLAY[cat] || cat,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    };
  }

  return result;
}