#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs/promises';
import { execSync } from 'child_process';

// ============================================================
// 配置
// ============================================================
const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

const DEFAULT_FEEDS = [
  'https://hnrss.org/frontpage?count=30',   // HackerNews 首页热门
  'http://export.arxiv.org/rss/cs.AI',      // arXiv AI 新论文
  'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  'https://www.technologyreview.com/feed/',
];

// ============================================================
// 工具函数
// ============================================================
function slugify(s) {
  return s
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FazhoujiBot/2.0)' },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

// ============================================================
// RSS/Atom 解析
// ============================================================
async function parseItemsFromXml(xml) {
  let XMLParser = null;
  try {
    const pkg = await import('fast-xml-parser');
    XMLParser = pkg.XMLParser || pkg.default?.XMLParser || pkg.default || pkg;
  } catch (_) { /* 回退 */ }

  if (XMLParser) {
    try {
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
      const obj = parser.parse(xml);
      const channel = obj.rss?.channel || obj.feed || obj;
      let rawItems = channel?.item || channel?.entry || [];
      if (!Array.isArray(rawItems)) rawItems = [rawItems];
      return rawItems.map(it => ({
        title: extractText(it.title, ''),
        link: extractLink(it.link, ''),
        description: extractText(it.description || it.summary, ''),
        pubDate: it.pubDate || it.published || it.updated || new Date().toISOString(),
      }));
    } catch (_) { /* 回退 */ }
  }

  // 正则回退
  const items = [];
  const blocks = xml.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi) || [];
  for (const block of blocks) {
    const title = (block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const link = (block.match(/<link[^>]+href=["']([^"']+)["']/i) || [])[1]
      || (block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '';
    const desc = (block.match(/<(?:description|summary)[^>]*>([\s\S]*?)<\/(?:description|summary)>/i) || [])[1] || '';
    const pub = (block.match(/<(?:pubDate|published|updated)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i) || [])[1] || new Date().toISOString();
    items.push({
      title: stripHtml(title).replace(/\n/g, ' ').trim(),
      link: link.trim(),
      description: stripHtml(desc).trim(),
      pubDate: pub.trim(),
    });
  }
  return items;
}

function extractText(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'string') return stripHtml(val);
  if (typeof val === 'object') return stripHtml(val['#text'] || val._ || JSON.stringify(val));
  return String(val);
}

function extractLink(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'object') return (val.href || val['#text'] || '').trim();
  return String(val);
}

function stripHtml(s) {
  return String(s).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

// ============================================================
// 内容质量检测
// ============================================================
function isValidContent(text) {
  if (!text || text.length < 300) return false;

  // 检测论坛/评论风格内容（Reddit、HN 讨论等）
  const forumPatterns = [
    /\b(upvote|downvote|karma|reddit|subreddit)\b/i,
    /\b(comments?\s*\d+|reply|replied|replie)\b/i,
    /posted\s+(by|u\/|user)/i,
    /\[–\]\s*\[deleted\]|\[removed\]/i,
    /points?\s*(ago|by)/i,
    /分[享钟]|评论|回复|举报/i,
  ];

  let forumScore = 0;
  for (const p of forumPatterns) {
    if (p.test(text)) forumScore++;
  }

  // 如果匹配到 3 个以上论坛特征，判定为低质量
  if (forumScore >= 3) return false;

  // 检查可读性：中文字符占比
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]{3,}/g) || []).length;
  const totalChars = text.length;

  // 太短或全是英文短句 = 可能不是好文章
  if (totalChars < 500) return false;

  return true;
}
// ============================================================
async function scrapeFullContent(url) {
  try {
    const html = await fetchText(url);
    const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || [])[1] || html;
    const cleaned = body
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '');
    const text = stripHtml(cleaned);
    return text.slice(0, 20000);
  } catch (_) {
    return null;
  }
}

