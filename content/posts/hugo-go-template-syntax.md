---
title: "Go 模板语法完全指南 —— Hugo 模板开发手册"
date: 2026-03-25T09:52:35+08:00
draft: false
description: "系统、深入地介绍 Hugo 使用的 Go html/template 语法，涵盖变量、控制流、函数、管道、作用域等所有核心特性"
tags: ["Hugo", "Go Template", "模板语法", "Web开发"]
categories: ["技术教程"]
author: "Claude"
toc: true
weight: 3
---

## 前言

Hugo 使用 Go 标准库中的 `html/template` 与 `text/template` 作为模板引擎，并在此基础上扩展了大量内置函数。掌握 Go 模板语法是深度定制 Hugo 主题的必备技能。

本文系统梳理所有语法特性，每个知识点配有可直接使用的代码示例。

---

## 基础语法

### 分隔符

Go 模板使用双花括号 `{{ }}` 作为模板动作的边界，括号内的内容会被模板引擎解析执行，括号外的内容原样输出。

```html
<!-- 原样输出 -->
<p>这段文字直接输出到 HTML</p>

<!-- 模板动作 -->
<p>{{ .Title }}</p>

<!-- 注释（不会输出到 HTML） -->
{{/* 这是模板注释 */}}

<!-- HTML 注释（会输出到 HTML） -->
<!-- 这是 HTML 注释 -->
```

### 空白控制

默认情况下，模板动作前后的换行和空格都会保留，可能产生多余的空行。使用 `-` 修饰符来消除空白：

```go
{{/* 原始写法，会保留空白 */}}
<ul>
  {{ range .Pages }}
  <li>{{ .Title }}</li>
  {{ end }}
</ul>

{{/* 使用 - 消除空白 */}}
<ul>
  {{- range .Pages }}
  <li>{{ .Title }}</li>
  {{- end }}
</ul>

{{/* 说明 */}}
{{-   ...   }}   {{/* 去除左侧空白 */}}
{{    ...  -}}   {{/* 去除右侧空白 */}}
{{-   ...  -}}   {{/* 去除两侧空白 */}}
```

### 输出与转义

```go
{{/* 自动 HTML 转义（安全输出） */}}
{{ .Title }}

{{/* 输出原始 HTML，不转义（谨慎使用） */}}
{{ .Content }}            {{/* .Content 已经是安全 HTML */}}
{{ .Description | safeHTML }}

{{/* 输出 URL，不转义 */}}
<a href="{{ .Permalink | safeURL }}">链接</a>

{{/* 输出 JS，不转义 */}}
<script>var data = {{ .Params.data | safeJS }};</script>
```

---

## 变量（Variables）

### 声明与赋值

Go 模板中，变量名以 `$` 开头。

```go
{{/* 声明变量，使用 := */}}
{{ $name := "Hugo" }}
{{ $year := 2026 }}
{{ $isActive := true }}
{{ $tags := slice "Go" "Hugo" "Web" }}

{{/* 重新赋值，使用 = */}}
{{ $year = 2027 }}

{{/* 输出变量 */}}
<p>{{ $name }} - {{ $year }}</p>
```

### 变量作用域

Go 模板的变量作用域以 `{{ range }}`、`{{ with }}`、`{{ if }}` 等块为边界，**块内声明的变量不能在块外访问**。

```go
{{ $outer := "外部变量" }}

{{ range .Pages }}
  {{ $inner := "内部变量" }}
  {{ $outer }}   {{/* ✅ 可以访问外部变量 */}}
  {{ $inner }}   {{/* ✅ 可以访问内部变量 */}}
{{ end }}

{{ $outer }}     {{/* ✅ 仍然可以访问 */}}
{{/* $inner 在这里不可访问 */}}
```

### 在 range 内修改外部变量

```go
{{ $count := 0 }}

{{ range .Pages }}
  {{ $count = add $count 1 }}   {{/* 修改外部变量（注意用 = 不是 :=） */}}
{{ end }}

<p>共 {{ $count }} 篇文章</p>
```

### `$` — 全局根上下文

在任何嵌套块内，`$` 始终指向模板的**根上下文**（通常是 Page 对象），这使得在 `range` 内访问外层数据变得简单：

