---
title: BGE Reranker v2 M3
slug: bge-reranker
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - AI 模型
tags:
  - 重排模型
  - RAG
description: 对问题与候选文本相关性评分的重排模型，适合改善检索结果排序。
linkUrl: 'https://huggingface.co/BAAI/bge-reranker-v2-m3'
linkSource: Hugging Face
---

BGE Reranker v2 M3 是用于检索结果重排的模型，将问题和候选文本一起输入并计算相关性分数。它适合放在初步召回之后，把更相关的资料排到前面，再交给语言模型生成回答。它与只为文本生成向量的嵌入模型承担不同任务。

## 主要用途

- **重排候选资料**：对已找到的段落重新评分，改善前几个结果的相关性。
- **补充知识检索**：在向量或关键词召回后加入更细的比较步骤。
- **评价排序效果**：围绕真实问题检查正确资料是否更靠前，判断是否值得增加成本。

## 使用场景

知识库可以先召回一批资料，再用重排模型选出更适合回答的少量片段。候选过多会增加耗时；初步检索没有找到正确资料时，重排也无法凭空补回。

## 相关工具

[BGE-M3](bge-m3.md) 与 [Qwen3-Embedding](qwen3-embedding.md) 负责召回表示；[Qdrant](qdrant.md) 提供检索层；[LangGraph](langgraph.md) 可组织召回、重排和回答步骤。

[查看官方模型卡](https://huggingface.co/BAAI/bge-reranker-v2-m3)
