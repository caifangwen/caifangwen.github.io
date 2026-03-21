---
title: "B2B 外贸独立站页面结构规划"
date: 2026-03-16T20:14:30+08:00
draft: false
description: "B2B 外贸独立站的整体页面架构规划"
tags: [B2B, 独立站，网站结构]
categories:
  - MKT
author: Frida
---

## B2B 外贸独立站页面结构规划

---

### 📐 整体页面架构

```
/                          首页
/about                     关于我们
/products                  产品列表页
/products/[category]       分类页
/products/[category]/[id]  产品详情页
/contact                   联系我们 / 询盘页
/inquiry                   询盘提交成功页
```

---

### 📄 各页面内容规划

**① 首页 /**
- Hero Banner（核心卖点 + CTA按钮"Get a Quote"）
- 公司优势（3-4个，如：工厂直供、认证资质、交货期）
- 热门产品（6-8个精选）
- 合作客户 Logo 墙
- 询盘入口（悬浮按钮或底部表单）

**② 产品列表页 /products**
- 左侧分类筛选
- 产品卡片网格（图片+名称+简介+询盘按钮）
- 搜索框
- 分页

**③ 产品详情页 /products/[category]/[id]**
- 产品图片（多图轮播）
- 产品名称、型号、规格参数表
- 详细描述
- MOQ / 交货期 / 认证信息
- **询盘表单**（核心转化点）
- 相关产品推荐

**④ 关于我们 /about**
- 公司简介 + 工厂图片
- 发展历程
- 资质证书（ISO等）
- 团队介绍

**⑤ 联系/询盘页 /contact**
- 询盘表单（详细版）
- 公司地址、邮箱、WhatsApp
- Google Maps嵌入

---

### 🗃️ 数据库结构（Supabase）

```
products（产品表）
├── id
├── name
├── category_id
├── images[]
├── specs（JSON，规格参数）
├── description
├── moq
└── is_featured

categories（分类表）
├── id
├── name
└── slug

inquiries（询盘表）
├── id
├── name（客户姓名）
├── email
├── company
├── country
├── product_id（关联产品）
├── message
├── quantity
└── created_at
```

---

### 🔧 技术栈建议

```
框架      Next.js 14（App Router）
样式      Tailwind CSS
数据库    Supabase
图片存储  Supabase Storage
邮件通知  Resend（询盘后自动发邮件给你）
部署      Vercel
语言      英文为主，可选中英切换
```

---

### 📋 开发优先级

| 优先级 | 内容 |
|--------|------|
| 🔴 必须先做 | 产品详情页 + 询盘表单 + 数据库 |
| 🟡 第二阶段 | 产品列表 + 分类筛选 + 搜索 |
| 🟢 第三阶段 | 关于页 + 联系页 + 邮件通知 |
| ⚪ 可选 | 后台管理询盘、多语言、SEO优化 |

---

想从哪部分开始？我可以直接帮你写代码。