```go
{{ range .Pages }}
  {{/* . 是当前遍历的 page */}}
  {{/* $ 是模板根上下文（当前 Page） */}}
  
  <a href="{{ .Permalink }}">{{ .Title }}</a>
  <span>来自站点：{{ $.Site.Title }}</span>
  <span>父页面标题：{{ $.Title }}</span>
{{ end }}
```

---

## 上下文（Context / The Dot）

`.`（点）是 Go 模板中最核心的概念，代表**当前上下文**，会随着进入不同的块而变化。

```go
{{/* 在顶层，. 是 Page 对象 */}}
{{ .Title }}
{{ .Permalink }}

{{/* 进入 with 后，. 变为 with 的值 */}}
{{ with .Params.author }}
  <p>作者：{{ . }}</p>   {{/* . 是 author 字符串 */}}
{{ end }}

{{/* 进入 range 后，. 变为当前遍历元素 */}}
{{ range .Params.tags }}
  <span>{{ . }}</span>   {{/* . 是 tag 字符串 */}}
{{ end }}

{{/* 调用 partial 时，. 是传递的上下文 */}}
{{ partial "card.html" . }}          {{/* 传递整个 page */}}
{{ partial "card.html" .Params }}    {{/* 只传递 params */}}
```

---

## 条件控制（Conditionals）

### `if / else if / else`

```go
{{ if .Params.featured }}
  <span class="badge">精选</span>
{{ else if .Params.hot }}
  <span class="badge">热门</span>
{{ else }}
  <span class="badge">普通</span>
{{ end }}
```

### 真值判断规则

Go 模板中，以下值被判定为**假（false）**：

| 值 | 类型 | 说明 |
|---|---|---|
| `false` | bool | 布尔假 |
| `0` | int/float | 数字零 |
| `""` | string | 空字符串 |
| `nil` | pointer/interface | 空指针 |
| `[]` | slice/array | 空集合 |
| `{}` | map | 空 map |

```go
{{/* 检查字符串是否非空 */}}
{{ if .Params.subtitle }}
  <h2>{{ .Params.subtitle }}</h2>
{{ end }}

{{/* 检查集合是否非空 */}}
{{ if .Params.tags }}
  <div class="tags">...</div>
{{ end }}

{{/* 检查数字是否非零 */}}
{{ if .WordCount }}
  <span>字数：{{ .WordCount }}</span>
{{ end }}
```

### 比较运算符

Go 模板使用**函数形式**的比较运算符，而非符号形式：

```go
{{ if eq .Type "posts" }}        {{/* 等于 == */}}
{{ if ne .Type "posts" }}        {{/* 不等于 != */}}
{{ if lt .WordCount 500 }}       {{/* 小于 < */}}
{{ if le .WordCount 500 }}       {{/* 小于等于 <= */}}
{{ if gt .WordCount 1000 }}      {{/* 大于 > */}}
{{ if ge .WordCount 1000 }}      {{/* 大于等于 >= */}}
```

### 逻辑运算符

```go
{{/* and：全部为真才为真 */}}
{{ if and .Params.featured (not .Draft) }}
  <span>精选且已发布</span>
{{ end }}

{{/* or：任一为真即为真 */}}
{{ if or .Params.featured .Params.hot }}
  <span>推荐内容</span>
{{ end }}

{{/* not：取反 */}}
{{ if not .Draft }}
  <span>已发布</span>
{{ end }}

{{/* 复杂条件组合 */}}
{{ if and (eq .Type "posts") (or .Params.featured (gt .WordCount 2000)) }}
  <span>长篇精选文章</span>
{{ end }}
```

### `with` — 存在性检查与上下文切换

`with` 是 Hugo 模板中最推荐的条件检查方式，当值存在（非空/非零/非false）时执行，**同时将 `.` 切换为该值**：

```go
{{/* 基础用法 */}}
{{ with .Params.cover }}
  <img src="{{ . }}" alt="封面">   {{/* . 就是 cover 的值 */}}
{{ end }}

{{/* with + else */}}
{{ with .Params.description }}
  <meta name="description" content="{{ . }}">
{{ else }}
  <meta name="description" content="{{ $.Site.Params.description }}">
{{ end }}

{{/* 链式访问，避免 nil 错误 */}}
{{ with .Params.author }}
  {{ with .name }}
    <span>{{ . }}</span>   {{/* 只有 author.name 存在时才输出 */}}
  {{ end }}
{{ end }}

{{/* 用 $ 在 with 内访问外部数据 */}}
{{ with .Params.series }}
  <p>本文属于系列：{{ . }}，来自站点 {{ $.Site.Title }}</p>
{{ end }}
```

