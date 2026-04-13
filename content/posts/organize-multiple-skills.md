---
title: "多 Skill 协同：如何系统性地组织与管理多个 Claude Skill"
date: 2026-03-22T02:43:02+08:00
draft: false
description: "当单个 Skill 不够用，多个 Skill 如何协作？本文深入讲解 Skill 的命名规范、目录架构、触发边界划分、跨 Skill 依赖管理、组合调用模式，以及团队共享 Skill 库的最佳实践。"
tags:
  - Claude
  - Skill
  - AI架构
  - 知识管理
  - 工程实践
  - LLM
categories:
  - Skill
author: "Claude"
slug: "organize-multiple-claude-skills"
---

> **摘要**：单个 Skill 解决单一场景，多个 Skill 构成一套能力体系。当你的 Skill 数量从 1 增长到 5、10、甚至 30+ 时，如何命名、如何划分边界、如何避免触发冲突、如何让多个 Skill 协同完成复杂任务——这些问题的答案直接决定了整个 Skill 体系能否稳定运转。本文从架构层面系统讲解多 Skill 的组织之道。

---

## 一、为什么多 Skill 管理是个真实问题

### 1.1 从单 Skill 到 Skill 体系的演进

刚开始使用 Skill 系统时，大多数人的路径是这样的：

1. 发现某个工作流重复出现，写了第一个 Skill
2. 另一个场景也有需要，再写一个
3. 几周后，已经有了 5-10 个 Skill，开始出现问题

问题不是某个 Skill 写得不好，而是**它们之间的关系没有被设计**：

- Skill A 和 Skill B 都声称处理"报告文档"，触发时互相干扰
- Skill C 依赖 Skill A 产生的输出，但没有任何机制保证顺序
- 同一个工具函数在 Skill A、B、C 里各写了一遍，改一处要改三处
- 新来的团队成员不知道哪个 Skill 该用哪个，描述都差不多

这是典型的**Skill 债务（Skill Debt）**——功能有了，但架构没跟上。

### 1.2 多 Skill 系统的核心挑战

多 Skill 管理面临四类挑战：

**边界模糊**：两个 Skill 的 description 语义重叠，Claude 不知道该选哪个，要么随机触发一个，要么两个都不触发。

**依赖无序**：Skill B 需要 Skill A 产生的中间文件，但没有任何协调机制，导致 B 在 A 没完成时就开始执行。

**资源重复**：多个 Skill 共享的工具脚本、参考文档、资产文件被各自维护，出现版本分叉。

**认知负担**：随着 Skill 数量增加，维护者和使用者需要记住的"Skill 知识"急剧增长，维护成本呈非线性上升。

解决这四类问题，需要从架构层面系统性地设计 Skill 体系，而不是逐个修补单个 Skill。

---

## 二、分类学：如何为 Skill 体系建立分类框架

在开始组织之前，先建立一套分类语言。

### 2.1 按抽象层级分类

把 Skill 分成三个层级，类似软件工程中的"基础设施 / 服务 / 应用"：

**原子 Skill（Atomic Skill）**

处理单一、明确的操作，没有依赖，输入输出清晰。例如：

- `pdf-to-text`：将 PDF 转换为纯文本
- `csv-cleaner`：清洗 CSV 中的脏数据
- `image-resize`：批量调整图片尺寸

特点：**高复用、低耦合、易测试**。是 Skill 体系的基础砖块。

**组合 Skill（Composite Skill）**

编排多个原子操作，完成有一定复杂度的工作流。例如：

- `report-generator`：读取数据（原子）→ 清洗（原子）→ 生成图表（原子）→ 写入 Word（原子）
- `content-pipeline`：爬取内容 → 摘要提炼 → 格式化发布

特点：**有明确的输入输出，内部步骤可见**。不应该把所有逻辑堆在一起，而是明确引用它调用了哪些原子 Skill 的脚本或逻辑。

**领域 Skill（Domain Skill）**

封装特定业务领域的完整知识，包含大量参考文档和专有规范。例如：

- `legal-document-drafting`：包含合同模板、法律术语表、格式规范
- `financial-report-analysis`：包含财务指标定义、行业基准、分析框架

特点：**知识密集、参考文档丰富**，需要精心组织 `references/` 目录结构。

