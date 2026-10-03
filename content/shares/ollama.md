---
title: Ollama
slug: ollama
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - AI 与自动化
tags:
  - AI
  - 本地模型
description: 用于运行语言模型并提供调用接口，适合本地模型实验与应用接入。
linkUrl: 'https://github.com/ollama/ollama'
linkSource: GitHub
---

Ollama 用来在本地或自有服务器上运行支持的语言模型，并通过命令行和 API 提供模型调用入口。它适合学习模型部署、试验不同模型，以及为内部工具提供可控的推理环境。能运行多大的模型、响应有多快，会受到内存、显存和模型量化方式影响。

## 主要用途

- **本地模型试验**：下载和运行支持的模型，比较它们在问答、摘要或代码任务中的表现。
- **为应用提供接口**：让聊天界面或后端程序通过 API 调用模型，形成可重复使用的服务。
- **搭建资料助手**：配合知识库工具处理自己的文档，探索本地推理与检索结合的流程。

## 使用场景

可以先用少量产品资料和一组固定问题建立测试集，比较模型的回答准确性与速度，再决定是否投入更大硬件。本地部署之外，仍需留意配套工具是否调用外部服务。

## 相关工具

[Open WebUI](open-webui.md) 提供聊天界面；[AnythingLLM](anythingllm.md) 组织文档工作空间；[Dify](dify.md) 可在支持的配置下接入模型并编排应用。

[查看 GitHub 仓库](https://github.com/ollama/ollama)
