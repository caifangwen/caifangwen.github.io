---
title: "如何构建 AI Skill 体系：从设计哲学到工程实践的深度分析"
date: 2026-03-18T02:10:39+08:00
lastmod: 2026-03-18T02:10:39+08:00
draft: false
tags: ["Skill", "AI Agent", "Claude", "MCP", "提示词工程", "工程化", "AI架构"]
categories: ["技术实践"]
description: "深度剖析 AI Skill 体系的设计哲学、架构原理、工程实践与评估体系，从零到一构建可复用、可测量、可迭代的 AI 能力模块化系统。"
author: "Claude"
toc: true
---

## 前言：为什么需要 Skill 体系？

随着 AI 在工程、创作、分析等领域的深度渗透，一个核心问题逐渐浮现：

> **如何让 AI 稳定地、可预期地、高质量地完成特定领域任务？**

通用大模型的能力上限很高，但在专业场景中往往表现不稳定——同一个问题，不同的问法可能产生截然不同的质量。**Skill 体系**正是为解决这一问题而生的工程化方案。

Skill（技能）的本质是**将隐性的最佳实践显式化**——把专家经验、工具调用流程、输出规范封装为可复用的知识模块，让 AI 在执行特定任务时能够主动调用正确的方法论，而非每次从零推理。

本文将深入分析 Skill 体系的设计哲学、架构原理、开发流程、评估方法与演进路径。

---

## 一、Skill 体系的设计哲学

### 1.1 三个核心原则

#### 原则一：渐进式披露（Progressive Disclosure）

Skill 系统不应将所有信息一次性塞入上下文。好的 Skill 采用分层加载策略：

```
第一层：元数据（~100 词）
  └── name + description
      └── 始终存在于上下文，用于触发判断

第二层：SKILL.md 主体（<500 行）
  └── 触发后加载
      └── 核心流程、关键决策点

第三层：捆绑资源（无限制）
  └── 按需加载
      └── 脚本、参考文档、模板资产
```

这与人类专家的工作方式高度相似：专家不会在进入会议室前就背诵所有技术手册，而是基于问题类型判断需要调用哪些知识。

#### 原则二：最小惊讶原则（Principle of Least Surprise）

Skill 的输出应当**可预期**。这意味着：

- 相同类型的输入，应产生结构一致的输出
- 错误处理路径应明确定义，而非依赖模型自由发挥
- 工具调用顺序应确定性强，减少随机性

#### 原则三：可测量性（Measurability）

没有评估就没有改进。每个 Skill 都应配套：
- **测试用例集（evals.json）**：定义输入和预期输出
- **断言集（expectations）**：可验证的通过/失败条件
- **基准对比（benchmark）**：有 Skill vs 无 Skill 的量化差异

### 1.2 Skill vs Prompt vs Tool 的区别

| 维度 | Prompt | Tool | Skill |
|------|--------|------|-------|
| **本质** | 单次指令 | 可调用函数 | 封装的最佳实践 |
| **粒度** | 单个任务 | 单个操作 | 完整工作流 |
| **知识载体** | 文字描述 | 代码逻辑 | 文档 + 脚本 + 资产 |
| **复用方式** | 复制粘贴 | API 调用 | 自动触发 |
| **可测量** | 难 | 容易 | 容易 |
| **迭代方式** | 人工改写 | 代码修改 | 结构化优化循环 |

---

## 二、Skill 的解剖：完整架构

### 2.1 目录结构

```
my-skill/
├── SKILL.md                   ← 必须，核心文件
│   ├── YAML frontmatter       ← name, description（触发机制）
│   └── Markdown instructions  ← 工作流、决策树、示例
│
├── scripts/                   ← 可选，确定性/重复性任务
│   ├── process.py
│   └── validate.sh
│
├── references/                ← 可选，按需加载的参考文档
│   ├── api-spec.md
│   ├── style-guide.md
│   └── edge-cases.md
│
├── assets/                    ← 可选，输出用的模板和静态资源
│   ├── template.docx
│   ├── logo.png
│   └── fonts/
│
└── evals/                     ← 可选，测试用例
    ├── evals.json
    └── files/                 ← 测试输入文件
        ├── sample1.pdf
        └── sample2.xlsx
```

### 2.2 SKILL.md 的黄金结构

