---
title: "单 Gateway 多 Agent：一台机器运行一支 AI 团队"
date: 2026-03-22T00:00:00+08:00
draft: false
tags: ["OpenClaw", "Multi-Agent", "Gateway", "架构", "实战"]
categories: ["AI工具", "原理解析"]
description: "单 Gateway 多 Agent 是 OpenClaw 的黄金架构——一个进程、一个端口，同时跑多个完全隔离的 AI，本文彻底讲清楚它是什么、如何工作、怎么配置。"
slug: "openclaw-single-gateway-multi-agent"
author: "Claude"
---

## 先讲清楚一件事：Gateway 和 Agent 的关系

很多人第一次看到"单 Gateway 多 Agent"这个词会以为它是某种复杂的分布式架构。其实不然。

用一个比喻来说：

> Gateway 是一栋办公楼，Agent 是楼里不同的员工。**楼只有一栋，但员工可以很多。** 访客（你发的消息）进门后，前台（Gateway 路由）判断应该找哪位员工，然后带你去找他。

这就是单 Gateway 多 Agent 的全部核心逻辑。

官方的定义更直接：

> "单 Gateway 多 Agent 是个人/小团队的黄金标准架构。"

一个进程、一个端口（默认 18789）、统一管理所有 Agent 的生命周期、路由和通信——这是 OpenClaw 推荐的默认部署形态。

---

## 一、它长什么样？

```
                    ┌─────────────────────────────────────┐
                    │         Gateway 进程（×1）           │
                    │         端口：18789                  │
                    │                                     │
  飞书消息 ──→      │  ┌──────────────────────────────┐   │
  Telegram 消息 ──→ │  │       消息路由（Router）      │   │
  WhatsApp 消息 ──→ │  └──────┬──────┬──────┬─────────┘   │
  Web UI ──→        │         │      │      │             │
                    │         ↓      ↓      ↓             │
                    │    ┌────┐  ┌────┐  ┌────┐          │
                    │    │ A1 │  │ A2 │  │ A3 │  ...     │
                    │    │main│  │写作│  │编码│          │
                    │    └────┘  └────┘  └────┘          │
                    │    独立      独立      独立          │
                    │    工作区    工作区    工作区        │
                    │    独立      独立      独立          │
                    │    会话      会话      会话          │
                    └─────────────────────────────────────┘
```

关键点：所有 Agent 共享一个 Gateway 进程和端口，但每个 Agent 的工作区（workspace）、会话历史（sessions）、认证信息（auth profiles）**完全物理隔离**，互不干扰。

---

## 二、为什么需要多 Agent？单 Agent 有什么问题？

在解释多 Agent 之前，先说清楚单 Agent 会碰到什么墙。

### 问题一：上下文污染（最核心的问题）

单 Agent 跑久了，会话历史里什么都有：上周的购物清单、三天前的代码调试、昨天的邮件摘要、今天的写作请求……

模型不会自动过滤这些干扰。上下文越来越杂，AI 的注意力越来越分散，输出质量开始肉眼可见地下降。这就是"神经错乱"现象的根源。

### 问题二：模型浪费

用 Claude Opus 问"今天天气怎么样"，属于用大炮打蚊子。但如果只配置一个 Agent，你无法给不同任务分配不同模型——要么全用贵的，要么全用便宜的，没有中间地带。

### 问题三：无法实现角色专注

让同一个 Agent 同时扮演"技术专家"和"文案策划"，它的 SOUL.md 会变成一锅粥，越写越臃肿，反而两头都不精。

多 Agent 解决的就是这三个问题。

---

## 三、隔离边界在哪里？（这是最重要的细节）

每个 Agent 拥有独立的工作区（workspace）、独立的状态目录（agentDir，存放认证信息和模型注册）、以及存放在 `~/.openclaw/agents/<agentId>/sessions/` 下的独立会话记录。主 Agent 的认证凭证不会自动共享给其他 Agent。

具体分三层：

**第一层：工作区隔离（workspace）**

每个 Agent 有自己的独立文件夹，包含 `SOUL.md`（人格设定）、`AGENTS.md`（协作规则）、`USER.md`（用户偏好）、`memory/`（长期记忆）、`skills/`（专属技能）。

Agent A 的 SOUL.md 不会影响 Agent B，Agent B 的记忆文件不会被 Agent A 读取。

**第二层：会话隔离（sessions）**

会话历史按 Agent 分别存储：

```
~/.openclaw/agents/
├── main/
│   └── sessions/           # main Agent 的所有对话记录
├── writer/
│   └── sessions/           # writer Agent 的所有对话记录
└── coder/
    └── sessions/           # coder Agent 的所有对话记录
```

writer 的上下文永远不会污染 coder 的上下文，反之亦然。

**第三层：认证隔离（auth profiles）**

每个 Agent 可以绑定不同的 API Key：

