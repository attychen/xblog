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
  'http://export.arxiv.org/rss/cs.AI',
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
// 抓取文章全文
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
    return text.slice(0, 12000);
  } catch (_) {
    return null;
  }
}

// ============================================================
// DeepSeek 中文摘要（OpenAI 兼容接口）
// ============================================================
async function summarizeWithDeepSeek(apiKey, content, title, link) {
  const prompt = `你是一个专业的技术文章中文摘要助手。请根据以下文章内容完成以下任务：

1. **中文摘要**：生成 4-6 句精炼的中文摘要，抓住文章核心观点、创新点和结论。翻译要准确流畅。
2. **中文关键词**：提取 5 个最核心的中文关键词（数组形式）。
3. **中文标题**：为文章生成一个简洁有力的中文标题。
4. **目录**：如果文章结构清晰，生成一个 3-6 条的中文目录（数组，如 ["1. 引言", "2. 方法", "3. 实验"]），内容较短可为空数组。

请严格返回 JSON（不要 markdown 代码块）：
{"summary": "...", "keywords": ["...", "..."], "suggested_title": "...", "toc": ["1. ...", "2. ..."]}`;

  const res = await fetch(DEEPSEEK_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: '你是专业的技术翻译和摘要助手，回复必须为严格 JSON。' },
        { role: 'user', content: `${prompt}\n\n原文标题：${title}\n原文链接：${link}\n文章内容：\n${content.slice(0, 8000)}` },
      ],
      max_tokens: 1200,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`DeepSeek ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const txt = data.choices?.[0]?.message?.content || '';
  const m = txt.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const p = JSON.parse(m[0]);
      return { summary: p.summary || '', keywords: p.keywords || [], suggested_title: p.suggested_title || title, toc: p.toc || [] };
    } catch (_) { /* fallthrough */ }
  }
  return { summary: txt.slice(0, 400), keywords: [], suggested_title: title, toc: [] };
}

// ============================================================
// OpenAI 回退摘要
// ============================================================
async function summarizeWithOpenAI(apiKey, content, title, link) {
  const prompt = `你是一个专业的技术文章中文摘要助手。请生成：1.中文摘要(4-6句) 2.中文关键词(5个) 3.中文标题 4.中文目录(3-6条)。严格返回JSON: {"summary":"...","keywords":["..."],"suggested_title":"...","toc":["1. ..."]}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '你是专业的技术翻译和摘要助手，回复必须为严格 JSON。' },
        { role: 'user', content: `${prompt}\n\n原文标题：${title}\n原文链接：${link}\n文章内容：\n${content.slice(0, 8000)}` },
      ],
      max_tokens: 1200,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const txt = data.choices?.[0]?.message?.content || '';
  const m = txt.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const p = JSON.parse(m[0]);
      return { summary: p.summary || '', keywords: p.keywords || [], suggested_title: p.suggested_title || title, toc: p.toc || [] };
    } catch (_) { /* fallthrough */ }
  }
  return { summary: txt.slice(0, 400), keywords: [], suggested_title: title, toc: [] };
}

// ============================================================
// 生成 MDX
// ============================================================
function buildMdx(item, aiResult, date) {
  const { summary, keywords, suggested_title, toc } = aiResult;
  const safeTitle = String(suggested_title || item.title).replace(/"/g, '\\"');
  const safeExcerpt = String(summary || '').replace(/"/g, '\\"').replace(/\n/g, ' ');
  const safeLink = String(item.link || '').replace(/"/g, '\\"');

  const tocSection = (toc && toc.length > 0)
    ? `\n## 📑 目录\n\n${toc.map(line => `- ${line}`).join('\n')}\n`
    : '';

  return `---
title: "${safeTitle}"
date: "${date}"
excerpt: "${safeExcerpt}"
category: "ai-news"
tags: ${JSON.stringify(keywords)}
original: "${safeLink}"
draft: false
---

# ${safeTitle}

> 📌 原文链接：[${safeLink}](${safeLink})

## 📝 摘要

${summary || '暂无摘要'}

${tocSection}

---

*本文由 AI 自动生成，内容仅供参考。*
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

    const N = Number(process.env.MAX_NEW_POSTS || 3);
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

      let aiResult = { summary: fullContent.slice(0, 300), keywords: [], suggested_title: item.title, toc: [] };

      if (deepseekKey) {
        try {
          console.log('  🤖 DeepSeek 摘要...');
          aiResult = await summarizeWithDeepSeek(deepseekKey, fullContent, item.title, item.link);
          console.log(`  ✅ ${aiResult.summary.slice(0, 50)}...`);
        } catch (e) {
          console.warn(`  ⚠️  DeepSeek 失败: ${e.message}`);
        }
      }

      if (!aiResult.summary && openaiKey) {
        try {
          console.log('  🤖 OpenAI 回退...');
          aiResult = await summarizeWithOpenAI(openaiKey, fullContent, item.title, item.link);
        } catch (e) {
          console.warn(`  ⚠️  OpenAI 失败: ${e.message}`);
        }
      }

      const filename = `${dir}/${date}-${slug}.mdx`;
      await fs.writeFile(filename, buildMdx(item, aiResult, date), 'utf8');
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
