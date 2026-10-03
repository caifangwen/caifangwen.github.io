---
title: LangGraph
slug: langgraph
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - AI 与自动化
tags:
  - AI
  - 智能体
description: 用图结构编排有状态的智能体流程，适合需要持久化执行和人工介入的 AI 应用。
linkUrl: 'https://github.com/langchain-ai/langgraph'
linkSource: GitHub
---

LangGraph 是通过代码构建有状态智能体流程的框架。它把执行步骤和状态转换组织成图，适合处理需要多轮工具调用、暂停恢复、人工复核或较长执行时间的任务。开发者可以明确控制流程在什么条件下继续、回退或结束。

## 主要用途

- **管理流程状态**：记录任务进度和中间结果，避免复杂逻辑全部堆在一次模型调用中。
- **人工介入**：在关键节点暂停，让人确认信息或修正结果后继续执行。
- **编排多步骤任务**：将检索、分析、工具执行和检查拆开，便于调试与观察。

## 使用场景

例如构建报价辅助流程：先解析客户需求，再查询产品资料，生成草稿，最后交给销售审核。LangGraph 提供编排能力，具体模型、业务工具和审批规则仍需要自行实现。

## 相关工具

[Langflow](langflow.md) 更适合可视化探索；[Dify](dify.md) 提供应用平台；[FastAPI](fastapi.md) 可用于将自定义智能体流程封装成服务接口。

[查看 GitHub 仓库](https://github.com/langchain-ai/langgraph)
