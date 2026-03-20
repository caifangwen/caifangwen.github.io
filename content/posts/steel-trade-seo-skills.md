---
title: 钢材外贸 SEO Skill 体系：领域覆盖层完整 Prompt 合集
date: 2026-03-20T10:00:00+08:00
draft: false
tags:
  - SEO
  - Skill
  - 钢材外贸
  - B2B
  - 外贸营销
  - Claude Code
  - 提示词工程
categories:
  - 技术实践
  - 外贸SEO
description: 基于通用 SEO Skill 体系（模式 A 领域覆盖层），专为钢材外贸 B2B 场景设计的完整 Skill Prompt 合集，涵盖关键词研究、产品页优化、技术审计、外链建设和月报生成五大模块。
author: Claude
toc: true
---

## 前言

本文是《[项目级 SEO Skill 体系构建指南](../seo-skill-project-setup/)》的**行业落地版**。

采用**模式 A（领域覆盖层）**：通用 SEO Skill 保持不动，在 `skills/private/steel-trade/` 下建立钢材外贸专用覆盖层。所有 Prompt 可直接复制到对应的 `SKILL.md` 文件中使用。

钢材外贸 B2B SEO 的特殊性：

- 买家主要来自中东、东南亚、非洲、南美等新兴市场，搜索行为与欧美差异显著
- 产品规格是核心搜索词（规格 + 标准 + 用途的三元组合）
- 询盘转化是唯一目标，流量本身没有意义
- 竞争对手多为印度、土耳其、韩国钢厂，需要差异化竞争策略

---

## 一、目录结构

```
seo-skills/
└── skills/
    └── private/
        └── steel-trade/                    ← 钢材外贸领域覆盖层
            ├── SKILL.md                    ← 领域入口（注册到 CLAUDE.md）
            ├── steel-keyword-research/
            │   ├── SKILL.md
            │   └── references/
            │       ├── product-specs-taxonomy.md
            │       ├── buyer-country-intent.md
            │       └── competitor-domains.md
            ├── steel-content-optimizer/
            │   ├── SKILL.md
            │   └── references/
            │       ├── product-page-checklist.md
            │       ├── steel-grade-glossary.md
            │       └── inquiry-cta-templates.md
            ├── steel-technical-audit/
            │   ├── SKILL.md
            │   └── references/
            │       └── b2b-ux-checklist.md
            ├── steel-link-building/
            │   ├── SKILL.md
            │   └── references/
            │       ├── steel-directories.md
            │       └── outreach-templates-en.md
            └── steel-report-generator/
                ├── SKILL.md
                └── references/
                    └── kpi-definitions.md
```

---

## 二、CLAUDE.md 领域注册配置

在项目根目录 `CLAUDE.md` 的 Skill 列表中追加以下内容：

```markdown
## 钢材外贸专用 Skill（领域覆盖层）

| Skill 名称 | 路径 | 触发场景 |
|------------|------|----------|
| steel-keyword-research | skills/private/steel-trade/steel-keyword-research/ | 钢材产品关键词挖掘、规格词分析、买家国家意图研究 |
| steel-content-optimizer | skills/private/steel-trade/steel-content-optimizer/ | 钢材产品页优化、规格表 SEO、询盘转化优化 |
| steel-technical-audit | skills/private/steel-trade/steel-technical-audit/ | 钢材外贸网站技术审计、多语言检查、移动端询盘流程 |
| steel-link-building | skills/private/steel-trade/steel-link-building/ | 钢铁行业目录收录、贸易媒体外链、买家社区渗透 |
| steel-report-generator | skills/private/steel-trade/steel-report-generator/ | 钢材外贸 SEO 月报、询盘来源分析、ROI 汇报 |

## Skill 触发优先级规则（钢材外贸）

- 内容涉及钢材品种、规格、标准（GB/ASTM/EN）→ 优先触发 steel-* 系列，不触发通用 Skill
- 用户提到"询盘"、"FOB/CIF 报价"、"买家"、"港口"→ 优先触发 steel-* 系列
- 用户提到具体国家买家（沙特、越南、尼日利亚等）→ 触发 steel-keyword-research
- 无法判断是否钢材外贸场景时 → 询问"是否用于钢材出口业务？"后再选 Skill

## Skill 串联顺序（钢材外贸）

- 新产品上线：steel-keyword-research → steel-content-optimizer
- 全站优化：steel-technical-audit → steel-keyword-research → steel-content-optimizer → steel-report-generator  
- 询盘下降排查：steel-technical-audit → steel-content-optimizer（重点检查 CTA 和规格表）
```

---

## 三、核心 Skill Prompt 完整内容

### 3.1 `steel-keyword-research/SKILL.md`

