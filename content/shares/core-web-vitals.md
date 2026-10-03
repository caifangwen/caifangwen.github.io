---
title: Core Web Vitals
slug: core-web-vitals
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 新技术与开发工具
tags:
  - 性能优化
  - 用户体验
description: 围绕加载、交互和布局稳定性的网页体验指标，适合指导页面性能优化。
linkUrl: 'https://web.dev/articles/vitals'
linkSource: 官方文档
---

Core Web Vitals 是衡量网页体验的一组核心指标，目前包括 LCP、INP 和 CLS，分别关注主要内容加载、交互响应和布局稳定性。它适合把“页面感觉慢”拆成更具体的问题，帮助开发与运营团队安排改进任务。

## 主要用途

- **检查内容加载**：通过 LCP 观察主要内容是否及时出现，关注首屏图片和渲染路径。
- **检查交互响应**：通过 INP 了解操作后界面是否及时反馈，定位繁重脚本与主线程负担。
- **检查布局稳定性**：通过 CLS 发现图片、字体或动态内容引起的意外位置变化。

## 使用场景

产品页可以先给图片预留尺寸，再减少不必要的第三方脚本，并检查实际用户体验变化。实验室测试帮助定位原因，真实用户数据更接近上线环境。

## 相关工具

[PageSpeed Insights](pagespeed-insights.md) 提供诊断与可用的用户数据；[Search Console](google-search-console.md) 可查看相关体验报告；[Astro](astro.md) 可用于按需加载交互组件的内容站。

[查看官方文档](https://web.dev/articles/vitals)
