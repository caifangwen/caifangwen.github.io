---
title: "RankMath 常规设置（General Settings）完整配置指南"
date: 2026-03-23T20:33:36+08:00
lastmod: 2026-03-23T20:33:36+08:00
draft: false
description: "RankMath 常规设置各板块完整说明，包括链接、面包屑、图片、站长工具、robots.txt、llms.txt、Blocks、其他设置、WooCommerce、.htaccess、404监控、重定向、分析及Content AI，附最佳实践建议。"
tags: ["SEO", "RankMath", "WordPress", "常规设置", "插件配置"]
categories: ["SEO工具"]
author: "Claude"
weight: 2
toc: true
---

> **路径**：WordPress 后台 → RankMath SEO → 常规设置（General Settings）
>
> **提示**：部分选项仅在**高级模式（Advanced Mode）**下可见。如果找不到某个设置，请先到 RankMath → 仪表盘右上角切换为高级模式。

---

## 一、链接（Links）

链接板块控制网站上所有链接的行为，是影响 SEO 权重分配的重要配置。

### 1.1 去除分类前缀（Strip Category Base）

- **默认状态**：关闭
- **作用**：开启后，WordPress 分类归档 URL 中的 `/category/` 前缀会被移除

| 状态 | URL 示例 |
|------|---------|
| 关闭（默认） | `https://example.com/category/seo/` |
| 开启 | `https://example.com/seo/` |

- **建议**：如果追求简洁 URL 可以开启，但需注意：**开启前确保没有和页面/文章 slug 冲突**，否则会造成 404。若网站已运营一段时间，开启后务必检查旧链接是否有 301 跳转。

---

### 1.2 重定向附件页面（Redirect Attachments）

- **默认状态**：关闭
- **建议**：**开启** ✅
- **作用**：将 WordPress 自动生成的附件页面（如 `example.com/post-name/image-filename/`）301 重定向到其所属文章

**为什么要开启**：附件页面内容极少，几乎没有 SEO 价值，却会分散爬虫资源。开启后，该附件积累的外部链接权重会传递给所属文章。

> **注意**：开启此选项后，`Titles & Meta` 中的附件配置项会消失，这是正常现象。

---

### 1.3 重定向孤立附件（Redirect Orphan Attachments）

- **作用**：将没有关联到任何文章的附件页面，重定向到指定 URL
- **建议**：填入首页 URL（`https://example.com/`）
- **适用场景**：媒体库中有大量未关联文章的图片、文件时特别有用

---

### 1.4 外部链接添加 NoFollow（NoFollow External Links）

- **默认状态**：关闭
- **建议**：**保持关闭** — 外部链接本身对 Google 有引用价值，全部 nofollow 会损失 SEO 信号
- **例外情况**：若网站以联盟营销为主，外链几乎全是付费/赞助链接，可以开启，然后用白名单（NoFollow Exclude Domains）放行可信站点

**三个选项的联动逻辑**：

```
NoFollow External Links = 关闭
→ 所有外链默认 follow（NoFollow Domains 和 Exclude Domains 均无效）

NoFollow External Links = 开启 + NoFollow Domains 为空
→ 所有外链 nofollow，Exclude Domains 中的域名例外（follow）

NoFollow External Links = 开启 + NoFollow Domains 有值
→ 仅 NoFollow Domains 中列出的域名被 nofollow，其余 follow
→ 此时 Exclude Domains 无效
```

---

### 1.5 外部图片链接添加 NoFollow（NoFollow Image File Links）

- **建议**：**开启** ✅
- **作用**：自动对指向外部图片文件的链接添加 `rel="nofollow"`，避免将 SEO 权重传递给外部图片托管服务

---

### 1.6 NoFollow 域名黑名单（NoFollow Domains）

- **作用**：配合"外部链接添加 NoFollow"使用，列在此处的域名**一定**会被 nofollow
- **使用场景**：只想对特定联盟/广告域名 nofollow，其余外链保持 follow
- **填写格式**：每行一个域名，不含 `https://`，如 `amazon.com`

