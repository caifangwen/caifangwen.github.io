---
title: Cloudflare Pages
slug: cloudflare-pages
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - 静态托管
  - 自动部署
description: 提供网站构建、预览与发布能力，适合博客、文档和前端站点。
linkUrl: 'https://developers.cloudflare.com/pages/'
linkSource: 官方文档
---

Cloudflare Pages 提供网站托管与构建发布工作流，适合博客、文档、企业官网和前端项目。它可以连接支持的 Git 仓库，在提交后构建网站并发布，让内容和页面更新不必每次手动上传文件。

## 主要用途

- **托管静态网站**：发布构建后的 HTML、样式、脚本和其他资源。
- **连接 Git 发布**：通过构建命令和输出目录配置安排自动部署。
- **预览改动**：利用预览环境检查新页面和内容，再安排生产发布。

## 使用场景

Hugo 或 Astro 内容站可以将 Markdown 放进仓库，提交后触发构建。新项目也可以比较 Workers Static Assets 的路径，根据框架、动态能力和官方支持情况选择。

## 相关工具

[Hugo](hugo-static-site-generator.md) 与 [Astro](astro.md) 生成网站；[Workers](cloudflare-workers.md) 提供另一种静态与动态组合方式；[GitHub Actions](github-actions.md) 可组织外部构建流水线。

[查看官方文档](https://developers.cloudflare.com/pages/)
