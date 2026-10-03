---
title: Docker Compose
slug: docker-compose
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - Docker
  - 容器
description: 通过配置定义多个容器服务，统一启动应用及其依赖。
linkUrl: 'https://github.com/docker/compose'
linkSource: GitHub
---

Docker Compose 用配置文件描述并运行多个容器服务，适合为网站、数据库和自动化工具建立可重复的运行环境。它把服务之间的连接、存储和启动方式集中管理，让开发或部署过程更容易说明和复现。

## 主要用途

- **组织多服务应用**：把应用、数据库和其他依赖放进统一配置。
- **管理网络与存储**：为容器设置连接方式和持久化数据位置。
- **复现运行环境**：在合适的机器上按相同配置启动服务，减少手动步骤差异。

## 使用场景

自托管自动化工具时，可将应用和数据库一起组织起来，再明确备份与升级流程。容器重建不应丢失业务数据，因此需要认真配置数据卷和外部副本。

## 相关工具

[n8n](n8n.md) 和 [Dify](dify.md) 都有自托管部署场景；[Caddy](caddy.md) 可为适合的部署结构提供网站入口与反向代理。

[查看 GitHub 仓库](https://github.com/docker/compose)
