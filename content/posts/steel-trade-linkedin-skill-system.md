---
title: "ToB 钢材外贸 LinkedIn 运营 Skill 合集：Claude Code 完整构建指南"
date: 2026-03-18T03:39:57+08:00
lastmod: 2026-03-18T03:39:57+08:00
draft: false
tags: ["Skill", "LinkedIn", "外贸", "钢材", "B2B", "Claude Code", "AI运营", "内容营销"]
categories: ["Skill"]
description: "面向钢材外贸 ToB 场景的 LinkedIn 运营 AI Skill 合集，涵盖客户开发、内容生产、询盘转化等核心工作流，附完整 Claude Code 构建 Prompt。"
slug: "steel-trade-linkedin-skill-system"
author: "Claude"
toc: true
---

## 项目背景

钢材外贸 ToB 场景在 LinkedIn 运营上面临三大核心痛点：

1. **开发信同质化严重** — 千篇一律的模板被采购商秒删
2. **内容产出效率低** — 技术型销售不擅长写专业英文帖子
3. **询盘跟进不及时** — 人工处理响应延迟，错失成交窗口

本 Skill 合集通过 7 个专项 Skill 覆盖从「客户画像」到「成交跟进」的完整 LinkedIn 运营链路，并提供可直接传入 Claude Code 的构建 Prompt。

---

## 一、Skill 合集总览

```
steel-trade-linkedin/
├── 01-prospect-research/        ← 目标客户画像与挖掘
├── 02-connection-outreach/      ← 定制化连接请求与开发信
├── 03-content-calendar/         ← LinkedIn 内容日历规划
├── 04-post-generator/           ← 专业钢材行业帖文生成
├── 05-inquiry-handler/          ← 询盘快速响应与分级
├── 06-company-page-audit/       ← 企业主页优化审计
└── 07-competitor-monitor/       ← 竞品与市场动态监控
```

---

## 二、各 Skill 详细规格

### Skill 01：目标客户画像与挖掘（prospect-research）

**定位**：输入产品规格或目标市场，自动生成 ICP（理想客户画像）并输出可在 LinkedIn 搜索的精准筛选条件。

**触发场景**：
- "帮我找东南亚做建筑钢结构的采购商"
- "我想开发欧洲螺纹钢进口商"
- "生成一份目标客户画像"

**工作流**：
1. 收集产品信息（品种、规格、认证）
2. 确认目标市场（国家/地区、行业细分）
3. 生成 ICP 模板（公司规模、职位层级、采购决策链）
4. 输出 LinkedIn Sales Navigator 搜索关键词组合
5. 生成 .xlsx 客户追踪表模板

**输出**：ICP 文档（.docx）+ LinkedIn 搜索条件表（.xlsx）

---

### Skill 02：定制化连接请求与开发信（connection-outreach）

**定位**：基于目标客户 LinkedIn 主页内容，生成高度个性化的连接请求（≤300字）和首封开发信（≤500字），避免模板化。

**触发场景**：
- "给这个采购总监写连接请求"
- "根据他的主页写一封开发信"
- "帮我写 LinkedIn InMail"

**核心策略**：
- **连接请求**：提及对方近期动态/帖子/共同联系人，1句价值主张
- **开发信**：痛点切入 → 产品优势 → 社会证明（认证/案例）→ 低门槛 CTA
- **多版本输出**：冷触达版 / 共同联系人版 / 行业展会版

**变量注入**：客户公司名、采购品类、目标市场、己方核心优势（需用户提供）

**输出**：3 个版本的消息文案（Markdown 格式，附发送建议）

---

### Skill 03：LinkedIn 内容日历规划（content-calendar）

**定位**：按月生成钢材外贸 LinkedIn 运营内容日历，平衡专业内容、行业洞察、企业文化三类帖子，提升主页权重和粉丝粘性。

**触发场景**：
- "帮我规划下个月的 LinkedIn 内容"
- "生成 4 周内容日历"
- "我不知道发什么，帮我排期"

**内容类型分配（黄金比率）**：

| 类型 | 占比 | 示例 |
|------|------|------|
| 行业洞察 | 40% | 钢价走势分析、政策影响解读 |
| 产品专业内容 | 30% | 规格科普、认证解读、工艺对比 |
| 社会证明 | 20% | 客户案例、发货记录、展会回顾 |
| 互动话题 | 10% | 行业投票、问题讨论 |

**输出**：.xlsx 内容日历（含日期、主题、关键词、配图建议、hashtag 推荐）

---

### Skill 04：钢材行业英文帖文生成（post-generator）

**定位**：输入话题方向或素材，生成符合 LinkedIn 算法偏好的专业英文帖文，适配钢材/金属/工业品 B2B 受众。

