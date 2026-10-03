---
title: WordPress 询盘表单同步到飞书多维表格完整指南
slug: wordpress-feishu-sync
date: 2026-05-08T07:40:47.000Z
draft: false
description: 将 WordPress 询盘表单数据实时同步到飞书多维表格的四种主流方案完整指南
summary: >-
  涵盖 Make 自动化平台、Zapier、WordPress 插件 + Webhook、自定义 PHP
  代码四种方案，附飞书多维表格字段配置建议、常见问题排查与安全注意事项
tags:
  - WordPress
  - 飞书
  - Make
  - Zapier
  - Webhook
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
url: /blog/wordpress-feishu-sync/
---

# WordPress 询盘表单同步到飞书多维表格完整指南

> 本文详细介绍如何将 WordPress 网站的询盘表单数据实时同步到飞书多维表格，涵盖多种实现方案，适合不同技术水平的用户。

---

## 目录

1. [方案概览](#方案概览)
2. [方案一：使用 Make（原 Integromat）自动化平台](#方案一使用-make原-integromat自动化平台)
3. [方案二：使用 Zapier 连接](#方案二使用-zapier-连接)
4. [方案三：WordPress 插件 + 飞书 Webhook 直连](#方案三wordpress-插件--飞书-webhook-直连)
5. [方案四：自定义 PHP 代码直接调用飞书 API](#方案四自定义-php-代码直接调用飞书-api)
6. [飞书多维表格字段配置建议](#飞书多维表格字段配置建议)
7. [常见问题与排查](#常见问题与排查)
8. [安全注意事项](#安全注意事项)

---

## 方案概览

| 方案 | 技术难度 | 费用 | 实时性 | 稳定性 | 推荐人群 |
|------|----------|------|--------|--------|----------|
| Make 自动化平台 | ⭐ 低 | 有免费额度 | 近实时（分钟级） | 高 | 非技术用户 |
| Zapier | ⭐ 低 | 有免费额度 | 近实时（分钟级） | 高 | 非技术用户 |
| 插件 + Webhook | ⭐⭐ 中 | 免费 | 实时 | 中 | 有基础操作经验 |
| 自定义 PHP 代码 | ⭐⭐⭐ 高 | 免费 | 实时 | 高 | 开发者 |

---

## 方案一：使用 Make（原 Integromat）自动化平台

Make 是目前对国内用户最友好的自动化平台之一，支持 Contact Form 7、WPForms、Gravity Forms 等主流 WordPress 表单插件，同时支持飞书（Lark）API 调用。

### 1.1 前置准备

**WordPress 端：**
- 安装并启用 [WPForms](https://wordpress.org/plugins/wpforms-lite/) 或 [Contact Form 7](https://wordpress.org/plugins/contact-form-7/)
- 安装 Make for WordPress 插件（如需 Webhook 触发）

**飞书端：**
- 已创建飞书多维表格（Bitable）并配置好字段
- 拥有飞书开发者账号，已创建应用并获取 `App ID` 和 `App Secret`

### 1.2 飞书多维表格 API 配置

**步骤一：创建飞书自建应用**

1. 打开 [飞书开放平台](https://open.feishu.cn/)
2. 进入「开发者后台」→「创建企业自建应用」
3. 填写应用名称（如：WordPress询盘同步）
4. 进入「权限管理」，开通以下权限：
   - `bitable:app` — 多维表格应用权限
   - `bitable:app:readonly` — 读取多维表格
   - `bitable:record:create` — 创建记录（核心权限）
5. 发布应用版本并等待管理员审批

**步骤二：获取多维表格 App Token 和 Table ID**

打开目标多维表格，从 URL 中提取：

```
https://your-company.feishu.cn/base/BaNkbXXXXXXXXX?table=tblYYYYYYYY&view=vewZZZZZZZZ
                                        ↑                      ↑
                                   App Token              Table ID
```

### 1.3 在 Make 中配置工作流

**步骤一：新建 Scenario**

1. 登录 [Make.com](https://make.com)，点击「Create a new scenario」
2. 搜索并选择 `Webhooks` 模块作为触发器
3. 复制生成的 Webhook URL

**步骤二：WordPress 表单配置 Webhook**

以 WPForms 为例：
1. 进入 WPForms → 选择表单 → 编辑
2. 在「设置」→「通知」中，添加 Webhook 通知
3. 或安装 [WPForms Webhooks 插件](https://wpforms.com/docs/how-to-install-and-use-the-webhooks-addon/)，粘贴 Make 的 Webhook URL

**步骤三：在 Make 中添加 HTTP 请求模块**

添加 `HTTP → Make a request` 模块，调用飞书 API：

```
URL: https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records
Method: POST
Headers:
  Authorization: Bearer {{access_token}}
  Content-Type: application/json
Body (JSON):
{
  "fields": {
    "姓名": "{{1.name}}",
    "邮箱": "{{1.email}}",
    "电话": "{{1.phone}}",
    "询盘内容": "{{1.message}}",
    "提交时间": "{{formatDate(now; 'YYYY-MM-DD HH:mm:ss')}}"
  }
}
```

> **注意：** 飞书 Access Token 有效期为 2 小时，需要在 Make 中先调用 `/auth/v3/tenant_access_token/internal` 接口获取 Token，然后再调用写入接口。

**步骤四：获取飞书 Access Token 的模块配置**

在写入记录前，先添加一个 HTTP 请求获取 Token：

```
URL: https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal
Method: POST
Body (JSON):
{
  "app_id": "your_app_id",
  "app_secret": "your_app_secret"
}
```

从返回结果中提取 `tenant_access_token`，用于后续请求的 Authorization Header。

---

## 方案二：使用 Zapier 连接

Zapier 原生支持部分飞书操作，但飞书多维表格的深度集成需要借助 Webhook。

### 2.1 基本配置流程

1. 登录 [Zapier.com](https://zapier.com)，创建新 Zap
2. **Trigger（触发器）：** 选择 WordPress 或对应表单插件（如 Gravity Forms、WPForms）
3. **Action（动作）：** 选择 `Webhooks by Zapier` → `POST`

### 2.2 Action 配置

```
URL: https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records
Payload Type: json
Data:
  fields[姓名]: {{Name}}
  fields[邮箱]: {{Email}}
  fields[内容]: {{Message}}
Headers:
  Authorization: Bearer {预先生成的token}
  Content-Type: application/json
```

> **Zapier 的局限：** 由于飞书 Token 会过期，建议搭配定期刷新 Token 的机制，或使用 Make 的更灵活的多步骤流程。

---

## 方案三：WordPress 插件 + 飞书 Webhook 直连

适合熟悉 WordPress 管理后台，希望零成本实现的用户。

### 3.1 使用 Contact Form 7 + WP Webhooks 插件

**安装插件：**
- [Contact Form 7](https://wordpress.org/plugins/contact-form-7/)
- [WP Webhooks](https://wordpress.org/plugins/wp-webhooks/) — 免费版支持基础 Webhook 发送

**配置步骤：**

1. 在 WP Webhooks 中创建新的「Send Data」动作
2. 触发事件选择：`cf7_submit`（Contact Form 7 提交时触发）
3. 填写目标 URL（飞书 API 地址）

### 3.2 飞书机器人 Webhook 方案（最简单）

如果只是需要通知到飞书群，可以使用飞书群机器人 Webhook：

**在飞书群中添加自定义机器人：**
1. 打开飞书群 → 群设置 → 群机器人 → 添加机器人 → 自定义机器人
2. 复制生成的 Webhook 地址

**在 Contact Form 7 配置中添加钩子（需编辑 `functions.php`）：**

```php
add_action('wpcf7_mail_sent', 'send_to_feishu_bot');

function send_to_feishu_bot($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    if (!$submission) return;
    
    $data = $submission->get_posted_data();
    
    $webhook_url = 'https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_HOOK_TOKEN';
    
    $message = [
        'msg_type' => 'text',
        'content'  => [
            'text' => sprintf(
                "📬 新询盘来了！\n姓名：%s\n邮箱：%s\n电话：%s\n内容：%s\n时间：%s",
                $data['your-name'] ?? '未填写',
                $data['your-email'] ?? '未填写',
                $data['your-phone'] ?? '未填写',
                $data['your-message'] ?? '未填写',
                date('Y-m-d H:i:s')
            )
        ]
    ];
    
    wp_remote_post($webhook_url, [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode($message),
        'timeout' => 10,
    ]);
}
```

> **说明：** 此方案将数据推送到飞书群聊，适合快速通知，但不会写入多维表格。若需要写入多维表格，请参考方案四。

---

## 方案四：自定义 PHP 代码直接调用飞书 API

这是最灵活、最稳定的方案，适合有一定 PHP 开发经验的用户。

### 4.1 整体流程

```
用户提交表单
    ↓
WordPress 触发 Action Hook
    ↓
PHP 函数调用飞书 Auth API 获取 Token
    ↓
PHP 函数调用飞书 Bitable API 写入记录
    ↓
返回成功/失败状态
```

### 4.2 完整代码实现

在子主题的 `functions.php` 或自定义插件中添加以下代码：

**第一步：飞书 Token 获取函数**

```php
/**
 * 获取飞书租户访问令牌（缓存 1.5 小时）
 */
function get_feishu_access_token() {
    $cached = get_transient('feishu_access_token');
    if ($cached) {
        return $cached;
    }
    
    $app_id     = defined('FEISHU_APP_ID') ? FEISHU_APP_ID : 'your_app_id';
    $app_secret = defined('FEISHU_APP_SECRET') ? FEISHU_APP_SECRET : 'your_app_secret';
    
    $response = wp_remote_post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode([
            'app_id'     => $app_id,
            'app_secret' => $app_secret,
        ]),
        'timeout' => 15,
    ]);
    
    if (is_wp_error($response)) {
        error_log('[飞书] 获取 Token 失败: ' . $response->get_error_message());
        return false;
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    
    if (isset($body['tenant_access_token'])) {
        // 缓存 90 分钟（Token 有效期 2 小时，提前失效以防边界问题）
        set_transient('feishu_access_token', $body['tenant_access_token'], 90 * MINUTE_IN_SECONDS);
        return $body['tenant_access_token'];
    }
    
    error_log('[飞书] Token 返回异常: ' . print_r($body, true));
    return false;
}
```

**第二步：写入多维表格函数**

```php
/**
 * 向飞书多维表格写入一条记录
 *
 * @param array $fields 字段数据，键名需与多维表格字段名一致
 * @return bool 是否成功
 */
function insert_feishu_bitable_record(array $fields) {
    $token = get_feishu_access_token();
    if (!$token) {
        return false;
    }
    
    $app_token = defined('FEISHU_APP_TOKEN') ? FEISHU_APP_TOKEN : 'your_app_token';
    $table_id  = defined('FEISHU_TABLE_ID') ? FEISHU_TABLE_ID : 'your_table_id';
    
    $url = "https://open.feishu.cn/open-apis/bitable/v1/apps/{$app_token}/tables/{$table_id}/records";
    
    $response = wp_remote_post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $token,
            'Content-Type'  => 'application/json',
        ],
        'body'    => json_encode(['fields' => $fields]),
        'timeout' => 15,
    ]);
    
    if (is_wp_error($response)) {
        error_log('[飞书] 写入记录失败: ' . $response->get_error_message());
        return false;
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    
    if (isset($body['code']) && $body['code'] === 0) {
        return true;
    }
    
    error_log('[飞书] 写入记录异常: ' . print_r($body, true));
    return false;
}
```

**第三步：Contact Form 7 表单提交钩子**

```php
/**
 * Contact Form 7 提交后同步到飞书多维表格
 */
add_action('wpcf7_mail_sent', function($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    if (!$submission) return;
    
    $data = $submission->get_posted_data();
    
    // 字段映射：左边是飞书多维表格的字段名，右边是 CF7 表单字段名
    $fields = [
        '姓名'     => sanitize_text_field($data['your-name']    ?? ''),
        '邮箱'     => sanitize_email($data['your-email']        ?? ''),
        '电话'     => sanitize_text_field($data['your-phone']   ?? ''),
        '询盘内容' => sanitize_textarea_field($data['your-message'] ?? ''),
        '来源页面' => sanitize_url($data['_wpcf7_unit_tag']     ?? ''),
        '提交时间' => date('Y-m-d H:i:s'),
        '状态'     => '待跟进',
    ];
    
    $result = insert_feishu_bitable_record($fields);
    
    if (!$result) {
        // 可选：发送备用邮件通知管理员
        error_log('[飞书同步] 表单数据写入失败，表单ID: ' . $contact_form->id());
    }
});
```

**第四步：WPForms 表单提交钩子（可选替代 CF7）**

```php
/**
 * WPForms 提交后同步到飞书多维表格
 */
add_action('wpforms_process_complete', function($fields, $entry, $form_data, $entry_id) {
    // 只处理指定表单（通过表单 ID 过滤）
    $target_form_id = 123; // 替换为你的表单 ID
    if ($form_data['id'] != $target_form_id) return;
    
    // WPForms 字段通过 ID 访问，需根据实际字段 ID 调整
    $feishu_fields = [
        '姓名'     => sanitize_text_field($fields[1]['value']  ?? ''),
        '邮箱'     => sanitize_email($fields[2]['value']       ?? ''),
        '电话'     => sanitize_text_field($fields[3]['value']  ?? ''),
        '询盘内容' => sanitize_textarea_field($fields[4]['value'] ?? ''),
        '提交时间' => date('Y-m-d H:i:s'),
        '状态'     => '待跟进',
    ];
    
    insert_feishu_bitable_record($feishu_fields);
    
}, 10, 4);
```

**第五步：在 wp-config.php 中定义常量（推荐）**

```php
// 在 wp-config.php 中添加（勿直接写在主题文件）
define('FEISHU_APP_ID',     'cli_xxxxxxxxxxxxxxxxx');
define('FEISHU_APP_SECRET', 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
define('FEISHU_APP_TOKEN',  'BaNkbXXXXXXXXXXXXXXX');
define('FEISHU_TABLE_ID',   'tblYYYYYYYYYYYYYYYY');
```

### 4.3 处理飞书多维表格特殊字段类型

飞书多维表格的不同字段类型对应的数据格式不同：

```php
$fields = [
    // 文本字段 — 直接传字符串
    '姓名' => '张三',
    
    // 数字字段 — 传数值
    '预算金额' => 50000,
    
    // 日期字段 — 传毫秒时间戳
    '提交时间' => time() * 1000,
    
    // 单选字段 — 传选项名称字符串
    '状态' => '待跟进',
    
    // 多选字段 — 传字符串数组
    '产品类型' => ['产品A', '产品B'],
    
    // 复选框字段 — 传布尔值
    '是否跟进' => false,
    
    // URL 字段 — 传关联对象
    '来源链接' => [
        'text' => '产品页面',
        'link' => 'https://yoursite.com/product/',
    ],
    
    // 人员字段 — 传用户 open_id 数组
    '负责人' => [
        ['id' => 'ou_xxxxxxxxxxxxxxxxx']
    ],
];
```

---

## 飞书多维表格字段配置建议

### 推荐的询盘管理表格结构

| 字段名 | 字段类型 | 说明 |
|--------|----------|------|
| 询盘编号 | 自动编号 | 自动生成，唯一标识 |
| 姓名 | 文本 | 客户姓名 |
| 邮箱 | 邮箱 | 联系邮箱 |
| 电话 | 电话 | 联系电话 |
| 公司名称 | 文本 | 客户所在公司 |
| 询盘内容 | 多行文本 | 具体询盘信息 |
| 产品类型 | 多选 | 意向产品分类 |
| 来源页面 | 超链接 | 表单所在 URL |
| 提交时间 | 日期时间 | 表单提交时间 |
| 状态 | 单选 | 待跟进/跟进中/已成交/已放弃 |
| 负责销售 | 人员 | 分配的跟进人员 |
| 备注 | 多行文本 | 销售跟进记录 |

### 飞书多维表格视图建议

- **网格视图** — 全量数据管理
- **看板视图** — 按「状态」字段分组，便于销售管理跟进进度
- **甘特视图** — 按跟进时间管理长周期询盘
- **统计视图** — 汇总询盘来源、产品分布等数据

---

## 常见问题与排查

### Q1：数据写入失败，返回 code: 99991663

**原因：** Token 无效或已过期。

**解决：**
1. 检查 App ID 和 App Secret 是否正确
2. 确认应用已获得 `bitable:record:create` 权限
3. 确认应用已在飞书管理后台发布并审批通过
4. 删除 WordPress Transient 缓存：
   ```php
   delete_transient('feishu_access_token');
   ```

### Q2：返回 code: 1254200，找不到多维表格

**原因：** App Token 或 Table ID 错误，或应用没有该多维表格的访问权限。

**解决：**
1. 在多维表格右上角「分享」→「共享给」→ 将飞书应用添加为协作者
2. 重新核对 URL 中的 App Token 和 Table ID

### Q3：字段写入但显示为空

**原因：** 字段名称与多维表格中的列名不一致（区分全角/半角、空格）。

**解决：** 直接复制多维表格中的列名，不要手动输入。

### Q4：表单提交成功但飞书没有收到数据

**排查步骤：**
1. 检查 WordPress 错误日志（通常在 `wp-content/debug.log`）
2. 在 `wp-config.php` 中开启调试：
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```
3. 检查服务器是否能访问外网（`open.feishu.cn`）
4. 检查服务器防火墙是否限制了出站 HTTPS 请求

### Q5：Gravity Forms 如何配置

```php
add_action('gform_after_submission', function($entry, $form) {
    // 替换为你的 Gravity Forms 表单 ID
    if ($form['id'] != 5) return;
    
    $fields = [
        '姓名'     => rgar($entry, '1'),  // 字段 ID 1
        '邮箱'     => rgar($entry, '2'),  // 字段 ID 2
        '电话'     => rgar($entry, '3'),  // 字段 ID 3
        '询盘内容' => rgar($entry, '4'),  // 字段 ID 4
        '提交时间' => date('Y-m-d H:i:s'),
        '状态'     => '待跟进',
    ];
    
    insert_feishu_bitable_record($fields);
    
}, 10, 2);
```

---

## 安全注意事项

### 保护 API 凭证

- **不要**将 App ID、App Secret 直接硬编码在主题文件或插件中
- 推荐将敏感信息存储在 `wp-config.php` 的常量中，该文件在 Web 根目录之外
- 定期在飞书开放平台轮换 App Secret

### 数据安全

- 对所有用户输入进行 WordPress 内置的 `sanitize_*` 函数处理，再传给飞书 API
- 不要在多维表格中存储密码、身份证号等敏感信息
- 定期审查飞书应用的权限，按需最小化授权

### 防止重复提交

```php
// 为每条提交生成唯一标识，防止重复写入
$submission_hash = md5($data['your-email'] . $data['your-message'] . date('Y-m-d H'));
$cache_key = 'feishu_submission_' . $submission_hash;

if (get_transient($cache_key)) {
    // 1 小时内相同内容的重复提交，跳过写入
    return;
}
set_transient($cache_key, 1, HOUR_IN_SECONDS);

insert_feishu_bitable_record($fields);
```

### 失败重试机制

```php
/**
 * 简单的失败重试 + 备用邮件通知
 */
function insert_feishu_with_fallback(array $fields, string $fallback_email = '') {
    $success = insert_feishu_bitable_record($fields);
    
    if (!$success && $fallback_email) {
        // 飞书写入失败时，发送备用邮件通知
        $subject = '【询盘备份】飞书同步失败，请手动处理';
        $message = "飞书同步失败，询盘数据如下：\n\n";
        foreach ($fields as $key => $value) {
            $message .= "{$key}：{$value}\n";
        }
        wp_mail($fallback_email, $subject, $message);
    }
    
    return $success;
}
```

---

## 总结

| 使用场景 | 推荐方案 |
|----------|----------|
| 快速上手，无技术背景 | Make 自动化平台 |
| 已有 Zapier 账号 | Zapier + Webhooks |
| 希望免费且稳定 | 方案四（自定义 PHP） |
| 只需群通知，不需结构化数据 | 飞书群机器人 Webhook |

**推荐优先选择方案四（自定义 PHP）**，虽然初期需要一定配置工作，但它：
- 零额外费用
- 实时同步（无延迟）
- 完全可控，可灵活扩展字段
- 不依赖第三方自动化平台的稳定性

配置完成后，销售团队可以在飞书多维表格中实时看到新询盘，配合飞书的看板视图和自动化提醒，大幅提升询盘响应效率。

---

*最后更新：2026年5月 | 适用飞书开放平台 API v3*
