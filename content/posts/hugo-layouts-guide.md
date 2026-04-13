---
title: "Hugo Layouts 模板系统深度解析"
date: 2026-03-25T09:10:45+08:00
draft: false
description: "全面介绍 Hugo layouts 目录的结构、模板类型、查找机制、Go 模板语法及实战用法"
tags: ["Hugo", "layouts", "模板", "Go Template", "静态网站"]
categories: ["Hugo"]
author: "Claude"
toc: true
---

## 什么是 Layouts

`layouts/` 是 Hugo 的**模板引擎核心**，使用 Go 内置的 `html/template` 语法，负责将 `content/` 中的 Markdown 内容渲染为最终的 HTML 页面。

Hugo 采用**约定优于配置**的设计：只要文件放在正确的位置，框架会自动找到并使用对应的模板，无需任何手动注册。

---

## 完整目录结构

```
layouts/
├── _default/                  # 默认模板（兜底）
│   ├── baseof.html            # 所有页面的 HTML 骨架
│   ├── single.html            # 内容详情页
│   ├── list.html              # 内容列表页
│   ├── summary.html           # 内容摘要片段
│   ├── terms.html             # 分类法术语列表（如所有 tags）
│   └── taxonomy.html          # 单个分类法页面（如某个 tag 下的文章）
├── partials/                  # 可复用的局部模板片段
│   ├── head.html
│   ├── header.html
│   ├── footer.html
│   ├── nav.html
│   └── seo.html
├── shortcodes/                # 在 Markdown 中调用的短代码
│   ├── notice.html
│   ├── video.html
│   └── badge.html
├── posts/                     # posts 内容类型的专属模板
│   ├── single.html
│   └── list.html
├── page/                      # page 类型专属模板
│   └── single.html
├── index.html                 # 网站首页（homepage）
├── 404.html                   # 404 错误页面
└── robots.txt                 # robots.txt 模板（可动态生成）
```

---

## 页面类型与模板对应关系

Hugo 将所有页面分为以下几种类型，每种类型对应不同的模板：

| 页面类型 | 说明 | 对应模板 |
|---------|------|---------|
| **Home Page** | 网站首页 `/` | `layouts/index.html` |
| **Single Page** | 单篇内容详情页 | `layouts/_default/single.html` |
| **List Page** | 内容列表页（目录、分类） | `layouts/_default/list.html` |
| **Taxonomy List** | 分类法列表（所有 tags） | `layouts/_default/terms.html` |
| **Taxonomy Term** | 某个分类下的文章列表 | `layouts/_default/taxonomy.html` |
| **404 Page** | 404 错误页 | `layouts/404.html` |

---

## 模板查找顺序（Lookup Order）

这是 Hugo 最重要的机制之一。Hugo 按照**从具体到通用**的顺序查找模板，找到第一个匹配的即停止。

### Single Page 查找顺序示例

对于 `content/posts/my-article.md`，Hugo 依次查找：

```
1. layouts/posts/single.html          ← 内容类型 + 模板类型（最具体）
2. layouts/posts/single.baseof.html
3. layouts/_default/single.html       ← 默认兜底
4. themes/<theme>/layouts/posts/single.html
5. themes/<theme>/layouts/_default/single.html
```

### List Page 查找顺序示例

对于 `content/posts/_index.md`：

```
1. layouts/posts/list.html
2. layouts/_default/list.html
3. themes/<theme>/layouts/...
```

### 覆盖主题模板

利用查找顺序，可以**精准覆盖主题的任意模板**，只需在项目根目录创建同路径文件：

```bash
# 主题有 themes/ananke/layouts/_default/single.html
# 只需创建同路径文件即可覆盖：
layouts/_default/single.html   ← 项目文件优先级更高
```

---

## 核心模板详解

### 1. `baseof.html` — 基础骨架模板

`baseof.html` 是**所有页面的 HTML 骨架**，通过 `block` 定义可被子模板覆盖的插槽。