// ============================================================
// DeepSeek 完整中文翻译（OpenAI 兼容接口）
// ============================================================
async function translateArticle(apiKey, content, title, link, provider = 'deepseek') {
  const isDeepseek = provider === 'deepseek';
  const apiUrl = isDeepseek
    ? 'https://api.deepseek.com/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
  const model = isDeepseek ? 'deepseek-chat' : 'gpt-4o-mini';

  const promptText = `你是一位专业的中英技术翻译。请将以下英文技术文章完整翻译成中文。

【要求】
- 逐段完整翻译，保留所有细节、数据、案例和引用。
- 专业术语首次出现时保留英文并在括号中标注中文。
- 长句可拆分为 2-3 个短句，但信息点不能少。
- 保持原文逻辑顺序和段落结构。
- 按自然分段合并为 4-8 个 sections，每节一个小标题。

【输出格式】
严格返回 JSON（不要 markdown 代码块）：
{
  "title": "中文标题（信达雅，12-20字）",
  "category": "文章分类（ai-tools/programming/startup/crypto/hardware/science/design/policy/mobile/gaming）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "sections": [
    {"heading": "1. 标题", "content": "完整翻译正文..."},
    {"heading": "2. 标题", "content": "完整翻译正文..."}
  ]
}`;

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是专业的中英翻译。逐段完整翻译 JSON 输出，不总结不遗漏。' },
        { role: 'user', content: `${promptText}\n\n原文标题：${title}\n原文链接：${link}\n原文内容：\n${content.slice(0, 20000)}` },
      ],
      max_tokens: 8000,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${provider} ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const txt = data.choices?.[0]?.message?.content || '';
  const m = txt.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const p = JSON.parse(m[0]);
      return {
        title: p.title || title,
        category: p.category || 'tech',
        tags: p.tags || p.keywords || [],
        sections: p.sections || [],
      };
    } catch (_) { /* fallthrough */ }
  }
  // Fallback: use raw text
  return {
    title,
    category: 'tech',
    tags: [],
    sections: [{ heading: '', content: txt.slice(0, 2000) }],
  };
}

