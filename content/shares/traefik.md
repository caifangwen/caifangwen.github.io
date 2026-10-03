---
title: Traefik Proxy
slug: traefik
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - 反向代理
  - 容器路由
description: 根据配置和服务发现组织请求路由，适合多容器应用的统一入口。
linkUrl: 'https://traefik.io/traefik'
linkSource: 官网
---

Traefik 是面向云原生环境的反向代理，可通过支持的服务发现和配置方式组织请求路由。它适合运行多个容器应用的环境，让不同域名和路径被转发到相应服务，而不必为每个应用单独维护入口程序。

## 主要用途

- **组织应用路由**：根据域名、路径与规则选择后端服务。
- **接入动态环境**：通过支持的提供者发现服务，配合容器标签等配置。
- **管理 HTTPS 与中间件**：按配置安排证书和请求处理行为。

## 使用场景

多个网站与接口可以共享一个代理入口，再按域名转发到各自容器。路由优先级、证书验证与后台暴露范围需要明确，标签配置也应与实际网络一致。

## 相关工具

[Docker Compose](docker-compose.md) 定义容器服务；[Dokploy](dokploy.md) 提供部署管理；[Caddy](caddy.md) 与 [Nginx Proxy Manager](nginx-proxy-manager.md) 可对比入口配置方式。

[查看官方网站](https://traefik.io/traefik)
