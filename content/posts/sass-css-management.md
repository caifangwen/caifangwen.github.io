---
title: "Sass 是什么？CSS 项目如何做好样式管理"
slug: "sass-and-css-management"
date: 2026-04-08T17:54:36+08:00
draft: false
tags: ["CSS", "Sass", "前端开发", "样式管理"]
categories: ["CSS"]
description: "介绍 Sass 预处理器的核心特性，以及在中大型项目中如何系统地管理 CSS 样式。"
---

## 什么是 Sass？

**Sass**（Syntactically Awesome Style Sheets）是一种 CSS 预处理器，它在原生 CSS 的基础上扩展了变量、嵌套、混入（Mixin）、函数等编程能力，最终编译输出为标准的 CSS 文件。

> Sass 不能直接被浏览器解析，必须先通过工具编译成 CSS。

Sass 有两种语法格式：

- `.sass`：缩进语法，不需要花括号和分号，风格简洁
- `.scss`：兼容 CSS 语法，更主流，推荐使用

---

## Sass 的核心特性

### 1. 变量（Variables）

```scss
$primary-color: #3498db;
$font-size-base: 16px;

body {
  font-size: $font-size-base;
  color: $primary-color;
}
```

### 2. 嵌套（Nesting）

```scss
nav {
  background: #333;

  ul {
    list-style: none;
  }

  a {
    color: white;

    &:hover {
      color: $primary-color;
    }
  }
}
```

### 3. 混入（Mixin）

```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  @include flex-center;
  padding: 20px;
}
```

### 4. 继承（Extend）

```scss
%button-base {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  @extend %button-base;
  background: $primary-color;
}
```

### 5. 模块化（@use / @import）

```scss
// _variables.scss
$spacing-unit: 8px;

// main.scss
@use 'variables';

.container {
  padding: variables.$spacing-unit * 2;
}
```

---

## 如何做 CSS / Sass 项目管理

在中大型项目中，样式代码同样需要清晰的结构和规范，常见方案如下。

### 方案一：7-1 架构（推荐）

将样式文件按职责拆分为 7 个文件夹，最终在 1 个入口文件中引入：

```
styles/
├── abstracts/     # 变量、函数、Mixin（不输出 CSS）
├── base/          # 全局重置、排版、基础样式
├── components/    # 独立组件（按钮、卡片、弹窗等）
├── layout/        # 页面布局（头部、侧边栏、网格）
├── pages/         # 页面级专属样式
├── themes/        # 主题（暗色模式、换肤）
├── vendors/       # 第三方库样式
└── main.scss      # 统一入口，@use 以上所有模块
```

### 方案二：BEM 命名规范

BEM（Block\_\_Element--Modifier）是一种命名约定，可有效避免样式冲突：

```scss
// Block
.card { }

// Element
.card__title { }
.card__image { }

// Modifier
.card--featured { }
.card__title--large { }
```

### 方案三：CSS Modules（适合 React/Vue）

在组件化框架中，使用 CSS Modules 将样式作用域限定在当前组件，彻底避免全局污染：

```jsx
// Button.module.scss
.button { background: blue; }

// Button.jsx
import styles from './Button.module.scss';
<button className={styles.button}>Click</button>
```

### 方案四：CSS 自定义属性（原生变量）

现代 CSS 已原生支持变量，配合 Sass 一起使用效果更佳：

```css
:root {
  --color-primary: #3498db;
  --spacing-md: 16px;
}

.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
}
```

---

## Sass 工具链

| 工具 | 说明 |
|------|------|
| `sass` CLI | 官方命令行工具，`sass input.scss output.css` |
| Vite | 内置支持 `.scss`，安装 `sass` 包即可 |
| webpack | 使用 `sass-loader` |
| PostCSS | 配合 Autoprefixer 自动添加浏览器前缀 |

---

## 小结

Sass 解决了原生 CSS 缺乏编程能力的问题，而良好的目录结构（7-1）+ 命名规范（BEM）+ 作用域方案（CSS Modules）三者结合，能让样式代码在项目规模增长后依然保持可维护性。

对于新项目，推荐的起步配置是：**Vite + SCSS + 7-1 目录结构 + BEM 命名**。
