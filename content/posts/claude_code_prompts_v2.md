---
title: claude_code_prompts_v2
date: 2026-03-18T00:45:43+08:00
draft: false
description: 在这里输入简短的描述
summary: 文章摘要
tags:
categories:
  - 技术实践
  - 心理学
  - 工具使用
  - 游戏开发
  - 技术观察
  - 技术实践
  - 游戏
cover: ""
author: Frida
---

# 红楼回忆志 - 重构 Prompts V2（优化方案）

> 核心理念：.tscn 与 .gd 同目录，features/ 模块自治，core/ 只留真正全局的内容。
> 每条 Prompt 都遵循「先列出 → 你确认 → 再执行」的原则，防止误操作。

---

## 阶段一：准备工作

### Prompt 1.1 — 项目文件全量扫描

```
在执行任何重构之前，请帮我扫描 honglou/ 项目，生成一份完整的文件清单：

1. 列出所有 .gd 文件（含路径）
2. 列出所有 .tscn 文件（含路径）
3. 列出 project.godot 中 [autoload] 的完整内容
4. 列出 autoload/、scripts/、src/、ui/ 各目录的文件数量统计

输出格式：
=== .gd 文件 (共 N 个) ===
路径列表...

=== .tscn 文件 (共 N 个) ===
路径列表...

=== project.godot [autoload] ===
内容...

=== 目录统计 ===
统计表...

这份清单将作为重构的基准，请保存好输出结果。
```

---

### Prompt 1.2 — Git 备份

```
在 honglou/ 项目根目录执行以下操作，创建重构前的安全备份：

1. git add .
2. git commit -m "chore: snapshot before v2 refactor - do not delete"
3. git branch backup-pre-refactor-v2
4. 切回原分支（main 或 master）
5. 输出 git log --oneline -3 确认提交成功

备份分支名称：backup-pre-refactor-v2
```

---

### Prompt 1.3 — 创建新目录结构

```
在 honglou/ 根目录下创建以下新目录结构，不要移动或修改任何现有文件：

# 核心全局层（只放真正全局的东西）
core/

# 外部服务层
services/supabase/

# 功能模块层（每个模块内部自治）
features/eavesdrop/
features/market/
features/inbox/
features/relationship/
features/power/

# 跨模块共享
shared/components/
shared/utils/

# 顶层入口场景（只放 Main/Hub 等入口）
scenes/main/

# 数据模板
data/templates/

# 测试
tests/unit/
tests/integration/

# 文档
docs/

在每个新目录中创建 .gitkeep 文件。
完成后输出新目录树。
```

---

## 阶段二：核心层（core/）迁移

### Prompt 2.1 — 确认 core/ 的文件范围

```
根据以下标准，从现有 scripts/autoload/ 和 autoload/ 中识别哪些文件属于「真正的全局核心」：

属于 core/ 的标准（同时满足）：
- 几乎所有其他模块都依赖它
- 不属于任何单一业务功能
- 是全局状态或事件中枢

候选文件（请分析每个文件的内容和职责后给出建议）：
- GameState.gd
- EventBus.gd
- GameTime.gd
- GameConfig.gd
- PlayerState.gd
- StaminaManager.gd
- FirebaseManager.gd

对于每个文件，输出：
文件名 | 建议归属 | 理由
例：GameState.gd | core/ | 全局状态，所有模块依赖
例：EavesdropManager.gd | features/eavesdrop/ | 只服务听壁脚功能

不要执行任何文件操作，只输出分析报告。
```

---

### Prompt 2.2 — 迁移 core/ 文件

```
根据上一步确认的分析结果，将属于 core/ 的文件复制到新位置：

（以下为默认预期，请根据 Prompt 2.1 的分析结果调整）
- autoload/GameTime.gd → core/GameTime.gd
- scripts/autoload/GameState.gd → core/GameState.gd
- scripts/autoload/EventBus.gd → core/EventBus.gd
- scripts/autoload/GameConfig.gd → core/GameConfig.gd
- scripts/autoload/PlayerState.gd → core/PlayerState.gd
- scripts/autoload/StaminaManager.gd → core/StaminaManager.gd

同时复制对应的 .gd.uid 文件。

完成后列出 core/ 目录内容。
不要删除原文件。
```