---

## 循环（Range）

### 遍历 Slice / Array

```go
{{/* 基础遍历 */}}
{{ range .Pages }}
  <a href="{{ .Permalink }}">{{ .Title }}</a>
{{ end }}

{{/* 带索引遍历 */}}
{{ range $index, $page := .Pages }}
  <span>{{ add $index 1 }}. {{ $page.Title }}</span>
{{ end }}

{{/* 无结果时的 else */}}
{{ range .Pages }}
  <li>{{ .Title }}</li>
{{ else }}
  <li>暂无文章</li>
{{ end }}
```

### 遍历 Map

```go
{{/* 遍历 Front Matter 中的 map */}}
{{ range $key, $value := .Params.social }}
  <a href="{{ $value }}">{{ $key }}</a>
{{ end }}

{{/* 遍历站点数据 */}}
{{ range .Site.Data.team }}
  <div>{{ .name }} - {{ .role }}</div>
{{ end }}
```

### 遍历字符串 Slice

```go
{{ range .Params.tags }}
  <a href="/tags/{{ . | urlize }}">{{ . }}</a>
{{ end }}

{{/* 带索引，在最后一项不加逗号 */}}
{{ range $i, $tag := .Params.tags }}
  {{ $tag }}{{ if lt (add $i 1) (len $.Params.tags) }},{{ end }}
{{ end }}
```

### 遍历数字序列

```go
{{/* 生成 1 到 5 的序列 */}}
{{ range seq 5 }}
  <span>{{ . }}</span>
{{ end }}

{{/* 生成 2 到 8 的序列 */}}
{{ range seq 2 8 }}
  <span>{{ . }}</span>
{{ end }}
```

### 集合操作后遍历

```go
{{/* 取前 N 个 */}}
{{ range first 5 .Site.RegularPages }}
  <li>{{ .Title }}</li>
{{ end }}

{{/* 取后 N 个 */}}
{{ range last 3 .Site.RegularPages }}
  <li>{{ .Title }}</li>
{{ end }}

{{/* 过滤后遍历 */}}
{{ range where .Site.RegularPages "Type" "posts" }}
  <li>{{ .Title }}</li>
{{ end }}

{{/* 排序后遍历 */}}
{{ range sort .Params.tags }}
  <span>{{ . }}</span>
{{ end }}

{{/* 按字段排序页面 */}}
{{ range sort .Site.RegularPages "Title" "asc" }}
  <li>{{ .Title }}</li>
{{ end }}
```

---

## 管道（Pipelines）

管道是 Go 模板最强大的特性之一，使用 `|` 将多个函数串联，**前一个函数的输出作为后一个函数的最后一个参数**。

```go
{{/* 基础管道 */}}
{{ .Title | upper }}
{{ .Title | lower | title }}

{{/* 多级管道 */}}
{{ .Summary | truncate 150 "..." | safeHTML }}

{{/* URL 处理 */}}
{{ "hello world" | urlize }}           {{/* hello-world */}}
{{ .Title | urlize }}

{{/* 资源处理管道 */}}
{{ $style := resources.Get "scss/main.scss" | toCSS | minify | fingerprint }}

{{/* 时间格式化 */}}
{{ .Date | dateFormat "2006年01月02日" }}

{{/* 数字格式化 */}}
{{ .WordCount | lang.FormatNumber 0 }}
```

### 管道传参位置

管道中，上一步结果默认作为**最后一个参数**传入：

```go
{{/* truncate 的签名是 truncate maxlen [ellipsis] input */}}
{{/* 管道传入的是最后的 input 参数 */}}
{{ .Summary | truncate 100 "..." }}

{{/* 等价于 */}}
{{ truncate 100 "..." .Summary }}
```

---

## 函数（Functions）

### 字符串函数

