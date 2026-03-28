---
title: "用 Semrush + Claude Code CLI 打造 SEO 关键词分析 Skill：完整提示词指南"
date: 2026-03-28T21:29:49+08:00
lastmod: 2026-03-28T21:29:49+08:00
draft: false
author: "SEO Workflow"
description: "将 Semrush 导出数据与 Claude Code CLI 结合，通过 Skill 自动化完成关键词筛选、聚类与竞品反向工程的完整工作流与提示词模板。"
tags:
  - SEO
  - Claude Code
  - Semrush
  - 关键词分析
  - Skill
  - AI工作流
categories:
  - SEO工具
  - AI辅助
keywords:
  - Semrush CSV导出
  - Claude Code Skill
  - 关键词聚类
  - 竞品反向工程
  - EEAT
  - KD筛选
  - 意图识别
slug: "semrush-claude-code-seo-skill"
weight: 1
---

## 概述

本文将 Semrush 数据投喂给 Claude Code CLI 这一 SEO 自动化工作流，提炼为一套**可复用的 Skill 创建提示词**。通过 Skill，你可以让 Claude 在每次 SEO 项目启动时，自动读取 Semrush 导出的 CSV 文件并输出结构化的关键词策略报告。

---

## 第一阶段：定义 Skill 的意图与触发条件

> 将以下提示词发送给 Claude Code，开始 Skill 创建流程。

```
我想创建一个 Claude Code Skill，名称为 `semrush-seo-analyst`。

这个 Skill 的核心功能是：
1. 读取项目目录下 `data/` 文件夹中由 Semrush 导出的 CSV 文件
2. 以资深 SEO 专家的视角，基于 EEAT 原则对关键词数据进行分析
3. 输出结构化的关键词策略报告（含筛选结果、聚类、意图分类）

触发场景：
- 用户提到 "分析关键词"、"处理 Semrush 数据"、"筛选关键词"
- 用户引用了 .csv 文件并要求进行 SEO 分析
- 用户要求进行竞品关键词反向工程

请帮我开始设计这个 Skill。
```

---

## 第二阶段：数据准备与文件结构约定

> 确认 Skill 所依赖的数据输入格式。

```
在 SKILL.md 中，请约定以下数据结构规范：

项目目录结构：
  data/
  ├── competitor_A.csv     # 竞品A的自然搜索关键词
  ├── competitor_B.csv     # 竞品B的自然搜索关键词
  ├── my_website.csv       # 我方网站当前排名词（可选）
  └── keyword_magic.csv    # Keyword Magic Tool 导出的种子词扩展

Semrush CSV 标准字段（Skill 需能识别以下列名）：
  - Keyword（关键词）
  - Volume（月均搜索量）
  - KD %（关键词难度，0-100）
  - CPC（单次点击成本，USD）
  - Intent（搜索意图：Informational / Commercial / Transactional / Navigational）
  - Traffic（预估流量，仅竞品数据有此字段）
  - Position（排名位置，仅竞品数据有此字段）

请将上述规范写入 SKILL.md 的输入格式说明部分。
```

---

## 第三阶段：核心分析任务提示词模板

> 定义 Skill 内置的四种分析场景，作为 SKILL.md 的主体内容。

### 场景 A：低垂果实筛选（快速获得排名机会）

```
在 SKILL.md 中加入以下分析任务模板：

任务名称：低垂果实筛选
触发指令示例："帮我找出低难度高流量的机会词"

分析逻辑：
- 筛选条件：Volume > 500 且 KD% < 30
- 排序规则：按 Volume 降序
- 额外标注：若 CPC > $1，标记为"商业价值词"
- 输出格式：Markdown 表格，包含列 [关键词 | 搜索量 | KD% | 意图 | 备注]
- 建议数量：返回 Top 20 条结果
```

### 场景 B：竞品反向工程（截流竞争对手流量）

```
在 SKILL.md 中加入以下分析任务模板：

任务名称：竞品反向工程
触发指令示例："分析竞对的流量词"、"竞品在哪些词上拿了流量"

分析逻辑：
1. 读取 data/ 下所有 competitor_*.csv 文件
2. 合并去重，保留 Traffic 最高的唯一关键词
3. 排除品牌词（通过识别关键词中是否包含竞品域名主词来过滤）
4. 按 Traffic 降序排列，取 Top 30
5. 对每个关键词标注：[是否为我方已覆盖] / [差距机会]
6. 输出分析摘要：指出竞品最核心的 3 个流量支柱话题
```

### 场景 C：内容聚类（建立话题权威性）

```
在 SKILL.md 中加入以下分析任务模板：

任务名称：关键词聚类与内容规划
触发指令示例："帮我把关键词按话题分组"、"生成内容地图"

分析逻辑：
1. 对筛选后的关键词列表（Volume > 200）进行语义聚类
2. 将相似词归入同一"话题簇（Topic Cluster）"
3. 每个簇识别：
   - 支柱页（Pillar Page）候选词：搜索量最大、意图为 Informational 的词
   - 子页（Cluster Page）候选词：长尾词、Transactional 词
4. 输出格式：
   ## 话题簇：[话题名]
   - 支柱页关键词：xxx（Volume: xxx, KD: xx%）
   - 子页关键词列表：...
```