**触发场景**：
- "帮我写一篇关于热轧卷板的 LinkedIn 帖子"
- "今天钢价涨了，写个帖子"
- "把这份产品资料改写成 LinkedIn 内容"

**帖文结构规范**：
```
第1行：强钩子句（问题/数据/反直觉观点）—— 决定展开率
空行
第2-4段：核心内容（每段3行内）
空行
结尾：CTA（评论互动 or 私信咨询）
空行
3-5个精准 hashtag
```

**行业 Hashtag 库**：`#SteelIndustry` `#HotRolledCoil` `#SteelTrade` `#MetalSupplier` `#StructuralSteel` `#SteelExport` `#B2BManufacturing`

**输出**：3 个版本帖文（数据驱动版 / 故事化版 / 教育科普版）

---

### Skill 05：询盘快速响应与分级（inquiry-handler）

**定位**：对收到的 LinkedIn 询盘进行意向分级（A/B/C），生成对应的快速回复模板，并提取关键需求字段录入跟进表。

**触发场景**：
- "这条询盘怎么回"
- "帮我判断这个客户是否真实买家"
- "生成询盘回复"

**意向分级标准**：

| 等级 | 判断依据 | 响应策略 |
|------|---------|---------|
| A 级（热） | 明确规格+数量+交货期，公司可查 | 2小时内回复，附详细报价单 |
| B 级（温） | 有具体品类需求，缺部分信息 | 24小时内回复，引导补充信息 |
| C 级（冷） | 泛泛询价，无具体需求 | 模板回复，加入培育序列 |

**输出**：意向评分卡 + 定制回复文案 + 跟进提醒事项（.md 格式）

---

### Skill 06：企业主页优化审计（company-page-audit）

**定位**：审计 LinkedIn 企业主页的完整度、SEO 表现和内容质量，输出结构化优化建议报告。

**触发场景**：
- "帮我审查公司 LinkedIn 主页"
- "为什么我们的主页没有展示量"
- "优化我们的 LinkedIn 企业页面"

**审计维度**：
1. **基础完整度**（Logo、Banner、简介、网站链接）
2. **关键词布局**（标题、About、Specialty 字段）
3. **内容活跃度**（发帖频率、互动率、粉丝增长）
4. **产品服务页**（Product Showcase 页面质量）
5. **员工关联度**（团队成员 LinkedIn 关联率）

**输出**：审计报告（.docx，含评分雷达图文字描述 + 优先级改进清单）

---

### Skill 07：竞品与市场动态监控（competitor-monitor）

**定位**：定期追踪主要竞争对手的 LinkedIn 内容策略、互动表现和市场定位，生成对比分析简报。

**触发场景**：
- "看看竞争对手最近在 LinkedIn 发什么"
- "帮我分析竞品的内容策略"
- "生成月度竞品 LinkedIn 简报"

**监控维度**：
- 发帖频率与内容主题分布
- 互动率（点赞/评论/转发比）
- 粉丝增长速度
- 产品推广切入角度
- 关键词差异化机会

**输出**：竞品监控月报（.docx，含对比矩阵 + 内容差距分析 + 可借鉴方向）

---

## 三、Claude Code 构建 Prompt

将以下 Prompt 完整传入 Claude Code，自动生成上述 7 个 Skill 的完整文件结构：

````markdown
# 任务：构建钢材外贸 LinkedIn 运营 Skill 合集

## 项目基本信息
- 项目名称：`steel-trade-linkedin`
- 工作目录：`/mnt/user/skills/steel-trade-linkedin/`
- 目标用户：钢材外贸 ToB 企业销售/市场团队
- 运营平台：LinkedIn（个人主页 + 企业主页）

## 需要创建的 Skill 列表

请按顺序创建以下 7 个 Skill，每个 Skill 包含完整的目录结构和文件：

---

### Skill 1：prospect-research

**目录结构**：
```
prospect-research/
├── SKILL.md
├── references/
│   ├── icp-framework.md        ← ICP 画像框架模板
│   ├── linkedin-search-tips.md ← LinkedIn 高级搜索技巧
│   └── steel-industry-sic.md   ← 钢材行业 SIC/NACE 代码表
├── assets/
│   └── customer-tracking-template.xlsx  ← 客户追踪表模板结构说明
└── evals/
    └── evals.json
```

**SKILL.md 核心内容要求**：
- YAML frontmatter：name=`steel-prospect-research`，description 需涵盖触发词：目标客户、采购商、ICP、客户画像、开发名单、找客户
- 工作流分 4 步：收集产品信息 → 确认目标市场 → 生成 ICP → 输出搜索条件
- 决策树：区分「已知目标市场」和「待确认目标市场」两条路径
- 输出规范：ICP 文档 + LinkedIn Boolean Search 字符串 + Excel 追踪表
- 示例：输入「热轧卷板，目标市场越南建筑商」→ 输出完整 ICP