---

### Prompt 2.3 — 迁移 src/ 核心系统

```
将 src/ 目录的文件复制到 core/systems/（如果你的 Prompt 2.1 分析认为需要这个子目录）
或直接并入 core/：

复制并重命名（snake_case → PascalCase）：
- src/game.gd → core/systems/Game.gd
- src/player.gd → core/systems/Player.gd
- src/player_states.gd → core/systems/PlayerStates.gd
- src/camera.gd → core/systems/Camera.gd
- src/input.gd → core/systems/InputHandler.gd
- src/tilemap.gd → core/systems/TileMap.gd
- src/collision.gd → core/systems/Collision.gd
- src/animations.gd → core/systems/Animation.gd
- src/scene.gd → core/systems/Scene.gd
- src/constants.gd → core/constants/GameConstants.gd
- src/assets.gd → core/constants/AssetPaths.gd
- src/maps/ → core/systems/maps/（整个子目录）

在每个迁移后的文件中，如有 class_name，同步更新为新的 PascalCase 名称。
完成后列出 core/ 的完整目录树。
```

---

## 阶段三：服务层（services/）迁移与拆分

### Prompt 3.1 — 分析 SupabaseManager.gd 的职责

```
请读取 scripts/autoload/SupabaseManager.gd 的完整内容，然后：

1. 统计总行数
2. 识别文件中的主要功能分区，例如：
   - 连接/初始化
   - 用户鉴权（登录/注册/登出）
   - 数据查询（SELECT）
   - 数据写入（INSERT/UPDATE）
   - 实时订阅
   - 其他

3. 输出建议的拆分方案：
   services/supabase/
   ├── SupabaseManager.gd   # 只保留连接、初始化、鉴权
   ├── SupabaseDB.gd        # 数据读写操作
   └── （其他你认为需要的拆分）

4. 列出每个新文件应包含的函数名称

不要执行任何修改，只输出分析报告。
```

---

### Prompt 3.2 — 拆分 SupabaseManager.gd

```
根据 Prompt 3.1 的分析结果，将 SupabaseManager.gd 拆分到 services/supabase/ 目录：

拆分原则：
- services/supabase/SupabaseManager.gd：保留连接初始化、鉴权相关函数
- services/supabase/SupabaseDB.gd：数据库读写操作函数

操作步骤：
1. 复制原文件到 services/supabase/SupabaseManager.gd
2. 创建 services/supabase/SupabaseDB.gd，将数据操作函数移入
3. 在 SupabaseDB.gd 中通过 @onready var _manager = SupabaseManager 引用连接
4. 在原函数位置留下转发函数（先不删除，保持向后兼容）：
   func old_function_name():
       return SupabaseDB.new_function_name()

同时复制：
- scripts/autoload/MockDatabase.gd → services/supabase/MockDatabase.gd

完成后输出 services/supabase/ 的目录内容及两个新文件的函数列表。
```

---

## 阶段四：功能模块迁移（.tscn 与 .gd 同目录）

### Prompt 4.1 — 迁移听壁脚模块（eavesdrop）

```
将听壁脚功能的所有文件迁移到 features/eavesdrop/，
.tscn 和 .gd 文件放在同一目录下。

第一步：请先列出所有与听壁脚相关的文件（搜索关键字：Eavesdrop、Intel、Intercept）：
- scripts/ 下的 .gd 文件
- scenes/ 下的 .tscn 文件

第二步（确认后执行）：
将以下文件复制到 features/eavesdrop/：

脚本文件：
- scripts/ui/EavesdropHub.gd → features/eavesdrop/EavesdropHub.gd
- scripts/ui/EavesdropScene.gd → features/eavesdrop/EavesdropScene.gd
- scripts/ui/EavesdropSessionItem.gd（如存在）
- scripts/ui/IntelIntercept.gd（如存在）
- scripts/ui/IntelBag.gd（如存在）
- scripts/ui/IntelBagUI.gd（如存在）
- scripts/ui/IntelFragmentItem.gd（如存在）
- scripts/data/intel_templates.gd → features/eavesdrop/IntelTemplates.gd（重命名）
- scripts/autoload/EavesdropManager.gd → features/eavesdrop/EavesdropManager.gd

场景文件（与脚本放在同一目录）：
- scenes/ui/EavesdropHub.tscn → features/eavesdrop/EavesdropHub.tscn
- scenes/ui/EavesdropScene.tscn → features/eavesdrop/EavesdropScene.tscn
- 其他 Eavesdrop/Intel 相关 .tscn

重命名后同步更新文件内的 class_name（如有）。
完成后输出 features/eavesdrop/ 的完整文件列表。
```

