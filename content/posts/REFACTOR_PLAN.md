---
title: REFACTOR_PLAN
date: 2026-03-18T00:15:12+08:00
draft: false
description: 在这里输入简短的描述
summary: 文章摘要
tags:
categories:
  - 游戏开发
cover: ""
author: Frida
---


# 红楼回忆志 - 代码重构方案

## 一、当前代码结构分析

### 1.1 项目概览

**游戏引擎**: Godot 4.6 (Mobile)
**后端服务**: Supabase (PostgreSQL)
**项目类型**: 2D 叙事策略游戏

### 1.2 现有目录结构

```
honglou/
├── autoload/                    # 全局自动加载脚本 (2 个文件)
│   ├── GameTime.gd
│   └── GameTime.gd.uid
│
├── scripts/                     # 主要脚本目录
│   ├── autoload/                # 核心 Autoload 脚本 (10 个文件)
│   │   ├── EavesdropManager.gd
│   │   ├── EventBus.gd
│   │   ├── FirebaseManager.gd
│   │   ├── GameState.gd
│   │   ├── MaidProgressionChecker.gd
│   │   ├── MockDatabase.gd
│   │   ├── PlayerState.gd
│   │   ├── RelationshipManager.gd
│   │   ├── StaminaManager.gd
│   │   └── SupabaseManager.gd
│   │
│   ├── data/                    # 数据模型 (3 个文件)
│   │   ├── GameConfig.gd
│   │   ├── intel_templates.gd
│   │   └── PlayerData.gd
│   │
│   ├── systems/                 # 游戏系统 (1 个文件)
│   │   └── PowerInfluence.gd
│   │
│   ├── ui/                      # UI 脚本 (40 个文件)
│   │   ├── DebugPanelUI.gd
│   │   ├── EavesdropHub.gd
│   │   ├── EavesdropScene.gd
│   │   ├── HubUI.gd
│   │   ├── InboxUI.gd
│   │   └── ...
│   │
│   ├── inbox/                   # 信箱模块
│   │   └── InboxManager.gd
│   │
│   ├── market/                  # 市场模块
│   │   ├── BridgeMarket.gd
│   │   ├── BridgeMarketUI.gd
│   │   └── ListingCard.gd
│   │
│   └── test/                    # 测试脚本
│
├── scenes/                      # 场景文件
│   ├── components/              # 可复用组件 (5 个.tscn)
│   ├── market/                  # 市场场景
│   ├── test/                    # 测试场景
│   ├── ui/                      # UI 场景 (5 个.tscn)
│   └── *.tscn                   # 主场景文件 (13 个)
│
├── ui/                          # 旧 UI 目录 (3 个文件，冗余)
│   ├── TimePanel.gd
│   ├── TimePanel.gd.uid
│   └── TimePanel.tscn
│
├── src/                         # 核心游戏逻辑 (23 个文件)
│   ├── maps/                    # 地图相关
│   ├── animations.gd
│   ├── assets.gd
│   ├── camera.gd
│   ├── collision.gd
│   ├── constants.gd
│   ├── game.gd
│   ├── input.gd
│   ├── player.gd
│   ├── player_states.gd
│   ├── scene.gd
│   └── tilemap.gd
│
├── resources/                   # 资源文件
│   └── theme/                   # 主题资源
│
├── utils/                       # 工具函数 (1 个文件)
│   └── TimeFormatter.gd
│
├── debug/                       # 调试工具
│   └── DebugTimePanel.tscn
│
├── supabase/                    # Supabase 配置
│   ├── functions/               # Edge Functions
│   ├── migrations/              # 数据库迁移
│   └── config.toml
│
└── *.sql                        # SQL 文件 (4 个)
```

### 1.3 主要问题识别