```markdown
---
name: skill-identifier           # 唯一标识符，kebab-case
description: |                   # 触发描述（最重要的字段）
  这个 Skill 做什么、何时触发。
  要略带"强制性"——描述触发条件时要
  明确列出关键词和场景，防止欠触发。
  例如：当用户提到 X、Y、Z 时使用此技能，
  即使他们没有明确要求也应触发。
compatibility:                   # 可选
  tools: [bash, python]
  mcp: [filesystem, github]
---

# Skill 名称

## 概述
用 2-3 句话描述这个 Skill 解决什么问题。

## 前置条件
执行此 Skill 前需要检查什么。

## 核心工作流

### 步骤 1：[动词+名词]
具体的操作说明...

### 步骤 2：[动词+名词]
...

## 决策树
面对特定情况时如何选择路径。

## 输出规范
期望的输出格式和质量标准。

## 错误处理
常见错误和处理方式。

## 示例
输入/输出示例（最有效的学习材料）。
```

### 2.3 触发机制深度解析

**触发描述（description）** 是 Skill 最关键的字段，它决定了 AI 何时调用这个 Skill。

触发机制的工作原理：
```
用户输入
    │
    ▼
AI 扫描 available_skills 列表
    │
    ▼
逐一比对 name + description
    │
    ▼
相关性判断（内部推理）
    │
    ├── 匹配 → 读取 SKILL.md → 执行
    └── 不匹配 → 直接回答
```

**常见问题：欠触发（Under-triggering）**

AI 倾向于对简单任务直接回答，而不调用 Skill。解决方案是让 description 更"主动"：

```yaml
# ❌ 弱触发描述
description: "创建 Word 文档的方法"

# ✅ 强触发描述
description: |
  创建专业 Word 文档（.docx）。当用户要求生成报告、
  备忘录、信件、合同或任何需要保存为 Word 格式的文档时，
  必须使用此技能，即使用户只是说"写一份文档"或"做个总结"。
  包含表格、目录、页眉页脚等复杂格式时尤其适用。
```

---

## 三、Skill 开发生命周期

### 3.1 完整开发流程

```
┌─────────────────────────────────────────────────────────────┐
│                   Skill 开发生命周期                         │
│                                                             │
│  1. 意图捕获  →  2. 访谈调研  →  3. 编写草稿               │
│       │               │               │                    │
│       └───────────────┴───────────────┘                    │
│                       │                                    │
│              4. 编写测试用例                                 │
│                       │                                    │
│              5. 执行测试运行                                 │
│                       │                                    │
│              6. 人工评审结果        ←─────────┐            │
│                       │                       │            │
│              7. 量化评估打分                   │            │
│                       │                       │            │
│              8. 改进 Skill ────────────────────┘           │
│                       │                                    │
│              9. 扩大测试集                                   │
│                       │                                    │
│             10. 优化触发描述                                 │
│                       │                                    │
│             11. 打包分发（.skill）                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 阶段一：意图捕获（Intent Capture）

在动笔写 Skill 之前，必须回答四个核心问题：

**Q1：这个 Skill 让 AI 能做什么？**
- 具体的能力边界是什么
- 输入/输出的数据类型
- 与现有 Skill 的关系（是否重叠）

**Q2：什么情况下应该触发？**
- 关键触发词和场景
- 反例：什么情况下不应触发
- 与相似 Skill 的区分点

**Q3：期望的输出格式是什么？**
- 文件类型（.docx/.pdf/.json）
- 结构规范（章节、字段、格式）
- 质量标准（专业程度、完整性）

**Q4：是否需要测试用例？**

| Skill 类型 | 是否需要测试用例 | 理由 |
|------------|:---------------:|------|
| 文件转换、数据提取 | ✅ 强烈推荐 | 输出客观可验证 |
| 代码生成、工作流 | ✅ 推荐 | 步骤明确，可断言 |
| 写作风格、创意内容 | ⚠️ 可选 | 主观性强，难以量化 |
| 对话类、问答类 | ❌ 通常不需要 | 答案多样，评估成本高 |

### 3.3 阶段二：测试用例设计（evals.json）

```json
{
  "skill_name": "pdf-processor",
  "evals": [
    {
      "id": 1,
      "prompt": "从这份合同中提取所有甲乙双方信息和关键条款",
      "expected_output": "包含双方名称、签约日期、核心条款的结构化摘要",
      "files": ["evals/files/contract_sample.pdf"],
      "expectations": [
        "输出包含甲方和乙方的完整名称",
        "签约日期被正确识别和格式化",
        "关键条款以列表形式呈现",
        "生成了可下载的结构化输出文件",
        "未出现内容幻觉（捏造原文没有的信息）"
      ]
    },
    {
      "id": 2,
      "prompt": "合并这三个报告为一个综合文档",
      "files": [
        "evals/files/report_q1.pdf",
        "evals/files/report_q2.pdf",
        "evals/files/report_q3.pdf"
      ],
      "expectations": [
        "输出是单一的合并 PDF 文件",
        "原始三个文档的内容均被保留",
        "包含统一的目录页",
        "页码连续编排"
      ]
    }
  ]
}
```

**高质量测试用例的特征：**

1. **足够复杂**：简单的单步操作不足以触发 Skill（AI 会直接回答）
2. **断言可验证**：避免主观断言，如"输出看起来专业"
3. **覆盖边界情况**：空输入、格式异常、超大文件等
4. **多样性**：不同类型的输入，测试 Skill 的泛化能力

### 3.4 阶段三：量化评估体系

评估系统的数据流：

```
测试运行
    │
    ▼
