---
title: n8n 自建方案：WPForms → 飞书自动化 AI Prompt 分步执行指南
slug: n8n-wpforms-feishu-ai-prompts
date: 2026-05-08T08:29:59.000Z
draft: false
description: 使用 n8n 自托管方案实现 WPForms 表单数据到飞书多维表格的自动化同步，含完整 AI Prompt 分步指南
summary: 从 n8n 部署到飞书多维表格写入的 8 步完整 AI Prompt 执行指南，涵盖 Webhook 配置、字段映射、多表单路由、错误告警与运维监控
tags:
  - n8n
  - WPForms
  - 飞书
  - 自动化
  - WordPress
  - AI Prompt
  - CMS 与主题
  - 购物车与结账
  - 询盘与表单设计
  - 工具与自动化
categories:
  - 工程实践
  - 转化
  - 出海
cover: ''
author: Frida
url: /blog/n8n-wpforms-feishu-ai-prompts/
---

# n8n 自建方案：WPForms → 飞书自动化 AI Prompt 分步执行指南

> **使用方式**：将每个 Step 的 Prompt 复制到 Claude / ChatGPT / Cursor 等 AI 工具中执行。每步完成后再进行下一步，前一步的输出作为下一步的输入上下文。

---

## 总览：执行步骤

| Step | 任务 | 工具 |
|------|------|------|
| 1 | 部署 n8n 自托管环境 | AI + 终端 |
| 2 | 配置 WPForms Webhook 推送 | AI + WordPress 后台 |
| 3 | n8n 接收 Webhook 并解析字段 | AI + n8n 界面 |
| 4 | 创建飞书应用获取 API 凭证 | AI + 飞书开放平台 |
| 5 | n8n 写入飞书多维表格 | AI + n8n 界面 |
| 6 | 多表单路由与多站点区分 | AI + n8n 界面 |
| 7 | 定时导出汇总为 Markdown 文件 | AI + 终端/n8n |
| 8 | 错误告警与运维监控 | AI + n8n 界面 |

---

## Step 1：部署 n8n 自托管环境

### AI Prompt

```
你是一名 DevOps 工程师。请帮我在 Linux 服务器（Ubuntu 22.04）上用 Docker Compose 部署 n8n 自托管版本。

需求：
- 使用 Docker Compose 方式部署
- 配置持久化数据卷（SQLite 或 PostgreSQL 可选）
- 配置域名反向代理（Nginx + HTTPS，使用 Let's Encrypt 自动证书）
- 设置基础鉴权（用户名/密码登录）
- n8n 监听端口 5678，对外通过 https://n8n.yourdomain.com 访问
- Webhook 接收地址格式为：https://n8n.yourdomain.com/webhook/wpforms

请输出：
1. docker-compose.yml 完整内容
2. nginx.conf 反向代理配置
3. 部署步骤命令（含证书申请）
4. 启动验证方法
```

### 执行后检查点

- [ ] 访问 `https://n8n.yourdomain.com` 可打开登录页
- [ ] 登录成功进入工作流界面
- [ ] Webhook 测试地址可达（用 curl 测试返回 200）

---

## Step 2：配置 WPForms Webhook 推送

### AI Prompt

```
你是 WordPress 开发专家。我有多个 WordPress 网站，每个网站安装了 WPForms 插件，需要将表单提交数据实时推送到 n8n Webhook。

我的 n8n Webhook 接收地址：https://n8n.yourdomain.com/webhook/wpforms

需求：
1. 方式A：如果 WPForms 是 Pro 版，说明如何在表单设置中配置 Webhook（截图步骤描述）
2. 方式B：如果是免费版，给我一段 functions.php 代码，实现：
   - 监听所有表单提交事件（wpforms_process_complete）
   - 推送 JSON 格式数据到 Webhook，包含字段：
     * site_name（当前网站名称）
     * site_url（当前网站 URL）
     * form_id（表单 ID）
     * form_name（表单名称）
     * fields（所有字段键值对）
     * submitted_at（提交时间 ISO8601 格式）
   - 异步发送（blocking: false），不影响用户体验
   - 加入 HMAC 签名头 X-WPForms-Signature 用于验证来源

3. 给出测试方法：如何确认数据已成功推送到 n8n

请输出完整代码和配置步骤。
```

