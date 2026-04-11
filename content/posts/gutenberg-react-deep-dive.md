---
title: "Gutenberg 中的 React：你用的不是「完整的 React」"
slug: "gutenberg-react-deep-dive"
date: 2026-04-12T02:45:28+08:00
lastmod: 2026-04-12T02:45:28+08:00
draft: false
description: "深入剖析 Gutenberg 块编辑器中 React 的角色、边界与限制。理解为何 Gutenberg 的 React 与你在 Next.js 或 CRA 中使用的 React 有本质差异，以及这些差异如何影响你的开发决策。"
tags:
  - WordPress
  - Gutenberg
  - React
  - 块编辑器
  - 前端开发
  - JavaScript
categories:
  - WordPress
  - 技术深度
keywords:
  - Gutenberg React
  - WordPress 块编辑器 React
  - @wordpress/element
  - edit save 函数
  - 动态块
  - 静态块
toc: true
---

## 前言：一个容易产生的误解

当你第一次看到 Gutenberg 的块开发文档，看到 `registerBlockType`、JSX、`useState`、`useEffect`，你很自然地会认为：「这就是 React 开发，我会 React，所以我会 Gutenberg。」

这个判断**部分正确，但暗藏陷阱**。

Gutenberg 确实运行在 React 之上，但它对 React 的使用方式受到了严格约束——这些约束不是 Bug，而是经过深思熟虑的架构决策。不理解这些约束，你会在开发中踩到一个又一个令人困惑的坑。

本文的目标是帮你建立一个准确的心智模型：**Gutenberg 中的 React 到底是什么，边界在哪里，为什么是这样设计的**。

---

## 第一层：React 在 Gutenberg 中扮演的角色

### Gutenberg 的架构分层

首先要明确：React 只存在于 Gutenberg 的**编辑器界面（Editor UI）**层，而非前端页面渲染层。

```
┌─────────────────────────────────────────────┐
│              WordPress 前端页面              │
│         （PHP 渲染 / 静态 HTML 输出）        │
│                  ← 无 React →               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│            WordPress 后台编辑器              │
│         Gutenberg Block Editor UI            │
│              ← React 运行于此 →             │
│                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│   │  块 A   │  │  块 B   │  │  块 C   │   │
│   │(React)  │  │(React)  │  │(React)  │   │
│   └─────────┘  └─────────┘  └─────────┘   │
└─────────────────────────────────────────────┘
```

这意味着：**你在 `edit` 函数里写的所有 React 代码，访客永远看不到**。访客看到的是 `save` 函数输出的静态 HTML，或者 PHP `render_callback` 渲染的结果。

这是理解 Gutenberg 中 React 的第一个关键认知。

### @wordpress/element：React 的封装层

Gutenberg 并不直接暴露 `react` 包给开发者，而是通过 `@wordpress/element` 做了一层封装：

```js
// Gutenberg 官方推荐写法
import { createElement, Fragment, useState } from '@wordpress/element';

// 而非直接
import React, { useState } from 'react';
```

`@wordpress/element` 的本质是对 React 的**薄封装（thin wrapper）**：

```js
// @wordpress/element 的核心实现（简化）
export {
    createElement,
    Component,
    Fragment,
    useState,
    useEffect,
    useRef,
    // ... 所有常用 React API
} from 'react';

// 加上少量 WordPress 特有扩展
export { RawHTML } from './raw-html';
```

**为什么要这层封装？**

1. **版本解耦**：WordPress 核心控制 React 版本，插件开发者通过 `@wordpress/element` 使用，无需关心底层 React 版本升级的细节。
2. **全局单例**：WordPress 将 React 作为**全局依赖（global dependency）**通过 `wp.element` 暴露，避免多个插件各自打包 React 导致的版本冲突和包体积膨胀。
3. **扩展点**：为 WordPress 特有的渲染需求（如 `RawHTML`）提供接入口。

在实践中，你完全可以直接 `import React from 'react'`，因为 `@wordpress/scripts` 的 Webpack 配置会将其 externalize 到全局的 `wp.element`。两者本质相同，但官方推荐使用 `@wordpress/element`。

---

## 第二层：edit 与 save 的分裂架构

