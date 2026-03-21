---
title: "WordPress ToB 外贸网站 SEO 优化 SOP：SEO Skills 完整使用指南"
date: 2026-03-18T03:30:00+08:00
draft: false
tags: ["SEO", "WordPress", "ToB", "外贸", "SOP", "操作手册"]
categories: ["skill"]
description: "WordPress ToB 外贸网站 SEO 优化标准作业程序，详细说明每个阶段使用哪个 SEO Skill、具体操作步骤、预期产出和时间规划。"
author: "SEO Team"
toc: true
---

## 概述

本文档为 WordPress ToB 外贸网站提供完整的 SEO 优化 SOP，明确说明在每个阶段如何使用 SEO Skills 项目中的技能。

### 适用对象

- WordPress 网站管理员
- ToB 外贸企业营销人员
- SEO 初学者

### 预计周期

| 阶段 | 时间 | 主要 Skill |
|------|------|-----------|
| 技术审计 | 第 1-2 周 | technical-audit |
| 关键词研究 | 第 2-3 周 | keyword-research |
| 页面优化 | 第 3-6 周 | content-optimizer |
| 外链建设 | 第 6 周起 | link-building |
| 报告监控 | 持续 | report-generator |

---

## 阶段一：技术 SEO 审计（第 1-2 周）

### 目标

完成网站技术健康检查，修复所有 P0/P1 级别问题。

### 使用 Skill

```
📍 skills/public/technical-audit/
```

### 操作步骤

#### Step 1.1：初始化审计

**触发时机**: 项目启动第 1 天

**输入给 Claude Code**:

```
请对以下 WordPress 网站进行技术 SEO 审计：

网站 URL: https://yourdomain.com
网站类型：WordPress ToB 外贸网站
目标市场：北美、欧洲

请使用 technical-audit skill 进行全面检查，重点关注：
1. 爬取与索引问题
2. 页面速度/Core Web Vitals
3. 移动端兼容性
4. WordPress 特有问题（固定链接、插件冲突等）
```

**预期产出**:

- 技术问题清单（按优先级排序）
- Core Web Vitals 当前基线数据
- 修复建议和时间估算

---

#### Step 1.2：robots.txt 和 sitemap 检查

**触发时机**: 第 1-3 天

**输入给 Claude Code**:

```
请使用 technical-audit skill 检查以下 WordPress 网站的 robots.txt 和 sitemap：

网站：https://yourdomain.com
sitemap URL: https://yourdomain.com/sitemap_index.xml

检查项目：
1. robots.txt 是否阻止重要页面
2. sitemap 是否包含所有产品页
3. 是否有重复或错误的 URL
```

**或使用脚本**:

```bash
# 在项目目录下运行
python scripts/check_robots.py https://yourdomain.com
python scripts/validate_sitemap.py sitemap.xml
```

**预期产出**:

- robots.txt 问题报告
- sitemap 验证结果
- 修复代码片段

---

#### Step 1.3：WordPress 插件配置审计

**触发时机**: 第 3-5 天

**输入给 Claude Code**:

```
请根据 technical-audit skill 的参考文档，检查我的 WordPress SEO 插件配置：

已安装插件：
- Rank Math SEO v2.0
- WP Rocket v3.15
- Smush v3.14

请提供：
1. Rank Math 最佳配置建议
2. WP Rocket 速度优化设置
3. 必须启用的功能清单
```

**预期产出**:

- 插件配置截图参考
- 推荐设置清单
- 需要避免的插件冲突

---

#### Step 1.4：修复验证

**触发时机**: 第 7-10 天（修复完成后）

**输入给 Claude Code**:

```
已完成以下技术 SEO 修复，请验证是否充分：

1. 修复了 15 个 404 错误（已添加 301 重定向）
2. 压缩了所有产品图片（平均减少 60% 体积）
3. 启用了 WP Rocket 缓存
4. 添加了 Schema 标记

请根据 technical-audit skill 的标准，评估修复质量并指出遗漏项。
```