```html
<!DOCTYPE html>
<html lang="{{ .Site.Language.Lang }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  {{/* 定义可覆盖的 title 插槽 */}}
  <title>
    {{- block "title" . -}}
      {{ .Site.Title }}
    {{- end -}}
  </title>

  {{ partial "head.html" . }}
</head>
<body class="{{ block "bodyClass" . }}default{{ end }}">

  {{ partial "header.html" . }}

  <main id="main">
    {{/* 核心内容插槽，子模板必须实现 */}}
    {{ block "main" . }}{{ end }}
  </main>

  {{ partial "footer.html" . }}

  {{ block "scripts" . }}{{ end }}
</body>
</html>
```

**`block` 指令说明：**

- `{{ block "name" . }}默认内容{{ end }}` — 定义一个插槽，子模板可覆盖
- 子模板用 `{{ define "name" }}...{{ end }}` 填充插槽
- `.` 是当前上下文（Page 对象），必须传递

---

### 2. `single.html` — 文章详情页

用于渲染每一篇具体的内容页面（博客文章、项目页等）。

```html
{{ define "title" }}{{ .Title }} | {{ .Site.Title }}{{ end }}

{{ define "main" }}
<article class="post">

  {{/* 文章头部信息 */}}
  <header class="post-header">
    <h1 class="post-title">{{ .Title }}</h1>
    
    <div class="post-meta">
      <time datetime="{{ .Date.Format "2006-01-02" }}">
        {{ .Date.Format "2006年01月02日" }}
      </time>
      
      {{ with .Params.author }}
        <span class="author">· {{ . }}</span>
      {{ end }}
      
      <span class="reading-time">· {{ .ReadingTime }} 分钟阅读</span>
    </div>

    {{/* 封面图 */}}
    {{ with .Params.cover }}
      <img src="{{ .image }}" alt="{{ .alt | default $.Title }}">
    {{ end }}
  </header>

  {{/* 文章正文 */}}
  <div class="post-content">
    {{ .Content }}
  </div>

  {{/* 标签 */}}
  {{ with .Params.tags }}
  <footer class="post-tags">
    {{ range . }}
      <a href="{{ "/tags/" | relLangURL }}{{ . | urlize }}">{{ . }}</a>
    {{ end }}
  </footer>
  {{ end }}

  {{/* 上一篇 / 下一篇 */}}
  <nav class="post-nav">
    {{ with .PrevInSection }}
      <a href="{{ .Permalink }}">← {{ .Title }}</a>
    {{ end }}
    {{ with .NextInSection }}
      <a href="{{ .Permalink }}">{{ .Title }} →</a>
    {{ end }}
  </nav>

</article>
{{ end }}
```

---

### 3. `list.html` — 列表页

用于渲染目录索引页、分类页、标签页等包含多篇文章的页面。

```html
{{ define "title" }}{{ .Title }} | {{ .Site.Title }}{{ end }}

{{ define "main" }}
<section class="list-page">

  <h1>{{ .Title }}</h1>
  
  {{ with .Content }}
    <div class="list-intro">{{ . }}</div>
  {{ end }}

  {{/* 按年份分组 */}}
  {{ range (.Pages.GroupByDate "2006") }}
  <div class="year-group">
    <h2 class="year">{{ .Key }}</h2>
    <ul>
      {{ range .Pages }}
      <li>
        <time>{{ .Date.Format "01-02" }}</time>
        <a href="{{ .Permalink }}">{{ .Title }}</a>
        {{ if .Draft }}<span class="draft-badge">草稿</span>{{ end }}
      </li>
      {{ end }}
    </ul>
  </div>
  {{ end }}

  {{/* 分页 */}}
  {{ template "_internal/pagination.html" . }}

</section>
{{ end }}
```

---

### 4. `index.html` — 网站首页

首页是独立的页面类型，通常需要展示精选内容、最新文章等。

