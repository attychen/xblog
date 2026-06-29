'use client';
import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScrollAwareNavbarProps {
  title?: string;
  showLogo?: boolean;
}

export default function ScrollAwareNavbar({ title, showLogo = false }: ScrollAwareNavbarProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [showTitle, setShowTitle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setShowTitle(y > 100 && !!title);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [title]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-xl saturate-180 border-b border-black/5 dark:border-white/8 shadow-sm'
        : 'bg-white/70 dark:bg-[#0a0a0f]/70 backdrop-blur-xl saturate-180'
    }`}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo or Back */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {showTitle ? (
              <motion.h1
                key="page-title"
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25,
                  mass: 0.8
                }}
                className="text-lg font-bold text-black dark:text-white truncate"
              >
                {title}
              </motion.h1>
            ) : (
              <motion.span
                key="brand"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-lg font-bold bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#c084fc] bg-clip-text text-transparent"
              >
                法舟记
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Theme toggle */}
        <button 
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-3 rounded-xl active:scale-95 transition-all duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="切换主题">
          {isDark ? <SunIcon className="w-5 h-5 text-gray-400" /> : <MoonIcon className="w-5 h-5 text-gray-500" />}
        </button>
      </div>
    </nav>
  );
}