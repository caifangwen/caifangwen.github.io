---
title: "Claude Code Skill 体系 Prompt 合集：从创建到优化的完整指令库"
date: 2026-03-18T02:16:57+08:00
lastmod: 2026-03-18T02:16:57+08:00
draft: false
tags: ["Claude Code", "Skill", "Prompt", "AI工程", "提示词", "MCP", "自动化"]
categories: ["AI工作流"]
description: "系统整理 Claude Code Skill 体系全生命周期的实战 Prompt 合集，覆盖 Skill 创建、测试、评估、迭代优化、触发描述调优、MCP 集成与打包分发的每个环节，附完整可复用指令模板。"
author: "Claude"
toc: true
slug: "claude-code-skill-prompt-collection"
---

> **使用说明**：本文所有 Prompt 均可直接复制到 Claude Code 使用。`< >` 内为需替换的变量，`[ ]` 内为可选参数。

---

## 一、Skill 创建阶段

### 1.1 从零创建新 Skill

```
我想创建一个新的 Skill，用于 <描述具体能力>。

触发场景：当用户 <描述何时应该触发>
输入：<输入格式/类型>
输出：<输出格式/类型>
依赖工具：<bash / python / mcp-server 等，如无则填"无">

请帮我：
1. 确认 Skill 的能力边界
2. 起草 SKILL.md（含 YAML frontmatter）
3. 给出 2-3 个测试用例
4. 评估是否需要配套脚本或参考文档
```

---

### 1.2 从现有工作流提取 Skill

```
我刚才完成了一个工作流，想把它变成可复用的 Skill。

请分析本次对话记录，提取：
- 使用了哪些工具（顺序是什么）
- 我做了哪些纠正（说明哪里容易出错）
- 输入/输出的格式
- 可以泛化的步骤 vs 本次特有的细节

然后将这个工作流封装为 SKILL.md，
保存到 /tmp/<skill-name>/SKILL.md
```

---

### 1.3 克隆并改造已有 Skill

```
读取 <已有 Skill 路径>/SKILL.md

基于这个 Skill，创建一个变体版本：
- 保留：<列出要保留的核心逻辑>
- 修改：<列出要修改的部分>
- 新增：<列出要新增的能力>

将新 Skill 保存到 /tmp/<new-skill-name>/，
不要修改原始 Skill。
```

---

### 1.4 批量创建 Skill 套件

```
我需要为 <业务领域> 创建一套 Skill 体系，包含：

1. <Skill A 名称>：<一句话描述>
2. <Skill B 名称>：<一句话描述>
3. <Skill C 名称>：<一句话描述>

请先给出整体架构设计：
- 各 Skill 的职责边界
- 相互之间的依赖关系（哪个会调用哪个）
- 共享资源（脚本/模板）放在哪里

架构确认后，从第一个开始逐个创建。
```

---

## 二、SKILL.md 编写指令

### 2.1 生成标准 SKILL.md 模板

```
为以下 Skill 生成完整的 SKILL.md 文件：

名称：<skill-name>
能力：<详细描述>
触发关键词：<关键词1、关键词2、关键词3...>
输出格式：<文件类型/结构>
依赖：<python库/npm包/mcp server>

要求：
- description 字段要有"推力"——明确列出触发场景，
  即使用户没有明说也应触发的情况
- 工作流用步骤编号写清楚
- 包含至少一个输入/输出示例
- 错误处理部分列出 top3 常见错误
```

---

### 2.2 优化触发描述（description 字段）

```
当前 Skill 的 description 如下：

"""
<粘贴当前 description>
"""

问题：<描述触发不准确的现象，例如"经常不触发"或"误触发太多">

请重写 description，要求：
- 长度 100-200 字
- 明确列出应触发的用户措辞变体（至少 5 种说法）
- 明确排除容易混淆的相邻场景
- 语气要有"主动性"，不能太被动
- 保持 kebab-case 的 name 不变
```

---

### 2.3 为 Skill 增加多域支持

