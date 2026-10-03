---
title: Cloudflare R2
slug: cloudflare-r2
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - CDN 与云存储
tags:
  - 对象存储
  - S3 兼容
description: 提供 S3 兼容对象存储，适合图片、附件、下载文件和备份资料。
linkUrl: 'https://developers.cloudflare.com/r2/'
linkSource: 官方文档
---

Cloudflare R2 是对象存储服务，适合保存图片、PDF、下载包和备份文件。它提供 S3 兼容接口，也可通过 Workers 绑定访问。文件可以独立于网站程序存放，让应用部署与资源维护有更清楚的边界。

## 主要用途

- **保存网站资源**：将产品图片、说明书和附件放进存储桶，统一管理对象路径。
- **接入文件接口**：通过 SDK、兼容工具或 Workers 执行上传、读取与删除。
- **分发与备份**：公开资源可以结合自定义域名与缓存，私有资料则通过受控接口访问。

## 使用场景

可以用 R2 保存产品 PDF，公开资料通过自定义域名访问，需要权限的资料由 Workers 检查后返回。R2 免收直接出站流量费，但存储、操作与部分功能仍有费用；不能因此理解为整个方案免费。r2.dev 用于开发，正式分发应配置合适域名与缓存规则。

## 相关工具

[Workers](cloudflare-workers.md) 提供访问逻辑；[Cloudflare CDN](cloudflare-cdn.md) 负责缓存分发；[Rclone](rclone.md) 传输文件；[Restic](restic.md) 可将备份存入支持的后端。

[查看公开访问配置](https://developers.cloudflare.com/r2/buckets/public-buckets/) · [查看费用说明](https://developers.cloudflare.com/r2/pricing/)

[查看官方文档](https://developers.cloudflare.com/r2/)
