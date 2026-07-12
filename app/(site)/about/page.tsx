'use client';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { PROFILE } from '@/config/profile';

const QUOTES = [
  { text: "Stay hungry, stay foolish, stay curious.", author: "Steve Jobs" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
];

const FACTS = [
  "GPT-4 拥有超过 1.7 万亿参数，训练一次的成本超过 1 亿美元",
  "全球 AI 市场预计 2030 年将达到 1.87 万亿美元",
  "Transformer 论文《Attention Is All You Need》发表于 2017 年",
  "开源模型 Llama 3 在部分基准测试上已接近 GPT-4",
  "AlphaGo 一天可以自我对弈数百万局棋",
  "多模态 AI 正在模糊视觉与语言的边界",
  "RAG 技术让大模型能够引用最新信息，减少幻觉",
  "全球每天有超过 10 亿条 AI 生成的文本被产出",
];

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
  return (
    <span>
      {displayed}
      <span className={`inline-block w-[2px] h-4 bg-black dark:bg-white ml-0.5 align-middle ${displayed.length === text.length ? 'opacity-0' : 'animate-pulse'}`} />
    </span>
  );
}

export default function AboutPage() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [factIdx, setFactIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
    setFactIdx(Math.floor(Math.random() * FACTS.length));
  }, []);

  const quote = QUOTES[quoteIdx];
  const fact = FACTS[factIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(PROFILE.wechat);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-14 md:pt-20 pb-8">
      <div className="max-w-2xl mx-auto md:px-4 space-y-0">
        {/* Profile header */}
        <div className="px-4 py-6 md:p-8 md:pui-glass-card md:rounded-2xl md:mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Image src="/logo.png" alt="法舟记" width={64} height={64} className="w-16 h-16 rounded-full" />
            <div>
              <h1 className="text-xl font-bold text-black dark:text-white">{PROFILE.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                <TypewriterText text={PROFILE.bio} />
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {PROFILE.tags.map((tag) => (
              <span key={tag.label} className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400">{tag.label}</span>
            ))}
          </div>
        </div>

        {/* Quote - random each visit */}
        <div className="px-4 py-5 md:p-6 md:pui-glass-card md:rounded-2xl md:mb-6 border-b border-black/[0.04] dark:border-white/[0.06] md:border-0">
          <p className="text-[15px] text-gray-700 dark:text-gray-300 italic leading-relaxed">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">— {quote.author}</p>
        </div>

        {/* Fact - random each visit */}
        <div className="px-4 py-5 md:p-6 md:pui-glass-card md:rounded-2xl md:mb-6 border-b border-black/[0.04] dark:border-white/[0.06] md:border-0">
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">今日冷知识</p>
          <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">{fact}</p>
        </div>

        {/* About site - natural tone */}
        <div className="px-4 py-5 md:p-6 md:pui-glass-card md:rounded-2xl md:mb-6 border-b border-black/[0.04] dark:border-white/[0.06] md:border-0">
          <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
            这里记录我关注的技术方向——大模型、智能体、开源项目，还有一些动手实践的笔记。写下来是为了理清思路，也希望能帮到同样在探索的人。
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {['Next.js', 'React', 'TypeScript', 'Tailwind'].map((tech) => (
              <span key={tech} className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 font-mono">{tech}</span>
            ))}
          </div>
        </div>

        {/* WeChat CTA */}
        <div className="px-4 py-6 md:p-8 md:pui-glass-card md:rounded-2xl">
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">加入社群</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">微</div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-black dark:text-white font-mono truncate">{PROFILE.wechat}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">添加时备注 AI博客</p>
            </div>
            <button onClick={handleCopy} className="px-4 py-2 text-[13px] font-medium rounded-xl bg-black dark:bg-white text-white dark:text-black active:scale-95 transition-all">
              {copied ? '✓' : '复制'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}