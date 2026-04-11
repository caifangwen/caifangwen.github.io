---
title: "Gutenberg vs 经典编辑器自定义 HTML 组件：深入对比分析"
slug: "gutenberg-vs-classic-editor-custom-html-components"
date: 2026-04-12T02:31:38+08:00
lastmod: 2026-04-12T02:31:38+08:00
draft: false
author: ""
description: "深入分析 WordPress Gutenberg 块编辑器与经典编辑器中直接编写自定义 HTML 组件的优势与劣势，涵盖开发体验、性能、维护性、编辑体验等多个维度。"
tags:
  - WordPress
  - Gutenberg
  - 块编辑器
  - 经典编辑器
  - 前端开发
  - Web开发
categories:
  - WordPress
  - 技术分析
keywords:
  - Gutenberg
  - WordPress 块编辑器
  - 经典编辑器
  - 自定义 HTML
  - WordPress 开发
  - 块开发
toc: true
---

## 前言

自 WordPress 5.0 于 2018 年引入 Gutenberg 块编辑器以来，开发者社区就一直在争论：对于需要高度定制化组件的项目，究竟应该拥抱 Gutenberg 的块开发模式，还是坚守经典编辑器中直接编写 HTML 的老路？

这不是一个非此即彼的问题，而是一个需要根据项目需求、团队能力、长期维护成本综合权衡的工程决策。本文将从**开发体验、编辑体验、性能、维护性、生态兼容性**五个维度进行深入对比。

---

## 背景：两种模式的本质差异

### Gutenberg 块开发模式

Gutenberg 将页面内容拆解为**独立的块（Block）**，每个块是一个 React 组件，拥有自己的 `edit`（编辑视图）和 `save`（存储结构）两个函数。块的元数据、属性（attributes）、样式均通过 `block.json` 和 JavaScript 注册，内容以序列化注释的形式存储于数据库。

```js
// 典型的 Gutenberg 块注册
registerBlockType('my-plugin/custom-card', {
    title: '自定义卡片',
    attributes: {
        title: { type: 'string' },
        imageUrl: { type: 'string' },
    },
    edit: ({ attributes, setAttributes }) => (
        <div className="custom-card">
            <TextControl
                value={attributes.title}
                onChange={(val) => setAttributes({ title: val })}
            />
        </div>
    ),
    save: ({ attributes }) => (
        <div className="custom-card">
            <h2>{attributes.title}</h2>
        </div>
    ),
});
```

### 经典编辑器 + 自定义 HTML 组件

在经典编辑器（TinyMCE）或直接使用 `wp_editor()` 的环境中，开发者通过 **Shortcode**、**PHP 模板片段**、或 **TinyMCE 自定义插件** 插入 HTML 结构。内容以原始 HTML 字符串存储于 `post_content` 字段。

```php
// 典型的 Shortcode 方式
add_shortcode('custom_card', function($atts) {
    $atts = shortcode_atts([
        'title' => '',
        'image' => '',
    ], $atts);
    return sprintf(
        '<div class="custom-card"><h2>%s</h2><img src="%s"/></div>',
        esc_html($atts['title']),
        esc_url($atts['image'])
    );
});
// 使用: [custom_card title="标题" image="https://..."]
```

---

## 维度一：开发体验

### Gutenberg 的优势

**1. 现代化的技术栈**

Gutenberg 基于 React + @wordpress/scripts 构建，开发者可以享受组件化开发、热重载、ESLint、现代 CSS 工具链等一切现代前端开发的便利。对于熟悉 React 生态的团队，上手成本极低。

**2. 强类型的属性系统**

`block.json` 中声明的 `attributes` 提供了类似 Schema 的约束，属性类型（string/number/boolean/array/object）在保存时会被序列化验证，减少数据污染的风险。

```json
{
    "attributes": {
        "alignment": {
            "type": "string",
            "enum": ["left", "center", "right"],
            "default": "left"
        }
    }
}
```

