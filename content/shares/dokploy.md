---
title: Dokploy
slug: dokploy
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - Docker
  - 自动部署
description: 通过管理界面部署应用与容器服务，适合自有服务器上的持续发布。
linkUrl: 'https://docs.dokploy.com/docs/core'
linkSource: 官方文档
---

Dokploy 是面向应用与容器的部署管理平台，适合在自己的服务器上安排构建、运行和服务入口。它提供应用、数据库以及 Docker Compose 等部署能力，让多个项目可以围绕统一配置持续维护。

## 主要用途

- **发布应用**：根据支持的构建和代码接入方式部署 Web 项目。
- **管理容器组合**：组织 Compose 服务，将应用与依赖放进可维护的配置。
- **维护运行设置**：安排环境变量、域名和其他服务参数。

## 使用场景

小团队可以用它部署产品网站与后台接口，代码更新后按配置触发发布。选择部署方案时应同时考虑构建资源、数据卷和故障恢复，而不是只比较界面是否方便。

## 相关工具

[Docker Compose](docker-compose.md) 描述服务组合；[Coolify](coolify.md) 是同类平台对比；[Traefik](traefik.md) 帮助理解容器服务入口；[Restic](restic.md) 保存需要恢复的数据。

[查看官方文档](https://docs.dokploy.com/docs/core)
