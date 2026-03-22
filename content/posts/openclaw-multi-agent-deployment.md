---
title: "OpenClaw 多 Agent 架构部署完全指南：组建你的 AI 数字团队"
date: 2026-03-22T00:00:00+08:00
draft: false
tags: ["OpenClaw", "Multi-Agent", "架构设计", "部署", "Token优化"]
categories: ["AI工具", "实战教程"]
description: "从原理到实操，手把手教你部署 OpenClaw 多 Agent 架构——物理级隔离、模型分级、路由绑定、Agent 间协作，附完整配置文件。"
slug: "openclaw-multi-agent-deployment"
author: "Claude"
---

## 为什么单 Agent 不够用？

你可能遇到过这种情况：用了 OpenClaw 一段时间，AI 开始"神经错乱"——明明让它写博客，它却输出代码逻辑；明明让它调研竞品，它却在纠正上周的错别字。

AI 没变笨。问题在于：**你在让一个大脑同时做太多不同的事。**

会话历史里堆满了上周的购物清单、三天前的代码调试、昨天的邮件摘要……当上下文突破几万 Token，模型的注意力就开始分散，"神经错乱"是必然结果。

解决方案就是本文的主题：**多 Agent 架构**——让不同 Agent 各司其职，就像真实公司里不同的岗位。

---

## 一、核心原理：物理级隔离，而非仅仅改个名字

OpenClaw 的多 Agent 不只是换了个称呼，而是在底层实现了**三层物理隔离**。

### 目录结构一览

```
~/.openclaw/
├── agents/
│   ├── main/
│   │   ├── agent/            # 身份凭证层
│   │   │   ├── auth-profiles.json
│   │   │   └── models.json
│   │   └── sessions/         # 状态层（会话历史）
│   │       └── <session-id>.jsonl
│   ├── writer/
│   │   ├── agent/
│   │   └── sessions/
│   └── coder/
│       ├── agent/
│       └── sessions/
├── workspace/                 # main Agent 工作区
│   ├── SOUL.md
│   ├── AGENTS.md
│   └── memory/
├── workspace-writer/          # writer Agent 工作区
│   ├── SOUL.md
│   ├── AGENTS.md
│   └── skills/
│       ├── seo-checker/
│       └── article-template/
├── workspace-coder/           # coder Agent 工作区
│   ├── SOUL.md
│   ├── AGENTS.md
│   └── skills/
│       ├── code-review/
│       └── test-runner/
└── skills/                    # 全局共享技能（所有 Agent 可用）
    ├── web-search/
    └── file-tools/
```

### 三层隔离的含义

**第一层：认证与模型隔离（`agents/<id>/agent/`）**

不同 Agent 可以绑定完全不同的 API Key 和模型。比如写作 Agent 用 DeepSeek，编码 Agent 用 Claude Sonnet 4.6，日常助手用 Haiku——各自用最划算的模型，互不干扰。凭证文件在各自目录下，主 Agent 的 Key 不会自动共享给其他 Agent。

**第二层：记忆与会话隔离（`agents/<id>/sessions/`）**

每个 Agent 独立生成会话历史，彼此完全不串台。写作 Agent 永远不会看到编码 Agent 的代码文件，编码 Agent 也不会被写作 Agent 的风格指南干扰。这是解决"上下文污染"问题的根本手段。

**第三层：灵魂与工作区隔离（`workspace-<id>/`）**

每个 Agent 完全独享自己的 `SOUL.md`（人格设定）、`AGENTS.md`（协作规则）、`USER.md` 和 `memory/` 目录。技能包（Skills）也可以按 Agent 专属配置，只有需要某个能力的 Agent 才加载对应技能，不做无用功。

---

## 二、部署方式选择

OpenClaw 支持两种多 Agent 部署方案，按场景选择：

### 方案 A：单 Gateway + 频道路由（推荐个人用户）

一个 Gateway 进程管理所有 Agent，通过消息来源（群组 ID、频道）路由到不同 Agent。配置最简单，资源消耗最低。

**适合场景：** 个人使用、同一台机器上管理多个专家 Agent。

### 方案 B：多 Gateway 独立进程（适合团队/生产）

每个 Agent 运行独立的 Gateway 进程，拥有完全独立的网络端口和进程空间，物理隔离更彻底。

