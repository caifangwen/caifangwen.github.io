---
title: Drizzle ORM
slug: drizzle-orm
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 后端与数据
tags:
  - TypeScript
  - SQL
description: TypeScript ORM，用类型化代码组织数据库结构与查询。
linkUrl: 'https://github.com/drizzle-team/drizzle-orm'
linkSource: GitHub
---

Drizzle ORM 是面向 TypeScript 的数据库访问工具，用类型化结构表达表和查询，同时保留较强的 SQL 表达感。它适合希望在代码中维护数据库模型、减少字段拼写错误并管理结构变更的应用项目。

## 主要用途

- **描述数据库结构**：在代码中定义表、字段与相关约束，让应用和数据模型更一致。
- **编写类型化查询**：查询时获得类型提示，减少部分运行前难以发现的字段问题。
- **管理结构变更**：结合配套工具组织迁移流程，追踪数据库的演进。

## 使用场景

开发会员或客户管理系统时，可以先设计实体关系，再建立查询与迁移。类型检查不能替代数据库约束、事务和权限控制，生产变更仍需要检查实际 SQL。

## 相关工具

[Supabase](supabase.md) 提供 PostgreSQL 环境；[Next.js](nextjs.md) 可承载业务应用；[Docker Compose](docker-compose.md) 可用于本地数据库开发环境。

[查看 GitHub 仓库](https://github.com/drizzle-team/drizzle-orm)
