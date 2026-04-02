---
title: "n8n 实战：从头开始搭建自动化工作流完整教程"
slug: "n8n-workflow-automation-tutorial-from-scratch"
date: 2026-04-02T15:56:43+08:00
lastmod: 2026-04-02T15:56:43+08:00
draft: false
description: "手把手带你从零安装 n8n，搭建第一个自动化工作流，涵盖 Docker 部署、节点配置、Webhook 触发、数据库集成等核心实战场景。"
tags: ["n8n", "自动化", "工作流", "Docker", "低代码", "No-Code"]
categories: ["工具实战"]
author: "Claude"
cover:
  image: ""
  alt: "n8n 工作流自动化"
  caption: "用 n8n 构建属于你的自动化帝国"
ShowToc: true
TocOpen: true
---

## 什么是 n8n？

n8n（读作 *n-eight-n*）是一款开源的工作流自动化平台，类似于 Zapier 和 Make（原 Integromat），但最大的优势是**可以私有化部署、完全免费自托管**，数据掌握在自己手中。

核心特点：

- **可视化拖拽**：无需写代码即可连接数百个服务
- **开源自托管**：数据不出服务器，隐私安全
- **支持代码扩展**：内置 JavaScript / Python 节点，逻辑自由发挥
- **400+ 集成**：GitHub、Slack、MySQL、HTTP Request、AI 模型等应手可得

---

## 一、环境准备

### 系统要求

| 项目 | 最低要求 |
|------|---------|
| CPU | 1 核 |
| 内存 | 1 GB RAM |
| 磁盘 | 10 GB |
| 操作系统 | Linux / macOS / Windows（推荐 Linux） |
| Node.js | ≥ 18.x（npm 方式安装时需要） |

### 安装方式选择

本文推荐 **Docker Compose** 方式，生产稳定、升级方便。

---

## 二、使用 Docker Compose 安装 n8n

### 2.1 安装 Docker

```bash
# Ubuntu / Debian
curl -fsSL https://get.docker.com | bash
sudo usermod -aG docker $USER
# 重新登录后生效
```

### 2.2 创建项目目录

```bash
mkdir -p ~/n8n && cd ~/n8n
```

### 2.3 编写 docker-compose.yml

```yaml
version: "3.8"

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=your-domain.com          # 替换为你的域名或 IP
      - N8N_PORT=5678
      - N8N_PROTOCOL=https               # 本地测试改为 http
      - NODE_ENV=production
      - WEBHOOK_URL=https://your-domain.com/
      - GENERIC_TIMEZONE=Asia/Shanghai
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password  # 改为强密码
      # 持久化数据库（可选，默认 SQLite）
      # - DB_TYPE=postgresdb
      # - DB_POSTGRESDB_HOST=postgres
      # - DB_POSTGRESDB_DATABASE=n8n
      # - DB_POSTGRESDB_USER=n8n
      # - DB_POSTGRESDB_PASSWORD=n8n_pass
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n_net

volumes:
  n8n_data:

networks:
  n8n_net:
```

### 2.4 启动服务

```bash
docker compose up -d

# 查看日志
docker compose logs -f n8n
```

启动成功后，访问 `http://你的IP:5678`，用上面设置的账号密码登录。

---

## 三、界面导览

登录后你会看到主界面，核心区域如下：

```
┌─────────────────────────────────────────┐
│  顶部导航：Workflows / Credentials / ... │
├──────────┬──────────────────────────────┤
│          │                              │
│  左侧面板  │       画布（Canvas）          │
│  节点列表  │   拖拽节点、连线在这里操作     │
│          │                              │
└──────────┴──────────────────────────────┘
```

- **Workflows**：所有工作流列表
- **Credentials**：统一管理 API Key、OAuth 等凭据
- **Executions**：查看每次运行的日志和数据

---

## 四、搭建第一个工作流：定时获取天气并发送到 Slack

### 目标

每天早上 8 点，自动获取城市天气，推送到 Slack 频道。

### 4.1 新建工作流

点击右上角 **New Workflow**，进入空白画布。

### 4.2 添加触发节点（Schedule Trigger）

1. 点击画布中央的 **+** 按钮
2. 搜索 `Schedule`，选择 **Schedule Trigger**
3. 配置：
   - Mode: `Cron`
   - Cron Expression: `0 8 * * *`（每天 08:00）

### 4.3 添加 HTTP 请求节点（获取天气）

1. 点击 Schedule 节点右侧的 **+**
2. 搜索 `HTTP Request`
3. 配置参数：

```
Method:  GET
URL:     https://wttr.in/Shanghai?format=j1
```

> 这里使用免费的 wttr.in 接口，无需 API Key。

### 4.4 添加 Code 节点（提取数据）

1. 继续添加 **Code** 节点（选 JavaScript）
2. 填入以下代码：

```javascript
const weather = $input.first().json;
const current = weather.current_condition[0];

return [{
  json: {
    city: "上海",
    temp_c: current.temp_C,
    feels_like: current.FeelsLikeC,
    desc: current.weatherDesc[0].value,
    humidity: current.humidity,
    message: `🌤 上海今日天气\n🌡 气温：${current.temp_C}°C（体感 ${current.FeelsLikeC}°C）\n💧 湿度：${current.humidity}%\n📝 ${current.weatherDesc[0].value}`
  }
}];
```

