---
title: Whisper
slug: whisper
date: '2026-10-03T00:00:00+08:00'
draft: false
categories:
  - AI 模型
tags:
  - 语音识别
  - 音频转写
description: 将语音转换为文字的模型，适合会议、访谈、字幕和音频资料整理。
linkUrl: 'https://developers.openai.com/api/docs/models/whisper-1'
linkSource: 官方文档
---

Whisper 是通用语音识别模型，用于将音频转换为文本，也支持多语言语音识别及相关任务。它适合先把会议、访谈和产品演示整理成文字，再交给语言模型提取要点，让音频资料更容易检索和复用。

## 主要用途

- **转写会议与访谈**：形成文字初稿，便于后续编辑与归档。
- **准备字幕内容**：将录音转为文字，再通过字幕工具校对时间与显示。
- **整理音频资料**：让语音内容进入摘要、分类或知识库流程。

## 使用场景

业务团队可以将产品培训录音转写，再生成术语表和常见问题。噪声、口音和专业名词会影响结果，型号、数量和人名应校对；说话人区分也需要按具体方案实现。

## 相关工具

[n8n](n8n.md) 可在支持接口中安排处理；[Dify](dify.md) 整理转写后的文本；[CosyVoice](cosyvoice.md) 用于文本生成语音，与语音识别是相反方向的任务。

[查看官方模型文档](https://developers.openai.com/api/docs/models/whisper-1)