**适合场景：** 团队协作、需要为每个 Agent 配置独立的飞书/钉钉 Bot 身份、或 Agent 之间需要强安全隔离。

---

## 三、方案 A 完整部署步骤

### Step 1：创建 Agent

```bash
# 查看当前 Agent 列表
openclaw agents list

# 创建写作 Agent（指定工作区和模型）
openclaw agents add writer \
  --model deepseek/deepseek-chat \
  --workspace ~/.openclaw/workspace-writer

# 创建编码 Agent
openclaw agents add coder \
  --model anthropic/claude-sonnet-4-6 \
  --workspace ~/.openclaw/workspace-coder

# 创建轻量日常助手（用便宜模型）
openclaw agents add assistant \
  --model anthropic/claude-haiku-4-5 \
  --workspace ~/.openclaw/workspace-assistant
```

创建完成后再次执行 `openclaw agents list`，输出应类似：

```
Agents:
- main (default)
    Workspace: ~/.openclaw/workspace
    Model: anthropic/claude-sonnet-4-6
    Routing rules: 0

- writer
    Workspace: ~/.openclaw/workspace-writer
    Model: deepseek/deepseek-chat
    Routing rules: 0

- coder
    Workspace: ~/.openclaw/workspace-coder
    Model: anthropic/claude-sonnet-4-6
    Routing rules: 0

- assistant
    Workspace: ~/.openclaw/workspace-assistant
    Model: anthropic/claude-haiku-4-5
    Routing rules: 0
```

### Step 2：为每个 Agent 写 SOUL.md

`SOUL.md` 是 Agent 的灵魂文件，定义人格、职责边界和工作风格。这是系统提示词的核心部分，**写得越精准，上下文越轻量，Token 越省**。

**主协调官 `~/.openclaw/workspace/SOUL.md`：**

```markdown
# Main Agent — 首席协调官

## 核心职责
1. 接收用户请求，理解原始意图
2. 精准 dispatch：判断任务类型，分配给合适的专家 Agent
3. 质量控制：审查专家 Agent 输出，必要时要求修改
4. 端到端编排：确保多步骤任务不掉链子

## Dispatch 规则
- 写作、SEO、文案优化 → @writer
- 代码编写、技术实现、Debug → @coder
- 日程提醒、天气、快速查询、翻译 → @assistant
- 简单闲聊 → 自己处理

## 风格
简洁、专业。告知用户已分配给哪个 Agent 处理，预计完成时间。
```

**写作专家 `~/.openclaw/workspace-writer/SOUL.md`：**

```markdown
# Writer Agent — 写作专家

## 职责范围
- 博客文章、技术文档、营销文案
- SEO 优化与关键词分析
- 文章改写与风格调整

## 工作原则
- 输出前先列大纲，确认方向再展开
- 所有内容基于用户提供的信息，不凭空捏造数据
- 默认用中文输出，除非用户指定其他语言

## 禁止事项
- 不处理代码相关请求，直接告知用户联系 @coder
- 不处理系统操作类请求
```

**编码专家 `~/.openclaw/workspace-coder/SOUL.md`：**

```markdown
# Coder Agent — 代码专家

## 职责范围
- 代码编写、Review、重构
- Bug 定位与修复
- 技术方案设计与评估

## 工作原则
- 优先理解需求，给出最简可行方案
- 代码必须附带注释和使用说明
- 遇到安全隐患时主动提醒

## 禁止事项
- 不处理非技术类写作需求
```

### Step 3：配置 openclaw.json

这是路由绑定的核心配置文件，位于 `~/.openclaw/openclaw.json`：

```json
{
  "gateway": {
    "port": 3000
  },
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "all",
        "scope": "agent",
        "workspaceAccess": "rw"
      }
    },
    "list": [
      {
        "id": "main",
        "workspace": "~/.openclaw/workspace"
      },
      {
        "id": "writer",
        "workspace": "~/.openclaw/workspace-writer"
      },
      {
        "id": "coder",
        "workspace": "~/.openclaw/workspace-coder"
      },
      {
        "id": "assistant",
        "workspace": "~/.openclaw/workspace-assistant"
      }
    ]
  },
  "channels": {
    "feishu": {
      "appId": "cli_你的AppId",
      "appSecret": "你的AppSecret"
    }
  },
  "bindings": [
    {
      "agentId": "writer",
      "match": {
        "channel": "feishu",
        "peer": {
          "kind": "group",
          "id": "oc_写作群的GroupId"
        }
      }
    },
    {
      "agentId": "coder",
      "match": {
        "channel": "feishu",
        "peer": {
          "kind": "group",
          "id": "oc_编码群的GroupId"
        }
      }
    },
    {
      "agentId": "assistant",
      "match": {
        "channel": "feishu",
        "peer": {
          "kind": "group",
          "id": "oc_日常助手群的GroupId"
        }
      }
    },
    {
      "agentId": "main",
      "match": {
        "channel": "feishu"
      }
    }
  ]
}
```