### 4.5 添加 Slack 节点

1. 添加 **Slack** 节点
2. 点击 **Credentials** → 新建 Slack API 凭据（填入 Bot Token）
3. 配置：
   - Resource: `Message`
   - Operation: `Send`
   - Channel: `#general`
   - Text: `{{ $json.message }}`

### 4.6 测试运行

点击左下角 **Test workflow**，检查每个节点的输出数据是否正确。

全部绿色 ✅ 后，点击右上角 **Save**，再开启右上角的 **Active** 开关，工作流就跑起来了！

---

## 五、进阶：使用 Webhook 触发工作流

Webhook 可以让外部系统主动触发 n8n，是最常用的触发方式之一。

### 5.1 添加 Webhook 节点

1. 新建工作流
2. 第一个节点选 **Webhook**
3. HTTP Method: `POST`
4. Path: `my-webhook`（自定义路径）
5. 点击 **Listen for test event**，复制生成的 URL

### 5.2 测试 Webhook

```bash
curl -X POST https://your-domain.com/webhook-test/my-webhook \
  -H "Content-Type: application/json" \
  -d '{"name": "张三", "email": "zhangsan@example.com"}'
```

n8n 会实时展示接收到的数据，你可以基于此数据继续添加后续处理节点。

---

## 六、实战案例：表单提交 → 写入数据库 → 发邮件

### 流程图

```
Webhook（接收表单）
    ↓
IF 节点（判断邮箱格式）
    ↓ 合法
MySQL 节点（写入数据库）
    ↓
Send Email 节点（发送确认邮件）
```

### 6.1 IF 节点配置（邮箱验证）

- 条件：`{{ $json.email }}` **Regex** 匹配 `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- True 分支：继续处理
- False 分支：返回错误响应

### 6.2 MySQL 节点配置

1. 新建 MySQL Credential（填写数据库连接信息）
2. Operation: `Insert`
3. Table: `users`
4. Columns 映射：

```
name  → {{ $json.name }}
email → {{ $json.email }}
created_at → {{ $now }}
```

### 6.3 Send Email 节点配置

使用 SMTP 凭据，配置：

```
To:      {{ $json.email }}
Subject: 欢迎注册！
Body:    你好 {{ $json.name }}，感谢注册，我们会尽快联系你。
```

---

## 七、常用技巧与最佳实践

### 7.1 表达式语法

n8n 使用 `{{ }}` 引用数据：

```js
{{ $json.fieldName }}           // 当前节点数据
{{ $node["节点名"].json.field }} // 指定节点数据
{{ $now }}                       // 当前时间
{{ $today }}                     // 今天日期
{{ $workflow.name }}             // 工作流名称
```

### 7.2 错误处理

在节点设置中开启 **Continue on Fail**，配合 **IF** 节点判断 `$json.error` 实现优雅的错误处理。

也可以在工作流设置中添加 **Error Trigger** 节点，统一捕获异常并报警。

### 7.3 子工作流复用

将通用逻辑（如发送通知、写日志）封装成独立工作流，通过 **Execute Workflow** 节点调用，避免重复建设。

### 7.4 环境变量管理

敏感信息不要写死在节点里，统一放在 `.env` 或 n8n 的 **Credentials** 中：

```bash
# docker-compose.yml 中添加
- N8N_CUSTOM_ENV_VAR=your_value
```

代码节点中用 `process.env.N8N_CUSTOM_ENV_VAR` 访问。

---

## 八、升级与备份

### 升级 n8n

```bash
cd ~/n8n
docker compose pull
docker compose up -d
```

### 备份数据

```bash
# 备份 SQLite 数据库
docker cp n8n:/home/node/.n8n/database.sqlite ./backup-$(date +%Y%m%d).sqlite

# 或直接备份 volume
docker run --rm \
  -v n8n_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/n8n-backup-$(date +%Y%m%d).tar.gz /data
```

---

## 九、常见问题

**Q：Webhook 在本地测试时无法被外部访问？**
A：使用 [ngrok](https://ngrok.com) 做内网穿透：`ngrok http 5678`，将生成的公网地址填入 `WEBHOOK_URL`。

**Q：节点执行超时？**
A：在 n8n 环境变量中设置 `EXECUTIONS_TIMEOUT=300`（单位秒）。

**Q：如何查看历史执行记录？**
A：左侧菜单 → **Executions**，可筛选成功/失败记录，点击查看每个节点的输入输出数据。

**Q：数据量大时 SQLite 性能差？**
A：将数据库切换为 PostgreSQL，修改 `docker-compose.yml` 中的 `DB_TYPE` 配置即可。

---

## 总结

| 阶段 | 内容 |
|------|------|
| 安装部署 | Docker Compose 一键启动 |
| 基础使用 | Schedule + HTTP + Slack |
| Webhook | 接收外部事件触发流程 |
| 数据库集成 | MySQL 读写 + 邮件通知 |
| 进阶技巧 | 表达式、错误处理、子工作流 |

n8n 的学习曲线不陡，但玩法极深。建议从一个真实的业务痛点出发（比如"每天手动复制粘贴数据"），直接动手搭工作流，比看文档效果好 10 倍。

有问题欢迎在评论区交流 🚀
