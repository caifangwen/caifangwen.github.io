---
title: "WordPress 自定义短代码实现子页面卡片列表"
date: 2026-03-16T20:14:30+08:00
draft: false
description: "通过自定义短代码实现子页面卡片列表"
tags: [WordPress, Shortcode, PHP]
categories:
  - 技术
  - WordPress
author: Frida
---

# WordPress 自定义短代码实现子页面卡片列表

在 WordPress 网站开发中，我们经常需要在父页面中展示其所有子页面的列表。通过自定义短代码（Shortcode）功能，我们可以轻松实现一个美观的子页面卡片列表，让访客能够快速浏览和访问相关内容。本文将详细介绍如何创建这样一个功能，并深入解释每一行代码的作用。

## 什么是短代码

短代码是 WordPress 提供的一种简洁的宏功能，允许用户通过简单的标签在文章或页面中插入复杂的功能。例如 `[gallery]` 就是 WordPress 内置的短代码。我们可以创建自己的短代码，只需在方括号中写入短代码名称，WordPress 就会将其替换为我们定义的内容或功能。

## 实现思路

我们的目标是创建一个名为 `[child_pages]` 的短代码，当在页面中插入这个短代码时，它会自动获取当前页面的所有子页面，并以卡片形式展示出来。每张卡片包含子页面的标题、摘要和链接。

## 完整代码实现

首先，我们需要将以下代码添加到主题的 `functions.php` 文件中。为了安全起见，建议使用子主题，避免主题更新时代码丢失。

```php
<?php
/**
 * 创建子页面卡片列表短代码
 * 用法: [child_pages]
 */
function display_child_pages_cards() {
    // 获取当前页面的 ID
    global $post;
    $parent_id = $post->ID;
    
    // 设置查询参数，获取当前页面的所有子页面
    $args = array(
        'post_type'      => 'page',           // 文章类型为页面
        'post_parent'    => $parent_id,       // 父页面 ID
        'orderby'        => 'menu_order',     // 按菜单顺序排序
        'order'          => 'ASC',            // 升序排列
        'posts_per_page' => -1,               // 获取所有子页面，不限制数量
    );
    
    // 执行查询
    $child_pages = new WP_Query($args);
    
    // 检查是否有子页面
    if (!$child_pages->have_posts()) {
        return '<p>暂无子页面</p>';
    }
    
    // 开始构建 HTML 输出
    $output = '<div class="child-pages-grid">';
    
    // 循环遍历每个子页面
    while ($child_pages->have_posts()) {
        $child_pages->the_post();
        
        // 获取页面信息
        $title = get_the_title();
        $permalink = get_permalink();
        $excerpt = get_the_excerpt();
        
        // 获取特色图片，如果没有则使用默认占位图
        if (has_post_thumbnail()) {
            $thumbnail = get_the_post_thumbnail(get_the_ID(), 'medium', array('class' => 'card-image'));
        } else {
            $thumbnail = '<img src="https://via.placeholder.com/300x200" alt="默认图片" class="card-image">';
        }
        
        // 构建单个卡片的 HTML
        $output .= '<div class="child-page-card">';
        $output .= '<a href="' . esc_url($permalink) . '" class="card-link">';
        $output .= $thumbnail;
        $output .= '<div class="card-content">';
        $output .= '<h3 class="card-title">' . esc_html($title) . '</h3>';
        $output .= '<p class="card-excerpt">' . esc_html($excerpt) . '</p>';
        $output .= '<span class="card-button">了解更多 →</span>';
        $output .= '</div>';
        $output .= '</a>';
        $output .= '</div>';
    }
    
    $output .= '</div>';
    
    // 重置文章数据，避免影响页面其他部分
    wp_reset_postdata();
    
    return $output;
}

// 注册短代码
add_shortcode('child_pages', 'display_child_pages_cards');
```

## 代码详解

让我们逐段分析这段代码的每个部分：

### 1. 函数定义和全局变量

```php
function display_child_pages_cards() {
    global $post;
    $parent_id = $post->ID;
```

这里定义了短代码的回调函数。`global $post` 声明使用 WordPress 的全局变量 `$post`，它包含当前页面的所有信息。`$parent_id` 存储当前页面的 ID，这个 ID 将用于查询其子页面。

### 2. 设置查询参数

```php
$args = array(
    'post_type'      => 'page',
    'post_parent'    => $parent_id,
    'orderby'        => 'menu_order',
    'order'          => 'ASC',
    'posts_per_page' => -1,
);
```

这是一个关联数组，用于配置 WP_Query 的查询条件。`post_type` 指定我们要查询页面类型的内容，`post_parent` 设置为当前页面 ID，确保只获取当前页面的直接子页面。`orderby` 和 `order` 控制排序方式，按照页面属性中设置的"排序"字段升序排列。`posts_per_page` 设为 -1 表示获取所有符合条件的页面。

### 3. 执行查询和验证

```php
$child_pages = new WP_Query($args);

if (!$child_pages->have_posts()) {
    return '<p>暂无子页面</p>';
}
```