```html
{{ define "bodyClass" }}home{{ end }}

{{ define "main" }}
<section class="hero">
  <h1>{{ .Site.Title }}</h1>
  <p>{{ .Site.Params.description }}</p>
</section>

{{/* 最新文章（取前6篇） */}}
<section class="recent-posts">
  <h2>最新文章</h2>
  <div class="post-grid">
    {{ range first 6 (where .Site.RegularPages "Type" "posts") }}
    <article class="post-card">
      <a href="{{ .Permalink }}">
        <h3>{{ .Title }}</h3>
        <p>{{ .Summary }}</p>
        <time>{{ .Date.Format "2006-01-02" }}</time>
      </a>
    </article>
    {{ end }}
  </div>
  <a href="/posts/" class="view-all">查看全部文章 →</a>
</section>
{{ end }}
```

---

## `partials/` — 局部模板片段

Partials 是**可复用的模板片段**，通过 `{{ partial "name.html" . }}` 调用，避免代码重复。

### `head.html` — HTML head 内容

```html
<meta name="description" content="{{ with .Description }}{{ . }}{{ else }}{{ .Site.Params.description }}{{ end }}">

{{/* Open Graph */}}
<meta property="og:title" content="{{ .Title }}">
<meta property="og:type" content="article">
<meta property="og:url" content="{{ .Permalink }}">
{{ with .Params.cover }}
<meta property="og:image" content="{{ .image | absURL }}">
{{ end }}

{{/* CSS 资源 */}}
{{ $style := resources.Get "scss/main.scss" | toCSS | minify | fingerprint }}
<link rel="stylesheet" href="{{ $style.Permalink }}" integrity="{{ $style.Data.Integrity }}">

{{/* RSS 自动发现 */}}
{{ range .AlternativeOutputFormats }}
  <link rel="{{ .Rel }}" type="{{ .MediaType.Type }}" href="{{ .Permalink }}">
{{ end }}
```

### `header.html` — 页头导航

```html
<header class="site-header">
  <a href="{{ "/" | relLangURL }}" class="site-logo">
    {{ .Site.Title }}
  </a>

  <nav class="site-nav">
    {{ range .Site.Menus.main }}
    <a href="{{ .URL }}" 
       {{ if $.IsMenuCurrent "main" . }}class="active"{{ end }}>
      {{ .Name }}
    </a>
    {{ end }}
  </nav>

  {{/* 多语言切换 */}}
  {{ if .Site.IsMultiLingual }}
  <div class="lang-switcher">
    {{ range .Translations }}
      <a href="{{ .Permalink }}">{{ .Language.LanguageName }}</a>
    {{ end }}
  </div>
  {{ end }}
</header>
```

### Partial 传递自定义参数

```html
{{/* 传递 map 作为上下文 */}}
{{ partial "card.html" (dict "page" . "showTags" true "limit" 3) }}

{{/* 在 card.html 中接收 */}}
{{ define "partials/card.html" }}
  {{ $page := .page }}
  {{ if .showTags }}
    {{ range first .limit $page.Params.tags }}
      <span>{{ . }}</span>
    {{ end }}
  {{ end }}
{{ end }}
```

---

## `shortcodes/` — 短代码

短代码让内容作者可以在 Markdown 中插入复杂的 HTML 结构，无需写 HTML。

### 创建 `notice.html`

```html
{{/* layouts/shortcodes/notice.html */}}
{{ $type := .Get 0 | default "info" }}
<div class="notice notice-{{ $type }}">
  <div class="notice-icon">
    {{ if eq $type "warning" }}⚠️
    {{ else if eq $type "danger" }}🚨
    {{ else if eq $type "success" }}✅
    {{ else }}ℹ️
    {{ end }}
  </div>
  <div class="notice-body">
    {{ .Inner | markdownify }}
  </div>
</div>
```

在 Markdown 中使用：

```markdown
{{</* notice warning */>}}
请注意：此操作**不可撤销**，请谨慎操作！
{{</* /notice */>}}

{{</* notice success */>}}
恭喜！安装已完成。
{{</* /notice */>}}
```

