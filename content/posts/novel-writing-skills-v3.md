---
title: "长篇严肃文学写作 Skill 架构 v3"
date: 2026-03-20
draft: false
tags: ["writing", "novel", "skills", "prompt-engineering", "style", "rewrite"]
categories: ["创作工具"]
description: "针对文风飘忽、语言质量低的初稿优化版本。跳过结构诊断，专注于文风指纹建立、逐章风格诊断与直接改写输出。"
toc: true
---

# 长篇严肃文学写作 Skill 架构 v3
## 文风统一 · 语言改写专项版

> **本版适用场景：** 原稿章节结构清晰，主要问题是文风飘忽（不同章节/段落
> 像不同人写的）和语言质量低。目标是直接输出可用的修改建议或改写草稿，
> 而非停留在诊断层面。

---

## 精简后的 Skill 目录结构

```
novel-writing/
├── SKILL.md                          ← 总入口（精简版）
├── style-engine/
│   ├── SKILL.md                      ← ★ 核心：文风引擎（本版重心）
│   └── references/
│       ├── fingerprint-guide.md      ← 文风指纹建立详细指南
│       └── drift-patterns.md         ← 文风漂移类型与对应修复手法
├── rewrite-engine/
│   ├── SKILL.md                      ← ★ 核心：改写执行引擎
│   └── references/
│       └── sentence-surgery.md       ← 句级改写操作手册
├── knowledge-base/                   ← 持久化，跨会话使用
│   ├── style-fingerprint.md          ← 文风基准（最重要的文件）
│   ├── chapter-index.md              ← 章节目录与文风评分
│   └── rewrite-log.md                ← 改写进度追踪
└── scripts/
    ├── split_chapters.py             ← 按章节标题切割原稿
    ├── score_style.py                ← 逐章文风评分
    └── batch_rewrite.py              ← 批量改写调度
```

---

## 工作流总览

```
第一步（一次性，约1小时）
挑选"文风锚定章" → 建立文风指纹 → 写入 knowledge-base/style-fingerprint.md

          ↓

第二步（全稿扫描，自动化）
split_chapters.py → score_style.py
→ 输出每章文风评分 + 偏差热力图
→ 写入 knowledge-base/chapter-index.md

          ↓

第三步（按优先级逐章改写，主要工作量）
从评分最低章开始 → rewrite-engine/SKILL.md
→ 直接输出：改写草稿 或 带注释的修改建议

          ↓

第四步（验收循环）
改写完成 → 对照文风指纹验收 → 更新 rewrite-log.md → 处理下一章
```

---

## Skill A · 文风引擎

**文件路径：** `novel-writing/style-engine/SKILL.md`