```
当前 Skill 只支持 <单一场景>，我需要扩展为支持多个变体：

变体 A：<场景 A，例如 AWS>
变体 B：<场景 B，例如 GCP>
变体 C：<场景 C，例如 Azure>

请：
1. 重构 SKILL.md，将通用逻辑留在主文件
2. 在 references/ 目录下为每个变体创建独立文档
3. 在 SKILL.md 中添加路由逻辑
   （根据用户描述的关键词判断读取哪个 reference 文件）
4. 更新 description 覆盖所有变体的触发场景
```

---

## 三、测试用例（Evals）管理

### 3.1 生成 evals.json

```
为 Skill "<skill-name>" 生成 evals/evals.json。

该 Skill 的功能：<描述>

要求：
- 生成 5 个测试用例
- 覆盖：正常场景 × 2、边界情况 × 2、错误输入 × 1
- 每个用例包含：
  - 真实用户会说的 prompt（不要太正式）
  - 期望输出的描述
  - 3-5 条可客观验证的 expectations
- 测试文件放在 evals/files/ 目录（如需要请生成 mock 文件）

保存到 <skill-path>/evals/evals.json
```

---

### 3.2 为现有测试用例补充 Expectations

```
读取 <skill-path>/evals/evals.json

为每个 eval 补充 expectations 字段。

好的 expectation 标准：
- 客观可验证（不含"看起来专业"这类主观描述）
- 具有区分度（有 Skill 和没有 Skill 结果不同）
- 覆盖：输出存在性、格式正确性、内容准确性

每个 eval 补充 3-5 条，更新文件。
```

---

### 3.3 检查测试用例质量

```
读取 <skill-path>/evals/evals.json

评估每个测试用例的质量，检查：

1. 复杂度：是否足够复杂能触发 Skill？
   （太简单的单步任务 AI 会直接回答，不会用 Skill）

2. 断言质量：
   - 有没有主观断言（"输出质量好"这类）
   - 有没有过于宽松的断言（"包含文字"）
   - 有没有可以用脚本自动验证的断言

3. 覆盖度：是否覆盖了边界情况？

输出：每个 eval 的质量评分（1-5）和改进建议
```

---

### 3.4 从真实用户反馈生成新测试用例

```
以下是用户使用 Skill "<skill-name>" 时遇到的问题：

"""
<粘贴用户反馈或 bug 描述>
"""

请：
1. 分析这些反馈说明 Skill 在哪些场景下表现不好
2. 为每个问题场景生成对应的测试用例
3. 将新用例追加到 <skill-path>/evals/evals.json
4. 确保新用例的 id 不与现有用例冲突
```

---

## 四、执行测试与评估

### 4.1 运行单个测试用例

```
使用 Skill 执行以下测试：

Skill 路径：<skill-path>
测试 prompt：<测试内容>
输入文件：[可选，文件路径]
输出保存到：/tmp/<skill-name>-test/outputs/

完成后告诉我：
- 执行了哪些步骤
- 使用了哪些工具（及调用次数）
- 输出文件列表
- 遇到了什么问题（如有）
```

---

### 4.2 对比测试：有 Skill vs 无 Skill

```
我要对比有 Skill 和无 Skill 的效果差异。

任务：<测试任务描述>
Skill 路径：<skill-path>
输入文件：[可选]

请分别执行两次：
1. 使用 Skill 完成任务，结果保存到 /tmp/test-with-skill/
2. 不使用 Skill 完成同一任务，结果保存到 /tmp/test-without-skill/

完成后对比：
- 输出质量（从结构、完整性、格式三个维度）
- 工具调用次数
- 执行步骤数
- 哪些 expectations 分别通过/失败
```

---

### 4.3 批量运行所有测试用例

```
读取 <skill-path>/evals/evals.json

对所有测试用例批量执行：
- 每个用例执行有 Skill 版本
- 结果分别保存到 /tmp/<skill-name>-workspace/iteration-1/eval-<id>/

执行过程中：
- 记录每个用例的工具调用次数
- 记录执行耗时
- 如遇到错误继续执行其他用例（不要中断）

全部完成后汇报整体通过率。
```

---

### 4.4 评分单个测试结果