这是 Gutenberg 最独特也最容易误解的设计——**一个块有两个完全独立的渲染函数**。

### edit 函数：完整的 React 组件

`edit` 函数是一个标准的 React 函数组件，运行在编辑器的 React 运行时中，拥有完整的 React 能力：

```jsx
import { useState, useEffect, useRef } from '@wordpress/element';
import { TextControl, PanelBody, ColorPicker } from '@wordpress/components';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';

export function Edit({ attributes, setAttributes, isSelected, clientId }) {
    // ✅ 可以使用所有 React Hooks
    const [localDraft, setLocalDraft] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isSelected) {
            inputRef.current?.focus();
        }
    }, [isSelected]);

    const blockProps = useBlockProps({
        className: 'my-custom-block',
    });

    return (
        <>
            {/* ✅ 可以使用 InspectorControls 向右侧面板注入设置 */}
            <InspectorControls>
                <PanelBody title="颜色设置">
                    <ColorPicker
                        color={attributes.backgroundColor}
                        onChange={(color) => setAttributes({ backgroundColor: color })}
                    />
                </PanelBody>
            </InspectorControls>

            {/* ✅ 编辑器中的可交互视图 */}
            <div {...blockProps}>
                <TextControl
                    ref={inputRef}
                    value={attributes.title}
                    onChange={(val) => setAttributes({ title: val })}
                    placeholder="输入标题..."
                />
            </div>
        </>
    );
}
```

`edit` 函数接收的关键 props：

| prop | 类型 | 说明 |
|------|------|------|
| `attributes` | object | 块的当前属性值（只读） |
| `setAttributes` | function | 更新属性的唯一方式（触发序列化保存） |
| `isSelected` | boolean | 该块是否被选中 |
| `clientId` | string | 块在当前编辑会话中的唯一 ID（不持久化） |
| `context` | object | 从父块传递下来的上下文数据 |

### save 函数：受限的「快照渲染器」

`save` 函数看起来也像 React 组件，但它**不是**：

```jsx
export function Save({ attributes }) {
    const blockProps = useBlockProps.save();

    return (
        <div {...blockProps}>
            <h2>{attributes.title}</h2>
            <p style={{ backgroundColor: attributes.backgroundColor }}>
                {attributes.content}
            </p>
        </div>
    );
}
```

`save` 函数的本质是一个**纯函数序列化器**，它在以下两个时机被调用：

1. **保存内容时**：将块序列化为 HTML 字符串存入数据库
2. **加载内容时**：重新运行以验证数据库中存储的 HTML 是否与当前 `save` 函数的输出匹配

**save 函数的严格限制：**

```jsx
// ❌ 禁止使用任何 Hooks
export function Save({ attributes }) {
    const [count, setCount] = useState(0); // 运行时报错！
    useEffect(() => {}); // 运行时报错！
    // ...
}

// ❌ 禁止使用 InspectorControls 等编辑器专属组件
export function Save({ attributes }) {
    return (
        <InspectorControls> {/* 无效，会被忽略或报错 */}
            ...
        </InspectorControls>
    );
}

// ❌ 禁止异步操作、API 请求
export function Save({ attributes }) {
    fetch('/api/data').then(...); // 无意义且有副作用
    // ...
}

// ✅ save 只能是：attributes → 静态 HTML 的纯函数
export function Save({ attributes }) {
    return <div>{attributes.title}</div>;
}
```

**为什么 save 要这样设计？**

因为 save 的输出会被**序列化为字符串存入数据库**。如果 save 包含状态或副作用，同样的输入在不同时间可能产生不同输出，导致数据库存储的 HTML 与「重新计算」的结果不一致，引发块验证失败。

纯函数是保证**可重现性**的唯一方式。

---

## 第三层：块验证机制——最容易踩坑的地方

### 验证的工作原理

每次编辑器加载含有自定义块的页面时，Gutenberg 会执行以下流程：

