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
// DeepSeek 完整中文文章生成（OpenAI 兼容接口）
// ============================================================
async function generateChineseArticle(apiKey, content, title, link, provider = 'deepseek') {
  const isDeepseek = provider === 'deepseek';
  const apiUrl = isDeepseek
    ? 'https://api.deepseek.com/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
  const model = isDeepseek ? 'deepseek-chat' : 'gpt-4o-mini';

  const prompt = `你是一位资深中文科技编辑。请根据以下原文撰写一篇高质量中文技术文章。

【硬性要求】
- 事实准确，不编造数据。不确定的信息标注「据原文」。
- 文笔轻松有趣但不失严谨，像和朋友聊天一样讲清楚技术话题。
- 逻辑清晰：先讲是什么、为什么重要，再讲怎么做、有什么影响。
- 不拖泥带水，每句话都有信息量。
- 小节标题用序号（1. 2. 3.），层次分明不跳号。

【输出结构】
返回严格 JSON（不要 markdown 代码块）：
{
  "title": "中文标题（12-20字，抓人眼球但不标题党）",
  "category": "文章分类，从以下选一个最贴切的：ai-tools / programming / startup / crypto / hardware / science / design / policy / mobile / gaming",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "sections": [
    {"heading": "1. 小节标题", "content": "该节完整段落（不少于150字，有细节有观点）"},
    {"heading": "2. 小节标题", "content": "该节完整段落"},
    {"heading": "3. 小节标题", "content": "该节完整段落"}
  ]
}

【写作指南】
- sections 至少 3 节，至多 6 节，每节 content 不少于 120 字。
- 第一节做引入（为什么这个话题值得关注），最后一节做总结/展望。
- 中间各节围绕原文核心展开，每节一个明确观点。
- tags 要精准多元：包含技术名词、应用领域、趋势关键词，不用泛词如"科技""技术"。
- category 选最贴切的一个，不要总是 tech。`;

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是资深中文科技编辑，行文轻松有趣、逻辑清晰、事实准确。回复必须为严格 JSON。' },
        { role: 'user', content: `${prompt}\n\n原文标题：${title}\n原文链接：${link}\n原文内容：\n${content.slice(0, 15000)}` },
      ],
      max_tokens: 3000,
      temperature: 0.5,
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

# ${escapeMdx(safeTitle)}

> 原文：[${safeLink}](${safeLink})

${body}

---

<div style="text-align:right;margin-top:2em">
  <span style="font-size:10px;color:#999">本文由 DeepSeek V4 数据驱动生成</span>
</div>
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

      let article = null;

      if (deepseekKey) {
        try {
          console.log('  🤖 DeepSeek 生成完整中文文章...');
          article = await generateChineseArticle(deepseekKey, fullContent, item.title, item.link, 'deepseek');
          console.log(`  ✅ ${article.title?.slice(0, 40)}...`);
        } catch (e) {
          console.warn(`  ⚠️  DeepSeek 失败: ${e.message}`);
        }
      }

      if (!article && openaiKey) {
        try {
          console.log('  🤖 OpenAI 回退...');
          article = await generateChineseArticle(openaiKey, fullContent, item.title, item.link, 'openai');
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