```
请评估以下测试结果是否通过所有断言。

测试输出目录：<输出路径>

断言列表：
1. <断言 1>
2. <断言 2>
3. <断言 3>

对每条断言：
- 判断 passed: true/false
- 给出 evidence（在输出中找到的具体证据）

以 JSON 格式输出评估结果：
{
  "expectations": [
    {"text": "...", "passed": true/false, "evidence": "..."}
  ],
  "summary": {"passed": N, "failed": N, "total": N, "pass_rate": 0.XX}
}
```

---

### 4.5 生成 benchmark 统计报告

```
读取以下测试结果，生成 benchmark.json：

有 Skill 的结果：<with-skill 路径>/grading.json
无 Skill 的结果：<without-skill 路径>/grading.json

按以下格式统计：
- pass_rate（有/无 Skill 各自的通过率）
- delta（提升幅度）
- 每个断言的通过情况对比

识别以下模式：
- 哪些断言在两种情况下都通过（区分度低）
- 哪些断言 Skill 明显改善（Skill 的核心价值）
- 哪些断言 Skill 没有改善（改进方向）

保存到 /tmp/<skill-name>-workspace/benchmark.json
```

---

## 五、Skill 迭代改进

### 5.1 基于测试失败改进 Skill

```
测试结果显示以下断言失败：

失败的断言：
- <断言 1>（在 eval-1 中失败）
- <断言 2>（在 eval-2、eval-3 中失败）

Skill 路径：<skill-path>

请：
1. 分析这些失败最可能的根因
   （是指令不清？缺少工具调用步骤？输出规范不明？）
2. 提出 2-3 种修复方案及其权衡
3. 实施最佳方案，修改 SKILL.md
4. 解释修改了哪些内容以及为什么这样修改
```

---

### 5.2 基于用户反馈改进 Skill

```
用户对 Skill "<skill-name>" 的反馈：

"""
<用户反馈文字>
"""

请：
1. 理解用户反馈背后的真实需求
   （不要字面解读，要理解 why）
2. 识别 Skill 中哪些指令导致了这个问题
3. 修改 Skill，但要避免过度拟合这个特例
   （修改应能泛化到类似场景）
4. 解释你的改动逻辑
```

---

### 5.3 精简过于冗余的 Skill

```
读取 <skill-path>/SKILL.md

这个 Skill 可能过于冗长，请进行精简：

精简原则：
- 删除重复表达的内容
- 将"必须/始终/绝对"等强制语气，改为解释"为什么"
- 可以通过示例传达的规则，删除重复的文字说明
- 超过 500 行的内容，考虑拆分到 references/ 子文件

目标：在不降低质量的前提下，将 SKILL.md 缩短 20-30%

给我展示：原版 token 数 vs 精简后 token 数，以及删除了哪些内容。
```

---

### 5.4 将重复脚本固化到 Skill

```
我注意到在多次测试运行中，Claude 都独立写了类似的脚本。

重复出现的脚本功能：<描述脚本做了什么>

请：
1. 编写一个通用版本的脚本，保存到 <skill-path>/scripts/<script-name>.py
2. 让脚本支持命令行参数（而不是硬编码路径）
3. 在 SKILL.md 中添加指令：什么时候调用这个脚本、如何调用
4. 确保脚本有基本的错误处理和使用说明（--help）
```

---

### 5.5 版本对比：新旧 Skill 盲测

```
我修改了 Skill，想知道新版是否真的更好。

旧版路径：<old-skill-path>
新版路径：<new-skill-path>
测试任务：<任务描述>
输入文件：[可选]

请：
1. 用旧版完成任务，保存到 /tmp/blind-test/version-A/
2. 用新版完成同一任务，保存到 /tmp/blind-test/version-B/
3. 不要告诉我哪个是新版
4. 从以下维度比较两个输出：
   - 完整性（是否涵盖所有要求）
   - 格式规范性
   - 内容准确性
   - 执行效率（步骤数/工具调用数）
5. 最后宣布哪个版本更好，并给出理由
```

---

## 六、触发描述（Description）优化

### 6.1 生成触发评估集

