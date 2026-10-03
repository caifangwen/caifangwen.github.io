---
title: Rclone
slug: rclone
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - 文件传输
  - 云存储
description: 通过统一命令操作多种云存储，适合资源上传、文件迁移与定期复制。
linkUrl: 'https://rclone.org/'
linkSource: 官网
---

Rclone 是面向多种存储服务的命令行工具，适合在本地与云存储之间复制、同步和查看文件。它让不同服务通过相似命令工作，便于将资源上传和迁移写成脚本，或接入定时任务与部署流程。

## 主要用途

- **上传网站资源**：将图片、下载文件或构建产物复制到支持的存储后端。
- **迁移文件数据**：在不同服务之间传输对象，统一处理目录与路径。
- **组织定期复制**：配合脚本和计划任务维护需要的远程文件副本。

## 使用场景

静态资源可以先在本地生成，再用 Rclone 上传到 R2 或 B2。copy 与 sync 的行为不同，sync 可能删除目标端多余内容，实际使用应先检查范围并用预演确认。

## 相关工具

[R2](cloudflare-r2.md) 和 [Backblaze B2](backblaze-b2.md) 提供存储；[GitHub Actions](github-actions.md) 可安排上传流程；[Restic](restic.md) 更专注于有历史快照的备份。

[查看官方网站](https://rclone.org/)