---

### 1.7 NoFollow 域名白名单（NoFollow Exclude Domains）

- **作用**：配合"外部链接添加 NoFollow"使用，列在此处的域名**不会**被 nofollow
- **使用场景**：全站开启 nofollow 后，对信任的合作伙伴/权威来源保持 follow
- **注意**：黑名单和白名单不能同时生效，二者选其一

---

### 1.8 外部链接在新标签页打开（Open External Links in New Tab）

- **建议**：**开启** ✅
- **作用**：自动为所有外部链接添加 `target="_blank"` 属性，用户点击后在新标签页打开，不离开当前页面
- **技术细节**：属性是动态添加在前端的，**不修改数据库中的内容**，随时可以关闭恢复

---

### 1.9 联盟链接前缀（Affiliate Link Prefix）【Pro 功能】

- **作用**：告诉 RankMath 哪个 URL 路径是联盟伪链接（如 `/go/`、`/recommends/`），系统会将其识别为外链，并自动添加 `rel="sponsored"` 属性
- **填写示例**：如果联盟链接格式为 `example.com/go/amazon`，则填写 `/go/`
- **符合 Google 指南**：sponsored 标签是 Google 官方认可的联盟链接标记方式

---

## 二、面包屑导航（Breadcrumbs）

> **仅高级模式可见完整选项**

面包屑是网站导航辅助元素，格式通常为：`首页 > 分类 > 当前页面`，同时也是 Google 富结果（Rich Results）的来源之一。

### 2.1 启用面包屑功能（Enable Breadcrumbs Function）

- **建议**：**开启** ✅
- 开启后还需要在主题模板中调用以下代码才能显示：

```php
<?php if ( function_exists( 'rank_math_the_breadcrumbs' ) ) rank_math_the_breadcrumbs(); ?>
```

或使用短代码：`[rank_math_breadcrumb]`

> **注意**：若主题自带面包屑，需先联系主题开发者关闭，避免重复显示。

---

### 2.2 分隔符（Separator Character）

- 常用选项：`/`、`>`、`»`、`·`
- 也可自定义字符
- **建议**：使用 `>` 或 `»`，视觉上清晰，符合主流网站习惯

---

### 2.3 显示首页链接（Show Homepage Link）

- **建议**：**开启** ✅
- 开启后面包屑第一项会链接到首页

---

### 2.4 首页标签文字（Homepage Label）

- 默认值：`Home`
- 中文网站建议改为：**首页**

---

### 2.5 首页自定义 URL（Homepage Link Custom URL）

- 默认使用 WordPress 设置的首页 URL
- 特殊情况（如多语言网站根目录不同）可在此自定义

---

### 2.6 前缀文字（Breadcrumbs Prefix）

- 在面包屑整体前方添加文字，如：`您的位置：`
- 大多数网站留空即可

---

### 2.7 归档页面格式（Archive Format）

- 默认：`%s 的归档`（`%s` 代表分类/标签名称）
- 可自定义，建议保留 `%s` 占位符

---

### 2.8 搜索结果页格式（Search Results Format）

- 默认：`搜索：%s`
- 可自定义，如：`您搜索了：%s`

---

### 2.9 404 页面格式（404 Error Format）

- 默认：`错误 404`
- 可自定义

---

### 2.10 隐藏文章标题（Hide Post Title）

- **默认**：关闭
- 开启后，面包屑最后一项（当前文章标题）会被隐藏，只显示到分类层级
- 大多数网站**保持关闭**

---

### 2.11 显示上级分类（Show Ancestors Categories）

- **建议**：**开启** ✅
- 作用：若文章属于子分类，面包屑会显示完整的父分类层级
- 示例：`首页 > 教程 > SEO工具 > RankMath 配置指南`

---

### 2.12 隐藏分类名称（Hide Taxonomy Name）

- **建议**：关闭（RankMath 官方推荐）
- 开启后，分类名称在面包屑中不显示

---

### 2.13 显示博客页面（Show Blog Page）

- 一般不需要，保持关闭即可

---

## 三、图片（Images）

