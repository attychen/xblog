'use client';
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SunIcon, MoonIcon, MenuIcon, XIcon } from "lucide-react";
import { useTheme } from "next-themes";

const NAV_LINKS = [
  { label: "AI动态", href: "/blog" },
  { label: "Skill榜单", href: "/skill" },
  { label: "大模型榜", href: "/models" },
  { label: "关于我", href: "/about" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 
                      bg-white/70 dark:bg-[#0a0a0f]/70 backdrop-blur-2xl 
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
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(isDark ? "light" : "dark")}
              className="relative p-2.5 rounded-xl active:bg-[rgba(124,58,237,0.1)] dark:active:bg-[rgba(168,85,247,0.1)] transition-colors duration-150 cursor-pointer"
              aria-label="切换主题">
              {isDark ? <SunIcon className="w-5 h-5 text-gray-400" /> : <MoonIcon className="w-5 h-5 text-gray-500" />}
            </button>
            <button onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2.5 rounded-xl active:bg-[rgba(124,58,237,0.1)] dark:active:bg-[rgba(168,85,247,0.1)] transition-colors duration-150 cursor-pointer"
              aria-label="菜单">
              {open ? <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <MenuIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            </button>
          </div>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-[57px] left-4 right-4 z-40 md:hidden bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-2xl border border-[rgba(124,58,237,0.1)] dark:border-[rgba(168,85,247,0.1)] rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-3 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href, pathname);
                  return (
                    <motion.div key={link.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link href={link.href} onClick={() => setOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150 ${
                          active ? "bg-[rgba(124,58,237,0.08)] dark:bg-[rgba(168,85,247,0.1)] text-[#7c3aed] dark:text-[#a855f7]"
                            : "text-gray-600 dark:text-gray-400 active:bg-[rgba(124,58,237,0.04)] dark:active:bg-[rgba(168,85,247,0.04)]"
                        }`}>
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}