```
为 Skill "<skill-name>" 生成触发评估集（trigger eval set）。

Skill 当前 description：
"""
<粘贴当前 description>
"""

生成 20 条评估查询：
- 应触发（should_trigger: true）：10 条
  * 覆盖不同措辞方式（正式/口语/缩写）
  * 包含用户没有明说 Skill 名称但明显需要的场景
  * 包含边界触发案例
  
- 不应触发（should_trigger: false）：10 条
  * 相邻场景（共享关键词但需要不同 Skill）
  * 模糊场景（可能被关键词匹配但实际无关）
  * 避免"写一段代码"这类明显不相关的简单负例

输出格式：
[
  {"query": "...", "should_trigger": true},
  ...
]

查询要真实具体，带有背景细节，不要写"帮我处理 PDF 文件"这种抽象描述。
```

---

### 6.2 运行描述优化循环

```
运行触发描述优化循环：

Skill 路径：<skill-path>
触发评估集：<eval-set.json 路径>
最大迭代次数：5

执行步骤：
1. 用当前 description 测试触发率（每条查询跑 3 次取均值）
2. 分析失败案例（漏触发 + 误触发）
3. 提出改进后的 description
4. 在测试集上验证新 description
5. 重复直到：触发率 ≥ 85% 且误触发率 ≤ 15%

完成后输出：
- 各版本的触发率对比表
- 最终推荐的 description 文本
- 更新到 SKILL.md（需确认）
```

---

### 6.3 诊断描述触发问题

```
Skill "<skill-name>" 存在以下触发问题：

问题类型：[欠触发 / 误触发 / 两者都有]

欠触发的例子（本应触发但没有）：
- "<例子 1>"
- "<例子 2>"

误触发的例子（不应触发但触发了）：
- "<例子 1>"
- "<例子 2>"

当前 description：
"""
<粘贴当前 description>
"""

请诊断问题根因，并提供 3 个改进版本的 description，
说明每个版本的策略差异和预期效果。
```

---

## 七、MCP 集成 Skill

### 7.1 为 Skill 添加 MCP Server 依赖

```
我想让 Skill "<skill-name>" 集成以下 MCP Server：

MCP Server：<server-name>（例如 github、slack、postgres）
用途：<在 Skill 工作流中的用途>
关键工具：<需要用到的 MCP 工具名称>

请：
1. 在 SKILL.md 的 compatibility 字段声明 MCP 依赖
2. 在工作流中插入 MCP 工具调用步骤
3. 说明 MCP Server 的配置方式（~/.claude/mcp.json 示例）
4. 添加降级处理：MCP 不可用时的替代方案
```

---

### 7.2 创建 MCP Server Skill

```
我需要创建一个 MCP Server，并为其配套一个 Skill。

服务描述：<要集成的外部服务>
语言偏好：[TypeScript（推荐）/ Python]
核心功能：
- <功能 1>
- <功能 2>
- <功能 3>

请按以下步骤进行：
1. 读取 mcp-builder Skill 的开发指南
2. 设计工具列表（tool naming 遵循 <service>_<action> 格式）
3. 实现 MCP Server
4. 创建配套的 Skill，描述何时/如何使用这个 MCP Server
5. 生成测试用例验证集成效果
```

---

### 7.3 MCP Server 工具质量审查

```
审查以下 MCP Server 的工具设计质量：

MCP Server 代码路径：<路径>

检查维度：
1. 命名规范：是否使用 <service>_<action> 格式
2. 描述质量：工具描述是否让 AI 容易理解何时使用
3. 错误处理：错误信息是否有具体的修复建议
4. 参数设计：
   - 是否有合理的参数约束（min/max/enum）
   - 可选参数是否有合理默认值
5. 分页支持：列表类工具是否支持分页
6. 注解（Annotations）：
   - readOnlyHint
   - destructiveHint
   - idempotentHint

输出：每个维度的评分（1-5）和具体改进建议
```

---

## 八、Skill 打包与分发

### 8.1 打包 Skill 为 .skill 文件