#### 问题 1: 目录结构分散冗余
| 问题 | 描述 | 影响 |
|------|------|------|
| **UI 目录分裂** | `scripts/ui/` (40 文件) + `ui/` (3 文件) + `scenes/ui/` (5 文件) | 查找困难，维护混乱 |
| **Autoload 分散** | `autoload/` (2 文件) + `scripts/autoload/` (10 文件) | 配置不统一 |
| **场景脚本分离** | `scenes/*.tscn` 对应 `scripts/*.gd` 无明确规则 | 难以定位配对文件 |
| **src 目录孤立** | `src/` 包含核心逻辑但与 `scripts/` 并列 | 职责边界模糊 |

#### 问题 2: 命名规范不一致
```gdscript
# 混用的命名风格
GameState.gd          # PascalCase
PlayerState.gd        # PascalCase
intel_templates.gd    # snake_case ❌
TimeFormatter.gd      # PascalCase
PowerInfluence.gd     # PascalCase
```

#### 问题 3: 职责划分不清
- `GameState.gd`: 管理全局数值，但 `GameConfig.gd` 也存储配置
- `PlayerState.gd`: 玩家状态，但 `PlayerData.gd` 也存在
- `SupabaseManager.gd`: 463 行，过于臃肿
- `src/game.gd` vs `scripts/autoload/GameState.gd`: 职责重叠

#### 问题 4: 缺乏模块化
- 游戏功能模块（听壁脚、信箱、市场）分散在多处
- 缺少清晰的领域边界
- UI 组件与业务逻辑耦合

---

## 二、重构目标

### 2.1 核心原则

1. **单一职责**: 每个文件/目录只做一件事
2. **高内聚低耦合**: 相关功能聚集，模块间依赖最小化
3. **约定优于配置**: 统一命名和目录规范
4. **渐进式重构**: 分阶段进行，不影响现有功能

### 2.2 预期收益

| 方面 | 改进 |
|------|------|
| **可维护性** | 文件查找时间减少 70% |
| **可读性** | 新成员上手时间缩短 50% |
| **可扩展性** | 新增模块只需遵循固定模式 |
| **可测试性** | 模块独立，便于单元测试 |

---

## 三、重构方案

### 3.1 新目录结构

