---
title: "将 Skill 仓库部署到 GitHub Pages 的三种方案"
date: 2026-03-20T04:05:17+08:00
draft: false
tags: ["GitHub Pages", "Hugo", "CI/CD", "GitHub Actions"]
categories: ["Skill"]
description: "详细介绍如何将 Skill 仓库集成到 Hugo 项目并通过 GitHub Pages 进行托管，涵盖三种主流方案与完整的 GitHub Actions 配置。"
slug: "deploy-skill-to-github-pages"
---

## 概述

如果你想把一个 Hugo 项目（静态网站生成器）集成到你的 `skill` 仓库，并由 GitHub Pages 进行托管，通常有以下三种主要方案。根据你的需求选择最合适的一种。

---

## 方案一：直接合并（推荐用于长期维护）

适合场景：`skill` 仓库目前是空的，或者你希望访问 `https://用户名.github.io/skill/` 时直接呈现 Hugo 网站。

### 操作步骤

1. **本地合并**：将 Hugo 项目的所有源文件（`content/`、`themes/`、`hugo.toml` 等）复制到 `skill` 仓库的根目录。

2. **配置 BaseURL**：修改 Hugo 配置文件（`hugo.toml` 或 `config.yaml`）：

   ```toml
   baseURL = 'https://用户名.github.io/skill/'
   ```

3. **配置 GitHub Actions**：在 `skill` 仓库中创建 `.github/workflows/hugo.yaml`，使用 Hugo 官方提供的 GitHub Pages 部署模板。每次推送源码，GitHub 会自动编译并发布。

---

## 方案二：作为子模块（Submodule）

适合场景：希望保持两个仓库独立，`skill` 仓库放技能代码，Hugo 仓库放文档/博客，但又想在 `skill` 的某个文件夹下访问网站。

### 操作步骤

1. **添加子模块**：在 `skill` 仓库根目录下运行：

   ```bash
   git submodule add https://github.com/用户名/hugo-repo-name.git docs
   ```

2. **部署策略**：配置 GitHub Actions，使其在检测到子模块更新时，编译 Hugo 并将静态文件输出到 `skill` 仓库的 `gh-pages` 分支。

> ⚠️ 注意：这种方式相对复杂，因为 GitHub Pages 默认只支持部署一个分支。

---

## 方案三：只存放编译后的静态文件（最简单直接）

适合场景：不想在 `skill` 仓库处理 Hugo 源代码，只想把生成的网页放进去。

### 操作步骤

1. 在 Hugo 项目本地目录下运行 `hugo` 命令进行编译。
2. 编译后会产生 `public/` 文件夹，将其中所有内容（`index.html`、`css/`、`js/` 等）直接复制到 `skill` 仓库中。
3. 在 `skill` 仓库的 **Settings → Pages** 中，将 Source 设置为该分支的根目录（`/root`）。

---

## 关键注意事项

### BaseURL 路径问题

这是最容易出错的地方。`skill` 仓库属于项目路径（Project Site），而非根路径：

| 状态 | 配置 |
|------|------|
| ❌ 错误 | `baseURL = "https://xxx.github.io/"` |
| ✅ 正确 | `baseURL = "https://xxx.github.io/skill/"` |

路径配置错误会导致 CSS 和图片加载失败（404）。

### 主题（Themes）处理

Hugo 主题通常也是 Git 子模块。若手动复制文件，需检查 `themes` 文件夹是否完整；若通过 `git clone` 获取，建议使用 `git submodule add` 添加主题。

---

## 独立部署 skill 仓库到 GitHub Pages

如果你希望 `skill` 仓库作为独立项目部署（不需要改动主 Hugo 仓库），推荐使用 GitHub 官方的静态部署 Action。

### 第一步：创建 Action 文件

在 `skill` 仓库中创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy Skill Site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # 部署整个根目录，如 HTML 在子文件夹请修改（如 ./dist）
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 第二步：修改仓库 Pages 设置

1. 打开 `skill` 仓库 → **Settings → Pages**。
2. 在 **Build and deployment → Source** 下拉菜单中，选择 **GitHub Actions**（不要选 "Deploy from a branch"）。

### 第三步：添加测试页面

在 `skill` 仓库根目录下放置 `index.html`：

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Skill Page</title>
</head>
<body>
    <h1>Skill 仓库部署成功！</h1>
    <p>这是独立于主站点的二级目录页面。</p>
    <a href="https://你的用户名.github.io/">返回主站 Hugo 博客</a>
</body>
</html>
```

---

## 将 skill 作为 Hugo 主站子目录

如果希望 `skill` 的内容融入 Hugo 主站，可将其作为子模块放入 Hugo 项目的 `static/` 目录：

```bash
git submodule add https://github.com/你的用户名/skill.git static/skill
git add .
git commit -m "Add skill as a submodule"
git push origin main
```

然后确保 Hugo 主站的 `.github/workflows/hugo.yaml` 包含以下配置，否则 Action 无法拉取子模块内容：

```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    submodules: true   # 关键配置，不可缺少
    fetch-depth: 0
```

---

## 方案选择总结

| 需求 | 推荐方案 |
|------|----------|
| 长期维护，自动更新 | 方案一 + GitHub Actions |
| 快速展示，一次性部署 | 方案三（静态文件） |
| 两仓库独立，内容融入主站 | 子模块放入 `static/` |
| skill 作为独立工具/项目 | 独立开启 Pages + Actions |

---

## 常见问题排查

- **访问 `.../skill/` 出现 404 或触发文件下载**：请确保 `skill` 仓库根目录下存在 `index.html`。
- **CSS / 图片失效**：检查 HTML 中的资源引用路径。建议使用相对路径（如 `./style.css`），而非绝对路径（如 `/style.css`），因为部署后根路径为 `/skill/` 而非 `/`。