```markdown
---
name: steel-keyword-research
version: "1.0.0"
description: |
  钢材外贸 B2B 场景的专业关键词研究。当用户提到钢材出口关键词、
  钢铁产品搜索词挖掘、买家搜索习惯分析、竞品关键词对比、
  特定钢材品种（螺纹钢、热轧卷、角钢、工字钢、不锈钢管等）的词库建设，
  或提到目标市场（中东、东南亚、非洲、南美）的买家意图分析时，
  必须触发此技能，优先于通用 keyword-research Skill。
  用户说"帮我找找越南买家在搜什么"或"ASTM A36 有哪些长尾词"也应触发。
compatibility:
  tools: [web_search]
---

# 钢材外贸关键词研究 Skill

## 继承基础

**首先读取并执行** `skills/public/keyword-research/SKILL.md` 的完整流程（种子词扩展、意图分类、漏斗映射、优先级评分）。

以下为钢材外贸领域的**覆盖规则**，与通用规则冲突时以本文件为准。

---

## 领域前置条件（替换通用前置条件）

开始前必须确认：

- [ ] **目标产品**：具体到品种+规格（例："热轧卷板 3mm-8mm"，不接受"钢材"这种模糊输入）
- [ ] **适用标准**：GB / ASTM / EN / JIS / BS（影响关键词的技术词根）
- [ ] **目标买家国家**：至少指定 1-3 个（影响搜索语言和用词习惯）
- [ ] **竞争层级**：大型钢厂竞争 / 贸易商竞争 / 细分品类竞争
- [ ] **核心转化目标**：询盘量 / 样品请求 / 目录下载

如信息不完整，**必须逐项询问**，不得用猜测代替。

---

## 关键词结构：钢材三元组模型

每个产品的关键词必须覆盖以下三元组的所有组合：

```
[品种词] + [规格/标准词] + [用途/场景词]
```

**示例（热轧卷板）：**

| 品种词 | 规格/标准词 | 用途/场景词 |
|--------|------------|------------|
| hot rolled steel coil | 3mm / 5mm / ASTM A36 / SS400 | construction / shipbuilding / manufacturer / supplier / price / factory |
| HR steel sheet | thickness 2-12mm / Q235 / S235JR | wholesale / bulk / importer / distributor |
| hot rolled coil | grade S355 / grade 50 | export / FOB / China supplier |

**规则：**
- 规格词必须包含：厚度/宽度 + 钢号/牌号 + 适用标准，三类至少各取 2 个
- 用途词必须区分：终端用户词（manufacturer/fabricator）和渠道词（supplier/distributor/importer）
- 每个三元组产生的关键词不少于 20 个

---

## 钢材行业意图分类（覆盖通用四象限）

| 意图类型 | 钢材外贸含义 | 典型关键词模式 | 优先级 |
|----------|------------|--------------|--------|
| **Transactional（询盘/采购）** | 买家已确认需求，正在比价 | "[产品] price / FOB price / factory / manufacturer" | ⭐⭐⭐⭐⭐ |
| **Commercial（评估对比）** | 买家在对比供应商或材料 | "[产品] vs [替代品] / [产品] supplier list / top [产品] manufacturer" | ⭐⭐⭐⭐ |
| **Specification（规格查询）** | 买家核对技术参数 | "[钢号] equivalent / [标准] chemical composition / [产品] datasheet" | ⭐⭐⭐ |
| **Informational（了解市场）** | 买家处于早期研究 | "[产品] market price / [产品] import duty [国家]" | ⭐⭐ |

**重要：** Specification 意图在钢材行业具有特殊价值——查规格的买家往往是工程师/采购经理，转化率高，必须单独建立技术参数落地页来承接。

---

## 买家国家关键词差异规则

读取 `references/buyer-country-intent.md` 后，按以下规则调整关键词：

**中东（沙特/UAE/伊朗/伊拉克）：**
- 搜索语言：英语为主，阿语辅助
- 偏好词：construction steel / rebar / deformed bar + Saudi standard / SASO
- 高价值词加入：Dubai port / Jebel Ali / CIF Middle East

**东南亚（越南/泰国/菲律宾/印尼）：**
- 搜索语言：英语，部分用本地语
- 偏好词：steel structure / hollow section / galvanized steel + competitive price / cheap
- 注意：越南买家常搜 "thép [品种]"，需要越南语关键词补充

**非洲（尼日利亚/南非/肯尼亚/埃塞俄比亚）：**
- 搜索语言：英语
- 偏好词：mild steel / structural steel + affordable / wholesale / bulk order
- 高价值词：Lagos port / Mombasa / FOB China

**南美（巴西/秘鲁/智利/哥伦比亚）：**
- 搜索语言：西班牙语/葡萄牙语为主
- 需要双语关键词：acero laminado / chapa de acero + precio / proveedor / fabrica China

---

## 竞品关键词分析（钢材特化）

读取 `references/competitor-domains.md`，重点分析：

1. 印度竞争对手（SAIL、Tata Steel、众多贸易商）的关键词布局
2. 土耳其钢厂的英语内容策略
3. 韩国 POSCO 系列产品页的关键词密度
4. 国内竞品（宝钢、沙钢英文站）的差异化空间

**竞品空白分析：** 找出竞品排名但内容质量差的词，这是快速突破的机会词。

---

## 输出格式（替换通用报告格式）

```
## 钢材关键词研究报告：[产品名] | 目标市场：[国家列表]

### 执行摘要
- 三元组扩展关键词总数：XX 个
- Transactional 意图高价值词：XX 个（直接影响询盘）
- 技术规格词（工程师搜索）：XX 个
- 建议优先创建内容数量：XX 篇

### 核心关键词矩阵

