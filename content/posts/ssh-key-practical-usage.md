---
title: "SSH 密钥实战：GitHub、服务器免密登录与端口转发完整指南"
date: 2026-03-22T18:36:37+08:00
draft: false
tags: ["SSH", "GitHub", "PuTTY", "PPK", "免密登录", "端口转发", "Git"]
categories: ["运维", "开发工具", "网络安全"]
description: "SSH 密钥对的真实使用场景：配置 GitHub SSH 访问、服务器免密登录、多账号管理、跳板机连接、端口转发隧道等实战案例。"
---

## 前言

上一篇介绍了公私钥、PPK 和 PuTTY 的基础概念。本篇直接进入**实战场景**，覆盖日常开发和运维中最常见的几类用法。

> 当前时间：2026-03-22 18:36（北京时间）

---

## 场景一：GitHub 仓库使用 SSH 密钥

### 1.1 为什么要用 SSH 而不是 HTTPS？

| 方式 | 认证方法 | 优缺点 |
|------|----------|--------|
| HTTPS | 用户名 + Token | 简单，但每次都要输入或配置凭据管理器 |
| **SSH** | 私钥签名 | 一次配置，永久免密 push/pull，更安全 |

GitHub 在 2021 年已停止支持密码认证，HTTPS 方式需要使用 **Personal Access Token**。SSH 密钥是更优雅的替代方案。

---

### 1.2 生成密钥对（Windows / PuTTYgen）

1. 打开 **PuTTYgen**，选择 **Ed25519**，点击 **Generate**
2. Comment 填写：`github-yourname`
3. 设置 Passphrase（建议设置）
4. **Save private key** → 保存为 `github_ed25519.ppk`
5. 复制顶部文本框中的公钥（以 `ssh-ed25519 AAAA...` 开头的一整行）

> **Linux / macOS 用户**直接用命令行生成：
> ```bash
> ssh-keygen -t ed25519 -C "github-yourname" -f ~/.ssh/github_ed25519
> ```

---

### 1.3 将公钥添加到 GitHub

1. 登录 GitHub → **Settings** → **SSH and GPG keys**
2. 点击 **New SSH key**
3. Title 填写：`My Laptop 2026`
4. Key type 选择：**Authentication Key**
5. 粘贴刚才复制的公钥内容 → **Add SSH key**

---

### 1.4 配置本地 SSH（Windows）

编辑（或新建）`C:\Users\你的用户名\.ssh\config`：

```
Host github.com
    HostName github.com
    User git
    IdentityFile C:\Users\你的用户名\.ssh\github_ed25519.ppk
    IdentitiesOnly yes
```

> **注意**：Windows 原生 OpenSSH 客户端（`ssh` 命令）使用 OpenSSH 格式，**不识别 PPK**。  
> 需要先用 PuTTYgen 导出为 OpenSSH 格式：
> ```
> PuTTYgen → Conversions → Export OpenSSH key → 保存为 github_ed25519（无扩展名）
> ```
> 然后 config 中写 `IdentityFile C:\Users\你的用户名\.ssh\github_ed25519`

---

### 1.5 测试连接

```bash
ssh -T git@github.com
# 成功输出：Hi yourname! You've successfully authenticated...
```

---

### 1.6 使用 SSH 克隆 / 推送仓库

```bash
# 克隆（使用 SSH 地址，不是 HTTPS）
git clone git@github.com:yourname/yourrepo.git

# 已有仓库切换为 SSH 远程地址
git remote set-url origin git@github.com:yourname/yourrepo.git

# 正常 push / pull，无需输入密码
git push origin main
git pull origin main
```

---

### 1.7 多 GitHub 账号管理（个人 + 公司）

如果你同时有两个 GitHub 账号，在 `~/.ssh/config` 中配置不同的别名：

```
# 个人账号
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_personal_ed25519

# 公司账号
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_work_ed25519
```

克隆时使用别名代替 `github.com`：

```bash
# 个人仓库
git clone git@github-personal:personal-name/my-blog.git

# 公司仓库
git clone git@github-work:company-org/backend-api.git
```

---

## 场景二：Linux 服务器免密登录

### 2.1 一键部署公钥到服务器

