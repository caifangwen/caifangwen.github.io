---
title: "如何让 AI 做 Code Review：工具选型与实战配置完全指南"
date: 2026-03-23T03:34:33+08:00
lastmod: 2026-03-23T03:34:33+08:00
draft: false
tags: ["AI", "Code Review", "GitHub Actions", "CodeRabbit", "CI/CD", "DevOps", "自动化"]
categories: ["AI工作流"]
description: "从工具选型到落地配置，手把手教你把 AI 引入代码审查流程，实现「机器先审、人工后判」的高效研发协作模式。"
author: "Claude"
toc: true
---

## 为什么要让 AI 做 Code Review？

传统代码审查面临几个痛点：

- **审查积压**：工程师忙，PR 等待 24 小时以上才有人看很常见
- **质量参差不齐**：不同审查者标准不同，新人审查经验不足
- **重复劳动**：大量时间花在指出格式问题、命名不规范等低价值工作上
- **时区问题**：跨时区团队等待审查效率极低

AI Code Review 的价值在于：

- **即时响应**：PR 创建后秒级给出反馈，无需等待
- **标准统一**：不受情绪、疲劳影响，规则执行一致
- **覆盖全面**：同时分析逻辑、安全、性能、可读性
- **减轻人工负担**：让人类审查者专注于业务逻辑和架构决策

---

## AI Code Review 的三种模式

### 模式一：本地 AI 辅助（开发阶段）

在代码写完、提交之前，借助 IDE 插件让 AI 实时提示问题。

**代表工具：**
- GitHub Copilot（VS Code / JetBrains）
- Cursor
- Continue（开源，支持本地模型）

**适用场景：** 个人开发时的实时辅助，不进入团队流程。

---

### 模式二：PR 自动审查机器人（团队协作）

每次提交 PR，AI 自动分析 Diff 并在 PR 页面发布评论。

**代表工具：**
- **CodeRabbit**（最成熟，支持中文）
- **Qodo Merge**（前身 PR-Agent，开源可自托管）
- **Sourcery**（Python 专项）
- **GitHub Copilot Code Review**（GitHub 官方，beta）

**适用场景：** 团队协作，嵌入现有 GitHub / GitLab 工作流。

---

### 模式三：CI/CD 集成自定义审查（完全可控）

在 CI 流水线中调用 AI API，自定义审查规则和输出格式。

**代表工具：** OpenAI API / Claude API + GitHub Actions

**适用场景：** 需要高度定制化，或有数据安全要求的团队。

---

## 方案一：接入 CodeRabbit（推荐新手）

CodeRabbit 是目前最易用、功能最全的 AI Code Review 工具，支持 GitHub 和 GitLab，对开源仓库免费。

### 安装步骤

