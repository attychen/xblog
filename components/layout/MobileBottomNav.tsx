'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
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
      <div className="bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl saturate-180 border-t border-black/5 dark:border-white/8">
        <div className="flex items-center justify-around px-2 py-1">
          {TABS.map((tab) => {
            const active = isActive(tab.href, pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px] relative
                  ${active
                    ? "text-[#7c3aed] dark:text-[#00d4ff]"
                    : "text-gray-500 dark:text-gray-400 active:text-gray-700 dark:active:text-gray-300"
                  }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? "scale-110" : ""
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={`text-[10px] font-medium ${
                  active ? "font-semibold" : ""
                }`}>
                  {tab.label}
                </span>
                {active && (
                  <div className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-[#7c3aed] dark:bg-[#00d4ff]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