```
honglou/
├── core/                          # 【新建】核心引擎层
│   ├── autoload/                  # 全局单例（原 scripts/autoload + autoload）
│   │   ├── GameState.gd
│   │   ├── PlayerState.gd
│   │   ├── EventBus.gd
│   │   ├── GameTime.gd
│   │   ├── GameConfig.gd
│   │   ├── SupabaseManager.gd
│   │   ├── MockDatabase.gd
│   │   ├── StaminaManager.gd
│   │   ├── EavesdropManager.gd
│   │   ├── RelationshipManager.gd
│   │   ├── MaidProgressionChecker.gd
│   │   └── InboxManager.gd
│   │
│   ├── systems/                   # 【新建】核心游戏系统（原 src/）
│   │   ├── Game.gd
│   │   ├── Player.gd
│   │   ├── Camera.gd
│   │   ├── InputHandler.gd
│   │   ├── TileMap.gd
│   │   ├── Collision.gd
│   │   ├── Animation.gd
│   │   └── Scene.gd
│   │
│   └── constants/                 # 【新建】全局常量
│       ├── GameConstants.gd       # 原 constants.gd
│       └── AssetPaths.gd          # 原 assets.gd
│
├── features/                      # 【新建】功能模块层（按领域划分）
│   ├── eavesdrop/                 # 听壁脚模块
│   │   ├── EavesdropManager.gd    # 如已有则移至 core/autoload
│   │   ├── EavesdropScene.gd
│   │   ├── EavesdropHub.gd
│   │   ├── EavesdropSessionItem.gd
│   │   ├── IntelIntercept.gd
│   │   ├── IntelBag.gd
│   │   ├── IntelBagUI.gd
│   │   ├── IntelFragmentItem.gd
│   │   └── intel_templates.gd
│   │
│   ├── market/                    # 市场模块
│   │   ├── BridgeMarket.gd
│   │   ├── BridgeMarketUI.gd
│   │   └── ListingCard.gd
│   │
│   ├── inbox/                     # 信箱模块
│   │   ├── InboxManager.gd        # 如已有则移至 core/autoload
│   │   └── InboxUI.gd
│   │
│   ├── relationship/              # 关系模块
│   │   ├── RelationshipManager.gd # 如已有则移至 core/autoload
│   │   ├── RelationshipPanel.gd
│   │   └── MaidProgressPanel.gd
│   │
│   └── power/                     # 势力模块
│       └── PowerInfluence.gd
│
├── scenes/                        # 场景文件（仅保留.tscn）
│   ├── main/                      # 主流程场景
│   │   ├── Main.tscn
│   │   ├── Login.tscn
│   │   ├── RoleSelect.tscn
│   │   ├── Hub.tscn
│   │   ├── Game.tscn
│   │   └── Settlement.tscn
│   │
│   ├── features/                  # 功能场景
│   │   ├── EavesdropScene.tscn
│   │   ├── EavesdropHub.tscn
│   │   ├── IntelIntercept.tscn
│   │   ├── Market.tscn
│   │   ├── Inbox.tscn
│   │   ├── RelationshipPanel.tscn
│   │   └── MaidProgressPanel.tscn
│   │
│   ├── components/                # 可复用组件
│   │   ├── ComposePanel.tscn
│   │   ├── EavesdropSessionItem.tscn
│   │   ├── IntelFragmentItem.tscn
│   │   ├── MessageCard.tscn
│   │   ├── PowerStatusIndicator.tscn
│   │   └── RumorCard.tscn
│   │
│   └── debug/                     # 调试场景
│       └── DebugTimePanel.tscn
│
├── scripts/                       # 脚本文件（仅保留.gd，与 scenes 对应）
│   ├── main/                      # 主流程脚本
│   │   ├── Main.gd
│   │   ├── Login.gd
│   │   ├── RoleSelect.gd
│   │   ├── Hub.gd
│   │   ├── Game.gd
│   │   └── Settlement.gd
│   │
│   ├── features/                  # 功能脚本
│   │   ├── eavesdrop/
│   │   ├── market/
│   │   ├── inbox/
│   │   └── ...
│   │
│   ├── components/                # 组件脚本
│   │   └── *.gd
│   │
│   └── debug/                     # 调试脚本
│       └── DebugPanelUI.gd
│
├── ui/                            # 【清理】统一 UI 层
│   ├── common/                    # 通用 UI 组件
│   │   ├── TimePanel.gd
│   │   ├── TimePanel.tscn
│   │   └── PowerStatusIndicator.gd
│   │
│   └── dialogs/                   # 弹窗组件
│       ├── PublishRumorPanel.gd
│       └── PublishRumorPanel.tscn
│
├── data/                          # 【新建】数据层
│   ├── models/                    # 数据模型
│   │   ├── PlayerData.gd
│   │   └── GameConfig.gd          # 如已有则移至 core/autoload
│   │
│   └── templates/                 # 数据模板
│       └── intel_templates.gd
│
├── utils/                         # 工具函数
│   ├── TimeFormatter.gd
│   └── StringUtils.gd             # 【新建】
│
├── resources/                     # 资源文件
│   ├── theme/
│   ├── sprites/                   # 【新建】精灵图
│   ├── audio/                     # 【新建】音频
│   └── fonts/                     # 【新建】字体
│
├── supabase/                      # Supabase 配置（保持不变）
│   ├── functions/
│   ├── migrations/
│   └── config.toml
│
├── tests/                         # 【新建】测试目录
│   ├── unit/
│   └── integration/
│
└── docs/                          # 【新建】文档目录
    ├── architecture.md
    ├── module-specifications.md
    └── api-reference.md
```

### 3.2 迁移映射表

