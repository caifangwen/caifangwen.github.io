---
title: Obsidian博客写作指南
date: 2026-01-29T01:23:23+08:00
draft: true
description: ""
summary: ""
tags:
  - 
categories:
  - 网站
cover: ""
author: Frida
---

# Obsidian 写 Hugo 博客完整指南

## 一、Obsidian Vault 设置

### 1. 创建 Obsidian Vault
将 Hugo 项目的 `content` 目录作为 Vault：
```
C:\Users\Frida\pages\content
```

或创建软链接：
```bash
mklink /D "C:\Users\Frida\Obsidian-Blog" "C:\Users\Frida\pages\content"
```

### 2. 推荐的文件夹结构
```
content/
├── posts/           # 主要文章
│   ├── 2025/
│   ├── tech/
│   └── life/
├── projects/        # 项目展示
├── drafts/          # 草稿（不发布）
└── templates/       # 模板文件
```

---

## 二、Obsidian 插件推荐

### 必装插件

#### 1. **Templater**
快速插入 Front Matter 模板

**安装**：设置 → 社区插件 → 搜索 "Templater"

**模板示例** (`templates/blog-post.md`)：
```markdown
---
title: "<% tp.file.title %>"
date: <% tp.date.now("YYYY-MM-DDTHH:mm:ss+08:00") %>
draft: true
description: ""
summary: ""
tags: 
  - 
categories: 
  - 
cover: ""
author: "Frida"
---

## 
```

**使用**：
1. 创建新文件
2. `Ctrl+P` → "Templater: Insert Template"
3. 选择模板

**快捷键设置**：
设置 → Templater → Hotkeys → 设置为 `Alt+T`

---

#### 2. **QuickAdd**
快速创建带 Front Matter 的文章

**配置宏**：
```
名称: 新建博客文章
类型: Template
模板路径: templates/blog-post.md
文件夹: posts/{{DATE:YYYY/MM}}
文件名: {{VALUE}}.md
```

**快捷键**：`Ctrl+Shift+N`

---

#### 3. **Linter**
自动格式化 Front Matter

**配置**：
```yaml
Format YAML Array: single-line
YAML Timestamp: YYYY-MM-DDTHH:mm:ss+08:00
```

---

#### 4. **YAML Front Matter**
可视化编辑 Front Matter

---

## 三、Front Matter 模板集合

### 1. 通用博客文章
```yaml
---
title: "文章标题"
date: 2025-01-28T15:30:00+08:00
draft: false
description: "SEO 描述，150字以内"
summary: "首页显示的摘要"
tags: 
  - 标签1
  - 标签2
categories: 
  - 分类
cover: "images/cover.jpg"
author: "Frida"
---
```

### 2. 技术文章
```yaml
---
title: "技术文章标题"
date: 2025-01-28T15:30:00+08:00
draft: false
description: ""
summary: ""
tags: 
  - 技术
  - 编程
  - Python
categories: 
  - 技术博客
cover: ""
author: "Frida"
toc: true
series: 
  - Python 系列教程
---
```

### 3. 系列文章
```yaml
---
title: "Python 入门教程（一）"
date: 2025-01-28T15:30:00+08:00
draft: false
description: ""
summary: ""
tags: 
  - Python
  - 教程
categories: 
  - 教程
series: 
  - Python 入门教程
toc: true
---
```

### 4. 项目展示
```yaml
---
title: "我的项目"
date: 2025-01-28T15:30:00+08:00
draft: false
description: ""
summary: ""
cover: "cover.jpg"
tags: 
  - React
  - TypeScript
categories: 
  - 项目
demo: "https://demo.example.com"
source: "https://github.com/username/project"
status: "completed"
tech_stack:
  - React
  - TypeScript
  - Tailwind CSS
---
```

---

## 四、Obsidian 写作技巧

### 1. 使用 Properties（属性面板）
Obsidian 新版本支持可视化编辑 Front Matter

在文件开头输入 `---` 后会自动出现属性面板

### 2. Snippets（代码片段）
创建常用的 Front Matter 片段

**位置**：设置 → Snippets

**示例** (`blog-meta.css`)：
```css
/* 在编辑器中高亮显示草稿 */
.markdown-source-view.is-live-preview .cm-line:has(.cm-yaml-front-matter-start) ~ .cm-line:has(.cm-yaml-front-matter-end) {
  background: rgba(255, 200, 0, 0.1);
}
```

