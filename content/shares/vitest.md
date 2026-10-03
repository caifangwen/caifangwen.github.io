---
title: Vitest
slug: vitest
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - 新技术与开发工具
tags:
  - 测试
  - TypeScript
description: 与 Vite 生态配合的测试框架，适合业务逻辑、工具函数和组件验证。
linkUrl: 'https://vitest.dev/'
linkSource: 官网
---

Vitest 是面向 JavaScript 与 TypeScript 项目的测试框架，与 Vite 工具生态配合使用。它适合验证业务计算、数据转换和组件逻辑，让开发者在修改代码后快速发现重要行为是否受到影响。

## 主要用途

- **验证业务规则**：为价格计算、字段转换和条件判断提供明确输入与预期结果。
- **检查组件逻辑**：结合适合的环境验证交互状态与输出。
- **融入开发流程**：在本地与持续集成中执行必要检查，帮助审查改动。

## 使用场景

电商工具可以为折扣计算和商品数据整理建立测试，再用边界输入检查异常情况。测试应围绕需求和风险设计，不必为所有简单展示代码增加重复断言。

## 相关工具

[Vite](vite.md) 提供开发与构建工具；[Playwright](playwright.md) 验证浏览器中的完整流程；[Biome](biome.md) 负责格式化与静态检查。

[查看官方网站](https://vitest.dev/)
