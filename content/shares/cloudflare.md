---
title: Cloudflare
slug: cloudflare
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - CDN
  - DNS
description: 提供 DNS、内容分发与网站边缘服务，适合站点访问、缓存和防护配置。
linkUrl: 'https://www.cloudflare.com/'
linkSource: 官网
---

Cloudflare 提供 DNS、内容分发、网络防护和开发平台等服务。对于网站运营，它可以帮助团队集中管理域名解析与部分访问策略，让源站之外也有一层缓存和网络服务配置入口。

## 主要用途

- **管理域名解析**：维护域名指向与相关记录，连接网站和其他业务服务。
- **配置内容分发**：在支持的代理与缓存规则下提供静态资源和页面访问。
- **组织边缘规则**：按需要安排重定向、访问控制或其他支持的处理方式。

## 使用场景

企业官网可以先明确域名、源站和 HTTPS 配置，再逐步安排缓存。电商与登录页面应检查缓存边界，避免个性化内容被错误处理；不同功能需按套餐核对。

## 相关工具

[Caddy](caddy.md) 可用于源站服务入口；[Uptime Kuma](uptime-kuma.md) 观察站点响应；[PageSpeed Insights](pagespeed-insights.md) 检查实际页面性能。

[查看官方网站](https://www.cloudflare.com/)
