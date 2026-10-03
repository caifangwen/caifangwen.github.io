---
title: Cloudflare Queues
slug: cloudflare-queues
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 无服务器与边缘计算
tags:
  - 消息队列
  - 异步任务
description: 通过消息队列衔接生产者与消费者，适合后台处理和削峰任务。
linkUrl: 'https://developers.cloudflare.com/queues/'
linkSource: 官方文档
---

Cloudflare Queues 用消息连接任务提交与后台处理，适合将不必立即完成的工作从用户请求中拆出来。网站可以先接收数据，再由消费者处理通知、文件整理或外部服务调用，让请求响应与后续任务有更清楚的分工。

## 主要用途

- **安排异步处理**：把耗时步骤放进队列，避免所有任务都在一次请求中完成。
- **缓冲任务量**：在接收和消费之间建立缓冲，按配置处理消息。
- **处理失败任务**：通过支持的重试与死信机制保存后续排查线索。

## 使用场景

上传文件后可以先记录任务，再发送消息给后台处理程序。消息可能重复交付，消费者需要按任务标识实现幂等，不能假设每条消息只执行一次。

## 相关工具

[Workers](cloudflare-workers.md) 提交与消费消息；[R2](cloudflare-r2.md) 保存文件；[D1](cloudflare-d1.md) 记录任务状态；[Workflows](cloudflare-workflows.md) 适合更明确的多步骤持久执行。

[查看官方文档](https://developers.cloudflare.com/queues/)