### 执行后检查点

- [ ] 提交测试表单后，n8n 收到 POST 请求
- [ ] JSON 数据包含 site_name、form_id、fields 等字段
- [ ] 多个站点的推送地址统一指向同一 n8n Webhook URL

---

## Step 3：n8n 接收 Webhook 并解析字段

### AI Prompt

```
你是 n8n 工作流专家。我已经在 n8n 中创建了一个 Webhook 节点，能接收来自多个 WordPress 站点 WPForms 表单的提交数据。

接收到的 JSON 数据结构如下（示例）：
{
  "site_name": "官网",
  "site_url": "https://example.com",
  "form_id": "12",
  "form_name": "联系我们",
  "submitted_at": "2026-05-08T10:30:00+08:00",
  "fields": {
    "name": { "label": "姓名", "value": "张三" },
    "email": { "label": "邮箱", "value": "zhangsan@example.com" },
    "message": { "label": "留言", "value": "你好，我有个问题..." }
  }
}

请帮我设计 n8n 工作流的前三个节点，并给出每个节点的 JSON 配置：
1. Webhook 节点：接收 POST 请求，路径为 /wpforms，返回 { "status": "ok" }
2. Code 节点（数据标准化）：
   - 提取 fields 中所有字段为扁平结构（如 fields.name.value → name）
   - 生成统一字段：来源站点、表单名称、提交时间（格式化为 YYYY-MM-DD HH:mm）
   - 保留原始 form_id 和 site_url
3. Set 节点（字段映射）：将处理后的字段重命名为飞书多维表格的列名

请输出每个节点的完整 JSON 配置，以及如何在 n8n 界面中导入这些配置。
```

### 执行后检查点

- [ ] Webhook 节点显示绿色（已激活）
- [ ] 测试执行后 Code 节点输出扁平字段
- [ ] Set 节点输出包含飞书目标列名

---

## Step 4：创建飞书应用获取 API 凭证

### AI Prompt

```
你是飞书开放平台集成专家。请指导我完成以下操作，并给出每一步的详细说明：

目标：获取飞书 API 凭证，用于在 n8n 中自动向飞书多维表格写入数据。

步骤指引：
1. 如何在飞书开放平台（open.feishu.cn）创建一个企业自建应用
2. 需要开通哪些权限（列出最小权限集，包括多维表格读写）
3. 如何获取 App ID 和 App Secret
4. 如何获取 tenant_access_token（给出完整 curl 命令）
5. 如何创建飞书多维表格并获取：
   - app_token（多维表格的唯一标识）
   - table_id（数据表的唯一标识）
6. 如何将飞书应用添加为多维表格的协作者（否则 API 写入会报 403）
7. 多维表格建议的列结构设计（列名、字段类型），用于汇总多个站点多个表单数据：
   - 来源站点（文本）
   - 表单名称（文本）
   - 提交时间（日期时间）
   - 姓名 / 邮箱 / 电话（文本，按需）
   - 原始数据（长文本，存 JSON 备用）

请输出完整的操作步骤和关键 API 请求示例。
```

### 执行后检查点

- [ ] 获得 App ID 和 App Secret
- [ ] curl 请求成功返回 tenant_access_token
- [ ] 获得 app_token 和 table_id
- [ ] 飞书应用已加入多维表格协作者
- [ ] 多维表格列结构已创建完毕

---

## Step 5：n8n 写入飞书多维表格

### AI Prompt

