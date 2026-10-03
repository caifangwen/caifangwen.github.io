---
title: Langflow
slug: langflow
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - AI 与自动化
tags:
  - AI
  - 工作流
description: 通过可视化组件构建 AI 应用与智能体，适合快速验证模型调用和工具编排流程。
linkUrl: 'https://github.com/langflow-ai/langflow'
linkSource: GitHub
---

Langflow 通过可视化组件组织模型、提示词、数据和工具调用，适合快速理解并验证 AI 应用的执行路径。与只写一段提示词相比，流程图更容易看清输入如何被处理、哪些步骤需要检索资料，以及最终结果由哪个节点输出。

## 主要用途

- **搭建 AI 原型**：把模型和提示词连接起来，测试聊天助手、摘要工具或信息抽取流程。
- **验证检索流程**：组合文档处理和知识检索组件，观察不同配置对回答质量的影响。
- **组织工具调用**：让智能体在模型推理之外使用外部能力，并逐步检查执行结果。

## 使用场景

适合开发者与业务人员一起设计产品资料助手：先确定输入和输出，再拆解检索、生成和格式整理步骤。流程跑通后，还需要验证异常输入和部署后的运行表现。

## 相关工具

[Dify](dify.md) 可用于组织 AI 应用与知识库；[LangGraph](langgraph.md) 更适合通过代码精细控制状态和执行路径；[n8n](n8n.md) 可连接业务系统。

[查看 GitHub 仓库](https://github.com/langflow-ai/langflow)
