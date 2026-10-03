---
title: WPForms 9 个表单同步飞书多维表格 — 详细实施方案
slug: wpforms-feishu-implementation
date: 2026-05-08T08:19:49.000Z
draft: false
description: 针对 9 个 WPForms 表单的飞书多维表格同步完整实施方案，含插件代码、字段映射与测试验证
summary: 基于自定义 PHP 插件实现 WPForms 表单数据实时同步到飞书多维表格，包含表单清单梳理、表结构设计、完整代码部署与字段映射校准指南
tags:
  - WPForms
  - 飞书
  - WordPress
  - PHP
  - 自动化
  - B2B
  - B2B 线索培育
  - CMS 与主题
  - 购物车与结账
  - B2B 建站架构
  - 询盘与表单设计
  - 工具与自动化
categories:
  - 工程实践
  - 转化
  - 获客
  - 出海
cover: ''
author: Frida
url: /blog/wpforms-feishu-implementation/
---

# WPForms 9 个表单同步飞书多维表格 — 详细实施方案

> 针对你现有的 9 个 WPForms 表单，基于 `wordpress-feishu-php-detail.md` 文档中的自定义 PHP 方案，给出可直接落地的完整实施指南。

---

## 一、你的表单清单梳理

| # | 表单名称 | ID | 类型 | 历史量 | 分布 | 同步策略 |
|---|---------|-----|------|--------|------|---------|
| 1 | **Whitepaper Download** | 19054 | 资料下载 | 2 | 1 | 高优先级（线索获取） |
| 2 | **Designer Contact Form** | 16313 | 设计师联系 | 3 | 1 | 中优先级 |
| 3 | **Become a Dealer** | 14859 | 经销商申请 | 129 | 3 | 高优先级（渠道拓展） |
| 4 | **Schedule a Meeting** | 12665 | 会议预约 | 3 | 4 | 高优先级（销售线索） |
| 5 | **Simple Contact for PPC Campaign** | 4254 | PPC 联系 | 580 | 7 | 高优先级（付费流量） |
| 6 | **Simple Quote** | 4232 | 简单报价 | 634 | 1 | 最高优先级（核心转化） |
| 7 | **Single Product Quote** | 4205 | 单品报价 | 366 | 0 | 最高优先级（核心转化） |
| 8 | **Advanced Quote** | 4170 | 高级报价 | 497 | 1 | 最高优先级（核心转化） |
| 9 | **Simple Contact** | 4050 | 简单联系 | 584 | 27 | 高优先级（自然流量） |

**核心观察**：
- Quote 类表单（Simple / Single Product / Advanced）是核心转化路径，历史数据量最大（合计 1497 条）
- Contact 类表单（Simple Contact / PPC / Designer）是流量承接，合计约 1167 条
- Dealer 和 Meeting 是高价值但低频的 B2B 线索
- Whitepaper Download 是内容营销线索，目前量很小但有增长潜力

---

## 二、飞书多维表格设计建议

### 方案推荐：单表统一管理 + 视图分流

建议只创建 **1 张多维表格**，通过「视图」和「筛选条件」来管理不同业务线，这样数据集中、便于统计、运维简单。

### 推荐表结构（列设计）

| 列名 | 类型 | 说明 | 适用表单 |
|------|------|------|---------|
| **姓名** | 文本 | 联系人姓名 | 全部 |
| **邮箱** | 邮箱 | 联系邮箱 | 全部 |
| **电话** | 电话 | 联系电话 | 全部 |
| **公司** | 文本 | 公司名称 | 全部 |
| **国家/地区** | 文本 | 客户所在国家 | Dealer / Contact |
| **询盘内容** | 文本 | 留言/需求描述 | Contact / Quote |
| **产品型号** | 文本 | 询价产品型号 | Quote 类 |
| **数量** | 数字 | 询价数量 | Quote 类 |
| **预算金额** | 数字 | 客户预算 | Advanced Quote |
| **期望交货日期** | 日期 | 交货时间要求 | Advanced Quote |
| **业务类型** | 单选 | Dealer / Distributor / Agent | Become a Dealer |
| **会议主题** | 文本 | 预约会议主题 | Schedule a Meeting |
| **期望日期** | 日期 | 期望会议时间 | Schedule a Meeting |
| **UTM来源** | 文本 | 广告来源标记 | PPC Campaign |
| **来源表单** | 单选 | Whitepaper / Contact / Quote... | 全部（自动写入） |
| **来源页面** | 超链接 | 提交页面的 URL | 全部（自动写入） |
| **提交时间** | 日期 | 表单提交时间 | 全部（自动写入） |
| **状态** | 单选 | 待跟进 / 已联系 / 已报价 / 已成交 / 无效 | 全部 |
| **客户等级** | 单选 | A级 / B级 / C级 | 全部（可按预算自动判断） |
| **负责人** | 人员 | 销售负责人 | 手动分配 |