1. 访问 [coderabbit.ai](https://coderabbit.ai)
2. 用 GitHub 账号登录，授权仓库访问权限
3. 在目标仓库安装 CodeRabbit GitHub App
4. 完成，下次创建 PR 自动触发

### 配置文件

在仓库根目录创建 `.coderabbit.yaml`：

```yaml
# .coderabbit.yaml
language: "zh-CN"          # 使用中文审查

reviews:
  profile: "assertive"     # 审查风格：chill（宽松）/ assertive（严格）
  request_changes_workflow: true   # 发现严重问题时请求修改
  high_level_summary: true         # 生成 PR 摘要
  auto_review:
    enabled: true
    drafts: false            # 草稿 PR 不触发
    base_branches:
      - main
      - develop

# 自定义审查规则
instructions: |
  请重点关注以下几点：
  1. 函数单一职责原则
  2. 错误处理是否完整
  3. 是否存在 SQL 注入或 XSS 风险
  4. 关键操作是否有日志记录
  5. 新增代码是否有对应的单元测试

# 忽略特定文件
path_filters:
  - "!**/*.lock"
  - "!**/dist/**"
  - "!**/__snapshots__/**"
  - "!**/vendor/**"

chat:
  auto_reply: true           # 自动回复评论中的问题
```

### 效果展示

接入后，每个 PR 会自动收到类似如下的 AI 评论：

```
## CodeRabbit 审查摘要

### 🔴 需要修改
- `src/auth/login.ts:42` — 密码比较使用了非恒定时间比较，
  存在时序攻击风险，建议使用 `crypto.timingSafeEqual()`

### 🟡 建议优化
- `src/utils/format.ts:18` — 此函数圈复杂度为 12，超过推荐值 10，
  建议拆分为多个小函数

### 🟢 总体评价
代码逻辑清晰，测试覆盖率良好。主要需处理上述安全问题。
```

---

## 方案二：Qodo Merge（开源可自托管）

Qodo Merge（原 PR-Agent）是开源项目，可以完全自托管，适合对数据安全有要求的团队。

### GitHub Actions 集成

```yaml
# .github/workflows/ai-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]          # 支持通过评论命令触发

jobs:
  review:
    runs-on: ubuntu-latest
    if: |
      github.event_name == 'pull_request' ||
      (github.event_name == 'issue_comment' && 
       startsWith(github.event.comment.body, '/review'))

    steps:
      - name: AI Code Review
        uses: Codium-ai/pr-agent@main
        env:
          OPENAI_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          github_action_config.auto_review: "true"
          github_action_config.auto_describe: "true"
          github_action_config.auto_improve: "true"
```

### 支持的评论命令

在 PR 评论中输入以下命令可触发对应功能：

| 命令 | 功能 |
|------|------|
| `/review` | 重新触发代码审查 |
| `/describe` | 生成 PR 描述和摘要 |
| `/improve` | 给出代码改进建议 |
| `/ask 你的问题` | 针对 PR 提问 |
| `/test` | 生成单元测试建议 |
| `/changelog` | 生成变更日志条目 |

---

## 方案三：自建 AI 审查流水线（完全定制）

如果需要完全控制审查逻辑，可以在 CI 中直接调用 AI API。

### 完整实现

```python
# scripts/ai_review.py
import os
import sys
import json
import subprocess
import anthropic

def get_pr_diff():
    """获取 PR 的代码变更"""
    base = os.environ.get("GITHUB_BASE_REF", "main")
    result = subprocess.run(
        ["git", "diff", f"origin/{base}...HEAD"],
        capture_output=True, text=True
    )
    return result.stdout

def review_with_claude(diff: str) -> str:
    """调用 Claude API 进行代码审查"""
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    system_prompt = """你是一位资深软件工程师，正在做代码审查。
请分析提供的 Git Diff，从以下维度给出结构化反馈：

1. **安全问题**（最高优先级）：SQL注入、XSS、硬编码密钥、权限检查缺失等
2. **逻辑错误**：边界条件、空指针、并发问题、错误处理缺失
3. **性能问题**：N+1查询、不必要的循环、内存泄漏
4. **代码质量**：函数过长、命名不清、重复代码、注释缺失
5. **测试覆盖**：新增逻辑是否有对应测试

输出格式为 JSON：
{
  "summary": "总体评价（1-2句话）",
  "severity": "APPROVE | REQUEST_CHANGES | COMMENT",
  "issues": [
    {
      "level": "error | warning | info",
      "file": "文件路径",
      "line": 行号或null,
      "category": "security | logic | performance | quality | test",
      "message": "问题描述",
      "suggestion": "修改建议"
    }
  ]
}

只返回 JSON，不要有其他文字。"""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4096,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": f"请审查以下代码变更：\n\n```diff\n{diff[:12000]}\n```"
            }
        ]
    )

    return message.content[0].text

def post_github_comment(review_result: dict):
    """将审查结果发布为 GitHub PR 评论"""
    import urllib.request

    token = os.environ["GITHUB_TOKEN"]
    repo = os.environ["GITHUB_REPOSITORY"]
    pr_number = os.environ["PR_NUMBER"]

    # 构建 Markdown 评论内容
    severity_emoji = {
        "APPROVE": "✅",
        "REQUEST_CHANGES": "🔴",
        "COMMENT": "💬"
    }

    level_emoji = {
        "error": "🔴",
        "warning": "🟡",
        "info": "🔵"
    }

    body = f"## 🤖 AI Code Review\n\n"
    body += f"{severity_emoji.get(review_result['severity'], '💬')} **{review_result['summary']}**\n\n"

    if review_result["issues"]:
        body += "### 发现的问题\n\n"
        for issue in review_result["issues"]:
            emoji = level_emoji.get(issue["level"], "🔵")
            file_ref = f"`{issue['file']}`" + (f":{issue['line']}" if issue.get("line") else "")
            body += f"{emoji} **{file_ref}**\n"
            body += f"> {issue['message']}\n"
            if issue.get("suggestion"):
                body += f"\n💡 建议：{issue['suggestion']}\n"
            body += "\n"
    else:
        body += "✨ 未发现明显问题，代码质量良好！\n"

    body += "\n---\n*由 Claude AI 自动审查，仅供参考，最终决策由人工审查者负责。*"

    # 发送评论
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    data = json.dumps({"body": body}).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"token {token}",
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json"
        }
    )
    urllib.request.urlopen(req)

def main():
    diff = get_pr_diff()
    if not diff.strip():
        print("没有代码变更，跳过审查")
        sys.exit(0)

    print("正在进行 AI 代码审查...")
    raw_result = review_with_claude(diff)

    try:
        review_result = json.loads(raw_result)
    except json.JSONDecodeError:
        print(f"解析 AI 响应失败：{raw_result}")
        sys.exit(1)

    post_github_comment(review_result)
    print(f"审查完成，结论：{review_result['severity']}")

    # 如果有严重问题，CI 标记失败
    error_count = sum(1 for i in review_result["issues"] if i["level"] == "error")
    if error_count > 0:
        print(f"发现 {error_count} 个严重问题，请修复后重新提交")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### 对应的 GitHub Actions 配置

```yaml
# .github/workflows/ai-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write     # 需要写评论权限
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0       # 需要完整历史来 diff

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: 安装依赖
        run: pip install anthropic

      - name: 运行 AI 审查
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPOSITORY: ${{ github.repository }}
          PR_NUMBER: ${{ github.event.number }}
          GITHUB_BASE_REF: ${{ github.base_ref }}
        run: python scripts/ai_review.py
```

---

## 各方案对比

| 维度 | CodeRabbit | Qodo Merge | 自建方案 |
|------|-----------|------------|--------|
| **上手难度** | ⭐ 极简 | ⭐⭐ 简单 | ⭐⭐⭐⭐ 复杂 |
| **定制灵活性** | 中 | 高 | 完全可控 |
| **数据安全** | 代码发送至第三方 | 可自托管 | 完全自控 |
| **费用** | 开源免费，商业付费 | 开源免费 | 按 API 用量付费 |
| **中文支持** | ✅ 原生支持 | ✅ 支持 | ✅ 取决于模型 |
| **适合场景** | 快速起步、中小团队 | 需要自托管的团队 | 大型企业、高度定制 |

---

## 最佳实践

### 1. AI 审查不能替代人工审查

AI 擅长发现**规则性问题**（安全漏洞、代码风格、常见错误模式），但对**业务逻辑合理性**、**架构决策**的判断仍需要人类。建议的工作流：

```
AI 审查（立即）→ 开发者修复明显问题 → 人工审查（专注逻辑）→ 合并
```

### 2. 控制 AI 的「话痨」倾向

AI 倾向于给出大量建议，可能淹没真正重要的问题。通过配置过滤噪音：

```yaml
# CodeRabbit 配置：只报告高优先级问题
reviews:
  profile: "chill"              # 减少低优先级评论
  path_instructions:
    - path: "**/*.test.ts"
      instructions: "测试文件只关注测试覆盖率，忽略风格问题"
    - path: "migrations/**"
      instructions: "数据库迁移文件重点检查数据安全和回滚方案"
```

### 3. 建立反馈机制

对 AI 的评论点「👍」或「👎」，帮助工具学习你团队的偏好，随着时间推移审查质量会提升。

### 4. 保护敏感代码

对于涉及核心算法、商业机密的代码，配置排除规则，不发送给第三方 AI：

```yaml
path_filters:
  - "!src/core/algorithm/**"
  - "!src/billing/**"
```

---

## 总结

| 如果你是… | 推荐方案 |
|----------|---------|
| 个人开发者 / 小团队，想快速上手 | CodeRabbit 免费版 |
| 中型团队，需要自托管 | Qodo Merge 自部署 |
| 大型企业，需要完全定制 + 数据安全 | 自建 CI 调用 AI API |
| 已有完善 CI/CD，想低成本接入 | GitHub Actions + Qodo Merge |

AI Code Review 的最终目标不是取代人类审查者，而是**让机器处理机械性工作，让人类专注于真正需要智慧的决策**。从今天就可以开始——安装 CodeRabbit 只需要 5 分钟。

---

> 📚 参考资源：
> - [CodeRabbit 官方文档](https://docs.coderabbit.ai)
> - [Qodo Merge GitHub](https://github.com/Codium-ai/pr-agent)
> - [GitHub Copilot Code Review](https://docs.github.com/en/copilot/using-github-copilot/code-review)
> - [Anthropic Claude API 文档](https://docs.anthropic.com)