// 转义 MDX 中的特殊字符（{ } 会被解析为 JS 表达式）
function escapeMdx(s) {
  return String(s || '')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============================================================
// 生成 MDX
// ============================================================
function buildMdx(item, article, date) {
  const { title, category, tags, sections } = article;
  const safeTitle = String(title || item.title).replace(/"/g, '\\"');
  const firstSection = sections[0]?.content || '';
  const safeExcerpt = String(firstSection).replace(/"/g, '\\"').replace(/\n/g, ' ').slice(0, 200);
  const safeLink = String(item.link || '').replace(/"/g, '\\"');
  const safeCategory = category || 'tech';

  const body = sections.map(s => {
    if (s.heading) {
      return `## ${escapeMdx(s.heading)}\n\n${escapeMdx(s.content)}`;
    }
    return escapeMdx(s.content);
  }).join('\n\n');

  return `---
title: "${safeTitle}"
date: "${date}"
excerpt: "${safeExcerpt}"
category: "${safeCategory}"
tags: ${JSON.stringify(tags)}
original: "${safeLink}"
draft: false
---

${body}

---

🔗 **原文链接：[${safeLink}](${safeLink})**
`;
}

// ============================================================
// 主流程
// ============================================================
async function main() {
  try {
    const feeds = (process.env.RSS_FEEDS || DEFAULT_FEEDS.join(',')).split(',').map(s => s.trim()).filter(Boolean);

    console.log(`📡 抓取 ${feeds.length} 个 RSS 源...`);
    const xmls = await Promise.all(feeds.map(f =>
      fetchText(f).catch(err => { console.warn(`  ⚠️  ${f}: ${err.message}`); return null; })
    ));

    const allItems = [];
    for (const xml of xmls) {
      if (!xml) continue;
      const items = await parseItemsFromXml(xml);
      if (items?.length) allItems.push(...items);
    }

    if (allItems.length === 0) { console.log('❌ 没有抓取到任何文章。'); return; }
    console.log(`📰 抓取到 ${allItems.length} 篇文章`);

    // 去重
    const dir = 'content/auto';
    await fs.mkdir(dir, { recursive: true });
    const existingFiles = (await fs.readdir(dir).catch(() => [])).filter(f => f.endsWith('.mdx'));
    const existingOriginals = new Set();
    for (const f of existingFiles) {
      try {
        const txt = await fs.readFile(`${dir}/${f}`, 'utf8');
        const m = txt.match(/original:\s*"([^"]+)"/i);
        if (m) existingOriginals.add(m[1]);
      } catch (_) { /* ignore */ }
    }

    const N = Number(process.env.MAX_NEW_POSTS || 10);
    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    const uniq = [];
    const seenLinks = new Set();
    for (const it of allItems) {
      if (uniq.length >= N) break;
      if (!it.link && !it.title) continue;
      if (existingOriginals.has(it.link) || seenLinks.has(it.link)) continue;
      seenLinks.add(it.link);
      uniq.push(it);
    }

    if (uniq.length === 0) { console.log('✅ 没有新文章。'); return; }

    const deepseekKey = process.env.DEEPSEEK_API_KEY || process.env.SUMMARY_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!deepseekKey && !openaiKey) console.log('⚠️  未配置 API Key，使用原始摘要。');

    for (const item of uniq) {
      const date = new Date(item.pubDate).toISOString().slice(0, 10);
      const slug = slugify(item.title || item.link || date);
      console.log(`\n📝 ${item.title.slice(0, 60)}...`);

      let fullContent = item.description || '';
      console.log('  🔍 抓取全文...');
      const scraped = await scrapeFullContent(item.link);
      if (scraped && scraped.length > fullContent.length) {
        fullContent = scraped;
        console.log(`  ✅ 获取 ${fullContent.length} 字符`);
      } else {
        console.log(`  ℹ️  使用摘要 (${fullContent.length} 字符)`);
      }

      // 质量检测
      if (!isValidContent(fullContent)) {
        console.log(`  ⏭️  内容质量不足，跳过`);
        continue;
      }

      let article = null;

      if (deepseekKey) {
        try {
          console.log('  🤖 DeepSeek 生成完整中文文章...');
          article = await translateArticle(deepseekKey, fullContent, item.title, item.link, 'deepseek');
          console.log(`  ✅ ${article.title?.slice(0, 40)}...`);
        } catch (e) {
          console.warn(`  ⚠️  DeepSeek 失败: ${e.message}`);
        }
      }

      if (!article && openaiKey) {
        try {
          console.log('  🤖 OpenAI 回退...');
          article = await translateArticle(openaiKey, fullContent, item.title, item.link, 'openai');
          console.log(`  ✅ ${article.title?.slice(0, 40)}...`);
        } catch (e) {
          console.warn(`  ⚠️  OpenAI 失败: ${e.message}`);
        }
      }

      if (!article) {
        // 完全无 AI 时的回退
        article = {
          title: item.title,
          category: 'tech',
          tags: [],
          sections: [{ heading: '', content: item.description || '暂无内容' }],
        };
      }

      const filename = `${dir}/${date}-${slug}.mdx`;
      await fs.writeFile(filename, buildMdx(item, article, date), 'utf8');
      console.log(`  💾 ${filename}`);
    }

    // Git 提交
    const canPush = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
    if (canPush) {
      try {
        execSync('git add --all', { stdio: 'inherit' });
        execSync('git commit -m "chore: AI 自动生成文章" --no-verify || true', { stdio: 'inherit' });
        execSync('git push || true', { stdio: 'inherit' });
        console.log('\n🚀 已推送。');
      } catch (e) {
        console.warn('Git 失败:', e.message);
      }
    }
  } catch (err) {
    console.error('❌ 错误:', err);
    process.exit(1);
  }
}

main();
