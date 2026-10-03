---
title: Backblaze B2
slug: backblaze-b2
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - CDN 与云存储
tags:
  - 对象存储
  - 备份
description: 提供云对象存储与兼容接口，适合文件归档、附件和备份仓库。
linkUrl: 'https://www.backblaze.com/cloud-storage'
linkSource: 官网
---

Backblaze B2 是云对象存储服务，适合保存备份、媒体文件和其他长期资料。它提供原生与 S3 兼容等接入方式，可与支持的传输或备份工具配合，让文件副本保存在独立于应用服务器的位置。

## 主要用途

- **保存文件与归档**：按桶和对象组织附件、媒体和导出数据。
- **建立远程备份仓库**：为支持的备份工具提供存储后端。
- **接入应用与分发**：通过兼容接口或合适的分发方案读取资源。

## 使用场景

自托管服务器可以将经过验证的备份保存到 B2，再定期测试恢复。应分别考虑存储、操作与下载费用，以及保存策略，不能只比较每单位存储价格。

## 相关工具

[Rclone](rclone.md) 传输和整理文件；[Restic](restic.md) 管理加密备份；[R2](cloudflare-r2.md) 可对比对象存储与分发需求；[1Panel](1panel.md) 提供服务器管理入口。

[查看官方网站](https://www.backblaze.com/cloud-storage)