grading.json（每个用例的评估结果）
    │
    ├── expectations[]    ← 每条断言的 passed/failed + evidence
    ├── summary           ← pass_rate, passed, failed, total
    ├── execution_metrics ← tool_calls, total_steps, errors
    └── timing            ← executor/grader 耗时
    │
    ▼
benchmark.json（跨配置的统计汇总）
    │
    ├── with_skill:    { pass_rate: {mean: 0.85, stddev: 0.05} }
    ├── without_skill: { pass_rate: {mean: 0.35, stddev: 0.08} }
    └── delta:         { pass_rate: "+0.50" }
```

**关键指标解读：**

| 指标 | 含义 | 健康范围 |
|------|------|---------|
| `pass_rate` (with_skill) | Skill 执行质量 | > 0.80 |
| `delta.pass_rate` | Skill 带来的增益 | > 0.30 |
| `stddev` | 结果稳定性 | < 0.10 |
| `total_tool_calls` | 执行效率 | 视任务而定 |
| `errors_encountered` | 执行可靠性 | 0 |

### 3.5 阶段四：迭代优化循环

```
版本历史（history.json）示例：

v0 (baseline):  pass_rate = 0.45  → grading_result: "baseline"
v1 (改进流程):  pass_rate = 0.67  → grading_result: "won"
v2 (增加脚本):  pass_rate = 0.82  → grading_result: "won"
v3 (优化断言):  pass_rate = 0.79  → grading_result: "lost"  ← 回退到 v2
v4 (调整提示):  pass_rate = 0.88  → grading_result: "won"   ← current_best
```

每次迭代遵循：**观察失败用例 → 定位根因 → 针对性修改 → 对比验证**

常见失败根因及修复策略：

| 失败模式 | 根因 | 修复方向 |
|----------|------|---------|
| 步骤跳过 | 指令模糊 | 将步骤改为强制性动词（"必须"、"始终"） |
| 格式不符 | 缺少输出规范 | 在 Skill 中添加格式模板和示例 |
| 工具错用 | 流程不清晰 | 添加决策树，明确"何时用哪个工具" |
| 结果幻觉 | 验证步骤缺失 | 增加自我验证指令（"检查输出是否与原文一致"） |
| 触发不稳 | description 弱 | 运行描述优化器（run_loop.py） |

---

## 四、触发描述优化：科学方法

### 4.1 描述优化的自动化流程

触发描述的优化是一个独立的科学问题：给定一组查询（有些应触发 Skill，有些不应触发），如何找到最优的 description？

```bash
# 运行自动化优化循环
python -m scripts.run_loop \
  --eval-set trigger_evals.json \
  --skill-path ./my-skill \
  --model claude-sonnet-4-20250514 \
  --max-iterations 5 \
  --verbose
