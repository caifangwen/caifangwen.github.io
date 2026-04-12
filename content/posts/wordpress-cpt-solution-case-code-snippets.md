---
title: "用 Code Snippets 注册 WordPress 自定义文章类型：Solution 与 Case"
slug: "wordpress-cpt-solution-case-code-snippets"
date: 2026-04-12T23:19:39+08:00
lastmod: 2026-04-12T23:19:39+08:00
draft: false
tags: ["WordPress", "CPT", "Code Snippets", "自定义文章类型", "Solution", "Case"]
categories: ["WordPress 开发"]
description: "手把手演示如何用 Code Snippets 插件注册 solution 和 case 两种自定义文章类型，含分类法、参数详解与验证方法，无需修改主题文件。"
---

## 概述

本文演示如何用 **Code Snippets** 插件，在不修改主题 `functions.php` 的前提下，注册两种自定义文章类型：

| CPT | 后台名称 | 固定链接前缀 | 用途 |
|-----|---------|------------|------|
| `solution` | 解决方案 | `/solution/` | 展示产品或服务方案 |
| `case` | 客户案例 | `/case/` | 展示成功案例、客户故事 |

---

## 准备工作

### 安装 Code Snippets 插件

1. 进入 WordPress 后台 → **插件 → 安装插件**
2. 搜索 `Code Snippets`，找到作者为 **Code Snippets Pro** 的版本
3. 点击**立即安装**，然后**启用**
4. 左侧导航出现 **Snippets** 菜单即表示安装成功

---

## 第一步：新建 Snippet

1. 后台左侧点击 **Snippets → Add New**
2. **Title** 填写：`注册 CPT - Solution & Case`
3. **Code Type** 选择 `PHP Snippet`
4. **Run** 选择 `Run everywhere`（确保前台与后台均可触发）

---

## 第二步：粘贴完整代码

将以下代码完整复制到编辑器中：

