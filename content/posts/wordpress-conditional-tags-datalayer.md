---
title: "WordPress 条件标签注入 dataLayer：从设计到操作完全指南"
slug: "wordpress-conditional-tags-datalayer-gtm"
date: 2026-04-09T14:43:13+08:00
lastmod: 2026-04-09T14:43:13+08:00
draft: false
tags: ["WordPress", "GTM", "dataLayer", "Google Analytics", "PHP"]
categories: ["WordPress"]
description: "详解如何用 WordPress 条件标签（is_single、is_page、is_cart 等）从 PHP 模板层精准注入 dataLayer，以及通过 googlesitekit_gtag_opt 过滤器集成 Site Kit，实现页面类型分组追踪。"
author: ""
showToc: true
TocOpen: true
---

## 一、为什么从 PHP 模板层注入 dataLayer？

很多团队习惯在 GTM 里用「Page URL 包含」规则来区分页面类型，但这套方案有两个致命软肋：

- **URL 结构随时会变**：改了固定链接格式、上了多语言插件、加了 CDN 路径前缀，规则就失效。
- **区分精度有限**：`/product/` 既可能是分类页也可能是单品页，单凭 URL 路径无法判断。

WordPress 在服务端渲染阶段已经知道「当前这个请求是什么类型的页面」，这正是条件标签的价值所在。在 PHP 层把页面类型写进 `dataLayer`，GTM / GA4 只需读取变量，完全不依赖 URL 规律。

---

## 二、核心概念：条件标签速查

| 条件标签 | 返回 true 的场景 |
|---|---|
| `is_single()` | 任意文章单篇页（post type = post） |
| `is_page()` | 静态页面（post type = page） |
| `is_singular('product')` | WooCommerce 单品页 |
| `is_archive()` | 任意存档页（分类/标签/作者/日期） |
| `is_category()` | 分类存档页 |
| `is_tag()` | 标签存档页 |
| `is_home()` | 文章列表首页（blog index） |
| `is_front_page()` | 网站首页（静态或动态均可） |
| `is_search()` | 搜索结果页 |
| `is_404()` | 404 错误页 |
| `is_cart()` | WooCommerce 购物车页 |
| `is_checkout()` | WooCommerce 结账页 |
| `is_account_page()` | WooCommerce 我的账户页 |

> **注意**：`is_cart()`、`is_checkout()` 等 WooCommerce 条件标签需要 WooCommerce 插件激活后才可用。

---

## 三、设计阶段：规划 dataLayer 结构

在写任何一行代码之前，先和数据分析师对齐 `dataLayer` 的字段设计。推荐的最小化结构如下：

```json
{
  "event": "page_meta",
  "page_type": "single_post",
  "post_id": 42,
  "post_type": "post",
  "is_woo_page": false
}
```

**字段说明：**

- `event`：触发名称，GTM 里用「自定义事件」触发器监听 `page_meta`。
- `page_type`：业务层面的页面分类，值域由你自己定义并文档化。
- `post_id`：可选，用于调试和个性化场景。
- `post_type`：原生 post type slug，与 `page_type` 互补。
- `is_woo_page`：布尔值，方便在 GA4 受众中快速过滤电商页面。

---

## 四、操作阶段：在 functions.php 中注入

### 4.1 基础版——仅区分常见页面类型

在子主题的 `functions.php` 或专用插件文件中添加以下代码：

```php
<?php
/**
 * 在 <head> 最前面注入 dataLayer，必须在 GTM 代码片段之前输出。
 * 挂载到 wp_head，优先级设为 1（越小越早执行）。
 */
add_action( 'wp_head', 'mytheme_inject_datalayer', 1 );

function mytheme_inject_datalayer() {

    // 初始化默认值
    $page_type = 'other';
    $post_id   = 0;
    $post_type = '';

    // ——— 判断逻辑（顺序很重要，越具体的条件放越前面）———

    if ( is_front_page() ) {
        $page_type = 'front_page';

    } elseif ( is_home() ) {
        // is_home() 且不是 front_page，说明用了静态首页 + 独立博客列表页
        $page_type = 'blog_index';

    } elseif ( is_single() ) {
        $page_type = 'single_post';
        $post_id   = get_the_ID();
        $post_type = get_post_type();

    } elseif ( is_page() ) {
        $page_type = 'static_page';
        $post_id   = get_the_ID();

    } elseif ( is_category() ) {
        $page_type = 'category_archive';

    } elseif ( is_tag() ) {
        $page_type = 'tag_archive';

    } elseif ( is_archive() ) {
        // 兜底：其他存档页（自定义分类法、作者页、日期页等）
        $page_type = 'archive';

    } elseif ( is_search() ) {
        $page_type = 'search';

    } elseif ( is_404() ) {
        $page_type = 'error_404';
    }

    // 构建 dataLayer 数据数组
    $datalayer_data = array(
        'event'     => 'page_meta',
        'page_type' => $page_type,
        'post_id'   => $post_id,
        'post_type' => $post_type,
    );

    // 安全输出：wp_json_encode 自动处理转义
    echo '<script>';
    echo 'window.dataLayer = window.dataLayer || [];';
    echo 'dataLayer.push(' . wp_json_encode( $datalayer_data ) . ');';
    echo '</script>' . "\n";
}
```

