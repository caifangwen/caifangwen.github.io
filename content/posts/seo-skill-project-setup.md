---
title: "项目级 SEO Skill 体系构建指南：从文件结构到完整工程部署"
date: 2026-03-18T03:15:27+08:00
lastmod: 2026-03-18T03:15:27+08:00
draft: false
tags: ["SEO", "Skill", "Claude Code", "项目工程化", "AI工作流", "文件结构", "提示词工程"]
categories: ["skill"]
description: "完整的项目级 SEO Skill 体系构建教程，涵盖目录结构设计、每个文件的完整内容、CLAUDE.md 配置、evals 测试体系，以及从零搭建到上线的全流程操作手册。"
author: "Claude"
toc: true
---

## 前言

上一篇《[SEO 优化 Skill 合集](../seo-skill-collection/)》给出了 5 个 SEO Skill 的模板。本文专注于**工程部署**：如何将这些 Skill 组织成一个规范的、可维护的、团队可协作的**项目级 Skill 体系**。

完成本文的操作后，你将拥有：

- ✅ 标准化的 SEO Skill 项目目录结构
- ✅ 每个文件的完整内容（可直接复制使用）
- ✅ `CLAUDE.md` 项目入口配置
- ✅ `evals/` 自动化测试体系
- ✅ 多环境管理（public / private / team）
- ✅ 一条命令初始化整个项目

---

## 一、完整目录结构总览

```
seo-skills/
│
├── CLAUDE.md                          ← 项目入口，Claude Code 首先读取
│
├── skills/
│   ├── public/                        ← 可公开分享的通用 Skill
│   │   ├── keyword-research/
│   │   │   ├── SKILL.md
│   │   │   ├── references/
│   │   │   │   ├── intent-taxonomy.md
│   │   │   │   └── keyword-difficulty-guide.md
│   │   │   └── evals/
│   │   │       ├── evals.json
│   │   │       └── trigger_evals.json
│   │   │
│   │   ├── content-optimizer/
│   │   │   ├── SKILL.md
│   │   │   ├── scripts/
│   │   │   │   └── extract_headings.py
│   │   │   ├── references/
│   │   │   │   ├── on-page-checklist.md
│   │   │   │   └── title-tag-formulas.md
│   │   │   └── evals/
│   │   │       ├── evals.json
│   │   │       ├── trigger_evals.json
│   │   │       └── files/
│   │   │           ├── sample-article-1.md
│   │   │           └── sample-article-2.md
│   │   │
│   │   ├── technical-audit/
│   │   │   ├── SKILL.md
│   │   │   ├── scripts/
│   │   │   │   ├── check_robots.py
│   │   │   │   └── validate_sitemap.py
│   │   │   ├── references/
│   │   │   │   ├── cwv-thresholds.md
│   │   │   │   └── redirect-rules.md
│   │   │   └── evals/
│   │   │       └── evals.json
│   │   │
│   │   ├── link-building/
│   │   │   ├── SKILL.md
│   │   │   ├── references/
│   │   │   │   ├── outreach-templates.md
│   │   │   │   └── link-quality-criteria.md
│   │   │   └── evals/
│   │   │       └── evals.json
│   │   │
│   │   └── report-generator/
│   │       ├── SKILL.md
│   │       ├── assets/
│   │       │   └── report-template.md
│   │       └── evals/
│   │           ├── evals.json
│   │           └── files/
│   │               └── sample-data.json
│   │
│   └── private/                       ← 团队内部专属 Skill（不公开）
│       └── brand-guidelines/
│           ├── SKILL.md
│           └── references/
│               └── brand-seo-rules.md
│
├── scripts/
│   ├── init_project.sh                ← 一键初始化脚本
│   ├── run_eval.py                    ← 执行单个 Skill 测试
│   ├── run_all_evals.py               ← 执行全套测试
│   └── package_skill.py               ← 打包分发 Skill
│
├── docs/
│   ├── CONTRIBUTING.md                ← Skill 贡献规范
│   ├── SKILL-TEMPLATE.md              ← 新 Skill 起草模板
│   └── CHANGELOG.md                   ← 版本变更记录
│
└── .github/
    └── workflows/
        └── eval-ci.yml                ← CI 自动测试配置
```

