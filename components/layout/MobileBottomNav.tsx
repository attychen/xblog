'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Cpu, BarChart3, User } from "lucide-react";

const TABS = [
  { label: "首页", href: "/blog", icon: Home },
  { label: "技能", href: "/skill", icon: Cpu },
  { label: "模型", href: "/models", icon: BarChart3 },
  { label: "关于", href: "/about", icon: User },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/blog") return pathname === "/blog" || pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
      <div className="bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-2xl saturate-200 
                      border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          {TABS.map((tab) => {
            const active = isActive(tab.href, pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
              >
                <Icon
                  className={`w-6 h-6 transition-all duration-300 ${
                    active 
                      ? "text-black dark:text-white scale-110" 
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {active && (
                  <motion.div
                    layoutId="bottom-tab"
                    className="absolute -bottom-0.5 w-5 h-[3px] rounded-full bg-black dark:bg-white"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}