### 2.2 按触发方式分类

**用户触发型（User-triggered）**：响应用户的直接请求而触发。大多数 Skill 属于这类。

**链式触发型（Chain-triggered）**：由另一个 Skill 的执行结果触发，用于构建自动化流水线。这类 Skill 的 description 需要特别说明"此 Skill 设计为被其他工作流调用"。

**背景辅助型（Background-augmentation）**：不主动完成任务，而是在相关场景中提供额外上下文或约束。例如"团队代码风格规范"这类 Skill，在任何代码相关任务时都静默地增强输出质量。

---

## 三、命名规范：让 Skill 名字本身传递信息

好的命名系统让人一眼就知道 Skill 的功能和定位，坏的命名让人永远在翻文档。

### 3.1 命名模式

推荐使用 **动词-名词-修饰语** 的结构：

```
{动词}-{操作对象}[-{修饰语}]
```

示例：

| 命名 | 解读 |
|------|------|
| `convert-pdf-to-docx` | 清晰，操作明确 |
| `generate-report-financial` | 生成财务报告，加领域修饰语区分同类 |
| `analyze-code-python` | Python 代码分析，语言作修饰语 |
| `write-post-hugo` | 写 Hugo 博客文章 |
| `review-code-security` | 安全角度的代码审查 |

避免的命名模式：

| 命名 | 问题 |
|------|------|
| `tool1` | 无语义，不可维护 |
| `advanced-helper` | 形容词没有信息量 |
| `document` | 太宽泛，边界不清 |
| `my-skill` | 缺乏描述性 |
| `writer-v2` | 版本号不应该在名字里 |

### 3.2 命名空间前缀

当 Skill 数量超过 10 个，引入命名空间前缀来组织：

```
{命名空间}/{skill-name}
```

例如一个内容创作团队的 Skill 库：

```
content/write-post-hugo
content/write-newsletter
content/rewrite-seo
content/translate-zh-en

data/clean-csv
data/analyze-excel
data/generate-chart

code/review-security
code/generate-tests
code/refactor-python
```

这样在目录层面就有了清晰的分组，维护者可以快速定位相关 Skill。

### 3.3 名字的稳定性原则

**Skill 的 `name` 字段一旦发布，不应该随意更改。** 原因：

1. 用户可能已经建立了对这个名字的认知习惯
2. 如果有自动化系统通过名字调用 Skill，改名会导致断链
3. 包管理和版本历史依赖稳定的标识符

如果确实需要重命名，应该保留旧名字的 Skill（只包含一行"此 Skill 已迁移至 `new-name`，请更新你的配置"的说明），让旧名字作为别名存活一段时间。

---

## 四、目录架构：Skill 库的文件系统设计

### 4.1 扁平结构 vs 分层结构

**扁平结构**（适合 < 10 个 Skill）：

```
skills/
├── pdf-converter/
│   └── SKILL.md
├── report-generator/
│   └── SKILL.md
└── code-reviewer/
    └── SKILL.md
```

简单直接，查找方便，适合个人使用或小团队早期阶段。

**分层结构**（适合 > 10 个 Skill）：

```
skills/
├── public/                    # 团队共享的通用 Skill
│   ├── document/
│   │   ├── docx/
│   │   ├── pdf/
│   │   └── xlsx/
│   ├── code/
│   │   ├── review/
│   │   └── generate/
│   └── content/
│       ├── hugo-writer/
│       └── newsletter/
├── private/                   # 个人定制 Skill
│   └── my-workflow/
└── shared-resources/          # 跨 Skill 共享资源
    ├── scripts/
    │   ├── file_utils.py
    │   └── format_converter.sh
    ├── references/
    │   └── style-guide.md
    └── assets/
        └── company-logo.png
```

关键设计决策：**`shared-resources/` 目录**。这是解决资源重复问题的核心——所有 Skill 都会用到的工具函数、样式指南、品牌资产，统一放在这里，各个 Skill 的 SKILL.md 通过绝对路径引用。

### 4.2 共享资源的引用规范

在 SKILL.md 中引用共享资源时，使用清晰的注释说明来源：

