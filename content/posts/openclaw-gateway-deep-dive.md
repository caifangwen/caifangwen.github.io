---
title: "OpenClaw Gateway 深度解析：龙虾的心脏是怎么跳动的"
date: 2026-03-22T00:00:00+08:00
draft: false
tags: ["OpenClaw", "Gateway", "网关", "架构", "部署运维"]
categories: ["AI工作流"]
description: "Gateway 是 OpenClaw 唯一常驻的核心进程，本文从它是什么、做什么、如何配置、如何运维四个维度彻底讲清楚。"
slug: "openclaw-gateway-deep-dive"
author: "Claude"
---

## 一句话定义

> Gateway 是 OpenClaw 的心脏——唯一需要 24 小时跑着的进程，所有消息进来都要经过它，所有 AI 的回复也要从它出去。

如果 OpenClaw 是一家公司，Gateway 就是前台总机：它不做实际业务，但没有它，任何人都联系不上任何人。

---

## 一、Gateway 在整体架构中的位置

理解 Gateway，先看全局架构：

```
外部世界                    Gateway 内部                    AI 侧
────────────────────────────────────────────────────────────────
微信截图
飞书消息      ──→   Channel Bridge   ──→   消息路由   ──→   Agent 1
Telegram 消息                             （Router）  ──→   Agent 2
钉钉消息      ←──   Channel Bridge   ←──             ←──   Agent N
Web UI
────────────────────────────────────────────────────────────────
                    ↕                         ↕
               会话管理（Sessions）      工具调度（Skills）
               记忆系统（Memory）        LLM API 调用
               日志系统（Logs）          Heartbeat 心跳
```

Gateway 是 OpenClaw 的控制平面和核心枢纽，负责统一管理 Agent 运行时与消息路由，是连接外部世界（各种聊天平台）和内部 Agents 的桥梁。

Gateway 是唯一运行的进程，占用一个端口（默认 18789），像总机接线员，把消息转发给 AI。真正思考的是外部大模型（你提供 API Key），Gateway 只负责"叫它来干活"。

---

## 二、Gateway 的五大核心职责

### 职责一：消息路由（Message Routing）

这是 Gateway 最基础的工作。

你通过聊天工具发送的每一条消息，都会先到达 Gateway，Gateway 再调用 AI 模型进行思考，并将结果返回给你或执行相应的操作。

具体流程：

```
用户在飞书发送："帮我整理今天的邮件"
         ↓
Gateway 接收（WebSocket 长连接）
         ↓
解析消息来源：飞书群 oc_xxxxxx
         ↓
查找路由规则：该群绑定了 assistant Agent
         ↓
转发给 assistant Agent 处理
         ↓
Agent 调用 LLM + 执行 Skills
         ↓
Gateway 把结果发回飞书群
```

路由规则支持按**渠道类型、群组 ID、用户 ID** 精确匹配，匹配不到的走默认 Agent（通常是 main）。

### 职责二：会话管理（Session Management）

Gateway 维护着所有用户的对话状态，让 AI 知道"上次聊到哪了"。

Gateway 负责维护跨渠道的会话状态和上下文。会话数据存储在 `~/.openclaw/sessions/` 目录，以 `.jsonl` 格式按行追加，每一行都是一条历史记录。

默认配置：

```json
{
  "session": {
    "ttl": 3600000,          // 会话超时时间（毫秒），默认 1 小时
    "maxSessions": 1000,     // 最大并发会话数
    "persistInterval": 60000 // 每 60 秒写一次磁盘
  }
}
```

> 注意：会话过期后重新发消息，Gateway 会开启一个新会话，**上下文从零开始**。如果你希望 AI 记住很久以前的事，依赖的是 Memory 系统（MEMORY.md + 向量库），而不是 Session。

### 职责三：Channel Bridge（通道桥接）

Channel Bridge（通道桥接器）负责跟 WhatsApp、Telegram 等聊天软件"握手"，比如用 Baileys 库连接 WhatsApp。

