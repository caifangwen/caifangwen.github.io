---
title: Cloudflare D1
slug: cloudflare-d1
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 无服务器与边缘计算
tags:
  - SQL
  - 数据库
description: 提供基于 SQLite SQL 语义的托管数据库，适合 Workers 应用的结构化业务数据。
linkUrl: 'https://developers.cloudflare.com/d1/'
linkSource: 官方文档
---

Cloudflare D1 是托管的 SQL 数据库服务，采用 SQLite 的 SQL 语义，并可与 Workers 通过绑定配合。它适合保存结构化业务记录，例如产品资料、表单线索和内容索引，让边缘应用拥有可查询的数据层。

## 主要用途

- **保存业务记录**：用表与字段组织产品、线索和其他结构化信息。
- **执行查询与关联**：通过 SQL 筛选、更新或关联数据，支撑接口返回。
- **管理结构变更**：通过迁移维护表结构，让代码与数据库变化有明确过程。

## 使用场景

小型产品目录可以用 D1 保存名称和分类，R2 保存图片与 PDF，Workers 提供查询。选型时应评估数据库限制、数据规模和事务需求，不能简单把它当成传统数据库服务的无差别替代。

## 相关工具

[Workers](cloudflare-workers.md) 承担业务逻辑；[Drizzle ORM](drizzle-orm.md) 可在支持的适配中组织类型化查询；[R2](cloudflare-r2.md) 保存文件；[KV](cloudflare-kv.md) 面向另一类键值读取需求。

[查看官方文档](https://developers.cloudflare.com/d1/)