---

## 二、核心文件完整内容

### 2.1 `CLAUDE.md` — 项目总入口

这是 Claude Code 在项目中首先读取的文件，定义了整个 Skill 体系的使用规范。

```markdown
# SEO Skills 项目

## 项目简介

这是一个专为 SEO 工作流设计的 Claude Code Skill 体系，包含 5 个核心 SEO Skill，
覆盖关键词研究、内容优化、技术审计、外链建设和报告生成的完整工作流。

## 可用 Skill 列表

| Skill 名称 | 路径 | 触发场景 |
|------------|------|----------|
| keyword-research | skills/public/keyword-research/ | 关键词挖掘、搜索意图分析 |
| content-optimizer | skills/public/content-optimizer/ | 文章SEO优化、标题改写 |
| technical-audit | skills/public/technical-audit/ | 技术SEO诊断、爬取问题排查 |
| link-building | skills/public/link-building/ | 外链策略、竞品外链分析 |
| report-generator | skills/public/report-generator/ | SEO月报、绩效汇报 |

## 使用规则

1. 执行任何 SEO 相关任务前，**必须先读取对应 SKILL.md**
2. 如果任务涉及多个 Skill，按以下顺序串联：
   - 内容策略类：keyword-research → content-optimizer → report-generator
   - 站点诊断类：technical-audit → report-generator
   - 全站优化类：technical-audit → keyword-research → content-optimizer → report-generator
3. 每次执行完毕，如有明显问题或改进建议，请在对话末尾标注 `[SKILL-FEEDBACK]`

## 环境变量（可选）

```bash
SEO_DEFAULT_LOCALE=zh-CN          # 默认语言和地区
SEO_REPORT_FORMAT=markdown         # 报告输出格式：markdown / docx
SEO_AUDIT_DEPTH=full               # 审计深度：quick / standard / full
```

## 版本信息

- 当前版本：v1.2.0
- 最后更新：2026-03-18
- 维护团队：SEO Engineering Team
```

---

### 2.2 `skills/public/keyword-research/SKILL.md`

```markdown
---
name: keyword-research
version: "1.2.0"
description: |
  执行专业的 SEO 关键词研究与搜索意图分析。当用户提到关键词挖掘、
  词库扩展、搜索量分析、竞争度评估、长尾词发现、用户搜索意图分类时
  必须触发此技能。即使用户只说"帮我找关键词"或"分析一下搜索词"也应触发。
  适用于内容策略规划、新站关键词布局、竞品关键词分析等场景。
compatibility:
  tools: [web_search]
---

# 关键词研究 Skill

## 概述

将 1-5 个种子词扩展为覆盖完整用户旅程的关键词矩阵，并按搜索意图和
漏斗阶段分类，输出可直接用于内容策略的优先级关键词报告。

## 前置条件

开始前确认：
- [ ] 种子词（1-5 个）
- [ ] 目标市场和语言
- [ ] 目标页面类型（首页 / 产品页 / 博客）
- [ ] 是否需要竞品对比

如信息不完整，必须先向用户询问，不得跳过。

## 核心工作流

### 步骤 1：种子词扩展（四象限法）

对每个种子词，必须扩展以下四类：

| 类型 | 定义 | 占比目标 |
|------|------|----------|
| 品牌词 | 包含品牌或产品名 | 10% |
| 产品词 | 直接描述功能/品类 | 30% |
| 信息词 | 用户学习/探索阶段 | 40% |
| 竞品词 | 竞争对手相关 | 20% |

### 步骤 2：搜索意图分类

使用 Google 四大意图模型：
- **Informational**：用户想了解信息（What/How/Why）
- **Navigational**：用户想找特定网站/品牌
- **Commercial**：用户在对比决策（Best/vs/Review）
- **Transactional**：用户准备购买（Buy/Price/Download）

### 步骤 3：漏斗阶段映射

- **TOFU**（认知阶段）→ Informational 意图词
- **MOFU**（考量阶段）→ Commercial 意图词
- **BOFU**（决策阶段）→ Transactional 意图词

### 步骤 4：优先级评分

对每个关键词按以下维度评分（各 1-5 分）：
- 搜索意图明确度
- 内容产出可行性（我方是否有独特价值）
- 商业价值（与转化的相关程度）

综合得分 = (意图明确度 + 可行性 × 2 + 商业价值 × 1.5) / 4.5

### 步骤 5：输出关键词报告

读取 `references/intent-taxonomy.md` 确认分类标准后输出：

```
## 关键词研究报告：[种子词]

