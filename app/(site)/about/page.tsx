'use client';
import Image from 'next/image';
import { useEffect, useState, useRef, useMemo } from 'react';
import { PROFILE } from '@/config/profile';

const AI_QUOTES = [
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "AI is the new electricity.", author: "Andrew Ng" },
  { text: "Machine intelligence is the last invention that humanity will ever need to make.", author: "Nick Bostrom" },
  { text: "The question of whether a computer can think is no more interesting than the question of whether a submarine can swim.", author: "Edsger Dijkstra" },
  { text: "AI will not replace humans, but humans who use AI will replace those who don't.", author: "Unknown" },
  { text: "We're building the future, one algorithm at a time.", author: "法舟记" },
  { text: "Stay hungry, stay foolish, stay curious.", author: "Steve Jobs" },
  { text: "The advance of technology is based on making it fit in so that you don't really even notice it.", author: "Bill Gates" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
];

const AI_FACTS = [
  "GPT-4 拥有超过 1.7 万亿参数",
  "全球 AI 市场预计 2030 年将达到 1.87 万亿美元",
  "AlphaGo 一天可以自我对弈数百万局",
  "Transformer 架构发表于 2017 年，彻底改变了 NLP",
  "开源模型 Llama 3 已经可以媲美闭源模型",
  "AI Agent 正在成为下一个技术风口",
  "RAG 技术让大模型能够引用最新信息",
  "多模态 AI 正在模糊视觉与语言的边界",
];

function useRandomIndex(length: number) {
  const [index] = useState(() => Math.floor(Math.random() * length));
  return index;
}

function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.15 + 0.05,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#7c3aed] dark:bg-[#a855f7]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(-30px) translateX(15px); }
        }
      `}</style>
    </div>
  );
}

function TypewriterText({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(-1);

  useEffect(() => {
    indexRef.current = -1;
    const timer = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current <= text.length) {
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  const isDone = displayed.length === text.length;

  return (
    <span>
      {displayed}
      <span className={`inline-block w-0.5 h-4 bg-[#7c3aed] dark:bg-[#a855f7] ml-0.5 align-middle transition-opacity ${isDone ? 'opacity-0' : 'animate-pulse'}`} />
    </span>
  );
}

export default function AboutPage() {
  const quoteIdx = useRandomIndex(AI_QUOTES.length);
  const factIdx = useRandomIndex(AI_FACTS.length);
  const quote = AI_QUOTES[quoteIdx];
  const fact = AI_FACTS[factIdx];

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(PROFILE.wechat);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-14 md:pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 space-y-8">

        {/* 个人信息卡片 */}
        <div className="relative pui-glass-card p-8 overflow-hidden">
          <FloatingParticles />
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="法舟记"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-2xl p-1 border-2 border-[#7c3aed]/20 dark:border-[#a855f7]/20"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white mb-1">{PROFILE.name}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                  {PROFILE.location && <span>📍 {PROFILE.location}</span>}
                  {PROFILE.email && (
                    <a href={`mailto:${PROFILE.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">✉️ {PROFILE.email}</a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-5">
              {PROFILE.tags.map((tag) => (
                <span key={tag.label} className="pui-badge bg-[#7c3aed]/10 text-[#7c3aed] dark:bg-[#7c3aed]/20 dark:text-[#c084fc]">
                  {tag.label}
                </span>
              ))}
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              <TypewriterText text={PROFILE.bio} />
            </p>
          </div>
        </div>

        {/* 每次刷新随机 AI 名言 */}
        <div className="pui-glass-card p-6 relative overflow-hidden">
          <div className="absolute top-3 right-4 text-6xl text-[#7c3aed]/10 dark:text-[#a855f7]/10 font-serif select-none">&ldquo;</div>
          <p className="text-lg text-gray-800 dark:text-gray-200 italic leading-relaxed relative z-10">
            {quote.text}
          </p>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-right">— {quote.author}</p>
        </div>

        {/* AI 冷知识 */}
        <div className="pui-glass-card p-6 flex items-start gap-4">
          <div className="text-3xl shrink-0 mt-1">💡</div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">今日 AI 冷知识</h3>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{fact}</p>
          </div>
        </div>

        {/* 关于本站 */}
        <div className="pui-glass-card p-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
            <span>🚀</span>
            <span>关于本站</span>
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              法舟记是一个专注于 <span className="font-semibold text-[#7c3aed] dark:text-[#a855f7]">AI 大模型、智能体与前沿技术</span> 的个人技术博客。
            </p>
            <p>
              这里记录着我对 AI 行业的观察、技术实践的心得，以及开源世界的精彩发现。每一篇文章都是我深度思考后的沉淀。
            </p>
            <p>
              博客使用 <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Next.js 16</span> +{' '}
              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">MDX</span> 构建，
              文章由 AI 辅助生成初稿，人工审核后发布，确保内容质量。
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {['Next.js', 'React 19', 'TypeScript', 'TailwindCSS', 'MDX', 'Vercel'].map((tech) => (
              <span key={tech} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-mono">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* 微信社群 CTA */}
        <div className="relative pui-glass-card p-8 overflow-hidden border-2 border-[#7c3aed]/20 dark:border-[#a855f7]/20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/5 via-transparent to-[#a855f7]/5" />
          <FloatingParticles />
          <div className="relative z-10 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-3">
              加入 AI 探索群
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto leading-relaxed">
              第一时间掌握 AI 行业动态，与志同道合的伙伴共同学习进步
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              群内分享：前沿论文解读 · 实用工具推荐 · 行业深度分析 · 技术交流答疑
            </p>

            <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0">
                微
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400">微信搜索添加</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">{PROFILE.wechat}</p>
              </div>
              <button
                onClick={handleCopy}
                className="ml-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 active:scale-95 cursor-pointer
                  bg-[#7c3aed] hover:bg-[#6d28d9] dark:bg-[#a855f7] dark:hover:bg-[#9333ea] text-white"
              >
                {copied ? '✓ 已复制' : '复制'}
              </button>
            </div>

            <p className="mt-5 text-xs text-gray-400 dark:text-gray-500">
              添加时备注 <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">AI博客</span> 优先通过
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}