```
数据库中的 post_content
         ↓
解析块注释：<!-- wp:my-plugin/card {"title":"Hello"} -->
         ↓
提取属性：{ title: "Hello" }
         ↓
调用当前代码的 save({ title: "Hello" })
         ↓
生成期望 HTML：<div class="wp-block-my-plugin-card"><h2>Hello</h2></div>
         ↓
与数据库中存储的 HTML 进行字符串对比
         ↓
匹配 → 正常渲染
不匹配 → ⚠️ 块验证失败（Block Validation Error）
```

### 导致验证失败的常见陷阱

**陷阱 1：属性顺序不稳定**

```jsx
// ❌ 危险：对象属性顺序在不同 JS 引擎下可能不同
<div style={{ color: attributes.color, fontSize: attributes.size }}>
```

```jsx
// ✅ 安全：使用明确的字符串或固定顺序
<div style={`color: ${attributes.color}; font-size: ${attributes.size}px`}>
```

**陷阱 2：条件渲染产生不稳定输出**

```jsx
// ❌ 危险：如果 attributes.showImage 后来被改为 false
// 已保存的 HTML 包含 <img>，重新计算后没有 <img>，验证失败
save({ attributes }) {
    return (
        <div>
            {attributes.showImage && <img src={attributes.imageUrl} />}
        </div>
    );
}
```

这类情况下，需要通过 `deprecated` 维护历史版本：

```js
export const deprecated = [
    {
        // 版本 1：包含 showImage 逻辑的旧版本
        attributes: {
            showImage: { type: 'boolean', default: true },
            imageUrl: { type: 'string' },
        },
        save({ attributes }) {
            return (
                <div>
                    {attributes.showImage && <img src={attributes.imageUrl} />}
                </div>
            );
        },
    },
];
```

**陷阱 3：className 的细微差异**

```jsx
// ❌ 旧版本 save 里手写了 className
<div className="my-card">

// ✅ 新版本改用了 useBlockProps.save()，它会注入额外的 class
<div {...useBlockProps.save({ className: 'my-card' })}>
// 实际输出：<div class="wp-block-my-plugin-card my-card">
// 与旧版本不匹配 → 验证失败
```

### 逃脱验证：动态块模式

为了彻底规避 `save` 版本锁定问题，大量开发者选择**动态块（Dynamic Block）**：

```js
// block.json
{
    "name": "my-plugin/dynamic-card",
    "render": "file:./render.php"  // 或使用 register_block_type 的 render_callback
}
```

```js
// index.js
registerBlockType('my-plugin/dynamic-card', {
    edit: Edit,
    save: () => null,  // save 返回 null，告诉 Gutenberg 由 PHP 负责渲染
});
```

```php
// render.php
<?php
$title = $attributes['title'] ?? '';
$block_attrs = get_block_wrapper_attributes();
?>
<div <?php echo $block_attrs; ?>>
    <h2><?php echo esc_html($title); ?></h2>
</div>
```

动态块的核心逻辑：

- 数据库只存储块注释和属性 JSON，不存储 HTML
- 每次前端请求时，PHP `render_callback` 实时渲染 HTML
- `save` 返回 `null` 意味着不做 HTML 验证
- 代价是：失去了静态缓存的部分优势，且编辑器预览需要通过 `ServerSideRender` 发起 REST 请求

**动态块 vs 静态块的选择原则：**

| 场景 | 推荐 |
|------|------|
| 输出结构稳定，未来极少变动 | 静态块 |
| 输出依赖服务端数据（如文章列表） | 动态块（必须） |
| 需要频繁迭代 HTML 结构 | 动态块 |
| 对页面缓存有极高要求 | 静态块（HTML 已固化） |
| 输出包含用户权限相关的差异化内容 | 动态块（必须） |

---

## 第四层：useState 在 Gutenberg 中的语义

这是另一个容易误解的地方：**`useState` 在 Gutenberg 块中，不等于「持久化数据存储」**。

### attributes 才是持久化存储

```jsx
export function Edit({ attributes, setAttributes }) {
    // ✅ attributes 里的数据会被序列化存入数据库
    // setAttributes 是「持久化更新」
    const handleTitleChange = (val) => {
        setAttributes({ title: val }); // 写入数据库
    };

    // ⚠️ useState 里的数据只存在于当前编辑会话的内存中
    // 刷新页面后消失
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    return (
        <div>
            <button onClick={() => setIsPreviewMode(!isPreviewMode)}>
                切换预览（不持久化）
            </button>
            <input
                value={attributes.title}
                onChange={(e) => handleTitleChange(e.target.value)}
            />
        </div>
    );
}
```

