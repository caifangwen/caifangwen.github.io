---
title: Remotely Save
slug: obsidian-remotely-save
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - Obsidian 插件
tags:
  - Obsidian
  - 文件同步
description: 通过支持的云存储或 WebDAV 同步笔记文件，适合多设备资料维护。
linkUrl: 'https://github.com/remotely-save/remotely-save'
linkSource: GitHub
---

Remotely Save 在本地笔记库与支持的远程存储之间同步文件，适合希望自行选择存储方式的 Obsidian 用户。它支持多种服务，但不同服务、功能与平台能力应按照当前插件说明分别配置。

## 主要用途

- **连接远程存储**：在支持的配置中使用 S3 兼容服务、WebDAV 或其他后端。
- **同步笔记资料**：让多设备围绕同一远程内容交换文件。
- **安排同步规则**：按需要设置范围与执行方式，管理笔记和附件。

## 使用场景

可以先用测试笔记检查两台设备的新增、修改和删除行为，再用于主要资料库。同步会传播修改与删除，因此不能直接替代独立备份；也要避免多套同步工具同时写同一目录。

## 相关工具

[Obsidian Git](obsidian-git.md) 提供历史记录；[Image Converter](obsidian-image-converter.md) 控制附件体积；[Obsidian](obsidian.md) 提供笔记与官方同步产品信息入口。

[查看插件 GitHub 仓库](https://github.com/remotely-save/remotely-save)
