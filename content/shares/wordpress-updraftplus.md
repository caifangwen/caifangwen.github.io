---
title: UpdraftPlus
slug: wordpress-updraftplus
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - WordPress 插件
tags:
  - WordPress
  - 备份
description: 备份与恢复 WordPress 网站文件和数据库，适合日常维护以及更新前保存站点副本。
linkUrl: 'https://wordpress.org/plugins/updraftplus/'
linkSource: WordPress.org
---

UpdraftPlus 用于备份和恢复 WordPress 网站的数据库与文件，适合日常维护、更新前备份以及故障后的恢复准备。它让站点副本有固定保存方式，减少仅依赖服务器中同一份数据带来的恢复困难。

## 主要用途

- **安排定期备份**：根据内容更新频率保存数据库、插件、主题和上传文件。
- **保存远程副本**：使用支持的存储方式，把备份保存在站点之外。
- **恢复站点内容**：出现更新故障或误操作时，从合适的备份恢复所需部分。

## 使用场景

在更新主题、调整缓存或更换插件前先创建备份，并在测试环境检查恢复过程。备份任务显示成功之外，还要确认文件可读取、保存周期合理，电商站尤其需要考虑新订单数据。

## 相关工具

[WooCommerce](wordpress-woocommerce.md) 的交易数据需要更谨慎的备份安排；[LiteSpeed Cache](wordpress-litespeed-cache.md) 调整前可先保存副本；[Redirection](wordpress-redirection.md) 可协助迁移后的链接管理。

[查看 WordPress 插件](https://wordpress.org/plugins/updraftplus/)