---

### Prompt 4.2 — 迁移市场模块（market）

```
将市场功能的所有文件迁移到 features/market/，.tscn 和 .gd 同目录。

第一步：列出所有市场相关文件（关键字：Market、BridgeMarket、Listing）

第二步（确认后执行）：
- scripts/market/BridgeMarket.gd → features/market/BridgeMarket.gd
- scripts/market/BridgeMarketUI.gd → features/market/BridgeMarketUI.gd
- scripts/market/ListingCard.gd → features/market/ListingCard.gd
- scenes/market/*.tscn → features/market/（所有场景文件）

完成后输出 features/market/ 的文件列表。
```

---

### Prompt 4.3 — 迁移信箱模块（inbox）

```
将信箱功能的所有文件迁移到 features/inbox/，.tscn 和 .gd 同目录。

第一步：列出所有信箱相关文件（关键字：Inbox、Mail、Message）

第二步（确认后执行）：
- scripts/inbox/InboxManager.gd → features/inbox/InboxManager.gd
- scripts/ui/InboxUI.gd → features/inbox/InboxUI.gd（如存在）
- 对应的 .tscn 文件 → features/inbox/

完成后输出 features/inbox/ 的文件列表。
```

---

### Prompt 4.4 — 迁移关系与势力模块

```
将关系和势力相关文件迁移到对应模块目录，.tscn 和 .gd 同目录。

第一步：列出相关文件（关键字：Relationship、Maid、Progression、Power、Influence）

第二步（确认后执行）：

features/relationship/：
- scripts/autoload/RelationshipManager.gd
- scripts/autoload/MaidProgressionChecker.gd
- scripts/ui/RelationshipPanel.gd（如存在）
- scripts/ui/MaidProgressPanel.gd（如存在）
- 对应的 .tscn 文件

features/power/：
- scripts/systems/PowerInfluence.gd
- 对应的 .tscn 文件

完成后分别输出两个模块的文件列表。
```

---

## 阶段五：共享组件与主场景整理

### Prompt 5.1 — 识别跨模块共享组件

```
请帮我分析 scenes/components/ 和 scripts/ui/ 中的文件，
识别哪些是「跨多个模块复用」的通用组件，哪些是「只属于某个模块」的。

判断标准：
- 如果一个组件只在 eavesdrop 场景中使用 → 移入 features/eavesdrop/
- 如果一个组件在 2 个以上模块中使用 → 移入 shared/components/

请搜索以下文件名在 .tscn 中的引用次数，给出归属建议：
- ComposePanel
- MessageCard
- PowerStatusIndicator
- RumorCard
- EavesdropSessionItem
- IntelFragmentItem

输出格式：
文件名 | 被引用次数 | 引用位置 | 建议归属
```

---

### Prompt 5.2 — 迁移共享组件

```
根据 Prompt 5.1 的分析结果，将跨模块共享的组件迁移到 shared/components/，
将只属于某模块的组件迁移到对应的 features/xxx/ 目录。

操作原则：
- .tscn 和 .gd 始终放在同一目录
- 不要创建 shared/components/scripts/ 这样的子目录

同时处理工具函数：
- utils/TimeFormatter.gd → shared/utils/TimeFormatter.gd

完成后输出 shared/ 的完整目录树。
```

---

### Prompt 5.3 — 整理主流程入口场景