```go
{{ upper "hello" }}                        {{/* HELLO */}}
{{ lower "HELLO" }}                        {{/* hello */}}
{{ title "hello world" }}                  {{/* Hello World */}}
{{ humanize "my_field_name" }}             {{/* My field name */}}

{{ replace "a-b-c" "-" "/" }}             {{/* a/b/c */}}
{{ replaceRE "\\d+" "#" "abc123" }}       {{/* abc# */}}

{{ trim "  hello  " " " }}                {{/* hello */}}
{{ trimLeft "  hello" " " }}              {{/* hello */}}
{{ trimRight "hello  " " " }}             {{/* hello */}}
{{ trimPrefix "http://" "http://example.com" }}  {{/* example.com */}}
{{ trimSuffix ".md" "post.md" }}          {{/* post */}}

{{ hasPrefix "Hello" "He" }}              {{/* true */}}
{{ hasSuffix "Hello" "lo" }}              {{/* true */}}
{{ in "Hello World" "World" }}            {{/* true */}}
{{ strings.Contains "Hello" "ell" }}      {{/* true */}}

{{ split "a,b,c" "," }}                   {{/* [a b c] */}}
{{ delimit (slice "a" "b" "c") ", " " 和 " }}  {{/* a, b 和 c */}}

{{ len "Hello" }}                         {{/* 5 */}}
{{ substr "Hello World" 6 5 }}            {{/* World */}}

{{ printf "%-10s %5d" "name" 42 }}        {{/* name          42 */}}
{{ printf "%.2f" 3.14159 }}               {{/* 3.14 */}}

{{ urlize "Hello World 你好" }}           {{/* hello-world-%E4%BD%A0%E5%A5%BD */}}
{{ anchorize "Go 模板语法" }}             {{/* go-模板语法 */}}

{{ markdownify "**bold** and *italic*" }} {{/* <strong>bold</strong> and <em>italic</em> */}}
{{ plainify "<p>Hello <b>World</b></p>" }} {{/* Hello World */}}
{{ htmlEscape "<script>" }}               {{/* &lt;script&gt; */}}
{{ htmlUnescape "&lt;script&gt;" }}       {{/* <script> */}}
```

### 数字函数

```go
{{ add 3 4 }}           {{/* 7 */}}
{{ sub 10 3 }}          {{/* 7 */}}
{{ mul 4 5 }}           {{/* 20 */}}
{{ div 10 3 }}          {{/* 3（整除）*/}}
{{ mod 10 3 }}          {{/* 1 */}}
{{ math.Round 3.7 }}    {{/* 4 */}}
{{ math.Floor 3.7 }}    {{/* 3 */}}
{{ math.Ceil 3.2 }}     {{/* 4 */}}
{{ math.Abs -5 }}       {{/* 5 */}}
{{ math.Max 3 5 }}      {{/* 5 */}}
{{ math.Min 3 5 }}      {{/* 3 */}}
{{ math.Sqrt 16 }}      {{/* 4 */}}
{{ math.Log 100 }}      {{/* 4.60517... */}}
{{ math.Pow 2 10 }}     {{/* 1024 */}}
```

### 集合函数

```go
{{/* 创建集合 */}}
{{ $s := slice "a" "b" "c" }}
{{ $m := dict "key1" "val1" "key2" "val2" }}

{{/* 集合操作 */}}
{{ len $s }}                          {{/* 3 */}}
{{ index $s 0 }}                      {{/* a（按索引取值）*/}}
{{ index $m "key1" }}                 {{/* val1（按 key 取值）*/}}

{{ first 2 $s }}                      {{/* [a b] */}}
{{ last 2 $s }}                       {{/* [b c] */}}
{{ after 1 $s }}                      {{/* [b c]（跳过前 N 个）*/}}

{{ append "d" $s }}                   {{/* [a b c d] */}}
{{ prepend "z" $s }}                  {{/* [z a b c] */}}
{{ uniq (slice "a" "b" "a" "c") }}    {{/* [a b c]（去重）*/}}
{{ reverse $s }}                      {{/* [c b a] */}}
{{ shuffle $s }}                      {{/* 随机打乱 */}}
{{ sort $s }}                         {{/* [a b c]（升序）*/}}
{{ sort $s "value" "desc" }}          {{/* 降序）*/}}

{{ in $s "b" }}                       {{/* true */}}
{{ intersect (slice "a" "b") (slice "b" "c") }}   {{/* [b] */}}
{{ complement (slice "b" "c") (slice "a" "b" "c" "d") }}  {{/* [a d] */}}
{{ symdiff (slice "a" "b") (slice "b" "c") }}     {{/* [a c] */}}

{{/* where 过滤 */}}
{{ where .Site.RegularPages "Type" "posts" }}
{{ where .Site.RegularPages "Params.featured" true }}
{{ where .Site.RegularPages "Params.tags" "intersect" (slice "Go" "Hugo") }}
{{ where .Site.RegularPages "Date" "gt" (now.AddDate -1 0 0) }}
```