| 关键词 | 搜索意图 | 买家国家 | 月搜索量(估) | 竞争度 | 优先级 | 建议落地页类型 |
|--------|---------|---------|------------|--------|--------|--------------|
| ...    | ...     | ...     | ...        | ...    | ...    | ...          |

### 产品落地页关键词分配

[每个产品变体建议一个独立 URL，列出对应核心词和长尾词]

### 买家国家内容优先级

[按询盘潜力排序各国市场，给出内容本地化建议]

### 技术规格词专项

[钢号/牌号对照表关键词，建议创建"[标准]对照页"的关键词依据]

### 竞品空白机会

[列出竞品排名靠前但内容质量差的 TOP 10 词，附简要突破策略]
```

---

## 错误处理（领域特化）

- 用户只说"帮我找钢材关键词" → 必须追问：哪个品种？什么规格？目标哪个国家？
- 用户给出的是中文规格（如"Q235B 10mm"）→ 先翻译为英文关键词，再扩展，并标注中英文对照
- 买家国家搜索量数据缺乏 → 说明原因，用竞品分析和行业经验给出估算范围，明确标注"估算"
- 竞争对手域名无法访问 → 使用 web_search 搜索竞品品牌词，间接获取信息
```

---

### 3.2 `steel-content-optimizer/SKILL.md`

```markdown
---
name: steel-content-optimizer
version: "1.0.0"
description: |
  钢材外贸产品页和内容的 SEO 全面优化。当用户提到优化钢材产品页、
  改写产品描述、完善规格参数表、提升询盘转化率、优化 RFQ 按钮布局、
  改进产品图片 Alt 标签、建设规格对照页面、添加技术参数 Schema 时，
  必须触发此技能，优先于通用 content-optimizer Skill。
  用户上传产品页内容或粘贴产品描述并要求"优化"时立即触发，
  直接开始钢材外贸专项 15 项诊断，不得等待更多指令。
compatibility:
  tools: [web_search]
---

# 钢材外贸内容 SEO 优化 Skill

## 继承基础

**首先读取并执行** `skills/public/content-optimizer/SKILL.md` 的完整 12 项诊断流程。

以下为钢材外贸领域的**额外检查项和覆盖规则**，追加到通用诊断之后执行。

---

## 领域前置条件（补充通用前置条件）

在通用前置条件基础上，额外确认：

- [ ] **产品品种和规格范围**（例：角钢 25x25mm - 200x200mm，Q235B/Q345B）
- [ ] **适用标准体系**（GB、ASTM、EN 等，影响技术词汇选择）
- [ ] **目标买家类型**：工厂采购（需要技术细节）/ 贸易商（需要价格和 MOQ）/ 工程商（需要认证和用途）
- [ ] **是否有 RFQ/询盘表单**：有 → 评估转化路径；无 → 必须建议添加

---

## 钢材产品页额外诊断（追加第 13-15 项）

在通用 12 项诊断基础上，追加以下钢材外贸专项检查：

**规格信息层（第 13 项）**

13. 规格参数表完整性诊断：
    - ✅ 规格表包含：尺寸范围 / 重量(kg/m 或 kg/pcs) / 适用标准 / 钢号对照表
    - ✅ 规格数据使用 HTML `<table>` 或结构化格式（禁止用图片替代）
    - ✅ 是否有跨标准牌号对照（例：Q235B = A36 = S235JR = SS400）
    - ❌ 规格信息仅为文字描述，无结构化表格

**询盘转化层（第 14 项）**

14. 询盘路径诊断（这是产品页最核心指标）：
    - ✅ 页面顶部（首屏）有明显 RFQ/Get Quote 按钮
    - ✅ 规格表旁边有"询盘此规格"快捷入口
    - ✅ CTA 文案使用转化词："Get Best Price" / "Request Free Sample" / "Get Quote in 24H"
    - ❌ 只有页面底部联系方式，无主动询盘引导
    - ❌ CTA 使用"Contact Us"这类弱意图词

**信任背书层（第 15 项）**

15. B2B 信任元素诊断：
    - ✅ 展示了质量认证（ISO 9001 / CE / Mill Certificate 样本）
    - ✅ 有已服务买家国家/地区的数字或地图
    - ✅ 有生产能力描述（月产量 / 库存吨位）
    - ✅ 交货期、最小起订量（MOQ）、包装方式清晰可见
    - ❌ 无任何第三方认证或买家背书

---

## 钢材产品页必改项优化规范

读取 `references/product-page-checklist.md` 和 `references/steel-grade-glossary.md` 后执行：

### Title Tag 公式（钢材外贸专用）

```
[产品英文名] [规格范围] - [标准/钢号] | [公司名/China Factory]
```

示例：
- ✅ `Hot Rolled Steel Coil 2-12mm - ASTM A36 Q235B | China Mill`
- ✅ `Angle Steel 25x25-200x200mm - GB/ASTM/EN Standard | Factory Price`
- ❌ `Steel Products - High Quality - Best Price` （无规格无标准）

**规则：**
- 必须包含具体规格范围或标准编号
- "China" 或 "Factory/Mill/Manufacturer" 建议保留（买家信任信号）
- 禁止使用"Best/Top/No.1"等无法验证的形容词

### Meta Description 公式（钢材外贸专用）

```
[产品名] [规格] manufacturer. [标准] certified. MOQ [X] tons. 
Get free quote in [X]H. Shipped to [国家列表].
```

示例：
- ✅ `Hot rolled steel coil supplier, 2-12mm, ASTM A36/Q235B. ISO certified. MOQ 25 tons. Free quote in 24H. Export to 50+ countries.`

**规则：**
- 必须包含 MOQ（降低不合格询盘）
- 必须有时效性 CTA（"quote in 24H"）
- 若有认证，必须提及

---

## 规格表 SEO 优化规范

钢材产品页规格表是最重要的 SEO 内容单元，必须输出优化后的 HTML 结构建议：

```html
<!-- 推荐结构：既对买家友好，也对搜索引擎友好 -->
<section aria-label="Hot Rolled Steel Coil Specifications">
  <h2>Hot Rolled Steel Coil Specifications</h2>
  
  <!-- 跨标准牌号对照表（极高 SEO 价值） -->
  <h3>Steel Grade Equivalents</h3>
  <table>
    <thead>
      <tr><th>China GB</th><th>USA ASTM</th><th>Europe EN</th><th>Japan JIS</th></tr>
    </thead>
    <tbody>
      <tr><td>Q235B</td><td>A36</td><td>S235JR</td><td>SS400</td></tr>
      <tr><td>Q345B</td><td>A572 Gr.50</td><td>S355JR</td><td>SM490</td></tr>
    </tbody>
  </table>

  <!-- 规格参数表 -->
  <h3>Available Sizes</h3>
  <table>
    <thead>
      <tr><th>Thickness (mm)</th><th>Width (mm)</th><th>Weight (kg/m²)</th><th>Standard</th></tr>
    </thead>
    <tbody>
      <!-- 数据行 -->
    </tbody>
  </table>
