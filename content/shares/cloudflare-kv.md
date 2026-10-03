---
title: Cloudflare Workers KV
slug: cloudflare-kv
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 无服务器与边缘计算
tags:
  - 键值存储
  - 配置数据
description: 为 Workers 提供分布式键值存储，适合读取频繁、更新较少的配置与内容。
linkUrl: 'https://developers.cloudflare.com/kv/'
linkSource: 官方文档
---

Workers KV 是面向键值读写的存储服务，适合需要大量读取、但更新频率相对较低的数据。应用可以通过一个键读取相应值，用于配置、重定向表和可容忍更新传播延迟的内容，而不必为每次读取执行关系型查询。

## 主要用途

- **保存应用配置**：维护功能参数、公开设置和其他小型数据。
- **读取内容映射**：通过键查找页面信息、路由或重定向目标。
- **保存可延迟传播的数据**：在合适一致性要求下维护读取为主的资料。

## 使用场景

网站可以把旧新网址映射放进 KV，由 Workers 查表后返回跳转。KV 是最终一致性存储，更新不保证立即在所有读取位置可见，余额、库存和强一致协调需要其他设计。

## 相关工具

[Workers](cloudflare-workers.md) 读取配置；[D1](cloudflare-d1.md) 提供结构化查询；[Durable Objects](cloudflare-durable-objects.md) 面向有状态协调；[Wrangler](cloudflare-wrangler.md) 管理相关资源。

[阅读一致性说明](https://developers.cloudflare.com/kv/concepts/how-kv-works/)

[查看官方文档](https://developers.cloudflare.com/kv/)