```markdown
---
name: style-engine
description: >
  文风指纹建立与逐章文风评分系统。这是改写工作的基础，
  必须在任何改写操作之前完成。当用户说"建立文风标准"、
  "分析文风"、"哪些章节文风最差"、"初始化文风基准"时触发。
---

# 文风引擎

## 一、建立文风指纹（必须最先完成）

### 锚定章选择原则

不要默认选第一章，要选**你自己最满意**的章节作为文风基准。
判断标准（按优先级）：

1. 读起来最像你想要的那种感觉
2. 节奏最稳、措辞最准
3. 不一定是最长的，但密度要够

建议选 1-2 章，合计 3000-6000 字为宜。

---

### 文风指纹提取提示词

将锚定章原文粘贴后，使用以下提示词：

````
你是专业文体分析师。请对以下文本进行深度风格解剖，
目标是建立一份可供后续续写/改写严格遵守的"文风宪法"。

分析须具体到可操作的程度——不要说"语言简洁"，
要说"动词后通常不加副词修饰，句尾少用感叹号，
段落收尾惯用名词短语而非完整句"。

【锚定章原文】
{anchor_chapter_text}

请输出以下结构（严格 YAML 格式，所有描述用中文）：

```yaml
style_fingerprint:
  version: "1.0"
  anchor_chapters: ["{章节名}"]
  
  # ── 句法层 ──────────────────────────────────
  syntax:
    sentence_length:
      pattern: "短促为主/长句为主/长短交替"
      avg_chars: "约X字"
      variation_note: "{何时用短句，何时用长句的规律}"
    
    paragraph_length:
      pattern: "一句成段/3-5句/密集长段/混合"
      scene_rule: "{不同场景类型对应的段落长度规律}"
    
    punctuation:
      dash_usage: "{破折号的具体用法场景}"
      ellipsis_usage: "{省略号的具体用法场景}"
      comma_density: "密集/适中/稀疏"
      special_habits: "{其他标点习惯}"
    
    sentence_openers:
      common_patterns: ["{常见句式开头方式1}", "{2}", "{3}"]
      avoided_patterns: ["{从不或极少使用的句式}"]
  
  # ── 词汇层 ──────────────────────────────────
  vocabulary:
    register: "文言倾向/标准书面/轻度口语/混合"
    adjective_policy:
      density: "极克制/适中/丰富"
      placement_rule: "{形容词倾向于前置还是后置，是否偏好定语从句}"
      forbidden: ["{与文风严重冲突的形容词类型，如网络化词汇}"]
    
    verb_preference:
      style: "精准具体动词/宽泛存在动词/混合"
      sample_pairs:
        - preferred: "{在这个文风中更好的动词}"
          avoided: "{同义但与文风冲突的动词}"
    
    imagery:
      primary_domains: ["{主要意象来源，如：自然/身体/器物/光影}"]
      recurring_motifs: ["{反复出现的意象或象征}"]
      forbidden_domains: ["{意象禁区，如：不用数字/科技意象}"]
    
    forbidden_phrases: ["{陈词滥调、与文风冲突的具体词组}"]
  
  # ── 叙述层 ──────────────────────────────────
  narration:
    pov: "第一人称/第三限知/全知/混合"
    
    emotional_distance:
      level: "极度克制/适度内敛/情感外露"
      method: "{情感如何传达：细节/动作/环境/直接陈述的比例}"
      example: |
        {从锚定章中引用一处情感处理的典型段落，15-30字}
    
    time_handling:
      base_mode: "线性顺叙/频繁闪回/意识流"
      transition_method: "{时间转换如何标示}"
    
    detail_philosophy:
      approach: "白描精准/堆砌细节/克制留白"
      what_gets_described: "{什么类型的细节会被详细描写}"
      what_gets_skipped: "{什么类型的细节会被略过}"
    
    show_tell_ratio:
      tendency: "强烈Show/平衡/偏Tell"
      tell_acceptable_when: "{哪些情况下该文风允许直接陈述}"
  
  # ── 节奏层 ──────────────────────────────────
  rhythm:
    scene_opening: "{场景开头的惯用方式，如：直接从动作入场/先给环境}'"
    scene_closing: "{场景结尾的惯用方式}"
    tension_building: "{紧张感如何通过句式控制}"
    breathing_points: "{如何制造节奏停顿}"
  
  # ── 禁止清单（最重要）────────────────────────
  hard_prohibitions:
    - "{绝对不能出现的写法1，要具体}"
    - "{绝对不能出现的写法2}"
    - "{绝对不能出现的写法3}"
  
  # ── 文风样本 ─────────────────────────────────
  canonical_samples:
    best_paragraph: |
      {从锚定章中选出最能代表文风的一段，50-100字，原文引用}
    best_dialogue: |
      {最能代表对话风格的一段，原文引用}
    best_description: |
      {最能代表景物/环境描写风格的一段，原文引用}
```
````

输出完成后，将结果保存至 `knowledge-base/style-fingerprint.md`。
这份文件是整个改写工程的**宪法**，后续所有操作均须遵守。

---

## 二、全稿文风评分

运行 `scripts/score_style.py`，对每个章节文件执行以下提示词：

````
你是文风一致性审查员。以下是本书的文风宪法，和需要评分的章节原文。

【文风宪法（style-fingerprint.md 内容）】
{style_fingerprint}

【待评分章节：{chapter_id}】
{chapter_text}

请从以下五个维度评分（1-10分，10分=完全符合文风宪法），
并为每个低于7分的维度给出具体的问题片段举例：

```yaml
chapter_id: "{ch_id}"
scores:
  syntax_consistency: {1-10}      # 句法与宪法的一致性
  vocabulary_consistency: {1-10}  # 词汇风格一致性
  narration_consistency: {1-10}   # 叙述距离与视角一致性
  rhythm_consistency: {1-10}      # 节奏感一致性
  overall: {加权平均，保留一位小数}

