---
title: "在 Termux 中使用 Git 推送仓库到 GitHub"
date: 2026-03-20T03:52:38+08:00
draft: false
tags: ["Termux", "Git", "GitHub", "Android", "教程"]
categories: ["技术"]
description: "手把手教你在 Android Termux 环境下，使用 Token 认证将本地项目推送到 GitHub 远程仓库，包含常见报错的解决方案。"
slug: "termux-git-push-tutorial"
---

## 前言

在 Android 手机上使用 Termux 进行 Git 操作时，会遇到一些在桌面端没有的问题——比如文件系统权限导致的"可疑所有权"报错、Token 认证配置等。本文将完整梳理从零开始推送仓库的全流程，并逐一解决常见错误。

---

## 准备工作：获取 GitHub Token

使用 Token（个人访问令牌）代替密码进行认证，是目前 GitHub 推荐的方式。

1. 登录 GitHub，进入 **Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. 点击 **Generate new token**
3. 勾选 **`repo`** 权限（这是推送代码的必要权限）
4. 生成后**立即复制**保存，Token 只显示一次

> ⚠️ 如果推送时遇到 `403 Permission denied`，大概率是 Token 没有勾选 `repo` 权限，需要重新生成。

---

## 完整推送流程

### 第一步：解决 Termux 的"可疑所有权"问题

在 Termux 中对手机内部存储（`/storage/emulated/0`）执行 Git 命令时，常见如下报错：

```
fatal: detected dubious ownership in repository
```

这是 Git 的安全机制：手机内部存储的文件系统权限管理方式与 Linux 标准不一致，Git 会拒绝操作。

**解决方法：** 将目标目录加入信任列表。

```bash
# 信任指定目录（替换为你的实际路径）
git config --global --add safe.directory /storage/emulated/0/Documents/your-repo-name
```

如果想一劳永逸地信任所有目录（适合个人手机）：

```bash
git config --global --add safe.directory '*'
```

> 💡 多用户服务器上不建议使用 `'*'`，个人手机完全没问题。

---

### 第二步：配置 Git 用户信息

首次使用 Git 时，需要设置提交者身份，否则 `git commit` 会提示 `Author identity unknown`：

```bash
git config --global user.email "你的邮箱@example.com"
git config --global user.name "你的用户名"
```

---

### 第三步：初始化本地仓库并提交

进入你的项目目录，依次执行：

```bash
# 初始化仓库（会创建 .git 文件夹）
git init

# 将所有文件加入暂存区（注意末尾的点 . 不能省略）
git add .

# 创建第一次提交（这一步会正式创建 main 分支！）
git commit -m "Initial commit from Android"
```

> ⚠️ **常见误区：** `git init` 和 `git branch -M main` 只是初始化动作，并不会真正创建分支。**必须有至少一次 `git commit`，分支才真正存在。** 跳过这步直接 `git push` 会报错：
>
> ```
> error: src refspec main does not match any
> ```

---

### 第四步：关联带 Token 的远程仓库

将 Token 直接嵌入远程地址，避免每次推送都输入密码：

```bash
git remote add origin https://你的用户名:你的TOKEN@github.com/你的用户名/仓库名.git
```

**示例：**

```bash
git remote add origin https://caifangwen:ghp_xxxxxxxxxxxx@github.com/caifangwen/seo-skill.git
```

如果已经关联过旧的 `origin`，改用 `set-url` 更新：

```bash
git remote set-url origin https://你的用户名:你的TOKEN@github.com/你的用户名/仓库名.git
```

验证地址是否正确：

```bash
git remote -v
```

> ⚠️ 此命令会**明文显示 Token**，注意周围环境。

---

### 第五步：推送代码

```bash
# 将本地分支重命名为 main（GitHub 默认分支名）
git branch -M main

# 推送并建立追踪关系（-u 参数只需第一次使用）
git push -u origin main
```

推送成功后，后续只需执行 `git push` 即可。

---

## 常见报错速查

| 报错信息 | 原因 | 解决方案 |
|---|---|---|
| `fatal: detected dubious ownership` | 手机存储权限与 Linux 不兼容 | 执行 `git config --global --add safe.directory <路径>` |
| `error: src refspec main does not match any` | 没有任何 Commit，分支不存在 | 先执行 `git add .` 和 `git commit` |
| `Author identity unknown` | 未配置用户信息 | 执行 `git config --global user.email/user.name` |
| `403 Permission denied` | Token 权限不足 | 重新生成 Token 并勾选 `repo` 权限 |
| `error: remote origin already exists` | 已关联过远程地址 | 改用 `git remote set-url` 而非 `git remote add` |

---

## 安全提示

使用 Token 内嵌 URL 的方式，Token 会以**明文**保存在项目的 `.git/config` 文件中。

- **个人专用手机**：这种方式非常方便，无需担心。
- **公用或共享设备**：推送完成后建议清理，或改用 SSH Key 方式认证。

查看 Token 是否被保存：

```bash
cat .git/config
```

如需移除 Token（保留远程地址但去掉认证信息）：

```bash
git remote set-url origin https://github.com/你的用户名/仓库名.git
```

---

## 完整命令速查（新仓库从零推送）

```bash
# 1. 信任目录（Termux 必做）
git config --global --add safe.directory /storage/emulated/0/Documents/your-repo

# 2. 配置用户信息（首次使用必做）
git config --global user.email "your@email.com"
git config --global user.name "YourName"

# 3. 初始化、提交
git init
git add .
git commit -m "Initial commit from Android"

# 4. 关联远程仓库（替换 TOKEN 和仓库名）
git remote add origin https://username:TOKEN@github.com/username/repo.git

# 5. 推送
git branch -M main
git push -u origin main
```