</section>
```

**输出要求：** 提供完整的优化后规格表 HTML 结构，不得只给建议而不给代码。

---

## FAQ 生成规范（钢材外贸专项）

基于产品关键词，必须生成以下类型的 FAQ（不少于 6 个）：

**必须覆盖的问题类型：**

1. **价格类**：`What is the price of [产品]?` / `How much does [产品] cost per ton?`
2. **规格类**：`What sizes are available for [产品]?` / `What standards do you follow?`
3. **订购类**：`What is the minimum order quantity?` / `Can I order a sample?`
4. **认证类**：`Do you have mill test certificates?` / `Is your steel ISO certified?`
5. **交货类**：`What is the lead time?` / `Which ports do you ship from?`
6. **对比类**：`What is the difference between Q235B and A36?`

**每个 FAQ 回答要求：**
- 50-100 字，自然融入关键词
- 价格类回答不给具体价格（引导询盘）：用"Contact us for latest price based on your quantity"
- 认证类回答提及具体证书名称

---

## 内链建议（钢材网站专属）

扫描产品页后，标注以下类型的内链机会：

```
类型 A：规格对照页内链
位置：提到 "ASTM A36" 的位置
建议链接：/steel-grade-equivalent/q235b-vs-a36/
理由：规格对照页是钢材网站流量最高的内容类型之一

类型 B：应用场景页内链
位置：提到 "construction" / "shipbuilding" 等场景的位置
建议链接：/applications/structural-steel-for-construction/
理由：场景页承接商业意图词，提升整站 Topical Authority

类型 C：认证页内链
位置：提到 "certified" / "ISO" 等词的位置
建议链接：/quality/certificates/
理由：信任背书页对 B2B 买家决策有显著影响
```

---

## 输出规范

读取 `references/inquiry-cta-templates.md` 后，输出：

```
## 钢材产品页优化报告：[产品名]

### 诊断结果
✅ X项通过  ⚠️ X项需优化  ❌ X项严重问题（含 13-15 项专项）

### 询盘转化诊断（单独呈现）
[第 14 项详细分析，因为这是最影响业务结果的指标]

### 必改清单
[原文 → 优化版本，含 Title/Meta/H 结构/规格表结构]

### 规格表优化版本
[直接输出可用的 HTML 代码]

### FAQ 内容（6 个以上）
[直接输出可用的 FAQ 内容]

### 内链建议
[3-5 处，含具体位置和建议 URL 结构]

### 预期 SEO 收益
[重点说明询盘转化预期改善，而不只是排名变化]
```
```

---

### 3.3 `steel-technical-audit/SKILL.md`

```markdown
---
name: steel-technical-audit
version: "1.0.0"
description: |
  钢材外贸网站技术 SEO 专项审计。当用户提到钢材网站技术问题、
  多语言版本检查（英语/阿语/西语）、询盘表单转化问题、
  产品目录页爬取问题、规格表图片无法被索引、
  网站在中东或东南亚打开慢、移动端询盘流程断裂时，
  必须触发此技能，优先于通用 technical-audit Skill。
compatibility:
  tools: [web_search, web_fetch, bash]
---

# 钢材外贸技术 SEO 审计 Skill

## 继承基础

**首先读取并执行** `skills/public/technical-audit/SKILL.md` 的完整审计流程。

以下为钢材外贸网站的**额外审计项**，追加到通用审计后执行。

---

## 钢材外贸网站额外审计项

读取 `references/b2b-ux-checklist.md` 后，检查以下专项：

### 专项 A：多语言 / 多地区配置

```
检查项 A1：hreflang 标签配置
- 是否有阿语版本 → 检查 hreflang="ar" 是否正确
- 是否有西语版本 → 检查 hreflang="es" 是否正确
- 默认语言是否设置 hreflang="x-default"
- 多语言页面间是否互相声明（双向声明）