```markdown
## 执行步骤

1. 使用共享格式转换脚本处理输入文件：
   ```bash
   python /mnt/skills/shared-resources/scripts/file_utils.py \
     --input $INPUT_PATH \
     --format docx
   
   （此脚本由团队统一维护，位于 shared-resources/scripts/）

2. 参考团队写作风格指南（仅在需要调整语气时读取）：
   路径：`/mnt/skills/shared-resources/references/style-guide.md`
```

这样做有两个好处：维护者知道去哪里修改脚本；Claude 知道何时加载参考文件。

### 4.3 版本快照目录

对于生产环境中稳定运行的 Skill，建议保留历史版本快照：

```
skills/
└── public/
    └── report-generator/
        ├── SKILL.md           # 当前版本
        ├── CHANGELOG.md       # 变更日志
        └── snapshots/
            ├── v1.0/
            │   └── SKILL.md
            └── v1.5/
                └── SKILL.md
```

`CHANGELOG.md` 的格式建议：

```markdown
# report-generator 变更日志

## v2.0（2026-03-22）
- 重写 description，触发率从 62% 提升至 89%
- 添加 Excel 数据源支持
- 拆分参考文档到 references/ 子目录

## v1.5（2026-01-10）
- 修复空数据集时的崩溃问题
- 优化输出文档的页眉格式

## v1.0（2025-11-01）
- 初始版本
```

---

## 五、触发边界管理：避免 Skill 之间的"地盘争夺"

这是多 Skill 系统中最容易出问题、也最容易被忽视的部分。

### 5.1 触发冲突的类型

**类型一：语义重叠**

两个 Skill 的 description 描述了相似的场景，Claude 无法区分。

例子：
- Skill A：`用于生成 Word 文档格式的报告`
- Skill B：`用于创建专业文档，包括报告、备忘录`

当用户说"帮我写一份报告"时，A 和 B 都匹配，结果不可预测。

**类型二：包含关系**

一个 Skill 的触发范围完全覆盖了另一个的范围。

例子：
- Skill A：`用于处理所有类型的文件转换`
- Skill B：`用于将 PDF 转换为其他格式`

Skill B 是 Skill A 的子集，Skill A 总是会先触发，Skill B 永远没有机会。

**类型三：隐式依赖**

一个 Skill 的执行隐含地假设另一个 Skill 已经运行完毕，但没有明确声明。

### 5.2 解决触发冲突的方法

**方法一：互斥性关键词分配**

为每个 Skill 分配专属的触发关键词，明确在 description 中写出"此 Skill 处理X，不处理Y"：

```yaml
# Skill A
description: >
  处理财务类报告文档（损益表、资产负债表、现金流量表等）。
  触发词：财务报告、年报、季报、财务分析文档。
  注意：通用报告请使用 report-generator Skill，本 Skill 专用于财务场景。

# Skill B  
description: >
  生成通用业务报告（项目报告、运营报告、进度报告等）。
  触发词：业务报告、项目总结、运营周报。
  注意：财务相关报告请使用 financial-report Skill。
```

两个 Skill 相互引用对方，形成清晰的转介关系。这种方式同时帮助 Claude 和人类维护者理解边界。

**方法二：明确的特异性层级**

在 description 中通过"特异性"来建立优先级：

```yaml
# 通用 Skill（兜底）
description: >
  用于生成各类文档报告。如果有更专门的 Skill（如 financial-report、
  legal-brief、technical-spec），优先使用专门的 Skill。
  本 Skill 作为通用兜底，处理没有专门 Skill 覆盖的报告类型。

# 专用 Skill（优先）
description: >
  专门用于法律文书起草（合同、诉状、协议、法律意见书）。
  遇到任何法律文书相关请求，优先使用本 Skill 而非通用文档 Skill。
```

**方法三：输入格式区分**

当功能相似但输入格式不同时，用输入格式作为区分维度：

```yaml
# Skill A
description: >
  从 Excel (.xlsx) 文件生成数据报告。当用户提供的是 Excel 文件时触发。

# Skill B
description: >
  从 CSV 文件生成数据报告。当用户提供的是 CSV 或 TSV 文件时触发。
```

### 5.3 触发边界文档

当 Skill 数量超过 8 个，强烈建议维护一份 `SKILL-MAP.md` 文档，放在 skills 根目录：

```markdown
# Skill 触发边界地图