**预期产出**:

- 修复验证报告
- 遗漏问题清单
- 是否可以进入下一阶段的判断

---

### 阶段一检查清单

```
□ 完成技术审计报告
□ 修复所有 P0 问题（404、重定向链、HTTPS 问题）
□ 修复 80% 以上 P1 问题
□ Google Search Console 无严重错误
□ Core Web Vitals 至少达到"需要改进"水平
□ XML sitemap 已提交并索引
```

---

## 阶段二：关键词研究（第 2-3 周）

### 目标

建立完整的 ToB 外贸关键词库，覆盖产品词、行业词、问题词。

### 使用 Skill

```
📍 skills/public/keyword-research/
```

### 操作步骤

#### Step 2.1：种子关键词收集

**触发时机**: 第 8-10 天

**输入给 Claude Code**:

```
请使用 keyword-research skill 为我的 ToB 外贸网站进行关键词研究：

产品信息：
- 主要产品：工业阀门（Industrial Valves）
- 目标客户：石油、化工、水处理行业采购商
- 目标市场：美国、德国、澳大利亚
- 竞争优势：ISO 认证、15 年经验、OEM 服务

种子关键词：
industrial valve, gate valve, ball valve, valve manufacturer China

请输出：
1. 至少 50 个相关关键词
2. 每个词的搜索意图分类
3. 初步优先级排序（P0/P1/P2）
```

**预期产出**:

| 关键词 | 月搜索量 | 难度 | 意图 | 优先级 |
|--------|----------|------|------|--------|
| industrial valve manufacturer | 2000 | 65 | 交易型 | P0 |
| gate valve supplier | 800 | 45 | 交易型 | P0 |
| ... | ... | ... | ... | ... |

---

#### Step 2.2：搜索意图深度分析

**触发时机**: 第 10-12 天

**输入给 Claude Code**:

```
请根据 keyword-research skill 的 intent-taxonomy 文档，分析以下关键词的搜索意图：

关键词列表：
- how to choose industrial valve
- industrial valve price list
- best valve manufacturers 2024
- valve maintenance guide
- OEM valve factory China

对于每个词，请说明：
1. 主导意图类型（导航/信息/交易/商业调查）
2. SERP 特征（是否有广告、精选摘要等）
3. 推荐的内容类型（产品页/博客/对比页）
```

**预期产出**:

- 意图分类表格
- 内容类型映射
- 页面规划建议

---

#### Step 2.3：关键词难度评估

**触发时机**: 第 12-14 天

**输入给 Claude Code**:

```
请使用 keyword-research skill 的 keyword-difficulty-guide，评估以下关键词的进入难度：

目标关键词：industrial valve manufacturer
当前网站状态：
- 域名年龄：2 年
- 现有外链：约 100 个
- DA/DR 估计：25-30
- 内容量：50 个产品页，10 篇博客

请分析：
1. 该词的 SERP 竞争度
2. 进入 TOP 10 的可行性
3. 预计需要的时间和资源
4. 推荐的长尾替代词
```

**预期产出**:

- 难度评分（1-100）
- 竞争分析
- 进入策略和时间线

---

#### Step 2.4：关键词分组和页面映射

**触发时机**: 第 14-16 天

**输入给 Claude Code**:

```
请将以下关键词按主题聚类，并映射到网站页面：

[粘贴 Step 2.1 输出的关键词列表]

网站现有页面结构：
- 首页
- 产品分类页（5 个类别）
- 产品详情页（50 个产品）
- 博客
- 关于我们
- 联系

请输出：
1. 关键词分组（每组 5-15 个相关词）
2. 每组对应的目标页面
3. 需要新建的页面建议
```

**预期产出**:

