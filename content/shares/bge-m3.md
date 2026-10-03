---
title: BGE-M3
slug: bge-m3
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - AI 模型
tags:
  - 嵌入模型
  - 多语言检索
description: 支持多语言与多种检索表示的嵌入模型，适合知识库召回和语义搜索研究。
linkUrl: 'https://huggingface.co/BAAI/bge-m3'
linkSource: Hugging Face
---

BGE-M3 是 BAAI 发布的嵌入模型，面向多语言和多种检索方式提供文本表示能力。它适合为知识库建立语义召回，也适合研究稠密、稀疏和多向量等方式如何影响相关内容的查找效果。

## 主要用途

- **生成语义向量**：将问题与文档表示为向量，按相似程度检索。
- **处理多语言资料**：为不同语言内容建立检索基础，比较跨语言匹配效果。
- **研究检索组合**：根据支持的表示形式与引擎能力安排检索方案。

## 使用场景

外贸资料库可以同时保存中英文产品内容，用真实客户问题测试召回。模型支持某种表示不代表所选数据库自动支持全部用法，索引设计需与实际检索引擎匹配。

## 相关工具

[Qwen3-Embedding](qwen3-embedding.md) 可对比检索质量；[Qdrant](qdrant.md) 提供向量存储；[BGE Reranker](bge-reranker.md) 用于候选排序；[AnythingLLM](anythingllm.md) 可了解知识问答的完整工作方式。

[查看官方模型卡](https://huggingface.co/BAAI/bge-m3)
