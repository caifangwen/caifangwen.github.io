---
title: uv
slug: uv
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 新技术与开发工具
tags:
  - Python
  - 包管理
description: 用 Rust 编写的 Python 包与项目管理工具，适合管理依赖、虚拟环境和 Python 版本。
linkUrl: 'https://github.com/astral-sh/uv'
linkSource: GitHub
---

uv 是用 Rust 编写的 Python 包与项目管理工具，覆盖依赖、虚拟环境和 Python 版本等常见需求。它适合统一 Python 项目的安装与执行方式，尤其适合同时维护多个脚本、接口服务和 AI 工具的开发者。

## 主要用途

- **管理项目依赖**：在项目中添加包并维护锁定信息，让环境更容易复现。
- **管理运行环境**：组织 Python 版本和虚拟环境，减少不同项目相互影响。
- **执行工具与脚本**：通过统一命令运行项目任务或使用 Python 工具。

## 使用场景

团队可以把数据清洗脚本与接口服务分别组织成项目，再按锁定依赖重建环境。部署前应确认操作系统、Python 版本和需要编译的依赖是否匹配。

## 相关工具

[FastAPI](fastapi.md) 用于 Python 接口服务；[Browser Use](browser-use.md) 可在 Python 项目中调用；[DuckDB](duckdb.md) 可用于脚本中的本地 SQL 分析。

[查看 GitHub 仓库](https://github.com/astral-sh/uv)
