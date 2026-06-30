<div align="center">
  <h1>🧩 法舟记</h1>
  <p><strong>AI 大模型 · 智能体 · 前沿技术</strong></p>
  <p>
    <a href="https://fazhouji.vercel.app">🔗 在线预览</a> · 
    <a href="https://blog.chatgpt.us.kg/">🔗 备用地址</a>
  </p>
</div>

---

## 关于

法舟记是一个专注于 AI 大模型、智能体与前沿技术的个人博客。文章由 AI 辅助生成初稿，人工审核后发布，确保内容质量。

## 技术栈

| 分类 | 技术 |
|------|------|
| **框架** | Next.js 16 (App Router, Server Components, ISR) |
| **UI** | React 19, TailwindCSS v4, Framer Motion |
| **内容** | MDX, Shiki 代码高亮, Remark GFM |
| **搜索** | Fuse.js 模糊搜索 |
| **开发** | TypeScript, Turbopack, Husky, ESLint |

## 设计特色

- **Liquid Glass 毛玻璃 UI** — 融合 glass-ui-react 设计语言，卡片/导航/页脚均采用 `backdrop-blur` + 渐变边框效果
- **暗夜高端感** — 深色主题下采用 `rgba(255,255,255,0.06)` 玻璃背景 + 内阴影高光
- **中英文字体** — Instrument Serif + Noto Serif SC (标题)，Barlow + Noto Sans SC (正文)
- **移动端适配** — Instagram 风格列表布局 + 微信公众号文章阅读体验
- **底部导航栏** — 移动端固定底部 Tab 栏，spring 弹性动画指示条
- **滚动标题栏** — 移动端下滑时标题果冻弹性飞入顶栏
- **页面过渡动画** — Framer Motion 0.3s 淡入上移

## 页面结构

```
app/
├── (site)/
│   ├── blog/          # AI 动态 (每日自动更新)
│   ├── skill/         # GitHub 技能榜 (每日热门开源项目)
│   ├── models/        # 大模型榜 (HuggingFace 下载量排名)
│   └── about/         # 关于我 + 微信社群入口
├── api/               # API 路由
├── layout.tsx         # 根布局 (Liquid Glass UI)
└── page.tsx           # 首页
```

## 快速开始

```bash
# 克隆项目
git clone https://github.com/attychen/xblog.git
cd xblog

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 生产构建
pnpm build

# 新建文章 (交互式 CLI)
npm run new-post
```

## 环境变量

```env
# 可选：GitHub Token (提高 API 限额)
GITHUB_TOKEN=your_token_here
```

## 许可证

MIT

---

## 联系方式

如果你对 AI 技术感兴趣，欢迎添加微信交流讨论：

**微信：attychen**

添加时备注 `AI博客`，可拉你进群，第一时间掌握 AI 行业动态，共同学习进步。

---

<div align="center">
  <p>以代码为舟，渡技术之海</p>
</div>