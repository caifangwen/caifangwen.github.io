---
title: Sentry
slug: sentry
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - 错误追踪
  - 性能监控
description: 追踪应用错误与性能线索，适合定位用户实际遇到的问题。
linkUrl: 'https://github.com/getsentry/sentry'
linkSource: GitHub
---

Sentry 围绕应用错误和性能提供监控能力，适合开发者了解线上代码在哪些条件下出错。它通过支持的 SDK 收集异常与相关上下文，让维护工作从“有人说页面坏了”进一步缩小到具体版本和执行位置。

## 主要用途

- **记录运行异常**：集中查看前后端错误，减少仅靠手动查日志定位问题。
- **关联版本与环境**：判断错误是否与某次发布或特定环境有关。
- **寻找性能线索**：利用相应追踪能力发现耗时路径，安排进一步分析。

## 使用场景

应用可以先接入关键页面与接口，按版本标记发布，再关注新增错误。采集内容、采样和敏感字段应在接入时明确，避免错误记录过量或包含不必要数据。

## 相关工具

[Next.js](nextjs.md) 和 [FastAPI](fastapi.md) 可接入相应 SDK；[Uptime Kuma](uptime-kuma.md) 检查服务外部响应；[Playwright](playwright.md) 可在发布前检查关键操作。

[查看 GitHub 仓库](https://github.com/getsentry/sentry)