> **注意：** `bindings` 数组按顺序匹配，越精确的规则越靠前，`main` 作为兜底放最后。

### Step 4：为 Agent 设置身份标识（可选）

```bash
openclaw agents set-identity --agent writer --name "Writer ✍️" --emoji "✍️"
openclaw agents set-identity --agent coder  --name "Code Smith ⚡" --emoji "⚡"
openclaw agents set-identity --agent assistant --name "小助手 🤖" --emoji "🤖"
```

设置后，飞书/Telegram 里各 Agent 的回复会显示对应名称，方便区分是哪个 Agent 在处理。

### Step 5：配置专属 Skills

为每个 Agent 只装它需要的技能，不做无用功：

```bash
# writer 装 SEO 和文章模板
cd ~/.openclaw/workspace-writer
npx clawhub@latest install seo-checker
npx clawhub@latest install article-template

# coder 装代码审查和测试运行
cd ~/.openclaw/workspace-coder
npx clawhub@latest install code-review
npx clawhub@latest install test-runner

# 全局共享技能（所有 Agent 都能用）
cd ~/.openclaw
npx clawhub@latest install web-search --global
npx clawhub@latest install file-tools --global
```

### Step 6：启动 Gateway

```bash
# 启动（单 Gateway 模式）
openclaw gateway start

# 或指定配置文件
openclaw gateway start --config ~/.openclaw/openclaw.json

# 后台运行（生产环境推荐）
openclaw gateway start --daemon
```

---

## 四、方案 B：多 Gateway 独立进程

为每个 Agent 单独维护一个配置文件，分别启动：

```bash
# ~/.openclaw/openclaw-main.json
{
  "gateway": { "port": 3000 },
  "agents": {
    "list": [{ "id": "main", "workspace": "~/.openclaw/workspace" }]
  },
  "channels": { "feishu": { "appId": "xxx1", "appSecret": "xxx1" } }
}

# ~/.openclaw/openclaw-writer.json
{
  "gateway": { "port": 3001 },
  "agents": {
    "list": [{ "id": "writer", "workspace": "~/.openclaw/workspace-writer" }]
  },
  "channels": { "feishu": { "appId": "xxx2", "appSecret": "xxx2" } }
}
```

分别启动：

```bash
openclaw gateway start --config ~/.openclaw/openclaw-main.json
openclaw gateway start --config ~/.openclaw/openclaw-writer.json
```

多 Gateway 模式下，每个 Agent 可以绑定独立的飞书/钉钉 Bot 账号，在群里展示不同的头像和名称，用户体验更接近"真实团队"。

---

## 五、四种协作模式

### 模式一：主管-专家（Supervisor-Specialist）

最常见的结构。用户只和 main Agent 打交道，main 负责拆解任务、分配给专家、汇总结果。

```
用户 → main（协调官）
              ↓
     ┌────────┼────────┐
     ↓        ↓        ↓
  writer    coder   assistant
     ↓        ↓        ↓
     └────────┼────────┘
              ↓
         main（汇总）→ 用户
```

**适合场景：** 综合型任务，用户不需要知道背后有多少个 Agent。

### 模式二：直连专家（Direct Access）

用户直接在对应频道/群组找专家 Agent，跳过中间层。

```
写作群 → writer（直接处理）
编码群 → coder（直接处理）
日常群 → assistant（直接处理）
```

**适合场景：** 用户清楚自己需要什么，不需要协调层，延迟更低、Token 更省。

### 模式三：并行子代理（Parallel Sub-agents）

主 Agent 将一个重型任务拆分给多个子 Agent 并行处理，最后汇总。

经典案例：你一次性丢给 main Agent 5 篇英文技术文章，要求翻译并做摘要。main 会同时派遣 5 个临时子 Agent 各自处理一篇，而非顺序处理——速度是串行的 5 倍，上下文也不会被 5 篇文章混合污染。