### 时间函数

```go
{{/* 时间格式化（Go 的参考时间：Mon Jan 2 15:04:05 MST 2006）*/}}
{{ .Date.Format "2006-01-02" }}               {{/* 2026-03-25 */}}
{{ .Date.Format "2006年01月02日" }}            {{/* 2026年03月25日 */}}
{{ .Date.Format "January 2, 2006" }}          {{/* March 25, 2026 */}}
{{ .Date.Format "2006-01-02 15:04:05" }}      {{/* 2026-03-25 09:52:35 */}}
{{ .Date.Format "Mon, 02 Jan 2006 15:04:05 MST" }}  {{/* RFC1123 */}}
{{ .Date.Format "2006-01-02T15:04:05Z07:00" }} {{/* RFC3339/ISO 8601 */}}

{{/* 时间操作 */}}
{{ $now := now }}
{{ $future := $now.AddDate 0 1 0 }}            {{/* 一个月后 */}}
{{ $past := $now.Add (mul -24 (mul 60 (mul 60 1000000000))) }}  {{/* 24小时前 */}}

{{/* 时间比较 */}}
{{ if .Date.Before now }}已过期{{ end }}
{{ if .Date.After now }}未来日期{{ end }}
{{ $diff := now.Sub .Date }}                    {{/* 时间差 */}}

{{/* Unix 时间戳 */}}
{{ .Date.Unix }}
{{ (time "2026-01-01").Unix }}
```

**Go 时间格式参考表：**

| 占位符 | 含义 | 示例 |
|--------|------|------|
| `2006` | 年份（4位） | 2026 |
| `06` | 年份（2位） | 26 |
| `01` | 月份（2位数字） | 03 |
| `1` | 月份（不补零） | 3 |
| `January` | 月份（英文全称） | March |
| `Jan` | 月份（英文缩写） | Mar |
| `02` | 日期（2位数字） | 25 |
| `2` | 日期（不补零） | 25 |
| `Monday` | 星期（英文全称） | Wednesday |
| `Mon` | 星期（英文缩写） | Wed |
| `15` | 小时（24小时制） | 09 |
| `3` | 小时（12小时制） | 9 |
| `04` | 分钟 | 52 |
| `05` | 秒 | 35 |
| `PM` | 上下午 | AM |
| `MST` | 时区名称 | CST |
| `07:00` | 时区偏移 | +08:00 |

### 路径与 URL 函数

```go
{{/* URL 操作 */}}
{{ .Permalink }}                          {{/* 完整 URL */}}
{{ .RelPermalink }}                       {{/* 相对路径 */}}
{{ absURL "/images/logo.png" }}           {{/* https://example.com/images/logo.png */}}
{{ relURL "/about" }}                     {{/* /about */}}
{{ absLangURL "/posts" }}                 {{/* https://example.com/zh/posts */}}
{{ relLangURL "/posts" }}                 {{/* /zh/posts */}}

{{/* 路径操作 */}}
{{ path.Base "/a/b/c.html" }}             {{/* c.html */}}
{{ path.Dir "/a/b/c.html" }}              {{/* /a/b */}}
{{ path.Ext "/a/b/c.html" }}              {{/* .html */}}
{{ path.Join "a" "b" "c.html" }}          {{/* a/b/c.html */}}
{{ path.Clean "/a//b/../c/" }}            {{/* /a/c */}}
```

### 类型转换函数

```go
{{ string 42 }}                           {{/* "42" */}}
{{ int "42" }}                            {{/* 42 */}}
{{ float "3.14" }}                        {{/* 3.14 */}}
{{ bool "true" }}                         {{/* true */}}

{{ printf "%v" .Params.count }}           {{/* 强制转字符串输出 */}}

{{/* JSON 序列化 */}}
{{ .Params | jsonify }}
{{ .Params | jsonify (dict "indent" "  ") }}
```

