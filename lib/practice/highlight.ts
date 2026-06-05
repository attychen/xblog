// shiki 代码高亮（纯动态导入，兼容 shiki v1/v3）
let highlighter: any = null;

async function ensureHighlighter(): Promise<any> {
  if (highlighter) return highlighter;
  const shiki = await import('shiki');

  // shiki v3+: createHighlighter
  if (typeof (shiki as any).createHighlighter === 'function') {
    highlighter = await (shiki as any).createHighlighter({
      themes: ['nord'],
      langs: ['javascript', 'jsx', 'typescript', 'tsx', 'bash', 'json', 'css', 'html'],
    });
    return highlighter;
  }

  // shiki v1: getHighlighter
  if (typeof (shiki as any).getHighlighter === 'function') {
    highlighter = await (shiki as any).getHighlighter({ theme: 'nord' });
    return highlighter;
  }

  throw new Error('shiki: no supported highlighter factory found');
}

export async function highlightCode(code: string, lang: string) {
  try {
    const h = await ensureHighlighter();
    // shiki v3 用 theme (单数), v1 用 themes 数组也兼容
    const html = h.codeToHtml(String(code), {
      lang: lang || 'javascript',
      theme: 'nord',
    });
    return html;
  } catch {
    // Fallback: escape and wrap in pre/code
    const escaped = String(code)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code>${escaped}</code></pre>`;
  }
}

export default highlightCode;