> **此板块仅在 Pro 版本中显示完整功能**

### 3.1 自动添加 Alt 文本（Add Missing Alt Text）

- **建议**：**谨慎使用**
- 作用：对没有 Alt 文本的图片，自动使用文章标题或文件名填充
- **缺点**：自动填充的 Alt 文本往往不够准确，不如手动撰写描述性 Alt 文本
- 若图片文件命名规范（如 `rankmath-general-settings.jpg`），可以考虑开启

### 3.2 自动添加 Title 属性（Add Missing Title）

- **建议**：**关闭**，同上，手动添加更准确

---

## 四、站长工具验证（Webmaster Tools）

在此粘贴各搜索引擎提供的网站验证代码（HTML Meta 标签中的 `content` 值）。

| 平台 | 如何获取验证码 |
|------|--------------|
| **Google Search Console** | GSC → 添加资产 → HTML 标记 → 复制 `content=""` 内的字符串 |
| **Bing Webmaster Tools** | Bing 站长工具 → 添加网站 → XML 文件验证或 Meta 标签验证 |
| **百度搜索资源平台** | 百度站长 → 用户中心 → 验证网站 → HTML 标签 |
| **Pinterest** | Pinterest → 申请认证 → 复制验证 meta 标签的 content 值 |
| **Yandex**（高级模式） | Yandex Webmaster → 添加网站 → Meta 标签 |
| **Norton Safe Web**（高级模式） | Norton 管理后台获取 |

**操作步骤（以 Google 为例）**：

