'use client';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { HeadingItem } from "@/lib/headings";

interface MobileArticleLayoutProps {
  headings: HeadingItem[];
  children: React.ReactNode;
}

export default function MobileArticleLayout({ headings, children }: MobileArticleLayoutProps) {
  const [tocOpen, setTocOpen] = useState(false);

  if (headings.length === 0) {
    return <div className="md:hidden">{children}</div>;
  }

  return (
    <div className="md:hidden">
      {/* Collapsible TOC - WeChat style */}
      <div className="mb-4 mx-4">
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                     bg-gray-50 dark:bg-gray-800/50 text-sm font-medium
                     text-gray-700 dark:text-gray-300 active:scale-[0.98] transition-all"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            文章目录
          </span>
          {tocOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        <AnimatePresence>
          {tocOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <nav className="mt-2 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <ul className="space-y-2">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        onClick={() => setTocOpen(false)}
                        className={`block text-sm transition-colors ${
                          h.level === 3 ? "pl-4 text-xs" : ""
                        } text-gray-600 dark:text-gray-400 active:text-[#7c3aed] dark:active:text-[#00d4ff]`}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Article content - WeChat style, no borders, max space */}
      <article className="px-4">
        {children}
      </article>
    </div>
  );
}