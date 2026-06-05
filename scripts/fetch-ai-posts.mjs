#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs/promises';
import { execSync } from 'child_process';
// dynamic import of fast-xml-parser (some runners may not have it installed)
// we'll try to load it when parsing XML; if unavailable, fall back to a simple regex parser

const DEFAULT_FEEDS = [
  'http://export.arxiv.org/rss/cs.AI',
  'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  'https://www.technologyreview.com/feed/',
];

function slugify(s) {
  return s
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'fetch-ai-posts/1.0' } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

async function parseItemsFromXml(xml) {
  // try to use fast-xml-parser if available
  let XMLParser = null;
  try {
    const pkg = await import('fast-xml-parser');
    XMLParser = pkg.XMLParser || pkg.default?.XMLParser || pkg.default || pkg;
  } catch (e) {
    // module not available, will use fallback
  }

  if (XMLParser) {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
    const obj = parser.parse(xml);
  // try common rss/channel/item path
  const items = [];
  try {
    const channel = obj.rss?.channel || obj.feed || obj;
    let rawItems = channel?.item || channel?.entry || [];
    if (!Array.isArray(rawItems)) rawItems = [rawItems];
    for (const it of rawItems) {
      const title = (it.title && (typeof it.title === 'object' ? it.title['#text'] || it.title : it.title)) || '';
      const link = it.link && (typeof it.link === 'object' ? it.link.href || it.link['#text'] || it.link : it.link) || '';
      const description = (it.description && (typeof it.description === 'object' ? it.description['#text'] || it.description : it.description)) || it.summary || '';
      const pubDate = it.pubDate || it.published || it.updated || new Date().toISOString();
      items.push({ title: String(title).replace(/\n/g, ' ').trim(), link: String(link).trim(), description: String(description).trim(), pubDate });
    }
  } catch (e) {
    // fallback: empty
  }
    return items;
  }

  // Fallback simple parser: extract <item> or <entry> blocks via regex
  const items = [];
  try {
    const blocks = xml.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi) || [];
    for (const block of blocks) {
      const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const linkHrefMatch = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
      const linkInnerMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const descMatch = block.match(/<(?:description|summary)[^>]*>([\s\S]*?)<\/(?:description|summary)>/i);
      const pubMatch = block.match(/<(?:pubDate|published|updated)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i);

      const title = (titleMatch && titleMatch[1]) ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const link = (linkHrefMatch && linkHrefMatch[1]) ? linkHrefMatch[1].trim() : (linkInnerMatch && linkInnerMatch[1]) ? linkInnerMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const description = descMatch && descMatch[1] ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const pubDate = pubMatch && pubMatch[1] ? pubMatch[1].trim() : new Date().toISOString();

      items.push({ title: String(title).replace(/\n/g, ' ').trim(), link: String(link).trim(), description: String(description).trim(), pubDate });
    }
  } catch (e) {
    // fallback: empty
  }

  return items;
}

