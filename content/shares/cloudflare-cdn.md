---
title: Cloudflare CDN 与缓存
slug: cloudflare-cdn
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - CDN 与云存储
tags:
  - CDN
  - 缓存策略
description: 在代理流量和相应配置下缓存内容，适合静态资源分发与源站减负。
linkUrl: 'https://developers.cloudflare.com/cache/'
linkSource: 官方文档
---

Cloudflare CDN 通过边缘缓存提供内容分发，适合网站静态资源与可缓存页面的访问优化。访问先到 Cloudflare，在缓存命中时可直接返回内容；没有命中或不应缓存的请求，则根据配置访问源站。

## 主要用途

- **缓存静态资源**：分发图片、脚本和样式，减少重复回源请求。
- **配置页面规则**：按路径、响应头和业务需要控制缓存行为。
- **管理缓存更新**：使用版本化文件名或清理机制，让内容更新与旧缓存协调。

## 使用场景

企业官网可以先缓存静态资源，再根据页面性质评估 HTML 缓存。登录、购物车和个人数据需要明确处理边界；域名接入代理不代表所有内容自动缓存，实际效果也取决于访客网络与命中率。

## 相关工具

[1Panel](1panel.md) 管理源站；[R2](cloudflare-r2.md) 保存公开资源；[Bunny CDN](bunny-cdn.md) 可作为分发服务的对比；[PageSpeed Insights](pagespeed-insights.md) 检查页面表现。

[查看官方文档](https://developers.cloudflare.com/cache/)
