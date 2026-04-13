---
title: "Godot 游戏开发:多人联机与实时交互完整指南"
date: "2026-03-23T02:51:03+08:00"
draft: false
tags: ["Godot", "多人联机", "Multiplayer", "RPC", "ENet", "WebSocket", "GDScript"]
categories: ["游戏开发"]
description: "从网络模型选型到 RPC 同步、场景复制、延迟补偿，系统讲解在已有 UI 与 TileMap 架构上实现 Godot 4 多人联机的完整方案。"
slug: "godot-multiplayer-guide"
---

# Godot 游戏开发：多人联机与实时交互完整指南

## 前言

在完成 UI 界面、数值逻辑以及 TileMap 世界场景之后，多人联机是让游戏真正"活"起来的最后一块拼图。

Godot 4 内置了强大的 **High-Level Multiplayer API**，封装了底层网络通信，让开发者可以用极少的代码实现：

- 玩家位置实时同步
- RPC 远程调用（攻击、技能、对话）
- 场景对象自动复制（MultiplayerSpawner）
- 属性自动同步（MultiplayerSynchronizer）

本文将从**网络模型选型**开始，逐步讲解如何在已有架构（UI + 数值逻辑 + TileMap）上叠加多人联机层。

---

## 一、核心概念速览

### 1.1 网络角色

Godot 多人游戏中每个节点都有一个 **network authority（网络权威）**：

| 角色 | 说明 |
|------|------|
| **Server（服务端）** | peer_id = 1，拥有最终权威，处理游戏逻辑 |
| **Client（客户端）** | peer_id ≥ 2，负责本地预测和展示 |
| **Host（主机）** | 同时扮演 Server 和 Client（监听模式） |

```gdscript
# 获取当前节点的网络 peer id
multiplayer.get_unique_id()

# 判断是否为服务端
multiplayer.is_server()
```

### 1.2 三种网络架构

```
① 客户端 - 服务端（C/S）       ② 点对点（P2P）           ③ 中继服务器
   ┌──────┐                      ┌──────┐                   ┌──────────┐
   │Server│                      │ P1   │──────────── P2 │  │  Relay   │
   └──┬───┘                      └──┬───┘                   └────┬─────┘
      │                             │ \                          │
   ┌──┴──┐ ┌──────┐             ┌──┴──┐ ┌──────┐           ┌───┴──┐
   │ C1  │ │  C2  │             │ P3  │─│  P4  │           │  C1  │...
   └─────┘ └──────┘             └─────┘ └──────┘           └──────┘
   权威服务端，防作弊            实现简单，NAT 穿透难        适合 WebGL
```

**Godot 4 推荐方案**：小型游戏用 **ENet（P2P / Listen Server）**，商业项目用**专用服务器 + WebSocket**。

---

## 二、网络传输层配置

### 2.1 ENet（局域网 / 直连）

```gdscript
# network_manager.gd (Autoload)
extends Node

const PORT = 7777
const MAX_CLIENTS = 8

var peer: ENetMultiplayerPeer

signal player_connected(peer_id: int)
signal player_disconnected(peer_id: int)
signal server_disconnected()

func create_server():
    peer = ENetMultiplayerPeer.new()
    var err = peer.create_server(PORT, MAX_CLIENTS)
    if err != OK:
        push_error("服务端创建失败: %s" % err)
        return
    multiplayer.multiplayer_peer = peer
    multiplayer.peer_connected.connect(_on_peer_connected)
    multiplayer.peer_disconnected.connect(_on_peer_disconnected)
    print("服务端启动，端口: %d" % PORT)

func join_server(address: String):
    peer = ENetMultiplayerPeer.new()
    var err = peer.create_client(address, PORT)
    if err != OK:
        push_error("连接失败: %s" % err)
        return
    multiplayer.multiplayer_peer = peer
    multiplayer.connected_to_server.connect(_on_connected_to_server)
    multiplayer.connection_failed.connect(_on_connection_failed)
    multiplayer.server_disconnected.connect(_on_server_disconnected)

func _on_peer_connected(id: int):
    print("玩家连接: %d" % id)
    player_connected.emit(id)

func _on_peer_disconnected(id: int):
    print("玩家断开: %d" % id)
    player_disconnected.emit(id)

func _on_connected_to_server():
    print("成功连接到服务端，我的 ID: %d" % multiplayer.get_unique_id())

func _on_connection_failed():
    push_error("连接服务端失败")

func _on_server_disconnected():
    server_disconnected.emit()
```