```
将顶层入口场景整理到 scenes/main/，对应脚本放在同目录：

第一步：列出 scenes/ 根目录下所有 .tscn 文件

第二步（确认后执行）：
将以下场景及其对应脚本移入 scenes/main/：
- Main.tscn + Main.gd（如存在）
- Login.tscn + Login.gd（如存在）
- RoleSelect.tscn + RoleSelect.gd（如存在）
- Hub.tscn（对应脚本可能是 HubUI.gd，请找到对应关系后一并迁移）
- Game.tscn + Game.gd（如存在）
- Settlement.tscn + Settlement.gd（如存在）

注意：场景文件的 script 属性路径需要同步更新为新路径。
请在迁移后检查每个 .tscn 文件的 script 引用是否正确。

完成后输出 scenes/main/ 的文件列表。
```

---

### Prompt 5.4 — 整理 UI 通用组件

```
处理旧的 ui/ 根目录（冗余目录）：

- ui/TimePanel.gd → shared/components/TimePanel.gd
- ui/TimePanel.tscn → shared/components/TimePanel.tscn
- ui/TimePanel.gd.uid（如存在）也一并迁移

处理调试文件：
- debug/DebugTimePanel.tscn → scenes/debug/DebugTimePanel.tscn
- scripts/ui/DebugPanelUI.gd → scenes/debug/DebugPanelUI.gd

完成后确认 ui/ 根目录已清空（可以删除）。
```

---

## 阶段六：更新 project.godot 的 Autoload 注册

### Prompt 6.1 — 重新规划 Autoload 注册

```
读取 project.godot 中当前的 [autoload] 配置，
结合我们新的目录结构，生成更新后的完整 [autoload] 配置。

新路径规则：
- 原 core/ 的文件 → res://core/文件名.gd
- EavesdropManager → res://features/eavesdrop/EavesdropManager.gd
- RelationshipManager → res://features/relationship/RelationshipManager.gd
- MaidProgressionChecker → res://features/relationship/MaidProgressionChecker.gd
- InboxManager → res://features/inbox/InboxManager.gd
- SupabaseManager → res://services/supabase/SupabaseManager.gd
- MockDatabase → res://services/supabase/MockDatabase.gd

注意：
1. 保持原有的加载顺序（依赖关系）
2. 如果 SupabaseDB.gd 是 autoload，也加入注册
3. 生成配置后不要立即写入，先输出给我确认
```

---

### Prompt 6.2 — 写入新的 Autoload 配置

```
将上一步确认的 [autoload] 配置写入 project.godot。

操作：
1. 读取 project.godot 全文
2. 找到 [autoload] 段落
3. 用新配置替换整个段落
4. 写入文件
5. 输出修改后的 [autoload] 段落内容确认

不要修改 project.godot 中的其他任何部分。
```

---

## 阶段七：批量更新路径引用

### Prompt 7.1 — 扫描所有旧路径引用

```
在整个项目中搜索以下旧路径字符串，生成一份完整的「待替换清单」：

搜索目标（在所有 .gd 和 .tscn 文件中）：
- "res://autoload/"
- "res://src/"
- "res://scripts/autoload/"
- "res://scripts/ui/"
- "res://scripts/data/"
- "res://scripts/market/"
- "res://scripts/inbox/"
- "res://scripts/systems/"
- "res://ui/"（根目录的旧 ui）
- "res://scenes/ui/"
- "res://scenes/market/"
- "res://utils/"

输出格式（按文件分组）：
=== 文件路径 ===
行号: 旧引用内容
行号: 旧引用内容

最后汇总：共涉及 N 个文件，M 处引用需要更新。
```

---

### Prompt 7.2 — 执行路径替换

