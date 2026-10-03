---
title: Model Context Protocol（MCP）
slug: model-context-protocol
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 新技术与开发工具
tags:
  - AI
  - MCP
description: 连接 AI 应用与外部工具、数据源的开放协议，适合了解智能体工具接入和上下文集成方式。
linkUrl: 'https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro'
linkSource: 官方文档
---

Model Context Protocol（MCP）是连接 AI 应用与外部工具、数据源的开放协议。它让应用通过统一的交互方式发现和调用能力，例如读取资料、查询业务数据或执行工具操作，适合研究智能体如何接入真实工作环境。

## 主要用途

- **统一工具接入方式**：减少每个 AI 应用都为同一数据源单独设计接入逻辑的重复工作。
- **提供业务上下文**：通过服务器暴露资源与工具，让模型应用获得任务所需信息。
- **扩展智能体能力**：将工具调用纳入工作过程，使应用能围绕结果继续执行。

## 使用场景

开发者可以为内部产品数据库设计只读查询工具，再由支持 MCP 的客户端调用。协议负责交互约定，权限、业务边界和返回数据质量仍需要实现者设计。

## 相关工具

[LangGraph](langgraph.md) 可组织带工具调用的状态流程；[Activepieces](activepieces.md) 可用于探索自动化与 MCP 的组合；[FastAPI](fastapi.md) 是开发业务接口时可参考的服务框架。

[查看官方文档](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro)