async function summarizeWithOpenAI(apiKey, text, link, title) {
  const prompt = `Please generate a short 3-4 sentence summary, 5 concise keywords, and a suggested short title for the article. Return a JSON object with keys: summary, keywords (array), suggested_title.`;

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that summarizes technical articles concisely.' },
      { role: 'user', content: `${prompt}\n\nArticle title: ${title}\nArticle link: ${link}\nArticle excerpt or description: ${text}` },
    ],
    max_tokens: 400,
    temperature: 0.2,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${t}`);
  }

  const data = await res.json();
  const txt = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';
  // try to extract JSON from text
  const jsonMatch = txt.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch (e) { /* fallthrough */ }
  }
  // fallback: simple heuristic
  return { summary: txt.slice(0, 300), keywords: [], suggested_title: title };
}

async function summarizeWithExternal(apiUrl, apiKey, text, link, title) {
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
      },
      body: JSON.stringify({ title, link, text }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`External summary API error: ${res.status} ${t}`);
    }

    const data = await res.json();
    // Expecting { summary, keywords, suggested_title }
    const summary = data.summary || data.text || data.result || '';
    const keywords = data.keywords || data.tags || [];
    const suggested_title = data.suggested_title || data.title || title;
    return { summary, keywords, suggested_title };
  } catch (e) {
    throw e;
  }
}

async function main() {
  try {
    const feeds = (process.env.RSS_FEEDS || DEFAULT_FEEDS.join(',')).split(',').map(s => s.trim()).filter(Boolean);

    // Parallel fetch all feeds
    const xmls = await Promise.all(feeds.map(f => fetchText(f).catch(err => { console.warn('feed fetch error', f, err.message); return null; })));
    const allItems = [];
    for (const xml of xmls) {
      if (!xml) continue;
      const items = await parseItemsFromXml(xml);
      if (items && items.length) {
        allItems.push(...items);
      }
    }

    if (allItems.length === 0) {
      console.log('No feed items found. Exiting.');
      return;
    }

    // dedupe against existing posts in content/auto
    const dir = 'content/auto';
    await fs.mkdir(dir, { recursive: true });
    const existingFiles = (await fs.readdir(dir)).filter(f => f.endsWith('.mdx'));
    const existingOriginals = new Set();
    for (const f of existingFiles) {
      try {
        const txt = await fs.readFile(`${dir}/${f}`, 'utf8');
        const m = txt.match(/original:\s*"([^"]+)"/i);
        if (m) existingOriginals.add(m[1]);
      } catch (e) { /* ignore */ }
    }

    // sort items by pubDate desc, try to add up to N new posts
    const N = Number(process.env.MAX_NEW_POSTS || 3);
    const uniq = [];
    const seenLinks = new Set();
    allItems.sort((a,b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    for (const it of allItems) {
      if (uniq.length >= N) break;
      if (!it.link && !it.title) continue;
      if (existingOriginals.has(it.link)) continue;
      if (seenLinks.has(it.link)) continue;
      seenLinks.add(it.link);
      uniq.push(it);
    }

    if (uniq.length === 0) {
      console.log('No new items to add.');
      return;
    }

    for (const item of uniq) {
      const date = new Date(item.pubDate).toISOString().slice(0,10);
      const slug = slugify(item.title || item.link || date);
      let summary = item.description || '';
      let keywords = [];
      let suggested_title = item.title;

      // Prefer external summary service (e.g., DeepSeek) if configured
      const summaryApiUrl = process.env.SUMMARY_API_URL;
      const summaryApiKey = process.env.SUMMARY_API_KEY;
      if (summaryApiUrl) {
        try {
          const out = await summarizeWithExternal(summaryApiUrl, summaryApiKey, item.description, item.link, item.title);
          summary = out.summary || summary;
          keywords = out.keywords || keywords;
          suggested_title = out.suggested_title || suggested_title;
        } catch (e) {
          console.warn('External summary service failed:', e.message);
        }
      } else if (process.env.OPENAI_API_KEY) {
        try {
          const out = await summarizeWithOpenAI(process.env.OPENAI_API_KEY, item.description, item.link, item.title);
          summary = out.summary || summary;
          keywords = out.keywords || keywords;
          suggested_title = out.suggested_title || suggested_title;
        } catch (e) {
          console.warn('OpenAI summary failed:', e.message);
        }
      }

      const filename = `${dir}/${date}-${slug}.mdx`;
      const front = `---\ntitle: "${String(suggested_title).replace(/"/g, '\\"')}"\ndate: "${date}"\nexcerpt: "${String(summary || '').replace(/"/g, '\\"')}"\ncategory: "ai-news"\ntags: ${JSON.stringify(keywords)}\noriginal: "${item.link}"\ndraft: false\n---\n\n`;
      const body = `${front}来源： ${item.link}\n\n${summary}\n\n> 原文链接： ${item.link}\n`;
      await fs.writeFile(filename, body, 'utf8');
      console.log('Wrote', filename);
    }

    // commit & push if token provided via env (workflow will handle commit too)
    const canPush = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
    if (canPush) {
      try {
        execSync('git add --all', { stdio: 'inherit' });
        execSync(`git commit -m "chore: add auto ai posts" || true`, { stdio: 'inherit' });
        execSync('git push || true', { stdio: 'inherit' });
        console.log('Attempted to push changes.');
      } catch (e) {
        console.warn('Git commit/push failed:', e.message);
      }
    }
  } catch (err) {
    console.error('error', err);
    process.exit(1);
  }
}

main();
