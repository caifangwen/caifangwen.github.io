---
title: WordPress 询盘表单同步飞书多维表格 — 自定义 PHP 方案完整指南
slug: wordpress-feishu-php-detail
date: 2026-05-08T07:53:47.000Z
draft: false
description: 自定义 PHP 代码实现 WordPress 五大主流表单插件与飞书多维表格的深度对接完整指南
summary: >-
  详细介绍 Contact Form 7、WPForms、Gravity Forms、Ninja Forms、Elementor Forms
  五大插件对接飞书多维表格的自定义 PHP 方案，含 API 封装、字段映射、生产环境加固与调试指南
tags:
  - WordPress
  - 飞书
  - PHP
  - Contact Form 7
  - WPForms
  - Gravity Forms
  - Ninja Forms
  - Elementor Forms
  - API 集成
  - CMS 与主题
  - 购物车与结账
  - B2B 建站架构
  - 询盘与表单设计
categories:
  - 工程实践
  - 转化
cover: ''
author: Frida
url: /blog/wordpress-feishu-php-detail/
---

# WordPress 询盘表单同步飞书多维表格 — 自定义 PHP 方案完整指南

> 本文专注于「自定义 PHP 代码」方案，详细介绍如何对接 Contact Form 7、WPForms、Gravity Forms、Ninja Forms、Elementor Forms 五大主流表单插件，实现零延迟、零成本的飞书多维表格同步。

---

## 目录