| 关键词组 | 核心词 | 目标页面 | 优先级 |
|----------|--------|----------|--------|
| 闸阀系列 | gate valve | /products/gate-valves/ | P0 |
| 球阀系列 | ball valve | /products/ball-valves/ | P0 |
| 行业解决方案 | valve for oil gas | /solutions/oil-gas/ | P1 |

---

### 阶段二检查清单

```
□ 完成至少 50 个关键词研究
□ 所有关键词完成意图分类
□ 完成关键词难度评估
□ 关键词分组和页面映射完成
□ 确定 P0 级核心关键词（5-10 个）
```

---

## 阶段三：页面 SEO 优化（第 3-6 周）

### 目标

完成核心页面的 On-Page SEO 优化，确保每页符合 SEO 最佳实践。

### 使用 Skill

```
📍 skills/public/content-optimizer/
```

### 操作步骤

#### Step 3.1：首页优化

**触发时机**: 第 15-18 天

**输入给 Claude Code**:

```
请使用 content-optimizer skill 优化我的 WordPress 网站首页：

当前首页内容：
[粘贴首页完整内容，包括 Title、Meta Description、H1-H6、正文]

目标关键词：industrial valve manufacturer, China valve supplier
次要关键词：OEM valve, custom valve manufacturing

请提供：
1. Title Tag 优化建议（3-5 个备选）
2. Meta Description 优化建议（2-3 个备选）
3. H1-H6 结构优化
4. 关键词分布建议
5. 内链添加建议
```

**或使用脚本**:

```bash
# 提取当前标题结构
python scripts/extract_headings.py homepage.md
```

**预期产出**:

```markdown
## 优化建议

### Title Tag（推荐）
原标题：Home - Your Company
优化后：Industrial Valve Manufacturer & Supplier | OEM Services | YourCompany

### Meta Description（推荐）
原描述：Welcome to our company.
优化后：15+ years industrial valve manufacturer. ISO certified, OEM/ODM services. 
        Serving oil & gas, water treatment industries. Get free quote today!

### H1 优化
原 H1: Welcome
新 H1: Professional Industrial Valve Manufacturer Since 2010
```

---

#### Step 3.2：产品分类页优化

**触发时机**: 第 18-25 天

**输入给 Claude Code**:

```
请使用 content-optimizer skill 优化产品分类页：

页面 URL: /products/gate-valves/
当前内容：
[粘贴完整内容]

目标关键词：gate valve supplier, industrial gate valves
参考 on-page-checklist.md 完成全面优化

请输出：
1. 完整的 On-Page 检查报告
2. 按优先级排序的修改建议
3. 具体的内容改写示例
```

**预期产出**:

| 元素 | 当前状态 | 建议修改 | 优先级 |
|------|----------|----------|--------|
| Title | 缺少关键词 | Industrial Gate Valves \| Supplier & Manufacturer | P0 |
| H1 | 过于简单 | Industrial Gate Valve Supplier | P0 |
| 内容长度 | 150 字 | 扩展至 500+ 字 | P1 |
| 图片 ALT | 缺失 | 添加描述性 ALT | P1 |

---

#### Step 3.3：产品详情页批量优化

**触发时机**: 第 25-35 天

**输入给 Claude Code**:

```
我有 50 个产品详情页需要优化，请根据 content-optimizer skill 提供批量优化方案：

产品信息示例：
- 产品名称：Cast Steel Gate Valve
- 规格：DN50-DN500, PN16-PN25
- 应用：石油、化工、水处理

请提供：
1. 产品页 SEO 模板（可复用）
2. Title/Meta 公式
3. 产品描述结构
4. 技术规格表格式
5. FAQ 建议
```

**预期产出**:

```markdown
## 产品页 SEO 模板

### Title 公式
[产品名称] \| [核心规格] \| [应用行业] \| [公司名]

### 内容结构
1. 产品概述（100 字，包含关键词）
2. 技术规格表
3. 应用场景
4. 认证和质量保证
5. FAQ（3-5 个问题）
6. 询价 CTA
```