### 条件返回函数

```go
{{/* default：值为空时返回默认值 */}}
{{ .Params.author | default "匿名" }}
{{ .Params.limit | default 10 }}

{{/* cond：三元运算 */}}
{{ cond .Draft "草稿" "已发布" }}
{{ cond (gt .WordCount 1000) "长文" "短文" }}

{{/* coalesce：返回第一个非空值 */}}
{{ coalesce .Params.description .Summary .Title }}
```

---

## `define` 与 `block` — 模板继承

这是 Hugo 模板系统实现页面骨架的核心机制。

### `baseof.html` 定义骨架

```html
{{/* layouts/_default/baseof.html */}}
<!DOCTYPE html>
<html>
<head>
  {{- block "head" . -}}
    <title>{{ block "title" . }}{{ .Site.Title }}{{ end }}</title>
  {{- end -}}
</head>
<body class="{{ block "bodyClass" . }}page{{ end }}">
  {{ block "header" . }}{{ partial "header.html" . }}{{ end }}

  <main>
    {{- block "main" . }}{{- end }}
  </main>

  {{ block "footer" . }}{{ partial "footer.html" . }}{{ end }}
  {{- block "scripts" . }}{{- end }}
</body>
</html>
```

### 子模板填充插槽

```html
{{/* layouts/_default/single.html */}}
{{ define "title" }}{{ .Title }} | {{ .Site.Title }}{{ end }}

{{ define "bodyClass" }}single-page{{ end }}

{{ define "head" }}
  {{- partial "seo.html" . -}}
{{ end }}

{{ define "main" }}
<article>
  <h1>{{ .Title }}</h1>
  {{ .Content }}
</article>
{{ end }}

{{ define "scripts" }}
<script src="/js/prism.js"></script>
{{ end }}
```

---

## `partial` — 局部模板

### 基础调用

```go
{{/* 传递整个 page 上下文 */}}
{{ partial "header.html" . }}

{{/* 传递自定义 map */}}
{{ partial "card.html" (dict
  "page" .
  "showCover" true
  "showTags" true
  "truncate" 150
) }}

{{/* 在 partial 内接收 */}}
{{/* layouts/partials/card.html */}}
{{ $page := .page }}
{{ $showCover := .showCover | default false }}
{{ $truncate := .truncate | default 200 }}

{{ if $showCover }}
  {{ with $page.Params.cover }}
    <img src="{{ . }}">
  {{ end }}
{{ end }}
<h2><a href="{{ $page.Permalink }}">{{ $page.Title }}</a></h2>
<p>{{ $page.Summary | truncate $truncate }}</p>
```

### `partialCached` — 缓存优化

对于不依赖当前页面的 partial，使用缓存可以大幅提升构建速度：

```go
{{/* 基础缓存（相同 partial 只渲染一次）*/}}
{{ partialCached "sidebar.html" . }}

{{/* 按 key 分组缓存（相同 key 只渲染一次）*/}}
{{ partialCached "nav.html" . .Section }}
{{ partialCached "sidebar.html" . .Lang .Section }}

{{/* 永远不应缓存包含当前页面特有数据的 partial */}}
{{ partial "breadcrumb.html" . }}  {{/* 每页不同，不缓存 */}}
```

---

## `template` — 调用命名模板

```go
{{/* 定义命名模板 */}}
{{ define "article-card" }}
<article>
  <h2><a href="{{ .Permalink }}">{{ .Title }}</a></h2>
  <time>{{ .Date.Format "2006-01-02" }}</time>
</article>
{{ end }}

{{/* 调用命名模板 */}}
{{ range .Pages }}
  {{ template "article-card" . }}
{{ end }}

{{/* 调用 Hugo 内置模板 */}}
{{ template "_internal/pagination.html" . }}
{{ template "_internal/opengraph.html" . }}
{{ template "_internal/google_analytics.html" . }}
```

---

## 高级技巧

### 创建 `dict` 动态传参

```go
{{/* 构建 dict 并传递给 partial */}}
{{ $ctx := dict
    "site"    .Site
    "page"    .
    "section" .Section
    "lang"    .Lang
}}
{{ partial "complex-widget.html" $ctx }}

{{/* 合并两个 dict（Hugo 0.96+）*/}}
{{ $base := dict "color" "blue" "size" "large" }}
{{ $extra := dict "color" "red" "weight" "bold" }}
{{ $merged := merge $base $extra }}
{{/* 结果：color=red, size=large, weight=bold */}}
```

