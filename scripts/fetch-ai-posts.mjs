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

  const prompt = `你是一个专业的技术编辑。请根据以下英文/中文文章内容，完成以下任务：

1. 先完整理解原文的核心观点、论据和结论。
2. 用中文撰写一篇完整的文章（800-1500字），要求：
   - 开头用引人入胜的方式引出话题
   - 分 3-5 个小节，每节有清晰的标题
   - 每节内容充实，有具体细节和数据支撑，不要只列大纲
   - 结尾有总结或展望
   - 语言流畅自然，适合中文读者阅读
3. 提取 3-5 个中文关键词（数组格式）
4. 生成一个简洁有力的中文标题（10-20字）

严格返回 JSON（不要 markdown 代码块）：
{"title":"...","keywords":["..."],"sections":[{"heading":"...","content":"..."}]}
其中 sections 是文章主体，每项的 heading 是小节标题，content 是该节的完整段落内容。`;

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是专业的中文技术编辑，回复必须为严格 JSON，文章内容要完整充实，切勿只写大纲。' },
        { role: 'user', content: `${prompt}\n\n原文标题：${title}\n原文链接：${link}\n文章内容：\n${content.slice(0, 15000)}` },
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
        keywords: p.keywords || [],
        sections: p.sections || [],
      };
    } catch (_) { /* fallthrough */ }
  }
  // Fallback: use raw text
  return {
    title,
    keywords: [],
    sections: [{ heading: '', content: txt.slice(0, 2000) }],
  };
}

// ============================================================
// 生成 MDX
// ============================================================
function buildMdx(item, article, date) {
  const { title, keywords, sections } = article;
  const safeTitle = String(title || item.title).replace(/"/g, '\\"');
  const firstSection = sections[0]?.content || '';
  const safeExcerpt = String(firstSection).replace(/"/g, '\\"').replace(/\n/g, ' ').slice(0, 200);
  const safeLink = String(item.link || '').replace(/"/g, '\\"');

  const body = sections.map(s => {
    if (s.heading) {
      return `## ${s.heading}\n\n${s.content}`;
    }
    return s.content;
  }).join('\n\n');

  return `---
title: "${safeTitle}"
date: "${date}"
excerpt: "${safeExcerpt}"
category: "tech"
tags: ${JSON.stringify(keywords)}
original: "${safeLink}"
draft: false
---

# ${safeTitle}

> 原文：[${safeLink}](${safeLink})

${body}

---

*本文由 AI 辅助生成，内容经整理后发布。*
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
          keywords: [],
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
