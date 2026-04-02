---
title: "Hugo 社媒链接卡片 Section 生成提示词"
date: 2026-04-02T16:40:38+08:00
slug: "hugo-link-card-section-prompt"
draft: false
tags: ["Hugo", "Prompt", "Shortcode", "社媒"]
description: "一个专用提示词，帮助 AI 快速生成包含社媒链接卡片 Section 的 Hugo Markdown 文章，支持评论注释。"
---

## 提示词（复制后直接使用）

```
你是一个 Hugo 静态博客写作助手，擅长输出规范的 Hugo Markdown 文章。

## 任务

根据用户提供的主题和链接列表，输出一篇完整的 Hugo 格式 `.md` 文章。
文章中必须包含一个「链接卡片 Section」，用于展示外部链接（社交媒体帖子、文章、视频等），每张卡片可附带作者评论。

---

## 输出格式要求

### Front Matter
- 必须包含：title、date（使用用户提供的当前时间，格式 RFC3339）、slug（英文小写、连字符分隔，根据标题语义生成）、draft: false、tags、description
- 可选：cover image、categories

### 链接卡片 Section
使用以下 Shortcode 语法，每张卡片一个 `{{</* linkcard */>}}`，卡片之间可插入评论段落：

{{</* linkcard
  url="链接地址"
  title="卡片标题"
  desc="卡片描述（来自 OG description 或手动填写）"
  image="封面图 URL（可留空）"
  source="来源平台，如 Twitter / GitHub / YouTube"
*/>}}

> 💬 **我的评论**：在此填写对这条链接的看法、摘要或推荐理由。

---

### Section 结构示例

## 🔗 本周精选链接

_以下是我近期读到的值得一看的内容，附上简短点评。_

{{</* linkcard
  url="https://example.com/post-1"
  title="示例标题一"
  desc="这篇文章讲了 XXX，非常有启发性。"
  image="https://example.com/og.jpg"
  source="Medium"
*/>}}

> 💬 **我的评论**：这段话总结了作者的核心观点，我认为……

{{</* linkcard
  url="https://twitter.com/xxx/status/123"
  title="推文：关于 XXX 的思考"
  desc=""
  source="Twitter / X"
*/>}}

> 💬 **我的评论**：这条推文的观点很有意思，尤其是……

---

## 约束规则

1. slug 必须是英文，语义明确，不超过 6 个单词，用 `-` 连接
2. 每个 linkcard 后面的评论为可选，但推荐填写
3. image 字段：如果用户没有提供封面图，留空即可，不要捏造 URL
4. source 字段标注来源平台（Twitter/X、GitHub、YouTube、微博、即刻、少数派、Substack 等）
5. 文章正文可以在 Section 前后加入引言或总结段落，使文章更完整
6. 输出纯 Markdown，不要加任何额外解释，不要用代码块包裹整篇文章

---

## 用户输入

当前时间：{CURRENT_DATETIME}
文章主题 / 标题建议：{TOPIC}
链接列表：
{LINKS}

每条链接格式（至少提供 url，其余可选）：
- url: ...
  title: ...（可选，不填则留给 AI 根据 URL 推断）
  desc: ...（可选）
  image: ...（可选）
  comment: ...（可选，你对这条链接的评论）
```

---

## 使用方式

将上方提示词中的三个占位符替换后，发给任意 AI（Claude、GPT 等）：

| 占位符 | 替换内容 |
|--------|----------|
| `{CURRENT_DATETIME}` | 当前时间，如 `2026-04-02T16:40:38+08:00` |
| `{TOPIC}` | 文章主题，如「本周 AI 工具精选」 |
| `{LINKS}` | 你的链接列表 |

---

## 配套 Shortcode 模板

将以下内容保存为 `layouts/shortcodes/linkcard.html`，与提示词配套使用：

```html
{{ $url    := .Get "url" }}
{{ $title  := .Get "title" | default $url }}
{{ $desc   := .Get "desc"  | default "" }}
{{ $image  := .Get "image" | default "" }}
{{ $source := .Get "source" | default "" }}
{{ $host   := urls.Parse $url }}

<a href="{{ $url }}" target="_blank" rel="noopener noreferrer" class="link-card">
  {{ if $image }}
  <div class="link-card__thumb">
    <img src="{{ $image }}" alt="{{ $title }}" loading="lazy" />
  </div>
  {{ end }}
  <div class="link-card__body">
    <div class="link-card__title">{{ $title }}</div>
    {{ if $desc }}<div class="link-card__desc">{{ $desc }}</div>{{ end }}
    <div class="link-card__meta">
      {{ if $source }}<span class="link-card__source">{{ $source }}</span>{{ end }}
      <span class="link-card__host">{{ $host.Host }}</span>
    </div>
  </div>
  <div class="link-card__arrow">↗</div>
</a>
```

---

## 示例输出（AI 根据提示词生成）

以下是一篇由提示词生成的示例文章结构：

```markdown
---
title: "本周 AI 工具精选 #12"
date: 2026-04-02T16:40:38+08:00
slug: "ai-tools-weekly-12"
draft: false
tags: ["AI", "工具", "weekly"]
description: "本周精选的 AI 工具和文章，涵盖代码生成、图像处理和 Prompt 工程。"
---

这周读了不少东西，挑几个最值得看的分享出来。

## 🔗 本周精选

{{</* linkcard
  url="https://github.com/some/repo"
  title="SomeRepo - 一个很酷的开源工具"
  desc="用 Rust 编写的高性能 XXX 工具，支持……"
  image="https://opengraph.githubassets.com/xxx"
  source="GitHub"
*/>}}

> 💬 **我的评论**：这个项目解决了我长期以来的一个痛点，Star 数增长很快，值得关注。

{{</* linkcard
  url="https://x.com/someone/status/000"
  title="关于 LLM Prompt 缓存的一个有趣发现"
  desc=""
  source="Twitter / X"
*/>}}

> 💬 **我的评论**：作者发现在特定场景下 prompt cache 命中率可以提升 40%，思路很新颖。

---

今天就这些，下周继续。
```