```
~/.openclaw/agents/
├── main/
│   └── agent/
│       └── auth-profiles.json    # main 的 API Key（Anthropic）
├── writer/
│   └── agent/
│       └── auth-profiles.json    # writer 的 API Key（DeepSeek）
└── coder/
    └── agent/
        └── auth-profiles.json    # coder 的 API Key（Anthropic）
```

在单 Gateway 部署中，各 Agent 的凭证虽然在各自目录下，但仍共享同一个运行时环境。如果需要更严格的密钥隔离（比如你的个人 Slack Token 和客户的 API Key 不能在同一个环境里），才需要考虑多 Gateway 方案。

---

## 四、消息是怎么路由到对应 Agent 的？

Bindings（绑定规则）负责将入站消息路由到指定 Agent，可以按渠道（channel）、账号（account）、联系人/群组（peer）或频道（space）进行匹配。

路由匹配遵循**精确优先**原则：越具体的规则优先级越高，兜底规则放最后。

```
匹配优先级（从高到低）：
peer（具体联系人/群组）> accountId（具体账号）> channel（渠道类型）> 默认兜底
```

完整路由配置示例：

```json
{
  "agents": {
    "defaults": {
      "model": "anthropic/claude-haiku-4-5"
    },
    "list": [
      {
        "id": "main",
        "workspace": "~/.openclaw/workspace",
        "model": "anthropic/claude-sonnet-4-6"
      },
      {
        "id": "writer",
        "workspace": "~/.openclaw/workspace-writer",
        "model": "deepseek/deepseek-chat"
      },
      {
        "id": "coder",
        "workspace": "~/.openclaw/workspace-coder",
        "model": "anthropic/claude-sonnet-4-6"
      },
      {
        "id": "assistant",
        "workspace": "~/.openclaw/workspace-assistant"
        // 不指定 model，继承 defaults 的 Haiku
      }
    ]
  },
  "bindings": [
    // ① 最精确：特定 Telegram 群组 → writer
    {
      "agentId": "writer",
      "match": {
        "channel": "telegram",
        "peer": { "kind": "group", "id": "-1001234567890" }
      }
    },
    // ② 渠道级：所有 Slack 消息 → coder
    {
      "agentId": "coder",
      "match": { "channel": "slack" }
    },
    // ③ 飞书特定群 → assistant
    {
      "agentId": "assistant",
      "match": {
        "channel": "feishu",
        "peer": { "kind": "group", "id": "oc_日常群ID" }
      }
    },
    // ④ 兜底：所有未匹配的 → main
    {
      "agentId": "main",
      "match": { "channel": "*" }
    }
  ]
}
```

---

## 五、多账号绑定：一个 Bot 对应一个 Agent

在 Telegram 场景下，可以为每个 Agent 配置独立的 Bot Token，让每个团队成员拥有专属的私人 AI——从用户视角看完全是"我的专属机器人"，但后端全部跑在同一台机器的同一个 Gateway 进程里。

这是实现"一台 Mac Mini 养活整个团队"的具体方案：

```json
{
  "agents": {
    "list": [
      { "id": "alice-sales",   "workspace": "~/.openclaw/workspace-alice" },
      { "id": "bob-support",   "workspace": "~/.openclaw/workspace-bob" },
      { "id": "carol-finance", "workspace": "~/.openclaw/workspace-carol" }
    ]
  },
  "bindings": [
    { "agentId": "alice-sales",   "match": { "channel": "telegram", "accountId": "alice" } },
    { "agentId": "bob-support",   "match": { "channel": "telegram", "accountId": "bob" } },
    { "agentId": "carol-finance", "match": { "channel": "telegram", "accountId": "carol" } }
  ],
  "channels": {
    "telegram": {
      "accounts": {
        "alice": { "botToken": "Alice 的 Bot Token", "dmPolicy": "pairing" },
        "bob":   { "botToken": "Bob 的 Bot Token",   "dmPolicy": "pairing" },
        "carol": { "botToken": "Carol 的 Bot Token", "dmPolicy": "pairing" }
      }
    }
  }
}
```

效果：Alice 和 @AliceSalesClaw 对话，Bob 和 @BobSupportClaw 对话，Carol 和 @CarolFinanceClaw 对话——三个人完全独立，互相看不到对方的任何内容，但 Gateway 只有一个进程在运行。

---

## 六、Sub-Agent：动态派生的临时工

除了在配置文件里预先定义的持久 Agent，OpenClaw 还支持 Sub-Agent——由持久 Agent 在运行时动态派生的临时 Agent，它们在独立的隔离会话中执行任务，完成后将结果回传给发起者。Sub-Agent 的好处是保持主会话干净：如果 Sub-Agent 产生大量中间噪音，那些噪音只留在它自己的会话记录里，不会污染主 Agent 的上下文。

两种触发方式：

**手动触发（命令行）：**

