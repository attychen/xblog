import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/provider/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import MobilePageShell from "@/components/layout/MobilePageShell";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PageTransition from "@/components/ui/PageTransition";
import Footer from "@/components/layout/Footer";
import ObservabilityClient from "@/components/ui/ObservabilityClient";
import localFont from "next/font/local";

// Bitcount Prop Single - 英文像素字体
const bitcountFont = localFont({
  src: './fonts/Bitcount_Prop_Single/BitcountPropSingle-VariableFont_CRSV,ELSH,ELXP,slnt,wght.ttf',
  variable: '--font-bitcount',
  display: 'swap',
  weight: '100 900', 
});

// JetBrains Mono - 本地等宽字体
const monoFont = localFont({
  src: './fonts/JetBrains_Mono/fonts/variable/JetBrainsMono[wght].ttf',
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: '100 900',
});
// Zen Maru Gothic - 日文中文字体（支持中文显示）
const zenMaruGothicFont = localFont({
  src: [
    {
      path: './fonts/Zen_Maru_Gothic/ZenMaruGothic-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Zen_Maru_Gothic/ZenMaruGothic-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Zen_Maru_Gothic/ZenMaruGothic-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Zen_Maru_Gothic/ZenMaruGothic-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Zen_Maru_Gothic/ZenMaruGothic-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-zenmaru',
  display: 'swap',
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff4e6" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0f00" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fazhouji.vercel.app"),
  title: {
    default: "法舟记 — 技术与思考的笔记",
    template: "%s | 法舟记",
  },
  description:
    "法舟记 — 汇聚AI前沿自留地。记录技术学习、项目实践与独立开发的心得。",
  keywords: [
    "技术博客", "编程", "区块链", "开源", "前端开发",
    "React", "Next.js", "TypeScript", "独立开发", "技术笔记",
    "法舟记", "代码实践", "Web3", "去中心化",
  ],
  authors: [{ name: "法舟记", url: "https://github.com/attychen" }],
  creator: "法舟记",
  publisher: "法舟记",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://fazhouji.vercel.app",
    siteName: "法舟记",
    title: "法舟记 — 技术与思考的笔记",
    description:
      "汇聚AI前沿自留地。记录技术学习、项目实践与独立开发的心得。",
    images: [
      {
        url: "/logo.JPG",
        width: 512,
        height: 512,
        alt: "法舟记 Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "法舟记",
    description: "技术与思考的笔记",
    images: ["/logo.JPG"],
  },
  icons: {
    icon: [{ url: "/logo.JPG", type: "image/jpg" }],
    shortcut: "/logo.JPG",
    apple: "/logo.JPG",
  },
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  verification: {
    // 后续可添加 Google Search Console / Bing Webmaster 验证码
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* JSON-LD 结构化数据 — 站点信息（SEO + GEO） */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Blog", "WebSite"],
              name: "法舟记",
              alternateName: "Fazhouji",
              description: "汇聚AI前沿自留地。记录大语言模型、AI Agent、开源模型的最新进展与深度思考。",
              url: "https://fazhouji.vercel.app",
              author: {
                "@type": "Person",
                name: "法舟记",
                url: "https://github.com/attychen",
              },
              inLanguage: "zh-CN",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://fazhouji.vercel.app/blog?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* BreadcrumbList 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "首页", item: "https://fazhouji.vercel.app" },
                { "@type": "ListItem", position: 2, name: "博客", item: "https://fazhouji.vercel.app/blog" },
                { "@type": "ListItem", position: 3, name: "大模型榜", item: "https://fazhouji.vercel.app/models" },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${bitcountFont.variable} ${zenMaruGothicFont.variable} ${monoFont.variable} bg-gradient-bg antialiased container-custom min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <ObservabilityClient />
          
          <Navbar />
          <MobilePageShell>
            <MobileBottomNav />
            <main className="flex-1 pt-14 md:pt-6 pb-20 md:pb-0">
              <PageTransition>{children}</PageTransition>
            </main>
          </MobilePageShell>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