### 2.2 WebSocket（适合 WebGL / 浏览器部署）

```gdscript
func create_server_ws():
    var ws_peer = WebSocketMultiplayerPeer.new()
    ws_peer.create_server(PORT)
    multiplayer.multiplayer_peer = ws_peer

func join_server_ws(url: String):
    # url 示例: "ws://192.168.1.100:7777"
    var ws_peer = WebSocketMultiplayerPeer.new()
    ws_peer.create_client(url)
    multiplayer.multiplayer_peer = ws_peer
```

---

## 三、玩家生成与管理

### 3.1 MultiplayerSpawner 自动同步生成

```
World.tscn
├── TileMap
├── Players (Node2D)          ← Spawner 监控这个容器
│   └── [运行时动态生成]
├── MultiplayerSpawner        ← 自动同步所有客户端的节点创建/销毁
└── MultiplayerSynchronizer
```

```gdscript
# game_manager.gd (Autoload)

# 存储所有在线玩家信息
var players: Dictionary = {}
# { peer_id: { "name": "...", "color": Color, "peer_id": int } }

func _ready():
    NetworkManager.player_connected.connect(_on_player_connected)
    NetworkManager.player_disconnected.connect(_on_player_disconnected)
    multiplayer.peer_connected.connect(_on_new_peer)

func _on_new_peer(id: int):
    # 新玩家连接后，服务端把当前所有玩家数据同步给他
    if multiplayer.is_server():
        for existing_id in players:
            _send_player_info.rpc_id(id, existing_id, players[existing_id])

## 注册本地玩家信息（连接成功后调用）
func register_local_player(player_name: String):
    var info = {
        "name": player_name,
        "peer_id": multiplayer.get_unique_id(),
        "color": Color(randf(), randf(), randf())
    }
    # 广播给所有人（包括服务端）
    _send_player_info.rpc(multiplayer.get_unique_id(), info)

@rpc("any_peer", "reliable")
func _send_player_info(id: int, info: Dictionary):
    players[id] = info
    player_info_received.emit(id, info)
```

### 3.2 玩家节点实例化

```gdscript
# world.gd
extends Node2D

@export var player_scene: PackedScene
@onready var players_container: Node2D = $Players
@onready var spawner: MultiplayerSpawner = $MultiplayerSpawner

func _ready():
    spawner.spawn_function = _spawn_player
    if multiplayer.is_server():
        _spawn_for_peer(1)  # 服务端自己
    multiplayer.peer_connected.connect(_spawn_for_peer)
    multiplayer.peer_disconnected.connect(_remove_player)

func _spawn_for_peer(peer_id: int):
    if not multiplayer.is_server():
        return
    spawner.spawn(peer_id)  # 触发所有客户端同步创建

func _spawn_player(peer_id) -> Node:
    var player = player_scene.instantiate()
    player.name = str(peer_id)          # 必须用 peer_id 命名，便于 RPC 路由
    player.set_multiplayer_authority(int(peer_id))
    player.global_position = _get_spawn_point()
    return player

func _remove_player(peer_id: int):
    if players_container.has_node(str(peer_id)):
        players_container.get_node(str(peer_id)).queue_free()
```

---

## 四、RPC 远程调用：实现交互

RPC（Remote Procedure Call）是 Godot 多人联机的核心机制。

### 4.1 RPC 修饰符速查

```gdscript
# 调用方向
@rpc("authority")      # 只有 authority 可以发送（默认）
@rpc("any_peer")       # 任何 peer 都可以发送

# 接收目标
# （无额外参数）        # 发给所有人
.rpc_id(peer_id, ...)  # 发给指定 peer

# 可靠性
@rpc("reliable")       # TCP 语义，保证送达，有序
@rpc("unreliable")     # UDP 语义，可能丢包，低延迟（适合位置）
@rpc("unreliable_ordered")  # 乱序丢弃，保证最新

# 本地执行
@rpc("call_local")     # 调用时本地也同步执行
```