```

**触发评估集（trigger_evals.json）设计原则：**

- **正例**（应触发）：占 60%，包含各种措辞变体
- **负例**（不应触发）：占 40%，包含相似但不相关的查询
- **训练/测试分割**：60/40，避免过拟合

```json
{
  "skill_name": "docx",
  "evals": [
    { "prompt": "帮我写一份项目报告", "should_trigger": true },
    { "prompt": "生成一个 Word 格式的周报", "should_trigger": true },
    { "prompt": "做个 PPT 演示", "should_trigger": false },
    { "prompt": "把数据整理成表格", "should_trigger": false },
    { "prompt": "起草一封正式信件", "should_trigger": true }
  ]
}
```

### 4.2 描述优化的迭代结果示例

```
迭代 0 (原始):
  触发率（应触发查询）: 62%
  误触发率（不应触发）: 28%
  综合得分: 0.67

迭代 1 (增加关键词):
  触发率: 78%
  误触发率: 22%
  综合得分: 0.78

迭代 2 (细化场景描述):
  触发率: 89%
  误触发率: 11%
  综合得分: 0.89  ← 测试集最优

迭代 3 (过度强调):
  触发率: 95%
  误触发率: 35%  ← 误触发率上升
  综合得分: 0.80  ← 退步，选择 v2
```

---

## 五、Skill 的类型学

### 5.1 按能力类型分类

**Type A：文件转换类（File Transform Skills）**
```
输入：上传的文件（PDF、Excel、Word...）
处理：提取、转换、合并、拆分
输出：新格式文件
代表：docx-skill、pdf-skill、xlsx-skill
特点：确定性强，易于测试，脚本化程度高
```

**Type B：创意生成类（Creative Generation Skills）**
```
输入：描述、风格要求、参考材料
处理：理解意图、应用风格规则、生成内容
输出：文章、代码、设计、演示文稿
代表：frontend-design-skill、pptx-skill
特点：主观性强，需要质量评判标准
```

**Type C：流程编排类（Workflow Orchestration Skills）**
```
输入：复杂任务描述
处理：分解任务、调用工具、协调多步骤
输出：任务完成结果
代表：skill-creator、mcp-builder
特点：依赖 MCP 和外部工具，状态管理复杂
```

**Type D：领域知识类（Domain Knowledge Skills）**
```
输入：领域专业问题
处理：应用专业知识框架、检索参考文档
输出：专业建议、分析报告
代表：product-self-knowledge
特点：知识密集型，更新频率高
```

### 5.2 按资源依赖分类

```
轻量 Skill（无依赖）
  └── 仅需 SKILL.md
  └── 示例：写作风格指南、代码规范

中量 Skill（脚本依赖）
  └── SKILL.md + scripts/
  └── 示例：pdf-skill（依赖 pypdf）、xlsx-skill（依赖 openpyxl）

重量 Skill（MCP 依赖）
  └── SKILL.md + scripts/ + MCP servers
  └── 示例：github-workflow-skill、slack-integration-skill
  └── 需要在 compatibility 中声明
```

---

## 六、Skill 的高级模式

### 6.1 多域 Skill：单入口，多实现

当一个 Skill 需要支持多个框架或平台时，采用多域模式：

```
cloud-deploy-skill/
├── SKILL.md              ← 入口：识别场景，路由到具体文档
└── references/
    ├── aws.md            ← AWS 特定指南
    ├── gcp.md            ← GCP 特定指南
    └── azure.md          ← Azure 特定指南
```

`SKILL.md` 中的路由逻辑：
```markdown
## 平台选择

根据用户描述的环境，读取对应的参考文档：
- 提到 EC2、S3、Lambda → 读取 `references/aws.md`
- 提到 GKE、Cloud Run → 读取 `references/gcp.md`
- 提到 AKS、Azure Functions → 读取 `references/azure.md`
- 未指定 → 询问用户偏好
```

### 6.2 Skill 链：串联多个专项能力

复杂任务可以通过串联多个 Skill 完成：

```
用户: "分析这份财报 PDF，生成 PPT 汇报，发送到 Slack"

触发顺序：
  1. pdf-skill      → 提取财报数据
  2. pptx-skill     → 生成 PPT
  3. slack-skill    → 发送消息（MCP）
