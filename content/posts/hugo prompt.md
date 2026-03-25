---
title: Hugo 主题合并提示词指南
slug: "hugo-prompt"
date: 2026-03-26T12:00:00+08:00
draft: false
tags:
  - Hugo
  - 博客
categories:
  - 技术博客
description: "本文档将合并流程拆解为可逐步执行的提示词，每一步对应一个独立操作，粘贴给 AI 即可驱动执行。"
---

## 合并思路总览

Hugo 的核心规则：**项目文件优先于主题文件**，同名文件项目侧永远胜出。

合并本质上是将主题文件"提升"到项目根目录，再用已有的定制文件覆盖冲突项。整个流程分为以下阶段：

```
备份 → layouts合并 → assets/static合并 → 配置合并 → 验证 → 移除主题
```

---

## Step 1：备份项目

**提示词：**

```
请帮我在当前 Hugo 项目根目录执行备份操作。

要求：
1. 用 git 提交当前状态，commit message 为 "chore: backup before theme merge"
2. 如果没有 git，则将整个项目目录打包为 zip，命名为 backup-before-merge.zip
3. 确认备份完成后输出备份文件路径或 commit hash
```

---

## Step 2：复制 layouts 模板

**提示词：**

```
我正在将 Hugo 主题 [主题名] 合并到项目根目录。

请帮我执行 layouts 目录的初次复制：

1. 将 themes/[主题名]/layouts/ 下的所有文件复制到项目根目录的 layouts/
2. 复制时不覆盖项目根目录已存在的同名文件（使用 cp -rn 或等效方式）
3. 复制完成后，列出以下两类文件：
   - 【跳过的文件】：因项目侧已存在而未复制的文件（这些需要手动合并）
   - 【新增的文件】：从主题复制过来的新文件

请将结果按目录分组展示。
```

---

## Step 3：识别 layouts 冲突文件并生成合并清单

**提示词：**

```
我需要找出 layouts/ 目录中需要手动合并的冲突文件。

已知规则：
- 项目根目录的 layouts/ 是我的定制版本
- themes/[主题名]/layouts/ 是主题原始版本
- 同名文件需要手动对比合并

请执行：
1. 找出在项目 layouts/ 和 themes/[主题名]/layouts/ 中同时存在的所有文件
2. 对每个冲突文件，说明它属于哪个类型：
   - partials（局部模板）
   - shortcodes（短代码）
   - _default（默认列表/单页模板）
   - 其他

输出格式为一张 Markdown 表格，列为：文件路径 | 冲突类型 | 建议处理方式
```

---

## Step 4：逐文件执行三方合并（可循环执行）

**提示词（对每个冲突文件单独执行）：**

```
请帮我合并以下 Hugo 模板文件：

文件路径：layouts/[文件相对路径]

规则：
- 我的版本（项目侧）= layouts/[文件路径]
- 主题版本 = themes/[主题名]/layouts/[文件路径]

请执行：
1. 并排展示两个版本的差异（diff 格式）
2. 分析每处差异，判断应保留哪一方：
   - 保留我的版本：样式类名、自定义 HTML、个性化内容
   - 保留主题版本：结构性标签、新增的功能逻辑
   - 两者合并：主题新增了功能，而我也改动了同区域
3. 输出合并后的完整文件内容
4. 如有合并判断不确定的地方，用注释 {{/* MERGE: 说明 */}} 标记
```

---

## Step 5：复制 assets 和 static 目录

**提示词：**

```
请帮我合并 Hugo 主题的静态资源目录。

执行以下操作（均使用不覆盖模式，保护我的定制文件）：
1. cp -rn themes/[主题名]/assets/ assets/
2. cp -rn themes/[主题名]/static/ static/

完成后：
1. 列出从主题复制过来的新文件（按目录分组）
2. 列出因项目侧已存在而跳过的文件
3. 对跳过的文件，检查两版本是否存在实质性差异（如主题更新了字体、图标版本），如有则提示需人工检查
```

---

## Step 6：复制 i18n / data / archetypes

**提示词：**

```
请帮我合并 Hugo 主题的辅助配置目录。

依次执行（均使用不覆盖模式）：
1. cp -rn themes/[主题名]/i18n/ i18n/        # 多语言翻译文件
2. cp -rn themes/[主题名]/data/ data/        # 数据文件
3. cp -rn themes/[主题名]/archetypes/ archetypes/  # 内容模板

完成后输出：
- 各目录新增了哪些文件
- 哪些文件被跳过（需人工对比）
```

---

## Step 7：合并 hugo.toml 配置

**提示词：**

