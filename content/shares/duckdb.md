---
title: DuckDB
slug: duckdb
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 新技术与开发工具
tags:
  - SQL
  - 数据分析
description: 可嵌入进程的分析型 SQL 数据库，适合查询 CSV、Parquet 等数据并进行本地分析。
linkUrl: 'https://github.com/duckdb/duckdb'
linkSource: GitHub
---

DuckDB 是可嵌入进程的分析型 SQL 数据库，适合在本机或应用内直接查询文件和进行数据汇总。对于 CSV、Parquet 等导出数据，它可以帮助使用者先做分析，而不必一开始就搭建独立数据库服务。

## 主要用途

- **查询导出文件**：使用 SQL 对表格数据筛选、分组、关联和汇总。
- **构建分析脚本**：将重复的数据处理步骤写成查询，方便复用和检查。
- **验证数据质量**：查找重复记录、异常字段或口径不一致的问题。

## 使用场景

运营人员可以导出广告、询盘和订单数据，用日期或业务标识进行关联，检查哪些来源带来有效线索。关联前要先统一时区、字段和统计口径。

## 相关工具

[uv](uv.md) 可管理 Python 分析环境；[GA4](google-analytics.md) 是网站行为数据来源之一；[Data Studio](google-data-studio.md) 可在结果导入受支持数据源后制作可共享报表。

[查看 GitHub 仓库](https://github.com/duckdb/duckdb)
