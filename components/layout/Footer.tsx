import Link from "next/link";

const FOOTER_LINKS = [
  { label: "博客文章", href: "/blog" },
  { label: "技能榜单", href: "/skill" },
  { label: "关于我", href: "/about" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200/60 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-2">
            <Link href="/" className="font-bitcount text-xl font-semibold text-gray-800 dark:text-gray-200">
              法舟记
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              技术与思考的笔记 · 记录编程、AI 与开源探索
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">导航</h4>
            <div className="flex flex-col gap-2">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact / Extra */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">链接</h4>
            <div className="flex flex-col gap-2">
              <a
                href="https://github.com/attychen/xblog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                GitHub 仓库
              </a>
              <a
                href="/blog"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                全部文章
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-800/60 text-center text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} 法舟记 · 保留所有权利 · 
          <span className="ml-1">以代码为舟，渡技术之海</span>
        </div>
      </div>
    </footer>
  );
}