```
请帮我合并 Hugo 配置文件。

我的配置：hugo.toml（或 config.yaml）
主题示例配置：themes/[主题名]/exampleSite/hugo.toml

合并规则：
1. 删除 theme = "[主题名]" 这一行（迁移后不再需要）
2. [params] 下的参数：保留我改过的值，主题独有且我未修改的默认值可丢弃
3. [menu]：以我的配置为准
4. [markup] / [outputs] / [build]：逐项对比，取并集，不丢弃任何一方有效配置
5. 主题独有的 [params.xxx]：检查模板文件中是否有引用，有引用则保留，否则可删

请：
1. 展示 diff 对比
2. 给出合并建议（表格形式：配置项 | 我的值 | 主题值 | 建议处理）
3. 输出合并后的完整配置文件
```

---

## Step 8：本地验证

**提示词：**

```
请帮我验证 Hugo 站点在主题合并后是否正常工作。

执行：
1. 运行 hugo server -D 并捕获输出
2. 检查是否有 ERROR 或 WARN 级别的日志
3. 对每条错误，给出可能原因和修复建议，常见问题包括：
   - can't evaluate field xxx → 缺少 params 配置项
   - template not found → 模板路径错误
   - shortcode not found → shortcode 文件缺失
   - partial not found → partial 路径引用错误

将错误按严重程度分类：
- 🔴 阻断渲染（必须修复）
- 🟡 功能缺失（建议修复）
- ⚪ 警告（可暂时忽略）
```

---

## Step 9：全站页面验收

**提示词：**

```
请帮我生成 Hugo 站点的验收检查清单，并逐项确认。

站点地址：http://localhost:1313

检查以下页面类型：
1. 首页（/）→ 检查：导航、Hero 区域、文章列表
2. 文章列表页（/posts/ 或 /blog/）→ 检查：分页、标签、分类
3. 单篇文章页 → 检查：正文渲染、代码高亮、图片、shortcode
4. 关于/自定义页面 → 检查：自定义 CSS 是否生效
5. 404 页面（/404.html）→ 检查：是否存在且样式正常

对每个页面，确认：
- [ ] 样式加载正常（无裸奔 HTML）
- [ ] 字体和颜色与迁移前一致
- [ ] 导航链接可正常跳转
- [ ] 自定义功能（搜索、评论、目录等）正常工作

如发现异常，请描述现象并给出排查思路。
```

---

## Step 10：移除主题

**提示词：**

```
确认站点验收通过后，请帮我彻底移除主题依赖。

执行以下操作：
1. 确认 hugo.toml 中已不含 theme = "[主题名]" 行
2. 删除主题目录：
   - 如果是普通目录：rm -rf themes/[主题名]
   - 如果是 git submodule：
     a. git submodule deinit themes/[主题名]
     b. git rm themes/[主题名]
     c. 手动删除 .gitmodules 中对应条目
3. 提交最终状态：
   git add -A
   git commit -m "chore: remove theme dependency, fully standalone site"

完成后输出最终的项目目录结构（只展示到第二层）。
```

---

## 常见问题速查提示词

### CSS 变量冲突

```
我的 Hugo 站点合并后出现 CSS 变量冲突，主题的 main.css 和我的 custom.css 定义了同名变量，
后者没有生效。请帮我：
1. 找出冲突的 CSS 变量名
2. 将我的变量提取到 assets/css/variables.css
3. 修改模板中的 CSS 引入顺序，确保我的变量文件最后加载
```

### Shortcode 同名验证

```
我的项目和主题都有 layouts/shortcodes/[名称].html，合并后请帮我验证：
1. 当前生效的是哪个版本（应为项目根目录版本）
2. 在内容文件中搜索所有使用该 shortcode 的地方，各渲染一个样例确认输出正确
```

### 缺失 params 修复

```
hugo server 报错 "can't evaluate field [字段名] in type page.Params"

请帮我：
1. 在 layouts/ 中搜索所有引用 .Params.[字段名] 的模板
2. 判断这个 param 是否必须保留（有实际功能）还是可以删除（主题遗留废弃参数）
3. 给出修复方案：要么在 hugo.toml [params] 中补回该字段，要么在模板中加 with 条件保护
```

---

## 迁移完成后的确认清单

```
- [ ] hugo.toml 中无 theme = 行
- [ ] themes/ 目录已删除（或 git submodule 已移除）
- [ ] hugo server 无 ERROR 级别日志
- [ ] 首页、列表页、文章页视觉正常
- [ ] 自定义 CSS/JS 功能正常
- [ ] git log 有完整的迁移提交记录
- [ ] 项目可独立构建：hugo --minify 输出正常
```

---

> 完成以上所有步骤后，你的 Hugo 站点将完全脱离主题依赖，所有代码都在你的版本控制之下。