### 4.2 玩家位置同步

```gdscript
# player.gd
extends CharacterBody2D

@onready var sync: MultiplayerSynchronizer = $MultiplayerSynchronizer

func _ready():
    # 只有本机控制的玩家才处理输入
    set_process(is_multiplayer_authority())
    set_physics_process(is_multiplayer_authority())

func _physics_process(delta):
    var direction = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
    velocity = direction * 200.0
    move_and_slide()
    # MultiplayerSynchronizer 自动同步 position 和 velocity，无需手动 RPC
```

```gdscript
# player.tscn 中 MultiplayerSynchronizer 配置：
# Root Path: ..  (player 节点本身)
# Replication 属性:
#   - position       (同步间隔: 每帧, 可靠性: unreliable_ordered)
#   - animation_state (同步间隔: 变化时, 可靠性: reliable)
```

### 4.3 战斗交互（攻击 / 受击）

```gdscript
# player.gd

## 客户端请求攻击（发给服务端验证）
func attack():
    if not is_multiplayer_authority():
        return
    _request_attack.rpc_id(1, global_position, rotation)

@rpc("any_peer", "reliable")
func _request_attack(attacker_pos: Vector2, attack_dir: float):
    # 只有服务端执行验证逻辑
    if not multiplayer.is_server():
        return

    var attacker_id = multiplayer.get_remote_sender_id()
    var hit_targets = _check_attack_hitbox(attacker_pos, attack_dir)

    for target_id in hit_targets:
        var damage = GameManager.calculate_damage(attacker_id, target_id)
        # 服务端广播伤害结果
        _apply_damage.rpc(target_id, damage, attacker_id)

@rpc("authority", "reliable", "call_local")
func _apply_damage(target_peer_id: int, damage: int, attacker_id: int):
    # 所有客户端执行：更新被击者血量
    var target = get_node_or_null("/root/World/Players/%d" % target_peer_id)
    if target == null:
        return
    GameManager.apply_damage_to_player(target_peer_id, damage)
    # UI 更新通过 GameManager 信号自动触发
    _spawn_hit_effect.rpc(target.global_position)

@rpc("authority", "unreliable", "call_local")
func _spawn_hit_effect(pos: Vector2):
    # 所有客户端播放击中特效（视觉反馈，不影响逻辑）
    EffectManager.play_hit(pos)
```

### 4.4 聊天 / 交互消息

```gdscript
# chat_manager.gd (Autoload)
extends Node

signal message_received(sender_name: String, text: String)

## 任意客户端调用 → 服务端广播
func send_message(text: String):
    var sender_id = multiplayer.get_unique_id()
    _broadcast_message.rpc_id(1, sender_id, text)

@rpc("any_peer", "reliable")
func _broadcast_message(sender_id: int, text: String):
    if not multiplayer.is_server():
        return
    # 服务端过滤违禁词后广播
    var safe_text = _filter_text(text)
    var sender_name = GameManager.players[sender_id]["name"]
    _receive_message.rpc(sender_name, safe_text)

@rpc("authority", "reliable", "call_local")
func _receive_message(sender_name: String, text: String):
    message_received.emit(sender_name, text)
    # UI 层监听此信号更新聊天框
```

---

## 五、延迟补偿与客户端预测

网络延迟是多人游戏永恒的挑战，Godot 4 提供了基础工具：

### 5.1 客户端预测（Client-Side Prediction）

