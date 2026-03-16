---
title: "Cursor 重构提示词模板"
date: 2026-03-16T20:14:30+08:00
draft: false
description: "专门给 Cursor 的重构提示词"
tags: [Cursor, 重构，提示词]
categories:
  - 技术
  - 效率
author: Frida
---

这是专门给 Cursor 的重构提示词，可以直接粘贴进去：

---

```
你是一个 Godot 4 + Supabase 项目架构师。请帮我将当前项目重构为以下标准架构。

## 目标架构

### 目录结构

```
project/
├── autoloads/
│   ├── GameState.gd          # 全局游戏状态（当前局、亏空值、内耗值）
│   ├── PlayerState.gd        # 本地玩家数据缓存、精力计算逻辑
│   ├── SupabaseClient.gd     # 封装所有 Supabase REST/Realtime HTTP 请求
│   ├── RealtimeManager.gd    # 管理 Supabase Realtime 订阅，收到变更后 emit EventBus 信号
│   ├── NotificationManager.gd # 游戏内通知队列管理
│   └── EventBus.gd           # 全局信号总线，所有跨场景通信只走这里
│
├── scenes/
│   ├── auth/
│   │   ├── Login.tscn + Login.gd
│   │   └── RoleSelect.tscn + RoleSelect.gd
│   ├── hub/
│   │   └── Hub.tscn + Hub.gd
│   ├── steward/              # 管家专区
│   │   ├── Treasury.tscn + Treasury.gd
│   │   ├── Inbox.tscn + Inbox.gd
│   │   └── AuditPanel.tscn + AuditPanel.gd
│   ├── servant/              # 丫鬟小厮专区
│   │   ├── IntelBag.tscn + IntelBag.gd
│   │   ├── ListenPost.tscn + ListenPost.gd
│   │   └── Market.tscn + Market.gd
│   ├── master/               # 主子专区
│   │   └── PoetryHall.tscn + PoetryHall.gd
│   ├── shared/               # 全阶层共用场景
│   │   ├── RumorBoard.tscn + RumorBoard.gd
│   │   ├── MessageBox.tscn + MessageBox.gd
│   │   └── EventAlert.tscn + EventAlert.gd
│   └── settlement/
│       └── Settlement.tscn + Settlement.gd
│
├── scripts/
│   ├── systems/              # 纯逻辑 class，不继承 Node
│   │   ├── StaminaSystem.gd
│   │   ├── RumorSystem.gd
│   │   ├── AuditSystem.gd
│   │   ├── ScoreSystem.gd
│   │   └── EventSystem.gd
│   └── data/                 # 数据模型 class
│       ├── PlayerData.gd
│       ├── RumorData.gd
│       ├── IntelData.gd
│       └── ActionData.gd
│
└── ui/
    ├── components/           # 可复用 UI 节点
    │   ├── PlayerCard.tscn
    │   ├── IntelChip.tscn
    │   ├── ActionButton.tscn
    │   └── TimerBadge.tscn
    └── theme/
        └── DaguanyuanTheme.tres
```

---

## 核心架构规则（必须严格遵守）

### 规则 1：所有跨场景通信只走 EventBus，禁止场景间互相 get_node()

EventBus.gd 需要包含以下信号（根据实际需要增减）：

```gdscript
# autoloads/EventBus.gd
extends Node

signal rumor_fermented(rumor_id: String, stage: int)
signal rumor_expired(rumor_id: String, target_uid: String)
signal stamina_changed(new_value: int)
signal notification_received(type: String, data: Dictionary)
signal intel_acquired(intel: Dictionary)
signal audit_verdict_reached(result: Dictionary)
signal player_state_updated(uid: String, field: String, value: Variant)
signal global_event_triggered(event_type: String, data: Dictionary)
signal message_received(from_uid: String, content: String, is_tampered: bool)
```

### 规则 2：所有 Supabase 请求只走 SupabaseClient，场景不直接发 HTTP

```gdscript
# autoloads/SupabaseClient.gd
extends Node

const BASE_URL = "https://your-project.supabase.co"
const ANON_KEY = "your-anon-key"

func get_player(uid: String) -> Dictionary:
    # GET /rest/v1/players?uid=eq.{uid}
    pass

func update_player(uid: String, data: Dictionary) -> bool:
    # PATCH /rest/v1/players?uid=eq.{uid}
    pass

func insert_action(action: Dictionary) -> bool:
    # POST /rest/v1/actions_queue
    pass

# ... 其他表操作类似封装
```

### 规则 3：RealtimeManager 订阅后只 emit EventBus 信号，不操作 UI

```gdscript
# autoloads/RealtimeManager.gd
extends Node

func _ready():
    _subscribe_rumors()
    _subscribe_player_state()

func _subscribe_rumors():
    # 订阅 Supabase Realtime rumors 表变更
    # 收到变更后：
    # EventBus.rumor_fermented.emit(rumor_id, stage)
    pass
```

### 规则 4：scripts/systems/ 里的逻辑 class 不继承 Node

```gdscript
# scripts/systems/StaminaSystem.gd
class_name StaminaSystem
# 不要 extends Node

static func calculate_current(base: int, last_refresh: int, max_stamina: int) -> int:
    var elapsed = Time.get_unix_time_from_system() - last_refresh
    var recovered = int(elapsed / 7200.0)
    return min(base + recovered, max_stamina)

static func can_afford(current: int, cost: int) -> bool:
    return current >= cost
```

### 规则 5：场景 script 只做 UI 绑定和信号转发，业务逻辑调用 systems/

```gdscript
# 示例：scenes/steward/Treasury.gd
extends Control

func _ready():
    EventBus.player_state_updated.connect(_on_player_updated)

func _on_send_salary_pressed():
    var cost = 1
    if not StaminaSystem.can_afford(PlayerState.stamina, cost):
        NotificationManager.push("精力不足")
        return
    # 调用 SupabaseClient，不在这里写 HTTP
    SupabaseClient.insert_action({...})

func _on_player_updated(uid, field, value):
    if uid == PlayerState.uid:
        _refresh_ui()
```

---

## 重构步骤（按顺序执行）

1. 在 project.godot 的 autoload 列表中注册所有 autoloads/ 下的单例
2. 将所有散落的 Supabase/HTTP 调用迁移到 SupabaseClient.gd
3. 将所有 `get_node("/root/...")` 或跨场景引用替换为 EventBus 信号
4. 将所有业务计算逻辑（精力、评分、发酵）提取到 scripts/systems/ 对应文件
5. 将各场景 script 精简为只处理 UI 响应和调用上述单例/系统
6. 将可复用的 UI 元素提取为 ui/components/ 下的独立场景

---

## 背景说明

这是一款《红楼梦》背景的百人异步社交策略游戏，使用 Godot 4 + GDScript + Supabase。
游戏有五个玩家阶层（管家/主子/丫鬟小厮/元老/清客），核心系统包括：精力系统、流言发酵、查账机制、情报交易、诗社名望、突发事件、清算评分。
所有游戏逻辑异步驱动，玩家不需要同时在线。

重构目标：消除场景混乱，建立清晰的数据流向，使每个文件的职责单一明确。
```

---

用法建议：粘贴后先让 Cursor 只做**第1步**（注册 autoloads），跑通之后再逐步执行后续步骤，避免一次改太多出现大范围报错。