每个平台的协议不同，Gateway 通过插件化的 Bridge 抹平差异：

| 平台 | 接入方式 | 备注 |
|------|---------|------|
| Telegram | Bot Token + Webhook | 官方支持，最稳定 |
| WhatsApp | Baileys 库（非官方） | 有封号风险，谨慎使用 |
| 飞书 | 企业自建应用 | 国内推荐首选 |
| 钉钉 | 机器人 Webhook | 功能相对受限 |
| Discord | Bot Token | 海外用户常用 |
| Web UI | WebSocket 本地连接 | 无需任何配置，开箱即用 |

消息在进入 Gateway 内部后，会被统一转换为标准格式：

```json
{
  "platform": "feishu",
  "channel_id": "feishu_group_oc_xxxxxx",
  "user": {
    "id": "user_abc123",
    "name": "张三"
  },
  "message": {
    "type": "text",
    "content": "帮我查一下今天的会议",
    "timestamp": "2026-03-22T09:00:00Z"
  }
}
```

无论消息来自哪个平台，Agent 看到的都是这套统一格式，大大简化了 Agent 的处理逻辑。

### 职责四：Heartbeat 心跳调度

Gateway 内置了定时任务调度器，驱动 Agent 的主动行为。

心跳机制的工作原理：Gateway 按照配置的间隔，定时触发 AI 的"主动检查"逻辑——让 AI 扫描待办、检查邮件、发送日报。这让 OpenClaw 从"被动响应"变成"主动执行"。

配置示例（`HEARTBEAT.md`）：

```markdown
# 心跳任务

- 每天 08:00：发送今日简报（天气 + 日历 + 邮件摘要）
- 每 30 分钟：检查是否有新邮件标记为紧急
- 每天 22:00：生成今日工作总结，写入 daily-log/
```

> 注意：每次心跳都是一次完整的 LLM API 调用，是 Token 消耗的重要来源之一。心跳间隔越短，Token 烧得越快。建议非紧急任务将间隔设置为 30 分钟以上。

### 职责五：安全与认证

默认绑定模式为 loopback（仅本机访问），且默认需要认证（gateway.auth.token 或 gateway.auth.password）。

Gateway 提供了三层安全机制：

**第一层：访问令牌（Token 认证）**

所有客户端连接 Gateway 都需要携带 Token，通过环境变量 `OPENCLAW_GATEWAY_TOKEN` 配置。

**第二层：网络绑定限制**

默认只监听 `127.0.0.1`（本机），局域网和公网均无法直接访问。

OpenClaw Gateway 默认只监听本机（127.0.0.1:18789），手机无法直接连接。如需手机访问，需要通过 WebSocket 代理（如 ClawApp）或 SSH 隧道转发。

**第三层：远程访问推荐方案**

首选 Tailscale/VPN，备选 SSH 隧道。即使通过 SSH 隧道访问，如果配置了 Gateway 认证，客户端仍需发送 Token。

---

## 三、完整配置文件详解

Gateway 的主配置文件位于 `~/.openclaw/config.json`（或 `openclaw.json`）：