**3. 内置的 UI 组件库**

`@wordpress/components` 提供了大量现成的 UI 组件（`PanelBody`、`ColorPicker`、`MediaUpload` 等），无需从零搭建编辑界面，大幅节省开发 Inspector 面板的时间。

**4. 块变体与块模式**

通过 Block Variations 和 Block Patterns，可以快速基于已有块派生出新的预设，实现「配置即复用」，比传统 Shortcode 的参数组合更直观。

### Gutenberg 的劣势

**1. 陡峭的学习曲线**

Gutenberg 开发需要同时掌握：React、WordPress 数据层（`@wordpress/data`）、Block API 版本差异（v1/v2/v3）、`block.json` 规范、以及构建工具链（Webpack/`@wordpress/scripts`）。对于以 PHP 为主的 WordPress 开发者，这是一道不低的门槛。

**2. `save` 函数的版本锁定问题**

这是 Gutenberg 最令人头疼的设计之一。`save` 函数输出的 HTML 会被存储到数据库，一旦你修改了 `save` 函数的输出结构，所有使用该块的历史内容都会出现**「块验证失败（Block Validation Failed）」**错误，必须通过 `deprecated` API 手动维护历史版本。

```js
// 每次修改 save 结构，都需要添加 deprecated 条目
deprecated: [
    {
        attributes: oldAttributes,
        save: oldSaveFunction, // 必须保留旧版本以迁移历史内容
    },
],
```

这在长期维护的项目中会积累大量技术债。

**3. 动态块的复杂度**

为了规避 `save` 版本锁定，很多开发者选择使用**动态块（Dynamic Block）**——`save` 返回 `null`，完全由 PHP 的 `render_callback` 渲染。但这样一来，块的预览需要在编辑器中通过 `ServerSideRender` 组件发起 REST 请求实时渲染，带来额外的编辑器性能开销和开发复杂度。

**4. 本地开发环境依赖**

必须有 Node.js 环境和构建步骤（`npm run build`），无法像传统 WordPress 开发那样直接 FTP 上传 PHP 文件即生效。这对小型团队或非技术用户管理的站点是个障碍。

---

## 维度二：经典编辑器自定义 HTML 的优劣

### 优势

**1. 简单直接，零构建依赖**

Shortcode 和 PHP 模板是纯服务端逻辑，写完即生效，无需 Node.js、无需构建，部署流程极简。

**2. PHP 生态的天然融合**

自定义 HTML 组件可以直接调用 WordPress 的 PHP API（`get_post_meta()`、`WP_Query`、`apply_filters()` 等），无需绕道 REST API，逻辑实现更直接。

**3. 内容迁移风险低**

HTML 直接存储于 `post_content`，结构清晰，即使更换框架或 CMS，内容也能原样导出，不存在块反序列化的问题。

**4. 灵活的 HTML 输出控制**

PHP 模板对输出的 HTML 有完全控制权，可以在不同条件下输出完全不同的结构，无需受限于块属性的 Schema 约束。

### 劣势

**1. 编辑体验割裂**

编辑者在 TinyMCE 中看到的是 `[custom_card title="..."]` 这样的 Shortcode 占位符，而非真实预览。这要求编辑者记住所有 Shortcode 参数，且必须保存后才能看到最终效果，编辑体验极差。

**2. HTML 直接注入的安全风险**

若对 `post_content` 中的原始 HTML 处理不当，极易引入 XSS 漏洞。Shortcode 的输出也需要开发者自行做好 `esc_html()`、`esc_url()` 等转义，安全责任完全落在开发者一侧。

**3. 内容与样式强耦合**

HTML 结构硬编码在 PHP 模板或 Shortcode 输出中，当设计变更时，必须同步修改代码并重新部署，无法通过编辑界面调整结构。

**4. 复杂组件难以维护**

