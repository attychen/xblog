// 统一颜色配置 - Tailwind 需要完整类名
export const COLOR_STYLES = {
  blue: {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    card: "bg-gray-400 dark:bg-gray-400/40",
  },
  green: {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    card: "bg-gray-400 dark:bg-gray-400/40",
  },
  purple: {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    card: "bg-gray-400 dark:bg-gray-400/40",
  },
  gray: {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    card: "bg-gray-400 dark:bg-gray-400/40",
  },
  orange: {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    card: "bg-gray-400 dark:bg-gray-400/40",
  },
} as const;

export type ColorKey = keyof typeof COLOR_STYLES;

// 获取颜色样式的辅助函数
export const getColorStyle = (color: string | undefined, type: 'badge' | 'card') => {
  const key = (color && color in COLOR_STYLES ? color : 'gray') as ColorKey;
  return COLOR_STYLES[key][type];
};

// 分类颜色轮换（按出现顺序分配）
const CATEGORY_COLORS: ColorKey[] = ['blue', 'green', 'purple', 'orange', 'gray'];

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
      name: cat,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    };
  }

  return result;
}