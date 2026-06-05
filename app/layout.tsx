import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/provider/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
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
    "法舟记 — 编程、区块链与折腾记录。记录技术学习、项目实践与独立开发的心得。",
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
      "编程、区块链与折腾记录。记录技术学习、项目实践与独立开发的心得。",
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
        {/* JSON-LD 结构化数据，帮助搜索引擎理解站点 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              name: "法舟记",
              description: "一个关于编程、AI、开源与独立思考的技术博客",
              url: "https://fazhouji.vercel.app",
              author: {
                "@type": "Person",
                name: "法舟记",
                url: "https://github.com/attychen",
              },
              inLanguage: "zh-CN",
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
          <main className="flex-1 pt-6">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