当组件嵌套层级增加（如含有子项列表的卡片组、含有多媒体的复杂布局），Shortcode 的嵌套语法（`[outer][inner /][/outer]`）会迅速变得难以阅读和维护。

**5. 与全站编辑（FSE）不兼容**

WordPress 的未来方向是**全站编辑（Full Site Editing, FSE）**，基于块的主题（Block Theme）已成为官方推荐。经典编辑器和 Shortcode 无法参与站点模板、页眉页脚、查询循环等 FSE 功能，技术上已处于边缘化轨道。

---

## 维度三：性能对比

### 前端渲染性能

| 指标 | Gutenberg（静态块） | Gutenberg（动态块） | 经典编辑器 + PHP |
|------|--------------------|--------------------|-----------------|
| 首字节时间（TTFB） | 低（纯 HTML 输出） | 中（PHP 渲染） | 低（纯 PHP 渲染） |
| 额外 JS 依赖 | 视块注册而定 | 视块注册而定 | 无（Shortcode 是纯服务端） |
| 可缓存性 | 高（静态 HTML） | 高（整页缓存） | 高 |
| 编辑器加载速度 | 较重（React 运行时） | 较重 | 轻（TinyMCE） |

Gutenberg 的前端输出本质上也是 HTML，前端性能与经典编辑器方案相差无几。真正的性能差异在**编辑器本身**：Gutenberg 加载了完整的 React 运行时和大量 JavaScript，在低端设备上的编辑体验明显逊于轻量的 TinyMCE。

### 数据库层面

Gutenberg 的块注释结构（`<!-- wp:my-plugin/custom-card {"title":"..."} -->`）使 `post_content` 字段体积略有增加，但对于典型内容量，这个差异可忽略不计。

---

## 维度四：维护性与可持续性

### 长期维护成本

**Gutenberg 的维护痛点**主要集中在：

- **`deprecated` 链的积累**：每次修改块结构都需要维护历史版本兼容，长期迭代后代码复杂度线性增长。
- **Block API 版本升级**：WordPress 核心对 Block API 的迭代（v1 → v2 → v3）偶尔带来 breaking changes，需要跟进升级。
- **依赖包版本管理**：`@wordpress/scripts`、`@wordpress/components` 等包的版本需要与 WordPress 核心对齐，版本漂移会引发隐性 Bug。

**经典编辑器的维护痛点**主要集中在：

- **Shortcode 参数文档缺失**：时间久了，没人记得某个 Shortcode 支持哪些参数，内容团队依赖不完善的文档或直接翻源码。
- **HTML 结构与 CSS 强耦合**：改版设计时，旧页面中硬编码的 HTML 结构可能与新 CSS 冲突，需要逐页检查和修复。
- **Classic Editor 插件的寿命问题**：WordPress 官方已明确经典编辑器插件仅维护至 2024 年底（后续视社区情况延续），长期依赖存在风险。

### 团队协作

Gutenberg 块的 React 组件结构更适合**代码审查和模块化测试**，每个块是独立的单元，边界清晰。而经典编辑器的 PHP 模板往往与主题逻辑混杂，测试和隔离难度更高。

---

## 维度五：编辑者使用体验

这是 Gutenberg 最显著的优势之一，也是它被引入的核心动机。

| 特性 | Gutenberg | 经典编辑器 + 自定义 HTML |
|------|-----------|------------------------|
| 所见即所得（WYSIWYG） | ✅ 块在编辑器中实时预览 | ❌ Shortcode 以占位符显示 |
| 拖拽排序 | ✅ 原生支持 | ❌ 需额外插件 |
| 块样式切换 | ✅ Block Styles 一键切换 | ❌ 需手动修改参数 |
| Inspector 面板 | ✅ 右侧面板可视化配置 | ❌ 需记忆 Shortcode 语法 |
| 复制/粘贴块 | ✅ 支持跨文章复制块 | ❌ 复制 Shortcode 字符串 |
| 学习门槛（编辑者视角） | 中等（需熟悉块界面） | 高（需记忆 Shortcode 语法） |