### 执行摘要
- 扩展关键词总数：XX 个
- 高优先级词（综合≥4分）：XX 个
- 核心内容机会：[2-3句总结]

### 关键词矩阵

| 关键词 | 类型 | 意图 | 漏斗 | 综合分 | 建议内容形式 |
|--------|------|------|------|--------|-------------|
| ...    | ...  | ...  | ...  | ...    | ...         |

### 高优先级词内容建议
[每个高分词提供具体内容创作方向]
```

## 错误处理

- 种子词过于宽泛（如"软件"）→ 必须询问具体行业和用户群体后再扩展
- 扩展词数量不足 → 检查 `references/keyword-difficulty-guide.md` 的扩展方法
- 竞品词涉及商标 → 标注风险提示，建议用"XX 替代品"替代品牌词
```

---

### 2.3 `skills/public/content-optimizer/SKILL.md`

```markdown
---
name: content-optimizer
version: "1.3.0"
description: |
  对已有文章或草稿进行全面的 SEO 内容优化。当用户提到优化文章、
  改写标题、完善 meta 描述、提升关键词密度、优化内容结构、
  添加 FAQ、内链建议、提升原创性时必须触发此技能。
  用户上传文章或粘贴内容并要求"SEO 优化"时立即触发，
  不得等待更多指令，直接开始 12 项指标诊断。
compatibility:
  tools: [web_search]
---

# 内容 SEO 优化 Skill

## 概述

对任意文章进行 12 项 SEO 指标全面诊断，输出带优先级的优化清单，
并直接提供改写后的标题、Meta、H 结构和 FAQ 内容。

## 前置条件

必须获取后才能开始：
- [ ] 目标主关键词（1 个）
- [ ] 相关词 / LSI 词（2-3 个）
- [ ] 原文内容
- [ ] 目标读者画像（可选，有助于提升相关性）

## 核心工作流

### 步骤 1：SEO 健康诊断（12 项）

逐项检查，标注 ✅（通过）/ ⚠️（需优化）/ ❌（严重问题）：

**标题层（3 项）**
1. H1 含主关键词
2. H1 长度 20-60 字符
3. H2/H3 覆盖相关词和问题词

**Meta 层（2 项）**
4. Title Tag：含主词，50-60 字符
5. Meta Description：含行动召唤，150-160 字符

**内容质量层（4 项）**
6. 关键词首段出现（前 100 字内）
7. 内容深度（字数是否达到竞争水平，参考读取 web_search 结果）
8. FAQ 段落存在且覆盖 PAA（People Also Ask）问题
9. 原创性和独特价值点（是否有竞品没有的内容）

**内部链接层（3 项）**
10. 内链锚文本机会（≥3 处）
11. 图片 Alt 标签含关键词
12. 是否建议添加结构化数据（FAQ Schema / HowTo Schema）

### 步骤 2：执行必改项优化

读取 `references/title-tag-formulas.md`，输出：
- 优化后 Title Tag（3 个备选版本）
- 优化后 Meta Description（2 个备选版本）
- 优化后 H2 结构（完整大纲）

### 步骤 3：生成 FAQ 段落

基于主关键词，搜索"People Also Ask"相关问题，生成 5 个 FAQ 问答，
每个回答 50-100 字，自然融入主关键词和相关词。

### 步骤 4：内链建议

扫描原文，标注 3-5 处适合添加内链的锚文本位置，格式：
```
位置：第X段 "[锚文本]"
建议链接目标：[描述应链接到哪类页面]
理由：[SEO价值说明]
```

### 步骤 5：输出优化总结

```
## 优化完成报告

