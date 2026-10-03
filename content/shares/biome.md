---
title: Biome
slug: biome
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 新技术与开发工具
tags:
  - 前端
  - 代码质量
description: 整合代码格式化和静态检查能力，适合统一 Web 项目的代码风格与基础质量检查。
linkUrl: 'https://github.com/biomejs/biome'
linkSource: GitHub
---

Biome 为 Web 项目提供代码格式化和静态检查工具，适合统一团队的代码习惯并发现部分常见问题。它可以通过命令行或编辑器集成使用，让开发者在提交之前处理格式和规则问题。

## 主要用途

- **统一代码格式**：减少缩进、引号和换行等风格差异，使改动更容易阅读。
- **执行静态检查**：根据启用的规则发现部分潜在错误或不合理写法。
- **融入开发流程**：在编辑器、提交检查或持续集成中执行统一规则。

## 使用场景

团队可以先确定格式约定，再逐步引入检查规则。已有项目迁移时应把大范围格式调整与功能修改分开，方便审查；同时核对当前版本对文件类型的支持。

## 相关工具

[Bun](bun.md) 提供运行、测试和打包能力；[Next.js](nextjs.md) 可用于完整 Web 应用；[shadcn/ui](shadcn-ui.md) 的组件代码也需要统一维护风格。

[查看 GitHub 仓库](https://github.com/biomejs/biome)
