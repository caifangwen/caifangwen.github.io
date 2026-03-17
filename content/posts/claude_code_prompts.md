---
title: claude_code_prompts
date: 2026-03-18T00:28:35+08:00
draft: false
description: 在这里输入简短的描述
summary: 文章摘要
tags:
categories:
  - 游戏
cover: ""
author: Frida
---


# 红楼回忆志 - Claude Code 重构 Prompts

> 按阶段顺序执行，每个 Prompt 完成后验证再进行下一步。

---

## 阶段一：准备工作

### Prompt 1.1 — 创建新目录结构

```
请在 Godot 项目根目录 honglou/ 下创建以下新目录结构，不要移动或修改任何现有文件：

core/autoload/
core/systems/
core/constants/
features/eavesdrop/
features/market/
features/inbox/
features/relationship/
features/power/
scenes/main/
scenes/features/
scenes/components/
scenes/debug/
scripts/main/
scripts/features/eavesdrop/
scripts/features/market/
scripts/features/inbox/
scripts/features/relationship/
scripts/components/
scripts/debug/
data/models/
data/templates/
ui/common/
ui/dialogs/
resources/sprites/
resources/audio/
resources/fonts/
tests/unit/
tests/integration/
docs/

在每个新目录中创建一个空的 .gitkeep 文件以使 git 追踪该目录。
完成后列出所有新创建的目录。
```

---

### Prompt 1.2 — Git 备份

```
在 honglou/ 项目根目录执行以下 git 操作，为重构前的代码创建备份：

1. 执行 git add . 暂存所有当前文件
2. 执行 git commit，提交信息为：
   "chore: backup before refactoring - pre-restructure snapshot"
3. 创建新分支 backup-pre-refactor
4. 切换回原来的分支（main 或 master）

完成后输出 git log --oneline -3 的结果确认提交成功。
```

---

## 阶段二：核心层迁移

### Prompt 2.1 — 迁移 Autoload 文件

```
将以下文件从旧路径复制到新路径（使用复制而非移动，保持原文件不动直到验证通过）：

复制规则：
- autoload/GameTime.gd → core/autoload/GameTime.gd
- scripts/autoload/EavesdropManager.gd → core/autoload/EavesdropManager.gd
- scripts/autoload/EventBus.gd → core/autoload/EventBus.gd
- scripts/autoload/FirebaseManager.gd → core/autoload/FirebaseManager.gd
- scripts/autoload/GameState.gd → core/autoload/GameState.gd
- scripts/autoload/MaidProgressionChecker.gd → core/autoload/MaidProgressionChecker.gd
- scripts/autoload/MockDatabase.gd → core/autoload/MockDatabase.gd
- scripts/autoload/PlayerState.gd → core/autoload/PlayerState.gd
- scripts/autoload/RelationshipManager.gd → core/autoload/RelationshipManager.gd
- scripts/autoload/StaminaManager.gd → core/autoload/StaminaManager.gd
- scripts/autoload/SupabaseManager.gd → core/autoload/SupabaseManager.gd
- scripts/data/GameConfig.gd → core/autoload/GameConfig.gd

同时复制对应的 .gd.uid 文件（如果存在）。
完成后列出 core/autoload/ 目录中的所有文件。
```

---

### Prompt 2.2 — 更新 project.godot 中的 Autoload 注册路径

```
读取 honglou/project.godot 文件，找到 [autoload] 部分，将其中所有路径更新为新路径。

新的 [autoload] 配置应为：

[autoload]
GameState="res://core/autoload/GameState.gd"
PlayerState="res://core/autoload/PlayerState.gd"
EventBus="res://core/autoload/EventBus.gd"
GameTime="res://core/autoload/GameTime.gd"
GameConfig="res://core/autoload/GameConfig.gd"
SupabaseManager="res://core/autoload/SupabaseManager.gd"
MockDatabase="res://core/autoload/MockDatabase.gd"
StaminaManager="res://core/autoload/StaminaManager.gd"
EavesdropManager="res://core/autoload/EavesdropManager.gd"
RelationshipManager="res://core/autoload/RelationshipManager.gd"
MaidProgressionChecker="res://core/autoload/MaidProgressionChecker.gd"
InboxManager="res://core/autoload/InboxManager.gd"

注意：
1. 如果 InboxManager.gd 目前在 scripts/inbox/ 下，先只注册已迁移的文件
2. 保留原有注册顺序，不要打乱依赖关系
3. 修改完成后输出修改后的 [autoload] 段落内容供我确认
```

---

### Prompt 2.3 — 迁移 src/ 核心系统文件

