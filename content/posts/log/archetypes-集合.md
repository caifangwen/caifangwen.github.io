---
title: archetypes-集合
date: 2026-01-29T01:22:32+08:00
draft: false
description: ""
summary: ""
tags:
  - 
categories:
  - 网站
cover: ""
author: Frida
---

# Hugo Archetypes 模板集合

## 说明
将这些文件放到 `archetypes/` 目录下

---

## 1. default.md - 通用文章模板

```yaml
---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
description: ""
summary: ""
tags: []
categories: []
cover: ""
author: "Frida"
---

<!-- 在这里开始写作 -->
```

**使用**: `hugo new posts/my-post.md`

---

## 2. tech-post.md - 技术文章模板

```yaml
---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
description: ""
summary: ""
tags: ["技术"]
categories: ["技术博客"]
cover: ""
author: "Frida"
series: []
toc: true
---

## 概述

<!-- 简要介绍技术主题 -->

## 问题背景

<!-- 描述要解决的问题 -->

## 解决方案

<!-- 详细的解决方案 -->

### 步骤一

### 步骤二

## 代码示例

```python
# 代码示例
```

## 注意事项

<!-- 需要注意的点 -->

## 总结

<!-- 总结要点 -->

## 参考资料

- [链接1](url)
- [链接2](url)
```

**使用**: `hugo new --kind tech-post posts/my-tech-article.md`

---

## 3. tutorial.md - 教程模板

```yaml
---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
description: ""
summary: ""
tags: ["教程"]
categories: ["教程"]
cover: ""
author: "Frida"
series: []
toc: true
---

## 前言

<!-- 教程介绍 -->

## 准备工作

### 环境要求
- 要求1
- 要求2

### 需要的工具
- 工具1
- 工具2

## 教程步骤

### 第一步：

### 第二步：

### 第三步：

## 常见问题

### 问题1

**解决方案**：

### 问题2

**解决方案**：

## 总结

<!-- 回顾重点 -->

## 下一步

<!-- 推荐后续学习 -->
```

**使用**: `hugo new --kind tutorial posts/my-tutorial.md`

---

## 4. diary.md - 日记/随笔模板

```yaml
---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
description: ""
summary: ""
tags: ["生活", "随笔"]
categories: ["日记"]
cover: ""
author: "Frida"
---

<!-- 今天的心情、想法、经历... -->
```

**使用**: `hugo new --kind diary posts/2025-01-28-diary.md`

---

## 5. projects.md - 项目展示模板

```yaml
---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
description: ""
summary: ""
cover: ""
tags: []
categories: ["项目"]

# 项目特定字段
demo: ""           # 在线演示地址
source: ""         # GitHub 源码地址
status: "completed" # completed, in_progress, planning
tech_stack:
  - ""
  - ""
featured: false    # 是否在首页显示
---

## 项目简介

<!-- 项目是什么，解决什么问题 -->

## 主要功能

- 功能1
- 功能2
- 功能3

## 技术栈

<!-- 使用的技术和工具 -->

## 开发过程

<!-- 开发中的思考和挑战 -->

## 项目亮点

<!-- 特色功能或技术难点 -->

## 未来计划

<!-- 后续改进方向 -->

## 截图展示

![截图1](screenshot1.png)
```

**使用**: `hugo new --kind projects projects/my-project/index.md`

---

## 6. reading-notes.md - 读书笔记模板

```yaml
---
title: "《书名》读书笔记"
date: {{ .Date }}
draft: true
description: ""
summary: ""
tags: ["读书笔记"]
categories: ["阅读"]
cover: ""
author: "Frida"

# 书籍信息
book:
  title: ""
  author: ""
  publisher: ""
  year: ""
  rating: ""
---

## 基本信息

- **书名**：
- **作者**：
- **出版社**：
- **出版年份**：
- **我的评分**：⭐⭐⭐⭐⭐

## 内容摘要

<!-- 书籍主要内容 -->

## 核心观点

### 观点一

### 观点二

### 观点三

## 精彩摘录

> 引用的句子

## 个人感悟

<!-- 读后的思考和收获 -->

## 实践应用

<!-- 如何应用到实际生活中 -->
```

**使用**: `hugo new --kind reading-notes posts/book-name.md`

---

## 如何使用这些模板

### 1. 保存模板文件
将上述模板保存到 `archetypes/` 目录：
```
archetypes/
├── default.md
├── tech-post.md
├── tutorial.md
├── diary.md
├── projects.md
└── reading-notes.md
```

### 2. 创建新内容
```bash
# 使用默认模板
hugo new posts/my-post.md

# 使用技术文章模板
hugo new --kind tech-post posts/react-hooks.md

# 使用教程模板
hugo new --kind tutorial posts/docker-guide.md

# 使用日记模板
hugo new --kind diary posts/2025-01-28.md

# 使用项目模板
hugo new --kind projects projects/my-app/index.md

# 使用读书笔记模板
hugo new --kind reading-notes posts/atomic-habits.md
```

### 3. 自定义模板
你可以根据需要创建更多模板，例如：
- `interview.md` - 面试笔记
- `weekly.md` - 周报
- `review.md` - 产品评测
- `translation.md` - 翻译文章

只需在 `archetypes/` 目录创建新的 `.md` 文件即可！
