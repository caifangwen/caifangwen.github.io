---
title: WP Mail SMTP
slug: wordpress-wp-mail-smtp
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - WordPress 插件
tags:
  - WordPress
  - 邮件发送
description: 为 WordPress 配置 SMTP 或支持的邮件服务，适合改善表单与订单通知的发送路径。
linkUrl: 'https://wordpress.org/plugins/wp-mail-smtp/'
linkSource: WordPress.org
---

WP Mail SMTP 用于将 WordPress 邮件交给配置好的 SMTP 或受支持邮件服务发送。它适合排查表单通知、订单邮件和账号邮件的发送问题，帮助站长明确邮件实际通过哪条路径发出。

## 主要用途

- **配置发送服务**：选择支持的邮件提供商并设置认证信息，替换不可靠的默认发送环境。
- **测试邮件链路**：发送测试邮件，检查网站、发送服务和收件箱之间的连通情况。
- **统一发件信息**：配置发件地址与名称，让通知来源更清晰。

## 使用场景

企业官网若提示表单成功却收不到邮件，可以先测试发送服务，再检查域名认证、收件规则和垃圾邮件箱。插件无法单独保证送达，日志等能力也需核对版本。

## 相关工具

[Contact Form 7](wordpress-contact-form-7.md) 和 [Fluent Forms](wordpress-fluent-forms.md) 产生表单通知；[WooCommerce](wordpress-woocommerce.md) 需要可靠的订单邮件链路。

[查看 WordPress 插件](https://wordpress.org/plugins/wp-mail-smtp/)
