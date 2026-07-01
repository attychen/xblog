'use client';
import { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronUp, List } from "lucide-react";
import type { HeadingItem } from "@/lib/headings";

export default function ReadingEnhancements({ headings }: { headings: HeadingItem[] }) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("");
  const [showTopButton, setShowTopButton] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const hasHeadings = headings.length > 0;
  const headingIds = useMemo(() => headings.map((h) => h.id), [headings]);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      setProgress(scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0);
      setShowTopButton(scrollTop > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Heading observer
  useEffect(() => {
    if (!headingIds.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.5, 1] }
    );
    headingIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [headingIds]);

  // Native TOC toggle
  useEffect(() => {
    const btn = document.getElementById('toc-btn');
    if (!btn) return;
    const handler = (e: Event) => { e.preventDefault(); setTocOpen(v => !v); };
    btn.addEventListener('click', handler);
    btn.addEventListener('touchend', handler as EventListener);
    return () => { btn.removeEventListener('click', handler); btn.removeEventListener('touchend', handler as EventListener); };
  }, []);

  // Native close TOC
  useEffect(() => {
    if (!tocOpen) return;
    const closeBtn = document.getElementById('toc-close');
    if (!closeBtn) return;
    const handler = (e: Event) => { e.preventDefault(); setTocOpen(false); };
    closeBtn.addEventListener('click', handler);
    closeBtn.addEventListener('touchend', handler as EventListener);
    return () => { closeBtn.removeEventListener('click', handler); closeBtn.removeEventListener('touchend', handler as EventListener); };
  }, [tocOpen]);

  // Native back to top
  const backToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    btn.addEventListener('click', backToTop);
    btn.addEventListener('touchend', backToTop as EventListener);
    return () => { btn.removeEventListener('click', backToTop); btn.removeEventListener('touchend', backToTop as EventListener); };
  }, [backToTop]);

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent">
        <div className="h-full bg-orange-400/80 dark:bg-orange-500/80 transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>

      {/* Mobile TOC */}
      {hasHeadings && (
        <div className="md:hidden">
          <div id="toc-btn" className="fixed bottom-20 right-4 z-40 w-11 h-11 rounded-full liquid-glass flex items-center justify-center cursor-pointer" aria-label="文章目录" style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
            <List className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>

          {tocOpen && (
            <div className="fixed inset-x-4 bottom-32 z-40 liquid-glass rounded-2xl p-4 max-h-[50vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">目录</span>
                <div id="toc-close" className="text-xs text-gray-400 cursor-pointer" style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', padding: '4px 8px' }}>关闭</div>
              </div>
              <nav>
                <ul className="space-y-1">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} onClick={() => setTocOpen(false)}
                        className={`block py-2 px-3 rounded-lg text-sm transition-colors ${activeId === h.id ? "bg-orange-100/50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" : "text-gray-600 dark:text-gray-400"} ${h.level === 3 ? "pl-6 text-[13px]" : ""}`}
                        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}
        </div>
      )}

      {/* Desktop TOC */}
      {hasHeadings ? (
        <aside className="hidden xl:block fixed right-6 top-28 z-40 w-56 liquid-glass rounded-2xl p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">目录</p>
          <nav className="max-h-[60vh] overflow-y-auto pr-1">
            <ul className="space-y-1.5">
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className={`block rounded-md px-2 py-1.5 text-sm transition ${activeId === h.id ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"} ${h.level === 3 ? "ml-3 text-[13px]" : ""}`}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      ) : null}

      {/* Back to top */}
      {showTopButton && (
        <div id="back-to-top" className="fixed right-5 bottom-20 md:bottom-5 z-50 w-11 h-11 rounded-full bg-black/80 dark:bg-white/80 text-white dark:text-black flex items-center justify-center cursor-pointer" aria-label="返回顶部" style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
          <ChevronUp size={18} />
        </div>
      )}
    </>
  );
}