## 文档类 Skill

| Skill 名称 | 触发场景 | 不触发场景 |
|-----------|---------|-----------|
| docx | Word文档创建/编辑、专业报告、带格式的长文档 | PDF、纯文本、演示文稿 |
| pdf | PDF创建/读取/合并/分割 | Word文档、表格 |
| xlsx | Excel文件操作、数据表格 | Word文档、CSV清洗 |
| pptx | 演示文稿、幻灯片 | 文档报告 |

## 内容创作类 Skill

| Skill 名称 | 触发场景 | 不触发场景 |
|-----------|---------|-----------|
| hugo-writer | Hugo博客文章、带frontmatter的Markdown长文 | 简单文本回答、短段落 |
| newsletter | 邮件通讯、营销邮件 | 博客文章 |
| seo-rewrite | 现有内容的SEO优化改写 | 原创内容创作 |

## 决策树

遇到"写文章"类请求：
→ 需要发布到Hugo博客？→ hugo-writer
→ 需要发布为邮件通讯？→ newsletter  
→ 改写现有文章提升SEO？→ seo-rewrite
→ 都不是？→ 使用通用写作能力，无需Skill
```

这份文档的维护成本很低，但对新团队成员的价值极高——几分钟就能理解整个 Skill 体系的边界划分。

---

## 六、跨 Skill 协作：设计多 Skill 工作流

### 6.1 顺序管道（Sequential Pipeline）

最简单的多 Skill 协作模式：A 的输出是 B 的输入，形成线性流水线。

```
原始数据 → [data-cleaner] → 清洁数据 → [report-generator] → 报告草稿 → [docx-formatter] → 最终文档
```

实现这种模式时，关键是**约定中间文件格式**。在各 Skill 的 SKILL.md 中明确声明：

```markdown
## 输出规范

本 Skill 的输出文件保存为 `/tmp/pipeline/{task-id}/clean-data.json`，
格式遵循 `shared-resources/references/data-schema.md` 中定义的标准结构。
下游 Skill（如 report-generator）可以直接读取此文件。
```

通过统一的中间格式约定（哪怕只是一个简单的 JSON schema），多个 Skill 可以在没有直接通信的情况下协作。

### 6.2 并行扇出（Parallel Fan-out）

一个任务可以被分解为多个独立子任务，由不同 Skill 并行处理：

```
多源数据集
├── [analyze-sales-data]    → 销售分析
├── [analyze-user-data]     → 用户分析
└── [analyze-ops-data]      → 运营分析
                    ↓
            [synthesis-skill] → 综合报告
```

在 Claude.ai 中，由于没有真正的并行执行，这个模式通常是伪并行——Claude 会顺序执行每个分析，然后合成。但关键的价值在于：**每个分析 Skill 是独立可测的单元**，可以单独优化，不会互相干扰。

### 6.3 条件分支（Conditional Branching）

根据输入条件选择不同的 Skill 路径：

```markdown
## 文档生成决策逻辑

检查请求类型：
- 如果目标格式是 .docx → 使用 docx Skill
- 如果目标格式是 .pdf → 使用 pdf Skill  
- 如果目标是 Hugo 博客 → 使用 hugo-writer Skill
- 如果目标是 PowerPoint → 使用 pptx Skill
- 如果格式不明确 → 询问用户
```

这种逻辑通常放在一个**路由 Skill（Router Skill）**里，它本身不处理内容，只负责分发到正确的专门 Skill。

### 6.4 路由 Skill 的设计

路由 Skill 是多 Skill 体系中的"调度器"，特别适合入口统一的场景：

```yaml
---
name: document-router
description: >
  当用户需要创建任何类型的文档，但没有明确指定格式或工具时触发。
  本 Skill 分析请求意图，将任务路由到最合适的专门 Skill。
  触发词：创建文档、生成文件、写报告（当格式不明确时）。
---

## 路由逻辑

分析用户请求，确定最合适的目标 Skill：

### 判断维度
1. **格式信号**：用户提到了 Word/PPT/PDF/Excel/Markdown？
2. **用途信号**：博客/演讲/分析报告/通讯/合同？
3. **规模信号**：单页/多页/完整演示/长文？