problems:  # 仅列出扣分原因，每项含原文引用
  - dimension: "{维度名}"
    score_impact: -{扣了几分}
    excerpt: "{有问题的原文片段，20字以内}"
    issue: "{问题描述}"
    fix_hint: "{一句话修复方向}"

rewrite_priority: "立即/较高/一般/不需要"
# 立即 = overall < 5，整体风格严重偏移
# 较高 = overall 5-6.5，多处明显问题
# 一般 = overall 6.5-7.5，有问题但不影响整体
# 不需要 = overall > 7.5
```
````

所有章节评分完成后，汇总至 `knowledge-base/chapter-index.md`：

```markdown
# 章节文风评分总表

| 章节 | 综合评分 | 改写优先级 | 主要问题 |
|-----|---------|----------|---------|
| 第X章 | X.X | 立即 | 句法/词汇/节奏 |
| ...  | ... | ... | ... |

## 改写优先队列
1. {评分最低章节} — 评分X.X — 主要问题：{问题摘要}
2. ...

## 文风健康概览
- 达标章节（>7.5分）：X章，占比XX%
- 需小改（6.5-7.5）：X章
- 需大改（5-6.5）：X章  
- 需重写（<5）：X章
```
```

---

## Skill B · 改写执行引擎

**文件路径：** `novel-writing/rewrite-engine/SKILL.md`

```markdown
---
name: rewrite-engine
description: >
  基于文风宪法执行章节改写，直接输出改写草稿或带注释的修改建议。
  当用户说"改写第X章"、"帮我改这段"、"按文风修改"时触发。
  必须先确认 knowledge-base/style-fingerprint.md 已存在。
---

# 改写执行引擎

改写有两种输出模式，根据用户需求选择：

| 模式 | 适用场景 | 输出物 |
|-----|---------|-------|
| **批注模式** | 想理解问题所在，自己动手改 | 原文 + 逐处标注问题 + 修改建议 |
| **重写模式** | 直接要可用的草稿 | 改写后全文（保留情节，重写语言）|

---

## 批注模式提示词

````
你是一位严格的文学编辑，手持"文风宪法"，正在对章节草稿进行行级批注。

工作原则：
- 每处批注须引用宪法中的具体条款作为依据
- 给出可直接执行的修改建议，不要只说"改得更好"
- 保护原文中符合宪法的部分，不要过度干预
- 批注密度：问题集中处每段至少1条，流畅处可跳过

【文风宪法】
{style_fingerprint}

【章节原文：{chapter_id}】
{chapter_text}

输出格式：

---
**[批注版：{chapter_id}]**

{原文第一段}

> 🔴 **[句法]** "{问题原文片段}" → 建议改为："{具体修改方向}"
> 依据：宪法§句法层 — {引用宪法中的具体规定}

{原文第二段}

> 🟡 **[词汇]** "{问题原文片段}" → 建议删去/替换为："{具体操作}"
> 依据：宪法§词汇层 — {引用}

{无问题段落直接保留，不加批注}

> ✅ **[节奏]** 本段节奏处理优秀，保留。

---
**批注汇总**

| 问题类型 | 数量 | 最严重的3处 |
|---------|-----|-----------|
| 句法问题 | X处 | {列出} |
| 词汇问题 | X处 | {列出} |
| 叙述距离偏移 | X处 | {列出} |
| 节奏失控 | X处 | {列出} |

**整体判断：** {一句话总结本章主要问题}
**建议改写深度：** 表面修改/中度改写/接近重写
````

---

## 重写模式提示词

重写分两个阶段，**禁止合并为一步**：

### 阶段一：提取情节骨架

````
从以下章节中提取纯粹的情节骨架。
只保留：谁、在哪、做了什么、说了什么（关键台词原意）、结果如何。
完全丢弃：所有语言表达、所有描写方式、所有情绪渲染。

【章节原文：{chapter_id}】
{chapter_text}

输出格式（仅骨架，不要任何文学性语言）：

```yaml
chapter_skeleton:
  id: "{chapter_id}"
  
  scenes:
    - scene_id: S1
      location: "{地点}"
      characters: ["{角色}"]
      core_action: "{发生了什么，一句话}"
      key_dialogue:
        - speaker: "{角色}"
          gist: "{台词核心意思，非原话}"
      outcome: "{本场景结束时的状态变化}"
  
  chapter_end_state: "{全章结束时，人物/情节的状态}"
  must_preserve:     # 原文中必须保留的金句或细节（若有）
    - "{原文引用，需保留的内容}"