### 动态调用 Partial

```go
{{/* 根据内容类型动态选择 partial */}}
{{ $template := printf "partials/type-%s.html" .Type }}
{{ partial $template . }}

{{/* 根据参数动态选择 shortcode 样式 */}}
{{ $style := .Params.style | default "default" }}
{{ partial (printf "cards/%s.html" $style) . }}
```

### 递归模板（构建树形菜单）

```go
{{/* layouts/partials/menu.html */}}
<ul>
  {{ range . }}
  <li>
    <a href="{{ .URL }}">{{ .Name }}</a>
    {{ if .HasChildren }}
      {{ partial "menu.html" .Children }}   {{/* 递归调用 */}}
    {{ end }}
  </li>
  {{ end }}
</ul>

{{/* 调用 */}}
{{ partial "menu.html" .Site.Menus.main }}
```

### `scratch` — 跨作用域通信

Hugo 的 `Scratch` 是一个附加在 Page 上的键值存储，用于在模板中传递数据：

```go
{{/* 写入 */}}
{{ .Scratch.Set "totalWords" 0 }}
{{ .Scratch.Add "totalWords" .WordCount }}

{{ range .Pages }}
  {{ $.Scratch.Add "totalWords" .WordCount }}
{{ end }}

{{/* 读取 */}}
<p>总字数：{{ .Scratch.Get "totalWords" }}</p>

{{/* 删除 */}}
{{ .Scratch.Delete "totalWords" }}

{{/* newScratch：创建局部 scratch，不污染 page */}}
{{ $s := newScratch }}
{{ $s.Set "count" 0 }}
```

### `hugo.IsServer` — 区分开发/生产

```go
{{/* 只在生产环境加载 Analytics */}}
{{ if not hugo.IsServer }}
  {{ template "_internal/google_analytics.html" . }}
{{ end }}

{{/* 只在开发环境显示调试信息 */}}
{{ if hugo.IsServer }}
  <div class="debug">
    Type: {{ .Type }} | Layout: {{ .Layout }} | Kind: {{ .Kind }}
  </div>
{{ end }}
```

### `printf` 调试输出

```go
{{/* 输出任意变量的完整结构（调试用）*/}}
{{ printf "%#v" .Params }}
{{ printf "%T" .Date }}      {{/* 输出类型名 */}}
{{ printf "%v" .WordCount }}

{{/* 用 warnf 在构建时输出警告 */}}
{{ warnf "页面 %s 缺少封面图" .Title }}

{{/* errorf 会中止构建 */}}
{{ if not .Params.author }}
  {{ errorf "文章 %s 必须设置 author 字段" .File.Path }}
{{ end }}
```

---

## 完整实战示例

下面是一个综合运用上述语法的 `single.html` 完整模板：