---

#### Step 3.4：博客文章优化

**触发时机**: 第 30-40 天

**输入给 Claude Code**:

```
请优化以下博客文章的 SEO：

文章主题：How to Choose the Right Industrial Valve
当前内容：
[粘贴文章内容]

目标关键词：how to choose industrial valve, valve selection guide

请使用 content-optimizer skill 的 title-tag-formulas.md 生成 5 个标题选项，
并优化全文结构。
```

**预期产出**:

- 5 个 Title 备选
- 优化后的文章结构
- 内链建议（链接到产品页）

---

### 阶段三检查清单

```
□ 首页优化完成
□ 5 个产品分类页优化完成
□ 50 个产品详情页优化完成（至少 80%）
□ 发布 5 篇优化后的博客文章
□ 所有页面 Title/Meta 符合长度要求
□ 所有图片添加 ALT 文本
□ 内链结构合理
```

---

## 阶段四：外链建设（第 6 周起）

### 目标

建立高质量外链组合，提升域名权威度。

### 使用 Skill

```
📍 skills/public/link-building/
```

### 操作步骤

#### Step 4.1：外链策略制定

**触发时机**: 第 40-45 天

**输入给 Claude Code**:

```
请使用 link-building skill 为我的 ToB 外贸网站制定外链策略：

网站信息：
- 行业：工业阀门制造
- 域名年龄：2 年
- 当前 DA：28
- 当前外链：约 100 个
- 目标市场：美国、欧洲
- 预算：有限（主要靠自然获取）

请输出：
1. 外链建设优先级策略
2. 可执行的外链类型和比例
3. 3 个月执行计划
```

**预期产出**:

| 外链类型 | 目标数量 | 优先级 | 预计时间 |
|----------|----------|--------|----------|
| 行业目录 | 20 个 | P0 | 2 周 |
| 客户网站链接 | 10 个 | P0 | 4 周 |
| 客座博客 | 5 篇 | P1 | 6 周 |
| 新闻稿 | 2 篇 | P1 | 4 周 |

---

#### Step 4.2：竞品外链分析

**触发时机**: 第 45-50 天

**输入给 Claude Code**:

```
请使用 link-building skill 分析竞品外链并找出可复制机会：

主要竞品：
- competitor-a.com（DA 45，外链 3000+）
- competitor-b.com（DA 38，外链 1500+）

请分析：
1. 竞品外链来源类型
2. 可复制的外链机会
3. 优先级排序
```

**预期产出**:

- 竞品外链来源分析
- 可复制外链列表（带联系方式）
- 外展优先级

---

#### Step 4.3：外展邮件撰写

**触发时机**: 第 50-60 天

**输入给 Claude Code**:

```
请使用 link-building skill 的 outreach-templates.md，帮我撰写外展邮件：

外展类型：行业目录提交
目标网站：ThomasNet.com
我的网站：yourdomain.com
公司简介：[粘贴公司简介]

请生成：
1. 个性化的外展邮件
2. 跟进邮件模板
3. 备选方案
```

**预期产出**:

```markdown
## 外展邮件模板

主题：Industrial Valve Manufacturer Listing Request - YourCompany

Hi ThomasNet Team,

I'm [Name] from YourCompany, a professional industrial valve manufacturer 
based in China with 15+ years of experience...

[完整邮件内容]
```

---

#### Step 4.4：外链质量评估

**触发时机**: 持续进行

**输入给 Claude Code**:

```
请评估以下外链机会的质量：

网站：industrydirectory.com
- DA: 45
- 域名年龄：8 年
- 月流量：50,000
- 相关性：高（同行业）
- 链接类型：dofollow，目录列表
- 费用：免费

请使用 link-quality-criteria.md 进行综合评估。
```

**预期产出**:

- 质量评分（1-10）
- 建议（获取/放弃）
- 风险评估

---

### 阶段四检查清单