```

设计 Skill 链时注意：
- 每个 Skill 的输出应明确定义（中间产物格式）
- 在编排层（如 Workflow Skill）处理步骤间的数据传递
- 错误发生在链中任意步骤时的回滚策略

### 6.3 自举 Skill：用 Skill 创建 Skill

`skill-creator` Skill 本身就是用 Skill 体系管理的——这是 Skill 体系成熟度的最高标志：

```
skill-creator/
├── SKILL.md                    ← 主工作流
├── agents/
│   ├── grader.md               ← 评估智能体指令
│   ├── comparator.md           ← 对比智能体指令
│   └── analyzer.md             ← 分析智能体指令
├── scripts/
│   ├── run_eval.py             ← 执行评估
│   ├── run_loop.py             ← 优化循环
│   ├── generate_report.py      ← 生成报告
│   └── package_skill.py        ← 打包分发
└── eval-viewer/
    └── generate_review.py      ← 人工审查界面
```

---

## 七、企业级 Skill 治理

### 7.1 Skill 注册中心

随着 Skill 数量增长，需要建立治理机制：

```
skill-registry/
├── public/                     ← 所有人可用
│   ├── docx.skill
│   ├── pdf.skill
│   └── xlsx.skill
│
├── private/                    ← 仅内部团队
│   ├── company-guidelines.skill
│   └── internal-api.skill
│
├── examples/                   ← 参考实现
│   ├── skill-creator.skill
│   └── mcp-builder.skill
│
└── deprecated/                 ← 即将退役
    └── old-formatter.skill
```

### 7.2 Skill 版本控制

```yaml
# SKILL.md frontmatter 版本字段
---
name: pdf-processor
version: "2.3.1"
min_claude_version: "claude-sonnet-4"
changelog:
  - "2.3.1": "修复大文件处理的内存溢出问题"
  - "2.3.0": "新增 OCR 支持"
  - "2.2.0": "支持批量处理"
deprecated_since: null
---
```

### 7.3 Skill 质量门禁

发布 Skill 前的质量检查清单：

```
□ pass_rate (with_skill) ≥ 0.80
□ delta.pass_rate ≥ 0.30（相比无 Skill 的提升）
□ stddev ≤ 0.10（结果稳定性）
□ errors_encountered = 0（无执行错误）
□ 触发率 ≥ 0.85（description 优化后）
□ 误触发率 ≤ 0.15
□ 有完整的 evals.json（≥ 5 个测试用例）
□ 有边界情况测试（空输入、异常格式等）
□ README 或 description 中有使用示例
□ 依赖项在 compatibility 中声明
```

---

## 八、Skill 体系 vs 其他范式的对比

### 8.1 vs 系统提示词（System Prompt）

| 维度 | System Prompt | Skill 体系 |
|------|:-------------:|:----------:|
| 作用范围 | 全局，始终生效 | 按需触发 |
| 维护方式 | 整体替换 | 模块化更新 |
| 测试机制 | 无标准化方案 | evals + benchmark |
| 上下文占用 | 持续占用 | 按需加载 |
| 复用性 | 低（绑定单个部署）| 高（跨项目共享）|
| 版本管理 | 困难 | 天然支持 |

### 8.2 vs RAG（检索增强生成）

| 维度 | RAG | Skill 体系 |
|------|:---:|:----------:|
| 知识来源 | 外部向量数据库 | 内嵌文档 + 脚本 |
| 适用知识类型 | 事实性、大规模 | 程序性、专业流程 |
| 更新方式 | 重新索引 | 版本发布 |
| 可解释性 | 中等 | 高（明确的步骤） |
| 延迟 | 额外检索开销 | 无检索开销 |
| 最适场景 | 知识问答、文档检索 | 工作流执行、专业操作 |

### 8.3 vs Function Calling / MCP Tools

| 维度 | Function Calling/MCP | Skill |
|------|:-------------------:|:-----:|
| 关注点 | 单一操作能力 | 完整工作流方法论 |
| 知识载体 | 代码 | 文档 + 代码 |
| 灵活性 | 低（固定接口）| 高（自然语言指导）|
| 组合方式 | 工具编排 | Skill 链 |
| 更新方式 | 代码部署 | 文档更新 |

**理想的 AI 系统架构是三者的结合：**
```
Skill 体系（工作流方法论）
    ├── 调用 MCP Tools（原子操作）
    ├── 检索 RAG（背景知识）
    └── 使用系统提示词（基础行为规范）