```php
<?php
/**
 * 注册自定义文章类型：Solution（解决方案）和 Case（客户案例）
 * 通过 Code Snippets 插件加载，与主题解耦
 */

/* ============================================================
 * 1. 注册 CPT：solution（解决方案）
 * ============================================================ */
add_action( 'init', function () {

    $labels = [
        'name'                  => '解决方案',
        'singular_name'         => '解决方案',
        'add_new'               => '新增方案',
        'add_new_item'          => '新增解决方案',
        'edit_item'             => '编辑解决方案',
        'new_item'              => '新解决方案',
        'view_item'             => '查看解决方案',
        'view_items'            => '查看所有方案',
        'search_items'          => '搜索解决方案',
        'not_found'             => '未找到解决方案',
        'not_found_in_trash'    => '回收站中无解决方案',
        'all_items'             => '所有方案',
        'archives'              => '方案归档',
        'attributes'            => '方案属性',
        'insert_into_item'      => '插入到方案',
        'uploaded_to_this_item' => '上传到此方案',
        'menu_name'             => '解决方案',
        'name_admin_bar'        => '解决方案',
    ];

    $args = [
        'labels'             => $labels,
        'description'        => '产品与服务解决方案',
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_nav_menus'  => true,
        'show_in_admin_bar'  => true,
        'show_in_rest'       => true,           // 启用 Gutenberg 编辑器与 REST API
        'query_var'          => true,
        'rewrite'            => [
            'slug'       => 'solution',         // 固定链接：/solution/文章名
            'with_front' => false,              // 不在前缀前加根路径
        ],
        'capability_type'    => 'post',
        'map_meta_cap'       => true,
        'has_archive'        => 'solution',     // 归档页地址：/solution/
        'hierarchical'       => false,
        'menu_position'      => 20,
        'menu_icon'          => 'dashicons-lightbulb',
        'supports'           => [
            'title',        // 标题
            'editor',       // 正文内容
            'thumbnail',    // 特色图片
            'excerpt',      // 摘要
            'custom-fields',// 自定义字段
            'revisions',    // 修订版本
            'page-attributes', // 排序
        ],
    ];

    register_post_type( 'solution', $args );
}, 10 );


/* ============================================================
 * 2. 注册 CPT：case（客户案例）
 * ============================================================ */
add_action( 'init', function () {

    $labels = [
        'name'                  => '客户案例',
        'singular_name'         => '案例',
        'add_new'               => '新增案例',
        'add_new_item'          => '新增客户案例',
        'edit_item'             => '编辑案例',
        'new_item'              => '新案例',
        'view_item'             => '查看案例',
        'view_items'            => '查看所有案例',
        'search_items'          => '搜索案例',
        'not_found'             => '未找到案例',
        'not_found_in_trash'    => '回收站中无案例',
        'all_items'             => '所有案例',
        'archives'              => '案例归档',
        'attributes'            => '案例属性',
        'insert_into_item'      => '插入到案例',
        'uploaded_to_this_item' => '上传到此案例',
        'menu_name'             => '客户案例',
        'name_admin_bar'        => '客户案例',
    ];

    $args = [
        'labels'             => $labels,
        'description'        => '客户成功案例与故事',
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_nav_menus'  => true,
        'show_in_admin_bar'  => true,
        'show_in_rest'       => true,
        'query_var'          => true,
        'rewrite'            => [
            'slug'       => 'case',
            'with_front' => false,
        ],
        'capability_type'    => 'post',
        'map_meta_cap'       => true,
        'has_archive'        => 'case',
        'hierarchical'       => false,
        'menu_position'      => 21,
        'menu_icon'          => 'dashicons-awards',
        'supports'           => [
            'title',
            'editor',
            'thumbnail',
            'excerpt',
            'custom-fields',
            'revisions',
            'page-attributes',
        ],
    ];

    register_post_type( 'case', $args );
}, 10 );


/* ============================================================
 * 3. 注册分类法：solution_category（方案分类）
 * ============================================================ */
add_action( 'init', function () {

    register_taxonomy( 'solution_category', 'solution', [
        'labels'            => [
            'name'              => '方案分类',
            'singular_name'     => '方案分类',
            'edit_item'         => '编辑分类',
            'update_item'       => '更新分类',
            'add_new_item'      => '添加方案分类',
            'new_item_name'     => '新分类名称',
            'search_items'      => '搜索分类',
            'all_items'         => '所有分类',
            'parent_item'       => '父级分类',
            'parent_item_colon' => '父级分类：',
            'menu_name'         => '方案分类',
        ],
        'hierarchical'      => true,            // 类目结构（支持父子层级）
        'show_ui'           => true,
        'show_in_rest'      => true,
        'show_admin_column' => true,            // 列表页显示分类列
        'query_var'         => true,
        'rewrite'           => [ 'slug' => 'solution-category' ],
    ] );
}, 10 );


/* ============================================================
 * 4. 注册分类法：case_industry（案例行业）
 * ============================================================ */
add_action( 'init', function () {

    register_taxonomy( 'case_industry', 'case', [
        'labels'            => [
            'name'              => '所属行业',
            'singular_name'     => '行业',
            'edit_item'         => '编辑行业',
            'update_item'       => '更新行业',
            'add_new_item'      => '添加行业',
            'new_item_name'     => '新行业名称',
            'search_items'      => '搜索行业',
            'all_items'         => '所有行业',
            'menu_name'         => '所属行业',
        ],
        'hierarchical'      => true,
        'show_ui'           => true,
        'show_in_rest'      => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => [ 'slug' => 'case-industry' ],
    ] );
}, 10 );
```

---

## 第三步：保存并激活

点击右上角 **Save Changes and Activate** 按钮。  
Snippet 状态变为绿色的 **Active** 即生效。

---

## 第四步：刷新固定链接（必做）

注册新 CPT 后，WordPress 的重写规则尚未更新，**不刷新会导致单篇文章 404**。

