---
title: "Termux 初始化环境配置指南"
date: 2026-03-20T03:34:39+08:00
draft: false
tags: ["termux", "android", "cli", "nodejs", "npm", "开发环境"]
categories: ["工具配置"]
description: "从零开始配置 Termux 开发环境，包含镜像源、Node.js、Python、Qwen Code CLI 等常用工具的安装与配置。"
author: "dev"
---

## 前言

[Termux](https://termux.dev/) 是 Android 上一款强大的终端模拟器，无需 Root 即可运行完整的 Linux 环境。本文记录从零开始初始化 Termux 开发环境的完整流程。

---

## 一、基础环境初始化

### 1.1 更换国内镜像源（加速下载）

```bash
# 使用清华大学镜像源
termux-change-repo
# 或手动编辑
sed -i 's@packages.termux.org@mirrors.tuna.tsinghua.edu.cn/termux@g' $PREFIX/etc/apt/sources.list
```

### 1.2 更新软件包列表

```bash
pkg update && pkg upgrade -y
```

### 1.3 安装基础工具

```bash
pkg install -y \
  curl \
  wget \
  git \
  vim \
  neovim \
  unzip \
  zip \
  tar \
  openssh \
  zsh \
  tmux
```

---

## 二、开发语言环境

### 2.1 安装 Node.js & npm

```bash
pkg install -y nodejs

# 验证安装
node -v
npm -v

# 配置 npm 国内镜像
npm config set registry https://registry.npmmirror.com

# 安装 pnpm（可选，更快的包管理器）
npm install -g pnpm
```

### 2.2 安装 Python

```bash
pkg install -y python

# 验证
python --version
pip --version

# 配置 pip 国内镜像
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### 2.3 安装 Rust（可选）

```bash
pkg install -y rust

# 验证
rustc --version
cargo --version
```

---

## 三、AI 开发工具

### 3.1 安装 Qwen Code CLI

[Qwen Code](https://github.com/QwenLM/qwen-code) 是阿里云通义千问推出的 AI 编程助手 CLI 工具。

```bash
# 通过 npm 全局安装
npm install -g qwen-code

# 验证安装
qwen --version

# 配置 API Key（替换为你的实际 Key）
export DASHSCOPE_API_KEY="your_api_key_here"

# 建议写入 shell 配置文件持久化
echo 'export DASHSCOPE_API_KEY="your_api_key_here"' >> ~/.zshrc
# 或 bash 用户
echo 'export DASHSCOPE_API_KEY="your_api_key_here"' >> ~/.bashrc
```

> **获取 API Key：** 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/) 注册并创建 API Key。

### 3.2 常用 Qwen Code 命令

```bash
# 启动交互式对话
qwen chat

# 对文件进行代码审查
qwen review main.py

# 生成代码
qwen code "用 Python 写一个简单的 HTTP 服务器"

# 解释代码
qwen explain script.sh
```

```bash
# It is recommended to use npm
npm install -g @qwen-code/qwen-code@latest

```
---


## 四、终端美化

### 4.1 安装 Oh My Zsh

```bash
pkg install -y zsh

# 安装 oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 安装 zsh-autosuggestions 插件
git clone https://github.com/zsh-users/zsh-autosuggestions \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# 安装 zsh-syntax-highlighting 插件
git clone https://github.com/zsh-users/zsh-syntax-highlighting \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

编辑 `~/.zshrc`，启用插件：

```bash
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```

### 4.2 安装 Starship 提示符（可选）

```bash
pkg install -y starship

# 写入配置
echo 'eval "$(starship init zsh)"' >> ~/.zshrc
```

---

## 五、实用工具集

### 5.1 文件与网络工具

```bash
pkg install -y \
  tree \        # 目录树展示
  htop \        # 进程监控
  nmap \        # 网络扫描
  netcat-openbsd \  # 网络调试
  jq \          # JSON 处理
  ffmpeg        # 音视频处理
```

### 5.2 版本管理工具 nvm

```bash
# 安装 nvm 管理多版本 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重载配置
source ~/.zshrc  # 或 source ~/.bashrc

# 安装指定版本 Node.js
nvm install 20
nvm use 20
nvm alias default 20
```

### 5.3 代码编辑器

```bash
# 安装 micro（比 nano 更易用的编辑器）
pkg install -y micro

# 安装 code-server（VS Code Web 版，可选）
npm install -g code-server
```

---

## 六、存储权限配置

```bash
# 允许 Termux 访问手机存储
termux-setup-storage

# 之后可以通过以下路径访问内部存储
ls ~/storage/shared
```

---

## 七、SSH 远程连接（可选）

```bash
# 启动 SSH 服务
sshd

# 查看监听端口（默认 8022）
# 设置密码
passwd

# 在电脑端连接（替换 IP）
ssh -p 8022 user@192.168.x.x
```

---

## 八、一键初始化脚本

将以上步骤整合为脚本，方便快速复用：

```bash
#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🚀 开始初始化 Termux 环境..."

# 更新包
pkg update -y && pkg upgrade -y

# 安装基础包
pkg install -y curl wget git vim zsh tmux openssh unzip nodejs python jq tree htop

# 配置 npm 镜像
npm config set registry https://registry.npmmirror.com

# 安装全局 npm 工具
npm install -g pnpm qwen-code

# 配置 pip 镜像
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 存储权限
termux-setup-storage

echo "✅ Termux 环境初始化完成！"
```

保存为 `init.sh`，然后执行：

```bash
chmod +x init.sh
./init.sh
```

---

## 总结

| 工具 | 用途 | 安装命令 |
|------|------|----------|
| `nodejs / npm` | JavaScript 运行时 | `pkg install nodejs` |
| `python` | Python 运行时 | `pkg install python` |
| `qwen-code` | AI 编程助手 | `npm install -g qwen-code` |
| `git` | 版本控制 | `pkg install git` |
| `zsh` | 增强 Shell | `pkg install zsh` |
| `tmux` | 终端复用 | `pkg install tmux` |
| `jq` | JSON 处理 | `pkg install jq` |
| `pnpm` | 快速包管理器 | `npm install -g pnpm` |

> 💡 **小技巧：** 每次打开 Termux 时执行 `pkg upgrade -y` 保持软件包最新，避免依赖冲突。