检查项 A2：多语言内容质量
- 非英语版本是否为机器翻译（直接查关键词密度和语言自然度）
- 产品名称和规格是否保留英文（行业惯例，不应被翻译）
- 货币和单位是否本地化（中东用 USD/ton，东南亚也用 USD/ton）

检查项 A3：地区服务器/CDN
- 使用 web_fetch 测试目标国家的页面加载速度
- 检查是否有 CDN 节点覆盖中东、东南亚
```

### 专项 B：询盘转化技术路径

```
检查项 B1：RFQ 表单功能性
- 表单字段是否合理（产品 / 规格 / 数量 / 目的港 / 联系方式）
- 是否有 quantity 字段（帮助筛选买家质量）
- 提交后是否有确认页面和自动回复邮件
- 表单是否支持附件上传（买家发送图纸需求）

检查项 B2：表单 SEO 可见性
- 表单页面是否被 robots.txt 屏蔽（常见错误）
- 表单提交成功页（/thank-you/）是否被 GA/统计工具追踪为转化
- 是否有 Schema markup（ContactPage / LocalBusiness）

检查项 B3：移动端询盘流程
- 移动端首屏是否有 WhatsApp / WeChat 快捷联系按钮
- 规格表在移动端是否可横向滑动（常见表格截断问题）
- 表单在移动端是否触发数字键盘（电话/数量字段）
```

### 专项 C：产品目录页技术配置

```
检查项 C1：URL 结构
- 产品页 URL 是否包含产品关键词（/products/hot-rolled-steel-coil/）
- 规格变体是否有独立 URL 还是 JS 渲染（JS 渲染对 SEO 不友好）
- 是否有 canonical 避免规格筛选产生重复页面

检查项 C2：产品图片
- 主图是否有关键词化的 Alt 标签（"hot-rolled-steel-coil-3mm-china-factory"）
- 是否有多角度图（钢卷截面 / 包装 / 工厂）
- 图片文件大小是否 <200KB（钢材网站常见大图问题）

检查项 C3：结构化数据
- 产品页是否有 Product Schema（name / description / offers）
- 是否有 Organization Schema（含 logo / contactPoint）
- FAQ 内容是否有 FAQPage Schema
```

---

## 输出格式（钢材外贸专项）

在通用审计报告基础上，额外输出：

```
## 询盘转化技术诊断（单独章节）

### RFQ 表单健康分数：X/10
[逐项评分，附具体修复代码示例]

### 移动端询盘路径
[截图描述 + 问题定位 + 修复建议]

## 多语言技术诊断

### hreflang 配置状态
[正确声明列表 + 错误/缺失列表]

### 建议优先补充的语言版本
[基于目标市场的多语言优先级建议]

## 钢材网站专项修复路线图

| 优先级 | 问题 | 预期收益 | 修复难度 | 建议时间 |
|--------|------|---------|---------|---------|
| P0 | RFQ 表单被 robots 屏蔽 | 直接影响询盘转化 | 低 | 立即 |
| P1 | 规格表使用图片 | 规格词无法被索引 | 中 | 1 周内 |
| P2 | 无 hreflang 配置 | 多语言流量损失 | 中 | 1 个月内 |
```
```

---

### 3.4 `steel-link-building/SKILL.md`