### 4.2 进阶版——叠加 WooCommerce 页面检测

```php
add_action( 'wp_head', 'mytheme_inject_datalayer', 1 );

function mytheme_inject_datalayer() {

    $page_type   = 'other';
    $post_id     = 0;
    $post_type   = '';
    $is_woo_page = false;

    // —— WooCommerce 专项（需 WooCommerce 激活）——
    if ( function_exists( 'is_woocommerce' ) ) {

        if ( is_cart() ) {
            $page_type   = 'woo_cart';
            $is_woo_page = true;

        } elseif ( is_checkout() ) {
            // 区分订单完成页和普通结账页
            $page_type   = is_order_received_page() ? 'woo_order_received' : 'woo_checkout';
            $is_woo_page = true;

        } elseif ( is_account_page() ) {
            $page_type   = 'woo_account';
            $is_woo_page = true;

        } elseif ( is_singular( 'product' ) ) {
            $page_type   = 'woo_product';
            $post_id     = get_the_ID();
            $post_type   = 'product';
            $is_woo_page = true;

        } elseif ( is_product_category() ) {
            $page_type   = 'woo_product_category';
            $is_woo_page = true;

        } elseif ( is_shop() ) {
            $page_type   = 'woo_shop';
            $is_woo_page = true;
        }
    }

    // —— 非 WooCommerce 页面回退到通用判断 ——
    if ( $page_type === 'other' ) {

        if ( is_front_page() ) {
            $page_type = 'front_page';
        } elseif ( is_home() ) {
            $page_type = 'blog_index';
        } elseif ( is_single() ) {
            $page_type = 'single_post';
            $post_id   = get_the_ID();
            $post_type = get_post_type();
        } elseif ( is_page() ) {
            $page_type = 'static_page';
            $post_id   = get_the_ID();
        } elseif ( is_category() ) {
            $page_type = 'category_archive';
        } elseif ( is_tag() ) {
            $page_type = 'tag_archive';
        } elseif ( is_archive() ) {
            $page_type = 'archive';
        } elseif ( is_search() ) {
            $page_type = 'search';
        } elseif ( is_404() ) {
            $page_type = 'error_404';
        }
    }

    $datalayer_data = array(
        'event'       => 'page_meta',
        'page_type'   => $page_type,
        'post_id'     => $post_id,
        'post_type'   => $post_type,
        'is_woo_page' => $is_woo_page,
    );

    echo '<script>';
    echo 'window.dataLayer = window.dataLayer || [];';
    echo 'dataLayer.push(' . wp_json_encode( $datalayer_data ) . ');';
    echo '</script>' . "\n";
}
```

---

## 五、Site Kit 专用：googlesitekit_gtag_opt 过滤器

如果你使用 **Google Site Kit** 插件管理 GA4 代码，Site Kit 提供了官方过滤器钩子，可以在它输出 `gtag` 初始化配置时顺带注入自定义参数，而不需要绕过它或者另行输出 `<script>` 标签。

### 5.1 过滤器原理

`googlesitekit_gtag_opt` 过滤器接收一个关联数组，该数组会被序列化并传给 `gtag('config', 'G-XXXXXXXX', {...})` 的第三个参数。

### 5.2 注入页面类型参数