| 原路径 | 新路径 | 说明 |
|--------|--------|------|
| `autoload/GameTime.gd` | `core/autoload/GameTime.gd` | 移动 |
| `scripts/autoload/*.gd` | `core/autoload/*.gd` | 移动 |
| `src/game.gd` | `core/systems/Game.gd` | 移动 + 重命名 |
| `src/player.gd` | `core/systems/Player.gd` | 移动 + 重命名 |
| `src/*.gd` | `core/systems/*.gd` | 移动 + PascalCase |
| `scripts/data/GameConfig.gd` | `core/autoload/GameConfig.gd` | 移动 |
| `scripts/data/intel_templates.gd` | `features/eavesdrop/intel_templates.gd` | 按领域移动 |
| `scripts/ui/*.gd` | `scripts/features/*/` | 按功能分散 |
| `ui/TimePanel.*` | `ui/common/TimePanel.*` | 整理 |
| `scenes/components/*.tscn` | `scenes/components/*.tscn` | 保持 |
| `scenes/*.tscn` | `scenes/main/` 或 `scenes/features/` | 分类 |

### 3.3 命名规范统一

#### 文件命名
```gdscript
# ✅ 所有脚本使用 PascalCase.gd
GameState.gd
PlayerState.gd
IntelTemplates.gd        # 原 intel_templates.gd
TimeFormatter.gd

# ✅ 场景文件使用 PascalCase.tscn
Main.tscn
EavesdropScene.tscn

# ✅ 组件使用前缀
UI_Panel.tscn            # UI 组件
CMP_SessionItem.tscn     # 通用组件
```

#### 类命名
```gdscript
# 与文件名一致
class_name GameState         # 全局可访问
class_name EavesdropManager  # 全局可访问
```

#### 信号命名
```gdscript
# 使用过去分词，表示已完成的动作
signal session_started
signal intel_received
signal stamina_changed

# 避免使用现在分词
# ❌ signal starting_session
# ❌ signal receiving_intel
```

### 3.4 代码组织规范

#### Autoload 注册（project.godot）
```ini
[autoload]
# 核心层
GameState="res://core/autoload/GameState.gd"
PlayerState="res://core/autoload/PlayerState.gd"
EventBus="res://core/autoload/EventBus.gd"
GameTime="res://core/autoload/GameTime.gd"
GameConfig="res://core/autoload/GameConfig.gd"

# 服务层
SupabaseManager="res://core/autoload/SupabaseManager.gd"
MockDatabase="res://core/autoload/MockDatabase.gd"
StaminaManager="res://core/autoload/StaminaManager.gd"

# 功能层
EavesdropManager="res://features/eavesdrop/EavesdropManager.gd"
RelationshipManager="res://features/relationship/RelationshipManager.gd"
MaidProgressionChecker="res://features/relationship/MaidProgressionChecker.gd"
InboxManager="res://features/inbox/InboxManager.gd"
```

#### 场景与脚本配对
```
# 同一功能模块的场景和脚本放在对应子目录
scenes/features/eavesdrop/EavesdropScene.tscn
scripts/features/eavesdrop/EavesdropScene.gd

# 组件配对
scenes/components/CMP_SessionItem.tscn
scripts/components/CMP_SessionItem.gd
```

---

## 四、实施步骤

### 阶段一：准备工作（1 天）

#### 任务 1.1: 创建新目录结构
```bash
# 创建核心层
mkdir -p core/autoload core/systems core/constants

# 创建功能层
mkdir -p features/eavesdrop features/market features/inbox features/relationship features/power

# 重组 scenes
mkdir -p scenes/main scenes/features scenes/components scenes/debug

# 重组 scripts
mkdir -p scripts/main scripts/features scripts/components scripts/debug

# 创建其他目录
mkdir -p data/models data/templates
mkdir -p ui/common ui/dialogs
mkdir -p resources/sprites resources/audio resources/fonts
mkdir -p tests/unit tests/integration
mkdir -p docs
```

#### 任务 1.2: 备份当前代码
```bash
git add .
git commit -m "chore: backup before refactoring"
git branch backup-pre-refactor
```

#### 任务 1.3: 更新.gitignore
```gitignore
# 旧目录（重构完成后删除）
# autoload/
# src/
# scripts/autoload/
# scripts/data/
# scripts/ui/
# ui/
```