```
将 src/ 目录下的文件复制到 core/systems/，同时重命名为 PascalCase：

复制并重命名规则：
- src/game.gd → core/systems/Game.gd
- src/player.gd → core/systems/Player.gd
- src/camera.gd → core/systems/Camera.gd
- src/input.gd → core/systems/InputHandler.gd
- src/tilemap.gd → core/systems/TileMap.gd
- src/collision.gd → core/systems/Collision.gd
- src/animations.gd → core/systems/Animation.gd
- src/scene.gd → core/systems/Scene.gd
- src/player_states.gd → core/systems/PlayerStates.gd

对于 src/maps/ 子目录，将其内容复制到 core/systems/maps/。

复制完成后，在每个迁移到 core/systems/ 的文件顶部检查是否有 class_name 声明，
如果文件名变了，请同步更新 class_name 为新的 PascalCase 名称。

完成后列出 core/systems/ 中的所有文件。
```

---

### Prompt 2.4 — 迁移常量文件

```
将常量相关文件复制到 core/constants/：

- src/constants.gd → core/constants/GameConstants.gd
  （同时将文件内的 class_name 更新为 GameConstants，如有）
- src/assets.gd → core/constants/AssetPaths.gd
  （同时将文件内的 class_name 更新为 AssetPaths，如有）

完成后输出两个文件的前 20 行，确认内容正确。
```

---

## 阶段三：功能层迁移

### Prompt 3.1 — 迁移听壁脚（Eavesdrop）模块

```
将听壁脚相关的脚本和场景文件复制到对应的新位置：

脚本文件（复制到 features/eavesdrop/）：
- scripts/ui/EavesdropHub.gd
- scripts/ui/EavesdropScene.gd
- scripts/ui/EavesdropSessionItem.gd（如存在）
- scripts/ui/IntelIntercept.gd（如存在）
- scripts/ui/IntelBag.gd（如存在）
- scripts/ui/IntelBagUI.gd（如存在）
- scripts/ui/IntelFragmentItem.gd（如存在）
- scripts/data/intel_templates.gd → features/eavesdrop/IntelTemplates.gd
  （重命名为 PascalCase，同时更新文件内 class_name）

场景文件（复制到 scenes/features/）：
- scenes/ui/EavesdropScene.tscn（如存在）
- scenes/ui/EavesdropHub.tscn（如存在）
- scenes/ui/IntelIntercept.tscn（如存在）

请先列出 scripts/ui/ 中所有包含 "Eavesdrop" 或 "Intel" 关键字的文件，
再执行复制，确保没有遗漏。
```

---

### Prompt 3.2 — 迁移市场（Market）模块

```
将市场相关文件复制到新位置：

脚本文件（复制到 features/market/）：
- scripts/market/BridgeMarket.gd
- scripts/market/BridgeMarketUI.gd
- scripts/market/ListingCard.gd

场景文件（复制到 scenes/features/）：
- scenes/market/ 目录下所有 .tscn 文件

请先列出 scripts/market/ 和 scenes/market/ 下的所有文件，
确认后执行复制，并输出新位置的文件列表。
```

---

### Prompt 3.3 — 迁移信箱（Inbox）模块

```
将信箱相关文件复制到新位置：

脚本文件：
- scripts/inbox/InboxManager.gd → features/inbox/InboxManager.gd
- scripts/ui/InboxUI.gd → features/inbox/InboxUI.gd（如存在）

场景文件（如存在，复制到 scenes/features/）：
- 所有包含 "Inbox" 关键字的 .tscn 文件

请先搜索整个项目中文件名包含 "Inbox" 的所有 .gd 和 .tscn 文件，
列出结果后再执行复制。
```

---

### Prompt 3.4 — 迁移关系（Relationship）和势力（Power）模块

```
将关系和势力相关文件复制到新位置：

关系模块（复制到 features/relationship/）：
- scripts/ui/RelationshipPanel.gd（如存在）
- scripts/ui/MaidProgressPanel.gd（如存在）

势力模块（复制到 features/power/）：
- scripts/systems/PowerInfluence.gd

对应场景文件复制到 scenes/features/：
- 文件名包含 "Relationship"、"MaidProgress" 的 .tscn 文件

请先搜索项目中所有包含上述关键字的文件并列出，再执行复制。
```

---

## 阶段四：场景与脚本重组

### Prompt 4.1 — 迁移主流程场景和脚本