### 诊断结果
✅ X项通过  ⚠️ X项需优化  ❌ X项严重问题

### 必改清单
[逐项列出改动：原文 → 优化版本 + 改动理由]

### 建议清单
[FAQ内容、内链建议等]

### 预期 SEO 收益
[简要说明优化后的预期排名改善方向]
```

## 注意事项

- 关键词密度控制在 1-2%，**严禁堆砌**
- 保持原文核心论点不变，只优化形式和结构
- 对用户提供的代码块或数据表格，不得修改内容，只优化周边描述
```

---

### 2.4 `skills/public/technical-audit/SKILL.md`

```markdown
---
name: technical-audit
version: "1.1.0"
description: |
  执行网站技术 SEO 全面审计。当用户提到技术SEO检查、网站爬取问题、
  Core Web Vitals、页面速度、robots.txt、sitemap 配置、
  canonical 标签、结构化数据、移动端适配、HTTPS 问题、
  重定向链、404 错误时必须触发此技能。
  用户说"帮我查一下网站技术问题"或"为什么我的页面没有被收录"也应触发。
compatibility:
  tools: [web_search, web_fetch, bash]
---

# 技术 SEO 审计 Skill

## 概述

对目标网站执行系统化技术 SEO 健康检查，输出按严重程度分级的问题清单
和附带代码示例的修复方案，以及 30/60/90 天修复路线图。

## 前置条件

- [ ] 目标网站 URL（必须）
- [ ] 网站类型（企业官网/电商/博客/SaaS）
- [ ] 当前问题描述或审计目的（可选）
- [ ] 重点审计范围（全面/爬取专项/速度专项）

## 审计深度路由

根据 `SEO_AUDIT_DEPTH` 环境变量或用户指定选择：

- `quick`：仅检查可索引性（robots/sitemap/HTTPS），5分钟内完成
- `standard`：可索引性 + 技术健康 + 结构化数据
- `full`：全部审计项 + 竞品对比 + 修复路线图

## 核心审计项（按优先级排序）

### P0 — 可索引性（阻断排名的问题）

使用 `scripts/check_robots.py` 和 `scripts/validate_sitemap.py` 执行后，再手动检查：

1. **robots.txt 状态**
   - 是否存在：`GET /robots.txt`
   - 是否误封重要目录（如 `/product/`, `/blog/`）
   - Sitemap 路径是否在 robots.txt 中声明

2. **XML Sitemap**
   - 格式是否有效（`<urlset>` 标签完整）
   - 最后更新时间是否在 7 天内
   - 是否包含所有重要页面

3. **Noindex 使用**
   - 重要页面是否被误加 `noindex`
   - 分页页面的处理是否合理

4. **Canonical 标签**
   - 是否存在自引用 canonical
   - 跨域 canonical 是否正确

### P1 — 技术健康（影响排名和体验）

5. **HTTPS 完整性**（混合内容检查）
6. **移动端适配**（`<meta name="viewport">` / 响应式）
7. **重定向链**（超过 2 跳标记为问题）
8. **Core Web Vitals 参考值**（读取 `references/cwv-thresholds.md`）
   - LCP < 2.5s ✅ / 2.5-4s ⚠️ / >4s ❌
   - CLS < 0.1 ✅ / 0.1-0.25 ⚠️ / >0.25 ❌
   - INP < 200ms ✅ / 200-500ms ⚠️ / >500ms ❌

### P2 — 结构化数据

9. 检查现有 Schema 类型和 JSON-LD 格式
10. 根据网站类型推荐适合的 Schema（参考下表）

| 网站类型 | 推荐 Schema |
|----------|-------------|
| 博客/媒体 | Article, BreadcrumbList, FAQPage |
| 电商 | Product, Review, BreadcrumbList |
| SaaS | SoftwareApplication, FAQPage, HowTo |
| 本地商户 | LocalBusiness, Review |

## 输出格式

```
## 技术 SEO 审计报告：[网站URL]