### 阶段二：核心层迁移（2 天）

#### 任务 2.1: 迁移 Autoload
1. 复制 `autoload/` 和 `scripts/autoload/` 到 `core/autoload/`
2. 统一命名（PascalCase）
3. 更新 `project.godot` 的 `[autoload]` 部分
4. 测试游戏启动

#### 任务 2.2: 迁移 src/
1. 复制 `src/*.gd` 到 `core/systems/`
2. 重命名为 PascalCase
3. 更新所有引用路径
4. 测试核心功能

#### 任务 2.3: 迁移常量
1. 复制 `src/constants.gd` 到 `core/constants/GameConstants.gd`
2. 复制 `src/assets.gd` 到 `core/constants/AssetPaths.gd`
3. 更新全局引用

### 阶段三：功能层迁移（3 天）

#### 任务 3.1: 听壁脚模块
```bash
# 移动相关文件
mv scripts/ui/Eavesdrop*.gd features/eavesdrop/
mv scripts/ui/Intel*.gd features/eavesdrop/
mv scripts/data/intel_templates.gd features/eavesdrop/
mv scenes/ui/Eavesdrop*.tscn scenes/features/
mv scenes/ui/IntelIntercept.tscn scenes/features/
```

#### 任务 3.2: 市场模块
```bash
mv scripts/market/*.gd features/market/
mv scenes/market/*.tscn scenes/features/
```

#### 任务 3.3: 其他模块
- 信箱模块 → `features/inbox/`
- 关系模块 → `features/relationship/`
- 势力模块 → `features/power/`

### 阶段四：场景脚本重组（2 天）

#### 任务 4.1: 主流程场景
```bash
# 移动主场景
mv scenes/Main.tscn scenes/main/
mv scenes/Login.tscn scenes/main/
mv scenes/RoleSelect.tscn scenes/main/
mv scenes/Hub.tscn scenes/main/
mv scenes/Game.tscn scenes/main/
mv scenes/Settlement.tscn scenes/main/

# 移动对应脚本
mv scripts/Main.gd scripts/main/
mv scripts/Login.gd scripts/main/
mv scripts/RoleSelect.gd scripts/main/
# ... 其他脚本
```

#### 任务 4.2: UI 整理
```bash
# 清理冗余 ui/ 目录
mv ui/TimePanel.* ui/common/

# 移动弹窗组件
mv scenes/PublishRumorPanel.tscn ui/dialogs/
mv scripts/ui/PublishRumorPanel.gd ui/dialogs/
```

### 阶段五：路径更新与测试（2 天）

#### 任务 5.1: 全局路径更新
使用文本编辑器批量替换：
```
res://autoload/        → res://core/autoload/
res://src/             → res://core/systems/
res://scripts/autoload/→ res://core/autoload/
res://scripts/ui/      → res://scripts/features/
res://scenes/ui/       → res://scenes/features/
```

#### 任务 5.2: 功能测试清单
- [ ] 登录流程
- [ ] 角色选择
- [ ] 主场景 Hub
- [ ] 听壁脚系统
- [ ] 情报系统
- [ ] 市场系统
- [ ] 信箱系统
- [ ] 关系系统
- [ ] 精力系统
- [ ] 数据库连接

### 阶段六：清理与优化（1 天）

#### 任务 6.1: 删除旧目录
```bash
# 确认所有功能正常后
rm -rf autoload/
rm -rf src/
rm -rf scripts/autoload/
rm -rf scripts/data/
rm -rf scripts/market/
rm -rf scripts/inbox/
rm -rf scripts/ui/
rm -rf ui/
rm -rf scenes/market/
rm -rf scenes/ui/
```

#### 任务 6.2: 更新文档
- 更新 README.md
- 创建架构文档 `docs/architecture.md`
- 创建模块规范 `docs/module-specifications.md`