```markdown
---
name: steel-link-building
version: "1.0.0"
description: |
  钢材外贸 B2B 外链建设策略。当用户提到钢铁行业目录收录、
  贸易媒体投稿、钢材行业协会外链、买家社区渗透、
  Alibaba/Made-in-China 等平台外链、行业展会相关外链、
  竞品外链分析（针对钢铁行业网站）时，
  必须触发此技能，优先于通用 link-building Skill。
compatibility:
  tools: [web_search]
---

# 钢材外贸外链建设 Skill

## 继承基础

**首先读取并执行** `skills/public/link-building/SKILL.md` 的完整流程。

以下为钢材外贸行业的**领域覆盖规则**。

---

## 钢材行业外链来源分类

读取 `references/steel-directories.md` 后，按以下优先级执行：

### 一类外链（最高价值，优先获取）

| 来源类型 | 具体目标 | 获取难度 | 预期价值 |
|---------|---------|---------|---------|
| 行业贸易媒体 | Steel Times International / Kallanish Steel / Metal Bulletin | 高 | ⭐⭐⭐⭐⭐ |
| 行业协会 | World Steel Association / AISC / SSAB 合作商目录 | 高 | ⭐⭐⭐⭐⭐ |
| 大型 B2B 平台 | Thomasnet / GlobalSpec / Europages | 中 | ⭐⭐⭐⭐ |
| 买家国家商会 | 各国中国商会 / 当地建筑协会目录 | 中 | ⭐⭐⭐⭐ |

### 二类外链（规模化获取）

| 来源类型 | 具体目标 | 获取难度 | 预期价值 |
|---------|---------|---------|---------|
| 钢材目录站 | SteelOrbis / Steelonthenet / Scrap Monster | 低 | ⭐⭐⭐ |
| 国际展会页面 | Metal + Metallurgy China / Blechexpo 参展商页面 | 低 | ⭐⭐⭐ |
| 供应商目录 | Made-in-China / Global Sources 旗舰店外链 | 低 | ⭐⭐ |

### 三类外链（长尾积累）

| 来源类型 | 获取方式 |
|---------|---------|
| 技术论坛 | Engineering Stack Exchange / Reddit r/metalworking 有价值回复 |
| 行业博客 | 向小型钢铁行业 newsletter 投稿技术科普文 |
| 买家市场媒体 | 中东/非洲建筑类媒体的供应商专题 |

---

## 钢材外贸内容外链策略（Link Bait）

以下内容类型在钢材行业具有天然吸引链接的特性：

**高价值可链接内容：**

1. **钢号对照表**（最高链接吸引力）
   - 示例：`GB/ASTM/EN/JIS 钢号完整对照数据库`
   - 原因：工程师和采购商经常需要引用，竞品很少做全
   
2. **港口运费计算工具**
   - 示例：交互式 FOB/CIF 价格估算工具
   - 原因：实用工具类页面自然获得社区分享链接

3. **市场价格趋势报告**（月度/季度）
   - 示例：`Q1 2026 Hot Rolled Coil Price Report – China Export`
   - 原因：行业媒体和研究机构会引用和链接

4. **技术应用指南**
   - 示例：`How to Select Steel Grade for Structural Construction`
   - 原因：工程类网站和教育机构会链接

---

## 外联邮件规范（读取 `references/outreach-templates-en.md`）

钢材行业外联注意事项：
- 对象是编辑/内容总监时，邮件主题禁止包含"link"或"SEO"（易被标记垃圾）
- 强调数据和工程价值，而非商业诉求
- 附上具体的资源页 URL，减少对方的操作成本

---

## 输出格式

```
## 钢材外贸外链建设报告

### 当前外链概况
[来源分布 / DA 分布 / 行业相关性评估]

### 竞品外链差距分析
[与主要竞品的外链数量和质量对比]

### 优先行动清单

#### 本月目标（一类外链，0-30 天）
[具体目标网站 / 联系人查找策略 / 外联模板]

#### 季度目标（二类外链规模化，30-90 天）
[批量提交目录 / 展会参展页申请流程]

#### 长期内容外链计划
[推荐创建的 Link Bait 内容类型 + 创作大纲]
```
```

---

### 3.5 `steel-report-generator/SKILL.md`

```markdown
---
name: steel-report-generator
version: "1.0.0"
description: |
  钢材外贸 SEO 月报和绩效汇报生成。当用户提到生成 SEO 月报、
  询盘来源分析、关键词排名变化、有机流量报告、
  外贸网站 ROI 分析、向老板汇报 SEO 成果、
  季度 SEO 复盘时，必须触发此技能，优先于通用 report-generator Skill。
compatibility:
  tools: [web_search]
---

# 钢材外贸 SEO 月报生成 Skill

## 继承基础

**首先读取并执行** `skills/public/report-generator/SKILL.md` 的完整流程。

以下为钢材外贸业务的**报告结构覆盖规则**。

---

## 钢材外贸 SEO 报告核心指标

读取 `references/kpi-definitions.md`，钢材外贸 SEO 报告必须以询盘为核心，而非流量：

### 一级指标（直接业务价值，必须在首页呈现）

| 指标 | 定义 | 目标方向 |
|------|------|---------|
| 有机询盘数 | 来自 organic search 的 RFQ 表单提交数 | ↑ 越高越好 |
| 有机询盘占比 | 有机询盘 / 总询盘数 | ↑ 目标 >40% |
| 询盘关键词分布 | 带来询盘的 TOP 关键词列表 | 监控集中度风险 |
| 有机流量询盘转化率 | 有机访问 / 有机询盘 | ↑ 行业基准 0.5-2% |

### 二级指标（SEO 过程指标）

| 指标 | 定义 |
|------|------|
| 有机流量总量 | 按买家国家拆分 |
| 关键词排名变化 | TOP 20 目标词的排名变动 |
| 新收录页面数 | 本月新增被 Google 收录的产品页 |
| 外链新增数 | 本月获得的新外链（按来源质量分类）|
| Core Web Vitals | 移动端 LCP / FID / CLS 状态 |

### 三级指标（运营参考）

| 指标 | 定义 |
|------|------|
| 买家国家流量分布 | 按国家统计有机流量占比 |
| 热门产品页排名 | 各产品线 TOP 产品页的排名趋势 |
| 竞品排名对比 | 核心关键词我方 vs 竞品排名变化 |

---

## 钢材外贸月报结构（替换通用报告结构）

```markdown
# [公司名] 钢材外贸 SEO 月报
**报告周期：** [年份] [月份] | **生成时间：** [日期]

---

## 执行摘要（面向管理层，半页以内）

| 核心指标 | 本月 | 上月 | 变化 |
|---------|------|------|------|
| 有机询盘数 | X | X | ▲/▼ X% |
| 有机流量 | X | X | ▲/▼ X% |
| 询盘转化率 | X% | X% | ▲/▼ |
| TOP 询盘词 | [关键词] | - | - |

