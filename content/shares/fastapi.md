---
title: FastAPI
slug: fastapi
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 后端与数据
tags:
  - Python
  - API
description: Python API 框架，适合构建接口服务和连接数据处理流程。
linkUrl: 'https://github.com/fastapi/fastapi'
linkSource: GitHub
---

FastAPI 是使用 Python 类型提示构建接口服务的框架，提供请求校验和自动生成接口文档等能力。它适合把脚本、数据处理和 AI 流程封装成可调用服务，让网站或其他系统通过明确的接口获取结果。

## 主要用途

- **开发业务 API**：定义输入、输出与处理逻辑，为前端提供稳定的数据入口。
- **封装 Python 能力**：把已有分析、检索或模型调用代码转成可重复请求的服务。
- **协作与调试**：利用自动生成的接口文档测试请求，并与前端约定数据结构。

## 使用场景

可以把询盘分类脚本封装为接口，由网站或工作流平台调用。耗时较长的处理需要考虑超时、任务队列和错误返回，不能只验证一个成功请求。

## 相关工具

[uv](uv.md) 管理项目环境；[LangGraph](langgraph.md) 编排 AI 处理流程；[Caddy](caddy.md) 可用于服务前面的反向代理与 HTTPS。

[查看 GitHub 仓库](https://github.com/fastapi/fastapi)