### 场景 D：搜索意图分类（内容与变现对齐）

```
在 SKILL.md 中加入以下分析任务模板：

任务名称：意图分类与变现路径规划
触发指令示例："按意图分类关键词"、"哪些词适合做产品页"

分析逻辑：
将所有关键词按 Intent 字段分为四个象限：

| 意图类型         | 内容形式建议         | 变现路径         |
|--------------|----------------|--------------|
| Informational | 博客文章、指南、FAQ    | 内链导流 + 邮件订阅  |
| Commercial   | 对比评测、Best-of 榜单 | 联盟链接 / 产品推荐  |
| Transactional | 产品页、落地页        | 直接转化         |
| Navigational | 品牌内容           | 品牌保护 / 截流竞品  |

对每类意图输出 Top 10 关键词，并给出具体的内容标题建议。
```

---

## 第四阶段：Skill 角色设定与输出规范

> 定义 Skill 的系统角色提示词（System Prompt 部分）。

```
在 SKILL.md 的角色设定部分，加入以下内容：

角色定义：
你是一名拥有 10 年经验的资深 SEO 策略师，专精于内容营销与自然搜索增长。
你的分析框架基于 Google 的 EEAT 原则（经验、专业性、权威性、可信度）。
你擅长从海量关键词数据中识别商业机会，并将其转化为可执行的内容策略。

输出规范：
1. 所有输出必须包含：执行摘要（3 句话）+ 详细数据表格 + 下一步行动建议
2. 数据表格使用 Markdown 格式，可直接复制到 Notion / Obsidian
3. 避免泛泛而谈，每条建议必须关联具体的关键词数据
4. 如数据量超过 100 条，先输出统计摘要，再输出 Top 结果

错误处理：
- 若 CSV 缺少必要字段（如 Volume 或 KD），提示用户检查导出设置
- 若 data/ 目录为空，引导用户完成 Semrush 导出步骤
```

---

## 第五阶段：测试用例（Skill 验证）

> 用以下提示词生成 Skill 的测试案例，验证 Skill 是否正常工作。

```
请为 `semrush-seo-analyst` Skill 设计 3 个测试用例：

测试用例 1（基础功能）：
- 模拟输入：提供一个包含 50 行数据的 Semrush 格式 CSV 示例
- 指令：@data/sample.csv 帮我筛选低垂果实关键词
- 预期输出：包含 Volume > 500 且 KD < 30 的词的 Markdown 表格

测试用例 2（竞品分析）：
- 模拟输入：提供 2 个竞品 CSV 文件路径引用
- 指令：读取 competitor_A 和 competitor_B 的数据，进行竞品反向工程分析
- 预期输出：合并后的 Top 30 流量词 + 竞品话题支柱分析

测试用例 3（完整报告）：
- 模拟输入：data/ 目录下包含全部 4 类文件
- 指令：基于 data/ 下所有 CSV 文件，生成完整的 SEO 关键词策略报告
- 预期输出：含四大分析模块的完整 Markdown 报告

请依次运行测试，并在每个测试后给出质量评分（1-10分）和改进建议。
```

---

## 第六阶段：Skill 打包与安装

> 完成测试后，执行以下指令打包 Skill。

```
测试结果符合预期，请执行以下操作：

1. 将 SKILL.md 保存至 /semrush-seo-analyst/SKILL.md
2. 在 SKILL.md 的 YAML frontmatter 中确认以下字段：
   name: semrush-seo-analyst
   description: >
     处理 Semrush 导出的 CSV 数据并生成 SEO 关键词策略报告。
     当用户提到 Semrush、关键词分析、竞品反向工程、KD筛选、
     关键词聚类、搜索意图分类，或引用了 .csv 文件并要求 SEO 分析时，
     必须触发此 Skill。即使用户只说"帮我分析这个 CSV"也应触发。

3. 执行打包命令：
   python -m scripts.package_skill semrush-seo-analyst/

4. 输出 .skill 文件供安装使用。
```

---

## 快速参考：一句话触发各场景

| 使用场景 | 快速指令示例 |
|------|---------|
| 筛选低垂果实 | `@data/keywords.csv 找出 KD<30 且 Volume>500 的机会词` |
| 竞品反向工程 | `读取 data/ 下所有竞品 CSV，找出他们的流量支柱词` |
| 内容聚类 | `对筛选后的关键词做话题聚类，生成内容地图` |
| 意图分类 | `按搜索意图分类所有关键词，给出变现路径建议` |
| 完整报告 | `基于 data/ 所有文件，生成完整 SEO 关键词策略报告` |

---

## 总结

通过以上六个阶段的提示词，你可以在 Claude Code CLI 中创建一个**专为 Semrush 数据分析设计的可复用 Skill**。核心路径是：

1. **导出** → 从 Semrush 导出筛选后的 CSV（建议控制在 500 行以内）
2. **放置** → 将文件统一放入项目的 `data/` 目录
3. **引用** → 用 `@文件名` 或直接说文件路径让 Claude 读取
4. **分析** → Skill 自动套用 EEAT 框架输出结构化报告

这套工作流将原本需要数小时的手工关键词筛选，缩短到**几分钟内完成**。

---

*生成时间：2026-03-28 21:29 CST*