### 3. 图片管理
**推荐方式**：使用 Page Bundle

```
posts/
└── my-article/
    ├── index.md
    ├── cover.jpg
    └── image1.png
```

在 Obsidian 中直接拖拽图片到文件夹，引用：
```markdown
![](cover.jpg)
```

**Obsidian 设置**：
设置 → 文件与链接 → 新附件的默认位置 → "当前文件所在文件夹"

### 4. 标签管理
使用 Obsidian 的标签面板管理所有标签

**快捷键**：`Ctrl+P` → "搜索标签"

### 5. 草稿管理
**方法1**：Front Matter
```yaml
draft: true
```

**方法2**：移到 drafts 文件夹
```
content/drafts/  # Hugo 不会构建此目录
```

---

## 五、快速工作流

### 工作流 A：模板 + Templater
1. `Ctrl+N` 创建新文件
2. `Alt+T` 插入模板
3. 填写标题、标签等
4. 开始写作
5. 完成后设置 `draft: false`

### 工作流 B：QuickAdd 宏
1. `Ctrl+Shift+N` 触发宏
2. 输入文章标题
3. 自动创建文件并插入模板
4. 开始写作

---

## 六、Front Matter 字段速查

### 必填字段
```yaml
title: "文章标题"
date: 2025-01-28T15:30:00+08:00
draft: false
```

### 推荐字段
```yaml
description: "SEO 描述"
summary: "首页摘要"
tags: [标签1, 标签2]
categories: [分类]
```

### 可选字段
```yaml
cover: "封面图路径"
author: "作者"
toc: true                    # 启用目录
series: [系列名称]           # 系列文章
featured: true               # 精选文章
weight: 1                    # 排序权重
slug: "custom-url"           # 自定义 URL
aliases: ["/old-url"]        # URL 别名
```

### 项目专用字段
```yaml
demo: "演示地址"
source: "源码地址"
status: "completed"          # completed, in_progress, planning
tech_stack: [React, Node.js]
```

---

## 七、Obsidian 社区插件组合推荐

### 方案 A：极简派
- Templater
- Linter

### 方案 B：全功能
- Templater
- QuickAdd
- Linter
- YAML Front Matter
- Tag Wrangler（标签管理）
- Calendar（日历视图）

---

## 八、常见问题

### Q: 图片路径怎么写？
A: 使用相对路径或 Page Bundle
```markdown
![](../images/pic.jpg)  # 相对路径
![](cover.jpg)          # Page Bundle
```

### Q: 日期格式必须这样吗？
A: 推荐使用 ISO 8601 格式：
```yaml
date: 2025-01-28T15:30:00+08:00
```

也可以简化：
```yaml
date: 2025-01-28
```

### Q: 如何批量修改 Front Matter？
A: 使用 Linter 插件或正则替换

### Q: 标签用中文还是英文？
A: 都可以，建议统一，推荐英文（URL 友好）

---

## 九、Obsidian + Hugo 同步方案

### 方案 A：直接在 content 目录工作
优点：实时预览，简单直接
缺点：混合 Hugo 配置文件

### 方案 B：独立 Vault + 同步脚本
创建同步脚本 `sync-to-hugo.bat`：
```batch
@echo off
robocopy "C:\Users\Frida\Obsidian-Blog" "C:\Users\Frida\pages\content" /MIR /XD .obsidian
echo 同步完成！
pause
```

---

## 十、推荐的 Templater 模板

放在 `content/templates/` 目录：

### blog-post.md
```markdown
---
title: "<% tp.file.title %>"
date: <% tp.date.now("YYYY-MM-DDTHH:mm:ss+08:00") %>
draft: true
description: ""
summary: ""
tags: 
categories: 
cover: ""
author: "Frida"
---

## 
```

### tech-post.md
```markdown
---
title: "<% tp.file.title %>"
date: <% tp.date.now("YYYY-MM-DDTHH:mm:ss+08:00") %>
draft: true
description: ""
summary: ""
tags: 
  - 技术
categories: 
  - 技术博客
toc: true
---

## 概述

## 问题

## 解决方案

## 总结
```

### daily-note.md
```markdown
---
title: "日记 - <% tp.date.now("YYYY-MM-DD") %>"
date: <% tp.date.now("YYYY-MM-DDTHH:mm:ss+08:00") %>
draft: true
tags: 
  - 日记
categories: 
  - 生活
---

## 今日记录

### 工作

### 学习

### 生活

## 想法
```
