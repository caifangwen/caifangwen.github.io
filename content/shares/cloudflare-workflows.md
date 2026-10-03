---
title: Cloudflare Workflows
slug: cloudflare-workflows
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 无服务器与边缘计算
tags:
  - 工作流
  - 持久执行
description: 组织可持续执行、重试与等待的多步骤任务，适合跨服务后台流程。
linkUrl: 'https://developers.cloudflare.com/workflows/'
linkSource: 官方文档
---

Cloudflare Workflows 用来组织需要持续执行的多步骤任务，支持围绕步骤安排状态、重试与等待。它适合将多个外部服务调用组成明确过程，减少某一步失败后必须从头重跑整段脚本的问题。

## 主要用途

- **拆分业务步骤**：将获取资料、处理内容和保存结果组织为可观察的阶段。
- **安排等待与重试**：让流程按支持方式等待事件或处理失败。
- **维护执行过程**：记录工作流实例与阶段状态，便于排查和继续执行。

## 使用场景

资料处理流程可以先读取 R2 文件，再调用分析服务，最后保存结果并发送通知。可重试步骤仍应考虑副作用，避免重试时重复发送消息或重复写入业务结果。

## 相关工具

[Queues](cloudflare-queues.md) 适合消息驱动处理；[Workers](cloudflare-workers.md) 提供接口；[R2](cloudflare-r2.md) 保存文件；[n8n](n8n.md) 可对比可视化业务自动化的工作方式。

[查看官方文档](https://developers.cloudflare.com/workflows/)
