'use client';
import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";

interface ScrollAwareNavbarProps {
  title?: string;
}

export default function ScrollAwareNavbar({ title }: ScrollAwareNavbarProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [showTitle, setShowTitle] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setShowTitle(y > 60 && !!title);
        if (y > lastY.current && y > 100) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        lastY.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [title]);

  // Use native DOM event instead of React onClick
  useEffect(() => {
    const btn = document.getElementById('mobile-theme-toggle');
    if (!btn) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setTheme(isDark ? "light" : "dark");
    };
    btn.addEventListener('click', handler);
    return () => btn.removeEventListener('click', handler);
  }, [isDark, setTheme]);

  return (
    <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 px-3 py-2 transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="liquid-glass rounded-2xl px-4 py-2.5 flex items-center justify-between">
        <span className="text-[15px] font-semibold text-black dark:text-white truncate">
          {showTitle ? title : '法舟记'}
        </span>
        <div id="mobile-theme-toggle" style={{ padding: '8px', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
          {isDark ? <SunIcon className="w-[18px] h-[18px] text-gray-500" /> : <MoonIcon className="w-[18px] h-[18px] text-gray-500" />}
        </div>
      </div>
    </nav>
  );
}