### 创建 `bilibili.html`（嵌入视频）

```html
{{/* layouts/shortcodes/bilibili.html */}}
{{ $id := .Get 0 }}
<div class="video-wrapper">
  <iframe src="https://player.bilibili.com/player.html?bvid={{ $id }}"
          scrolling="no" 
          frameborder="no" 
          allowfullscreen>
  </iframe>
</div>
```

使用：

```markdown
{{</* bilibili BV1xx411c7mD */>}}
```

---

## Go 模板语法速查

### 变量与赋值

```go
{{/* 声明变量 */}}
{{ $name := "Hugo" }}
{{ $count := 42 }}

{{/* 修改变量 */}}
{{ $count = add $count 1 }}

{{/* 输出变量 */}}
<p>{{ $name }} - {{ $count }}</p>
```

### 条件判断

```go
{{ if .Params.featured }}
  <span class="featured">精选</span>
{{ else if gt .ReadingTime 10 }}
  <span class="long-read">长文</span>
{{ else }}
  <span class="normal">普通</span>
{{ end }}

{{/* with：值存在时执行，同时绑定上下文 */}}
{{ with .Params.subtitle }}
  <h2>{{ . }}</h2>   {{/* . 就是 subtitle 的值 */}}
{{ end }}
```

### 循环遍历

```go
{{/* 遍历页面列表 */}}
{{ range .Pages }}
  <a href="{{ .Permalink }}">{{ .Title }}</a>
{{ end }}

{{/* 带索引遍历 */}}
{{ range $index, $page := .Pages }}
  <span>{{ add $index 1 }}. {{ $page.Title }}</span>
{{ end }}

{{/* 遍历 map */}}
{{ range $key, $val := .Params }}
  {{ $key }}: {{ $val }}
{{ end }}

{{/* 无结果时的 else */}}
{{ range .Pages }}
  ...
{{ else }}
  <p>暂无内容</p>
{{ end }}
```

### 常用函数

```go
{{/* 字符串 */}}
{{ upper "hello" }}              {{/* HELLO */}}
{{ lower "WORLD" }}              {{/* world */}}
{{ title "hello world" }}        {{/* Hello World */}}
{{ replace "a-b-c" "-" "/" }}    {{/* a/b/c */}}
{{ truncate 100 "..." .Summary }}

{{/* 数字 */}}
{{ add 1 2 }}       {{/* 3 */}}
{{ sub 10 3 }}      {{/* 7 */}}
{{ mul 4 5 }}       {{/* 20 */}}
{{ div 10 2 }}      {{/* 5 */}}
{{ mod 10 3 }}      {{/* 1 */}}

{{/* 集合 */}}
{{ len .Pages }}
{{ first 5 .Pages }}
{{ last 3 .Pages }}
{{ shuffle .Pages }}
{{ sort .Pages "Date" "desc" }}
{{ where .Pages "Type" "posts" }}
{{ where .Pages "Params.featured" true }}

{{/* 时间格式化 */}}
{{ .Date.Format "2006-01-02 15:04:05" }}
{{ .Date.Format "January 2, 2006" }}
{{ dateFormat "2006年01月02日" .Date }}
```

### Page 对象常用属性

```go
{{ .Title }}             {{/* 文章标题 */}}
{{ .Content }}           {{/* HTML 正文 */}}
{{ .Summary }}           {{/* 摘要（自动或手动截断） */}}
{{ .Permalink }}         {{/* 完整 URL */}}
{{ .RelPermalink }}      {{/* 相对 URL */}}
{{ .Date }}              {{/* 发布时间 */}}
{{ .Lastmod }}           {{/* 最后修改时间 */}}
{{ .ReadingTime }}       {{/* 预计阅读分钟数 */}}
{{ .WordCount }}         {{/* 字数 */}}
{{ .Params }}            {{/* Front Matter 自定义字段 */}}
{{ .Type }}              {{/* 内容类型（posts, page...） */}}
{{ .Section }}           {{/* 所在 section */}}
{{ .Draft }}             {{/* 是否草稿 */}}
{{ .IsHome }}            {{/* 是否首页 */}}
{{ .IsPage }}            {{/* 是否单页 */}}
{{ .IsSection }}         {{/* 是否列表页 */}}
{{ .Pages }}             {{/* 子页面列表 */}}
{{ .Site }}              {{/* 全局站点对象 */}}
{{ .Site.Params }}       {{/* 站点自定义参数 */}}
{{ .Site.Pages }}        {{/* 所有页面 */}}
{{ .Site.RegularPages }} {{/* 所有常规内容页 */}}
```