**审计时间**：[日期]
**审计深度**：[quick/standard/full]

### 执行摘要
发现 🔴X 个紧急问题 / 🟡X 个优化建议 / 🟢X 项最佳实践

---

### 🔴 紧急修复（影响索引或排名）

#### 问题 1：[问题名称]
- **影响**：[对SEO的具体影响]
- **发现**：[具体的问题现象]
- **修复方案**：
  ```[代码或配置示例]```
- **预估工时**：[X小时]

### 🟡 优化建议

[同上格式]

### 🟢 最佳实践（已通过）

[简单列举通过的检查项]

---

### 修复优先级路线图

| 阶段 | 时间 | 行动项 | 预期收益 |
|------|------|--------|----------|
| 第一阶段 | 第1-30天 | [P0问题] | 恢复索引/排名 |
| 第二阶段 | 第31-60天 | [P1问题] | 提升CWV评分 |
| 第三阶段 | 第61-90天 | [P2问题] | 丰富富媒体结果 |
```
```

---

### 2.5 `skills/public/report-generator/SKILL.md`

```markdown
---
name: report-generator
version: "1.0.2"
description: |
  生成专业的 SEO 分析报告（Markdown 或 Word 格式）。
  当用户提到生成 SEO 月报、季报、年报、竞品分析报告、
  流量分析、关键词排名报告、SEO 复盘时必须触发此技能。
  用户提供数据并说"帮我整理成报告"或"生成汇报材料"也应触发。
compatibility:
  tools: [bash]
---

# SEO 报告生成 Skill

## 报告类型路由

| 用户描述关键词 | 报告类型 | 模板路径 |
|--------------|----------|----------|
| 月报/季报/年报 | 定期绩效报告 | assets/report-template.md |
| 竞品/对手 | 竞品 SEO 分析报告 | 动态生成 |
| 流量下降/诊断 | 问题诊断报告 | 动态生成 |
| 新站/上线 | SEO 启动评估报告 | 动态生成 |

## 定期绩效报告工作流

### 步骤 1：数据接收与校验

接收用户提供的数据，检查以下字段是否完整：
- 自然流量（本期 + 上期）
- 关键词排名变化
- 核心页面表现
- 技术问题处理情况

缺失字段时，标注 `[数据缺失]` 并给出代替说明，不得跳过该模块。

### 步骤 2：数据洞察提炼

不只是搬运数字——必须提供解读：
- 流量变化的**原因假设**（不只是"增长了X%"）
- 关键词排名变化与**内容动作**的关联
- 技术修复与**流量恢复**的对应关系

### 步骤 3：受众适配

根据 `SEO_REPORT_FORMAT` 和用户指定的受众调整输出：

- **技术团队版**：包含详细数据、工具截图引用、技术术语
- **管理层版**：精简为 1 页执行摘要 + 核心 KPI + 下期计划
- **客户汇报版**：添加"行业对比"语境，突出投资回报

### 步骤 4：生成报告

读取 `assets/report-template.md` 作为结构基础，填充数据和洞察。

## 输出规范

- Markdown 格式，含清晰的 H2/H3 层级
- 核心数据用表格呈现
- 每个模块末尾有"本期结论"1-2 句
- 报告末尾必须有"下期优先行动"（3 项，含负责人和 deadline 占位符）
```

---

### 2.6 `skills/public/content-optimizer/references/on-page-checklist.md`