### 模式四：流水线（Pipeline）

任务在 Agent 之间依次流转，上一个 Agent 的输出是下一个 Agent 的输入。

```
用户发起需求
    ↓
brainstorm（头脑风暴，生成方向）
    ↓
writer（基于方向写初稿）
    ↓
coder（如需要，添加代码示例）
    ↓
main（最终审核，返回用户）
```

---

## 六、一个完整的实战案例：技术博客流水线

以下是一个真实可用的技术博客生产流水线配置。

### 场景描述

你需要批量生产技术博客：先发散主题、再撰写、再审校，三个环节由不同 Agent 负责。

### AGENTS.md 协作规则

在 `~/.openclaw/workspace/AGENTS.md` 中定义主 Agent 的任务分发逻辑：

```markdown
# 博客生产流水线

## 流程定义

当用户请求"写一篇关于 X 的技术博客"时，执行以下流程：

1. **头脑风暴**：向 @brainstorm 发送请求
   - 输入：文章主题
   - 输出：3 个不同切入角度，每个 100 字
   - 等待用户选择方向

2. **撰写初稿**：向 @writer 发送选定的方向
   - 输入：选定角度 + SEO 关键词（如有）
   - 输出：完整文章初稿，含标题、摘要、正文
   
3. **技术审核**（如文章包含代码）：向 @coder 发送初稿
   - 输入：文章初稿
   - 输出：代码正确性验证报告，修改建议

4. **汇总交付**：整合所有输出，返回用户

## 注意事项
- 每个阶段等待前一阶段完成后再启动
- 如某个专家 Agent 超时（>2 分钟），主动通知用户
```

### 执行效果

用户只需要在飞书/Telegram 发一句话：

> "帮我写一篇关于 Rust 异步编程的技术博客，面向有 Python 基础的读者"

main Agent 接收后，整个流水线自动运转，最终交付一篇经过头脑风暴、专业撰写、代码审核的完整文章。

---

## 七、常见问题与排查

**Q：多 Agent 是否一定比单 Agent 省 Token？**

不一定。多 Agent 架构会增加通信开销和管理成本。但每个 Agent 的配置更精简（SOUL.md 更短、Skills 更少），单次对话的 Token 消耗往往反而降低，长期使用下来整体更省。

**Q：单 Gateway 内的 Agent 能互相访问对方的 workspace 吗？**

技术上可以，这是"软隔离"，属于君子协定。如果处理敏感数据，建议使用 Docker Sandbox 或多 Gateway 方案实现真正的硬隔离。

**Q：能不能让飞书 Agent 和 Telegram Agent 协作？**

可以。通过 `sessions_send` 工具，不同渠道的 Agent 之间可以互相发消息协作，不受平台限制。

**Q：Agent 太多，管理混乱怎么办？**

最小可用架构是 3 个 Agent（协调官 + 2 个专家），不要为了"炫技"堆 Agent 数量。Agent 的增加有边际效益递减，通常 3-5 个是最佳实践区间。

---

## 八、部署检查清单

```
□ 所有 Agent 已用 openclaw agents list 确认创建成功
□ 每个 Agent 的 SOUL.md 已完成，职责边界清晰
□ openclaw.json 的 bindings 顺序正确（精确规则在前，兜底在后）
□ 飞书/Telegram 等渠道已在开发者后台开通对应权限
□ 每个 Agent 只装自己需要的 Skills，全局共享 Skills 已配置
□ 已为每个 Agent 设置 HEARTBEAT.md，配置合理的心跳间隔
□ 已在大模型服务商后台设置 Usage Limit，防止账单失控
□ 生产环境已启用 Docker Sandbox 隔离敏感操作
```

---

## 总结

多 Agent 架构的本质不是"更多 AI"，而是**组织层面的关注点分离**。每个 Agent 只做一件事、只看它需要看的上下文、只用最合适的模型——这才是它既能提升质量、又能降低成本的根本原因。

从最简单的三角结构（协调官 + 写作专家 + 编码专家）开始，跑起来之后再根据实际瓶颈扩展，是最稳健的路径。

---

*文章发布时间：2026-03-22 | 配置语法基于 OpenClaw 2026.2.x 版本，请以官方文档为准*