```bash
# 派生一个 sub-agent 执行后台任务
/subagents spawn main "总结过去 7 天的 changelog，生成发版说明"

# 指定更便宜的模型执行
/subagents spawn writer "把这篇文章翻译成英文" --model deepseek/deepseek-chat
```

**自动触发（orchestrator 模式）：**

主 Agent 在处理复杂任务时，通过 `sessions_spawn` 工具自动派生多个 Sub-Agent 并行工作：

```
用户："帮我同时分析这 5 份竞品报告"
         ↓
main Agent（orchestrator）
    ├── 派生 sub-agent-1 → 分析竞品A
    ├── 派生 sub-agent-2 → 分析竞品B
    ├── 派生 sub-agent-3 → 分析竞品C
    ├── 派生 sub-agent-4 → 分析竞品D
    └── 派生 sub-agent-5 → 分析竞品E
         ↓（5个并行执行）
    main 汇总 5 份分析结果，输出综合报告
```

---

## 七、Skills 的共享与专属

Skills 的加载遵循"专属优先、共享兜底"的逻辑：

```
~/.openclaw/
├── skills/                     # 全局共享（所有 Agent 可用）
│   ├── web-search/
│   └── file-tools/
├── workspace-writer/
│   └── skills/                 # writer 专属
│       ├── seo-checker/
│       └── article-template/
└── workspace-coder/
    └── skills/                 # coder 专属
        ├── code-review/
        └── test-runner/
```

加载优先级：`agent 专属 skills > 全局 skills`。专属 skills 不会出现在其他 Agent 的工具列表里，避免 Agent 调用不该用的工具。

---

## 八、什么时候该从单 Gateway 升级到多 Gateway？

单 Gateway 多 Agent 是个人和小团队的黄金标准，绝大多数场景下完全够用。只有当以下条件成立时，才需要考虑多 Gateway：

| 场景 | 建议方案 |
|------|---------|
| 个人使用，5 个以内 Agent | ✅ 单 Gateway，够用 |
| 小团队，10 人以内，共用一台服务器 | ✅ 单 Gateway，够用 |
| 需要严格的密钥隔离（如客户项目与个人项目的 API Key 不能共存） | ⚠️ 考虑多 Gateway |
| 某个 Agent 需要完全独立的网络策略（如只能访问内网） | ⚠️ 考虑多 Gateway |
| Agent 数量超过 15 个，管理开始混乱 | ⚠️ 先考虑精简 Agent，再考虑拆分 |

大多数情况下只需要运行一个 Gateway。只有在需要严格隔离或冗余的场景下才使用多 Gateway，例如给不同信任边界的项目独立配置运行时环境。

---

## 九、演进路径：从单 Agent 到多 Agent 的正确节奏

不要在第一天就构建一个庞大的多 Agent 系统。推荐按阶段演进：先用一个 Agent 掌握工具链，学习如何写有效的提示词和管理基础上下文；等单 Agent 开始出现上下文混乱时，再拆分出"工作 Agent"和"生活 Agent"，这能解决 80% 的早期性能问题；随着规模扩大，再建立前端、后端、QA、日报等专业化角色体系。

简单说：**先把一个 Agent 跑稳，再加第二个，每次只加一个，验证稳定后再继续扩展。**

---

## 十、快速验证配置是否正确

```bash
# 查看所有 Agent 及其绑定规则
openclaw agents list --bindings

# 验证路由：测试一条消息会被路由到哪个 Agent
openclaw route test --channel telegram --peer-id "123456"

# 查看 Gateway 当前运行状态（含各 Agent 状态）
openclaw gateway status --verbose

# 实时日志，确认路由行为
openclaw logs --follow --component router
```

正常输出示例：

```
Agents (4):
  main     [default] model: sonnet-4-6  sessions: 12  status: ready ✓
  writer             model: deepseek    sessions: 3   status: ready ✓
  coder              model: sonnet-4-6  sessions: 7   status: ready ✓
  assistant          model: haiku-4-5   sessions: 8   status: ready ✓

Bindings (4):
  telegram group -100123456  →  writer   ✓
  slack *                    →  coder    ✓
  feishu group oc_xxx        →  assistant ✓
  * (fallback)               →  main     ✓
```

---

## 总结

单 Gateway 多 Agent 的本质，是用**最低的运维成本**换取**最高的角色隔离效果**：

- 一个进程、一个端口，不需要管多个服务
- 每个 Agent 的上下文、记忆、认证完全物理隔离，互不污染
- 路由规则灵活，可以按渠道、账号、具体联系人精确分发消息
- 模型可以按 Agent 分级，复杂任务用好模型，简单任务用便宜模型
- Sub-Agent 机制支持动态并行，处理重型任务时自动分裂执行

从一个 Agent 跑起来，遇到上下文混乱时加第二个，这是最稳健的路径。

---

*文章发布时间：2026-03-22 | 基于 OpenClaw 官方文档与社区实践，配置语法以官方最新版为准*