**evals.json** 需包含 3 个测试用例，覆盖：单一市场、多市场、产品不熟悉（需 AI 补充行业知识）

---

### Skill 2：connection-outreach

**目录结构**：
```
connection-outreach/
├── SKILL.md
├── references/
│   ├── outreach-psychology.md   ← B2B 外贸开发信心理学原则
│   ├── steel-pain-points.md     ← 钢材采购商常见痛点库
│   └── social-proof-templates.md ← 社会证明表达方式模板
└── evals/
    └── evals.json
```

**SKILL.md 核心内容要求**：
- 触发词：开发信、InMail、连接请求、LinkedIn 消息、加好友、outreach
- 强制步骤：先要求用户提供「目标客户职位+公司类型+近期动态（可选）」和「自身核心优势（认证/产地/交期/价格竞争力）」
- 三版本输出框架：冷触达（无共同点）/ 温触达（有共同联系人或互动记录）/ 展会触达（线下见过面）
- 字数硬限制：连接请求 ≤ 280 字符，InMail ≤ 500 词
- 禁止用词清单（写入 Skill）：`I wanted to reach out`、`Hope this finds you well`、`We are a leading manufacturer`

**evals.json** 包含 4 个测试用例：冷触达越南采购总监 / InMail 德国工程公司 / 展会后跟进 / 拒绝后重新联系

---

### Skill 3：content-calendar

**目录结构**：
```
content-calendar/
├── SKILL.md
├── references/
│   ├── linkedin-algorithm-2025.md  ← LinkedIn 算法最新机制
│   ├── steel-content-topics.md     ← 钢材行业内容主题库（50+话题）
│   └── hashtag-research.md         ← B2B 钢材行业 hashtag 数据
├── assets/
│   └── calendar-template-spec.md  ← Excel 日历模板字段规范
└── evals/
    └── evals.json
```

**SKILL.md 核心内容要求**：
- 触发词：内容日历、发帖计划、内容规划、LinkedIn 排期、内容策略
- 必须先询问：规划周期（1周/2周/1月）、运营目标（获客/品牌/行业影响力）、团队发帖能力（每周几条）
- 内容配比逻辑：输出需说明每类内容的商业意图
- 节假日/行业展会适配：自动识别规划期内的钢铁行业展会（如 China Baowu Steel Forum、Metal & Steel 等）
- 输出格式：每条包含「发布日期、内容类型、核心话题、关键信息点、配图建议、目标 hashtag（5个）、CTA 方向」

---

### Skill 4：post-generator

**目录结构**：
```
post-generator/
├── SKILL.md
├── references/
│   ├── hook-formulas.md         ← 30种 LinkedIn 钩子句公式
│   ├── steel-glossary-en.md     ← 钢材专业术语英文对照表
│   └── formatting-rules.md      ← LinkedIn 帖文格式最佳实践
└── evals/
    └── evals.json
```

**SKILL.md 核心内容要求**：
- 触发词：写帖子、LinkedIn post、内容生成、发文、帖文
- 输入收集：话题/素材 + 目标受众 + 希望的 CTA（评论/私信/点赞/访问官网）
- 三版本强制输出：数据洞察版（含行业数据）/ 故事叙事版（客户案例/经历）/ 教育科普版（知识分享）
- 格式规范硬性要求：首行不超过 8 词、段落间必须空行、结尾留 CTA、hashtag 控制在 3-5 个
- 英文写作标准：商务英语（非口语），可读性评分目标 Flesch-Kincaid Grade 10-12

**evals.json** 覆盖：钢价分析帖 / 产品科普帖 / 客户成功案例帖 / 展会预告帖

---

### Skill 5：inquiry-handler

**目录结构**：
```
inquiry-handler/
├── SKILL.md
├── references/
│   ├── qualification-criteria.md  ← B2B 买家资质判断标准
│   └── response-templates.md      ← A/B/C 三级回复模板库
└── evals/
    └── evals.json
```

**SKILL.md 核心内容要求**：
- 触发词：询盘、inquiry、回复、报价请求、客户消息、怎么回
- 必须先让用户粘贴原始询盘文本
- 分析维度：意向信号词识别 + 公司背景可信度 + 需求明确度 + 买家专业度
- 输出结构：
  1. 意向评级（A/B/C）+ 判断依据（3条）
  2. 定制化回复（英文，含称呼、确认理解、补充问题、下一步 CTA）
  3. 需要进一步收集的信息清单
  4. 跟进时间建议

**evals.json** 包含：高质量询盘（A级）/ 信息不全询盘（B级）/ 可疑中间商询盘（C级）/ 竞争对手伪装询盘

---

### Skill 6：company-page-audit

