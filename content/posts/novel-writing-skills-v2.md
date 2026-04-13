---
title: "长篇严肃文学写作 Skill 架构 v2"
date: 2026-03-20
draft: false
tags: ["writing", "novel", "skills", "prompt-engineering", "revision"]
categories: ["Skill"]
description: "适配粗糙初稿的长篇严肃文学写作 Skill 体系，包含原稿分析、拆分、诊断与系统性修订流程。"
toc: true
slug: "novel-writing-skills-v2"
---

# 长篇严肃文学写作 Skill 架构 v2
## 适配粗糙初稿的完整修订体系

> v2 新增：**原稿摄入与诊断系统**（Skill 7），并在所有子 Skill 中增加
> "问题识别"优先于"内容生成"的工作模式。适用于初稿质量参差不齐、
> 需要大幅改动的长篇项目。

---

## Skill 体系总览（v2）

```
novel-writing/
├── SKILL.md                        ← 总调度入口
├── manuscript-intake/
│   ├── SKILL.md                    ← ★ 新增：原稿摄入与诊断（入口）
│   ├── scripts/
│   │   ├── split_chapters.py       ← 自动切割章节
│   │   ├── extract_knowledge.py    ← 提取结构知识
│   │   └── diagnose_draft.py       ← 生成诊断报告
│   └── references/
│       └── diagnosis-rubric.md     ← 诊断评分标准
├── knowledge-base/                 ← 由 intake 自动生成，持久化
│   ├── chapter-summaries.md
│   ├── character-bible.md
│   ├── timeline.md
│   ├── plot-threads.md
│   ├── style-fingerprint.md
│   └── diagnosis-report.md         ← ★ 新增：全稿诊断报告
├── style-consistency/SKILL.md
├── plot-architecture/SKILL.md
├── narrative-coherence/SKILL.md
├── character-system/SKILL.md
├── scene-writing/SKILL.md
└── revision-engine/
    ├── SKILL.md                    ← 增强：支持大幅重写模式
    └── references/
        └── rewrite-strategies.md   ← ★ 新增：重写策略库
```

---

## Skill 7 · 原稿摄入与诊断

**文件路径：** `novel-writing/manuscript-intake/SKILL.md`

> 这是处理粗糙初稿的**第一道工序**，必须在任何修改工作之前完成。
> 它的输出（`knowledge-base/`）是后续所有 Skill 的工作基础。

```markdown
---
name: manuscript-intake
description: >
  原稿摄入、自动拆分与全稿诊断系统。当用户提供初稿文件、
  说"帮我分析稿子"、"我有一份草稿"、"帮我看看哪里需要改"、
  "初始化项目"时，必须首先触发本 skill。
  本 skill 处理结构混乱、章节不规范、质量参差的粗糙初稿。
---

# 原稿摄入与诊断系统

## 第一步：原稿预处理

### 文件接收
```bash
# 将原稿放入：
drafts/manuscript.txt   # 或 .md / .docx（需先转换）
```

### 自动章节切割

运行 `scripts/split_chapters.py`，该脚本按以下优先级识别章节边界：

```python
CHAPTER_PATTERNS = [
    r'^第[零一二三四五六七八九十百\d]+章',   # 第X章
    r'^Chapter\s+\d+',                        # Chapter N
    r'^\d+\.',                                # 1. 2. 3.
    r'^={3,}$',                               # === 分隔线
    r'^\*{3,}$',                              # *** 分隔线
]

# 若以上均未匹配（连续文本），则：
# 按字数切割：每 2000-3000 字为一个逻辑单元
# 切割点选择：段落结尾、对话结束、场景转换处
```

切割结果输出至 `drafts/chapters/` 目录：
```
drafts/chapters/
├── ch001.txt
├── ch002.txt
└── ...
```

---

## 第二步：知识底座提取

运行 `scripts/extract_knowledge.py`，对每个章节文件依次执行：

### 2a · 章节摘要提取

**提示词模板：**

```
你是一个结构分析助手，任务是从小说章节中提取结构信息，不做文学评价。

【章节原文】
{chapter_text}

请输出以下内容（仅输出 YAML，不要任何其他文字）：

```yaml
chapter_id: "{ch_id}"
word_count: {字数}
summary: "{用2-3句话概括：发生了什么、谁做了什么、结果如何}"
location: "{主要发生地点}"
time_marker: "{故事内时间，如有明确标志}"
characters_present: [{出现的角色名}]
key_events: 
  - "{关键事件1}"
  - "{关键事件2}"
new_info_revealed: "{本章新揭示的重要信息（伏笔、秘密、背景）}"
ends_with: "{本章结尾状态，用一句话}"
```
```

### 2b · 人物信息提取

**提示词模板：**

```
从以下章节中提取所有出现的人物信息。
对于新出现的人物，建立档案；对于已有档案的人物，记录新信息。

