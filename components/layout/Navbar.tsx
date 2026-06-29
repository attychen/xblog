'use client';
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "next-themes";

const NAV_LINKS = [
  { label: "AI动态", href: "/blog" },
  { label: "Skill榜单", href: "/skill" },
  { label: "大模型榜", href: "/models" },
  { label: "关于我", href: "/about" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/blog") return pathname === "/blog" || pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const isDark = resolvedTheme === "dark";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 
                    bg-white/70 dark:bg-[#0a0a0f]/70 backdrop-blur-xl saturate-180 
                    border-b border-[rgba(124,58,237,0.08)] dark:border-[rgba(168,85,247,0.08)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#c084fc] bg-clip-text text-transparent">
            法舟记
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link key={link.href} href={link.href}
                className="relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200">
                <span className={`relative z-10 transition-colors duration-200 ${
                  active ? "text-[#7c3aed] dark:text-[#a855f7]"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}>{link.label}</span>
                {active && (
                  <motion.div layoutId="nav-indicator"
                    className="absolute inset-0 bg-[rgba(124,58,237,0.08)] dark:bg-[rgba(168,85,247,0.1)] rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
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