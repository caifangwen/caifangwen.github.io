---
title: 1Panel
slug: 1panel
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - 服务器面板
  - 自托管
description: 通过可视化界面管理 Linux 网站、容器、数据库与备份，适合自有服务器运维。
linkUrl: 'https://github.com/1Panel-dev/1Panel'
linkSource: GitHub
---

1Panel 是 Linux 服务器管理面板，将网站、容器、数据库、文件和备份等操作放进可视化界面。它适合拥有云服务器、希望集中维护 WordPress、业务应用和内部工具的个人或团队，减少日常维护时反复切换命令与配置文件。

## 主要用途

- **管理网站与域名**：配置站点、域名和证书，为多个网站建立统一维护入口。
- **安装与维护应用**：通过应用商店和容器管理能力运行支持的软件。
- **管理数据与备份**：查看数据库和文件，并按实际需求安排备份与恢复。

## 使用场景

一台服务器可以通过 1Panel 管理 WordPress、数据库和自动化工具，再由 Cloudflare 提供域名与缓存服务。它主要解决服务器管理；代码提交后的构建发布，需要另配流水线或应用部署方案。不同版本的功能应按当前说明核对。

## 相关工具

[Docker Compose](docker-compose.md) 描述多容器环境；[Cloudflare CDN](cloudflare-cdn.md) 提供缓存分发；[Coolify](coolify.md) 与 [Dokploy](dokploy.md) 可对比从代码到部署的工作方式。

[查看 GitHub 仓库](https://github.com/1Panel-dev/1Panel)
