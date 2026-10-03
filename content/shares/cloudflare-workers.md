---
title: Cloudflare Workers
slug: cloudflare-workers
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 无服务器与边缘计算
tags:
  - Serverless
  - 边缘计算
description: 在 Cloudflare 平台运行请求处理和应用代码，适合接口、静态资源与轻量业务服务。
linkUrl: 'https://developers.cloudflare.com/workers/'
linkSource: 官方文档
---

Cloudflare Workers 是用于运行应用代码的平台，可以处理 HTTP 请求、提供接口，也能结合静态资源构建网站。它适合不想自行维护传统应用服务器、但仍需要自定义逻辑的项目，例如表单接收、文件访问控制和 API 聚合。

## 主要用途

- **开发业务接口**：接收网站请求、校验输入并调用外部服务。
- **处理边缘请求**：按路径、请求头或业务规则执行转发和响应处理。
- **组合数据与资源**：通过绑定使用 R2、D1、KV 等服务，建立小型应用。

## 使用场景

产品资料站可以用 Workers 提供查询和下载接口，R2 保存文件，D1 保存资料记录，再通过自动构建发布代码。运行时、执行限制和框架适配需要核对，不能默认传统服务器程序都可直接迁移。

## 相关工具

[Wrangler](cloudflare-wrangler.md) 管理开发与部署；[R2](cloudflare-r2.md) 保存对象；[D1](cloudflare-d1.md) 保存关系数据；[Workers Builds](cloudflare-workers-builds.md) 连接代码更新与发布。

[查看官方文档](https://developers.cloudflare.com/workers/)