```json
{
  // ── 网络层 ──────────────────────────────────────────
  "gateway": {
    "port": 18789,          // 监听端口，默认 18789
    "host": "127.0.0.1",    // 绑定地址，生产环境改为 0.0.0.0
    "logLevel": "info",     // 日志级别：debug / info / warn / error
    "maxConnections": 100,  // 最大并发连接数
    "timeout": 30000        // 请求超时（毫秒）
  },

  // ── 路由层 ──────────────────────────────────────────
  "routing": {
    "rules": [
      {
        "match": {
          "channel": "feishu",
          "peer": { "kind": "group", "id": "oc_写作群ID" }
        },
        "target": { "agentId": "writer" }
      },
      {
        "match": {
          "channel": "telegram",
          "userId": "123456"   // 也可以按用户 ID 路由
        },
        "target": { "agentId": "coder" }
      }
    ],
    "default": { "agentId": "main" }  // 兜底路由
  },

  // ── 会话层 ──────────────────────────────────────────
  "session": {
    "ttl": 3600000,
    "maxSessions": 1000,
    "persistInterval": 60000,
    "storage": {
      "type": "file",
      "path": "~/.openclaw/sessions"
    }
  },

  // ── 性能层 ──────────────────────────────────────────
  "performance": {
    "workers": 4,          // 并发工作线程数
    "queueSize": 1000,     // 请求队列容量
    "concurrency": 5,      // 同时处理的请求数
    "cache": {
      "enabled": true,
      "maxSize": 100,
      "ttl": 300000
    }
  },

  // ── 日志层 ──────────────────────────────────────────
  "logging": {
    "level": "info",
    "format": "json",
    "outputs": [
      { "type": "console", "colorize": true },
      {
        "type": "file",
        "path": "~/.openclaw/logs/gateway.log",
        "maxSize": "100m",
        "maxFiles": 10,
        "compress": true
      }
    ]
  }
}
```

---

## 四、常用运维命令速查

### 启动与停止

```bash
# 前台运行（调试时用，终端关闭即停止）
openclaw gateway run

# 后台守护进程（推荐日常使用）
openclaw gateway start

# 停止
openclaw gateway stop

# 重启
openclaw gateway restart

# 安装为系统服务（开机自启）
openclaw gateway install
```

### 状态检查

```bash
# 基础状态
openclaw gateway status

# 详细状态（含连接数、内存、CPU）
openclaw gateway status --verbose

# JSON 格式输出（方便脚本解析）
openclaw gateway status --json
```

正常运行时的输出示例：

```
Gateway Status: Running ✓
Port:           18789
Uptime:         2h 34m 12s
Active Sessions: 15
Connected Channels:
  - feishu:    connected ✓
  - telegram:  connected ✓
Active Agents:
  - main:      ready ✓
  - writer:    ready ✓
Memory Usage:  245 MB
CPU Usage:     12%
```

### 日志查看

```bash
# 实时跟踪日志
openclaw logs --follow

# 查看最近 100 条
openclaw logs --tail 100

# 只看错误
openclaw logs --level error

# 按时间范围筛选
openclaw logs --since "2026-03-22" --until "2026-03-23"

# 只看 Gateway 组件的日志
openclaw logs --component gateway
```

### 诊断修复

```bash
# 一键诊断并自动修复常见问题
openclaw doctor

# 检查渠道连接状态
openclaw channels status --probe

# 全面健康检查
openclaw health
```

---

## 五、三种部署形态对比

### 形态一：本机直跑（个人日常推荐）

```bash
openclaw gateway install   # 注册为系统服务
openclaw gateway start     # 启动
```

特点：最简单，重启后自动拉起，适合个人用户。

### 形态二：Docker 容器（服务器部署推荐）

```yaml
# docker-compose.yml
services:
  openclaw-gateway:
    image: openclaw/openclaw:latest
    ports:
      - "18789:18789"
    volumes:
      - openclaw-data:/root/.openclaw
    restart: unless-stopped
    environment:
      - OPENCLAW_GATEWAY_TOKEN=你的Token
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

volumes:
  openclaw-data:
```

```bash
docker compose up -d openclaw-gateway
docker compose logs -f openclaw-gateway
```

特点：环境隔离干净，升级方便，生产环境首选。

### 形态三：多 Gateway 独立进程（团队/高隔离需求）

大多数情况下应该只运行一个 Gateway。只在需要严格隔离或冗余的场景下才使用多 Gateway，例如独立的救援配置。

```bash
# 启动两个完全独立的 Gateway 实例
OPENCLAW_CONFIG_PATH=~/.openclaw/a.json \
OPENCLAW_STATE_DIR=~/.openclaw-a \
openclaw gateway --port 19001

OPENCLAW_CONFIG_PATH=~/.openclaw/b.json \
OPENCLAW_STATE_DIR=~/.openclaw-b \
openclaw gateway --port 19002
```