```gdscript
# player.gd
# 客户端在发送输入的同时，本地立即执行（不等服务端确认）

var input_queue: Array = []
var last_server_state: Dictionary = {}

func _physics_process(delta):
    if is_multiplayer_authority():
        var input = {
            "tick": Engine.get_physics_frames(),
            "dir": Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
        }
        input_queue.append(input)
        _process_input(input["dir"], delta)     # 本地立即执行
        _send_input.rpc_id(1, input)            # 同时发送给服务端

func _send_input(input: Dictionary):
    # 服务端接收，运行权威物理
    pass

## 服务端状态回传后进行对账（Reconciliation）
func _on_server_state(state: Dictionary):
    last_server_state = state
    # 如果位置偏差超过阈值，强制纠正
    if global_position.distance_to(state["position"]) > 5.0:
        global_position = state["position"]
        # 重放服务端确认帧之后的所有本地输入
        _replay_inputs_after(state["tick"])
```

### 5.2 插值平滑（其他玩家显示）

```gdscript
# remote_player_display.gd
# 用于显示其他玩家（非本机控制）的视觉节点

var target_position: Vector2
var target_rotation: float

func _process(delta):
    # 对收到的网络位置做平滑插值，避免跳帧
    global_position = global_position.lerp(target_position, delta * 15.0)
    rotation = lerp_angle(rotation, target_rotation, delta * 15.0)

func update_from_network(pos: Vector2, rot: float):
    target_position = pos
    target_rotation = rot
```

---

## 六、与已有架构的整合

### 6.1 多人架构融入现有三层结构

```
┌─────────────────────────────────────────────┐
│           UI 层 (CanvasLayer)                │
│   HUD · 聊天框 · 玩家列表 · 延迟显示          │
│   监听: GameManager 信号 + ChatManager 信号   │
├─────────────────────────────────────────────┤
│           逻辑层 (Autoload)                  │
│   GameManager  → 数值、信号枢纽               │
│   NetworkManager → 连接管理、peer 生命周期    │
│   ChatManager  → 聊天消息路由                 │
├─────────────────────────────────────────────┤
│           世界层 (World.tscn)                │
│   TileMap         → 地形（服务端权威）        │
│   Players/        → MultiplayerSpawner 管理  │
│   MultiplayerSynchronizer → 属性自动同步      │
└─────────────────────────────────────────────┘
                       ↕ ENet / WebSocket
┌─────────────────────────────────────────────┐
│              网络传输层                       │
│         ENetMultiplayerPeer                  │
│         WebSocketMultiplayerPeer             │
└─────────────────────────────────────────────┘
```

### 6.2 TileMap 变化的同步

当玩家技能改变地形时，TileMap 修改必须以**服务端为权威**：

```gdscript
# world.gd

## 客户端请求修改地形（如放置炸弹后破坏墙壁）
func request_tile_change(map_pos: Vector2i, source_id: int, atlas_coord: Vector2i):
    _server_change_tile.rpc_id(1, map_pos, source_id, atlas_coord)

@rpc("any_peer", "reliable")
func _server_change_tile(map_pos: Vector2i, source_id: int, atlas_coord: Vector2i):
    if not multiplayer.is_server():
        return
    # 服务端验证合法性
    if not _is_valid_tile_change(map_pos, source_id):
        return
    # 广播给所有客户端执行
    _sync_tile_change.rpc(map_pos, source_id, atlas_coord)

@rpc("authority", "reliable", "call_local")
func _sync_tile_change(map_pos: Vector2i, source_id: int, atlas_coord: Vector2i):
    tile_map.set_cell(0, map_pos, source_id, atlas_coord)
```

---

## 七、大厅系统（UI 层集成）