```
将以下 Skill 打包为可分发的 .skill 文件：

Skill 路径：<skill-path>

打包前检查：
- SKILL.md 是否有完整的 frontmatter（name, description）
- 是否有不必要的临时文件（.DS_Store, __pycache__, *.pyc）
- evals/ 目录是否包含（如有，保留；如无，说明）
- assets/ 中的文件是否都被 SKILL.md 引用

运行打包脚本：
python -m scripts.package_skill <skill-path>

将生成的 .skill 文件保存到 /mnt/user-data/outputs/
```

---

### 8.2 Skill 发布前质量检查

```
对 Skill "<skill-name>" 执行发布前质量门禁检查。

Skill 路径：<skill-path>
测试结果路径：<workspace-path>

检查清单：
□ SKILL.md frontmatter 完整（name, description）
□ description 触发率 ≥ 85%（来自触发评估）
□ description 误触发率 ≤ 15%
□ 测试用例 pass_rate ≥ 0.80（有 Skill 版本）
□ vs 无 Skill 的 delta ≥ 0.30
□ stddev ≤ 0.10（稳定性）
□ errors_encountered = 0（无运行错误）
□ 有至少 5 个测试用例（evals.json）
□ 包含边界情况测试
□ 所有 scripts/ 文件有 --help 说明
□ compatibility 字段声明了所有外部依赖

输出：通过/失败汇总，以及未通过项的修复建议
```

---

### 8.3 生成 Skill README

```
为 Skill "<skill-name>" 生成 README.md。

读取 <skill-path>/SKILL.md 和 <skill-path>/evals/evals.json

README 包含：
1. 一句话介绍（是什么）
2. 解决的问题（为什么用它）
3. 触发方式（用哪些词触发）
4. 快速开始示例（3 个真实 prompt 示例）
5. 安装方式（.skill 文件安装步骤）
6. 依赖说明（需要安装什么、配置什么）
7. 测试用例通过率（从 benchmark 数据获取）
8. 已知限制

语言简洁，以用户为中心，避免技术术语。
```

---

## 九、Skill 体系治理

### 9.1 审计已安装的 Skill 列表

```
扫描以下目录下所有已安装的 Skill：
- /mnt/skills/public/
- /mnt/skills/examples/
- /mnt/skills/user/（如存在）

为每个 Skill 提取：
- name（来自 frontmatter）
- description 前 50 字
- 目录大小
- 是否有 evals/

以表格形式展示，并标注：
- 哪些 Skill 的 description 看起来过于相似（可能重叠）
- 哪些 Skill 缺少测试用例
- 哪些 Skill 文件异常大（>200KB，可能有冗余资源）
```

---

### 9.2 检测 Skill 冲突与重叠

```
分析以下两个 Skill 是否存在功能重叠或触发冲突：

Skill A：<skill-path-A>
Skill B：<skill-path-B>

分析维度：
1. description 中的关键词重叠度
2. 能力范围是否有交集
3. 相同输入可能触发哪个？（用 5 个测试查询验证）
4. 是否可以合并（一个调用另一个）？

给出建议：
- 保持独立（明确区分各自的触发边界）
- 合并（哪个作为主 Skill，哪个降级为函数）
- 重命名（让触发更精准）
```

---

### 9.3 批量更新 Skill 版本

```
我需要将所有 Skill 更新到新的输出规范。

变更内容：<描述规范变更，例如"所有输出文档改用新的页眉模板">
影响的 Skill：[全部 / 仅 <类型> 类 Skill]
模板文件：<新模板路径>

请：
1. 列出所有受影响的 Skill
2. 对每个 Skill，定位需要修改的具体行
3. 逐一应用修改（先预览，确认后再写入）
4. 更新每个 Skill 的 lastmod 字段
5. 生成变更摘要
```

---

## 十、高级工作流 Prompt

### 10.1 Skill 链设计

```
我有一个复杂任务需要多个 Skill 串联完成：

任务描述：<复杂任务>

可用 Skill：
- <Skill A>：<能力描述>
- <Skill B>：<能力描述>
- <Skill C>：<能力描述>

请设计 Skill 链方案：
1. 执行顺序和数据流（哪个的输出是哪个的输入）
2. 中间产物的格式（确保上下游兼容）
3. 错误发生时的回滚策略
4. 是否需要创建一个编排 Skill 来管理整个流程

如果现有 Skill 之间存在接口不兼容，指出需要如何调整。
```