```
根据 Prompt 7.1 的扫描结果，执行批量路径替换。

替换映射表：
旧路径 → 新路径
"res://autoload/GameTime" → "res://core/GameTime"
"res://scripts/autoload/GameState" → "res://core/GameState"
"res://scripts/autoload/EventBus" → "res://core/EventBus"
"res://scripts/autoload/GameConfig" → "res://core/GameConfig"
"res://scripts/autoload/PlayerState" → "res://core/PlayerState"
"res://scripts/autoload/StaminaManager" → "res://core/StaminaManager"
"res://scripts/autoload/SupabaseManager" → "res://services/supabase/SupabaseManager"
"res://scripts/autoload/MockDatabase" → "res://services/supabase/MockDatabase"
"res://scripts/autoload/EavesdropManager" → "res://features/eavesdrop/EavesdropManager"
"res://scripts/autoload/RelationshipManager" → "res://features/relationship/RelationshipManager"
"res://scripts/autoload/MaidProgressionChecker" → "res://features/relationship/MaidProgressionChecker"
"res://scripts/inbox/InboxManager" → "res://features/inbox/InboxManager"
"res://scripts/ui/EavesdropHub" → "res://features/eavesdrop/EavesdropHub"
"res://scripts/ui/EavesdropScene" → "res://features/eavesdrop/EavesdropScene"
"res://scripts/ui/IntelIntercept" → "res://features/eavesdrop/IntelIntercept"
"res://scripts/ui/IntelBag" → "res://features/eavesdrop/IntelBag"
"res://scripts/market/" → "res://features/market/"
"res://scripts/data/intel_templates" → "res://features/eavesdrop/IntelTemplates"
"res://scripts/data/GameConfig" → "res://core/GameConfig"
"res://scenes/ui/Eavesdrop" → "res://features/eavesdrop/Eavesdrop"
"res://scenes/market/" → "res://features/market/"
"res://ui/TimePanel" → "res://shared/components/TimePanel"
"res://utils/TimeFormatter" → "res://shared/utils/TimeFormatter"
"res://src/" → "res://core/systems/"

请逐文件执行替换，每个文件替换完成后输出：
文件名 | 替换了 N 处

全部完成后输出总计替换数量。
```

---

### Prompt 7.3 — 更新 .tscn 内的 script 绑定路径

```
.tscn 文件中的 script 属性格式如下：
[node name="xxx" type="xxx" script=ExtResource("xxx")]

这些引用需要通过 Godot 编辑器的重构功能更新，
但我们可以先检查哪些 .tscn 文件的 script 路径在新位置下是否存在。

请执行以下检查：
1. 读取所有 .tscn 文件
2. 提取其中的 script 路径引用（格式：script = "res://..."）
3. 检查该路径对应的文件是否已存在于新位置
4. 输出所有「路径已断裂」的 .tscn 文件及对应的断裂路径

输出格式：
=== 断裂的脚本引用 ===
场景文件 | 旧脚本路径 | 新脚本应在路径
```

---

## 阶段八：验证与清理

### Prompt 8.1 — 完整性验证

```
执行重构完整性检查，输出一份验证报告：

检查项：
1. core/ 目录：列出所有文件，确认核心 autoload 文件都已迁移
2. services/supabase/：确认 SupabaseManager、MockDatabase 已迁移
3. features/ 各模块：列出每个模块的 .gd 和 .tscn 文件，确认成对存在
4. shared/：确认通用组件和工具函数已迁移
5. 旧路径引用扫描：再次搜索所有旧路径字符串，确认已全部清除
6. project.godot [autoload]：输出当前配置确认路径正确

输出格式：
✅ core/ - N 个文件
✅ services/ - N 个文件
⚠️ features/eavesdrop/ - EavesdropHub.tscn 存在但 EavesdropHub.gd 缺失
...

最终给出：可以安全删除旧目录 / 还有 N 个问题需要解决
```

---

### Prompt 8.2 — 删除旧目录

```
在确认 Prompt 8.1 全部通过后，删除以下旧目录：

待删除：
- autoload/（已迁移到 core/）
- src/（已迁移到 core/systems/）
- scripts/autoload/（已迁移到 core/）
- scripts/data/（已迁移到 core/ 或 features/）
- scripts/market/（已迁移到 features/market/）
- scripts/inbox/（已迁移到 features/inbox/）
- scripts/systems/（已迁移到 features/power/ 等）
- scripts/ui/（已全部分散到各 features/ 或 shared/）
- ui/（根目录，已迁移到 shared/components/）
- scenes/market/（已迁移到 features/market/）
- scenes/ui/（已迁移到各 features/）
- utils/（已迁移到 shared/utils/）

删除前对每个目录执行最终确认：
「XXX 目录下还有 N 个文件，确认删除？」
输出 Y 后再删除。

完成后输出项目根目录的一级目录结构。
```

