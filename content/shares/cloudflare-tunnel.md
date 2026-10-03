---
title: Cloudflare Tunnel
slug: cloudflare-tunnel
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - 隧道
  - 服务入口
description: 通过源站主动建立连接接入 Cloudflare，适合为应用安排公网或受控访问入口。
linkUrl: 'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/'
linkSource: 官方文档
---

Cloudflare Tunnel 通过在源站运行连接器，主动建立到 Cloudflare 的连接，再将请求转发给本地服务。它适合让应用获得域名入口，减少传统方式中直接暴露源站入站端口的配置，也可结合访问控制服务安排内部工具访问。

## 主要用途

- **连接应用与域名**：将请求转发给指定本地地址或服务。
- **简化入口网络**：通过出站连接建立访问路径，适合部分没有直接入站条件的环境。
- **配合访问控制**：与相应身份和访问规则组合，限制内部应用的访问者。

## 使用场景

内部资料工具可以通过隧道接入域名，再由访问规则检查身份。Tunnel 本身不自动替应用实现登录权限，连接器稳定性和网络可达性也需要维护。

## 相关工具

[1Panel](1panel.md) 管理源站服务；[Docker Compose](docker-compose.md) 可运行连接器与应用；[Cloudflare](cloudflare.md) 提供域名和配套服务；[Uptime Kuma](uptime-kuma.md) 观察入口响应。

[查看官方文档](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)