```markdown
# On-Page SEO 完整检查清单

## Title Tag 最佳实践

- 长度：50-60 字符（中文约 25-30 个汉字）
- 结构模板：`[主关键词] - [修饰词] | [品牌名]`
- 禁止：全大写、堆砌关键词、超过 70 字符
- 主关键词必须出现在前 30 字符内

## Meta Description

- 长度：150-160 字符
- 必须包含：主关键词 + 行动召唤（了解更多/立即体验/免费试用）
- 不影响排名，但影响点击率（CTR）

## H 标签层级规范

```
H1（仅一个）：页面主题，含主关键词
  H2（3-7个）：主要章节，含相关词
    H3（按需）：子章节，含长尾词和问题词
```

## 关键词分布最佳位置

1. 文章前 100 字内（自然出现）
2. 至少一个 H2 标题中
3. 图片 Alt 标签
4. 文章结尾段落
5. URL slug（拼音或英文）

## 内容深度参考标准

| 内容类型 | 建议字数 |
|----------|----------|
| 信息类博客 | 1500-2500 字 |
| 终极指南 | 3000-5000 字 |
| 产品页 | 800-1200 字 |
| 落地页 | 500-800 字 |

## FAQ Schema 触发条件

当文章中包含以下结构时，建议添加 FAQ Schema：

```html
<div itemscope itemtype="https://schema.org/FAQPage">
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">问题文本</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">答案文本</p>
    </div>
  </div>
</div>
```
```

---

### 2.7 `evals/evals.json` — 内容优化 Skill 测试用例

```json
{
  "skill_name": "content-optimizer",
  "version": "1.3.0",
  "evals": [
    {
      "id": 1,
      "description": "标准文章优化",
      "prompt": "请优化这篇文章，主关键词是'在线项目管理软件'，相关词是'团队协作工具'和'项目追踪'",
      "files": ["evals/files/sample-article-1.md"],
      "expectations": [
        "输出了优化后的 Title Tag，长度在 50-60 字符之间",
        "Title Tag 包含主关键词'在线项目管理软件'",
        "输出了优化后的 Meta Description，长度在 150-160 字符之间",
        "Meta Description 包含行动召唤词",
        "提供了完整的 H2 结构优化建议（不少于 3 个 H2）",
        "生成了 3-5 个 FAQ 问答",
        "给出了 3 处以上内链锚文本建议",
        "未出现关键词堆砌问题",
        "12 项诊断清单全部输出，每项有 ✅/⚠️/❌ 标注"
      ]
    },
    {
      "id": 2,
      "description": "短文章深度优化",
      "prompt": "这篇文章只有 800 字，关键词是'远程办公工具'，帮我优化并建议扩展方向",
      "files": ["evals/files/sample-article-2.md"],
      "expectations": [
        "识别出内容深度不足问题并标注 ❌",
        "提供了具体的内容扩展建议（不少于 3 个扩展方向）",
        "给出了扩展后预估字数建议",
        "输出了优化后的标题和 Meta"
      ]
    },
    {
      "id": 3,
      "description": "触发准确性测试 — 不应触发",
      "prompt": "帮我写一篇关于远程办公工具的文章",
      "expectations": [
        "识别这是内容创作请求而非优化请求",
        "不触发 content-optimizer Skill",
        "直接创作文章或询问创作需求"
      ]
    }
  ]
}
```

---

### 2.8 `evals/trigger_evals.json` — 触发准确性测试

```json
{
  "skill_name": "content-optimizer",
  "description": "测试触发描述的准确性，确保正确触发且不误触发",
  "evals": [
    { "prompt": "帮我优化这篇文章的 SEO", "should_trigger": true },
    { "prompt": "这篇文章的标题怎么改才能让搜索引擎更容易找到", "should_trigger": true },
    { "prompt": "帮我检查文章的关键词密度是否合适", "should_trigger": true },
    { "prompt": "给这篇文章加一些 FAQ", "should_trigger": true },
    { "prompt": "文章的内链应该怎么加", "should_trigger": true },
    { "prompt": "帮我写一篇新文章", "should_trigger": false },
    { "prompt": "总结一下这篇文章的主要观点", "should_trigger": false },
    { "prompt": "把这篇文章翻译成英文", "should_trigger": false },
    { "prompt": "分析一下这个网站的技术问题", "should_trigger": false },
    { "prompt": "帮我做关键词研究", "should_trigger": false }
  ]
}
```