```
````

### 阶段二：基于骨架重写

````
你是一位严肃文学作家，正在根据情节骨架重新创作一个章节。

核心任务：情节骨架是唯一的内容约束，语言必须完全遵守文风宪法。
不是"修改原文"，而是"用正确的语言重新讲述这个故事"。

【文风宪法】
{style_fingerprint}

【情节骨架】
{chapter_skeleton}

【must_preserve 段落必须原样保留在合适位置】
{must_preserve_items}

写作前检查清单（内心确认，不输出）：
□ 我知道本章的主导情绪是什么
□ 我选择了正确的入场方式（宪法§rhythm.scene_opening）
□ 我的句式与宪法§syntax一致
□ 我不会使用任何宪法§hard_prohibitions中的写法

开始写作。写完后，对照宪法逐项自查，发现问题立即修改。
最终只输出改写后的正文，不输出分析过程。
字数目标：与原章节相近，允许±15%浮动。
````

---

## 改写后验收提示词

每章改写完成后执行：

````
对照文风宪法，验收以下改写章节是否达标。
这是最终质检，标准须严格。

【文风宪法】
{style_fingerprint}

【改写后章节】
{rewritten_chapter}

输出验收报告：

```yaml
qa_report:
  chapter_id: ""
  pass: true/false
  
  dimension_scores:
    syntax: {1-10}
    vocabulary: {1-10}
    narration: {1-10}
    rhythm: {1-10}
    overall: {加权均值}
  
  violations:  # 仍未达标的问题（若pass=true则为空）
    - excerpt: "{问题片段}"
      issue: ""
      fix: ""
  
  compared_to_original:
    improvement: "显著/明显/轻微/无改善/变差"
    notes: "{与原章节相比的主要变化}"
  
  verdict: "通过/需小修/打回重写"
```
````

---

## `knowledge-base/rewrite-log.md` 格式

```markdown
# 改写进度追踪

更新时间：{YYYY-MM-DD}

| 章节 | 原始评分 | 改写模式 | 验收评分 | 状态 | 备注 |
|-----|---------|---------|---------|-----|-----|
| 第X章 | 4.2 | 重写 | 8.1 | ✅ 完成 | |
| 第X章 | 6.0 | 批注 | — | 🔄 进行中 | |
| 第X章 | 7.8 | — | — | ⏭ 跳过 | 无需改写 |

## 统计
- 总章节：X
- 已完成：X（XX%）
- 平均分提升：+X.X
```
```

---

## `scripts/score_style.py` 伪代码结构

```python
"""
逐章文风评分脚本
用法：python scripts/score_style.py
"""

import os, json
from pathlib import Path
from anthropic import Anthropic

client = Anthropic()

def score_chapter(chapter_id: str, chapter_text: str, fingerprint: str) -> dict:
    """对单章进行文风评分，返回结构化结果"""
    
    prompt = SCORE_PROMPT_TEMPLATE.format(
        style_fingerprint=fingerprint,
        chapter_id=chapter_id,
        chapter_text=chapter_text
    )
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    # 解析 YAML 输出
    return parse_yaml_response(response.content[0].text)


def main():
    chapters_dir = Path("drafts/chapters")
    fingerprint = Path("knowledge-base/style-fingerprint.md").read_text()
    results = []

    for ch_file in sorted(chapters_dir.glob("*.txt")):
        print(f"评分中：{ch_file.name}...")
        result = score_chapter(
            chapter_id=ch_file.stem,
            chapter_text=ch_file.read_text(),
            fingerprint=fingerprint
        )
        results.append(result)

    # 按评分排序，生成优先队列
    results.sort(key=lambda x: x["scores"]["overall"])
    
    # 写入 chapter-index.md
    write_chapter_index(results)
    print("评分完成。查看 knowledge-base/chapter-index.md")
```

---

## `scripts/batch_rewrite.py` 伪代码结构