```
将主流程相关的场景和脚本文件复制到对应新目录：

场景文件（scenes/*.tscn → scenes/main/）：
- scenes/Main.tscn
- scenes/Login.tscn
- scenes/RoleSelect.tscn
- scenes/Hub.tscn
- scenes/Game.tscn
- scenes/Settlement.tscn

脚本文件（scripts/*.gd 或 scripts/ui/*.gd → scripts/main/）：
- 对应上述场景的同名 .gd 文件（如 HubUI.gd 对应 Hub.tscn，请判断对应关系）

请先列出 scenes/ 根目录下所有 .tscn 文件，以及 scripts/ 根目录和 scripts/ui/ 下的
所有主流程相关 .gd 文件，确认映射关系后再执行复制。
```

---

### Prompt 4.2 — 整理 UI 通用组件

```
整理 UI 目录，将通用组件归类：

1. 将旧 ui/ 目录下的文件复制到 ui/common/：
   - ui/TimePanel.gd → ui/common/TimePanel.gd
   - ui/TimePanel.tscn → ui/common/TimePanel.tscn
   - ui/TimePanel.gd.uid → ui/common/TimePanel.gd.uid（如存在）

2. 将调试面板移动到正确位置：
   - debug/DebugTimePanel.tscn → scenes/debug/DebugTimePanel.tscn
   - scripts/ui/DebugPanelUI.gd → scripts/debug/DebugPanelUI.gd（如存在）

3. 将弹窗相关文件复制到 ui/dialogs/：
   - 文件名包含 "Panel" 或 "Dialog" 且不在 features/ 中的 .gd 和 .tscn 文件

请先列出需要操作的文件，确认后再执行。
```

---

## 阶段五：路径更新

### Prompt 5.1 — 批量更新 .tscn 场景文件中的脚本路径

```
扫描 scenes/ 目录下所有 .tscn 文件，找出其中引用了旧路径的 script 属性，
并更新为新路径。

需要替换的路径映射：
- "res://autoload/" → "res://core/autoload/"
- "res://src/" → "res://core/systems/"
- "res://scripts/autoload/" → "res://core/autoload/"
- "res://scripts/ui/" → 根据文件所属功能模块，替换为对应的新路径
  - Eavesdrop/Intel 相关 → "res://features/eavesdrop/"
  - Market 相关 → "res://features/market/"
  - Inbox 相关 → "res://features/inbox/"
  - Relationship/Maid 相关 → "res://features/relationship/"
  - Hub/Login/Main 相关 → "res://scripts/main/"
- "res://scripts/market/" → "res://features/market/"
- "res://scripts/inbox/" → "res://features/inbox/"
- "res://scripts/data/" → 根据内容分发到 core/autoload/ 或 data/models/
- "res://ui/" → "res://ui/common/"（仅 TimePanel 相关）

操作前请先输出找到的所有旧路径引用，确认替换计划后再执行修改。
```

---

### Prompt 5.2 — 批量更新 .gd 脚本中的 preload/load 路径

```
扫描 core/、features/、scripts/ 目录下所有 .gd 文件，
找出使用 preload() 或 load() 引用了旧路径的语句，并更新为新路径。

替换规则与 Prompt 5.1 相同：
- "res://autoload/" → "res://core/autoload/"
- "res://src/" → "res://core/systems/"
- "res://scripts/autoload/" → "res://core/autoload/"
- "res://scripts/ui/Eavesdrop" → "res://features/eavesdrop/Eavesdrop"
- "res://scripts/ui/Intel" → "res://features/eavesdrop/Intel"
- "res://scripts/market/" → "res://features/market/"
- "res://scripts/inbox/" → "res://features/inbox/"
- "res://scripts/data/intel_templates" → "res://features/eavesdrop/IntelTemplates"
- "res://scripts/data/GameConfig" → "res://core/autoload/GameConfig"

请先列出所有找到的旧路径引用（文件名 + 行号 + 引用内容），
我确认后再执行批量替换。
```

---

### Prompt 5.3 — 统一修复文件命名（snake_case → PascalCase）

```
检查 features/ 目录下是否还有使用 snake_case 命名的 .gd 文件。

重点检查：
- features/eavesdrop/intel_templates.gd 应已重命名为 IntelTemplates.gd
- 其他任何 snake_case 文件

对于每个需要重命名的文件：
1. 复制为新的 PascalCase 文件名
2. 如果文件内有 class_name 声明，同步更新
3. 在整个项目中搜索对该文件的引用，并更新为新文件名

请列出所有需要重命名的文件，确认后再执行。
```

---

## 阶段六：清理与收尾

### Prompt 6.1 — 验证新结构完整性

