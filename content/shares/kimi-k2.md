---
title: Kimi K2
slug: kimi-k2
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - AI 模型
tags:
  - 大语言模型
  - 智能体
description: Moonshot AI 的混合专家模型系列，适合代码、工具调用和任务执行研究。
linkUrl: 'https://github.com/MoonshotAI/Kimi-K2'
linkSource: GitHub
---

Kimi K2 是 Moonshot AI 发布的语言模型系列，采用混合专家架构，并关注代码与智能体任务。它适合研究模型如何理解任务、调用工具和根据执行结果继续工作，也可以作为开放权重模型的部署与效果比较对象。

## 主要用途

- **代码与开发辅助**：围绕程序分析、代码生成和相关工具任务进行试验。
- **智能体流程**：结合明确工具和反馈机制，测试多步骤任务执行。
- **模型版本比较**：按具体检查点与接口说明评估能力、延迟和资源需求。

## 使用场景

团队可以设计“检索资料—整理信息—输出报告”的原型，观察模型如何选择工具与处理缺失信息。完整模型的部署资源需求较高，选型时应区分模型权重与托管 API。

## 相关工具

[GLM-4.5](glm-4-5.md) 可对比智能体任务；[LangGraph](langgraph.md) 提供编排能力；[MCP](model-context-protocol.md) 用于理解外部工具接入方式。

[查看官方 GitHub 仓库](https://github.com/MoonshotAI/Kimi-K2)