【已有人物档案摘要】
{existing_characters_summary}

【本章原文】
{chapter_text}

输出 YAML（仅新信息或变化，不要重复已有内容）：

```yaml
new_characters:
  - name: ""
    first_appearance: "{ch_id}"
    role_guess: "主角/配角/路人/反派"
    description_clues: "{外貌、身份等原文线索}"
    speech_sample: "{该角色的一句典型台词（原文引用）}"

character_updates:
  - name: ""
    new_info: "{本章新增的性格、背景、行为信息}"
    behavior_note: "{与已知性格是否一致？若有偏差，标注}"
```
```

### 2c · 伏笔与线索提取

**提示词模板：**

```
从以下章节中识别所有伏笔、悬念、未解决线索。
区分"已埋下的伏笔"和"已收束的线索"。

【章节原文】
{chapter_text}

【已知未收束线索列表】
{open_threads}

输出 YAML：

```yaml
new_threads:
  - id: "F{序号}"
    type: "伏笔/悬念/未解释事件/人物之谜"
    description: "{线索内容}"
    planted_at: "{ch_id}"
    urgency: "低/中/高"  # 高=读者会立即注意到

resolved_threads:
  - id: "{已有线索ID}"
    resolved_at: "{ch_id}"
    resolution: "{如何收束的}"

suspicious_dangling:
  - "{疑似被遗忘的细节，可能是无意留下的漏洞}"
```
```

### 2d · 文风指纹提取

**仅对前3章执行**，提示词模板：

```
你是文体分析专家。分析以下文本的风格特征，为后续续写提供锚定依据。

【文本样本（前3章）】
{first_three_chapters}

从以下维度输出分析（YAML格式）：

```yaml
style_fingerprint:
  
  syntax:
    avg_sentence_length: "短（<15字）/ 中（15-30字）/ 长（>30字）/ 混合"
    paragraph_pattern: "一句成段 / 密集长段 / 混合"
    punctuation_style: "{破折号、省略号的使用习惯}"
    special_structures: "{倒装、被动、反问的频率描述}"
  
  vocabulary:
    register: "文言倾向 / 口语化 / 书面标准 / 混合"
    adjective_density: "稀疏克制 / 适中 / 浓密"
    verb_preference: "动态动词为主 / 静态存在动词为主"
    imagery_system: "{主要意象域，如：自然/身体/建筑/颜色}"
  
  narration:
    pov: "第一人称 / 第三限知 / 全知 / 混合"
    emotional_distance: "冷静克制 / 内嵌情感 / 反讽疏离"
    time_handling: "线性顺叙 / 频繁闪回 / 意识流"
    detail_philosophy: "白描精准 / 堆砌细节 / 克制留白"
  
  representative_sample: |
    {从原文中选取最能代表文风的100-150字段落，原文引用}
  
  style_violations_to_avoid:
    - "{与该文风冲突的写法，如：不要用排比句、不要出现现代网络词汇}"
```
```

---

## 第三步：全稿诊断

运行 `scripts/diagnose_draft.py`，基于已提取的知识底座，生成诊断报告。

### 诊断提示词模板

```
你是一位严苛但公正的文学编辑，正在对一部长篇小说初稿进行全面诊断。
你的任务是找出问题，不是鼓励作者。

【全稿章节摘要】
{all_chapter_summaries}

【人物档案】
{character_bible}

【伏笔与线索清单】
{plot_threads}

【文风指纹】
{style_fingerprint}

请从以下六个维度逐一诊断，每个维度输出：
问题描述 + 具体位置（哪章）+ 严重程度（🔴严重/🟡中等/🟢轻微）+ 修复建议

---

## 诊断维度一：结构完整性

检查项：
- 故事是否有清晰的起点、发展、高潮、结局？
- 主线是否贯穿全文？是否存在中段断裂？
- 开头是否承诺了一个被全文兑现的核心冲突？
- 结尾是否回应了开头的核心问题？

---

## 诊断维度二：文风一致性

检查项：
- 不同章节的叙述语调是否出现明显漂移？
- 标出文风最不一致的3个章节，说明具体偏差
- 句式和词汇风格在全文是否稳定？

---

## 诊断维度三：情节逻辑

检查项：
- 是否存在因果断链（事件发生没有充分铺垫）？
- 是否存在时间线矛盾？
- 是否有明显的情节漏洞（角色知道不该知道的信息等）？
- 高潮是否由前文逻辑自然导出，还是突兀发生？

---

## 诊断维度四：人物一致性

检查项：
- 是否有角色在某章突然做出与性格不符的行为（无铺垫）？
- 是否有角色前后说法矛盾？
- 配角是否仅作为工具人存在，缺乏自身逻辑？
- 主角的成长弧是否有足够的内在驱动？