---

## 六、Gateway 协议简介（给开发者）

Gateway 对外暴露 **WebSocket** 接口，所有客户端（Web UI、手机 App、自定义脚本）都通过这个协议与 Gateway 通信。

第一帧必须是 connect 帧。Gateway 返回 hello-ok 快照，包含 presence、health、stateVersion、uptimeMs、limits/policy 等信息。请求格式为 req(method, params)，响应为 res(ok/payload|error)。常见事件包括 connect.challenge、agent、chat、presence、tick、health、heartbeat、shutdown。

一个最简单的连接示例：

```javascript
const ws = new WebSocket('ws://127.0.0.1:18789');

ws.onopen = () => {
  // 第一帧必须是 connect
  ws.send(JSON.stringify({
    type: 'connect',
    token: process.env.OPENCLAW_GATEWAY_TOKEN
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'hello-ok') {
    console.log('连接成功，Gateway 状态：', data.health);
    // 发送一条消息
    ws.send(JSON.stringify({
      type: 'req',
      method: 'chat',
      params: { message: '你好' }
    }));
  }
  if (data.type === 'agent') {
    // 流式输出，逐 token 打印
    process.stdout.write(data.delta || '');
  }
};
```

---

## 七、手机访问方案：ClawApp

由于 Gateway 默认只监听本机，手机无法直接连接。ClawApp 通过 WebSocket 代理解决了这个问题：手机浏览器通过 WS/WSS 连接到 ClawApp 代理服务端（端口 3210），再由代理转发到本机的 Gateway（端口 18789）。

ClawApp 核心功能：实时流式聊天、图片发送、Markdown 渲染 + 代码高亮、快捷指令、会话管理、暗色/亮色主题、PWA 支持（可添加到手机桌面）。

快速部署 ClawApp：

```bash
git clone https://github.com/qingchencloud/clawapp.git
cd clawapp
echo 'PROXY_TOKEN=设置一个连接密码' > .env
echo 'OPENCLAW_GATEWAY_TOKEN=你的gateway-token' >> .env
docker compose up -d --build
```

部署后，手机浏览器打开 `http://你的电脑IP:3210` 即可使用。

---

## 八、常见故障排查

**问题一：端口 18789 无法访问**

```bash
# 检查端口是否被占用
lsof -i :18789         # macOS
netstat -ltnp | grep 18789  # Linux

# 如果被占用，换一个端口
openclaw gateway --port 18790
```

**问题二：渠道连接断开（飞书/Telegram 离线）**

```bash
openclaw channels status --probe   # 诊断连接状态
openclaw gateway restart           # 重启通常能解决
openclaw doctor                    # 自动修复配置问题
```

**问题三：Gateway 内存占用持续增长**

根因通常是会话历史无限累积。解决方案：

```json
// 在 config.json 中设置会话上下文上限
{
  "session": {
    "maxTokensPerSession": 50000
  }
}
```

**问题四：心跳任务没有触发**

```bash
openclaw logs --component heartbeat --tail 50  # 查看心跳日志
openclaw gateway status --verbose              # 确认 Gateway 在运行
```

---

## 总结

Gateway 是 OpenClaw 整个体系的基石，理解了它，才真正理解了 OpenClaw 的工作方式：

- 它是**唯一常驻进程**，负责接收消息、路由分发、维护会话
- 它通过 **Channel Bridge** 统一接入各种聊天平台，对内只暴露标准格式
- 它通过 **Heartbeat** 驱动 Agent 的主动行为，从被动变主动
- 它默认**仅监听本机**，安全优先，需要远程访问时推荐 Tailscale 或 SSH 隧道

日常使用建议：用 `openclaw gateway install` 注册为系统服务，用 `openclaw doctor` 解决 80% 的故障，用 `openclaw logs --follow` 在出问题时第一时间定位原因。

---

*文章发布时间：2026-03-22 | 命令语法基于 OpenClaw 2026.2.x，请以官方文档为准*