**本月结论：** [2-3 句，聚焦询盘结果，管理层语言]

---

## 1. 询盘来源深度分析

### 1.1 有机询盘 TOP 关键词
[按询盘数排序的关键词列表，含买家国家信息]

### 1.2 询盘买家国家分布
[饼图数据 + 同比变化分析]

### 1.3 询盘产品分布
[哪些产品页带来了询盘，哪些没有]

---

## 2. 关键词排名报告

### 2.1 目标词排名变化
[TOP 关键词排名矩阵：关键词 / 上月排名 / 本月排名 / 变化]

### 2.2 新进入 TOP 10 的关键词
[机会词识别]

### 2.3 排名下滑预警
[需要关注的排名下滑词及原因分析]

---

## 3. 有机流量分析

### 3.1 总体趋势
[月度有机流量趋势图数据]

### 3.2 买家国家流量
| 国家 | 本月访问 | 上月访问 | 变化 | 询盘转化率 |
|------|---------|---------|------|---------|
| 沙特阿拉伯 | | | | |
| 越南 | | | | |
| 尼日利亚 | | | | |

### 3.3 热门产品页
[按有机流量排序的 TOP 10 产品页，含询盘数]

---

## 4. 内容与外链进展

### 4.1 本月内容产出
[发布的新产品页/博客数量，含目标关键词]

### 4.2 外链建设
[新增外链数 / 来源质量 / 与上月对比]

---

## 5. 技术 SEO 状态
[Core Web Vitals / 收录状态 / 爬取异常]

---

## 6. 下月优先行动

| 优先级 | 行动项 | 预期收益 | 负责人 | Deadline |
|--------|--------|---------|--------|---------|
| P0 | | | | |
| P1 | | | | |
| P2 | | | | |
```

---

## 数据获取指引

当用户没有提供数据时，引导用户提供以下数据源：

```
请提供以下数据以生成月报：

1. Google Search Console 数据（必须）
   - 导出路径：Search Console → 效果 → 导出 CSV
   - 需要字段：查询词 / 点击数 / 展示数 / 排名 / 网页

2. Google Analytics 数据（必须）
   - 需要：有机流量 / 来源国家 / 落地页 / 目标转化（询盘）

3. 询盘数据（必须，来自 CRM 或邮件统计）
   - 本月总询盘数
   - 询盘来源渠道（有机/付费/社交）
   - 询盘产品分布

4. 上月报告（用于对比）
```
```

---

## 四、References 参考文件模板

### 4.1 `steel-keyword-research/references/product-specs-taxonomy.md`

```markdown
# 钢材产品规格分类体系

## 长材类（Long Products）

| 中文名 | 英文名 | 常用规格词 | 主要标准 |
|--------|--------|-----------|---------|
| 螺纹钢 | Deformed Bar / Rebar | 12mm / 16mm / 20mm / 25mm / 32mm | GB1499.2 / ASTM A615 / BS4449 |
| 线材 | Wire Rod | 5.5mm / 6.5mm / 8mm / 10mm / 12mm | GB/T14981 / ASTM A510 |
| 角钢 | Angle Steel / Angle Iron | 25x25 - 200x200mm | GB/T706 / ASTM A36 / EN10056 |
| 工字钢 | I-beam / H-beam | 100mm - 600mm | GB/T11263 / ASTM A992 / EN10034 |
| 槽钢 | Channel Steel | 50mm - 400mm | GB/T706 / ASTM A36 |
| 方钢 | Square Bar | 10mm - 200mm | GB/T702 |
| 圆钢 | Round Bar | 10mm - 300mm | GB/T702 / ASTM A36 |

## 板材类（Flat Products）

| 中文名 | 英文名 | 常用规格词 | 主要标准 |
|--------|--------|-----------|---------|
| 热轧卷板 | Hot Rolled Coil / HR Coil | 2mm-12mm / 1000-2000mm wide | GB/T709 / ASTM A36 / EN10025 |
| 冷轧卷板 | Cold Rolled Coil / CR Coil | 0.3mm-3mm | GB/T709 / ASTM A1008 |
| 镀锌板 | Galvanized Steel Coil / GI Coil | 0.14mm-3mm / Z80-Z275 | GB/T2518 / ASTM A653 |
| 彩涂板 | Color Coated Steel / PPGI | 0.14mm-1.5mm | GB/T12754 / ASTM A755 |
| 中厚板 | Steel Plate | 6mm-200mm | GB/T3274 / ASTM A36 |

## 管材类（Tubular Products）

| 中文名 | 英文名 | 常用规格词 | 主要标准 |
|--------|--------|-----------|---------|
| 无缝钢管 | Seamless Steel Pipe | OD 21-711mm | GB/T8162 / ASTM A106 / API 5L |
| 焊管 | Welded Steel Pipe / ERW Pipe | OD 21-660mm | GB/T13793 / ASTM A53 |
| 方管矩管 | Square / Rectangular Hollow Section | 20x20-400x400mm | GB/T6728 / EN10219 |
| 不锈钢管 | Stainless Steel Pipe | 304 / 316L / 201 | GB/T14976 / ASTM A312 |
```

### 4.2 `steel-keyword-research/references/buyer-country-intent.md`

