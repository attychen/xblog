'use client';
import { usePathname } from "next/navigation";
import ScrollAwareNavbar from "@/components/layout/ScrollAwareNavbar";

const PAGE_TITLES: Record<string, string> = {
  "/blog": "AI动态",
  "/skill": "Skill榜单",
  "/models": "大模型榜",
  "/about": "关于我",
};

export default function MobilePageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "";
  const isHome = pathname === "/" || pathname === "/blog";

  return (
    <>
      <ScrollAwareNavbar title={title} showLogo={isHome} />
      <div className="pt-14 md:pt-0">
        {children}
      </div>
    </>
  );
}