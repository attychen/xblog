import { getHighlighter, type Highlighter } from 'shiki';

let highlighter: Highlighter | null = null;

async function ensureHighlighter() {
  if (highlighter) return highlighter;
  highlighter = await getHighlighter({ theme: 'nord' });
  return highlighter;
}

export async function highlightCode(code: string, lang: string) {
  const h = await ensureHighlighter();
  try {
    const html = h.codeToHtml(code, { lang: lang || 'javascript' });
    return html;
  } catch (err) {
    // Fallback: escape and wrap in pre/code
    const escaped = String(code).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre><code>${escaped}</code></pre>`;
  }
}

export default highlightCode;
