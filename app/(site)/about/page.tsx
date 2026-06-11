'use client';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { PROFILE } from '@/config/profile';

// 打字机 hook：时间驱动，固定速度逐字输出，与网络/数据来源无关
// indexRef 用 ref 而不是 state，避免每次 tick 都触发 re-render
function useTypewriter(text: string, speed = 50) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(-1);

  useEffect(() => {
    // 用 ref 标记"当前轮次"，text 变化时 index 归零由 setInterval 第一次 tick 处理
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

  return displayed;
}

export default function AboutPage() {
  const bio = useTypewriter(PROFILE.bio);
  const isDone = bio.length === PROFILE.bio.length;

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* 个人信息卡片 */}
        <div className="pui-glass-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <Image
              src="/logo.png"
              alt="法舟记"
              width={80}
              height={80}
              className="w-16 h-16 p-2"
            />
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white mb-2">{PROFILE.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {PROFILE.location && <span>📍 {PROFILE.location}</span>}
                {PROFILE.email && (
                  <a href={`mailto:${PROFILE.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">✉️ {PROFILE.email}</a>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {PROFILE.tags.map((tag) => (
              <span key={tag.label} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors">
                {tag.label}
              </span>
            ))}
          </div>
          {/* 打字机自我介绍 */}
          <p className="text-gray-700 dark:text-gray-300 mt-4 min-h-[3rem]">
            {bio}
            <span
              className={`inline-block w-0.5 h-4 bg-gray-500 ml-0.5 align-middle transition-opacity ${
                isDone ? 'opacity-0' : 'animate-pulse'
              }`}
            />
          </p>
        </div>


        {/* 职业技能 */}
        <div className="pui-glass-card p-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-2">
            <span>🛠️</span>
            <span>职业技能</span>
           </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300 border-l-2 border-black/20 dark:border-white/20 pl-4">
            {PROFILE.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 font-mono tracking-wider text-right">
            ALL IN AI .<span className="text-gray-300 dark:text-gray-600"> </span>
            <span className="text-gray-300 dark:text-gray-600">_______</span>
            <span className="text-gray-500 dark:text-gray-400"> @attychen</span>
          </p>
        </div>
      </div>
    </div>
  );
}