```gdscript
# lobby_ui.gd
extends Control

@onready var host_btn: Button = $VBox/HostButton
@onready var join_btn: Button = $VBox/JoinButton
@onready var ip_input: LineEdit = $VBox/IPInput
@onready var player_list: VBoxContainer = $VBox/PlayerList
@onready var start_btn: Button = $VBox/StartButton

func _ready():
    host_btn.pressed.connect(_on_host)
    join_btn.pressed.connect(_on_join)
    start_btn.pressed.connect(_on_start)
    start_btn.visible = false

    GameManager.player_info_received.connect(_refresh_player_list)
    NetworkManager.player_disconnected.connect(_on_player_left)

func _on_host():
    NetworkManager.create_server()
    GameManager.register_local_player($VBox/NameInput.text)
    start_btn.visible = true   # 只有房主能开始

func _on_join():
    NetworkManager.join_server(ip_input.text)
    GameManager.register_local_player($VBox/NameInput.text)

func _on_start():
    if not multiplayer.is_server():
        return
    # 通知所有客户端切换场景
    _start_game.rpc()

@rpc("authority", "reliable", "call_local")
func _start_game():
    get_tree().change_scene_to_file("res://scenes/world/World.tscn")

func _refresh_player_list(_id, _info):
    for child in player_list.get_children():
        child.queue_free()
    for peer_id in GameManager.players:
        var info = GameManager.players[peer_id]
        var label = Label.new()
        label.text = "%s  [ID: %d]" % [info["name"], peer_id]
        player_list.add_child(label)
```

---

## 八、常见问题与调试技巧

### 8.1 RPC 不生效的排查清单

```
□ 节点 name 是否为 String(peer_id)？（MultiplayerSpawner 要求）
□ set_multiplayer_authority(peer_id) 是否在服务端调用？
□ @rpc 修饰符的 "any_peer" / "authority" 方向是否正确？
□ 调用 .rpc() 前节点是否已在场景树中？
□ multiplayer.multiplayer_peer 是否已赋值？
```

### 8.2 本地多实例调试

```bash
# 同时启动 2 个 Godot 实例（一个 Server，一个 Client）
# 在编辑器中：Debug → Run Multiple Instances → 2

# 或命令行
godot --headless &    # 无头服务端
godot               # 客户端
```

### 8.3 显示网络延迟

```gdscript
# hud.gd
func _process(_delta):
    if multiplayer.multiplayer_peer and not multiplayer.is_server():
        var ping = multiplayer.multiplayer_peer.get_peer(1).get_statistic(
            ENetPacketPeer.PEER_ROUND_TRIP_TIME
        )
        $PingLabel.text = "Ping: %d ms" % ping
```

---

## 九、推荐项目结构（加入网络层后）

```
res://
├── autoloads/
│   ├── GameManager.gd        # 数值 + 信号枢纽
│   ├── NetworkManager.gd     # 连接管理（新增）
│   ├── ChatManager.gd        # 聊天路由（新增）
│   └── SaveManager.gd
├── scenes/
│   ├── main/
│   │   └── Main.tscn
│   ├── lobby/
│   │   └── Lobby.tscn        # 大厅 UI（新增）
│   ├── world/
│   │   ├── World.tscn        # TileMap + MultiplayerSpawner
│   │   └── world.gd
│   ├── ui/
│   │   ├── HUD.tscn          # 新增：聊天框、玩家列表、Ping 显示
│   │   └── Inventory.tscn
│   └── entities/
│       ├── Player.tscn       # 加入 MultiplayerSynchronizer
│       └── Enemy.tscn        # 服务端控制
└── resources/
    └── tilesets/
        └── world_tileset.tres
```

---

## 十、总结

| 功能 | 实现方式 |
|------|----------|
| 连接管理 | `ENetMultiplayerPeer` / `WebSocketMultiplayerPeer` |
| 玩家生成同步 | `MultiplayerSpawner` |
| 属性自动同步 | `MultiplayerSynchronizer` |
| 实时交互（攻击/技能） | `@rpc` 装饰器 + 服务端权威验证 |
| 地形同步 | 服务端验证后 `.rpc()` 广播 `set_cell` |
| 延迟补偿 | 客户端预测 + 插值平滑 |
| 聊天系统 | Autoload RPC 路由 |
| UI 更新 | 监听 GameManager 信号，与网络层完全解耦 |

**一句话记忆**：

> **客户端只管输入和展示，服务端负责验证和广播，GameManager 信号连接两端，UI 永远只看数据。**

多人联机的本质是在原有单人架构上，给每一个"事件"加上一个方向标：它应该在哪里执行、结果同步给谁。Godot 4 的 High-Level API 让这件事的代码量降到了最低，把精力留给游戏设计本身。

---

*作者：Claude · 生成时间：2026-03-23 02:51 CST*