---

## 诊断维度五：线索收束情况

基于伏笔清单：
- 列出所有 status=open 且已超过全文 2/3 位置仍未收束的线索
- 评估每条线索是：刻意悬置 / 疑似遗忘 / 需要补写收束

---

## 诊断维度六：语言质量抽样

从文风偏差最大的章节中抽取3个段落，逐段指出：
- 冗余表达
- 陈词滥调
- Tell 替代 Show 的具体位置
- 节奏失控的句子

---

最后输出：

```yaml
diagnosis_summary:
  overall_assessment: "可用度高/中/低"
  
  priority_fixes:        # 必须先解决，否则后续工作无意义
    - issue: ""
      location: ""
      reason: ""
  
  chapter_health_map:    # 每章健康状态
    - ch_id: ""
      status: "良好/需小改/需大改/建议重写"
      main_issue: ""
  
  rewrite_candidates:    # 建议整章重写的章节
    - ch_id: ""
      reason: ""
  
  strengths:             # 原稿中真正有价值的部分，修改时要保护
    - ""
```
```

---

## 第四步：生成修订路线图

诊断完成后，自动生成 `knowledge-base/revision-roadmap.md`：

**提示词模板：**

```
基于以下诊断报告，为作者制定一份可执行的修订路线图。
路线图需要分阶段，从宏观结构到微观文字，避免作者陷入细节而忽略大问题。

【诊断报告】
{diagnosis_report}

【全文字数】{total_words} 字

输出格式：

# 修订路线图

## 第一轮修订：结构手术（预计工作量：X天）
> 目标：在动任何文字之前，先确定哪些章节保留/删除/重写/合并

### 必须完成的结构决策
- [ ] {具体任务，含章节编号}

### 本轮产出
- 确定最终章节目录
- 确定每章的"存活状态"（保留/改/重写）

---

## 第二轮修订：情节与人物修复（预计工作量：X天）
> 目标：修复逻辑漏洞，统一人物行为，补写缺失场景

### 按优先级排列
🔴 {严重问题，含章节}
🟡 {中等问题}
🟢 {轻微问题}

---

## 第三轮修订：文风统一（预计工作量：X天）
> 目标：以文风指纹为标准，修订偏差章节

### 需要文风修订的章节（按偏差程度排序）
{章节列表}

### 文风修订重点提示
{基于文风指纹的具体指令}

---

## 第四轮修订：语言打磨（预计工作量：X天）
> 目标：逐章删冗余、改陈词、提升语言密度

### 高优先级章节（语言问题最集中）
{章节列表}
```

---

## 知识底座更新策略

修订过程中，知识底座需同步更新：

```yaml
update_triggers:
  - 整章重写完成后 → 更新 chapter-summaries.md 对应条目
  - 人物性格调整后 → 更新 character-bible.md
  - 新增/删除伏笔后 → 更新 plot-threads.md
  - 文风标准变更后 → 更新 style-fingerprint.md

update_command: |
  # 局部更新，不重新分析全稿
  # 只重新运行被修改章节的提取脚本
  python scripts/extract_knowledge.py --chapters ch012 ch013 --update-only
```
```

---

## Skill 6 增强 · 修订引擎（重写模式）

**新增文件：** `novel-writing/revision-engine/references/rewrite-strategies.md`

```markdown
# 重写策略库

当章节被标记为"需大改"或"建议重写"时，不要直接改动原文，
而是先选择重写策略，再执行。

---

## 策略一：骨架保留法
**适用于：** 情节有价值，但语言和叙述方式需要全面改写

```
步骤：
1. 从原章节提取"情节骨架"（仅保留：谁/在哪/做了什么/结果如何）
2. 完全抛开原文措辞，以文风指纹为标准重新写作
3. 对照原文检查：重要情节信息是否全部保留

提示词：
【情节骨架】
{extracted_skeleton}

【文风指纹】
{style_fingerprint}

【任务】
以上述文风，重新写作这个场景。
不参考原文措辞，只保留情节骨架中的事实信息。
字数目标：{target_length}字
```

---

## 策略二：手术切除法
**适用于：** 章节整体可用，但有若干"毒瘤段落"拉低整体

```
步骤：
1. 首先标注章节中"必须保留"的段落（核心情节/最佳文字）
2. 标注"必须删除"的段落（冗余/风格污染/逻辑错误）
3. 标注"需要改写"的段落
4. 处理完成后检查删改处的衔接

提示词：
【章节原文】
{chapter_text}

【已标注保留段落】
{keep_sections}

