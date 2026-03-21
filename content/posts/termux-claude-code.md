---
title: Termux 完全玩法指南：与 Claude Code 深度联动
date: 2026-03-18
draft: false
tags:
  - termux
  - claude-code
  - android
  - terminal
  - ai
  - 开发工具
categories:
  - 工具
description: 在 Android 设备上用 Termux 搭建完整开发环境，结合 Claude Code 实现随时随地 AI 辅助编程，手机变身移动工作站。
author: Claude
toc: true
---

## 什么是 Termux？

[Termux](https://termux.dev) 是 Android 平台上一款无需 Root 的终端模拟器与 Linux 环境。它内置了一套完整的包管理系统（基于 apt/pkg），可以安装 Python、Node.js、Git、SSH、Vim 等数百个开发工具，让你的手机真正变成一台随身携带的 Linux 机器。

---

## 安装与初始化

### 安装 Termux

> ⚠️ 强烈建议从 [F-Droid](https://f-droid.org/packages/com.termux/) 安装，Google Play 版本长期未维护。

```bash
# 安装后第一步：更新所有包
pkg update && pkg upgrade -y
```

### 必备基础工具

```bash
# 开发基础工具
pkg install git curl wget vim nano openssh python nodejs -y

# 构建工具
pkg install build-essential clang make -y

# 实用工具
pkg install tmux fzf ripgrep bat tree -y
```

### 开放存储权限

```bash
termux-setup-storage
```

执行后在弹窗中允许，即可访问手机的 `/sdcard` 目录。

---

## 核心玩法

### 1. 用 SSH 当远程终端

Termux 可以跑 SSH 服务器，从电脑连进来用大键盘操作手机环境：

```bash
# 安装 openssh
pkg install openssh -y

# 生成密钥（如果没有）
ssh-keygen -t ed25519

# 启动 SSH 服务（默认端口 8022）
sshd

# 查看本机 IP
ifconfig | grep inet
```

从电脑连接：

```bash
ssh -p 8022 你的手机IP
```

### 2. Tmux 多窗口管理

在手机小屏上高效工作，tmux 是关键：

```bash
# 安装
pkg install tmux -y

# 基本操作
tmux new -s main        # 新建会话
tmux attach -t main     # 重新连接
# Ctrl+b 后按 c         # 新建窗口
# Ctrl+b 后按 %         # 垂直分屏
# Ctrl+b 后按 "         # 水平分屏
```

### 3. 搭建 Python/Node 开发环境

```bash
# Python 虚拟环境
pip install virtualenv
virtualenv myproject
source myproject/bin/activate

# Node.js 项目
npm init -y
npm install express

# Hugo 静态博客
# （见下方 Hugo 章节）
```

### 4. 连接 GitHub / 管理代码

```bash
# 配置 Git
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 生成 SSH 密钥并添加到 GitHub
ssh-keygen -t ed25519 -C "you@example.com"
cat ~/.ssh/id_ed25519.pub
# 将输出复制到 GitHub → Settings → SSH Keys

# 克隆仓库
git clone git@github.com:yourname/yourrepo.git
```

---

## 安装 Claude Code

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) 是 Anthropic 推出的命令行 AI 编程助手，在 Termux 上完全可用。

### 环境准备

```bash
# 确保 Node.js 版本 >= 18
node --version

# 如果版本太低，升级
pkg install nodejs-lts -y
```

### 安装 Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

### 配置 API Key

```bash
# 方式一：环境变量（推荐写入 .bashrc 或 .zshrc）
export ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxxxxx"

# 方式二：运行时设置
claude config set apiKey sk-ant-xxxxxxxxxxxxxxxx
```

将 key 持久化：

```bash
echo 'export ANTHROPIC_API_KEY="sk-ant-xxxx"' >> ~/.bashrc
source ~/.bashrc
```

---

## Termux × Claude Code 联动玩法

### 场景一：随手修 Bug

在咖啡馆、通勤路上，打开 Termux，进入项目目录：

```bash
cd ~/projects/myapp
claude
```

直接对话：

```
> 帮我看看 src/api.js 第 42 行为什么报 TypeError
> 重构 utils/ 目录下的所有函数，加上 JSDoc 注释
> 写一个 Docker Compose 配置，包含 PostgreSQL 和 Redis
```

Claude Code 会直接读取、修改你的文件，不需要复制粘贴。

### 场景二：用 Claude Code 生成 Hugo 文章

```bash
# 进入 Hugo 内容目录
cd ~/blog/content/posts

# 让 Claude Code 帮你写文章
claude "帮我写一篇关于 Rust 所有权机制的技术博客，用中文，Hugo markdown 格式，包含 front matter"
```

### 场景三：自动化脚本生成

```bash
mkdir ~/scripts && cd ~/scripts
claude "写一个 bash 脚本，每天凌晨 2 点自动 git pull 所有 ~/projects 下的仓库并发送通知"
```

Claude Code 会生成脚本并可以直接帮你设置 cron job：

```bash
crontab -e
# 0 2 * * * ~/scripts/auto_pull.sh
```

### 场景四：SSH 进手机 + Claude Code 远程开发

```
[MacBook / Windows PC]
       |
       | SSH -p 8022
       |
[Termux on Android]
       |
  claude code 运行中
       |
  操作项目文件
```

这样你可以用电脑的键盘鼠标，但计算和文件都在手机上，配合 5G 热点完全可以在外出时进行正式开发。

### 场景五：配合 Termux:API 扩展能力

安装 `Termux:API` App 后，Claude Code 生成的脚本可以直接调用手机硬件：

```bash
pkg install termux-api -y

# Claude Code 可以帮你写脚本实现：
termux-notification --title "构建完成" --content "你的项目已成功部署"
termux-vibrate -d 500
termux-torch on   # 打开手电筒（调试时的小彩蛋）
```

---

## 在 Termux 上运行 Hugo

```bash
# 安装 Hugo
pkg install hugo -y

# 创建新博客
hugo new site myblog
cd myblog

# 添加主题（以 PaperMod 为例）
git init
git submodule add https://github.com/adityatelange/hugo-PaperMod themes/PaperMod

# 配置主题
echo 'theme = "PaperMod"' >> config.toml

# 创建新文章
hugo new posts/my-first-post.md

# 本地预览（手机浏览器访问 http://localhost:1313）
hugo server -D --bind 0.0.0.0
```

配合 Claude Code 生成文章：

```bash
cd myblog
claude "帮我在 content/posts/ 下创建一篇介绍 Termux 的文章，包含完整的 Hugo front matter，中文写作"
```

---

## 推荐配置与效率技巧

### .bashrc 增强配置

```bash
cat >> ~/.bashrc << 'EOF'

# 常用别名
alias ll='ls -alF'
alias gs='git status'
alias gp='git pull'
alias claude='claude --model claude-sonnet-4-20250514'

# 快速进入项目
alias blog='cd ~/blog && hugo server -D --bind 0.0.0.0'
alias work='tmux attach -t main || tmux new -s main'

# Claude Code 项目助手
ai() {
  claude "$@"
}

EOF
source ~/.bashrc
```

### 字体与显示优化

在 Termux 长按屏幕 → Style，可以调整字体和配色方案。推荐：

- 字体：Fira Code（支持编程连字）
- 颜色：One Dark 或 Dracula

### 外接键盘 + 鼠标

Termux 支持蓝牙键盘和 USB OTG 鼠标，配合折叠屏手机简直就是口袋工作站。

---

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| `pkg install` 速度慢 | 换源：`termux-change-repo` |
| Node.js 版本不够 | `pkg install nodejs-lts` |
| Claude Code 连接超时 | 检查 API Key 是否正确，确认网络可访问 `api.anthropic.com` |
| 存储权限问题 | 重新执行 `termux-setup-storage` |
| SSH 连接断开 | tmux 内运行，断连后 `tmux attach` 恢复 |

---

## 总结

Termux + Claude Code 的组合将 Android 手机变成了一台真正的 AI 辅助开发终端。你可以：

- 📱 **随时随地** 打开终端，对话式修改代码
- 🤖 **AI 直接操作文件**，无需手动复制粘贴
- 🌐 **SSH 远程接入**，配合大屏幕键盘使用
- 📝 **Hugo 博客写作**，让 Claude 生成内容，一键发布
- ⚡ **脚本自动化**，结合 Termux:API 控制手机硬件

移动开发的边界从未像现在这样模糊。一台手机，一个 AI，足以完成大多数开发任务。

---

> **参考资源**
> - [Termux 官方文档](https://wiki.termux.com)
> - [Claude Code 文档](https://docs.anthropic.com/en/docs/claude-code)
> - [Hugo 快速入门](https://gohugo.io/getting-started/quick-start/)