---

## 内置模板（Internal Templates）

Hugo 提供了一些开箱即用的内置模板：

```html
{{/* 分页导航 */}}
{{ template "_internal/pagination.html" . }}

{{/* Google Analytics */}}
{{ template "_internal/google_analytics.html" . }}

{{/* Open Graph 元标签 */}}
{{ template "_internal/opengraph.html" . }}

{{/* Twitter Cards */}}
{{ template "_internal/twitter_cards.html" . }}

{{/* 结构化数据 Schema.org */}}
{{ template "_internal/schema.html" . }}
```

---

## 输出格式（Output Formats）

Hugo 支持为同一内容生成多种输出格式：

```toml
# hugo.toml
[outputs]
  home = ["HTML", "RSS", "JSON"]
  page = ["HTML"]
  section = ["HTML", "RSS"]
```

为 JSON 格式创建模板 `layouts/_default/list.json`：

```json
{
  "posts": [
    {{ range $i, $p := .Pages }}
    {{ if $i }},{{ end }}
    {
      "title": {{ $p.Title | jsonify }},
      "url": {{ $p.Permalink | jsonify }},
      "date": {{ $p.Date.Format "2006-01-02" | jsonify }},
      "summary": {{ $p.Summary | jsonify }}
    }
    {{ end }}
  ]
}
```

---

## 最佳实践

**1. 善用 `with` 代替 `if` 检查**
```go
{{/* 不推荐 */}}
{{ if .Params.cover }}{{ .Params.cover }}{{ end }}

{{/* 推荐：with 会自动绑定值为上下文 */}}
{{ with .Params.cover }}<img src="{{ . }}">{{ end }}
```

**2. 使用 `$` 在 range 内访问外部上下文**
```go
{{ range .Pages }}
  {{/* . 是当前 page，用 $ 访问外层 Site */}}
  <a href="{{ .Permalink }}">{{ .Title }} | {{ $.Site.Title }}</a>
{{ end }}
```

**3. 注释不输出到 HTML**
```go
{{/* 这是 Go 模板注释，不会出现在 HTML 中 */}}
<!-- 这是 HTML 注释，会出现在 HTML 中 -->
```

**4. 控制空白输出**
```go
{{- .Title -}}   {{/* 前后横线去除多余空白 */}}
```

**5. Partial 缓存提升性能**
```go
{{/* 对于不依赖 page 上下文的 partial，使用 partialCached */}}
{{ partialCached "sidebar.html" . }}
{{ partialCached "footer.html" . .Lang }}  {{/* 第三个参数是缓存 key */}}
```

---

## 总结

```
layouts/
├── baseof.html      ← 所有页面的 HTML 骨架，定义 block 插槽
├── index.html       ← 首页，优先级最高
├── 404.html         ← 404 页面
├── _default/        ← 兜底模板（single / list / terms / taxonomy）
├── <type>/          ← 内容类型专属模板，覆盖 _default
├── partials/        ← 可复用片段，用 partial 调用
└── shortcodes/      ← Markdown 内嵌短代码
```

Hugo 的模板系统遵循**从具体到通用**的查找机制，合理利用这一机制，可以让你的主题拥有极高的灵活性和可维护性。

---

*本文生成时间：2026-03-25 09:10:45 CST*
