---
title: "JSON-LD 结构化数据完全指南"
slug: "json-ld-structured-data-guide"
date: 2026-04-10T18:59:09+08:00
lastmod: 2026-04-10T18:59:09+08:00
draft: false
description: "详解 JSON-LD 结构化数据的写法，涵盖 FAQ、文章、面包屑、产品、本地商家等常见场景，助力 SEO 提升搜索结果展示效果。"
tags: ["SEO", "JSON-LD", "结构化数据", "Schema.org"]
categories: ["SEO"]
---

JSON-LD（JavaScript Object Notation for Linked Data）是 Google 推荐的结构化数据格式，通过在页面中嵌入机器可读的语义信息，帮助搜索引擎更好地理解页面内容，从而获得富媒体搜索结果（Rich Results）。

## 基本格式

JSON-LD 写在 `<script>` 标签内，放于页面 `<head>` 或 `<body>` 中均可：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "某种类型",
  ...
}
</script>
```

- `@context`：固定填写 `https://schema.org`，声明使用 Schema.org 词汇表
- `@type`：指定内容类型，如 `FAQPage`、`Article`、`Product` 等

---

## 1. FAQ 常见问题（FAQPage）

FAQ 是最常见的结构化数据之一，符合条件的页面可在搜索结果中直接展开问答，显著提升点击率。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "什么是 JSON-LD？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON-LD 是一种基于 JSON 的结构化数据格式，用于在网页中嵌入语义化信息，帮助搜索引擎理解页面内容。"
      }
    },
    {
      "@type": "Question",
      "name": "JSON-LD 应该放在页面哪个位置？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Google 建议将 JSON-LD 放在 <head> 标签内，但放在 <body> 中同样有效。重要的是确保 <script type=\"application/ld+json\"> 标签完整且 JSON 格式合法。"
      }
    },
    {
      "@type": "Question",
      "name": "JSON-LD 和 Microdata 有什么区别？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON-LD 与 HTML 内容分离，维护更简便，是 Google 官方推荐格式。Microdata 需要将属性直接嵌入 HTML 元素中，耦合度高，不易维护。"
      }
    }
  ]
}
</script>
```

---

## 2. 文章（Article / BlogPosting）

适用于新闻、博客等内容页面，有助于进入 Google 头条新闻和搜索排名。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "JSON-LD 结构化数据完全指南",
  "description": "详解 JSON-LD 的写法与各类场景示例",
  "image": "https://example.com/images/json-ld-guide.jpg",
  "author": {
    "@type": "Person",
    "name": "张三",
    "url": "https://example.com/author/zhangsan"
  },
  "publisher": {
    "@type": "Organization",
    "name": "我的博客",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2026-04-10",
  "dateModified": "2026-04-10",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/posts/json-ld-structured-data-guide"
  }
}
</script>
```

---

## 3. 面包屑导航（BreadcrumbList）

帮助搜索引擎理解网站层级结构，搜索结果中会显示路径而非 URL。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "首页",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "前端开发",
      "item": "https://example.com/categories/frontend"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "JSON-LD 结构化数据完全指南",
      "item": "https://example.com/posts/json-ld-structured-data-guide"
    }
  ]
}
</script>
```

---

## 4. 产品（Product）

电商页面使用，可在搜索结果中展示价格、评分、库存等信息。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "无线蓝牙耳机 Pro",
  "image": [
    "https://example.com/products/earphone-1.jpg",
    "https://example.com/products/earphone-2.jpg"
  ],
  "description": "主动降噪，续航30小时，支持多设备连接",
  "sku": "EARPHONE-PRO-001",
  "brand": {
    "@type": "Brand",
    "name": "SoundMax"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/earphone-pro",
    "priceCurrency": "CNY",
    "price": "599.00",
    "priceValidUntil": "2026-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1024"
  }
}
</script>
```

---

## 5. 本地商家（LocalBusiness）

适合餐厅、门店等线下商家，可在搜索结果和地图中展示营业时间、地址、电话等。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "老王川菜馆",
  "image": "https://example.com/restaurant.jpg",
  "url": "https://example.com",
  "telephone": "+86-010-12345678",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "朝阳区建国路88号",
    "addressLocality": "北京",
    "addressRegion": "北京",
    "postalCode": "100022",
    "addressCountry": "CN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.9042,
    "longitude": 116.4074
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "11:00",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "10:00",
      "closes": "23:00"
    }
  ],
  "servesCuisine": "川菜",
  "priceRange": "¥¥"
}
</script>
```

---

## 6. 在 Hugo 中集成 JSON-LD

在 Hugo 中推荐将 JSON-LD 写入 `layouts/partials/` 中，然后在模板中调用。

**`layouts/partials/json-ld-faq.html`**

```html
{{ with .Params.faq }}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{ range $i, $item := . }}
    {{ if $i }},{{ end }}
    {
      "@type": "Question",
      "name": {{ $item.question | jsonify }},
      "acceptedAnswer": {
        "@type": "Answer",
        "text": {{ $item.answer | jsonify }}
      }
    }
    {{ end }}
  ]
}
</script>
{{ end }}
```

在文章 front matter 中定义 FAQ 内容：

```yaml
---
title: "示例文章"
slug: "example-article"
faq:
  - question: "这是第一个问题？"
    answer: "这是第一个问题的答案。"
  - question: "这是第二个问题？"
    answer: "这是第二个问题的答案。"
---
```

在 `layouts/_default/single.html` 中引入：

```html
{{ partial "json-ld-faq.html" . }}
```

---

## 验证工具

写完 JSON-LD 后，建议用以下工具验证：

- **Google 富媒体搜索测试**：https://search.google.com/test/rich-results
- **Schema.org 验证器**：https://validator.schema.org/
- **Google Search Console**：上线后在"增强功能"中查看抓取状态

---

## 小结

| 类型 | `@type` 值 | 适用场景 |
|------|-----------|---------|
| 常见问题 | `FAQPage` | 问答类内容页 |
| 博客文章 | `BlogPosting` | 博客、技术文档 |
| 新闻文章 | `NewsArticle` | 新闻资讯 |
| 面包屑 | `BreadcrumbList` | 所有内容页 |
| 产品 | `Product` | 电商详情页 |
| 本地商家 | `LocalBusiness` | 门店、餐厅 |
| 视频 | `VideoObject` | 视频内容页 |
| 活动 | `Event` | 线上线下活动 |

合理使用结构化数据，能显著提升页面在搜索引擎中的展示效果，是 SEO 优化的重要手段之一。
