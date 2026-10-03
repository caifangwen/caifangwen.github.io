---
title: Qwen3-Embedding
slug: qwen3-embedding
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - AI 模型
tags:
  - 嵌入模型
  - RAG
description: 将文本映射为向量的模型系列，适合语义检索和多语言知识库。
linkUrl: 'https://github.com/QwenLM/Qwen3-Embedding'
linkSource: GitHub
---

Qwen3-Embedding 将文本转换为向量，帮助系统根据语义寻找相关内容。它适合知识库检索、相似文本比较和多语言搜索，也可与同项目中的重排模型组成“先召回、再排序”的检索流程。嵌入模型本身不会直接生成问答答案。

## 主要用途

- **建立文档向量**：为段落与资料生成可存储的数值表示。
- **执行语义召回**：将问题转换为向量，检索相关资料片段。
- **比较相似内容**：为聚类、推荐或重复内容分析提供基础表示。

## 使用场景

产品知识库可以先统一文档切分与元数据，再生成向量并建立索引。更换嵌入模型后通常需要重新生成文档向量，查询与索引也应采用匹配的模型和配置。

## 相关工具

[Qdrant](qdrant.md) 存储与查询向量；[BGE-M3](bge-m3.md) 可对比嵌入效果；[BGE Reranker](bge-reranker.md) 可对候选资料进一步排序；[Qwen3](qwen3.md) 可生成最终回答。

[查看官方 GitHub 仓库](https://github.com/QwenLM/Qwen3-Embedding)
