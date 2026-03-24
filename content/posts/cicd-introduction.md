---
title: "CI/CD 入门指南：从概念到实践"
date: 2026-03-23T03:22:34+08:00
draft: false
tags: ["CI/CD", "DevOps", "自动化", "持续集成", "持续部署"]
categories: ["DevOps"]
description: "全面介绍 CI/CD 的核心概念、工作流程及实际使用方法，帮助你快速上手现代化软件交付流水线。"
author: "Claude"
---

## 什么是 CI/CD？

**CI/CD** 是 **持续集成（Continuous Integration）** 和 **持续交付/部署（Continuous Delivery / Continuous Deployment）** 的缩写，是现代软件开发中 DevOps 实践的核心环节。

它的目标是：**将代码从开发者的本地机器，自动、快速、可靠地交付到生产环境。**

---

## 核心概念拆解

### 1. 持续集成（CI）

> 频繁地将代码合并到主分支，并自动触发构建与测试。

**做什么：**
- 开发者提交代码（push / PR）
- 自动运行单元测试、集成测试
- 自动进行代码风格检查（Lint）
- 构建产物（编译、打包）

**目的：** 尽早发现 Bug，避免"集成地狱"。

---

### 2. 持续交付（CD - Continuous Delivery）

> 保证代码随时可以部署到生产环境，但需要人工触发最终发布。

**做什么：**
- CI 通过后，自动部署到测试/预发布环境
- 运行端到端测试、性能测试
- 生成可随时发布的制品（artifact）

---

### 3. 持续部署（CD - Continuous Deployment）

> 在持续交付的基础上，完全自动化，无需人工干预直接部署到生产。

**做什么：**
- 所有测试通过后，自动推送到生产环境
- 适合发布频率高、测试覆盖率高的团队

---

## CI/CD 流水线全流程

```
代码提交（git push）
      │
      ▼
  代码检出（Checkout）
      │
      ▼
  依赖安装（npm install / pip install）
      │
      ▼
  代码检查（Lint / Format Check）
      │
      ▼
  单元测试（Unit Tests）
      │
      ▼
  构建（Build / Compile）
      │
      ▼
  集成测试（Integration Tests）
      │
      ▼
  制品归档（Upload Artifacts）
      │
      ▼
  部署到测试环境（Deploy to Staging）
      │
      ▼
  端到端测试（E2E Tests）
      │
      ▼
  部署到生产环境（Deploy to Production）✅
```

---

## 主流 CI/CD 工具对比

| 工具 | 类型 | 特点 |
|------|------|------|
| **GitHub Actions** | 云托管 | 与 GitHub 深度集成，免费额度充足，配置简单 |
| **GitLab CI/CD** | 云/自托管 | 内置于 GitLab，功能全面 |
| **Jenkins** | 自托管 | 老牌工具，插件丰富，需自己维护 |
| **CircleCI** | 云托管 | 速度快，并发能力强 |
| **Travis CI** | 云托管 | 开源项目常用，配置简单 |
| **Argo CD** | 自托管 | Kubernetes 原生，GitOps 场景 |

---

## 实战：使用 GitHub Actions

以一个 Node.js 项目为例，在项目根目录创建：

```
.github/
└── workflows/
    └── ci.yml
```

### 示例一：CI 流水线（测试 + 构建）

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-and-build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]   # 多版本矩阵测试

    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 设置 Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: 安装依赖
        run: npm ci

      - name: 代码风格检查
        run: npm run lint

      - name: 运行测试
        run: npm test -- --coverage

      - name: 上传测试覆盖率
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

      - name: 构建项目
        run: npm run build
```

---

### 示例二：CD 流水线（自动部署）

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: test-and-build   # 依赖 CI 任务通过

    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 构建 Docker 镜像
        run: |
          docker build -t myapp:${{ github.sha }} .
          docker tag myapp:${{ github.sha }} myapp:latest

      - name: 登录镜像仓库
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: 推送镜像
        run: docker push myapp:latest

      - name: SSH 部署到服务器
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull myapp:latest
            docker stop myapp || true
            docker run -d --rm --name myapp -p 80:3000 myapp:latest
            echo "✅ 部署成功！"
```

---

## 关键概念补充

### Secrets（密钥管理）

敏感信息（密码、Token、私钥）不能写在代码里，应存储在 CI/CD 平台的 **Secrets** 中：

```yaml
# 通过变量引用，不暴露明文
password: ${{ secrets.MY_SECRET_PASSWORD }}
```

在 GitHub 中：`Settings → Secrets and variables → Actions` 添加。

---

### Artifact（制品）

构建产物（编译包、测试报告等）可以在 Job 之间传递或供下载：

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: dist-files
    path: dist/

- uses: actions/download-artifact@v4
  with:
    name: dist-files
```

---

### 环境保护（Environment Protection）

生产部署前加入人工审批：

```yaml
jobs:
  deploy-prod:
    environment:
      name: production   # 需要在 GitHub 仓库配置审批规则
      url: https://myapp.com
```

---

## 最佳实践

1. **快速失败**：把最快的检查（Lint、单元测试）放在最前面，节省时间。
2. **缓存依赖**：使用 `cache` 缓存 `node_modules`、`pip` 包等，加速流水线。
3. **最小权限原则**：CI 使用的 Token 只给必要的权限。
4. **保护主分支**：禁止直接 push main，所有变更通过 PR + CI 合并。
5. **版本化镜像**：Docker 镜像打上 commit SHA 标签，方便回滚。
6. **通知集成**：流水线失败时发送 Slack / 邮件通知。

---

## 总结

| | CI | CD（交付） | CD（部署） |
|--|--|--|--|
| **触发方式** | 代码提交 | CI 通过后 | 全自动 |
| **终点** | 测试通过 + 构建成功 | 部署到预发布环境 | 自动上线生产 |
| **人工介入** | 无 | 发布前需确认 | 无 |

CI/CD 不是一蹴而就的，可以从最简单的"自动跑测试"开始，逐步完善整条流水线。关键是**让重复性工作自动化，让工程师专注于真正有价值的事**。

---

> 📚 延伸阅读：
> - [GitHub Actions 官方文档](https://docs.github.com/en/actions)
> - [GitLab CI/CD 文档](https://docs.gitlab.com/ee/ci/)
> - [The Twelve-Factor App](https://12factor.net/)