### 路由规则
| 判断结果 | 路由到 |
|----------|-------|
| Word / 专业文档 / 需要精确格式 | docx Skill |
| 演讲 / 汇报 / 幻灯片 | pptx Skill |
| 数据表格 / 财务数据 | xlsx Skill |
| 博客 / Hugo / Markdown长文 | hugo-writer Skill |
| 格式无明确要求的短文本 | 直接生成，无需专门Skill |

### 执行
确认路由方向后，告知用户"我将使用[Skill名称]来处理这个任务"，
然后按照对应 Skill 的规范执行。
```

---

## 七、共享资源库：消除重复，统一维护

### 7.1 哪些资源值得共享

不是所有资源都值得抽取到共享库。判断标准：

**值得共享的资源**：
- 被 2 个以上 Skill 使用
- 修改时需要在多处同步更新
- 有明确的"权威版本"需求（如品牌规范、API 文档）

**不值得共享的资源**：
- 只有一个 Skill 使用
- 高度特定于某个 Skill 的上下文
- 更新频率极低或极高（前者意味着复制粘贴成本很低；后者意味着共享库维护成本高）

### 7.2 共享资源的类型与组织

```
shared-resources/
├── scripts/              # 可执行脚本
│   ├── file_utils.py     # 文件读写工具函数
│   ├── format_check.sh   # 格式验证脚本
│   └── README.md         # 脚本说明（包括参数文档）
│
├── references/           # 参考文档
│   ├── style-guide.md    # 写作风格指南
│   ├── brand-voice.md    # 品牌语调规范
│   ├── data-schema.md    # 中间数据格式定义
│   └── api-docs/         # 外部 API 文档快照
│
├── assets/               # 静态资源
│   ├── logo.png
│   ├── template.docx     # Word 模板
│   └── fonts/
│
└── MANIFEST.md           # 共享资源清单与使用说明
```

`MANIFEST.md` 是共享资源库的"入口文档"：

```markdown
# 共享资源清单

## 脚本

### file_utils.py
用途：统一的文件读写工具，处理路径规范化、编码检测、格式验证
使用方法：`python /mnt/skills/shared-resources/scripts/file_utils.py --help`
被以下 Skill 使用：docx, pdf, xlsx, report-generator

### format_check.sh
用途：验证输出文件是否符合格式规范
使用方法：`bash /mnt/skills/shared-resources/scripts/format_check.sh <file_path>`
被以下 Skill 使用：所有文档生成类 Skill

## 参考文档

### style-guide.md（全量加载：约 80 行）
何时读取：任何需要调整写作语气、格式规范的场景
覆盖内容：标题层级规范、标点用法、术语表

### data-schema.md（按需读取：约 150 行，含目录）
何时读取：当 Skill 需要产生或消费管道中间数据时
覆盖内容：标准 JSON 结构、字段类型定义、示例数据
```

### 7.3 共享脚本的版本兼容性

当共享脚本需要更新时，遵循向后兼容原则：

```python
# file_utils.py 版本管理示例

def convert_file(input_path, output_format, **kwargs):
    """
    v2.0 新增 encoding 参数，但默认值保证向后兼容
    v1.x 的调用方式仍然有效
    """
    encoding = kwargs.get('encoding', 'utf-8')  # 新参数，有默认值
    # ...
```

如果确实需要破坏性更改，保留旧版本脚本并重命名：

```
scripts/
├── file_utils.py          # 当前版本（v2.0）
├── file_utils_v1.py       # 保留旧版本，供仍依赖它的 Skill 使用
└── MIGRATION.md           # 从 v1 迁移到 v2 的指南
```

---

## 八、团队协作：Skill 库的治理与贡献流程

### 8.1 Skill 库的所有权模型

**个人所有（Personal Ownership）**：适合 skills/private/ 下的个人定制 Skill，由创建者自行维护，无需审查。

**团队所有（Team Ownership）**：适合 skills/public/ 下的共享 Skill，采用代码审查模式：
1. 提出变更草稿
2. 至少一名团队成员审查
3. 运行测试用例，确认没有回归
4. 合并发布

**轮换维护（Rotating Maintainership）**：对于核心基础 Skill，指定一位主要维护者，但接受全队贡献。当维护者离队，及时轮换。

### 8.2 贡献新 Skill 的流程

建议团队建立一份 `CONTRIBUTING.md` 文档，规定贡献流程：

```markdown
# 向 Skill 库贡献新 Skill