1. [基础架构说明](#基础架构说明)
2. [飞书 API 核心封装（所有方案共用）](#飞书-api-核心封装所有方案共用)
3. [方案 A：Contact Form 7](#方案-a-contact-form-7)
4. [方案 B：WPForms](#方案-b-wpforms)
5. [方案 C：Gravity Forms](#方案-c-gravity-forms)
6. [方案 D：Ninja Forms](#方案-d-ninja-forms)
7. [方案 E：Elementor Forms](#方案-e-elementor-forms)
8. [飞书多维表格字段类型完整对照](#飞书多维表格字段类型完整对照)
9. [生产环境加固](#生产环境加固)
10. [调试与日志](#调试与日志)

---

## 基础架构说明

### 工作流程

```
用户填写并提交表单
        ↓
WordPress 表单插件处理（验证、存储、发邮件）
        ↓
插件触发 Action Hook（每个插件的 Hook 名称不同）
        ↓
我们挂载的回调函数执行
        ↓
① 从 WordPress Transient 读取缓存的飞书 Token
   （若无缓存）调用飞书 Auth API 获取新 Token 并缓存 90 分钟
        ↓
② 调用飞书 Bitable API 写入记录
        ↓
③ 写入失败时记录错误日志 + 触发备用邮件通知
```

### 代码放置位置

**推荐：创建专属插件文件**

```
wp-content/
└── plugins/
    └── feishu-form-sync/
        ├── feishu-form-sync.php   ← 插件入口
        ├── class-feishu-api.php   ← 飞书 API 封装
        └── handlers/
            ├── cf7.php            ← Contact Form 7 处理
            ├── wpforms.php        ← WPForms 处理
            ├── gravityforms.php   ← Gravity Forms 处理
            ├── ninjaforms.php     ← Ninja Forms 处理
            └── elementor.php      ← Elementor Forms 处理
```

> **不推荐**直接写入子主题 `functions.php`，主题更换会导致代码丢失。

### 飞书应用配置（前置步骤）

在开始写代码前，务必完成以下配置：

**1. 创建飞书自建应用**

前往 [飞书开放平台](https://open.feishu.cn/) → 开发者后台 → 创建企业自建应用

**2. 申请必要权限**

进入应用「权限管理」，申请以下权限：

| 权限标识 | 说明 |
|----------|------|
| `bitable:app` | 多维表格应用（基础） |
| `bitable:record:create` | 新建记录 ✅ 必须 |
| `bitable:record:update` | 更新记录（可选） |

**3. 发布应用版本**

权限申请后必须「发布版本」并由企业管理员审批，否则 Token 无效。

**4. 获取多维表格标识**

打开目标多维表格，从 URL 提取：

```
https://your-company.feishu.cn/base/BaNkbXXXXXX?table=tblYYYYYYYY&view=vewZZZZZZZZ
                                     ↑ App Token        ↑ Table ID
```

**5. 将应用加入多维表格协作者**

多维表格右上角 → 「···」→「添加协作者」→ 搜索并添加你创建的飞书应用（授予「编辑」权限）

**6. 在 wp-config.php 中定义常量**

```php
// 加在 /* That's all, stop editing! */ 行之前
define('FEISHU_APP_ID',     'cli_xxxxxxxxxxxxxxx');   // 飞书应用 App ID
define('FEISHU_APP_SECRET', 'xxxxxxxxxxxxxxxxxxxxxxx'); // 飞书应用 App Secret
define('FEISHU_APP_TOKEN',  'BaNkbXXXXXXXXXXXXXXX');  // 多维表格 App Token
define('FEISHU_TABLE_ID',   'tblYYYYYYYYYYYYYYYY');   // 数据表 Table ID
```

---

## 飞书 API 核心封装（所有方案共用）

以下代码是所有表单方案的共同基础，只需写一次。

### class-feishu-api.php

```php
<?php
/**
 * 飞书多维表格 API 封装类
 * 
 * 功能：Token 自动缓存、记录写入、错误日志、失败通知
 */

if (!defined('ABSPATH')) exit;

class Feishu_Bitable_API {

    /**
     * 飞书 API 基础地址
     */
    const BASE_URL = 'https://open.feishu.cn/open-apis';

    /**
     * Token 缓存键名
     */
    const TOKEN_TRANSIENT = 'feishu_tenant_access_token';

    /**
     * 获取租户访问令牌（带缓存）
     *
     * @return string|false Token 字符串，失败返回 false
     */
    public static function get_access_token() {
        // 优先从缓存读取
        $cached_token = get_transient(self::TOKEN_TRANSIENT);
        if (!empty($cached_token)) {
            return $cached_token;
        }

        // 检查常量是否定义
        if (!defined('FEISHU_APP_ID') || !defined('FEISHU_APP_SECRET')) {
            self::log('错误：未定义 FEISHU_APP_ID 或 FEISHU_APP_SECRET 常量，请检查 wp-config.php');
            return false;
        }

        // 请求新 Token
        $response = wp_remote_post(self::BASE_URL . '/auth/v3/tenant_access_token/internal', [
            'headers' => ['Content-Type' => 'application/json; charset=utf-8'],
            'body'    => wp_json_encode([
                'app_id'     => FEISHU_APP_ID,
                'app_secret' => FEISHU_APP_SECRET,
            ]),
            'timeout'   => 15,
            'sslverify' => true,
        ]);

        if (is_wp_error($response)) {
            self::log('获取 Token 网络错误: ' . $response->get_error_message());
            return false;
        }

        $http_code = wp_remote_retrieve_response_code($response);
        if ($http_code !== 200) {
            self::log("获取 Token HTTP 错误，状态码: {$http_code}");
            return false;
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);

        if (empty($body['tenant_access_token'])) {
            self::log('获取 Token 失败，飞书返回: ' . wp_json_encode($body, JSON_UNESCAPED_UNICODE));
            return false;
        }

        // 缓存 90 分钟（Token 有效期 2 小时，提前 30 分钟过期留余量）
        set_transient(self::TOKEN_TRANSIENT, $body['tenant_access_token'], 90 * MINUTE_IN_SECONDS);

        self::log('成功获取新 Token，已缓存 90 分钟');
        return $body['tenant_access_token'];
    }

    /**
     * 强制刷新 Token（清除缓存后重新获取）
     *
     * @return string|false
     */
    public static function refresh_token() {
        delete_transient(self::TOKEN_TRANSIENT);
        return self::get_access_token();
    }

    /**
     * 向多维表格写入一条记录
     *
     * @param array  $fields     字段数据（键名 = 飞书列名）
     * @param string $app_token  多维表格 App Token（不传则读常量）
     * @param string $table_id   数据表 Table ID（不传则读常量）
     * @return array ['success' => bool, 'record_id' => string|null, 'error' => string|null]
     */
    public static function create_record(array $fields, string $app_token = '', string $table_id = '') {
        // 参数默认值从常量读取
        if (empty($app_token)) {
            $app_token = defined('FEISHU_APP_TOKEN') ? FEISHU_APP_TOKEN : '';
        }
        if (empty($table_id)) {
            $table_id = defined('FEISHU_TABLE_ID') ? FEISHU_TABLE_ID : '';
        }

        if (empty($app_token) || empty($table_id)) {
            $error = '错误：App Token 或 Table ID 为空，请检查 wp-config.php 中的常量定义';
            self::log($error);
            return ['success' => false, 'record_id' => null, 'error' => $error];
        }

        // 获取 Token
        $token = self::get_access_token();
        if (!$token) {
            return ['success' => false, 'record_id' => null, 'error' => '无法获取飞书访问令牌'];
        }

        $url = self::BASE_URL . "/bitable/v1/apps/{$app_token}/tables/{$table_id}/records";

        $response = wp_remote_post($url, [
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'Content-Type'  => 'application/json; charset=utf-8',
            ],
            'body'    => wp_json_encode(['fields' => $fields], JSON_UNESCAPED_UNICODE),
            'timeout' => 15,
        ]);

        if (is_wp_error($response)) {
            $error = '网络请求失败: ' . $response->get_error_message();
            self::log($error);
            return ['success' => false, 'record_id' => null, 'error' => $error];
        }

        $http_code = wp_remote_retrieve_response_code($response);
        $body      = json_decode(wp_remote_retrieve_body($response), true);

        // Token 失效时自动刷新重试（只重试一次）
        if ($http_code === 401 || (isset($body['code']) && in_array($body['code'], [99991663, 99991661]))) {
            self::log('Token 已失效，正在刷新并重试...');
            $token = self::refresh_token();
            if (!$token) {
                return ['success' => false, 'record_id' => null, 'error' => 'Token 刷新失败'];
            }

            $response = wp_remote_post($url, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type'  => 'application/json; charset=utf-8',
                ],
                'body'    => wp_json_encode(['fields' => $fields], JSON_UNESCAPED_UNICODE),
                'timeout' => 15,
            ]);

            $body = json_decode(wp_remote_retrieve_body($response), true);
        }

        if (isset($body['code']) && $body['code'] === 0) {
            $record_id = $body['data']['record']['record_id'] ?? null;
            self::log("写入成功，Record ID: {$record_id}");
            return ['success' => true, 'record_id' => $record_id, 'error' => null];
        }

        $error_msg = sprintf(
            '写入失败，code: %s，msg: %s',
            $body['code'] ?? 'unknown',
            $body['msg']  ?? 'unknown'
        );
        self::log($error_msg . '，字段数据: ' . wp_json_encode($fields, JSON_UNESCAPED_UNICODE));

        return ['success' => false, 'record_id' => null, 'error' => $error_msg];
    }

    /**
     * 写入失败时的备用通知
     *
     * @param array  $fields      原始字段数据
     * @param string $error       错误信息
     * @param string $form_name   表单名称
     */
    public static function send_fallback_notification(array $fields, string $error, string $form_name = '') {
        $admin_email = get_option('admin_email');
        if (empty($admin_email)) return;

        $subject = sprintf('[%s] 飞书同步失败 — 询盘数据需手动处理', get_bloginfo('name'));

        $body  = "飞书多维表格同步失败，请手动录入以下询盘数据：\n\n";
        $body .= "错误原因：{$error}\n";
        if ($form_name) {
            $body .= "表单名称：{$form_name}\n";
        }
        $body .= "时　　间：" . current_time('Y-m-d H:i:s') . "\n\n";
        $body .= "---询盘数据---\n";

        foreach ($fields as $key => $value) {
            if (is_array($value)) {
                $value = implode(', ', $value);
            }
            $body .= "{$key}：{$value}\n";
        }

        wp_mail($admin_email, $subject, $body);
        self::log("已发送备用邮件通知至：{$admin_email}");
    }

    /**
     * 写入日志
     *
     * @param string $message 日志内容
     */
    public static function log(string $message) {
        if (defined('WP_DEBUG') && WP_DEBUG && defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
            error_log('[飞书同步] ' . $message);
        }
    }
}
```

### feishu-form-sync.php（插件入口）

```php
<?php
/**
 * Plugin Name: 飞书多维表格询盘同步
 * Plugin URI:  https://yoursite.com
 * Description: 将 WordPress 表单数据实时同步到飞书多维表格
 * Version:     1.0.0
 * Author:      Your Name
 * Text Domain: feishu-form-sync
 */

if (!defined('ABSPATH')) exit;

// 加载核心 API 类
require_once plugin_dir_path(__FILE__) . 'class-feishu-api.php';

// 按需加载各表单插件的处理器
// 取消注释你实际使用的表单插件对应行

// require_once plugin_dir_path(__FILE__) . 'handlers/cf7.php';          // Contact Form 7
// require_once plugin_dir_path(__FILE__) . 'handlers/wpforms.php';      // WPForms
// require_once plugin_dir_path(__FILE__) . 'handlers/gravityforms.php'; // Gravity Forms
// require_once plugin_dir_path(__FILE__) . 'handlers/ninjaforms.php';   // Ninja Forms
// require_once plugin_dir_path(__FILE__) . 'handlers/elementor.php';    // Elementor Forms
```

---

## 方案 A：Contact Form 7

Contact Form 7（CF7）是 WordPress 使用最广泛的表单插件，使用 `wpcf7_mail_sent` 或 `wpcf7_before_send_mail` 钩子。

### 获取表单字段名

在 CF7 表单编辑页，每个字段的 `name` 属性即为字段名：

```
[text* your-name placeholder "姓名"]
[email* your-email placeholder "邮箱"]
[tel your-phone placeholder "电话"]
[textarea your-message placeholder "询盘内容"]
```

字段名就是：`your-name`、`your-email`、`your-phone`、`your-message`

### handlers/cf7.php

```php
<?php
/**
 * Contact Form 7 → 飞书多维表格
 * 
 * 钩子说明：
 * - wpcf7_mail_sent         邮件发送成功后触发（推荐，确保表单验证通过）
 * - wpcf7_before_send_mail  邮件发送前触发（可用于阻止某些操作）
 * - wpcf7_submit            每次提交都触发（包括验证失败的情况，不推荐）
 */

if (!defined('ABSPATH')) exit;

add_action('wpcf7_mail_sent', 'feishu_sync_cf7_submission');

function feishu_sync_cf7_submission(WPCF7_ContactForm $contact_form) {

    // ─── 可选：只处理指定表单 ───────────────────────────────────────────
    // 在 CF7 表单列表中找到表单 ID，填入下方数组
    // 留空数组 [] 则处理所有表单
    $allowed_form_ids = []; // 例如：[123, 456]

    if (!empty($allowed_form_ids) && !in_array($contact_form->id(), $allowed_form_ids, true)) {
        return;
    }
    // ────────────────────────────────────────────────────────────────────

    $submission = WPCF7_Submission::get_instance();
    if (!$submission) {
        Feishu_Bitable_API::log('CF7: 无法获取 Submission 实例');
        return;
    }

    // 获取所有提交的字段数据
    $posted_data = $submission->get_posted_data();

    // ─── 字段映射 ────────────────────────────────────────────────────────
    // 格式：'飞书多维表格列名' => 表单字段值
    // 根据你的实际表单字段名修改左侧的键名和右侧的字段名
    $fields = [
        '姓名'     => sanitize_text_field($posted_data['your-name']    ?? ''),
        '邮箱'     => sanitize_email($posted_data['your-email']        ?? ''),
        '电话'     => sanitize_text_field($posted_data['your-phone']   ?? ''),
        '公司'     => sanitize_text_field($posted_data['your-company'] ?? ''),
        '询盘内容' => sanitize_textarea_field($posted_data['your-message'] ?? ''),
        '来源表单' => sanitize_text_field($contact_form->title()),
        '来源页面' => sanitize_url($submission->get_meta('url') ?? ''),
        '提交时间' => time() * 1000, // 飞书日期字段需要毫秒时间戳
        '状态'     => '待跟进',
    ];

    // 过滤空值（可选，避免空字段覆盖多维表格默认值）
    $fields = array_filter($fields, fn($v) => $v !== '' && $v !== null);

    // ─── 写入飞书 ────────────────────────────────────────────────────────
    $result = Feishu_Bitable_API::create_record($fields);

    if (!$result['success']) {
        Feishu_Bitable_API::send_fallback_notification(
            $fields,
            $result['error'],
            'CF7: ' . $contact_form->title()
        );
    }
}
```

### CF7 多表单分流（不同表单写不同多维表格）

如果你有多个表单需要写入不同的多维表格：

```php
add_action('wpcf7_mail_sent', 'feishu_sync_cf7_multi_form');

function feishu_sync_cf7_multi_form(WPCF7_ContactForm $contact_form) {
    $submission = WPCF7_Submission::get_instance();
    if (!$submission) return;

    $posted = $submission->get_posted_data();

    // 按表单 ID 分流配置
    $form_config = [
        // 产品询盘表单
        101 => [
            'app_token' => 'BaNkb产品询盘AppToken',
            'table_id'  => 'tbl产品询盘TableID',
            'fields'    => [
                '姓名'     => sanitize_text_field($posted['your-name']    ?? ''),
                '邮箱'     => sanitize_email($posted['your-email']        ?? ''),
                '产品型号' => sanitize_text_field($posted['product-model'] ?? ''),
                '询价数量' => intval($posted['quantity'] ?? 0),
                '提交时间' => time() * 1000,
                '状态'     => '待报价',
            ],
        ],
        // 合作洽谈表单
        102 => [
            'app_token' => 'BaNkb合作洽谈AppToken',
            'table_id'  => 'tbl合作洽谈TableID',
            'fields'    => [
                '联系人'   => sanitize_text_field($posted['your-name']    ?? ''),
                '公司名称' => sanitize_text_field($posted['company-name'] ?? ''),
                '合作类型' => sanitize_text_field($posted['partner-type'] ?? ''),
                '备注'     => sanitize_textarea_field($posted['your-message'] ?? ''),
                '提交时间' => time() * 1000,
            ],
        ],
    ];

    $form_id = $contact_form->id();
    if (!isset($form_config[$form_id])) return; // 忽略未配置的表单

    $config = $form_config[$form_id];
    $result = Feishu_Bitable_API::create_record(
        $config['fields'],
        $config['app_token'],
        $config['table_id']
    );

    if (!$result['success']) {
        Feishu_Bitable_API::send_fallback_notification(
            $config['fields'],
            $result['error'],
            '表单ID: ' . $form_id
        );
    }
}
```

### CF7 获取文件上传字段

```php
// 在回调函数内获取上传文件路径
$uploaded_files = $submission->uploaded_files();

// 例如表单中有字段 [file your-file]
$file_path = $uploaded_files['your-file'] ?? null;

// 飞书暂不支持直接上传文件到多维表格，可存储文件URL（需先上传到媒体库）
// 或仅记录文件名
$fields['附件名称'] = $file_path ? basename($file_path) : '';
```

---

## 方案 B：WPForms

WPForms 的表单字段通过「字段 ID」访问，需在表单编辑器中查看每个字段的 ID 编号。

### 获取字段 ID

在 WPForms 编辑器中点击任意字段，右侧面板可以看到「Field ID」，例如：
- 字段 ID 1 = 姓名
- 字段 ID 2 = 邮箱
- 字段 ID 3 = 电话

### handlers/wpforms.php

```php
<?php
/**
 * WPForms → 飞书多维表格
 *
 * 钩子说明：
 * - wpforms_process_complete  表单处理完成后触发（推荐）
 * - wpforms_process_before    处理前触发
 *
 * 回调参数：
 *   $fields      (array)  所有字段数据
 *   $entry       (array)  原始提交数据
 *   $form_data   (array)  表单配置数据（含表单 ID、名称等）
 *   $entry_id    (int)    数据库条目 ID（免费版可能为 0）
 */

if (!defined('ABSPATH')) exit;

add_action('wpforms_process_complete', 'feishu_sync_wpforms_submission', 10, 4);

function feishu_sync_wpforms_submission($fields, $entry, $form_data, $entry_id) {

    // ─── 可选：只处理指定表单 ───────────────────────────────────────────
    $allowed_form_ids = []; // 例如：[5, 12]，留空则处理所有表单

    if (!empty($allowed_form_ids) && !in_array((int)$form_data['id'], $allowed_form_ids, true)) {
        return;
    }
    // ────────────────────────────────────────────────────────────────────

    /**
     * 辅助函数：安全获取 WPForms 字段值
     *
     * WPForms 的字段结构：
     * $fields[字段ID] = [
     *   'id'    => 字段ID,
     *   'type'  => 字段类型（text/email/phone/textarea/select/checkbox...）,
     *   'name'  => 字段标签名,
     *   'value' => 用户填写的值（主要取这个）,
     *   'value_raw' => 原始值（select/checkbox 类型时有用）,
     * ]
     */
    $get_field = function(int $field_id, string $default = '') use ($fields): string {
        return sanitize_text_field($fields[$field_id]['value'] ?? $default);
    };

    $get_textarea = function(int $field_id, string $default = '') use ($fields): string {
        return sanitize_textarea_field($fields[$field_id]['value'] ?? $default);
    };

    // ─── 字段映射 ────────────────────────────────────────────────────────
    // 修改左侧飞书列名和右侧字段ID（字段ID数字需与你的表单实际一致）
    $feishu_fields = [
        '姓名'     => $get_field(1),
        '邮箱'     => sanitize_email($fields[2]['value'] ?? ''),
        '电话'     => $get_field(3),
        '公司'     => $get_field(4),
        '询盘内容' => $get_textarea(5),
        '来源表单' => sanitize_text_field($form_data['settings']['form_title'] ?? ''),
        '来源页面' => sanitize_url($_SERVER['HTTP_REFERER'] ?? ''),
        '提交时间' => time() * 1000,
        '状态'     => '待跟进',
    ];

    // ─── 写入飞书 ────────────────────────────────────────────────────────
    $result = Feishu_Bitable_API::create_record($feishu_fields);

    if (!$result['success']) {
        Feishu_Bitable_API::send_fallback_notification(
            $feishu_fields,
            $result['error'],
            'WPForms: ' . ($form_data['settings']['form_title'] ?? "ID {$form_data['id']}")
        );
    }
}
```

### WPForms 特殊字段类型处理

```php
// ── 下拉选择框（Select）──
// value 是选中项的文本
$fields['产品类型'] = sanitize_text_field($fields[6]['value'] ?? '');

// ── 复选框（Checkbox）——多选 ──
// value 是所有选中项以逗号分隔的字符串
// value_raw 是数组（更可靠）
$selected_items = $fields[7]['value_raw'] ?? [];
if (is_string($selected_items)) {
    $selected_items = explode(',', $selected_items);
}
$feishu_fields['需求类型'] = array_map('sanitize_text_field', $selected_items);
// 飞书多选字段需要传字符串数组 ['选项A', '选项B']

// ── 评分字段（Rating）──
$feishu_fields['满意度'] = intval($fields[8]['value'] ?? 0);

// ── 地址字段（Address）──
// WPForms 地址字段会展开为多个子字段
$address_parts = [
    $fields[9]['address1'] ?? '',
    $fields[9]['address2'] ?? '',
    $fields[9]['city']     ?? '',
    $fields[9]['state']    ?? '',
    $fields[9]['postal']   ?? '',
    $fields[9]['country']  ?? '',
];
$feishu_fields['地址'] = sanitize_text_field(implode(' ', array_filter($address_parts)));

// ── 文件上传（File Upload）──
$feishu_fields['附件URL'] = sanitize_url($fields[10]['value'] ?? '');

// ── 数字字段（Number）──
$feishu_fields['预算金额'] = floatval($fields[11]['value'] ?? 0);

// ── 日期时间（Date/Time）──
$feishu_fields['期望交货日期'] = !empty($fields[12]['value'])
    ? strtotime($fields[12]['value']) * 1000  // 转换为飞书需要的毫秒时间戳
    : null;
```

### WPForms 按字段名而非 ID 查找

```php
/**
 * 按标签名查找字段值（当你不确定字段ID时使用）
 */
function wpforms_get_field_by_label(array $fields, string $label): string {
    foreach ($fields as $field) {
        if (strtolower(trim($field['name'] ?? '')) === strtolower(trim($label))) {
            return $field['value'] ?? '';
        }
    }
    return '';
}

// 使用示例
$feishu_fields['姓名'] = sanitize_text_field(
    wpforms_get_field_by_label($fields, '您的姓名')
);
```

---

## 方案 C：Gravity Forms

Gravity Forms 是功能最强大的 WordPress 表单插件，提供了非常丰富的钩子。

### 获取字段 ID

在 Gravity Forms 表单编辑器中，每个字段右上角显示「Field ID」数字。
对于复合字段（如姓名拆分为名/姓），子字段 ID 格式为 `字段ID.子ID`，例如 `1.3`（姓名字段 ID=1 的 last name 子字段）。

### handlers/gravityforms.php

```php
<?php
/**
 * Gravity Forms → 飞书多维表格
 *
 * 可用钩子：
 * - gform_after_submission     提交完成后（推荐）
 * - gform_pre_submission       提交前
 * - gform_entry_post_save      条目保存到数据库后（entry_id 确定可用）
 *
 * 回调参数（gform_after_submission）：
 *   $entry      (array) 条目数据
 *   $form       (array) 表单定义
 */

if (!defined('ABSPATH')) exit;

// 第二个参数可指定表单 ID，只处理该表单；0 表示处理所有表单
add_action('gform_after_submission', 'feishu_sync_gravityforms_submission', 10, 2);

function feishu_sync_gravityforms_submission($entry, $form) {

    // ─── 可选：只处理指定表单 ───────────────────────────────────────────
    $allowed_form_ids = []; // 例如：[3, 7]，留空则处理所有表单

    if (!empty($allowed_form_ids) && !in_array((int)$form['id'], $allowed_form_ids, true)) {
        return;
    }
    // ────────────────────────────────────────────────────────────────────

    /**
     * Gravity Forms 字段访问方式：
     *
     * 简单字段（文本、邮箱、电话、下拉等）：
     *   $entry['字段ID']  例如 $entry['1'] → 姓名字段
     *
     * 复合字段（姓名拆分、地址等）：
     *   $entry['字段ID.子字段ID']  例如 $entry['1.3'] → 姓（Last Name）
     *   $entry['1.6'] → 名（First Name），$entry['1.3'] → 姓
     *
     * 也可使用 GFFormsModel::get_lead_field_value($entry, $field) 获取格式化值
     *
     * rgar($entry, $key) 是 GF 的辅助函数，等价于 $entry[$key] ?? ''
     */

    // ─── 字段映射 ────────────────────────────────────────────────────────
    $feishu_fields = [
        '姓名'     => sanitize_text_field(rgar($entry, '1')),   // 字段 ID 1
        '邮箱'     => sanitize_email(rgar($entry, '2')),         // 字段 ID 2
        '电话'     => sanitize_text_field(rgar($entry, '3')),    // 字段 ID 3
        '公司'     => sanitize_text_field(rgar($entry, '4')),    // 字段 ID 4
        '询盘内容' => sanitize_textarea_field(rgar($entry, '5')), // 字段 ID 5
        '来源页面' => sanitize_url(rgar($entry, 'source_url')),
        '来源表单' => sanitize_text_field($form['title'] ?? ''),
        '提交时间' => !empty($entry['date_created'])
            ? strtotime($entry['date_created']) * 1000
            : time() * 1000,
        '状态'     => '待跟进',
        '条目ID'   => intval($entry['id'] ?? 0), // GF 数据库条目 ID，便于追溯
    ];

    // ─── 写入飞书 ────────────────────────────────────────────────────────
    $result = Feishu_Bitable_API::create_record($feishu_fields);

    if (!$result['success']) {
        Feishu_Bitable_API::send_fallback_notification(
            $feishu_fields,
            $result['error'],
            'GravityForms: ' . ($form['title'] ?? "ID {$form['id']}")
        );
    }
}
```

### Gravity Forms 特殊字段处理

```php
// ── 姓名拆分字段（Name Field，ID=1）──
$first_name = sanitize_text_field(rgar($entry, '1.3')); // First Name
$last_name  = sanitize_text_field(rgar($entry, '1.6')); // Last Name
$feishu_fields['姓名'] = trim("{$first_name} {$last_name}");

// ── 地址字段（Address Field，ID=6）──
$feishu_fields['地址'] = sanitize_text_field(implode(' ', array_filter([
    rgar($entry, '6.1'),  // Street Address
    rgar($entry, '6.2'),  // Address Line 2
    rgar($entry, '6.3'),  // City
    rgar($entry, '6.4'),  // State / Province
    rgar($entry, '6.5'),  // Zip / Postal Code
    rgar($entry, '6.6'),  // Country
])));

// ── 复选框字段（Checkbox，ID=7）——获取所有选中项 ──
$checkbox_values = [];
foreach ($form['fields'] as $field) {
    if ($field->id == 7 && $field->type === 'checkbox') {
        foreach ($field->inputs as $input) {
            $value = rgar($entry, (string)$input['id']);
            if (!empty($value)) {
                $checkbox_values[] = sanitize_text_field($value);
            }
        }
        break;
    }
}
$feishu_fields['需求类型'] = $checkbox_values; // 传给飞书多选字段

// ── 列表字段（List Field，ID=8）──
$list_raw = rgar($entry, '8');
$list_data = maybe_unserialize($list_raw);
if (is_array($list_data)) {
    $feishu_fields['商品清单'] = sanitize_text_field(implode('; ', array_column($list_data, 0)));
}

// ── 文件上传字段（File Upload，ID=9）——获取 URL ──
$file_url = rgar($entry, '9');
$feishu_fields['附件URL'] = !empty($file_url) ? sanitize_url($file_url) : '';

// ── 评分字段（Rating，ID=10）──
$feishu_fields['满意度评分'] = intval(rgar($entry, '10'));

// ── 条件逻辑：根据字段值设置飞书状态 ──
$budget = floatval(rgar($entry, '11'));
$feishu_fields['客户等级'] = match(true) {
    $budget >= 100000 => 'A 级（高价值）',
    $budget >= 10000  => 'B 级（中等）',
    default           => 'C 级（普通）',
};
```

### Gravity Forms 写入成功后回写 GF 条目（双向同步）

```php
// 写入成功后，将飞书 Record ID 存回 Gravity Forms 条目元数据
$result = Feishu_Bitable_API::create_record($feishu_fields);

if ($result['success'] && !empty($result['record_id'])) {
    gform_update_meta($entry['id'], 'feishu_record_id', $result['record_id']);
    // 之后可通过 gform_get_meta($entry_id, 'feishu_record_id') 读取
}
```

---

## 方案 D：Ninja Forms

Ninja Forms 使用「动作」系统（Actions），可在表单提交后执行自定义动作。

### handlers/ninjaforms.php

```php
<?php
/**
 * Ninja Forms → 飞书多维表格
 *
 * Ninja Forms 使用 Action 类来响应表单提交，
 * 同时也提供传统的 WordPress Action Hook 方式。
 */

if (!defined('ABSPATH')) exit;

// ─── 方式一：使用 Hook（简单快速）──────────────────────────────────────

add_action('ninja_forms_after_submission', 'feishu_sync_ninjaforms_submission');

function feishu_sync_ninjaforms_submission($form_data) {

    // ─── 可选：只处理指定表单 ───────────────────────────────────────────
    $allowed_form_ids = []; // 例如：[2, 8]，留空则处理所有

    $form_id = $form_data['form_id'] ?? 0;
    if (!empty($allowed_form_ids) && !in_array((int)$form_id, $allowed_form_ids, true)) {
        return;
    }
    // ────────────────────────────────────────────────────────────────────

    /**
     * Ninja Forms 字段数据结构：
     * $form_data['fields'] = [
     *   字段ID => [
     *     'id'    => 字段数字ID,
     *     'key'   => 字段别名（在表单编辑器中设置，如 'name'、'email'）,
     *     'type'  => 字段类型（textbox/email/phone/textarea/listselect...）,
     *     'value' => 用户填写的值,
     *     'label' => 字段标签名,
     *   ],
     *   ...
     * ]
     */

    // 按 key 建立索引，方便查找
    $fields_by_key = [];
    foreach ($form_data['fields'] as $field) {
        $key = $field['key'] ?? '';
        if ($key) {
            $fields_by_key[$key] = $field['value'] ?? '';
        }
    }

    // 也可以按标签名建立索引
    $fields_by_label = [];
    foreach ($form_data['fields'] as $field) {
        $label = trim($field['label'] ?? '');
        if ($label) {
            $fields_by_label[$label] = $field['value'] ?? '';
        }
    }

    // ─── 字段映射（使用 key 访问，推荐） ─────────────────────────────────
    // 注意：key 是在 Ninja Forms 编辑器中「Advanced」选项卡里设置的字段别名
    $feishu_fields = [
        '姓名'     => sanitize_text_field($fields_by_key['name']    ?? ''),
        '邮箱'     => sanitize_email($fields_by_key['email']        ?? ''),
        '电话'     => sanitize_text_field($fields_by_key['phone']   ?? ''),
        '公司'     => sanitize_text_field($fields_by_key['company'] ?? ''),
        '询盘内容' => sanitize_textarea_field($fields_by_key['message'] ?? ''),
        '来源表单' => sanitize_text_field($form_data['settings']['title'] ?? "Form #{$form_id}"),
        '来源页面' => sanitize_url($_SERVER['HTTP_REFERER'] ?? ''),
        '提交时间' => time() * 1000,
        '状态'     => '待跟进',
    ];

    // ─── 写入飞书 ────────────────────────────────────────────────────────
    $result = Feishu_Bitable_API::create_record($feishu_fields);

    if (!$result['success']) {
        Feishu_Bitable_API::send_fallback_notification(
            $feishu_fields,
            $result['error'],
            'NinjaForms: ' . ($form_data['settings']['title'] ?? "ID {$form_id}")
        );
    }
}


// ─── 方式二：创建自定义 Action 类（更规范，适合生产环境）────────────────

class Feishu_Ninja_Forms_Action extends NF_Abstracts_Action {

    protected $_name  = 'feishu_sync';
    protected $_tags  = [];
    protected $_timing = 'normal';
    protected $_priority = 10;

    public function __construct() {
        parent::__construct();
        $this->_nicename = __('同步到飞书多维表格', 'feishu-form-sync');
    }

    /**
     * 表单提交时执行的处理逻辑
     */
    public function process($action_settings, $form_id, $data) {
        $fields_by_key = [];
        foreach ($data['fields'] as $field) {
            $key = $field['key'] ?? '';
            if ($key) {
                $fields_by_key[$key] = $field['value'] ?? '';
            }
        }

        $feishu_fields = [
            '姓名'     => sanitize_text_field($fields_by_key['name']    ?? ''),
            '邮箱'     => sanitize_email($fields_by_key['email']        ?? ''),
            '询盘内容' => sanitize_textarea_field($fields_by_key['message'] ?? ''),
            '提交时间' => time() * 1000,
            '状态'     => '待跟进',
        ];

        Feishu_Bitable_API::create_record($feishu_fields);

        return $data; // 必须返回 $data
    }
}

// 注册自定义 Action
add_filter('ninja_forms_register_actions', function($actions) {
    $actions['feishu_sync'] = new Feishu_Ninja_Forms_Action();
    return $actions;
});
```

### Ninja Forms 调试：打印所有字段数据

```php
add_action('ninja_forms_after_submission', function($form_data) {
    // 临时调试：将字段数据写入日志，找到正确的 key 后删除此代码
    Feishu_Bitable_API::log('NF 字段数据: ' . wp_json_encode($form_data['fields'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
});
```

---

## 方案 E：Elementor Forms

Elementor Pro 的表单控件提供了 `elementor_pro/forms/new_record` 钩子。

### 前置要求

- **Elementor Pro**（免费版没有表单功能）
- 表单控件中的「字段 ID」需自行在表单编辑器设置

### 获取字段 ID

在 Elementor 编辑器中点击表单字段，在「Advanced」→「ID」中自定义字段ID，例如设置为 `name`、`email`、`phone`，方便后续代码引用。

### handlers/elementor.php

```php
<?php
/**
 * Elementor Pro Forms → 飞书多维表格
 *
 * 钩子：elementor_pro/forms/new_record
 * 参数：
 *   $record   (ElementorPro\Modules\Forms\Classes\Form_Record) 表单记录对象
 *   $handler  (ElementorPro\Modules\Forms\Classes\Ajax_Handler)  处理器
 */

if (!defined('ABSPATH')) exit;

add_action('elementor_pro/forms/new_record', 'feishu_sync_elementor_submission', 10, 2);

function feishu_sync_elementor_submission($record, $handler) {

    // ─── 可选：只处理指定表单名称 ──────────────────────────────────────
    $allowed_form_names = []; // 例如：['询盘表单', '报价申请']，留空则处理所有

    $form_name = $record->get_form_settings('form_name');
    if (!empty($allowed_form_names) && !in_array($form_name, $allowed_form_names, true)) {
        return;
    }
    // ────────────────────────────────────────────────────────────────────

    /**
     * Elementor Forms 字段数据获取方式：
     *
     * $record->get('fields') 返回所有字段数组
     * 每个字段结构：[
     *   'id'       => 字段ID（你在编辑器中设置的），
     *   'type'     => 字段类型（text/email/tel/textarea/select/checkbox/radio...）,
     *   'title'    => 字段标签,
     *   'value'    => 用户填写的值,
     *   'required' => 是否必填,
     * ]
     */

    // 按 ID 建立索引
    $raw_fields = $record->get('fields');
    $fields_by_id = [];
    foreach ($raw_fields as $field) {
        $fields_by_id[$field['id']] = $field['value'] ?? '';
    }

    // ─── 字段映射（使用你在 Elementor 编辑器中设置的字段 ID）───────────
    $feishu_fields = [
        '姓名'     => sanitize_text_field($fields_by_id['name']    ?? ''),
        '邮箱'     => sanitize_email($fields_by_id['email']        ?? ''),
        '电话'     => sanitize_text_field($fields_by_id['phone']   ?? ''),
        '公司'     => sanitize_text_field($fields_by_id['company'] ?? ''),
        '询盘内容' => sanitize_textarea_field($fields_by_id['message'] ?? ''),
        '来源表单' => sanitize_text_field($form_name),
        '来源页面' => sanitize_url($record->get_form_settings('referrer') ?? $_SERVER['HTTP_REFERER'] ?? ''),
        '提交时间' => time() * 1000,
        '状态'     => '待跟进',
    ];

    // ─── 写入飞书 ────────────────────────────────────────────────────────
    $result = Feishu_Bitable_API::create_record($feishu_fields);

    if (!$result['success']) {
        Feishu_Bitable_API::send_fallback_notification(
            $feishu_fields,
            $result['error'],
            'Elementor: ' . $form_name
        );
    }
}
```

### Elementor Forms 特殊字段处理

```php
// ── 复选框（Checkbox）——多选 ──
// Elementor checkbox 的 value 是以逗号分隔的字符串
$checkbox_raw = $fields_by_id['product_types'] ?? '';
$checkbox_arr = array_filter(array_map('trim', explode(',', $checkbox_raw)));
$feishu_fields['产品类型'] = array_map('sanitize_text_field', $checkbox_arr);
// 传给飞书多选字段：['产品A', '产品B']

// ── 单选（Radio）──
$feishu_fields['联系偏好'] = sanitize_text_field($fields_by_id['contact_pref'] ?? '');

// ── 下拉（Select）──
$feishu_fields['国家'] = sanitize_text_field($fields_by_id['country'] ?? '');

// ── 文件上传（Upload）——获取文件URL ──
// Elementor Pro 上传字段返回 attachment ID
$attachment_id = intval($fields_by_id['file'] ?? 0);
if ($attachment_id) {
    $feishu_fields['附件URL'] = wp_get_attachment_url($attachment_id) ?: '';
}

// ── 隐藏字段（Hidden）——传递 UTM 参数 ──
$feishu_fields['UTM来源'] = sanitize_text_field($fields_by_id['utm_source'] ?? '');
$feishu_fields['UTM关键词'] = sanitize_text_field($fields_by_id['utm_keyword'] ?? '');
```

### Elementor 调试：查看所有字段 ID

```php
add_action('elementor_pro/forms/new_record', function($record, $handler) {
    $raw = $record->get('fields');
    Feishu_Bitable_API::log('Elementor 字段: ' . wp_json_encode(
        array_map(fn($f) => ['id' => $f['id'], 'title' => $f['title'], 'value' => $f['value']], $raw),
        JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ));
}, 10, 2);
```

---

## 飞书多维表格字段类型完整对照

不同字段类型传参格式不同，这是写入失败最常见的原因之一。

| 飞书字段类型 | PHP 传参格式 | 示例 |
|---|---|---|
| 文本 | `string` | `'张三'` |
| 数字 | `int \| float` | `50000` |
| 单选 | `string`（选项名） | `'待跟进'` |
| 多选 | `string[]`（选项名数组） | `['产品A', '产品B']` |
| 日期 | `int`（毫秒时间戳） | `time() * 1000` |
| 复选框 | `bool` | `true` |
| 超链接 | `array` with `text` & `link` | `['text'=>'页面', 'link'=>'https://...']` |
| 人员 | `array` of `['id'=>'open_id']` | `[['id'=>'ou_xxx']]` |
| 邮箱 | `string` | `'user@example.com'` |
| 电话 | `string` | `'+86-138-0000-0000'` |

### 完整字段类型示例

```php
$feishu_fields = [
    // 文本
    '姓名'         => '张三',

    // 数字
    '预算金额'     => 50000,

    // 单选（传选项名称字符串，必须与飞书中配置的选项名完全一致）
    '状态'         => '待跟进',

    // 多选（传字符串数组）
    '需求类型'     => ['产品咨询', '价格询问'],

    // 日期（传毫秒时间戳）
    '提交时间'     => time() * 1000,
    '期望交货日期' => strtotime('2026-06-01') * 1000,

    // 复选框（传布尔值）
    '是否VIP'      => false,

    // 超链接
    '来源页面'     => [
        'text' => '产品详情页',
        'link' => 'https://yoursite.com/product/widget-x/',
    ],

    // 人员（需要用户的 open_id，可通过飞书 API 查询）
    '负责销售'     => [
        ['id' => 'ou_xxxxxxxxxxxxxxxxxxxxxxx'],
    ],

    // 邮箱
    '联系邮箱'     => 'customer@example.com',

    // 电话
    '联系电话'     => '+86-138-0000-0000',
];
```

---

## 生产环境加固

### 防重复提交

```php
/**
 * 基于内容哈希的防重复提交（10 分钟内）
 * 防止用户多次点击提交、网络抖动导致重复写入飞书
 */
function feishu_is_duplicate_submission(array $fields, int $window_seconds = 600): bool {
    // 使用邮箱 + 内容生成哈希（若无邮箱则换其他关键字段）
    $key_string = ($fields['邮箱'] ?? '') . '|' . ($fields['询盘内容'] ?? '') . '|' . ($fields['姓名'] ?? '');
    $hash       = 'feishu_dedup_' . md5($key_string);

    if (get_transient($hash)) {
        Feishu_Bitable_API::log("重复提交已拦截，Hash: {$hash}");
        return true;
    }

    set_transient($hash, 1, $window_seconds);
    return false;
}

// 在写入前调用
if (!feishu_is_duplicate_submission($feishu_fields)) {
    $result = Feishu_Bitable_API::create_record($feishu_fields);
}
```

### 异步写入（避免影响表单响应速度）

```php
/**
 * 将飞书写入任务加入 WordPress Cron 队列，
 * 不阻塞表单提交的响应，对用户体验更友好
 */
function feishu_schedule_record_creation(array $fields) {
    // 存入临时队列
    $queue_key = 'feishu_queue_' . uniqid('', true);
    set_transient($queue_key, $fields, HOUR_IN_SECONDS);

    // 调度一个 60 秒后执行的单次 Cron 任务
    wp_schedule_single_event(time() + 5, 'feishu_process_queue_item', [$queue_key]);
}

// Cron 任务回调
add_action('feishu_process_queue_item', function(string $queue_key) {
    $fields = get_transient($queue_key);
    if (!$fields) return;

    delete_transient($queue_key);

    $result = Feishu_Bitable_API::create_record($fields);
    if (!$result['success']) {
        Feishu_Bitable_API::send_fallback_notification($fields, $result['error'], '异步队列');
    }
});
```

### 本地备份（双保险）

```php
/**
 * 写入飞书的同时，在 WordPress 数据库保存本地副本
 * 当飞书 API 不可用时，可从本地数据补录
 */
function feishu_save_local_backup(array $fields, string $form_name = '') {
    global $wpdb;

    $table = $wpdb->prefix . 'feishu_form_submissions';

    // 建表（首次运行时）
    if ($wpdb->get_var("SHOW TABLES LIKE '{$table}'") !== $table) {
        $wpdb->query("CREATE TABLE {$table} (
            id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            form_name   VARCHAR(200) DEFAULT '',
            fields_json LONGTEXT NOT NULL,
            synced      TINYINT(1) DEFAULT 0,
            feishu_id   VARCHAR(100) DEFAULT '',
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) {$wpdb->get_charset_collate()};");
    }

    $wpdb->insert($table, [
        'form_name'   => sanitize_text_field($form_name),
        'fields_json' => wp_json_encode($fields, JSON_UNESCAPED_UNICODE),
        'synced'      => 0,
    ]);

    return $wpdb->insert_id;
}

// 用法：写入本地后再同步飞书，并标记同步状态
$local_id = feishu_save_local_backup($feishu_fields, '产品询盘表单');
$result   = Feishu_Bitable_API::create_record($feishu_fields);

if ($result['success']) {
    global $wpdb;
    $wpdb->update(
        $wpdb->prefix . 'feishu_form_submissions',
        ['synced' => 1, 'feishu_id' => $result['record_id']],
        ['id' => $local_id]
    );
}
```

---

## 调试与日志

### 开启 WordPress 调试日志

在 `wp-config.php` 中添加：

```php
define('WP_DEBUG',         true);
define('WP_DEBUG_LOG',     true);
define('WP_DEBUG_DISPLAY', false); // 不在前台显示错误
```

日志位置：`wp-content/debug.log`

### 快速测试：手动触发飞书写入

创建一个临时测试文件 `wp-content/plugins/feishu-form-sync/test.php`，访问后删除：

```php
<?php
// 临时测试文件，测试完毕后立即删除！
define('ABSPATH', dirname(dirname(dirname(dirname(__FILE__)))) . '/');
require_once ABSPATH . 'wp-load.php';
require_once plugin_dir_path(__FILE__) . 'class-feishu-api.php';

$test_fields = [
    '姓名'     => '测试用户',
    '邮箱'     => 'test@example.com',
    '电话'     => '13800138000',
    '询盘内容' => '这是一条测试数据，请忽略',
    '提交时间' => time() * 1000,
    '状态'     => '测试',
];

$result = Feishu_Bitable_API::create_record($test_fields);

echo '<pre>';
echo '写入结果: ' . ($result['success'] ? '✅ 成功' : '❌ 失败') . "\n";
echo 'Record ID: ' . ($result['record_id'] ?? 'N/A') . "\n";
echo '错误信息: ' . ($result['error'] ?? '无') . "\n";
echo '</pre>';
```

### 常见错误码速查

| 错误码 | 含义 | 解决方法 |
|--------|------|----------|
| `99991663` | Token 无效或过期 | 删除 Transient 缓存，检查 App ID / Secret |
| `99991661` | Token 格式错误 | 确认请求头格式：`Bearer {token}` |
| `1254200` | 找不到多维表格 | 检查 App Token 是否正确，应用是否为协作者 |
| `1254203` | 无写入权限 | 在多维表格中将应用权限升级为「编辑」 |
| `1254302` | 字段名不存在 | 检查飞书列名与代码中是否完全一致（包括空格） |
| `1254304` | 字段值类型错误 | 对照字段类型对照表检查传参格式 |
| `1254800` | 表格行数超限 | 飞书多维表格单表上限 50,000 行，需归档旧数据 |

---

## 各表单插件钩子速查表

| 表单插件 | 主钩子 | 参数 | 字段访问方式 |
|---------|--------|------|------------|
| Contact Form 7 | `wpcf7_mail_sent` | `$contact_form` | `WPCF7_Submission::get_instance()->get_posted_data()['字段名']` |
| WPForms | `wpforms_process_complete` | `$fields, $entry, $form_data, $entry_id` | `$fields[字段ID]['value']` |
| Gravity Forms | `gform_after_submission` | `$entry, $form` | `rgar($entry, '字段ID')` |
| Ninja Forms | `ninja_forms_after_submission` | `$form_data` | `$form_data['fields'][i]['value']`，按 key 索引 |
| Elementor Forms | `elementor_pro/forms/new_record` | `$record, $handler` | `$record->get('fields')[i]['value']`，按 id 索引 |

---

*适用版本：CF7 5.x｜WPForms 1.8.x｜Gravity Forms 2.8.x｜Ninja Forms 3.x｜Elementor Pro 3.x｜飞书开放平台 API v3*
