---
title: Meilisearch
slug: meilisearch
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 后端与数据
tags:
  - 站内搜索
  - 搜索引擎
description: 为应用提供搜索、筛选与排序能力，适合产品目录和内容网站检索。
linkUrl: 'https://www.meilisearch.com/'
linkSource: 官网
---

Meilisearch 是为应用提供搜索能力的引擎，适合在网站中检索商品、文章或业务资料。它把内容放进索引，再通过接口提供查询与筛选，让站内搜索围绕自己的数据工作，而不必完全依赖数据库中的简单模糊匹配。

## 主要用途

- **建立站内检索**：为内容或产品数据创建索引，提供搜索入口。
- **组织筛选与排序**：根据业务字段配置过滤条件与结果排序。
- **改善搜索体验**：使用支持的匹配与容错能力，让用户更容易找到资料。

## 使用场景

产品目录可以先索引名称、型号、用途和分类，再设计结果页。搜索引擎不是数据来源本身，新增、更新与删除记录都需要同步到索引。

## 相关工具

[Strapi](strapi.md) 或 [Directus](directus.md) 可维护内容来源；[Astro](astro.md) 可提供搜索界面；[Qdrant](qdrant.md) 可对比以向量检索为重点的需求。

[查看官方网站](https://www.meilisearch.com/)