```html
{{ define "title" }}{{ .Title }} · {{ .Site.Title }}{{ end }}

{{ define "main" }}

{{/* 1. 声明变量 */}}
{{ $readingTime := .ReadingTime }}
{{ $wordCount := .WordCount }}
{{ $isLongRead := gt $wordCount 2000 }}

<article class="post{{ if $isLongRead }} post--long{{ end }}">

  {{/* 2. 文章头部 */}}
  <header class="post__header">
    <h1 class="post__title">{{ .Title }}</h1>

    {{/* 3. 副标题（with 检查）*/}}
    {{ with .Params.subtitle }}
      <p class="post__subtitle">{{ . }}</p>
    {{ end }}

    {{/* 4. 元信息 */}}
    <div class="post__meta">
      <time datetime="{{ .Date.Format "2006-01-02T15:04:05Z07:00" }}">
        {{- .Date.Format "2006年01月02日" -}}
      </time>
      <span>·</span>
      <span>{{ $readingTime }} 分钟阅读</span>
      <span>·</span>
      <span>{{ $wordCount | lang.FormatNumber 0 }} 字</span>

      {{/* 5. 作者信息（with + 条件）*/}}
      {{ with .Params.author }}
        <span>· {{ . }}</span>
      {{ end }}

      {{/* 6. 草稿标识 */}}
      {{ if .Draft }}
        <span class="badge badge--draft">草稿</span>
      {{ end }}
    </div>

    {{/* 7. 封面图 */}}
    {{ with .Params.cover }}
      <figure class="post__cover">
        <img src="{{ .image | absURL }}"
             alt="{{ .alt | default $.Title }}"
             {{ with .width }}width="{{ . }}"{{ end }}>
        {{ with .caption }}
          <figcaption>{{ . | markdownify }}</figcaption>
        {{ end }}
      </figure>
    {{ end }}
  </header>

  {{/* 8. 目录（条件显示）*/}}
  {{ if and .Params.toc (gt (len .TableOfContents) 100) }}
    <nav class="toc">
      <h2>目录</h2>
      {{ .TableOfContents }}
    </nav>
  {{ end }}

  {{/* 9. 正文 */}}
  <div class="post__content">
    {{ .Content }}
  </div>

  {{/* 10. 标签列表（range）*/}}
  {{ with .Params.tags }}
  <footer class="post__tags">
    <span>标签：</span>
    {{ range $i, $tag := . }}
      {{- if $i }}, {{ end -}}
      <a href="{{ "/tags/" | relLangURL }}{{ $tag | urlize }}">{{ $tag }}</a>
    {{- end }}
  </footer>
  {{ end }}

  {{/* 11. 相关文章（where + first）*/}}
  {{ $related := .Site.RegularPages.Related . | first 3 }}
  {{ with $related }}
  <section class="related-posts">
    <h2>相关文章</h2>
    <ul>
      {{ range . }}
      <li>
        <a href="{{ .Permalink }}">{{ .Title }}</a>
        <time>{{ .Date.Format "2006-01-02" }}</time>
      </li>
      {{ end }}
    </ul>
  </section>
  {{ end }}

  {{/* 12. 上下篇导航 */}}
  <nav class="post__nav">
    {{ with .PrevInSection }}
      <a class="post__nav-prev" href="{{ .Permalink }}">
        ← {{ .Title }}
      </a>
    {{ end }}
    {{ with .NextInSection }}
      <a class="post__nav-next" href="{{ .Permalink }}">
        {{ .Title }} →
      </a>
    {{ end }}
  </nav>

</article>
{{ end }}
```

---

## 语法速查表

### 基础动作

| 语法 | 说明 |
|------|------|
| `{{ .Field }}` | 输出字段值 |
| `{{ $var := value }}` | 声明变量 |
| `{{ $var = value }}` | 修改变量 |
| `{{/* 注释 */}}` | 模板注释 |
| `{{- ... -}}` | 去除空白 |
| `{{ . }}` | 当前上下文 |
| `{{ $ }}` | 根上下文 |

### 控制流

| 语法 | 说明 |
|------|------|
| `{{ if }}...{{ end }}` | 条件判断 |
| `{{ if }}...{{ else if }}...{{ else }}...{{ end }}` | 多分支 |
| `{{ with }}...{{ end }}` | 存在性检查 + 上下文切换 |
| `{{ range }}...{{ end }}` | 循环遍历 |
| `{{ range $i, $v := }}` | 带索引循环 |
| `{{ block "name" . }}...{{ end }}` | 定义可覆盖插槽 |
| `{{ define "name" }}...{{ end }}` | 填充插槽 |

### 常用比较函数

| 函数 | 符号等价 |
|------|---------|
| `eq a b` | `a == b` |
| `ne a b` | `a != b` |
| `lt a b` | `a < b` |
| `le a b` | `a <= b` |
| `gt a b` | `a > b` |
| `ge a b` | `a >= b` |
| `and a b` | `a && b` |
| `or a b` | `a \|\| b` |
| `not a` | `!a` |

---

## 总结

Go 模板语法设计简洁，但组合起来极具表达力。核心要点：

- **`.` 是当前上下文**，会在 `range`/`with` 内发生变化，用 `$` 访问根上下文
- **管道 `|` 是串联函数的利器**，让代码简洁易读
- **`with` 优于 `if`**，存在性检查同时自动切换上下文
- **变量作用域以块为界**，在块内修改外部变量用 `=` 而非 `:=`
- **模板查找遵循从具体到通用**，合理利用可灵活覆盖主题

---

*本文生成时间：2026-03-25 09:52:35 CST*
