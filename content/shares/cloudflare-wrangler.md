---
title: Wrangler
slug: cloudflare-wrangler
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - Cloudflare
  - 命令行
description: Cloudflare Workers 的开发与管理工具，适合本地调试、资源绑定和自动发布。
linkUrl: 'https://developers.cloudflare.com/workers/wrangler/'
linkSource: 官方文档
---

Wrangler 是 Cloudflare Workers 的命令行工具，用于开发、配置、部署和管理相关资源。它适合将原本在控制台操作的部分工作放进项目配置与命令，让本地开发和自动发布围绕同一套描述执行。

## 主要用途

- **本地开发与调试**：运行支持的开发环境，检查请求与服务绑定。
- **维护项目配置**：组织入口、变量和资源关联，便于版本管理。
- **发布应用与管理资源**：通过命令部署 Worker，并执行支持的数据库或存储操作。

## 使用场景

开发者可以先在本地验证接口，再通过流水线使用 Wrangler 发布。开发时绑定本地还是远程资源要明确，生产凭据应通过合适的秘密管理方式提供。

## 相关工具

[Workers](cloudflare-workers.md) 运行代码；[Workers Builds](cloudflare-workers-builds.md) 执行集成构建；[GitHub Actions](github-actions.md) 组织外部流水线；[D1](cloudflare-d1.md) 与 [R2](cloudflare-r2.md) 提供数据服务。

[查看官方文档](https://developers.cloudflare.com/workers/wrangler/)