```python
"""
批量改写调度脚本
用法：python scripts/batch_rewrite.py --priority immediate
      python scripts/batch_rewrite.py --chapter ch005
      python scripts/batch_rewrite.py --mode annotate --chapter ch003
"""

import argparse
from pathlib import Path

def rewrite_chapter(chapter_id: str, mode: str, fingerprint: str) -> str:
    """
    mode = "annotate"  → 批注模式，输出带注释的原文
    mode = "rewrite"   → 重写模式，两阶段执行
    """
    chapter_text = Path(f"drafts/chapters/{chapter_id}.txt").read_text()
    
    if mode == "annotate":
        return run_annotate_prompt(chapter_text, fingerprint)
    
    elif mode == "rewrite":
        # 阶段一：提取骨架
        skeleton = run_skeleton_extraction(chapter_text)
        # 阶段二：基于骨架重写
        rewritten = run_rewrite_prompt(skeleton, fingerprint)
        # 验收
        qa = run_qa_check(rewritten, fingerprint)
        
        # 若验收未通过，提示用户
        if qa["verdict"] == "打回重写":
            print(f"⚠️  {chapter_id} 验收未通过，问题：{qa['violations']}")
        
        return rewritten, qa


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--priority", choices=["immediate", "high", "all"])
    parser.add_argument("--chapter", type=str)
    parser.add_argument("--mode", choices=["annotate", "rewrite"], default="rewrite")
    args = parser.parse_args()

    fingerprint = Path("knowledge-base/style-fingerprint.md").read_text()
    chapter_index = load_chapter_index()

    # 确定改写目标
    if args.chapter:
        targets = [args.chapter]
    elif args.priority:
        targets = [c["id"] for c in chapter_index 
                   if c["rewrite_priority"] == args.priority]
    
    for ch_id in targets:
        print(f"\n{'='*50}")
        print(f"处理：{ch_id}（模式：{args.mode}）")
        result, qa = rewrite_chapter(ch_id, args.mode, fingerprint)
        
        # 保存输出
        out_path = Path(f"rewrites/{ch_id}_rewrite.txt")
        out_path.write_text(result)
        
        # 更新进度日志
        update_rewrite_log(ch_id, qa)
        print(f"✅ 完成，已保存至 {out_path}")
```

---

## 给 Claude Code 的一次性初始化指令

将以下内容作为第一条指令发送给 Claude Code：

```
项目初始化任务，按以下顺序执行：

1. 读取 novel-writing/style-engine/SKILL.md

2. 我会提供1-2个"文风锚定章"的原文，请执行文风指纹提取，
   将结果写入 knowledge-base/style-fingerprint.md

3. 运行 scripts/split_chapters.py，将 drafts/manuscript.txt 
   按章节标题切割为独立文件

4. 运行 scripts/score_style.py，对所有章节评分，
   写入 knowledge-base/chapter-index.md

5. 输出改写优先队列，告知我：
   - 需要立即改写的章节（评分<5）有哪些
   - 每章的主要问题是什么
   - 建议从哪章开始，用哪种改写模式

完成第5步后等待我的指令，不要自动开始改写。
```

---

## 关键设计说明

**为什么分批注模式和重写模式？**

不是所有章节都值得整章重写。评分在 6-7.5 分的章节，
用批注模式让作者自己动手修改，能更好地保留原稿中模糊但真实的个人语感。
评分低于 5 分的章节，骨架保留重写法比逐句修改效率高 3-5 倍。

**为什么重写分两个阶段？**

直接要求"按文风重写这章"会导致模型在原文措辞和文风宪法之间反复妥协，
结果两头不讨好。先提取骨架，物理隔断与原文的联系，
再从零用正确的语言写作，质量显著更高。

**文风指纹的核心是禁止清单**

所有正面描述（"句子简洁"）都是模糊的，
只有"禁止使用排比句"、"禁止在情绪描写中使用感叹号"
这类具体的禁止指令才能被严格执行。
在建立文风指纹时，`hard_prohibitions` 字段是最重要的部分。

---

*本版本（v3）针对文风和语言质量问题深度优化，删除了结构诊断模块。*
*如后续需要情节/人物修订，可叠加使用 v2 中的对应 Skill。*
