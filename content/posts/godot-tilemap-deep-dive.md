---
title: "深度介绍 Godot 瓦片地图（TileMap）"
date: 2026-03-18T01:21:08+08:00
draft: false
tags: ["Godot", "游戏开发", "TileMap", "2D", "GDScript"]
categories: ["游戏开发"]
description: "全面深入地介绍 Godot 引擎中的瓦片地图系统，涵盖 TileSet 配置、物理碰撞、自动图块、导航网格以及脚本控制等核心主题。"
slug: "godot-tilemap-deep-dive"
---

## 什么是瓦片地图？

**瓦片地图（TileMap）** 是 2D 游戏中构建世界的核心技术之一。它将游戏场景划分为统一大小的格子（Tile），每个格子填充一张来自图集（TileSet）的小图片，从而高效地渲染大范围地图。Godot 4 对 TileMap 系统进行了彻底重构，引入了更强大的 **TileSet** 编辑器和多图层支持，是目前最完善的 2D 瓦片系统之一。

---

## 核心概念

### TileMap 节点

`TileMap` 是 Godot 4 中管理瓦片的主节点。它承载以下职责：

- 引用一个 `TileSet` 资源，定义所有可用瓦片的外观与属性
- 管理一个或多个 **图层（Layer）**，用于分离前景、背景、碰撞层等
- 提供坐标转换、瓦片读写等 API

> **Godot 4.3+**: 官方已将 `TileMap` 拆分为独立的 `TileMapLayer` 节点，鼓励每层使用独立节点，获得更好的灵活性和性能。

### TileSet 资源

`TileSet` 是瓦片地图的"数据库"，定义了每块瓦片的：

- **纹理来源**：单张图片或图集（Atlas）
- **碰撞形状**：多边形、矩形等
- **物理材质**：摩擦力、弹力等
- **导航多边形**：用于 AI 寻路
- **自定义数据**：附加游戏逻辑属性
- **动画帧**：支持瓦片动画

---

## 创建第一个 TileMap

### 1. 添加节点

在场景树中添加 `TileMap` 节点，Inspector 面板会提示创建或绑定一个 `TileSet`。

```
场景树:
└── Node2D (Root)
    └── TileMap
```

### 2. 配置 TileSet

点击 Inspector 中的 `TileSet` → `新建 TileSet`，然后在底部的 **TileSet 编辑器** 中：

1. 点击左上角 **"+"** 添加图集来源（Atlas Source）
2. 导入你的 Sprite Sheet 图片
3. 设置单个瓦片的像素尺寸（如 16×16、32×32）
4. Godot 会自动切割图集并生成所有瓦片

### 3. 绘制地图

切换到 **TileMap** 标签，选择一个瓦片，在场景视图中点击或拖拽即可绘制。

---

## 图层系统（Layers）

TileMap 支持多个图层，每个图层可独立设置：

| 属性 | 说明 |
|---|---|
| `Name` | 图层名称，便于脚本引用 |
| `Enabled` | 是否渲染此图层 |
| `Modulate` | 颜色调制（用于半透明效果） |
| `Y Sort Enabled` | 启用 Y 轴排序（用于 RPG 俯视角） |
| `Z Index` | 渲染层级 |
| `Navigation Enabled` | 是否启用导航 |

**典型图层配置（RPG 场景）：**

```
图层 0: 地面 (Ground)       ← 草地、泥土、水面
图层 1: 装饰 (Decoration)   ← 花草、石块（无碰撞）
图层 2: 阻挡 (Obstacles)    ← 墙壁、树木（有碰撞）
图层 3: 顶层 (Overhead)     ← 屋顶、树冠（玩家走过时半透明）
```

---

## 物理碰撞配置

### 在 TileSet 中添加碰撞

1. 在 TileSet 编辑器中选择一个瓦片
2. 点击 **"物理层"** → 确保已添加物理层（Physics Layer）
3. 在瓦片的 **碰撞** 选项卡中绘制碰撞多边形

```
TileSet 结构:
├── 物理层 0 (Physics Layer 0)
│   ├── 碰撞形状 (多边形/矩形)
│   └── 物理材质 (可选)
└── 瓦片 ID → 绑定物理层
```

### 物理层与碰撞掩码

`TileMap` 的每个物理层都有独立的 **层（Layer）** 和 **掩码（Mask）**：

```gdscript
# 设置 TileMap 的碰撞层
tile_map.set_physics_layer_collision_layer(0, 1)   # 第0物理层在第1碰撞层
tile_map.set_physics_layer_collision_mask(0, 1)    # 与第1碰撞层交互
```

---

## 自动图块（Auto Tiles / Terrain）

自动图块（地形系统）是 Godot 4 最强大的特性之一，能根据相邻瓦片自动选择正确的边缘和角落图片，无需手动拼接。

### 配置地形集

1. 在 TileSet 编辑器中，选中你的图集来源
2. 点击 **"地形"** 选项卡
3. 创建 **地形集（Terrain Set）**，选择匹配模式：
   - `匹配角落和边缘`：3×3 像素感知，最精细
   - `仅匹配角落`：2×2 像素感知
   - `仅匹配边缘`：简单四向匹配
4. 为每块瓦片分配地形 ID

### 脚本中使用地形

```gdscript
# 使用地形自动填充一块区域
var cells = []
for x in range(0, 10):
    for y in range(0, 5):
        cells.append(Vector2i(x, y))

# 参数：图层索引, 地形集ID, 地形ID, 单元格列表
tile_map.set_cells_terrain_connect(0, 0, 0, cells)
```

---