**`useState` 在 Gutenberg 中的正确使用场景：**

- 编辑器 UI 的临时交互状态（弹窗开关、Tab 切换、悬停效果）
- 输入框的草稿值（在 `onBlur` 时才调用 `setAttributes` 提交）
- 加载状态、错误状态等 UI 反馈

**需要持久化的数据，必须走 `setAttributes`：**

```jsx
// ✅ 正确的「延迟提交」模式：useState 作为草稿缓冲
const [draft, setDraft] = useState(attributes.title);

return (
    <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}  // 实时更新本地草稿
        onBlur={() => setAttributes({ title: draft })} // 失焦时持久化
    />
);
```

### useSelect 和 useDispatch：Gutenberg 的数据层

Gutenberg 有自己的状态管理系统（`@wordpress/data`），类似 Redux。`useSelect` 和 `useDispatch` 是在块组件中接入这个状态层的 Hooks：

```jsx
import { useSelect, useDispatch } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';

export function Edit({ clientId }) {
    // 从 Gutenberg 全局状态中读取数据
    const { postTitle, adjacentBlocks } = useSelect((select) => ({
        // 读取当前文章标题
        postTitle: select(coreStore).getEditedPostAttribute('title'),
        // 读取当前块的兄弟块
        adjacentBlocks: select(blockEditorStore).getAdjacentBlockClientId(clientId),
    }), [clientId]);

    // 获取修改全局状态的 dispatch 函数
    const { updateBlockAttributes } = useDispatch(blockEditorStore);

    return (
        <div>
            <p>当前文章：{postTitle}</p>
        </div>
    );
}
```

这是 Gutenberg React 开发中容易被忽视的一层：**块组件不是孤立的 React 组件，它运行在 Gutenberg 的全局数据层之上**，可以读写文章元数据、其他块的属性、编辑器的 UI 状态等。

---

## 第五层：JSX 的编译与运行时

### Gutenberg 如何处理 JSX

Gutenberg 使用 `@wordpress/scripts`（封装了 Webpack + Babel）作为构建工具，JSX 会被编译为 `React.createElement` 调用：

```jsx
// 你写的 JSX
const element = <div className="card"><h2>{title}</h2></div>;

// 编译后（React 17+ 的新 JSX Transform）
import { jsx as _jsx } from 'react/jsx-runtime';
const element = _jsx("div", {
    className: "card",
    children: _jsx("h2", { children: title })
});
```

但在 Gutenberg 的 Webpack 配置中，`react/jsx-runtime` 被 externalize 到全局的 `wp.element`：

```js
// @wordpress/scripts 的 Webpack externals 配置（简化）
externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@wordpress/element': ['wp', 'element'],
    '@wordpress/components': ['wp', 'components'],
    // ... 所有 @wordpress/* 包都被 externalize
}
```

**这意味着什么？**

你写的 `import { useState } from '@wordpress/element'` 在编译后会变成访问全局的 `wp.element.useState`，而 `wp.element` 这个全局对象是 WordPress 核心在页面加载时注入的。

**实际影响：**

1. 你的插件打包体积**不包含** React 代码，React 由 WordPress 核心加载一次，所有插件共享
2. 你的插件必须在 `block.json` 或 `wp_register_script` 中声明 `wp-element`、`wp-blocks` 等依赖，WordPress 才会在你的脚本前先加载这些全局依赖
3. 如果没有正确声明依赖，`wp.element` 未定义，你的块会报错

```json
// block.json 中声明脚本依赖（自动处理）
{
    "editorScript": "file:./index.js",
    "viewScript": "file:./view.js"
}
```

`@wordpress/scripts` 会自动生成 `index.asset.php`，其中包含所有 externalized 依赖的列表，`register_block_type` 会自动读取这个文件处理依赖声明。

---

## 第六层：Context API 在块中的使用

Gutenberg 使用 React Context API 实现**父块向子块传递数据**（`usesContext` / `providesContext`）：

