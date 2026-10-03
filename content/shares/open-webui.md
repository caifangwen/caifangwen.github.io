---
title: Open WebUI
slug: open-webui
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - AI 与自动化
tags:
  - AI
  - 本地部署
description: 为 Ollama 等模型服务提供聊天界面，适合搭建自托管的 AI 使用入口。
linkUrl: 'https://github.com/open-webui/open-webui'
linkSource: GitHub
---

Open WebUI 为模型服务提供可自托管的 Web 聊天界面，支持连接 Ollama 和兼容接口。它适合把原本需要命令行或接口调用的模型变成更易使用的浏览器入口，让团队集中进行对话、模型比较和资料问答。

## 主要用途

- **统一聊天入口**：在网页中使用已连接的模型，降低非开发人员的使用门槛。
- **比较模型表现**：围绕相同问题试用不同模型，观察回答质量、速度和表达方式。
- **资料问答探索**：使用文档与检索相关能力，为内部内容建立交互入口。

## 使用场景

小团队可以在服务器部署界面，再连接自己的模型服务。正式使用前应确认模型端点、用户权限和文档处理配置，避免把测试环境直接当成可靠的生产知识库。

## 相关工具

[Ollama](ollama.md) 负责运行本地模型；[AnythingLLM](anythingllm.md) 是文档工作空间的另一种选择；[Docker Compose](docker-compose.md) 便于管理部署所需服务。

[查看 GitHub 仓库](https://github.com/open-webui/open-webui)
