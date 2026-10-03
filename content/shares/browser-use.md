---
title: Browser Use
slug: browser-use
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - AI 与自动化
tags:
  - AI
  - 浏览器自动化
description: 让 AI 智能体操作浏览器，适合探索网页信息采集和重复操作自动化。
linkUrl: 'https://github.com/browser-use/browser-use'
linkSource: GitHub
---

Browser Use 让 AI 智能体通过浏览器访问网页、理解页面并执行操作。它适合探索需要页面交互的任务，例如跨页面收集信息、查找资料或辅助填写表单。项目提供 Python 库、命令行及云服务等路径，可按任务复杂度选择使用方式。

## 主要用途

- **网页资料整理**：在允许访问的页面中查找信息，并整理成结构化结果。
- **重复操作辅助**：让智能体按任务描述执行导航、点击和输入，减少手动切换页面。
- **接入自定义流程**：通过代码组织浏览器任务，再把结果交给其他程序处理。

## 使用场景

可以用来试验供应商网站资料采集，再由人工检查公司名称、产品信息与来源页面。页面变化和模型判断会影响稳定性，固定流程也值得与传统浏览器脚本方案对比。

## 相关工具

[uv](uv.md) 可管理 Python 环境；[LangGraph](langgraph.md) 可编排任务状态；[n8n](n8n.md) 可通过接口或自定义服务接收结果并安排后续任务。

[查看 GitHub 仓库](https://github.com/browser-use/browser-use)
