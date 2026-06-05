/** 分类 → 侧栏与详情页展示的中文标签 */
export const CATEGORY_LABELS = {
  array: '数组与索引',
  function: '函数与闭包',
  async: '异步编程',
  react: 'React 相关',
  oop: '面向对象',
} as const;

/** 侧栏分组顺序（与 manifest 内题目顺序无关） */
export const CATEGORY_ORDER = [
  'array',
  'function',
  'oop',
  'async',
  'react',
] as const;

/** 难度 → 详情页徽章文案 */
export const DIFFICULTY_LABELS = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
} as const;

/** 练习仓 GitHub 根 URL，用于「在 GitHub 查看源码」链接 */
export const PRACTICE_REPO_URL =
  'https://github.com/attychen/xblog';

export default CATEGORY_ORDER;