任务：
1. 删除以下段落：{delete_sections}
2. 改写以下段落（按文风指纹）：{rewrite_sections}  
3. 修复删改处的衔接，使文本流畅
4. 不要改动"保留段落"的任何文字
```

---

## 策略三：视角重建法
**适用于：** 视角混乱或叙述者声音污染

```
步骤：
1. 确认本章应使用的视角（来自创作契约）
2. 标出所有视角违规处（限知叙述中的全知信息泄露等）
3. 对每处违规，决定：删除 / 移交其他章节 / 改写为合法形式

提示词：
【本文视角设定】{pov_setting}
【章节原文】{chapter_text}

请：
1. 标出所有视角违规（加注[视角违规]标签）
2. 对每处违规给出修复方案
3. 执行修复，输出修订后全文
```

---

## 策略四：节奏重构法
**适用于：** 文字尚可，但节奏失控（过快/过慢/不均匀）

```
节奏诊断标准：
- 过快：重要情节在一两句话内一笔带过，读者来不及沉浸
- 过慢：琐碎细节占据大量篇幅，主要动作被淹没
- 不均匀：情绪积累和释放的时机感错误

提示词：
【章节原文】{chapter_text}
【本章在全书中的情绪功能】{emotional_function}
  （如：高潮前的蓄力章 / 情感爆发章 / 过渡缓冲章）

请：
1. 诊断当前节奏问题（哪里过快/过慢）
2. 给出调整方案（哪些段落需要扩写/压缩）
3. 执行调整，保持文风指纹不变
```

---

## 重写质量验收标准

每次重写完成后，对照以下标准验收：

```yaml
rewrite_checklist:
  content:
    - "情节骨架中的所有事实信息均已保留"
    - "无新引入的情节（重写不是二次创作）"
    - "与上下章的衔接自然"
  
  style:
    - "文风与指纹吻合（句长、词汇、叙述距离）"
    - "叙述者声音一致"
    - "无文风漂移标志词（如突然出现的口语化表达）"
  
  logic:
    - "人物行为符合其性格档案"
    - "无新的时间线矛盾"
    - "视角统一，无污染"
  
  quality:
    - "已删除所有冗余段落"
    - "情感通过细节/动作传达，非直接陈述"
    - "段落节奏服务于本章情绪功能"
```
```

---

## 完整工作流（粗糙初稿版）

```
第零步（一次性）
用户提供初稿 → manuscript-intake/SKILL.md
  ↓
split_chapters.py    → drafts/chapters/*.txt
  ↓
extract_knowledge.py → knowledge-base/（章节摘要、人物、伏笔、文风）
  ↓
diagnose_draft.py    → knowledge-base/diagnosis-report.md
  ↓
生成修订路线图       → knowledge-base/revision-roadmap.md

─────────────────────────────────────────────

第一轮（结构层）
读取 diagnosis-report → 决定章节去留
调用 plot-architecture/SKILL.md → 修复情节逻辑
产出：确定的章节目录 + 每章存活状态

─────────────────────────────────────────────

第二轮（情节/人物层）
按 diagnosis-report 的 🔴 问题逐一处理
调用 narrative-coherence/SKILL.md → 修复逻辑漏洞
调用 character-system/SKILL.md    → 修复人物一致性
对需要重写的章节 → 调用 revision-engine + rewrite-strategies

─────────────────────────────────────────────

第三轮（文风层）
以 style-fingerprint 为标准
调用 style-consistency/SKILL.md → 修订偏差章节
每章修订后运行验收清单

─────────────────────────────────────────────

第四轮（语言层）
调用 revision-engine/SKILL.md → 逐章语言打磨
重点：删冗余、改陈词、Show don't tell

─────────────────────────────────────────────

持续维护
每完成5章修订 → 更新 knowledge-base 对应条目
每完成一轮 → 重新运行 diagnose_draft.py 验证改善情况
```

---

## 关键设计原则说明

**为什么要分四轮而不是边写边改？**

粗糙初稿最常见的陷阱是：花大量时间打磨一段文字，后来发现整个章节需要删除。
四轮法确保永远从最宏观的问题开始，不在注定被删的内容上浪费精力。

**为什么知识底座比直接读原文更好？**

10万字原文每次全量加载耗时长、成本高，且大量内容与当前任务无关。
知识底座是压缩后的结构信息，总量约 8000-12000 字，覆盖 90% 的决策需求。
原文只在执行具体章节修改时局部加载。

**文风指纹的优先级**

在粗糙初稿中，文风最好的章节不一定是最早的章节，而是作者状态最佳时写的章节。
`extract_knowledge.py` 默认分析前3章，但建议作者手动指定1-2个"文风最满意"的章节作为基准。

---

*本架构适用于 Claude Code CLI 环境，所有脚本路径均为相对于项目根目录。*
*知识底座文件一旦生成，可跨会话持久使用，无需重复分析全稿。*