```
你是 n8n 和飞书 API 集成专家。请帮我在 n8n 中配置 HTTP Request 节点，将表单数据写入飞书多维表格。

已知信息：
- 飞书 tenant_access_token 获取接口：POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal
- App ID: {{填入你的 App ID}}
- App Secret: {{填入你的 App Secret}}
- 多维表格写入接口：POST https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records
- app_token: {{填入你的 app_token}}
- table_id: {{填入你的 table_id}}

n8n 上游节点已输出以下字段（用 $json 引用）：
- $json.site_name
- $json.form_name
- $json.submitted_at
- $json.name（姓名，可能为空）
- $json.email（邮箱，可能为空）
- $json.raw_fields（原始 JSON 字符串）

请帮我设计 n8n 工作流节点（JSON 配置）：
1. HTTP Request 节点 A：获取 tenant_access_token
2. HTTP Request 节点 B：写入多维表格一行记录
   - 使用节点 A 的 token
   - fields 对象映射到多维表格列名
   - 处理空字段（不传入 undefined）
3. 说明如何在 n8n 中用 Credentials 安全存储 App Secret，避免明文暴露

请输出节点完整 JSON 配置和连接顺序。
```

### 执行后检查点

- [ ] n8n 执行后飞书多维表格出现新增行
- [ ] 来源站点、表单名称字段正确填写
- [ ] 提交时间格式正确（飞书接受毫秒时间戳或 ISO 字符串）
- [ ] App Secret 存储在 n8n Credentials 中，未明文暴露

---

## Step 6：多表单路由与多站点区分

### AI Prompt

```
你是 n8n 工作流设计专家。我的系统需要接收来自 3 个 WordPress 站点、共 6 个不同表单的数据，需要根据不同来源将数据路由到飞书的不同数据表（或同一表但打不同标签）。

路由规则：
- 站点A + 联系表单（form_id=1） → 飞书表：销售线索表
- 站点A + 招聘表单（form_id=2） → 飞书表：HR 简历表
- 站点B + 报名表单（form_id=5） → 飞书表：活动报名表
- 其他所有表单 → 飞书表：通用汇总表

请帮我设计：
1. n8n Switch 节点配置（基于 site_url + form_id 组合路由）
2. 每条路由分支连接到对应的飞书写入节点
3. 默认分支（兜底）处理逻辑
4. 如果要在同一张飞书表中用「标签/分类」列区分来源，给出字段映射方案
5. 如何避免同一条数据重复写入（去重逻辑，基于 site_url + form_id + submitted_at 组合）

请输出 Switch 节点 JSON 配置和整体工作流结构描述。
```

### 执行后检查点

- [ ] 不同站点/表单数据进入对应飞书表
- [ ] 通用兜底分支正常捕获未匹配数据
- [ ] 重复提交不会写入两次

---

## Step 7：定时导出汇总为 Markdown 文件

### AI Prompt

```
你是 Python 脚本开发专家。请帮我编写一个脚本，定时从飞书多维表格读取所有表单数据，并生成结构化的 Markdown 汇总报告文件。

需求：
1. 读取飞书多维表格数据（使用 tenant_access_token，支持分页，每页最多 500 条）
2. 按「来源站点」和「表单名称」分组
3. 生成 Markdown 文件，结构如下：
   - 文件名：forms_report_YYYY-MM-DD.md
   - 包含：生成时间、总提交数、各站点统计摘要
   - 每个分组一个二级标题，下方为数据表格
   - 数据表格列：序号、姓名、邮箱、提交时间
4. 脚本支持通过环境变量配置：
   - FEISHU_APP_ID
   - FEISHU_APP_SECRET
   - FEISHU_APP_TOKEN
   - FEISHU_TABLE_ID
   - OUTPUT_DIR（输出目录，默认 ./reports）
5. 添加 cron 定时执行说明（每天 08:00 生成前一天报告）
6. 可选：将生成的 .md 文件自动上传到飞书云文档（给出实现思路和代码框架）

请输出完整 Python 脚本（含依赖 requirements.txt）和 cron 配置。
```

### 执行后检查点

- [ ] 脚本运行生成 `.md` 文件
- [ ] 文件包含按站点分组的数据表格
- [ ] cron 定时任务已配置
- [ ] 环境变量方式配置，无明文密钥

