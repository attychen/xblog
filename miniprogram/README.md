# 法舟记 微信小程序

## 项目简介

法舟记博客的微信小程序版本，UI 风格与移动端保持一致（暗夜毛玻璃效果）。

## 技术栈

- 微信小程序原生框架
- WXML / WXSS / JavaScript
- Liquid Glass UI 效果

## 页面结构

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | pages/blog/blog | 博客文章列表 |
| 模型榜 | pages/models/models | HuggingFace 大模型排名 |
| 关于我 | pages/about/about | 个人介绍 + 微信社群 |
| 文章详情 | pages/article/article | 文章阅读页 |

## 使用方法

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入 `miniprogram` 文件夹
3. 在 `project.config.json` 中替换 `appid` 为你的小程序 AppID
4. 点击编译即可预览

## 数据源

- 博客文章: 从网站 API 获取
- 大模型榜: HuggingFace API
- 图标: SVG 格式，需转换为 PNG

## 待完成

- [ ] 替换 SVG 图标为 PNG 格式
- [ ] 配置实际 API 地址
- [ ] 添加文章详情页数据加载
- [ ] 添加下拉刷新功能
- [ ] 添加分享功能