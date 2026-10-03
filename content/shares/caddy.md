---
title: Caddy
slug: caddy
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - HTTPS
  - 反向代理
description: 支持自动 HTTPS 的 Web 服务器，可用于站点托管和反向代理。
linkUrl: 'https://github.com/caddyserver/caddy'
linkSource: GitHub
---

Caddy 是支持自动 HTTPS 的 Web 服务器，也可用作静态文件服务器和反向代理。它适合为自托管网站或内部服务建立统一访问入口，用较简洁的配置连接域名、证书和后端服务。

## 主要用途

- **提供静态网站**：把构建后的页面与资源通过 HTTP 服务发布。
- **反向代理应用**：将外部请求转发到后端程序，统一域名入口。
- **管理 HTTPS**：在满足域名解析与验证条件时自动获取和更新证书。

## 使用场景

个人服务器可以让 Caddy 对外提供域名入口，再代理到不同应用。部署前需要确认 DNS、端口和证书验证条件，并检查后台服务是否只暴露必要访问范围。

## 相关工具

[Docker Compose](docker-compose.md) 用于组织后端容器；[FastAPI](fastapi.md) 可作为被代理的接口服务；[Hugo](hugo-static-site-generator.md) 可生成适合静态托管的站点文件。

[查看 GitHub 仓库](https://github.com/caddyserver/caddy)