1. 后台 → **设置 → 固定链接**
2. 无需修改任何选项，直接点击 **保存更改**
3. 页面提示"固定链接结构已更新"即完成

---

## 第五步：验证结果

### 后台验证

| 检查项 | 预期结果 |
|--------|---------|
| 左侧菜单 | 出现"解决方案 💡"和"客户案例 🏆"两个菜单项 |
| 新建文章 | 编辑器正常加载，支持特色图片、摘要等 |
| 分类法 | 各 CPT 下出现对应的分类子菜单 |

### 前台验证

新建各类型文章并发布，在浏览器中逐一访问：

```
# 单篇文章
https://yourdomain.com/solution/your-solution-slug/
https://yourdomain.com/case/your-case-slug/

# 归档页
https://yourdomain.com/solution/
https://yourdomain.com/case/

# 分类归档
https://yourdomain.com/solution-category/your-category/
https://yourdomain.com/case-industry/your-industry/
```

### REST API 验证

在浏览器或 Postman 中访问：

```
https://yourdomain.com/wp-json/wp/v2/solution
https://yourdomain.com/wp-json/wp/v2/case
```

返回 JSON 数组即表示 REST API 已启用，Gutenberg 编辑器可正常使用。

---

## 关键参数速查

### register_post_type 参数

| 参数 | 本文配置 | 说明 |
|------|---------|------|
| `public` | `true` | 前台可见、可查询 |
| `show_in_rest` | `true` | 启用 REST API 与区块编辑器 |
| `has_archive` | `'solution'` / `'case'` | 归档页 slug，与 `rewrite.slug` 保持一致 |
| `rewrite.with_front` | `false` | 不在固定链接前加 `/blog/` 等前缀 |
| `hierarchical` | `false` | 扁平结构（类文章），改为 `true` 则支持父子层级 |
| `menu_position` | `20` / `21` | 后台菜单顺序，数字越大越靠下 |
| `supports` | 按需填写 | 控制编辑页出现哪些元框 |

### register_taxonomy 参数

| 参数 | 本文配置 | 说明 |
|------|---------|------|
| `hierarchical` | `true` | 树状分类目录；`false` 则为扁平标签 |
| `show_admin_column` | `true` | 在 CPT 列表页显示分类列，方便筛选 |
| `show_in_rest` | `true` | REST API 可用，Gutenberg 侧边栏显示分类框 |

---

## 常见问题排查

**Q：保存 Snippet 后后台没有出现新菜单？**  
A：确认 Snippet 卡片左侧开关为绿色"已激活"状态；检查代码有无语法错误（Code Snippets 会在保存时高亮提示）。

**Q：单篇文章或归档页返回 404？**  
A：重新执行一次"设置 → 固定链接 → 保存更改"。

**Q：`case` 作为文章类型名称是否有冲突风险？**  
A：`case` 是 PHP 保留字，但 WordPress 的 `register_post_type()` 接受字符串参数，实测无问题。若仍担心，可改用 `client_case` 或 `success_case` 等名称，同步修改 `rewrite.slug` 即可。

**Q：换主题后两个 CPT 还在吗？**  
A：Code Snippets 存储于数据库，与主题完全无关，换主题不影响任何 CPT。

**Q：如何在前台主题模板中调用这两种文章类型？**  
A：在主题目录下创建 `single-solution.php`、`single-case.php`、`archive-solution.php`、`archive-case.php`，WordPress 会自动加载对应模板。

---

## 小结

通过以上五个步骤，你已经完成了：

1. ✅ 注册 `solution`（解决方案）CPT，含方案分类法
2. ✅ 注册 `case`（客户案例）CPT，含行业分类法
3. ✅ 两者均支持 Gutenberg 编辑器与 REST API
4. ✅ 代码与主题解耦，更新主题不会丢失配置

整个过程无需接触任何主题文件，后续维护只需在 Snippets 后台开关或编辑代码即可。