---

### 2.9 `scripts/init_project.sh` — 一键初始化脚本

```bash
#!/bin/bash

# SEO Skills 项目初始化脚本
# 使用方法：bash scripts/init_project.sh [项目名称]

PROJECT_NAME=${1:-"seo-skills"}
echo "🚀 初始化 SEO Skill 项目：$PROJECT_NAME"

# 创建完整目录结构
mkdir -p $PROJECT_NAME/{skills/{public/{keyword-research,content-optimizer,technical-audit,link-building,report-generator}/{references,evals/files,scripts,assets},private/brand-guidelines/references},scripts,docs,.github/workflows}

# 创建占位文件
SKILLS=("keyword-research" "content-optimizer" "technical-audit" "link-building" "report-generator")

for skill in "${SKILLS[@]}"; do
  touch "$PROJECT_NAME/skills/public/$skill/SKILL.md"
  touch "$PROJECT_NAME/skills/public/$skill/evals/evals.json"
  touch "$PROJECT_NAME/skills/public/$skill/evals/trigger_evals.json"
  echo "  ✅ 创建 $skill Skill 目录"
done

# 创建 CLAUDE.md
cat > "$PROJECT_NAME/CLAUDE.md" << 'EOF'
# SEO Skills 项目
## 可用 Skill
请参考 skills/public/ 目录下的各 Skill，执行任务前必须先读取对应 SKILL.md。
EOF

# 创建 .gitignore
cat > "$PROJECT_NAME/.gitignore" << 'EOF'
skills/private/
*.env
.DS_Store
__pycache__/
*.pyc
grading_results/
EOF

echo ""
echo "✅ 项目初始化完成！目录结构："
find $PROJECT_NAME -type f | head -40
echo ""
echo "📝 下一步："
echo "  1. 将各 SKILL.md 模板内容填入对应文件"
echo "  2. 配置 CLAUDE.md 项目入口"
echo "  3. 编写 evals/evals.json 测试用例"
echo "  4. 运行 python scripts/run_all_evals.py 验证"
```

---

### 2.10 `.github/workflows/eval-ci.yml` — CI 自动测试

```yaml
name: SEO Skills Eval CI

on:
  push:
    paths:
      - 'skills/**'
  pull_request:
    paths:
      - 'skills/**'

jobs:
  trigger-eval:
    name: 触发准确性测试
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 设置 Python 环境
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: 安装依赖
        run: pip install anthropic

      - name: 运行触发测试
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          python scripts/run_all_evals.py \
            --type trigger \
            --skills-path skills/public \
            --threshold 0.85 \
            --output ci_results.json

      - name: 上传测试结果
        uses: actions/upload-artifact@v4
        with:
          name: eval-results
          path: ci_results.json
```

---

## 三、部署操作流程

### Step 1：克隆并初始化

```bash
# 方式 A：使用初始化脚本（推荐）
git clone https://github.com/your-org/seo-skills.git
cd seo-skills
bash scripts/init_project.sh

# 方式 B：手动克隆现有项目
git clone https://github.com/your-org/seo-skills.git
cd seo-skills
```

### Step 2：在 Claude Code 中打开

```bash
# 在项目根目录启动 Claude Code
cd seo-skills
claude
```

Claude Code 会自动读取根目录的 `CLAUDE.md`，加载 Skill 注册信息。

### Step 3：执行第一个 SEO 任务

在 Claude Code 中输入：

```
请帮我分析以下文章并进行 SEO 优化。
主关键词：[你的关键词]
[粘贴文章内容]
```

