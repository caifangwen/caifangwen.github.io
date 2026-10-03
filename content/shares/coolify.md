---
title: Coolify
slug: coolify
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - 自托管
  - 应用部署
description: 在自有服务器上组织应用、数据库和发布流程，适合建立自托管部署平台。
linkUrl: 'https://coolify.io/docs/'
linkSource: 官方文档
---

Coolify 是自托管应用部署平台，适合把自己的服务器组织成集中发布环境。它围绕应用、数据库和服务管理，让开发者通过项目与部署配置维护网站，而不必每次从头准备容器和域名入口。

## 主要用途

- **部署代码应用**：在支持方式中连接代码或镜像，安排构建与运行。
- **管理配套服务**：把数据库与常用服务放进统一部署入口。
- **维护发布环境**：组织域名、变量和部署记录，减少零散服务器操作。

## 使用场景

团队可以将官网、内部工具和配套数据库放在自有服务器上管理。服务器容量、持久化数据与备份仍由团队负责，回退应用版本也不一定能回退数据库变化。

## 相关工具

[Dokploy](dokploy.md) 可对比部署方式；[1Panel](1panel.md) 更偏向服务器日常管理；[GitHub Actions](github-actions.md) 可组织前置检查；[Uptime Kuma](uptime-kuma.md) 观察服务状态。

[查看官方文档](https://coolify.io/docs/)