## 导航网格（Navigation）

TileMap 可以直接生成 NavigationRegion2D 数据，为 AI 寻路提供网格。

### 配置步骤

1. 在 TileSet 编辑器中添加 **导航层（Navigation Layer）**
2. 为可行走的瓦片绘制 **导航多边形**
3. 在场景中的 TileMap Inspector 里启用导航图层
4. 添加 `NavigationAgent2D` 到 NPC 节点

```gdscript
# NPC 寻路示例
extends CharacterBody2D

@onready var nav_agent = $NavigationAgent2D

func _ready():
    nav_agent.target_position = player.global_position

func _physics_process(delta):
    var next_pos = nav_agent.get_next_path_position()
    var direction = (next_pos - global_position).normalized()
    velocity = direction * SPEED
    move_and_slide()
```

---

## 脚本控制 TileMap

### 基础读写操作

```gdscript
extends Node2D

@onready var tile_map: TileMap = $TileMap

func _ready():
    # 获取指定位置的瓦片数据
    var tile_data = tile_map.get_cell_tile_data(0, Vector2i(3, 4))
    if tile_data:
        print("找到瓦片：", tile_data)

    # 放置一个瓦片
    # 参数：图层, 地图坐标, 图集来源ID, 图集坐标
    tile_map.set_cell(0, Vector2i(5, 5), 0, Vector2i(1, 0))

    # 清除一个瓦片
    tile_map.erase_cell(0, Vector2i(5, 5))
```

### 坐标转换

```gdscript
# 世界坐标 → 地图格子坐标
var world_pos = Vector2(320, 240)
var map_pos = tile_map.local_to_map(tile_map.to_local(world_pos))
print("地图坐标：", map_pos)

# 地图格子坐标 → 世界坐标（格子中心）
var grid_pos = Vector2i(5, 3)
var center = tile_map.map_to_local(grid_pos)
print("世界坐标（局部）：", center)
```

### 获取区域内所有瓦片

```gdscript
# 获取某图层中所有已使用的格子坐标
var used_cells = tile_map.get_used_cells(0)
for cell in used_cells:
    print("瓦片位置：", cell)

# 获取指定区域内的格子
var rect = Rect2i(0, 0, 10, 10)
var cells_in_rect = tile_map.get_used_cells_by_id(0, 0) # 来源0的所有瓦片
```

### 自定义数据读取

可以在 TileSet 中为瓦片添加自定义数据层（如 `damage`、`is_passable`），并在脚本中读取：

```gdscript
# 在 TileSet 中添加自定义数据层 "damage" (类型: float)
func get_tile_damage(map_pos: Vector2i) -> float:
    var tile_data = tile_map.get_cell_tile_data(0, map_pos)
    if tile_data:
        return tile_data.get_custom_data("damage")
    return 0.0
```

---

## 瓦片动画

TileSet 支持帧动画，让水面、火焰、传送门等元素动起来。

### 配置动画瓦片

1. 在图集来源中选择起始帧瓦片
2. 在 **动画** 选项卡中设置帧数和帧间距
3. 设置 **FPS**（动画速率）
4. 可设置 **随机偏移**（`Animation Offset`），让同类瓦片不同步，更自然

```gdscript
# 运行时修改动画速率
var tile_data = tile_map.get_cell_tile_data(0, Vector2i(2, 3))
if tile_data:
    tile_data.set_custom_data("animation_speed", 2.0)
```

---

## 性能优化建议

| 技巧 | 说明 |
|---|---|
| **合并图集** | 将所有瓦片放入单张大图，减少 Draw Call |
| **使用 Y Sort** | 仅在需要 RPG 深度排序时开启，有性能开销 |
| **分割大地图** | 超大地图考虑分块加载（Chunk Loading） |
| **禁用不可见图层** | 将屏幕外的图层设为 `enabled = false` |
| **避免频繁 set_cell** | 批量操作后一次性刷新，而非逐格调用 |
| **使用 TileMapLayer** | Godot 4.3+ 推荐用独立节点替代多图层 TileMap |

---

## 程序化生成地图

结合脚本可以实现 Roguelike 风格的随机地图生成：

```gdscript
extends TileMap

const FLOOR_SOURCE = 0
const FLOOR_ATLAS = Vector2i(0, 0)
const WALL_ATLAS  = Vector2i(1, 0)

func generate_dungeon(width: int, height: int):
    clear()  # 清空所有图层
    
    for x in range(width):
        for y in range(height):
            var pos = Vector2i(x, y)
            # 边界设为墙
            if x == 0 or y == 0 or x == width-1 or y == height-1:
                set_cell(0, pos, FLOOR_SOURCE, WALL_ATLAS)
            else:
                # 随机生成墙壁（密度 30%）
                if randf() < 0.3:
                    set_cell(0, pos, FLOOR_SOURCE, WALL_ATLAS)
                else:
                    set_cell(0, pos, FLOOR_SOURCE, FLOOR_ATLAS)
```

---

## 小结

Godot 的 TileMap 系统功能完备，从简单的平台跳跃游戏到复杂的 RPG 大地图均能胜任。掌握以下核心流程即可快速上手：

1. **配置 TileSet** → 导入图集、切割瓦片
2. **设置物理层** → 为需要碰撞的瓦片绘制形状
3. **启用地形系统** → 实现自动拼接边缘
4. **多图层管理** → 分离地面、装饰、障碍
5. **脚本控制** → 动态读写瓦片、响应游戏事件

随着 Godot 版本迭代，`TileMapLayer` 将成为主流，建议新项目直接采用该节点以获得最佳兼容性。