```bash
# Linux / macOS 用 ssh-copy-id（最简单）
ssh-copy-id -i ~/.ssh/myserver_ed25519.pub user@192.168.1.100

# 手动方式（Windows 或任意系统）
cat myserver_ed25519.pub | ssh user@192.168.1.100 \
  "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### 2.2 使用 PuTTY 连接

```
PuTTY → Session
  Host Name: 192.168.1.100
  Port: 22

→ Connection → SSH → Auth → Credentials
  Private key file: C:\Keys\myserver_ed25519.ppk

→ Connection → Data
  Auto-login username: ubuntu   ← 填写用户名，省去每次输入

→ Session → Saved Sessions: "我的服务器" → Save
```

下次双击 Saved Sessions 直接连接，无需输入密码。

### 2.3 禁用密码登录，只允许密钥登录（加固服务器）

```bash
sudo nano /etc/ssh/sshd_config
```

修改以下配置：

```ini
PubkeyAuthentication yes
PasswordAuthentication no
PermitRootLogin prohibit-password   # root 只允许密钥登录
AuthorizedKeysFile .ssh/authorized_keys
```

```bash
# 重启 SSH 服务生效
sudo systemctl restart sshd
```

> ⚠️ 操作前务必确认密钥登录已测试成功，否则会被锁在服务器外面。

---

## 场景三：多台服务器的密钥管理

### 3.1 统一 config 文件管理所有主机

`~/.ssh/config`：

```
# 默认设置（对所有主机生效）
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    AddKeysToAgent yes

# 生产环境 Web 服务器
Host prod-web
    HostName 203.0.113.10
    User deploy
    Port 22
    IdentityFile ~/.ssh/prod_ed25519

# 生产环境数据库服务器（只能通过跳板机访问）
Host prod-db
    HostName 10.0.0.5
    User dbadmin
    ProxyJump prod-jump
    IdentityFile ~/.ssh/prod_ed25519

# 跳板机 / 堡垒机
Host prod-jump
    HostName 203.0.113.1
    User jumpuser
    Port 2222
    IdentityFile ~/.ssh/jump_ed25519

# 测试环境
Host staging
    HostName 203.0.113.20
    User ubuntu
    IdentityFile ~/.ssh/staging_ed25519
```

配置好后：

```bash
ssh prod-web      # 直接连接生产 Web 服务器
ssh prod-db       # 自动经过跳板机连接数据库服务器
ssh staging       # 连接测试环境
```

---

## 场景四：跳板机（ProxyJump）

### 4.1 场景说明

```
你的电脑 → [公网跳板机 203.0.113.1] → [内网服务器 10.0.0.5]
```

内网服务器没有公网 IP，必须先登录跳板机再跳转。

### 4.2 命令行方式

```bash
# 一条命令，通过跳板机直连内网服务器
ssh -J jumpuser@203.0.113.1:2222 dbadmin@10.0.0.5

# 多级跳转（跳板机 → 内网跳板 → 目标机）
ssh -J user@jump1.example.com,user@jump2.internal dbadmin@10.0.0.5
```

### 4.3 PuTTY 配置跳板机（Proxy 方式）

```
目标服务器的 PuTTY Session：
→ Connection → Proxy
  Proxy type: SSH
  Proxy hostname: 203.0.113.1
  Port: 2222
  Username: jumpuser
  Private key: jump_key.ppk
```

---

## 场景五：SSH 端口转发（隧道）

### 5.1 本地端口转发（访问远程内网服务）

**场景**：远程服务器上运行了 MySQL（3306 端口），不对外暴露，通过 SSH 隧道在本地访问。

```bash
# 将本地 3307 端口转发到远程服务器的 3306
ssh -L 3307:localhost:3306 user@203.0.113.10 -N

# 之后在本地用数据库工具连接
# Host: 127.0.0.1  Port: 3307  就是远程的 MySQL
```

PuTTY 图形界面配置：

```
→ Connection → SSH → Tunnels
  Source port: 3307
  Destination: localhost:3306
  选择 Local → Add
```

### 5.2 远程端口转发（让远程服务器访问本地服务）

**场景**：本地开发了一个 Web 服务（8080），想临时让外网访问（类似 ngrok）。

```bash
# 将服务器的 8888 端口转发到本地的 8080
ssh -R 8888:localhost:8080 user@203.0.113.10 -N

