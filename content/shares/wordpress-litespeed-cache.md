---
title: LiteSpeed Cache
slug: wordpress-litespeed-cache
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - WordPress 插件
tags:
  - WordPress
  - 性能优化
description: 提供缓存与页面优化功能，适合改善 WordPress 加载体验；服务器级缓存需要兼容的 LiteSpeed 环境。
linkUrl: 'https://wordpress.org/plugins/litespeed-cache/'
linkSource: WordPress.org
---

LiteSpeed Cache 集成页面缓存和多种前端优化功能，适合改善 WordPress 网站的加载体验。一般优化功能可用于不同 Web 服务器；专属服务器缓存功能需要 OpenLiteSpeed、LiteSpeed 产品、兼容主机或 QUIC.cloud 等支持环境。

## 主要用途

- **减少重复生成页面**：在兼容环境中缓存页面，降低重复请求带来的处理压力。
- **优化前端资源**：处理图片、样式和脚本加载，让页面传输与渲染更高效。
- **管理缓存规则**：配置排除项和清理行为，兼顾内容更新与页面性能。

## 使用场景

产品展示站可以先测量关键页面，再逐项开启优化并比较结果。电商站还需要检查购物车、结账和登录页面，避免缓存配置影响个性化内容。

## 相关工具

[PageSpeed Insights](pagespeed-insights.md) 用于定位加载问题；[Core Web Vitals](core-web-vitals.md) 帮助理解体验指标；[UpdraftPlus](wordpress-updraftplus.md) 可在调整前保存网站备份。

[查看 WordPress 插件](https://wordpress.org/plugins/litespeed-cache/)