```
□ 完成外链策略制定
□ 提交至少 20 个行业目录
□ 获取 10+ 个高质量外链
□ 发布 2-3 篇客座博客
□ 建立外链追踪表格
□ 月均新增外链 10+ 个
```

---

## 阶段五：报告与监控（持续）

### 目标

建立月度报告机制，持续追踪 SEO 效果并优化。

### 使用 Skill

```
📍 skills/public/report-generator/
```

### 操作步骤

#### Step 5.1：月度 SEO 报告

**触发时机**: 每月第 1 周

**输入给 Claude Code**:

```
请使用 report-generator skill 生成月度 SEO 报告：

报告期间：2024 年 3 月
数据来源：
- Google Search Console: 有机会话 15,000（上月 12,000）
- Google Analytics: 有机用户 12,000，转化 150 个
- 关键词排名：TOP 10 关键词 45 个（上月 38 个）
- 外链：新增 12 个，流失 3 个

主要成就：
- 流量增长 25%
- 3 个核心词进入 TOP 5
- 获得 ThomasNet 高质量外链

主要问题：
- 部分产品页 LCP 超过 3 秒

受众：公司管理层

请生成完整的月度报告。
```

**预期产出**:

- 执行摘要
- 核心指标表格
- 流量和排名趋势
- 问题和建议
- 下月计划

---

#### Step 5.2：季度深度分析

**触发时机**: 每季度末

**输入给 Claude Code**:

```
请生成季度 SEO 深度分析报告：

季度：2024 Q1
对比周期：2023 Q4

数据汇总：
[粘贴 3 个月的数据]

请分析：
1. 季度趋势和模式
2. 与竞品的差距变化
3. ROI 分析
4. 下季度战略建议
```

**预期产出**:

- 季度趋势分析
- 竞品对比更新
- 投资回报率计算
- 战略调整建议

---

### 阶段五检查清单

```
□ 每月第 1 周生成上月报告
□ 报告发送给管理层/客户
□ 根据报告调整优化策略
□ 每季度进行深度分析
□ 年度总结报告
```

---

## 附录：完整时间线

```
第 1-2 周  │████████│ 技术审计（technical-audit）
第 2-3 周  │████████│ 关键词研究（keyword-research）
第 3-6 周  │████████████████│ 页面优化（content-optimizer）
第 6 周起  │████████████████...│ 外链建设（link-building）
持续     │...│ 报告监控（report-generator）
```

---

## 附录：Skill 快速参考卡

| 阶段 | Skill | 触发词 | 产出 |
|------|-------|--------|------|
| 技术审计 | technical-audit | "技术 SEO 审计"、"网站健康检查" | 问题清单 + 修复建议 |
| 关键词研究 | keyword-research | "关键词研究"、"搜索意图分析" | 关键词库 + 分组 |
| 页面优化 | content-optimizer | "优化这篇文章"、"SEO 优化内容" | 优化建议 + 改写示例 |
| 外链建设 | link-building | "外链策略"、"外展邮件" | 策略 + 模板 |
| 报告生成 | report-generator | "生成 SEO 报告"、"月度报告" | 完整报告 |

---

## 附录：常见问题

### Q1: 每个阶段必须按顺序进行吗？

**A**: 建议按顺序，因为后一阶段依赖前一阶段的产出。但技术修复和关键词研究可以并行。

### Q2: 如何判断可以进入下一阶段？

**A**: 完成该阶段的检查清单 80% 以上即可进入。

### Q3: 一个人能完成所有工作吗？

**A**: 可以，但建议：
- 技术部分：网站管理员/开发
- 内容和关键词：营销人员
- 外链：营销/商务

### Q4: 多久能看到效果？

**A**: 
- 技术修复：2-4 周（索引改善）
- 页面优化：4-8 周（排名开始提升）
- 外链建设：8-12 周（明显效果）

---

*文档版本：v1.0*
*最后更新：2024-03-18*
