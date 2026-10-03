---
title: Redirection
slug: wordpress-redirection
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - WordPress 插件
tags:
  - WordPress
  - 重定向
description: 管理 WordPress 重定向并记录 404，适合页面改名、链接迁移和旧网址维护。
linkUrl: 'https://wordpress.org/plugins/redirection/'
linkSource: WordPress.org
---

Redirection 为 WordPress 提供重定向管理与 404 记录功能，适合网站改版、文章地址调整和旧链接维护。它帮助站长在内容位置变化后为访客建立合理路径，并发现外部或内部链接仍在访问不存在的页面。

## 主要用途

- **维护旧网址**：在页面移动后把旧路径指向合适的新页面。
- **排查 404**：观察访问记录，区分值得修复的链接与无关请求。
- **整理迁移规则**：集中管理跳转，减少服务器配置与插件规则分散造成的混乱。

## 使用场景

网站迁移时应先做旧新网址对应表，再设置规则并测试状态码。失效页面应根据内容关联处理，不宜把所有 404 统一跳到首页。

## 相关工具

[Screaming Frog](screaming-frog.md) 用于检查链接和跳转链；[Search Console](google-search-console.md) 可观察索引问题；[UpdraftPlus](wordpress-updraftplus.md) 可在批量修改前保存备份。

[查看 WordPress 插件](https://wordpress.org/plugins/redirection/)