## 提交前检查清单

- [ ] 命名符合 `{动词}-{名词}[-{修饰语}]` 规范
- [ ] description 字段包含至少 3 个具体触发场景
- [ ] 包含至少 5 个测试用例（覆盖正常路径和至少 1 个边界情况）
- [ ] 与现有 Skill 的边界已明确（在 description 中写明不处理哪些场景）
- [ ] 共享资源通过 shared-resources/ 引用，而非复制
- [ ] CHANGELOG.md 已创建，记录初始版本信息
- [ ] 已在 SKILL-MAP.md 中更新边界说明

## 提交后流程

1. 通知团队审查
2. 等待至少 24 小时，收集反馈
3. 处理审查意见
4. 合并后通知所有 Skill 使用者
```

### 8.3 废弃（Deprecation）流程

Skill 不应该直接删除，应该经过正式的废弃流程：

**阶段一：标记废弃**
在 description 和 SKILL.md 顶部添加废弃声明：

```yaml
description: >
  [已废弃，请使用 new-report-generator Skill]
  原有 report-generator Skill，2026-06-01 后将不再维护。
```

**阶段二：保留观察期**
给使用者至少 30 天时间迁移到新 Skill。

**阶段三：归档**
将 Skill 目录移动到 `skills/archived/`，保留完整历史记录。

---

## 九、多 Skill 体系的健康度评估

### 9.1 体系健康度指标

定期（建议每月一次）评估 Skill 库的健康状态：

| 指标 | 健康范围 | 告警阈值 |
|------|---------|---------|
| 平均触发准确率 | > 80% | < 60% |
| Skill 边界冲突数 | 0 | > 2 |
| 共享资源重复率 | < 5% | > 20% |
| 废弃 Skill 比例 | < 15% | > 30% |
| 最长未更新时间 | < 6 个月 | > 12 个月 |
| 无测试用例的 Skill | < 10% | > 30% |

**触发准确率**的计算方式：随机抽取 20 个真实用户请求，人工判断"理论上应该触发哪个 Skill"，然后对比实际触发的结果，正确率即为触发准确率。

### 9.2 定期维护任务

建议设置月度维护周期：

**每月**：
- 检查 Bad Case 记录，是否有反复出现的触发失败
- 检查 SKILL-MAP.md 是否与实际 Skill 状态同步
- 检查废弃 Skill 列表，推进归档

**每季度**：
- 运行所有 Skill 的测试用例，检查回归
- 审查共享资源是否有过期信息
- 评估是否有 Skill 可以合并（功能高度重叠）或拆分（过于臃肿）

**每半年**：
- 重新审视整体分类框架，是否需要调整
- 收集用户反馈，识别尚未被 Skill 覆盖的高频场景

---

## 十、案例分析：从混乱到有序的 Skill 库重构

### 10.1 初始状态：典型的混乱 Skill 库

假设一个内容团队有以下 Skill，经过 6 个月的自然生长：

```
skills/
├── writer/           # "通用写作"，description 极其宽泛
├── blog-helper/      # "帮助写博客"，与 writer 高度重叠
├── formatter/        # 格式化文档，但不清楚支持哪些格式
├── seo/              # SEO 相关，但包含了写作和优化两个功能
├── translator/       # 翻译
├── newsletter2/      # newsletter 的 v2，旧版 newsletter 也还在
└── newsletter/       # 旧版，已废弃但没有标记
```

问题：
- `writer` 和 `blog-helper` 触发冲突
- `seo` 职责不单一（写作+优化=两个功能）
- `newsletter` 和 `newsletter2` 造成混乱
- `formatter` 功能不明确
- 没有共享资源目录，样式规范在多个 Skill 里重复

### 10.2 重构过程

**第一步：功能清单**

列出所有 Skill 实际提供的功能（不是名字，是功能）：
- 创建 Hugo 格式博客文章
- 创建邮件通讯
- 将 Word/Markdown 格式化输出
- SEO 关键词优化
- 改写文章语气/风格
- 中英文翻译

**第二步：重新划分边界**

将功能映射到新的 Skill 设计：

| 新 Skill 名称 | 覆盖功能 | 替代旧 Skill |
|--------------|---------|------------|
| `write-post-hugo` | Hugo博客文章创作 | writer, blog-helper（部分） |
| `write-newsletter` | 邮件通讯创作 | newsletter2（newsletter归档） |
| `rewrite-seo` | SEO改写优化 | seo（拆分出的优化功能） |
| `rewrite-tone` | 语气/风格改写 | seo（拆分出的写作功能）, writer（部分）|
| `translate-content` | 翻译 | translator |
| `format-document` | 多格式文档输出 | formatter（明确支持格式列表）|

**第三步：建立共享资源**

从各 Skill 中提取公共内容：

```
shared-resources/
├── references/
│   ├── brand-voice.md      # 从 writer、newsletter 里提取的品牌语调
│   └── style-guide.md      # 从 formatter 里提取的格式规范
└── assets/
    └── templates/
        └── newsletter-template.html  # 从 newsletter2 里提取