**目录结构**：
```
company-page-audit/
├── SKILL.md
├── references/
│   ├── linkedin-seo-guide.md     ← LinkedIn 页面 SEO 优化指南
│   └── steel-company-benchmarks.md ← 钢材外贸公司主页标杆案例分析
└── evals/
    └── evals.json
```

**SKILL.md 核心内容要求**：
- 触发词：主页审计、LinkedIn 优化、企业页面、公司主页、profile 诊断
- 输入方式：用户描述当前主页状态（或粘贴文本内容）
- 5 大审计维度（每项 0-20 分，满分 100）：
  - 视觉品牌（Logo/Banner 专业度）
  - 关键词优化（标题/简介 SEO）
  - 内容活跃度（频率/互动/粉丝）
  - 产品展示完整度
  - 员工生态健康度
- 输出：评分卡 + 按优先级排序的改进建议（高/中/低）+ 30天快速提升行动计划

---

### Skill 7：competitor-monitor

**目录结构**：
```
competitor-monitor/
├── SKILL.md
├── references/
│   ├── competitive-analysis-framework.md  ← 竞品分析框架
│   └── steel-major-exporters.md           ← 全球主要钢材出口商名录
└── evals/
    └── evals.json
```

**SKILL.md 核心内容要求**：
- 触发词：竞品监控、竞争对手、competitor、市场动态、对手在做什么
- 分析框架：内容策略 + 受众互动 + 关键词定位 + 差异化机会
- 结合 Web Search 工具获取最新动态
- 输出：月度简报（含竞品排名矩阵 + 内容差距热力图文字描述 + 3个可立即行动的机会点）

---

## 通用构建规范

所有 7 个 Skill 必须遵守：

**SKILL.md frontmatter 标准格式**：
```yaml
---
name: [skill-name]
version: "1.0.0"
domain: "steel-trade-linkedin"
language: "zh-CN / en"
description: |
  [强触发描述，至少100字，明确列出触发词和场景，
  包含"即使用户只是说...也应触发"的强制性表达]
compatibility:
  tools: [bash, python]
  outputs: [docx, xlsx, md]
---
```

**evals.json 最低要求**：
- 每个 Skill 至少 3 个测试用例
- 每个用例至少 5 条 expectations
- 必须包含 1 个边界测试（输入不完整/格式异常）

**文件命名规范**：
- 所有文件使用 kebab-case
- references/ 下文件不超过 500 行
- 脚本文件需包含注释说明

---

## 执行指令

请按以下顺序执行：

1. 先创建项目根目录和 7 个 Skill 子目录
2. 按 Skill 编号顺序逐一创建文件
3. 每创建完一个 Skill，输出「✅ Skill [N] 创建完成：[skill-name]」
4. 全部完成后，生成 `README.md`（中英双语）说明整个 Skill 合集的使用方式
5. 最后运行检查：确认所有 SKILL.md 包含必填字段（name, version, description）

开始执行。
````

---

## 四、Skill 链：完整业务场景串联

以下展示 3 个典型业务场景的 Skill 调用链路：

**场景 A：开发新市场（东南亚镀锌板买家）**
```
prospect-research → connection-outreach → inquiry-handler
（画像确定）        （个性化触达）         （询盘承接转化）
```

**场景 B：LinkedIn 品牌建设（月度运营）**
```
company-page-audit → content-calendar → post-generator → competitor-monitor
（现状诊断）          （策略规划）         （内容执行）        （效果对标）
```

**场景 C：展会前后营销（如 Canton Fair 前后）**
```
content-calendar（展会专题） → post-generator（预热+现场+复盘） → connection-outreach（展会联系人跟进）
```

---

## 五、快速验证清单

在正式使用前，对每个 Skill 执行以下检查：

```
□ 触发词覆盖率 ≥ 85%（用 5 种不同表述测试，看是否都能触发）
□ 首次输出符合格式规范（检查帖文长度/报告结构）
□ 边界测试通过（输入空内容/错误格式时有合理提示）
□ 英文输出可直接使用（无明显语法错误）
□ 中英文切换正常（部分 Skill 需要双语输出）
```

---

## 六、后续迭代方向

| 优先级 | 扩展 Skill | 说明 |
|--------|-----------|------|
| P1 | `price-trend-post` | 自动抓取钢价数据，生成周报帖文 |
| P1 | `lead-scoring-sheet` | 基于 LinkedIn 互动行为给潜客打分 |
| P2 | `testimonial-generator` | 将客户反馈改写为 LinkedIn 推荐语 |
| P2 | `event-recap-post` | 展会/参观工厂后的帖文生成 |
| P3 | `multilingual-adapter` | 将中文内容适配为阿语/西语版本 |

---

*本文档由 Claude 生成 · 构建时间 2026-03-18 03:39 CST · 基于 Anthropic Skill 体系架构规范*
