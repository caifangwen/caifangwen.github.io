---
title: Uptime Kuma
slug: uptime-kuma
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - 监控
  - 自托管
description: 自托管服务可用性监控工具，适合网站、接口和网络服务的状态检查。
linkUrl: 'https://github.com/louislam/uptime-kuma'
linkSource: GitHub
---

Uptime Kuma 用于自托管的服务可用性监控，适合定期检查网站和接口是否正常响应。它提供监控面板、通知与状态页面等能力，让维护人员不必等到客户反馈后才发现网站已经无法访问。

## 主要用途

- **定期检查服务**：通过支持的检查方式观察网站或接口响应。
- **安排异常通知**：在状态变化时通过配置好的渠道提醒负责人。
- **展示服务状态**：为团队或用户提供合适的状态页面，说明服务可用情况。

## 使用场景

可以监控首页和关键接口，再设置合理检查间隔与通知规则。监控服务最好与被监控站点分开部署，否则同一机器故障可能让检查与通知一起失效。

## 相关工具

[Docker Compose](docker-compose.md) 管理部署环境；[Caddy](caddy.md) 提供站点入口；[Sentry](sentry.md) 补充应用内部错误信息。

[查看 GitHub 仓库](https://github.com/louislam/uptime-kuma)
