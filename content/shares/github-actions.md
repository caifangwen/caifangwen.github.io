---
title: GitHub Actions
slug: github-actions
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 部署与运维
tags:
  - CI/CD
  - 流水线
description: 在仓库事件触发后执行构建、检查与部署，适合把发布流程写成可重复任务。
linkUrl: 'https://docs.github.com/en/actions'
linkSource: 官方文档
---

GitHub Actions 通过工作流文件描述自动任务，可由代码提交、拉取请求、定时或手动事件触发。它适合把检查、构建、打包和发布组织成可重复流程，让每次部署都有明确输入、执行步骤和结果记录。

## 主要用途

- **运行必要检查**：在改动进入发布流程前执行项目所需的校验。
- **构建与打包**：生成网站文件、应用产物或容器镜像。
- **部署到目标环境**：通过相应工具和受控凭据发布到云服务或服务器。

## 使用场景

内容网站可以在提交后构建，再将产物发布到托管平台；容器项目可以先生成镜像，再交给部署平台运行。应明确生产分支、凭据权限和失败处理，避免任意分支都触发生产发布。

## 相关工具

[Workers Builds](cloudflare-workers-builds.md) 可对比 Cloudflare 内置路径；[Wrangler](cloudflare-wrangler.md) 部署 Worker；[Ansible](ansible.md) 配置服务器；[Rclone](rclone.md) 传输资源文件。

[查看官方文档](https://docs.github.com/en/actions)