```markdown
# 钢材买家国家搜索意图地图

## 中东地区

### 沙特阿拉伯
- 主要用途：建筑（Vision 2030 基建项目）/ 石化工业管道
- 高价值关键词：rebar Saudi Arabia / steel pipe Saudi / SASO certified steel
- 搜索偏好：认证 + 大批量 + 长期供应
- 语言：英语（采购部门）/ 阿拉伯语（小贸易商）
- 进口偏好：FOB 中国港口 / 竞争对手：土耳其、乌克兰

### 阿联酋（UAE）
- 主要用途：建筑 / 转口贸易（迪拜是区域分销中心）
- 高价值关键词：steel supplier Dubai / structural steel UAE / steel trading company
- 搜索偏好：快速报价 + 小 MOQ（转口商）/ 大量认证（终端用户）
- 特点：阿联酋买家往往是中间商，需要突出你的转口支持能力

## 东南亚地区

### 越南
- 主要用途：制造业（机械、家具、汽车零部件用钢）/ 建筑
- 高价值关键词：hot rolled steel Vietnam / steel coil manufacturer China / thép cuộn cán nóng
- 搜索偏好：竞争价格 + 稳定供应
- 特点：越南有大量本土钢厂（和发、福山），需要突出价格和规格优势

### 菲律宾
- 主要用途：建筑（rebar 需求大）/ 制造业
- 高价值关键词：rebar Philippines supplier / deformed bar China price / steel bar manufacturer
- 特点：菲律宾进口关税较高，CIF Manila 报价更受欢迎

## 非洲地区

### 尼日利亚
- 主要用途：建筑（rebar / H-beam）/ 工业
- 高价值关键词：steel supplier Nigeria / rebar Lagos / mild steel Nigeria wholesale
- 搜索偏好：价格优先 + 灵活 MOQ + 信用证付款
- 特点：尼日利亚买家对价格极敏感，需要突出 competitive price 和 bulk discount

### 肯尼亚 / 埃塞俄比亚
- 主要用途：基建 / 建筑
- 高价值关键词：steel manufacturer Kenya / structural steel Ethiopia / Chinese steel supplier Africa
- 特点：东非市场增长快，但物流复杂（常用蒙巴萨港中转）
```

---

## 五、部署步骤

### Step 1：创建领域目录

```bash
# 在已有的 seo-skills 项目中执行
mkdir -p skills/private/steel-trade/{steel-keyword-research,steel-content-optimizer,steel-technical-audit,steel-link-building,steel-report-generator}/{references,evals}

# 创建所有 SKILL.md 文件
for skill in steel-keyword-research steel-content-optimizer steel-technical-audit steel-link-building steel-report-generator; do
  touch skills/private/steel-trade/$skill/SKILL.md
  touch skills/private/steel-trade/$skill/evals/evals.json
  touch skills/private/steel-trade/$skill/evals/trigger_evals.json
done

echo "✅ 钢材外贸 Skill 目录创建完成"
```

### Step 2：将 Prompt 填入对应文件

将本文第三节的各 Skill Prompt 内容分别复制到对应的 `SKILL.md` 文件中。

### Step 3：更新 CLAUDE.md

将本文第二节的 Skill 注册配置追加到项目 `CLAUDE.md` 的末尾。

### Step 4：验证触发准确性

在 Claude Code 中测试以下 Prompt，确认正确触发：

```bash
# 应触发 steel-keyword-research（不触发通用）
> 帮我找螺纹钢出口到沙特的关键词

# 应触发 steel-content-optimizer（不触发通用）  
> 优化这个热轧卷板产品页的 SEO

# 应触发 steel-technical-audit（不触发通用）
> 检查我们网站的阿语版本有没有 hreflang 问题

# 不应触发任何钢材 Skill（应触发通用）
> 帮我写一篇关于钢材市场的博客
```

---

## 六、快速验证 Checklist

部署完成后，逐项确认：

```
□ CLAUDE.md 已注册全部 5 个 steel-* Skill
□ CLAUDE.md 已添加钢材优先级触发规则
□ 每个 SKILL.md 文件内容已填入
□ references/ 目录下参考文件已创建
□ 触发测试通过（正例触发 + 负例不误触发）
□ 至少运行 1 次端到端测试（给一个真实产品页走完完整优化流程）
```

---

## 总结

钢材外贸 SEO 的核心逻辑只有一条：**从产品规格词出发，到买家询盘结束**。

本 Skill 体系针对这条链路的每个环节做了领域特化：关键词研究聚焦三元组模型和买家国家意图；内容优化增加了规格表结构化和询盘转化诊断；技术审计重点关注 RFQ 表单和多语言配置；外链建设围绕行业目录和技术内容；月报以询盘而非流量为核心指标。

将这 5 个领域覆盖层 Skill 叠加到通用 SEO Skill 体系上，你就拥有了一套专门为钢材外贸 B2B 场景校准的 AI 工作流基础设施。

---

## 相关文章

- [项目级 SEO Skill 体系构建指南](../seo-skill-project-setup/)
- [SEO 优化 Skill 合集：模板与 Prompt](../seo-skill-collection/)
- [Anthropic Claude Code 官方文档](https://docs.claude.com)