```

**第四步：更新 SKILL-MAP.md**

为整个重构后的体系建立清晰的边界文档。

**第五步：废弃旧 Skill**

```
skills/
├── public/
│   ├── write-post-hugo/
│   ├── write-newsletter/
│   ├── rewrite-seo/
│   ├── rewrite-tone/
│   ├── translate-content/
│   └── format-document/
├── shared-resources/
│   ├── references/
│   └── assets/
└── archived/             # 旧 Skill 归档
    ├── writer/
    ├── blog-helper/
    ├── formatter/
    ├── seo/
    ├── translator/
    ├── newsletter/
    └── newsletter2/
```

### 10.3 重构成效

| 指标 | 重构前 | 重构后 |
|------|-------|-------|
| Skill 数量 | 7个（含废弃） | 6个（功能实质增加）|
| 边界冲突 | 3对 | 0 |
| 共享资源重复 | 4份样式规范副本 | 1份 |
| 触发准确率 | 约 55% | 约 88% |
| 新成员上手时间 | 1-2天 | < 30分钟（有 SKILL-MAP.md）|

---

## 十一、总结与架构原则速查

多 Skill 体系的设计本质上是**软件架构问题在提示工程领域的投影**。单一职责、依赖倒置、接口隔离——这些在传统软件工程中被反复验证的原则，在 Skill 体系设计中同样适用。

### 核心架构原则

**单一职责**：每个 Skill 只解决一类明确的问题。功能蔓延是技术债的开始。

**明确边界**：Skill 的 description 不仅说明"做什么"，也要说明"不做什么"。两个 Skill 之间应该有清晰的分界线，不能有灰色地带。

**接口契约**：当多个 Skill 需要协作时，约定中间数据格式，通过文件或数据结构传递信息，而不是隐式假设。

**共享不复制**：公共资源放在 shared-resources/，通过路径引用，不在各 Skill 中复制粘贴。

**可废弃性**：设计时就考虑 Skill 如何优雅地退休，废弃流程和创建流程同等重要。

### 最佳实践速查表

**命名**
- ✅ 使用 `{动词}-{名词}[-{修饰语}]` 格式
- ✅ 超过 10 个 Skill 时引入命名空间前缀
- ❌ 不在名字里使用版本号（v1, v2）

**目录架构**
- ✅ < 10 个 Skill 用扁平结构
- ✅ > 10 个 Skill 用分层结构 + shared-resources/
- ✅ 维护 SKILL-MAP.md 和 CHANGELOG.md

**触发边界**
- ✅ description 中明确写出"不处理哪些场景"
- ✅ 相互引用的 Skill 之间建立转介关系
- ✅ 超过 8 个 Skill 时建立路由 Skill

**协作模式**
- ✅ 通过约定中间文件格式实现顺序管道
- ✅ 用路由 Skill 处理条件分支
- ✅ 每个子 Skill 保持独立可测

**团队治理**
- ✅ 建立贡献 Checklist
- ✅ 废弃 Skill 走正式流程，不直接删除
- ✅ 每月检查触发准确率

---

*文章生成时间：2026-03-22 02:43 CST*  
*基于 Claude Skill 系统架构研究与工程实践整理*