> **注意**：飞书多维表格支持「隐藏列」和「视图筛选」。你可以为销售团队创建多个视图：
> - 【Quote 报价视图】筛选 `来源表单` 包含 Quote
> - 【Dealer 渠道视图】筛选 `来源表单` = Become a Dealer
> - 【PPC 流量视图】筛选 `来源表单` = Simple Contact for PPC Campaign
> - 【我的待跟进】筛选 `状态` = 待跟进 且 `负责人` = 当前用户

---

## 三、前置准备（部署前必须完成）

### 步骤 1：创建飞书自建应用

1. 访问 [飞书开放平台](https://open.feishu.cn/) → 开发者后台 → 创建企业自建应用
2. 应用名称建议：`WordPress 询盘同步`
3. 进入「权限管理」，申请以下权限：
   - `bitable:app`
   - `bitable:record:create`
4. 点击「发布版本」→ 创建版本 → 申请发布 → 让企业管理员审批通过

### 步骤 2：获取多维表格标识

1. 在飞书创建新的多维表格，命名为 `WordPress 询盘总表`
2. 按上方建议创建列（至少先创建：`姓名`、`邮箱`、`电话`、`来源表单`、`提交时间`、`状态`）
3. 打开表格，从 URL 提取：
   ```
   https://your-company.feishu.cn/base/BaNkbXXXXXX?table=tblYYYYYYYY
   ```
   - `App Token` = `BaNkbXXXXXX`
   - `Table ID` = `tblYYYYYYYY`

### 步骤 3：将应用添加为协作者

多维表格右上角「···」→「添加协作者」→ 搜索你的应用名称 → 权限设为「可编辑」

### 步骤 4：在 wp-config.php 定义常量

编辑 WordPress 根目录的 `wp-config.php`，在 `/* That's all, stop editing! */` 之前添加：

```php
// 飞书多维表格同步配置
define('FEISHU_APP_ID',     'cli_xxxxxxxxxxxxxxx');   // 你的飞书 App ID
define('FEISHU_APP_SECRET', 'xxxxxxxxxxxxxxxxxxxxxxx'); // 你的飞书 App Secret
define('FEISHU_APP_TOKEN',  'BaNkbXXXXXXXXXXXXXXX');  // 多维表格 App Token
define('FEISHU_TABLE_ID',   'tblYYYYYYYYYYYYYYYY');   // 数据表 Table ID
```

### 步骤 5：开启调试日志（首次部署需要）

同样在 `wp-config.php` 中：

```php
define('WP_DEBUG',         true);
define('WP_DEBUG_LOG',     true);
define('WP_DEBUG_DISPLAY', false); // 不在前台显示，只写入日志
```

日志位置：`wp-content/debug.log`

---

## 四、代码部署

### 文件结构

将以下文件上传到你的 WordPress 站点：

```
wp-content/
└── plugins/
    └── feishu-form-sync/
        ├── feishu-form-sync.php      ← 插件入口
        ├── class-feishu-api.php      ← 飞书 API 核心封装
        └── handlers/
            └── wpforms.php           ← WPForms 处理器（已针对你的9个表单定制）
```

### 步骤 1：创建插件目录并上传文件

通过 FTP / SFTP / 文件管理器，在 `wp-content/plugins/` 下创建 `feishu-form-sync` 目录及其子目录 `handlers`。

### 步骤 2：上传代码文件

三个文件的完整代码见下文 **五、完整代码**。

### 步骤 3：激活插件

进入 WordPress 后台 → 插件 → 找到「飞书多维表格询盘同步」→ 点击启用。

---

## 五、完整代码

### 文件 1：feishu-form-sync.php（插件入口）

```php
<?php
/**
 * Plugin Name: 飞书多维表格询盘同步
 * Plugin URI:  https://yoursite.com
 * Description: 将 WordPress WPForms 表单数据实时同步到飞书多维表格
 * Version:     1.0.0
 * Author:      Your Name
 * Text Domain: feishu-form-sync
 */

if (!defined('ABSPATH')) exit;

// 加载核心 API 类
require_once plugin_dir_path(__FILE__) . 'class-feishu-api.php';

// 加载 WPForms 处理器
require_once plugin_dir_path(__FILE__) . 'handlers/wpforms.php';
```

### 文件 2：class-feishu-api.php（飞书 API 封装）

> 此文件与原文档一致，负责 Token 管理、记录写入、错误处理和备用邮件通知。见原文档或下方完整代码。

```php
<?php
/**
 * 飞书多维表格 API 封装类
 */

if (!defined('ABSPATH')) exit;

class Feishu_Bitable_API {

    const BASE_URL = 'https://open.feishu.cn/open-apis';
    const TOKEN_TRANSIENT = 'feishu_tenant_access_token';

    public static function get_access_token() {
        $cached_token = get_transient(self::TOKEN_TRANSIENT);
        if (!empty($cached_token)) {
            return $cached_token;
        }

        if (!defined('FEISHU_APP_ID') || !defined('FEISHU_APP_SECRET')) {
            self::log('错误：未定义 FEISHU_APP_ID 或 FEISHU_APP_SECRET 常量');
            return false;
        }

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

        set_transient(self::TOKEN_TRANSIENT, $body['tenant_access_token'], 90 * MINUTE_IN_SECONDS);
        self::log('成功获取新 Token，已缓存 90 分钟');
        return $body['tenant_access_token'];
    }

    public static function refresh_token() {
        delete_transient(self::TOKEN_TRANSIENT);
        return self::get_access_token();
    }

    public static function create_record(array $fields, string $app_token = '', string $table_id = '') {
        if (empty($app_token)) {
            $app_token = defined('FEISHU_APP_TOKEN') ? FEISHU_APP_TOKEN : '';
        }
        if (empty($table_id)) {
            $table_id = defined('FEISHU_TABLE_ID') ? FEISHU_TABLE_ID : '';
        }

        if (empty($app_token) || empty($table_id)) {
            $error = '错误：App Token 或 Table ID 为空';
            self::log($error);
            return ['success' => false, 'record_id' => null, 'error' => $error];
        }

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

    public static function log(string $message) {
        if (defined('WP_DEBUG') && WP_DEBUG && defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
            error_log('[飞书同步] ' . $message);
        }
    }
}
```

### 文件 3：handlers/wpforms.php（核心 — 已针对你的 9 个表单定制）

```php
<?php
/**
 * WPForms → 飞书多维表格
 *
 * 已针对以下 9 个表单定制：
 *   19054 Whitepaper Download
 *   16313 Designer Contact Form
 *   14859 Become a Dealer
 *   12665 Schedule a Meeting
 *   4254  Simple Contact for PPC Campaign
 *   4232  Simple Quote
 *   4205  Single Product Quote
 *   4170  Advanced Quote
 *   4050  Simple Contact
 *
 * 钩子：wpforms_process_complete
 */

if (!defined('ABSPATH')) exit;

add_action('wpforms_process_complete', 'feishu_sync_wpforms_submission', 10, 4);

function feishu_sync_wpforms_submission($fields, $entry, $form_data, $entry_id) {

    $form_id    = (int) $form_data['id'];
    $form_title = sanitize_text_field($form_data['settings']['form_title'] ?? "Form #{$form_id}");

    // ─── 1. 只处理指定的 9 个表单 ───────────────────────────────────────
    $allowed_form_ids = [19054, 16313, 14859, 12665, 4254, 4232, 4205, 4170, 4050];

    if (!in_array($form_id, $allowed_form_ids, true)) {
        return;
    }

    // ─── 2. 调试模式：首次部署时开启，记录字段结构到日志 ──────────────
    // 开启 WP_DEBUG 后，每次提交会在 wp-content/debug.log 中输出字段结构
    // 你可以根据日志中的 id / name 来精确配置下方的字段映射
    if (defined('WP_DEBUG') && WP_DEBUG) {
        Feishu_Bitable_API::log("[WPForms Debug] Form ID: {$form_id}, Title: {$form_title}");
        Feishu_Bitable_API::log("[WPForms Debug] 字段结构: " . wp_json_encode(
            array_map(fn($f) => [
                'id'       => $f['id']       ?? '',
                'type'     => $f['type']     ?? '',
                'name'     => $f['name']     ?? '',
                'value'    => $f['value']    ?? '',
            ], $fields),
            JSON_UNESCAPED_UNICODE
        ));
    }

    // ─── 3. 辅助函数：按标签名查找字段值 ────────────────────────────────
    // WPForms 的 $fields[字段ID] 结构包含 'name'（标签）和 'value'（值）
    // 先通过标签名匹配，适配大多数场景；如需更精确，可改用字段 ID
    $get_by_label = function(string $label, string $default = '') use ($fields): string {
        foreach ($fields as $field) {
            if (strcasecmp(trim($field['name'] ?? ''), trim($label)) === 0) {
                return sanitize_text_field($field['value'] ?? $default);
            }
        }
        return $default;
    };

    $get_textarea_by_label = function(string $label, string $default = '') use ($fields): string {
        foreach ($fields as $field) {
            if (strcasecmp(trim($field['name'] ?? ''), trim($label)) === 0) {
                return sanitize_textarea_field($field['value'] ?? $default);
            }
        }
        return $default;
    };

    $get_email_by_label = function(string $label, string $default = '') use ($fields): string {
        foreach ($fields as $field) {
            if (strcasecmp(trim($field['name'] ?? ''), trim($label)) === 0) {
                return sanitize_email($field['value'] ?? $default);
            }
        }
        return $default;
    };

    // ─── 4. 按表单 ID 分流映射 ───────────────────────────────────────────
    $feishu_fields = [];

    switch ($form_id) {

        // ───────────────────────────────────────────────────────────────
        // 1. Whitepaper Download（资料下载）
        // ───────────────────────────────────────────────────────────────
        case 19054:
            $feishu_fields = [
                '姓名'     => $get_by_label('Name'),
                '邮箱'     => $get_email_by_label('Email'),
                '公司'     => $get_by_label('Company'),
                '职位'     => $get_by_label('Job Title'),
                '需求类型' => $get_by_label('Interested In'),
                '来源表单' => 'Whitepaper Download',
                '来源页面' => sanitize_url($_SERVER['HTTP_REFERER'] ?? ''),
                '提交时间' => time() * 1000,
                '状态'     => '待发送资料',
            ];
            break;

        // ───────────────────────────────────────────────────────────────
        // 2. Designer Contact Form（设计师联系）
        // ───────────────────────────────────────────────────────────────
        case 16313:
            $feishu_fields = [
                '姓名'     => $get_by_label('Name'),
                '邮箱'     => $get_email_by_label('Email'),
                '电话'     => $get_by_label('Phone'),
                '公司'     => $get_by_label('Company'),
                '询盘内容' => $get_textarea_by_label('Message'),
                '来源表单' => 'Designer Contact Form',
                '来源页面' => sanitize_url($_SERVER['HTTP_REFERER'] ?? ''),
                '提交时间' => time() * 1000,
                '状态'     => '待跟进',
            ];
            break;

        // ───────────────────────────────────────────────────────────────
        // 3. Become a Dealer（经销商申请）
        // ───────────────────────────────────────────────────────────────
        case 14859:
            $feishu_fields = [
                '姓名'     => $get_by_label('Name'),
                '邮箱'     => $get_email_by_label('Email'),
                '电话'     => $get_by_label('Phone'),
                '公司'     => $get_by_label('Company Name'),
                '国家/地区'=> $get_by_label('Country'),
                '询盘内容' => $get_textarea_by_label('Message'),
                '业务类型' => $get_by_label('Business Type'),
                '来源表单' => 'Become a Dealer',
                '来源页面' => sanitize_url($_SERVER['HTTP_REFERER'] ?? ''),
                '提交时间' => time() * 1000,
                '状态'     => '待审核',
            ];
            break;

        // ───────────────────────────────────────────────────────────────
        // 4. Schedule a Meeting（会议预约）
        // ───────────────────────────────────────────────────────────────
        case 12665:
            $meeting_date_raw = $get_by_label('Preferred Date');
            $feishu_fields = [
                '姓名'     => $get_by_label('Name'),
                '邮箱'     => $get_email_by_label('Email'),
                '电话'     => $get_by_label('Phone'),
                '公司'     => $get_by_label('Company'),
                '期望日期' => !empty($meeting_date_raw) ? strtotime($meeting_date_raw) * 1000 : null,
                '会议主题' => $get_textarea_by_label('Meeting Topic'),
                '来源表单' => 'Schedule a Meeting',
                '来源页面' => sanitize_url($_SERVER['HTTP_REFERER'] ?? ''),
                '提交时间' => time() * 1000,
                '状态'     => '待安排',
            ];
            break;

        // ───────────────────────────────────────────────────────────────
        // 5. Simple Contact for PPC Campaign（PPC 联系）
        // ───────────────────────────────────────────────────────────────
        case 4254:
            $feishu_fields = [
                '姓名'     => $get_by_label('Name'),
                '邮箱'     => $get_email_by_label('Email'),
                '电话'     => $get_by_label('Phone'),
                '询盘内容' => $get_textarea_by_label('Message'),
                'UTM来源'  => $get_by_label('UTM Source'), // 若表单中有隐藏字段传 UTM
                '来源表单' => 'PPC Campaign',
                '来源页面' => sanitize_url($_SERVER['HTTP_REFERER'] ?? ''),
                '提交时间' => time() * 1000,
                '状态'     => '待跟进',
                '客户等级' => 'B 级（付费流量）',
            ];
            break;

        // ───────────────────────────────────────────────────────────────
        // 6. Simple Quote（简单报价）
        // ───────────────────────────────────────────────────────────────
        case 4232:
            $feishu_fields = [
                '姓名'     => $get_by_label('Name'),
                '邮箱'     => $get_email_by_label('Email'),
                '电话'     => $get_by_label('Phone'),
                '公司'     => $get_by_label('Company'),
                '产品型号' => $get_by_label('Product'),
                '数量'     => is_numeric($get_by_label('Quantity')) ? floatval($get_by_label('Quantity')) : null,
                '询盘内容' => $get_textarea_by_label('Message'),
                '来源表单' => 'Simple Quote',
                '来源页面' => sanitize_url($_SERVER['HTTP_REFERER'] ?? ''),
                '提交时间' => time() * 1000,
                '状态'     => '待报价',
            ];
            break;

        // ───────────────────────────────────────────────────────────────
        // 7. Single Product Quote（单品报价）
        // ───────────────────────────────────────────────────────────────
        case 4205:
            $feishu_fields = [
                '姓名'     => $get_by_label('Name'),
                '邮箱'     => $get_email_by_label('Email'),
                '电话'     => $get_by_label('Phone'),
                '公司'     => $get_by_label('Company'),
                '产品型号' => $get_by_label('Product Model'),
                '数量'     => is_numeric($get_by_label('Quantity')) ? floatval($get_by_label('Quantity')) : null,
                '来源表单' => 'Single Product Quote',
                '来源页面' => sanitize_url($_SERVER['HTTP_REFERER'] ?? ''),
                '提交时间' => time() * 1000,
                '状态'     => '待报价',
            ];
            break;

        // ───────────────────────────────────────────────────────────────
        // 8. Advanced Quote（高级报价）
        // ───────────────────────────────────────────────────────────────
        case 4170:
            $delivery_raw = $get_by_label('Delivery Date');
            $budget_raw   = $get_by_label('Budget');
            $feishu_fields = [
                '姓名'         => $get_by_label('Name'),
                '邮箱'         => $get_email_by_label('Email'),
                '电话'         => $get_by_label('Phone'),
                '公司'         => $get_by_label('Company'),
                '产品型号'     => $get_by_label('Product'),
                '数量'         => is_numeric($get_by_label('Quantity')) ? floatval($get_by_label('Quantity')) : null,
                '预算金额'     => is_numeric($budget_raw) ? floatval($budget_raw) : null,
                '期望交货日期' => !empty($delivery_raw) ? strtotime($delivery_raw) * 1000 : null,
                '询盘内容'     => $get_textarea_by_label('Message'),
                '来源表单'     => 'Advanced Quote',
                '来源页面'     => sanitize_url($_SERVER['HTTP_REFERER'] ?? ''),
                '提交时间'     => time() * 1000,
                '状态'         => '待报价',
            ];
            // 根据预算自动判断客户等级
            if (!empty($feishu_fields['预算金额'])) {
                $budget = $feishu_fields['预算金额'];
                $feishu_fields['客户等级'] = match(true) {
                    $budget >= 100000 => 'A 级（高价值）',
                    $budget >= 10000  => 'B 级（中等）',
                    default           => 'C 级（普通）',
                };
            }
            break;

        // ───────────────────────────────────────────────────────────────
        // 9. Simple Contact（简单联系）
        // ───────────────────────────────────────────────────────────────
        case 4050:
            $feishu_fields = [
                '姓名'     => $get_by_label('Name'),
                '邮箱'     => $get_email_by_label('Email'),
                '电话'     => $get_by_label('Phone'),
                '询盘内容' => $get_textarea_by_label('Message'),
                '来源表单' => 'Simple Contact',
                '来源页面' => sanitize_url($_SERVER['HTTP_REFERER'] ?? ''),
                '提交时间' => time() * 1000,
                '状态'     => '待跟进',
            ];
            break;
    }

    // ─── 5. 过滤空值（避免覆盖飞书默认值） ──────────────────────────────
    $feishu_fields = array_filter($feishu_fields, fn($v) => $v !== '' && $v !== null && $v !== []);

    // ─── 6. 防重复提交（10 分钟窗口） ───────────────────────────────────
    $dedup_key = 'feishu_dedup_' . md5(
        ($feishu_fields['邮箱'] ?? '') . '|' .
        ($feishu_fields['询盘内容'] ?? '') . '|' .
        ($feishu_fields['姓名'] ?? '') . '|' .
        $form_id
    );
    if (get_transient($dedup_key)) {
        Feishu_Bitable_API::log("重复提交已拦截，Form: {$form_id}");
        return;
    }
    set_transient($dedup_key, 1, 10 * MINUTE_IN_SECONDS);

    // ─── 7. 写入飞书多维表格 ────────────────────────────────────────────
    $result = Feishu_Bitable_API::create_record($feishu_fields);

    if (!$result['success']) {
        Feishu_Bitable_API::send_fallback_notification(
            $feishu_fields,
            $result['error'],
            "WPForms: {$form_title}"
        );
    }
}
```

---

## 六、字段映射校准指南（关键步骤）

上方的 `wpforms.php` 使用了**按标签名匹配**的策略，这种方式在字段标签是标准英文时（如 Name / Email / Phone）可以直接工作。但如果你的表单使用了自定义标签名，就需要校准。

### 如何获取准确的字段信息

**方法一：查看 debug.log（推荐）**

1. 确保 `wp-config.php` 中 `WP_DEBUG_LOG` 为 `true`
2. 在浏览器中提交一次测试数据
3. 查看 `wp-content/debug.log`，你会看到类似：

```
[飞书同步] [WPForms Debug] Form ID: 19054, Title: Whitepaper Download
[飞书同步] [WPForms Debug] 字段结构: [
  {"id":0,"type":"name","name":"Name","value":"Test User"},
  {"id":1,"type":"email","name":"Email","value":"test@example.com"},
  {"id":2,"type":"text","name":"Company","value":"ABC Corp"},
  ...
]
```

**方法二：在 WPForms 后台查看字段 ID**

1. 进入 WPForms → 选择一个表单 → 编辑
2. 点击任意字段，右侧面板会显示 **Field ID**
3. 记录下每个字段的 ID 数字

### 如果需要改用字段 ID 精确映射

在 `wpforms.php` 中，将 `$get_by_label('Name')` 替换为：

```php
sanitize_text_field($fields[1]['value'] ?? ''), // 假设 Name 的字段 ID 是 1
```

建议先用标签名匹配快速上线，后续再逐步优化为字段 ID 映射，以提高稳定性。

---

## 七、测试验证流程

### 步骤 1：测试 Token 获取

创建一个临时测试文件 `wp-content/plugins/feishu-form-sync/test.php`：

```php
<?php
define('ABSPATH', dirname(dirname(dirname(dirname(__FILE__)))) . '/');
require_once ABSPATH . 'wp-load.php';
require_once plugin_dir_path(__FILE__) . 'class-feishu-api.php';

$test_fields = [
    '姓名'     => '测试用户',
    '邮箱'     => 'test@example.com',
    '电话'     => '13800138000',
    '询盘内容' => '这是一条测试数据，请忽略',
    '来源表单' => '系统测试',
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

通过浏览器访问：`https://yoursite.com/wp-content/plugins/feishu-form-sync/test.php`

- 若显示 **✅ 成功** 且飞书表格出现测试数据 → Token 和表格配置正确
- 若显示错误 → 对照下方常见错误码排查

**测试完毕后务必删除 `test.php` 文件！**

### 步骤 2：逐表单提交测试

对每个表单提交一条测试数据，检查：
1. `debug.log` 中是否记录了字段结构
2. 飞书表格中是否出现了对应记录
3. 各字段是否正确映射（姓名、邮箱、来源表单等）

### 步骤 3：关闭调试模式（生产环境）

测试全部通过后，将 `wp-config.php` 中的调试常量改为：

```php
define('WP_DEBUG',         false);
define('WP_DEBUG_LOG',     false);
define('WP_DEBUG_DISPLAY', false);
```

---

## 八、常见错误码速查

| 错误码 | 含义 | 解决方法 |
|--------|------|----------|
| `99991663` | Token 无效或过期 | 删除 Transient 缓存，检查 App ID / Secret |
| `99991661` | Token 格式错误 | 确认请求头格式：`Bearer {token}` |
| `1254200` | 找不到多维表格 | 检查 App Token 是否正确，应用是否为协作者 |
| `1254203` | 无写入权限 | 在多维表格中将应用权限升级为「编辑」 |
| `1254302` | 字段名不存在 | 检查飞书列名与代码中是否完全一致（包括空格） |
| `1254304` | 字段值类型错误 | 对照字段类型对照表检查传参格式 |
| `1254800` | 表格行数超限 | 单表上限 50,000 行，需归档旧数据 |

---

## 九、进阶优化建议

### 1. 历史数据批量导入

如果你希望把已有的 2000+ 条历史数据也导入飞书，可以使用 WPForms 的 Entries 导出功能（需 Pro 版），导出 CSV 后通过飞书「导入数据」功能批量上传。

### 2. 按来源页面区分渠道质量

代码中已经自动记录了 `来源页面`，你可以在飞书中：
- 创建「来源域名」列，用公式提取 URL 中的域名
- 统计不同页面的转化率

### 3. 自动化通知

在飞书多维表格中设置「自动化流程」：
- 当新记录创建时 → 发送飞书消息给销售群
- 当 `状态` 变更为「待报价」超过 24 小时 → 发送提醒给负责人

### 4. 多表分流（未来扩展）

如果业务增长后单表太乱，可以修改代码实现多表分流：

```php
// 在 wpforms.php 的 switch 中，为 Quote 类表单指定不同的 App Token / Table ID
$result = Feishu_Bitable_API::create_record(
    $feishu_fields,
    '另一个AppToken',  // 报价专用表格
    '另一个TableID'
);
```

---

## 十、部署检查清单

- [ ] 飞书自建应用已创建并发布审批通过
- [ ] 已申请 `bitable:app` 和 `bitable:record:create` 权限
- [ ] 已获取 App Token 和 Table ID
- [ ] 已将应用添加为多维表格协作者（编辑权限）
- [ ] `wp-config.php` 中已定义 `FEISHU_APP_ID`、`FEISHU_APP_SECRET`、`FEISHU_APP_TOKEN`、`FEISHU_TABLE_ID`
- [ ] 已开启 `WP_DEBUG` 和 `WP_DEBUG_LOG`
- [ ] 已上传插件文件到 `wp-content/plugins/feishu-form-sync/`
- [ ] 已在 WordPress 后台激活插件
- [ ] 已通过 `test.php` 验证 API 连通性
- [ ] 已对每个表单提交测试数据并验证字段映射
- [ ] 已关闭 `WP_DEBUG_LOG`（生产环境）
- [ ] 已删除 `test.php`

---

*基于 wordpress-feishu-php-detail.md 方案 B（WPForms）定制，适用 WPForms 1.8.x+*