# 任何人访问 203.0.113.10:8888 就会到达你本地的 8080
```

服务器需开启：

```ini
# /etc/ssh/sshd_config
GatewayPorts yes
```

### 5.3 动态端口转发（SOCKS5 代理）

**场景**：通过远程服务器代理全部网络流量（简易 VPN）。

```bash
# 在本地 1080 端口创建 SOCKS5 代理
ssh -D 1080 user@203.0.113.10 -N

# 浏览器 / 应用设置代理：SOCKS5  127.0.0.1:1080
```

PuTTY 配置：

```
→ Connection → SSH → Tunnels
  Source port: 1080
  选择 Dynamic → Add
```

---

## 场景六：自动化脚本与 CI/CD

### 6.1 GitHub Actions 使用 SSH 密钥部署

在 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions** 中添加：

- `SSH_PRIVATE_KEY`：粘贴 OpenSSH 格式私钥内容
- `SSH_HOST`：服务器 IP
- `SSH_USER`：登录用户名

`.github/workflows/deploy.yml`：

```yaml
name: Deploy to Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy
        run: |
          ssh -i ~/.ssh/deploy_key ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
            cd /var/www/myapp
            git pull origin main
            npm install --production
            pm2 restart myapp
          EOF
```

### 6.2 Plink 在 Windows 批处理脚本中使用

```batch
@echo off
REM 使用 Plink + Pageant 执行远程命令
plink -batch -agent user@203.0.113.10 "cd /app && git pull && systemctl restart myapp"
echo 部署完成
```

`-agent` 参数让 Plink 从 Pageant 获取密钥，无需指定密钥文件。

---

## 场景七：VSCode 远程开发（Remote - SSH）

VSCode 的 Remote - SSH 插件同样使用 `~/.ssh/config` 配置。

### 7.1 配置

在 VSCode 中按 `F1` → **Remote-SSH: Open Configuration File**，填写：

```
Host my-dev-server
    HostName 203.0.113.10
    User ubuntu
    IdentityFile C:\Users\you\.ssh\devserver_ed25519
    ForwardAgent yes
```

### 7.2 连接

`F1` → **Remote-SSH: Connect to Host** → 选择 `my-dev-server`

连接后 VSCode 就像在本地操作服务器上的文件，终端也直接是远程 Shell。

`ForwardAgent yes` 让你在远程服务器上也能使用本地的 SSH 密钥（比如在服务器上执行 `git push` 到 GitHub）。

---

## 快速参考

### 常用 SSH 命令速查

```bash
# 测试连接（不执行命令）
ssh -T git@github.com

# 指定密钥连接
ssh -i ~/.ssh/mykey user@host

# 通过跳板机连接
ssh -J jumpuser@jumphost targetuser@targethost

# 本地端口转发
ssh -L 本地端口:目标主机:目标端口 user@ssh服务器 -N

# 远程端口转发
ssh -R 远程端口:本地主机:本地端口 user@ssh服务器 -N

# SOCKS5 代理
ssh -D 本地端口 user@ssh服务器 -N

# 在后台运行隧道
ssh -fN -L 3307:localhost:3306 user@host

# 调试连接问题（显示详细日志）
ssh -vvv user@host
```

### PPK 格式转换速查

```bash
# PPK → OpenSSH（命令行 puttygen）
puttygen mykey.ppk -O private-openssh -o mykey

# OpenSSH → PPK
puttygen mykey -o mykey.ppk

# 提取公钥
puttygen mykey.ppk -O public-openssh -o mykey.pub
```

---

## 总结

| 场景 | 核心配置 | 工具 |
|------|----------|------|
| GitHub SSH 访问 | `~/.ssh/config` + 公钥上传 GitHub | ssh / PuTTY |
| 服务器免密登录 | `authorized_keys` + Saved Sessions | PuTTY / Pageant |
| 跳板机穿透 | `ProxyJump` 或 PuTTY Proxy | ssh / PuTTY |
| 内网服务访问 | 本地端口转发 `-L` | ssh / PuTTY Tunnels |
| 临时外网暴露 | 远程端口转发 `-R` | ssh |
| CI/CD 自动部署 | Secrets + OpenSSH 格式私钥 | GitHub Actions |
| VSCode 远程开发 | `~/.ssh/config` + Remote-SSH 插件 | VSCode |

一套 SSH 密钥体系，贯穿开发、部署、运维的方方面面。
