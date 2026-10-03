---
title: Cloudflare Durable Objects
slug: cloudflare-durable-objects
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 无服务器与边缘计算
tags:
  - 有状态服务
  - 实时协作
description: 为 Workers 应用提供有状态对象与协调能力，适合房间、连接和一致性任务。
linkUrl: 'https://developers.cloudflare.com/durable-objects/'
linkSource: 官方文档
---

Durable Objects 为 Cloudflare 应用提供有状态的执行与协调单元，将对应对象的逻辑和数据组织在一起。它适合需要让同一组请求围绕共同状态协作的场景，例如实时房间、连接管理和特定范围内的协调规则。

## 主要用途

- **组织共同状态**：让属于同一个对象的请求读取和修改相应状态。
- **管理实时连接**：在支持方案中处理房间或会话相关通信。
- **实现协调逻辑**：围绕对象设计计数、顺序与其他一致性需求。

## 使用场景

协作工具可以按房间标识创建对象，集中处理该房间的消息与状态。对象键的设计影响负载分布，不能把全部流量无差别放进一个对象。

## 相关工具

[Workers](cloudflare-workers.md) 路由请求；[KV](cloudflare-kv.md) 提供读取为主的配置；[D1](cloudflare-d1.md) 保存关系型业务记录；[Queues](cloudflare-queues.md) 衔接异步任务。

[查看官方文档](https://developers.cloudflare.com/durable-objects/)