Claude Code 会自动：
1. 识别这是内容优化任务
2. 读取 `skills/public/content-optimizer/SKILL.md`
3. 读取 `references/on-page-checklist.md`
4. 按照 12 项诊断 → 优化输出的流程执行

### Step 4：运行测试验证

```bash
# 测试单个 Skill
python scripts/run_eval.py \
  --skill content-optimizer \
  --eval-file skills/public/content-optimizer/evals/evals.json

# 测试全部 Skill
python scripts/run_all_evals.py --output results/$(date +%Y%m%d).json

# 查看 benchmark 对比（有 Skill vs 无 Skill）
python scripts/run_all_evals.py --benchmark --verbose
```

---

## 四、团队协作规范

### 新增 Skill 流程

```
1. 复制 docs/SKILL-TEMPLATE.md 到 skills/public/[新skill名]/SKILL.md
2. 填写 SKILL.md 内容（重点：description 触发描述）
3. 编写 evals/evals.json（最少 5 个测试用例）
4. 编写 evals/trigger_evals.json（正例≥6，负例≥4）
5. 本地运行：python scripts/run_eval.py --skill [新skill名]
6. 确认 pass_rate ≥ 0.80 后提交 PR
7. CI 自动运行触发测试，通过后合并
```

### Skill 版本管理约定

遵循语义化版本（SemVer）：

| 变更类型 | 版本升级 | 示例 |
|----------|----------|------|
| 修复错误/措辞 | Patch（x.x.**1**） | 修正拼写、调整描述 |
| 新增步骤/功能 | Minor（x.**1**.0） | 新增 FAQ 生成步骤 |
| 重构工作流 | Major（**2**.0.0） | 输出格式完全重构 |

### PR 检查清单

```
□ SKILL.md 的 version 字段已更新
□ CHANGELOG.md 已记录变更内容
□ evals.json 覆盖新功能的测试用例
□ 本地 pass_rate ≥ 0.80
□ 触发测试准确率 ≥ 0.85
□ description 中无敏感信息或内部业务细节
```

---

## 五、常见问题排查

**Q：Claude Code 没有自动触发对应 Skill**

检查步骤：
1. 确认 `CLAUDE.md` 在项目根目录
2. 确认 Skill 在 `CLAUDE.md` 的 Skill 列表中注册
3. 检查 `SKILL.md` 的 `description` 是否包含用户使用的关键词
4. 运行 `trigger_evals.json` 测试，查看当前触发准确率

**Q：Skill 执行结果质量不稳定**

优化方向：
1. 在工作流步骤中将"建议"改为"必须"/"始终"
2. 为关键步骤添加输出格式模板（减少随机性）
3. 增加"自我检查"指令（"输出前确认已包含以下要素..."）
4. 将过长的 SKILL.md 拆分，核心工作流保持在 200 行内

**Q：多个 Skill 同时触发产生冲突**

在 `CLAUDE.md` 中添加优先级规则：
```markdown
## Skill 冲突处理规则
- 同时匹配 content-optimizer 和 report-generator → 优先 content-optimizer
- 用户明确说"生成报告" → 强制触发 report-generator
```

---

## 总结

项目级 SEO Skill 体系的核心价值在于**可维护性**和**可扩展性**：

每个 Skill 独立封装、独立测试、独立版本管理，团队成员可以并行开发不同 Skill，而不会相互干扰。`CLAUDE.md` 作为统一入口，`evals/` 作为质量保障，`scripts/` 作为自动化工具——这三者构成了一个可持续演进的 AI 工作流基础设施。

当 SEO 工作流中 80% 的重复性操作被 Skill 体系接管，SEO 从业者就能将精力集中在真正需要人类判断的 20%：策略决策、创意方向和业务洞察。

---

## 相关文章

- [如何构建 AI Skill 体系](../how-to-build-skill-system/)
- [SEO 优化 Skill 合集：模板与 Prompt](../seo-skill-collection/)
- [Anthropic Claude Code 官方文档](https://docs.claude.com)