```json
// 父块 block.json
{
    "name": "my-plugin/tabs",
    "providesContext": {
        "my-plugin/activeTab": "activeTab"
    },
    "attributes": {
        "activeTab": { "type": "number", "default": 0 }
    }
}
```

```json
// 子块 block.json
{
    "name": "my-plugin/tab-panel",
    "usesContext": ["my-plugin/activeTab"]
}
```

```jsx
// 子块 edit 函数
export function Edit({ context }) {
    const { 'my-plugin/activeTab': activeTab } = context;
    // 子块可以读取父块传递的 context，但不能直接修改它
    return <div style={{ display: activeTab === 0 ? 'block' : 'none' }}>...</div>;
}
```

这套机制是对 React Context API 的**声明式封装**，通过 `block.json` 配置而非代码定义，比直接使用 `React.createContext` 更符合 Gutenberg 的「配置驱动」哲学。

---

## 第七层：常见的 React 知识在 Gutenberg 中的适用边界

| React 知识 | 在 Gutenberg 中的适用性 |
|------------|------------------------|
| 函数组件 + Hooks | ✅ 完全适用于 `edit` 函数 |
| `useState` | ✅ 用于临时 UI 状态；❌ 不可替代 `setAttributes` |
| `useEffect` | ✅ 用于 `edit` 中的副作用；❌ 禁止在 `save` 中使用 |
| `useRef` | ✅ 完全适用于 `edit` |
| `useContext` | ⚠️ 可用，但 Gutenberg 提供了更高层的 `usesContext` 声明方式 |
| `useReducer` | ✅ 适用于 `edit` 中的复杂本地状态 |
| `useMemo` / `useCallback` | ✅ 性能优化，适用于 `edit` |
| Class 组件 | ⚠️ 技术上可用，但官方已不推荐 |
| React Router | ❌ 不适用（编辑器不需要客户端路由） |
| React Suspense / lazy | ⚠️ 有限支持，编辑器环境复杂 |
| Portals | ⚠️ 技术上可用，但 Gutenberg 有自己的 Modal 组件 |
| Error Boundaries | ✅ 可用于 `edit`，防止块崩溃影响整个编辑器 |
| Server Components | ❌ 不适用（Gutenberg 有自己的「服务端渲染」方案：动态块） |
| React 状态管理（Redux/Zustand） | ⚠️ 不需要，Gutenberg 自带 `@wordpress/data`（类 Redux） |

---

## 总结：建立正确的心智模型

理解 Gutenberg 中的 React，需要破除三个常见误区：

**误区一：「Gutenberg 前端页面用 React 渲染」**

错误。React 只存在于 WordPress 后台编辑器，前端页面是纯 HTML（静态块）或 PHP 渲染（动态块）。

**误区二：「save 函数是一个 React 组件」**

不完全对。`save` 虽然用 JSX 写，但它是一个**纯函数序列化器**，不能有任何副作用、状态或 Hooks，本质上更接近模板函数而非 React 组件。

**误区三：「useState 可以存储我想持久化的数据」**

错误。`useState` 是易失性的内存状态，页面刷新即消失。需要持久化的块数据必须通过 `setAttributes` 写入 `attributes`，由 Gutenberg 序列化存储。

**一句话总结 Gutenberg 中的 React：**

> React 是 Gutenberg **编辑界面**的渲染引擎，`edit` 是完整的 React 组件，`save` 是受约束的纯函数快照，属性（attributes）是唯一的持久化通道，前端页面与 React 无关。

掌握这个心智模型，你才能在 Gutenberg 开发中真正做到游刃有余，而不是把「React 经验」生搬硬套，在 `save` 里写 Hooks，在 `useState` 里存关键数据，然后在一连串奇怪的报错中迷失。

---

## 延伸阅读

- [Block Editor Handbook - Block API](https://developer.wordpress.org/block-editor/reference-guides/block-api/)
- [@wordpress/element 源码](https://github.com/WordPress/gutenberg/tree/trunk/packages/element)
- [Block Deprecation API](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/)
- [@wordpress/data - 数据层文档](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-data/)
- [Dynamic Blocks 官方文档](https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/creating-dynamic-blocks/)