创建一个新的 WP_Query 对象来执行查询。如果没有找到任何子页面（`have_posts()` 返回 false），函数会提前返回一条提示信息，避免显示空白内容。

### 4. 构建 HTML 结构

```php
$output = '<div class="child-pages-grid">';

while ($child_pages->have_posts()) {
    $child_pages->the_post();
```

初始化输出变量 `$output`，使用一个容器 div 包裹所有卡片。然后使用 while 循环遍历查询结果，`the_post()` 方法会设置当前循环中的文章数据，使我们能够使用 WordPress 的模板标签。

### 5. 获取页面信息

```php
$title = get_the_title();
$permalink = get_permalink();
$excerpt = get_the_excerpt();
```

这三行分别获取页面的标题、永久链接和摘要。这些是构建卡片所需的基本信息。

### 6. 处理特色图片

```php
if (has_post_thumbnail()) {
    $thumbnail = get_the_post_thumbnail(get_the_ID(), 'medium', array('class' => 'card-image'));
} else {
    $thumbnail = '<img src="https://via.placeholder.com/300x200" alt="默认图片" class="card-image">';
}
```

检查页面是否设置了特色图片。如果有，获取中等尺寸的缩略图并添加自定义 CSS 类。如果没有，使用占位符图片服务提供的默认图片，确保卡片视觉一致性。

### 7. 拼接卡片 HTML

```php
$output .= '<div class="child-page-card">';
$output .= '<a href="' . esc_url($permalink) . '" class="card-link">';
$output .= $thumbnail;
$output .= '<div class="card-content">';
$output .= '<h3 class="card-title">' . esc_html($title) . '</h3>';
$output .= '<p class="card-excerpt">' . esc_html($excerpt) . '</p>';
$output .= '<span class="card-button">了解更多 →</span>';
$output .= '</div>';
$output .= '</a>';
$output .= '</div>';
```

这段代码构建每张卡片的 HTML 结构。注意使用了 `esc_url()` 和 `esc_html()` 函数来转义输出，这是 WordPress 安全最佳实践，可以防止 XSS 攻击。整个卡片被包裹在一个链接中，用户点击卡片任何位置都能跳转到对应页面。

### 8. 清理和返回

```php
wp_reset_postdata();
return $output;
```

`wp_reset_postdata()` 非常重要，它会将全局的 `$post` 变量恢复到自定义查询之前的状态，避免影响页面上的其他循环或功能。最后返回构建好的 HTML 字符串。

### 9. 注册短代码

```php
add_shortcode('child_pages', 'display_child_pages_cards');
```

这行代码向 WordPress 注册短代码。第一个参数是短代码的名称，用户在编辑器中输入 `[child_pages]` 时会调用它。第二个参数是回调函数的名称，即我们刚才定义的函数。

## 添加 CSS 样式

短代码生成的 HTML 还需要 CSS 样式才能美观显示。在主题的 `style.css` 文件或自定义 CSS 区域添加以下样式：

```css
/* 卡片网格容器 */
.child-pages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
    margin: 40px 0;
    padding: 0;
}

/* 单个卡片样式 */
.child-page-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.child-page-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* 卡片链接 */
.card-link {
    text-decoration: none;
    color: inherit;
    display: block;
}

/* 卡片图片 */
.card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
}

/* 卡片内容区域 */
.card-content {
    padding: 20px;
}

/* 卡片标题 */
.card-title {
    font-size: 1.4em;
    margin: 0 0 10px 0;
    color: #333;
}

/* 卡片摘要 */
.card-excerpt {
    font-size: 0.95em;
    color: #666;
    line-height: 1.6;
    margin: 0 0 15px 0;
}

/* 卡片按钮 */
.card-button {
    display: inline-block;
    color: #0073aa;
    font-weight: 600;
    font-size: 0.9em;
}

.child-page-card:hover .card-button {
    color: #005177;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .child-pages-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
}
```

这段 CSS 使用了现代的 Grid 布局，实现了响应式的卡片网格。`grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))` 会根据容器宽度自动调整列数，每列最小宽度 300px。卡片悬停时有轻微的抬升动画效果，提升用户体验。

## 使用方法

完成代码添加后，使用非常简单。在 WordPress 编辑器中，找到你想要显示子页面列表的位置，直接插入短代码即可。

**经典编辑器：** 直接在内容中输入 `[child_pages]`

**古腾堡编辑器：** 添加一个"短代码"区块，然后在其中输入 `[child_pages]`

保存并预览页面，你会看到该页面的所有子页面以卡片形式整齐排列显示出来。

## 扩展功能

这个基础版本已经很实用，但你还可以根据需求添加更多功能，比如添加短代码参数来控制显示数量、排序方式，或者添加分类筛选功能。例如可以修改为 `[child_pages count="6" orderby="date"]`，通过解析短代码的 `$atts` 参数来实现更灵活的控制。

通过这个实例，你不仅学会了创建自定义短代码，还掌握了 WordPress 查询机制、安全输出、循环处理等核心开发技能，这些知识可以应用到更多 WordPress 定制开发场景中。