---

## Step 8：错误告警与运维监控

### AI Prompt

```
你是 n8n 运维专家。我的 WPForms → n8n → 飞书 自动化链路已搭建完成，现在需要添加错误监控和告警机制。

请帮我设计：

1. n8n 工作流错误处理：
   - 在每个关键节点后添加 Error Trigger 分支
   - 捕获飞书 API 返回的错误码（如 99991663 token 过期、1254700 无权限等）
   - 针对 token 过期自动刷新并重试（最多 3 次）

2. 飞书群机器人告警：
   - 工作流执行失败时，发送告警消息到飞书群
   - 消息内容包含：失败时间、站点来源、表单名称、错误原因、原始数据摘要
   - 给出 n8n HTTP Request 节点调用飞书 Webhook 机器人的完整配置

3. n8n 内置监控设置：
   - 如何查看工作流执行历史和成功率
   - 如何设置 n8n 自身的邮件告警（执行失败时发邮件）

4. 日志记录：
   - 在工作流中添加写入日志文件的节点（记录每次执行的时间、来源、状态）
   - 或将执行日志写入飞书多维表格的「运行日志」表

5. 健康检查：
   - 给出一个简单的 shell 脚本，检查 n8n 容器是否运行、最近 1 小时是否有成功执行记录
   - 配合 cron 每 10 分钟检查一次

请输出相关节点 JSON 配置和脚本代码。
```

### 执行后检查点

- [ ] 模拟飞书 API 失败，告警消息发送到群
- [ ] Token 过期后自动刷新并重试成功
- [ ] 日志表或日志文件正常记录执行情况
- [ ] 健康检查脚本运行正常

---

## 附录 A：完整 Prompt 串联使用示例

如果你希望用一个 AI 对话完成所有步骤，可以在开头提供如下上下文 Prompt，然后依次执行各步骤：

```
## 背景上下文（每次新对话时粘贴）

我正在构建一个自动化系统，将多个 WordPress 网站的 WPForms 表单数据汇总到飞书多维表格。

技术栈：
- 服务器：Ubuntu 22.04 VPS
- 自动化平台：n8n（Docker 自托管，地址 https://n8n.yourdomain.com）
- 表单插件：WPForms（部分 Pro，部分免费版）
- 目标：飞书多维表格（飞书企业版）
- 最终输出：每日自动生成 Markdown 格式汇总报告

已完成步骤：[列出已完成的 Step 编号]
当前进行：Step X - [步骤名称]

当前已知配置：
- n8n Webhook URL: https://n8n.yourdomain.com/webhook/wpforms
- 飞书 App ID: cli_xxxxxx
- 飞书 app_token: bascxxxxxx
- 飞书 table_id: tblxxxxxx

接下来请帮我完成 Step X 的任务……
```

---

## 附录 B：常见问题排查 Prompt

遇到问题时，使用以下 Prompt 快速定位：

```
## 排查 Prompt

我的 n8n → 飞书 自动化出现了以下错误：

错误信息：[粘贴完整错误信息]
发生节点：[节点名称]
请求 URL：[API URL]
返回状态码：[如 403 / 99991663 等]

请帮我：
1. 解释这个错误的具体原因
2. 给出修复步骤
3. 给出验证修复是否成功的方法
```

---

## 附录 C：飞书常见错误码速查

| 错误码 | 含义 | 解决方法 |
|--------|------|----------|
| 99991663 | token 无效或过期 | 重新获取 tenant_access_token |
| 1254700 | 应用无多维表格权限 | 开放平台添加 bitable:app 权限 |
| 1254001 | 表格不存在或无访问权限 | 将应用添加为表格协作者 |
| 400 | 字段类型不匹配 | 检查 fields 中日期/数字格式 |
| 429 | API 调用频率超限 | n8n 添加 Wait 节点，间隔 100ms |

---

*生成时间：2026-05-08 | 适用版本：n8n >= 1.0, 飞书开放平台 v3 API*
