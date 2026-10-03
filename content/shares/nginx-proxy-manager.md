---
title: Nginx Proxy Manager
slug: nginx-proxy-manager
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - 反向代理
  - 可视化管理
description: 通过可视化界面管理代理主机和 HTTPS，适合多服务域名入口维护。
linkUrl: 'https://nginxproxymanager.com/'
linkSource: 官网
---

Nginx Proxy Manager 为反向代理提供可视化管理界面，适合将多个内部 Web 服务映射到不同域名。它让站长集中维护后端地址、HTTPS 和访问设置，减少每次手动编辑 Nginx 配置的操作。

## 主要用途

- **管理代理主机**：为域名选择后端地址与端口，建立服务访问入口。
- **配置证书**：按支持方式获取与维护 HTTPS 证书。
- **维护访问规则**：通过相应设置控制服务入口与基础访问条件。

## 使用场景

个人服务器可以为知识库、自动化工具和网站分别配置子域名，再由代理转发。它负责流量入口，不负责应用构建、数据库管理或完整发布流程。

## 相关工具

[Caddy](caddy.md) 可对比配置文件工作方式；[Traefik](traefik.md) 适合动态容器路由研究；[Docker Compose](docker-compose.md) 管理服务；[Cloudflare](cloudflare.md) 提供域名与边缘服务。

[查看官方网站](https://nginxproxymanager.com/)
