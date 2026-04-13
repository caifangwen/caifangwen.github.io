---
title: "在 Hugo 中使用 Mermaid 绘制图表"
date: 2026-04-01T18:32:13+08:00
draft: false
tags: ["Hugo", "Mermaid", "图表", "教程"]
categories: ["Hugo"]
description: "介绍如何在 Hugo 静态博客中集成 Mermaid，实现流程图、时序图、甘特图等多种图表的渲染。"
author: "博主"
---

## 什么是 Mermaid？

[Mermaid](https://mermaid.js.org/) 是一个基于 JavaScript 的图表工具，允许你用类 Markdown 的文本语法来描述和渲染各类图表，包括流程图、时序图、类图、甘特图等。

---

## Hugo 集成 Mermaid 的几种方式

### 方式一：使用 Shortcode（推荐）

在 `layouts/shortcodes/` 目录下创建 `mermaid.html`：

```html
<!-- layouts/shortcodes/mermaid.html -->
<div class="mermaid">
  {{- .Inner | safeHTML }}
</div>
```

然后在页面底部或主题的 `layouts/partials/footer.html` 中引入 Mermaid JS：

```html
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({ startOnLoad: true, theme: 'default' });
</script>
```

在文章中这样使用：

```
{{</* mermaid */>}}
graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行操作]
    B -->|否| D[结束]
{{</* /mermaid */>}}
```

---

### 方式二：使用代码块 + 自定义 JS（Hugo 0.93+）

Hugo 0.93 起支持 [Goldmark 代码块钩子](https://gohugo.io/content-management/syntax-highlighting/)，可以拦截 `mermaid` 语言的代码块。

在 `layouts/_default/_markup/render-codeblock-mermaid.html` 中创建：

```html
<div class="mermaid">
  {{- .Inner | safeHTML }}
</div>
{{ .Page.Store.Set "hasMermaid" true }}
```

在页面模板末尾（如 `layouts/_default/baseof.html`）按需加载 JS：

```html
{{ if .Store.Get "hasMermaid" }}
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true });</script>
{{ end }}
```

这样文章中直接用标准 Markdown 代码块即可：

````
```mermaid
sequenceDiagram
    用户->>服务器: 发送请求
    服务器-->>用户: 返回响应
```
````

---

### 方式三：使用主题内置支持

部分 Hugo 主题（如 **PaperMod**、**DoIt**、**Stack**）已内置 Mermaid 支持，只需在 `config.yaml` 中开启：

```yaml
# config.yaml（以 PaperMod 为例）
params:
  mermaid:
    enable: true
    theme: "default"   # 可选 default / dark / neutral / forest
```

---

## 常用图表示例

### 流程图

```mermaid
graph LR
    A[写 Markdown] --> B[推送到 Git]
    B --> C{CI/CD}
    C -->|成功| D[Hugo 构建]
    C -->|失败| E[检查错误]
    D --> F[部署到服务器]
```

### 时序图

```mermaid
sequenceDiagram
    participant 浏览器
    participant Hugo服务
    participant CDN

    浏览器->>CDN: 请求页面
    CDN-->>浏览器: 返回缓存 HTML
    浏览器->>CDN: 加载 Mermaid JS
    CDN-->>浏览器: 返回脚本
    浏览器->>浏览器: 渲染图表
```

### 甘特图

```mermaid
gantt
    title 博客搭建计划
    dateFormat  YYYY-MM-DD
    section 准备
    选择主题        :a1, 2026-04-01, 2d
    配置 Hugo       :a2, after a1, 1d
    section 开发
    集成 Mermaid    :b1, after a2, 2d
    编写文章        :b2, after b1, 5d
    section 上线
    部署到服务器    :c1, after b2, 1d
```

### 类图

```mermaid
classDiagram
    class HugoSite {
        +string title
        +string baseURL
        +render()
        +deploy()
    }
    class Page {
        +string title
        +date publishDate
        +string content
    }
    HugoSite "1" --> "*" Page : 包含
```

---

## 注意事项

1. **转义问题**：在 Shortcode 内部，避免使用 `{}` 以防与 Hugo 模板语法冲突。
2. **按需加载**：推荐使用方式二的按需加载，避免每个页面都引入 Mermaid JS 影响性能。
3. **主题适配**：暗色主题下可将 `theme` 设置为 `dark`，或使用 CSS 变量自定义颜色。
4. **版本锁定**：生产环境建议锁定 Mermaid 版本号，如 `mermaid@10.9.0`，防止上游更新破坏样式。

---

## 总结

| 方式 | 适用场景 | 优点 |
|------|----------|------|
| Shortcode | 任意版本 Hugo | 灵活，兼容性好 |
| 代码块钩子 | Hugo 0.93+ | 标准语法，按需加载 |
| 主题内置 | 使用支持的主题 | 零配置 |

推荐优先使用**代码块钩子**方式，语法最接近标准 Markdown，迁移成本低，且支持按需加载脚本，对页面性能友好。