1. 前往 [Google Search Console](https://search.google.com/search-console)
2. 添加资产 → URL 前缀 → 输入网站地址
3. 选择验证方式 → HTML 标记
4. 复制 `<meta name="google-site-verification" content="XXXXXX" />` 中的 `XXXXXX`
5. 粘贴到 RankMath → 常规设置 → 站长工具 → Google 搜索控制台字段
6. 保存后返回 GSC 点击验证

---

## 五、编辑 robots.txt

> **仅高级模式可见**

robots.txt 是告诉搜索引擎爬虫哪些页面可以/不可以抓取的文件。

### 默认内容（建议保留）

```
User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php

Sitemap: https://example.com/sitemap_index.xml
```

### 常见追加规则

```
# 禁止爬取搜索结果页
Disallow: /?s=

# 禁止爬取后台 wp-includes
Disallow: /wp-includes/

# 禁止爬取上传目录（如不需要图片收录）
# Disallow: /wp-content/uploads/
```

> **重要**：如果服务器根目录已存在真实的 `robots.txt` 文件，RankMath 中的修改**不会生效**。需要先通过 FTP 删除服务器上的 `robots.txt`，或直接在服务器上编辑该文件。

---

## 六、编辑 llms.txt

> **新功能，需要在仪表盘先启用 LLMS Txt 模块，且仅高级模式可见**

`llms.txt` 是一个新兴标准文件，作用类似 robots.txt，但专门面向 AI 大模型（如 ChatGPT、Claude、Perplexity）。

### 作用

- 告诉 AI 爬虫/索引器网站的核心内容结构
- 帮助 AI 工具更准确地理解和引用你的网站内容
- 提升在 AI 搜索（如 ChatGPT Search、Perplexity）中的可见度

### 配置建议

- 列出核心页面 URL 及简要描述
- 文件访问地址：`https://example.com/llms.txt`
- 目前此标准仍处于早期阶段，但建议提前配置

---

## 七、Blocks（区块设置）

> **需要先在仪表盘启用 Schema（结构化数据）模块才能看到此板块**

### 7.1 目录标题（Table of Contents Title）

- 设置 RankMath 目录区块（TOC Block）的默认标题文字
- 默认：`Table of Contents`
- 中文网站建议改为：**目录** 或 **文章目录**

### 7.2 FAQ 区块标题标签（FAQ Block Title Tag）

- 设置 FAQ 区块中问题使用的 HTML 标签（`h2`～`h6` 或 `div`）
- **建议**：使用 `h3`，与文章内容层级协调

### 7.3 HowTo 区块步骤标题标签（HowTo Block Step Title Tag）

- 同上，建议 `h3` 或 `h4`

---

## 八、其他设置（Others）

> **仅高级模式可见**

### 8.1 向访问者显示 SEO 评分（Show SEO Score to Visitors）

- **建议**：**关闭**
- 作用：在前端文章中显示 RankMath 的 SEO 评分标识
- 对大多数网站来说无实际用处，关闭即可

### 8.2 选择 SEO 评分显示位置

- 仅在上一项开启时出现
- 可选：文章前、文章后、浮动按钮等

### 8.3 SEO 评分模板

- 自定义评分展示的 HTML 样式

### 8.4 使用外部链接标记（Link Suggestions）

- 编辑文章时，RankMath 会在侧边栏推荐内部链接建议
- **建议**：**开启** ✅，有助于增加内部链接

### 8.5 内容 AI 建议数量（Content AI Suggestions Count）【Pro】

- 设置 AI 关键词建议的显示数量

---

## 九、WooCommerce 设置

> **仅安装 WooCommerce 插件后显示**

### 9.1 移除 WooCommerce 默认 Generator 标签

- **建议**：**开启** ✅
- 隐藏 WooCommerce 版本信息，避免潜在安全风险

### 9.2 移除商店归档页的 Schema（Remove Generator Tag）

- 根据商店实际配置决定，一般保持默认

### 9.3 品牌分类法（Brand Taxonomy）

- 若使用了自定义品牌分类，在此选择对应的 Taxonomy
- 选择后 RankMath 会在产品的 Schema 和 OpenGraph 中自动带入品牌信息

### 9.4 自定义品牌名称

- 仅在"品牌分类法"选择"Custom"时出现
- 填入统一品牌名称

### 9.5 全局产品标识符（Global Identifier）

- 可选：GTIN、MPN、ISBN 等
- 如果所有产品都使用统一标识类型，可在此全局设置
- 对 Google Shopping 等富结果展示有帮助

---

## 十、编辑 .htaccess

> **仅高级模式可见，Apache 服务器适用，Nginx 无效**

`.htaccess` 是 Apache 服务器配置文件，控制 URL 重写、重定向、缓存等底层行为。

### 常见用途

```apache
# 强制 HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 强制 www（二选一）
RewriteCond %{HTTP_HOST} !^www\. [NC]
RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 强制非 www（二选一）
RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L]
```

> ⚠️ **警告**：`.htaccess` 编辑错误会导致网站 500 报错。修改前请**备份原文件**，建议优先在服务器控制面板（如 cPanel）中编辑，而非直接通过 RankMath。

---

## 十一、404 监控（404 Monitor）

### 11.1 启用 404 监控

- **建议**：**开启** ✅
- 作用：记录所有触发 404 的 URL 请求

### 11.2 监控日志模式（Log redirect hits）

可选择记录：
- 仅记录直接 404
- 记录所有 404（含已设重定向的）

### 11.3 清理旧日志

- 可设置自动清理天数，防止数据库过度膨胀
- **建议**：保留 30 天记录，定期人工处理高频 404

### 最佳实践

1. 每周检查一次 404 日志
2. 对有流量/外链的 404 URL 立即创建 301 重定向
3. 点击日志中的"添加重定向"可直接跳转到重定向配置页

---

## 十二、重定向（Redirections）

### 12.1 启用重定向模块

- **建议**：**开启** ✅

### 12.2 自动创建文章重定向（Auto Post Redirect）

- **建议**：**开启** ✅
- 作用：修改文章 URL 别名（slug）时，自动为旧 URL 创建 301 重定向
- **这是最重要的设置**，避免因改 URL 导致流量损失

### 12.3 重定向类型默认值

| 类型 | 代码 | 适用场景 |
|------|------|---------|
| 永久重定向 | 301 | URL 永久迁移（最常用）|
| 临时重定向 | 302 | 临时维护、A/B 测试 |
| 临时重定向 | 307 | 严格临时（保留请求方法）|
| 跳转到页面 | 410 | 内容已永久删除 |
| 不可用 | 451 | 因法律原因不可访问 |

- **默认建议**：选 **301**

### 12.4 重定向流量来源日志

- 开启后记录每条重定向的触发次数
- 有助于分析哪些旧 URL 还有流量，决定是否保留重定向规则

### 避免重定向链

不要让 A→B→C，直接设置 A→C。RankMath 提供检测功能，可以发现链式重定向并合并。

---

## 十三、分析（Analytics）

> **需要连接 Google 账户**

### 13.1 连接 Google 服务

依次完成以下授权：

1. **Google Search Console**：获取关键词排名、点击量、展示量、CTR 数据
2. **Google Analytics 4**：获取用户行为、流量来源数据
3. **AdSense**（可选）：查看广告收入数据

点击"连接 Google 服务"按钮，按授权流程操作即可。

### 13.2 Search Console 网站资产

连接后选择对应的 GSC 资产（注意 www 和非 www 对应的资产不同）。

### 13.3 Analytics 视图 / 数据流

选择对应的 GA4 数据流 ID。

### 13.4 邮件报告（Email Reports）【Pro】

- 可设置每周/每月自动发送 SEO 报告到指定邮箱
- 适合向客户或团队汇报网站 SEO 表现

### 13.5 关于数据库性能

如果网站流量较大（日 PV 万级以上），开启分析模块会持续写入数据库，可能造成数据库膨胀。可以：

- 定期在 `RankMath → 状态与工具 → 数据库工具` 中清理历史数据
- 或直接在 Google Search Console / GA4 查看数据，关闭此模块

---

## 十四、Content AI（内容 AI）

> **Pro 功能，免费版有有限积分**

### 14.1 Content AI 积分

- 免费版每月赠送 **750 积分**（2026 年数据，以实际为准）
- Pro 版根据套餐有更多积分
- 积分用于：关键词研究、竞争对手分析、AI 内容建议等

### 14.2 主要功能

- **关键词建议**：输入焦点关键词后，AI 给出相关语义关键词列表
- **问题建议**：展示搜索该关键词时用户常问的问题（可用于 FAQ Schema）
- **链接建议**：推荐相关内链机会
- **内容评分提升**：基于 AI 分析，给出具体优化建议（如"在正文加入 X 关键词"）

### 14.3 配置建议

在常规设置中可设置 Content AI 建议的触发条件和显示数量，一般保持默认即可。

---

## 十五、播客（Podcast）

> **Pro 功能，仅在播客网站使用**

### 15.1 启用播客功能

若网站发布播客内容，开启此模块后 RankMath 会自动为播客内容生成 `PodcastSeries` 和 `PodcastEpisode` Schema 标记，有助于在 Google Podcasts 等平台获得富结果展示。

### 15.2 RSS Feed 配置

- 设置播客专属 RSS Feed URL
- 可在此填写默认主播信息、语言、分类等

---

## 附录：常规设置快速配置清单

以下是博客/内容网站的推荐配置：

| 设置项 | 建议值 |
|--------|-------|
| 去除分类前缀 | 按需（新站建议开启，老站谨慎）|
| 重定向附件页面 | ✅ 开启 |
| 重定向孤立附件 | 填入首页 URL |
| 外部链接 NoFollow | ❌ 关闭（除非全站联盟）|
| 外部图片链接 NoFollow | ✅ 开启 |
| 外部链接新标签打开 | ✅ 开启 |
| 启用面包屑 | ✅ 开启（需主题配合）|
| 面包屑分隔符 | `>` 或 `»` |
| 显示上级分类 | ✅ 开启 |
| 首页标签 | 首页 |
| Google 站长工具 | 填入验证码 |
| Bing 站长工具 | 填入验证码 |
| 404 监控 | ✅ 开启 |
| 自动文章重定向 | ✅ 开启 |
| 默认重定向类型 | 301 |
| 连接 GSC | ✅ 连接 |
| 图片自动 Alt | ❌ 关闭（手动填写更佳）|
