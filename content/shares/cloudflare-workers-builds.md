---
title: Cloudflare Workers Builds
slug: cloudflare-workers-builds
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - CI/CD
  - 自动发布
description: 连接 Git 仓库并构建部署 Workers，适合代码更新后的持续交付。
linkUrl: 'https://developers.cloudflare.com/workers/ci-cd/builds/'
linkSource: 官方文档
---

Workers Builds 是 Cloudflare Workers 的构建与部署集成，可以连接支持的 Git 仓库，在代码变化后执行构建与发布。它适合希望让应用代码、部署配置和线上版本保持对应关系的项目，减少手动执行发布命令。

## 主要用途

- **提交后自动构建**：配置项目目录和构建命令，把代码更新转换为发布任务。
- **管理部署配置**：结合项目配置维护变量、绑定和发布命令。
- **观察构建过程**：通过日志了解依赖安装、构建与部署是否成功。

## 使用场景

一个 Worker 接口项目可以在合并后触发构建，再发布到指定环境。数据库迁移、任务测试和环境区分仍要明确安排，构建成功不等于业务已经验证。

## 相关工具

[Workers](cloudflare-workers.md) 运行应用；[Wrangler](cloudflare-wrangler.md) 提供部署命令与配置；[GitHub Actions](github-actions.md) 适合需要更自定义流水线的项目。

[查看官方文档](https://developers.cloudflare.com/workers/ci-cd/builds/)