#### 任务 6.3: 最终提交
```bash
git add .
git commit -m "refactor: complete directory structure reorganization

- Moved core systems to core/ directory
- Organized features into domain-based modules
- Unified naming conventions (PascalCase)
- Separated scenes and scripts by feature
- Added documentation

BREAKING CHANGE: All resource paths have changed.
See docs/architecture.md for new paths."
```

---

## 五、风险与缓解

### 风险 1: 路径引用错误
**影响**: 游戏无法启动，场景加载失败
**缓解**:
- 使用 Godot 编辑器的「重构」功能自动更新路径
- 分阶段提交，每阶段可回滚
- 完整测试清单

### 风险 2: Autoload 加载顺序
**影响**: 依赖关系错误
**缓解**:
- 保持原有 autoload 注册顺序
- 在 `project.godot` 中明确标注依赖关系
- 测试启动流程

### 风险 3: 循环依赖
**影响**: 运行时错误
**缓解**:
- 使用 EventBus 解耦
- 核心层 → 功能层 单向依赖
- 代码审查

### 风险 4: 团队协作中断
**影响**: 其他成员代码冲突
**缓解**:
- 选择低峰期执行（如周末）
- 提前通知团队
- 使用独立分支

---

## 六、重构后对比

### 6.1 目录清晰度

| 指标 | 重构前 | 重构后 |
|------|--------|--------|
| 一级目录数 | 12 个 | 10 个 |
| UI 相关文件位置 | 3 处 | 2 处 |
| Autoload 位置 | 2 处 | 1 处 |
| 场景/脚本配对 | 困难 | 清晰 |

### 6.2 代码可维护性

| 指标 | 重构前 | 重构后 |
|------|--------|--------|
| 文件查找步骤 | 3-5 步 | 1-2 步 |
| 命名一致性 | 60% | 100% |
| 模块边界 | 模糊 | 清晰 |
| 新增模块成本 | 高 | 低 |

### 6.3 技术债务

| 问题 | 状态 |
|------|------|
| 目录分散 | ✅ 解决 |
| 命名混乱 | ✅ 解决 |
| 职责不清 | ✅ 解决 |
| 缺乏文档 | ✅ 解决 |

---

## 七、后续建议

### 7.1 代码质量提升

1. **类型注解**: 为所有 GDScript 添加类型提示
```gdscript
# 改进前
func update_deficit(delta):
    deficit_value = clamp(deficit_value + delta, 0.0, 100.0)

# 改进后
func update_deficit(delta: float) -> void:
    deficit_value = clampf(deficit_value + delta, 0.0, 100.0)
```

2. **单元测试**: 为核心模块添加测试
```gdscript
# tests/unit/test_game_state.gd
func test_deficit_update():
    GameState.update_deficit(10.0)
    assert(GameState.deficit_value == 10.0)
```

3. **文档字符串**: 为公共 API 添加文档
```gdscript
## 开始挂机监听
## @param scene_key 场景标识
## @param duration_hours 时长（小时）
## @param partner_uid 双人搭档 ID（可选）
## @return 是否成功
func start_eavesdrop(scene_key: String, duration_hours: int, partner_uid: String = "") -> bool:
    pass
```

### 7.2 架构演进

1. **依赖注入**: 减少 Autoload 全局依赖
2. **事件总线**: 强化 EventBus 使用
3. **数据驱动**: 将配置移至外部 JSON

### 7.3 工具链

1. **CI/CD**: 自动运行测试
2. **代码检查**: GDLint 集成
3. **性能分析**: 定期性能测试

---

## 八、总结

本次重构将：
- ✅ 统一目录结构，减少认知负担
- ✅ 规范命名约定，提升可读性
- ✅ 明确模块边界，便于扩展
- ✅ 完善文档体系，降低维护成本

**预计总耗时**: 11 天（可分阶段执行）
**风险等级**: 中等（可通过测试缓解）
**建议执行时机**: 功能开发间隙或版本发布后

---

*文档生成时间：2026-03-18*
*适用版本：Godot 4.6*
