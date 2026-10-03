---
title: Bunny CDN
slug: bunny-cdn
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - CDN 与云存储
tags:
  - CDN
  - 静态资源
description: 通过缓存与边缘分发提供网站资源访问，适合图片、文件与静态内容加速。
linkUrl: 'https://bunny.net/cdn/'
linkSource: 官网
---

Bunny CDN 是内容分发服务，适合将网站源站或支持的存储资源通过边缘节点提供访问。它可以用于图片、样式、脚本和下载文件，让资源分发有独立域名与缓存配置，也便于观察流量使用。

## 主要用途

- **分发静态资源**：通过合适的源站与缓存设置提供图片和文件。
- **维护缓存规则**：安排缓存时间、清理与相应边缘规则。
- **观察分发流量**：结合使用情况和目标地区评估实际效果与成本。

## 使用场景

内容站可以将资源放到支持的源站，再通过 CDN 域名引用。CDN 与持久存储承担不同任务，不能把缓存当作唯一文件副本；费用也需要结合地区和流量核算。

## 相关工具

[Cloudflare CDN](cloudflare-cdn.md) 可比较接入和缓存需求；[R2](cloudflare-r2.md) 是对象存储方案，组合时应核对访问方式；[PageSpeed Insights](pagespeed-insights.md) 检查页面体验。

[查看官方网站](https://bunny.net/cdn/)
