---
title: Tauri
slug: tauri
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 新技术与开发工具
tags:
  - Rust
  - 跨平台
description: 用 Web 前端结合 Rust 构建桌面与移动应用，适合把已有界面扩展为跨平台客户端。
linkUrl: 'https://github.com/tauri-apps/tauri'
linkSource: GitHub
---

Tauri 用 Web 前端与 Rust 等底层能力构建桌面和移动应用。它适合希望复用网页界面、同时使用本地窗口和设备能力的项目，例如内部工作台、资料管理工具或桌面客户端。

## 主要用途

- **复用前端界面**：用熟悉的 Web 技术制作客户端页面，减少界面层重复开发。
- **访问本地能力**：通过命令和插件组织文件、窗口等平台功能。
- **构建跨平台产品**：为支持的平台配置打包和分发流程。

## 使用场景

可以先把一个文件处理或资料查询工具做成桌面原型，再验证本地读写与前后端通信。跨平台不代表行为完全相同，仍需分别测试目标系统和权限配置。

## 相关工具

[Vue](vue.md) 可用于客户端界面；[Tailwind CSS](tailwind-css-framework.md) 用于样式组织；[Ollama](ollama.md) 可通过本地接口为资料助手提供模型能力。

[查看 GitHub 仓库](https://github.com/tauri-apps/tauri)