```
在删除旧文件之前，执行以下验证检查：

1. 列出 core/autoload/ 中的所有文件，对比原 autoload/ 和 scripts/autoload/ 的文件列表，
   确认没有遗漏。

2. 列出 core/systems/ 中的所有文件，对比原 src/ 的文件列表，
   确认没有遗漏。

3. 在项目中搜索仍然引用旧路径的语句：
   - 搜索 "res://autoload/" 的出现
   - 搜索 "res://src/" 的出现
   - 搜索 "res://scripts/autoload/" 的出现
   - 搜索 "res://scripts/ui/" 的出现（应该只剩非功能模块文件）

4. 输出 project.godot 中的 [autoload] 段落，确认所有路径已更新。

将验证结果整理为一份报告，列出：
- ✅ 已完成的迁移
- ⚠️ 仍需处理的项目
```

---

### Prompt 6.2 — 删除旧目录

```
在确认 Prompt 6.1 的验证全部通过后，执行以下清理操作：

删除以下旧目录（及其所有内容）：
- autoload/
- src/
- scripts/autoload/
- scripts/data/
- scripts/market/
- scripts/inbox/
- ui/（根目录下的旧 ui/，已迁移到 ui/common/）
- scenes/market/
- scenes/ui/（如已全部迁移）

注意：
- 删除前再次确认每个目录下的文件已全部迁移
- scripts/ui/ 暂时保留，仅删除已确认迁移的文件
- debug/ 根目录保留或合并到 scenes/debug/

删除完成后，输出项目根目录的一级目录结构。
```

---

### Prompt 6.3 — 规范检查：添加类型注解

```
对 core/autoload/ 中的关键文件进行代码质量改进，
为函数参数和返回值添加 GDScript 类型注解：

优先处理以下文件中的 public 函数：
- GameState.gd
- PlayerState.gd
- StaminaManager.gd
- EavesdropManager.gd

改进示例：
# 改进前
func update_deficit(delta):
    deficit_value = clamp(deficit_value + delta, 0.0, 100.0)

# 改进后
func update_deficit(delta: float) -> void:
    deficit_value = clampf(deficit_value + delta, 0.0, 100.0)

请逐个文件处理，每次修改后输出修改的函数列表。
不要修改函数的逻辑，只添加类型注解。
```

---

### Prompt 6.4 — 生成架构文档

```
根据重构后的项目结构，在 docs/ 目录下生成以下文档：

1. docs/architecture.md
   内容包括：
   - 项目概览（引擎、后端、类型）
   - 目录结构说明（每个目录的职责）
   - 模块依赖关系图（用 Mermaid 语法）
   - Autoload 加载顺序及依赖说明

2. docs/module-specifications.md
   内容包括：
   - 各功能模块（eavesdrop、market、inbox、relationship、power）的职责说明
   - 模块间通信方式（EventBus 信号列表）
   - 新增模块的标准结构模板

请先读取以下文件以了解现有代码结构，再生成文档：
- project.godot（了解 autoload 注册）
- core/autoload/EventBus.gd（了解现有信号）
- core/autoload/GameState.gd（了解全局状态）
```

---

### Prompt 6.5 — 最终提交

```
执行最终的 git 提交，记录本次重构：

1. 执行 git add .
2. 执行 git commit，提交信息为：

refactor: complete directory structure reorganization

- Moved all autoload scripts to core/autoload/
- Moved core engine systems from src/ to core/systems/
- Organized feature modules into features/ (eavesdrop, market, inbox, relationship, power)
- Unified file naming to PascalCase
- Separated main-flow scenes into scenes/main/
- Separated feature scenes into scenes/features/
- Cleaned up redundant ui/ and autoload/ directories
- Added type annotations to core autoload scripts
- Added architecture documentation in docs/

BREAKING CHANGE: All resource paths have changed.
See docs/architecture.md for the new directory structure.

3. 输出 git log --oneline -5 确认提交记录。
```

---

## 附录：常用检查命令

在任何阶段遇到问题时，可以使用以下 Prompt 进行排查：

### 检查路径引用残留

```
在整个项目中搜索以下旧路径的引用，并列出文件名、行号和内容：
- "res://autoload/"
- "res://src/"
- "res://scripts/autoload/"
- "res://scripts/ui/"
- "res://scripts/data/"
- "res://scripts/market/"
- "res://scripts/inbox/"

输出格式：文件路径:行号: 引用内容
```

### 检查 Autoload 文件完整性

```
列出以下目录中的所有 .gd 文件，并对比差异：
1. core/autoload/ （新位置）
2. autoload/ （旧位置，如未删除）
3. scripts/autoload/ （旧位置，如未删除）

确认新位置包含旧位置的所有文件。
```