```php
/**
 * 通过 Site Kit 的官方过滤器，向 gtag config 注入自定义维度。
 * 前提：已在 GA4 后台创建名为 page_type 的「自定义维度（事件作用域）」。
 */
add_filter( 'googlesitekit_gtag_opt', 'mytheme_sitekit_gtag_opt' );

function mytheme_sitekit_gtag_opt( $gtag_opt ) {

    $page_type = 'other';

    if ( is_front_page() )       { $page_type = 'front_page'; }
    elseif ( is_home() )         { $page_type = 'blog_index'; }
    elseif ( is_single() )       { $page_type = 'single_post'; }
    elseif ( is_page() )         { $page_type = 'static_page'; }
    elseif ( is_category() )     { $page_type = 'category_archive'; }
    elseif ( is_tag() )          { $page_type = 'tag_archive'; }
    elseif ( is_archive() )      { $page_type = 'archive'; }
    elseif ( is_search() )       { $page_type = 'search'; }
    elseif ( is_404() )          { $page_type = 'error_404'; }

    // WooCommerce 支持
    if ( function_exists( 'is_cart' ) && is_cart() ) {
        $page_type = 'woo_cart';
    } elseif ( function_exists( 'is_checkout' ) && is_checkout() ) {
        $page_type = 'woo_checkout';
    }

    // 写入自定义维度（键名需与 GA4 后台配置一致）
    $gtag_opt['custom_map'] = array(
        'dimension1' => 'page_type',  // 如果用旧式 UA 自定义维度映射
    );
    $gtag_opt['page_type'] = $page_type;

    return $gtag_opt;
}
```

> **GA4 后台操作**：进入「管理 → 自定义定义 → 自定义维度」，新建一个维度，名称填 `page_type`，范围选「事件」，参数名称填 `page_type`，保存后等待 24 小时数据生效。

---

## 六、GTM 配置：读取 dataLayer 变量

完成 PHP 端注入后，在 GTM 里做以下配置：

### 6.1 创建 dataLayer 变量

1. 进入 **变量 → 用户定义的变量 → 新建**
2. 类型选 **数据层变量**
3. 数据层变量名称填 `page_type`
4. 数据层版本选 **版本 2**
5. 保存，命名为 `DL - Page Type`

### 6.2 创建触发器

| 用途 | 触发器类型 | 条件 |
|---|---|---|
| 监听所有页面类型推送 | 自定义事件 | 事件名称 = `page_meta` |
| 仅购物车页 | 自定义事件 | 事件名称 = `page_meta`，且 `DL - Page Type` 等于 `woo_cart` |
| 仅文章页 | 自定义事件 | 事件名称 = `page_meta`，且 `DL - Page Type` 等于 `single_post` |

### 6.3 在 GA4 事件代码中使用

在 GA4 配置代码的「字段设置」里添加：

| 字段名 | 值 |
|---|---|
| `page_type` | `{{DL - Page Type}}` |

这样每个 `page_view` 事件都会携带 `page_type` 参数，可在 GA4 探索报告中按页面类型分组分析。

---

## 七、调试与验证

### 7.1 浏览器控制台快速验证

打开任意页面，在控制台输入：

```javascript
dataLayer.filter(e => e.event === 'page_meta')
```

应返回类似：

```json
[{ "event": "page_meta", "page_type": "single_post", "post_id": 42, "post_type": "post", "is_woo_page": false }]
```

### 7.2 GTM 预览模式验证

1. 在 GTM 点击「预览」，连接目标网站。
2. 访问不同类型的页面（文章页、分类页、购物车页等）。
3. 在 GTM 调试面板左栏找到 `page_meta` 事件，点击后在右侧「数据层」标签页核查 `page_type` 的值。

### 7.3 常见问题排查

| 症状 | 可能原因 | 解决方法 |
|---|---|---|
| `page_type` 始终是 `other` | 条件标签判断顺序有误，或插件冲突 | 单独输出 `var_dump(is_single())` 临时调试 |
| WooCommerce 条件标签不可用 | WooCommerce 未激活，或钩子执行时机过早 | 改用 `woocommerce_loaded` 钩子或加 `function_exists` 守卫 |
| Site Kit 过滤器不生效 | Site Kit 版本过旧，过滤器尚未提供 | 更新 Site Kit 到 1.47.0+ |
| dataLayer 在 GTM 之后输出 | `wp_head` 优先级设置问题 | 确保 `add_action( 'wp_head', ..., 1 )` 优先级为 1 |

---

## 八、最佳实践总结

1. **条件越具体越优先**：`is_singular('product')` 必须放在 `is_single()` 之前，否则单品页会被归入 `single_post`。
2. **用 `wp_json_encode` 而非 `json_encode`**：前者会自动处理 WordPress 特殊字符转义，避免 XSS 风险。
3. **文档化 page_type 值域**：把所有可能的 `page_type` 值写进团队 Wiki，避免分析师和开发者各自理解不一致。
4. **不要在 `footer` 注入**：dataLayer 推送必须在 GTM 容器代码**之前**，放 `wp_head` 优先级 1 是最安全的位置。
5. **Site Kit 和手动 GTM 二选一**：两者同时启用会导致 GA4 数据重复计算，确认清楚团队使用哪一种方案。
