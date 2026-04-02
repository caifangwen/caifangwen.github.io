---
title: "n8n 爬取 Alibaba 国际站产品详情页数据工作流搭建指南"
slug: "n8n-alibaba-product-scraper-workflow"
date: 2026-04-02T16:31:29+08:00
lastmod: 2026-04-02T16:31:29+08:00
draft: false
tags: ["n8n", "爬虫", "Alibaba", "自动化", "数据采集"]
categories: ["工作流自动化"]
description: "详细介绍如何在 n8n 中搭建一个支持批量输入 URL、自动爬取 Alibaba 国际站产品详情页数据的工作流，包含节点配置、字段提取与数据输出全流程步骤。"
---

## 概述

本文介绍如何在 n8n 中搭建一个工作流，实现批量输入多个 Alibaba 国际站产品详情页 URL，自动爬取产品名称、价格、规格、供应商信息等核心数据，并将结果结构化输出。

---

## 工作流节点总览

```
[Manual Trigger / Webhook]
        ↓
[Set 节点 —— 输入 URL 列表]
        ↓
[Split In Batches —— 逐条处理]
        ↓
[HTTP Request —— 请求详情页 HTML]
        ↓
[HTML Extract —— 提取产品字段]
        ↓
[Set 节点 —— 整理输出字段]
        ↓
[Merge / Aggregate —— 汇总所有结果]
        ↓
[输出节点（Google Sheets / JSON / Webhook）]
```

---

## 详细搭建步骤

### 第一步：触发节点

选择触发方式：

- **手动触发**：使用 `Manual Trigger` 节点，适合调试阶段。
- **Webhook 触发**：使用 `Webhook` 节点，通过 POST 请求传入 URL 数组，适合集成到外部系统。

> Webhook 模式示例请求体：
> ```json
> {
>   "urls": [
>     "https://www.alibaba.com/product-detail/xxx_123.html",
>     "https://www.alibaba.com/product-detail/yyy_456.html"
>   ]
> }
> ```

---

### 第二步：Set 节点 —— 定义 URL 列表

在手动触发模式下，用 `Set` 节点硬编码 URL 数组：

- 节点类型：**Set**
- 添加字段：
  - 字段名：`urls`
  - 类型：`Array`
  - 值：填入目标产品详情页 URL 数组

若使用 Webhook，此步骤跳过，直接引用 `{{ $json.body.urls }}`。

---

### 第三步：Split In Batches —— 逐条拆分 URL

将数组拆分为单条数据逐一处理：

- 节点类型：**Split In Batches**
- 配置：
  - `Batch Size`：`1`（每次处理一个 URL）
  - 输入表达式：`{{ $json.urls }}`

---

### 第四步：HTTP Request —— 请求详情页 HTML

- 节点类型：**HTTP Request**
- 配置项：
  - **Method**：`GET`
  - **URL**：`{{ $json }}`（来自 Split 节点的单条 URL）
  - **Response Format**：`String`（获取原始 HTML）
  - **Headers**（关键，模拟浏览器避免被拦截）：

```
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36
Accept-Language: en-US,en;q=0.9
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
```

- **超时**：建议设置 `30000`（30秒）
- **忽略 SSL 错误**：视情况开启

> ⚠️ 注意：Alibaba 国际站有反爬机制，建议在节点中添加随机延迟（可在 Split In Batches 后插入 `Wait` 节点，设置 2~5 秒延迟），或配置代理 IP。

---

### 第五步：HTML Extract —— 提取产品字段

- 节点类型：**HTML Extract**
- 输入字段：来自 HTTP Request 的 HTML 内容字段（通常为 `data`）

配置需提取的字段（CSS 选择器）：

| 字段名 | CSS 选择器 | 提取属性 |
|---|---|---|
| `product_title` | `.product-title-text` 或 `h1.title` | `text` |
| `price_range` | `.price-range` 或 `.price` | `text` |
| `min_order` | `.min-order .value` | `text` |
| `supplier_name` | `.supplier-name a` | `text` |
| `supplier_country` | `.supplier-country` | `text` |
| `product_images` | `.detail-gallery-img` | `src` |
| `description` | `.product-description` | `text` |

> ⚠️ Alibaba 页面结构可能随版本更新变化，建议在浏览器开发者工具中实际检查目标页面的选择器，以上仅为参考。

---

### 第六步：Set 节点 —— 整理输出结构

对提取结果进行清洗和重命名，统一数据结构：

- 节点类型：**Set**
- 保留模式：**Keep Only Set**
- 字段映射示例：

```
source_url      ← {{ $('HTTP Request').item.json.url }}
product_title   ← {{ $json.product_title }}
price_range     ← {{ $json.price_range }}
min_order       ← {{ $json.min_order }}
supplier_name   ← {{ $json.supplier_name }}
supplier_country← {{ $json.supplier_country }}
scraped_at      ← {{ $now.toISO() }}
```

---

### 第七步：Aggregate —— 汇总所有结果

将所有单条结果合并为一个数组：

- 节点类型：**Aggregate**
- 模式：`Aggregate All Item Data into a List`
- 输出字段名：`results`

---

### 第八步：输出节点

根据需求选择输出方式：

**输出到 Google Sheets：**
- 节点类型：`Google Sheets`
- 操作：`Append Row`
- 映射各字段到对应列

**输出为 JSON 文件：**
- 节点类型：`Write Binary File`
- 使用 `Code` 节点先将数组序列化为 JSON 字符串

**回传 Webhook：**
- 节点类型：`Respond to Webhook`
- 返回 `results` 数组

---

## 防反爬建议

1. **添加延迟**：在 HTTP Request 前插入 `Wait` 节点，随机等待 2~5 秒。
2. **轮换 User-Agent**：用 `Code` 节点随机选取 UA 字符串注入 Header。
3. **配置代理**：在 HTTP Request 节点的 `Proxy` 配置中填入代理地址。
4. **错误重试**：开启节点的 `Retry on Fail`，设置重试 2~3 次。
5. **错误处理分支**：使用 `IF` 节点判断 HTTP 状态码，非 200 时走错误分支记录日志。

---

## 完整工作流 JSON 导入

在 n8n 界面中点击右上角 **Import from JSON**，粘贴工作流 JSON 即可快速复用（根据实际字段选择器调整后使用）。

---

## 小结

通过以上 8 个节点的组合，即可实现：输入任意数量的 Alibaba 详情页 URL → 自动批量爬取 → 结构化提取产品数据 → 统一输出的完整链路。核心注意点在于 HTTP Request 的 Header 模拟和 HTML Extract 的 CSS 选择器准确性，建议结合实际页面结构调整。
