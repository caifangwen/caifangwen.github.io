---
title: "Polylang 多语言插件完整使用指南"
slug: "polylang-wordpress-multilingual-guide"
date: 2026-04-07T10:41:34+08:00
lastmod: 2026-04-07T10:41:34+08:00
draft: false
tags: ["WordPress", "Polylang", "多语言", "插件"]
categories: ["WordPress"]
description: "从安装到配置，手把手教你用 Polylang 打造 WordPress 多语言网站。"
---

## 什么是 Polylang

Polylang 是 WordPress 上最流行的多语言插件之一，免费版功能已经非常完整。它允许你为文章、页面、分类、标签、菜单等内容创建多个语言版本，不依赖机器翻译，内容完全由你手动管理。

---

## 安装

1. 进入 WordPress 后台 → **插件 → 安装插件**
2. 搜索 `Polylang`，点击 **立即安装** → **启用**
3. 启用后，左侧菜单会出现 **Languages** 入口

---

## 基本配置

### 1. 添加语言

进入 **Languages → Languages**，在表单中填写：

- **Full name**：语言全称，如 `Chinese (Simplified)`
- **Locale**：如 `zh_CN`
- **Slug**：URL 中的语言标识，如 `zh`、`en`

点击 **Add new language** 保存。重复操作添加所有需要的语言。

### 2. 设置默认语言

在语言列表中，点击某语言的 **星形图标** 即可将其设为默认语言。

### 3. 配置 URL 结构

进入 **Languages → Settings → URL modifications**，推荐选项：

| 选项 | 说明 |
|------|------|
| The language is set from the directory name in pretty permalinks | URL 形如 `/zh/post-slug/`，最常用 |
| The language is set from the subdomain | URL 形如 `zh.example.com` |
| The default language is not shown in the URL | 默认语言不带前缀 |

---

## 创建多语言内容

### 文章 / 页面

1. 新建或编辑文章，右侧边栏找到 **Languages** 面板
2. 选择该文章对应的语言
3. 点击其他语言旁边的 **铅笔图标** 或 **+** 号，创建对应翻译版本
4. 两篇文章会自动关联为互译关系

### 分类 & 标签

编辑分类时，右侧同样会出现语言选择面板，操作方式与文章相同。

### 菜单

进入 **外观 → 菜单**，Polylang 会为每种语言生成独立菜单位置，分别配置即可。

---

## 在主题中调用语言切换器

### 方法一：小工具（Widget）

进入 **外观 → 小工具**，将 **Polylang Language Switcher** 拖入侧边栏或页脚区域。

### 方法二：在模板中插入代码

```php
<?php
if ( function_exists( 'pll_the_languages' ) ) {
    pll_the_languages( array(
        'show_flags'     => 1,  // 显示国旗
        'show_names'     => 1,  // 显示语言名称
        'hide_if_empty'  => 0,  // 即使无翻译也显示
    ) );
}
?>
```

### 方法三：获取当前语言

```php
$lang = pll_current_language(); // 返回如 'zh'、'en'
```

---

## 常用函数速查

| 函数 | 说明 |
|------|------|
| `pll_current_language()` | 获取当前语言 slug |
| `pll_default_language()` | 获取默认语言 slug |
| `pll_get_post( $id, $lang )` | 获取文章的指定语言版本 ID |
| `pll_home_url( $lang )` | 获取指定语言的首页 URL |
| `pll_register_string( $name, $string )` | 注册主题自定义字符串用于翻译 |
| `pll__( $string )` | 输出已翻译的字符串 |

---

## 翻译主题字符串

对于主题中硬编码的文字（如按钮文案），需先注册再翻译：

```php
// functions.php 中注册
pll_register_string( 'theme', '阅读更多' );

// 模板中使用
echo pll__( '阅读更多' );
```

注册后，进入 **Languages → Strings translations** 即可为每种语言填写对应翻译。

---

## SEO 注意事项

- Polylang 会自动在 `<head>` 插入 `hreflang` 标签，告知搜索引擎各语言版本的 URL
- 配合 **Yoast SEO** 或 **Rank Math** 使用时，需在 SEO 插件中启用 Polylang 兼容模式
- 建议每种语言版本都填写独立的 SEO 标题和描述

---

## 免费版 vs Pro 版

| 功能 | 免费版 | Pro 版 |
|------|--------|--------|
| 无限语言 | ✅ | ✅ |
| 文章/页面翻译 | ✅ | ✅ |
| 媒体翻译 | ❌ | ✅ |
| WooCommerce 支持 | ❌ | ✅ |
| 自定义文章类型 | 部分 | 完整 |
| RTL 语言支持 | ✅ | ✅ |

对于大多数博客和企业站，**免费版完全够用**。

---

## 小结

Polylang 的核心使用流程就是：**添加语言 → 配置 URL → 为内容创建翻译版本 → 添加语言切换器**。相比 WPML，它更轻量，学习成本低，是中小型多语言网站的首选方案。