```

---

## 九、实战：从零构建一个 Skill

以"竞品分析报告"Skill 为例，展示完整开发过程：

### 步骤 1：定义意图

```
目标：生成结构化的竞品分析报告（.docx 格式）
触发场景：用户要求分析竞争对手、市场格局、产品对比
输入：竞品名称列表 + 分析维度（可选）
输出：专业的竞品分析 Word 文档
```

### 步骤 2：草稿 SKILL.md

```markdown
---
name: competitive-analysis
description: |
  生成专业竞品分析报告（Word 文档）。当用户提到竞争对手分析、
  市场格局研究、产品对比、行业调研时必须使用此技能。
  即使用户只说"分析一下竞品"或"看看对手在做什么"也应触发。
---

# 竞品分析 Skill

## 工作流

### 步骤 1：确认分析范围
- 询问或确认目标竞品列表（2-6 家）
- 确认分析维度（默认：功能、定价、用户评价、市场份额）

### 步骤 2：信息收集（使用 Web Search）
- 为每家竞品搜索：官网信息、定价页面、用户评价
- 重点收集：核心功能列表、定价策略、差异化卖点

### 步骤 3：结构化整理
按以下结构组织数据：
| 维度 | 竞品A | 竞品B | 竞品C |
|------|-------|-------|-------|
| 核心定位 | ... | ... | ... |
| 价格区间 | ... | ... | ... |
| 主要功能 | ... | ... | ... |
| 市场口碑 | ... | ... | ... |

### 步骤 4：生成文档
读取 docx-skill，按照文档规范生成报告，包含：
- 执行摘要（1 页）
- 竞品概况（每家半页）
- 对比矩阵（表格）
- 战略建议（1 页）
```

### 步骤 3：测试用例

```json
{
  "skill_name": "competitive-analysis",
  "evals": [
    {
      "id": 1,
      "prompt": "帮我分析 Notion、Obsidian 和 Roam Research 的竞争格局",
      "expectations": [
        "生成了 .docx 格式的分析报告",
        "报告包含三个竞品的对比内容",
        "包含功能对比表格",
        "有战略建议部分",
        "报告超过 3 页"
      ]
    }
  ]
}
```

### 步骤 4：运行、评审、迭代

```
v0 pass_rate: 0.60  → 缺失战略建议部分
v1 pass_rate: 0.75  → 表格格式不规范
v2 pass_rate: 0.88  → ✅ 达到质量门禁
```

---

## 十、未来展望：Skill 体系的演进方向

### 10.1 自适应 Skill

未来的 Skill 将能够根据用户历史反馈自动调整行为：
```
用户偏好: "我喜欢简洁的报告，不超过 2 页"
→ Skill 自动调整输出规范，无需修改 SKILL.md
```

### 10.2 Skill 联邦网络

跨组织的 Skill 发现和共享机制：
```
公司 A 发布：financial-report-skill
公司 B 发布：legal-contract-skill
社区贡献：100+ 专业领域 Skill

→ AI 系统按需订阅，构建个性化能力图谱
```

### 10.3 Skill 与 Agent 的融合

Skill 将成为 AI Agent 的"技能库"，Agent 根据任务动态组合：
```
复杂项目管理 Agent
  ├── 需要文档？→ 调用 docx-skill
  ├── 需要数据？→ 调用 xlsx-skill
  ├── 需要汇报？→ 调用 pptx-skill
  └── 需要发布？→ 调用 github-release-skill
```

---

## 总结

Skill 体系是 AI 工程化的核心基础设施。它的本质是将**隐性的专家知识**转化为**可复用、可测量、可迭代的显式模块**。

构建高质量 Skill 体系的关键要点：

**设计层面**：渐进式披露、最小惊讶原则、强触发描述

**工程层面**：清晰的目录结构、分层的资源管理、完整的测试用例

**质量层面**：量化评估（pass_rate、delta、stddev）、持续迭代循环、严格的发布门禁

**治理层面**：版本控制、注册中心、多环境（public/private/examples）管理

当 Skill 体系与 MCP（工具能力）、RAG（知识检索）、系统提示词（行为规范）有机结合，就构成了企业级 AI 系统的完整能力栈——这是 AI 从"能用"走向"好用"、从"偶尔惊艳"走向"稳定可靠"的关键工程路径。

---

## 参考资料

- [Anthropic Claude 文档](https://docs.claude.com)
- [Model Context Protocol 规范](https://spec.modelcontextprotocol.io)
- [Skill Creator 内部文档](https://github.com/anthropics/claude-skills)
- [提示词工程指南](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview)