对于**内容团队**而言，Gutenberg 的体验远优于经典编辑器。但对于**技术背景强、使用简单固定模板的团队**，经典编辑器的「只需填几个字段」的简洁感也有其价值。

---

## 特殊场景分析

### 场景一：高度定制的着陆页（Landing Page）

**推荐：Gutenberg 动态块 + ACF Blocks**

着陆页通常包含大量视觉定制组件，编辑者需要频繁调整布局和内容。Gutenberg 的 WYSIWYG 体验和 ACF（Advanced Custom Fields）的块注册能力是绝佳组合，开发效率和编辑体验均优于 Shortcode。

### 场景二：技术文档或博客

**推荐：经典编辑器或 Gutenberg 核心块**

技术内容通常结构规整，以文字和代码块为主，不需要复杂的视觉组件。此场景下引入自定义块的收益有限，经典编辑器的 Markdown 输入工作流（配合相关插件）往往更高效。

### 场景三：多站点网络（Multisite）或 Headless WordPress

**推荐：Gutenberg 块 + REST API**

Gutenberg 块的 JSON 属性天然适合通过 REST API 消费，在 Headless 架构（WordPress 作为后端，Next.js/Nuxt 作为前端）中，块的结构化数据远比 Shortcode 字符串更易解析和渲染。

### 场景四：需快速交付的小型项目

**推荐：经典编辑器 + Shortcode**

对于工期紧、团队以 PHP 为主、后期几乎不维护的小型项目，Shortcode 方案的「零依赖、快速上线」特性仍然是实用的选择。

---

## 综合对比总结

| 维度 | Gutenberg 自定义块 | 经典编辑器自定义 HTML |
|------|-------------------|---------------------|
| 开发复杂度 | 高（React + 构建工具） | 低（纯 PHP） |
| 编辑体验 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 前端性能 | 相当 | 相当 |
| 维护长期成本 | 中（`deprecated` 链） | 中（HTML/CSS 耦合） |
| 内容迁移性 | 一般（块序列化依赖） | 好（原始 HTML） |
| 全站编辑兼容 | ✅ | ❌ |
| Headless 友好度 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 安全性 | 高（属性 Schema 约束） | 需手动转义 |
| 团队协作 | 好（组件化、可测试） | 一般（逻辑混杂） |
| 未来演进方向 | WordPress 官方路线 | 逐渐边缘化 |

---

## 结论与建议

选择 Gutenberg 还是经典编辑器自定义 HTML，本质上是在**短期开发成本**与**长期维护收益**之间做取舍。

**选择 Gutenberg，当你的项目满足以下条件：**

- 编辑团队需要频繁修改页面结构和内容
- 项目有长期迭代计划，或有可能演进为 Headless 架构
- 团队有 React 开发能力，或愿意投入学习成本
- 项目需要利用全站编辑（FSE）能力

**选择经典编辑器自定义 HTML，当：**

- 项目周期短，上线后几乎不维护
- 团队以 PHP 为主，无 JavaScript 构建能力
- 组件结构固定，不需要编辑者动态调整
- 需要最大化的内容迁移灵活性

**一个务实的建议**：对于新项目，优先选择 Gutenberg 路线——即便初期学习成本更高，随着 WordPress 全面转向块编辑器，这笔投资会在未来的维护和扩展中持续回报。对于已有大量经典编辑器内容的老项目，评估迁移成本后再决定是否切换，切忌为了「现代化」而进行低收益的大规模重构。

---

## 延伸阅读

- [WordPress Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [Block API Reference - Deprecated](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/)
- [ACF Blocks Documentation](https://www.advancedcustomfields.com/resources/blocks/)
- [Full Site Editing Overview](https://developer.wordpress.org/themes/block-themes/)