---

### Prompt 8.3 — 添加类型注解（代码质量）

```
对以下核心文件中的 public 函数添加 GDScript 4 类型注解，
不修改任何函数逻辑，只添加参数类型和返回值类型：

优先处理：
1. core/GameState.gd
2. core/PlayerState.gd
3. core/StaminaManager.gd
4. features/eavesdrop/EavesdropManager.gd

改写规则：
- func foo(x) → func foo(x: int) -> void
- 使用 clampf() 替代 clamp() 处理浮点数
- 使用 String、int、float、bool、Array、Dictionary 等明确类型
- 如果类型难以确定，使用 Variant 并加注释说明原因

每次处理一个文件，完成后输出修改的函数列表。
```

---

### Prompt 8.4 — 生成架构文档

```
根据重构后的项目结构，创建 docs/architecture.md：

文档内容：
1. 项目概览（引擎版本、后端、游戏类型）

2. 目录结构说明
   - core/：说明每个文件的职责和全局意义
   - services/：说明服务层设计，SupabaseManager 与 SupabaseDB 的分工
   - features/：每个模块一段，说明职责和包含的主要文件
   - shared/：通用组件列表及用途
   - scenes/main/：入口场景说明

3. 模块依赖图（Mermaid 格式）
   graph TD
     core --> features
     core --> services
     features --> shared
     scenes --> features
     ...（根据实际依赖补充）

4. Autoload 加载顺序及依赖说明
   （从 project.godot 读取后整理）

5. 新增模块标准流程
   - 在 features/ 下新建目录
   - 创建 XxxManager.gd（如需全局单例则注册 autoload）
   - .tscn 与 .gd 放在同一目录
   - 通过 EventBus 与其他模块通信

请先读取 project.godot 和 core/EventBus.gd，再生成文档。
```

---

### Prompt 8.5 — 最终 Git 提交

```
执行最终提交：

1. git add .
2. git commit，提交信息：

refactor(v2): restructure project with co-located scenes and scripts

Architecture changes:
- core/: true globals only (GameState, EventBus, GameTime, GameConfig, PlayerState, StaminaManager)
- services/supabase/: extracted from monolithic SupabaseManager (463 lines → split into Manager + DB)
- features/: domain modules with co-located .tscn and .gd files
  - eavesdrop/, market/, inbox/, relationship/, power/
- shared/: cross-module components and utilities
- scenes/main/: top-level entry scenes only

Naming:
- All scripts renamed to PascalCase
- Type annotations added to core autoload scripts

Removed:
- autoload/, src/, scripts/autoload/, scripts/ui/, scripts/data/
- Redundant ui/ root directory

See docs/architecture.md for full structure reference.

3. 输出 git log --oneline -5 确认
```

---

## 附录：随时可用的排查 Prompts

### 检查某模块的 .tscn/.gd 是否配对

```
检查 features/eavesdrop/ 目录下所有文件，
列出每个 .tscn 文件对应的 .gd 是否存在，以及每个 .gd 是否有对应的 .tscn。

输出：
✅ EavesdropHub.tscn ↔ EavesdropHub.gd
⚠️ EavesdropScene.tscn ↔ EavesdropScene.gd（缺失）
ℹ️ IntelTemplates.gd（纯数据文件，无需 .tscn）
```

---

### 检查还有哪些旧路径引用残留

```
全局搜索以下字符串，列出所有匹配的文件和行号：
"res://autoload/"
"res://src/"
"res://scripts/"
"res://ui/"（只查根目录的旧 ui）

如果结果为空，说明路径已全部更新完成。
```

---

### 快速回滚到备份

```
我需要回滚到重构前的状态。

请执行：
git stash（如有未提交的修改）
git checkout backup-pre-refactor-v2

切换后输出当前分支和最新 commit 信息确认。
```
