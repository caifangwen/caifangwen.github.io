# Frida Home

基于 **Astro + Tailwind CSS 4** 的中文静态博客，从 Hugo 迁移。无需 Hugo 或前端 UI 框架。

## 本地运行

使用 Node.js 22.12+（推荐 Node.js 24 LTS）。

```sh
npm ci
npm run dev
```

开发地址：http://localhost:4321。Windows 也可以双击 `start_blog.bat`。

```sh
npm run check   # Astro / TypeScript 检查
npm test        # 内容迁移回归测试
npm run build  # 生成 dist/
npm run preview
```

## 目录

- `src/pages/`：页面、分页、分类、RSS、搜索索引和 sitemap。
- `src/layouts/`、`src/components/`：Astro 布局与组件。
- `src/lib/site.ts`：站点信息、导航及 URL 工具。
- `src/lib/content.ts`：读取、校验、去重与整理 Markdown。
- `src/lib/markdown.ts`：Markdown、Hugo linkcard/ref 兼容、公式、代码高亮。
- `src/styles/`、`src/scripts/`：Tailwind 样式与渐进式浏览器交互。
- `content/`：原有 Markdown 内容及附件，继续在此写作。
- `public/`：图片、字体和独立 HTML 报告，原样发布。
- `src/assets/icons/`：页面 SVG 图标。
- `dist/`：Astro 构建产物，不提交版本控制。

项目仅使用 Astro 构建。原模板、配置、脚手架、翻译文件、下载脚本和旧站构建产物已删除；配色和页面样式统一放在 `src/styles/`。历史文章与链接保留，介绍 Hugo 的正文和旧短代码解析不依赖 Hugo 程序。

## 写作与路由

在 `content/posts/` 新建 Markdown：

```md
---
title: 我的文章
date: 2026-09-22T12:00:00+08:00
slug: my-post
draft: false
description: 一段简短介绍
tags: [Astro]
categories: [技术]
---

## 正文
```

文章保留 `/blog/:slug/`，项目保留 `/project/:slug/`；列表仍为 `/posts/`、`/projects/`。分享、讨论和文档分别保留各自目录。旧站部分文章由标题生成 URL，已在 `src/data/legacy-urls.json` 固定保存；新文章没有 slug 时按文件名生成，建议显式填写 slug。分类、标签、系列会自动生成，列表每页 12 条。

同名 `.zh-cn.md` 优先于 `.md`，与原站默认中文保持一致。`draft: true` 不进入页面、索引或 RSS。无发布日期的内容使用固定日期，避免每次构建变动。附件由 `/media/` 输出，正文中的相对图片链接自动解析。

使用标准 Markdown 编写新内容。现有发布内容使用的 `linkcard`、`ref`、`relref`、`highlight` 短代码有迁移兼容；Hugo 教程中的代码示例保持为代码。Mermaid 使用 `mermaid` 代码块，数学公式使用 `$...$` 或 `$$...$$`。搜索索引只在搜索时加载。

迁移修复了两组重复 slug：`intp-advanced-development` 与 `nextjs-ecommerce-structure` 现在拥有独立地址，不再覆盖同名认知功能与 Next.js 结构指南。

浏览器回归测试：先运行 `npm run preview`，再运行 `npm run test:browser`，默认使用本机 Chrome。子路径部署测试可设置 `TEST_BASE=/page-old`，端口可通过 `TEST_URL` 指定。

当前站点为中文，原配置中的英语、法语空壳页面不再生成。评论沿用原 Giscus 仓库与 pathname 映射，需联网加载。

## 部署

推送到 `master` 后，`.github/workflows/astro.yaml` 检查、测试并部署 `dist/` 到 GitHub Pages 的 `/page-old/`。仓库 Pages 的来源应为 GitHub Actions。

独立域名默认使用 `https://www.261449.xyz` 和根路径，可通过环境变量覆盖：

```powershell
$env:SITE_URL = 'https://caifangwen.github.io'
$env:BASE_PATH = '/page-old'
npm run build
```

配置参考：[Astro](https://docs.astro.build/en/install-and-setup/)、[Tailwind CSS 的 Astro 集成](https://tailwindcss.com/docs/installation/framework-guides/astro)。
