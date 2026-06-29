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
      setShowTitle(y > 60 && !!title);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [title]);

  return (
    <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-2xl border-b border-black/[0.04] dark:border-white/[0.06]'
        : 'bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl'
    }`}>
      <div className="px-4 h-11 flex items-center justify-between">
        <div className="flex items-center min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {showTitle ? (
              <motion.span
                key="page-title"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="text-[15px] font-medium text-black dark:text-white truncate"
              >
                {title}
              </motion.span>
            ) : (
              <motion.span
                key="brand"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[15px] font-semibold text-black dark:text-white"
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
            <SunIcon className="w-[18px] h-[18px] text-gray-500" />
          ) : (
            <MoonIcon className="w-[18px] h-[18px] text-gray-500" />
          )}
        </button>
      </div>
    </nav>
  );
}