'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
    <nav className="hidden md:block fixed top-0 left-0 right-0 z-50">
      <div className="liquid-glass border-b border-white/[0.08] dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-black dark:text-white">法舟记</span>
          </Link>
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href, pathname);
              return (
                <Link key={link.href} href={link.href} className="relative px-4 py-2 text-sm rounded-xl transition-all duration-200">
                  <span className={`relative z-10 transition-colors duration-200 ${active ? "text-black dark:text-white font-medium" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"}`}>{link.label}</span>
                  {active && <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-black/[0.06] dark:bg-white/[0.08] rounded-xl" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
                </Link>
              );
            })}
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className="ml-2 p-2 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all cursor-pointer" aria-label="切换主题">
              {isDark ? <SunIcon className="w-4 h-4 text-gray-400" /> : <MoonIcon className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}