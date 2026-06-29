'use client';
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScrollAwareNavbarProps {
  title?: string;
}

export default function ScrollAwareNavbar({ title }: ScrollAwareNavbarProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [showTitle, setShowTitle] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setShowTitle(y > 80 && !!title);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [title]);

  return (
    <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-2xl saturate-200 border-b border-black/[0.06] dark:border-white/[0.08]'
        : 'bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl'
    }`}>
      <div className="px-4 h-12 flex items-center justify-between">
        <div className="flex items-center min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {showTitle ? (
              <motion.h1
                key="page-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="text-[17px] font-semibold text-black dark:text-white truncate tracking-tight"
              >
                {title}
              </motion.h1>
            ) : (
              <motion.span
                key="brand"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[17px] font-semibold bg-gradient-to-r from-black to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
              >
                法舟记
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button 
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-2 -mr-2 rounded-full active:scale-90 transition-transform duration-150"
          aria-label="切换主题">
          {isDark ? (
            <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </nav>
  );
}