---

### 10.2 为 Skill 添加人工确认节点

```
修改 Skill "<skill-name>"，在关键步骤前添加人工确认。

当前工作流的关键步骤：<步骤描述>

需要在以下情况暂停并请求用户确认：
- <情况 1，例如"即将删除文件时">
- <情况 2，例如"检测到输入与预期格式不符时">

确认方式：
- 展示将要执行的操作摘要
- 等待用户输入 "y" / "n"（或描述 Claude 如何询问用户）
- "n" 时的处理逻辑

修改 SKILL.md，将确认节点融入工作流步骤。
```

---

### 10.3 调试 Skill 异常行为

```
Skill "<skill-name>" 出现了异常行为：

现象：<描述异常，例如"总是跳过步骤3"或"生成的文件格式不对">
复现步骤：
1. <步骤 1>
2. <步骤 2>
触发 prompt：<具体 prompt>
实际输出：<实际结果>
期望输出：<期望结果>

请：
1. 阅读 SKILL.md，找出可能导致这个行为的指令
2. 提出假设（最可能的 2-3 个根因）
3. 为每个假设设计验证实验
4. 执行最可能的验证，确认根因
5. 给出修复方案
```

---

### 10.4 Skill 性能分析

```
分析 Skill "<skill-name>" 的执行效率：

读取以下测试运行数据：<workspace 路径>

分析指标：
- 平均工具调用次数（vs 无 Skill 的基准）
- 平均执行时长
- 最耗时的步骤是什么
- 是否有冗余的工具调用（同一文件被多次读取等）

识别优化机会：
- 哪些步骤可以并行（如果工具支持）
- 哪些重复操作可以通过脚本一次完成
- 是否有不必要的验证步骤可以简化

给出效率优化建议（不能以降低质量为代价）。
```

---

### 10.5 一键式 Skill 创建 + 测试 + 优化流水线

```
请启动完整的 Skill 创建流水线：

目标 Skill：<描述>
目标路径：/tmp/<skill-name>/

流水线步骤：
1. 创建 SKILL.md（我确认后继续）
2. 生成 evals.json（5个测试用例）
3. 执行有/无 Skill 的对比测试
4. 生成 benchmark.json
5. 分析失败用例，提出改进
6. 更新 SKILL.md（第2轮）
7. 重新测试验证改进效果
8. 生成触发评估集，优化 description
9. 最终质量检查
10. 打包输出 .skill 文件

在每个需要我确认的节点暂停等待，
异常时说明问题并建议处理方式。
```

---

## 十一、Prompt 速查表

| 场景 | 推荐 Prompt 编号 |
|------|:---------------:|
| 第一次创建 Skill | 1.1 |
| 将已有工作流转为 Skill | 1.2 |
| 快速生成 SKILL.md | 2.1 |
| 解决触发不准确问题 | 2.2 / 6.3 |
| 生成测试用例 | 3.1 |
| 运行对比测试 | 4.2 |
| 根据测试失败改进 | 5.1 |
| 精简过长的 Skill | 5.3 |
| 优化 description | 6.2 |
| 集成 MCP | 7.1 / 7.2 |
| 发布前检查 | 8.2 |
| 全自动流水线 | 10.5 |

---

## 附录：常用变量速查

```bash
# 常用路径变量（根据实际情况替换）
SKILL_PATH="/mnt/skills/public/<skill-name>"
WORKSPACE="/tmp/<skill-name>-workspace"
EVALS="$SKILL_PATH/evals/evals.json"
SCRIPTS="$SKILL_PATH/scripts"
OUTPUT="/mnt/user-data/outputs"

# 常用 Claude Code CLI 命令
claude "读取 $SKILL_PATH/SKILL.md 并分析其结构"
claude -p "执行以下任务并输出 JSON" < task.txt
claude --output-format json "分析 Skill 触发率"

# 打包命令
cd /mnt/skills/examples/skill-creator
python -m scripts.package_skill $SKILL_PATH
```

---

*最后更新：2026-03-18 | 基于 Claude Code Skill 体系实战经验整理*
