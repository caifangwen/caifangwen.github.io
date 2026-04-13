---
title: "用 Tailscale 远程 SSH 连接本机电脑完整指南"
date: 2026-03-28T10:35:48+08:00
lastmod: 2026-03-28T10:35:48+08:00
draft: false
tags: ["tailscale", "ssh", "远程连接", "网络", "运维"]
categories: ["网络"]
description: "从零开始配置 Tailscale + SSH，实现随时随地安全远程连接家里/公司的电脑，包含 sshd 配置、SSH config 写法及常见问题排查。"
author: "Claude"
showToc: true
TocOpen: true
---

## 前言

传统远程 SSH 需要公网 IP 或者折腾内网穿透（frp、ngrok 等），配置繁琐且不稳定。**Tailscale** 基于 WireGuard 协议，构建一个属于你自己的虚拟私有网络（VPN Mesh），每台设备都会获得一个固定的 `100.x.x.x` 虚拟 IP，无论你人在哪里，都可以像在局域网一样直接 SSH 连接。

---

## 一、整体架构

```
你的笔记本（任意网络）
      │
      │  Tailscale VPN Mesh（WireGuard 加密）
      │
家里的台式机 / 服务器（被连端，需开启 sshd）
```

被连端需要：
1. 安装并登录 Tailscale
2. 开启并配置 `sshd`

连接端需要：
1. 安装并登录 Tailscale（同一账号或同一 Tailnet）
2. 配置本地 `~/.ssh/config`（可选但推荐）

---

## 二、被连端：安装 Tailscale

### macOS

```bash
# 方式一：官网下载 App（推荐，自带菜单栏图标）
# https://tailscale.com/download/mac

# 方式二：Homebrew
brew install tailscale
sudo tailscaled &
sudo tailscale up
```

### Linux（Ubuntu / Debian）

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

### Windows

直接下载安装包：<https://tailscale.com/download/windows>

安装后点击系统托盘图标登录即可。

---

## 三、被连端：开启 sshd

### macOS

macOS 默认没有开启远程登录，需手动打开：

```bash
# 方式一：系统设置（推荐）
# 系统设置 → 通用 → 共享 → 打开「远程登录」

# 方式二：命令行
sudo systemsetup -setremotelogin on

# 验证 sshd 是否在运行
sudo launchctl list | grep ssh
```

### Linux

```bash
# 安装 openssh-server（通常已预装）
sudo apt install openssh-server   # Debian / Ubuntu
sudo dnf install openssh-server   # Fedora / RHEL

# 启动并设为开机自启
sudo systemctl enable --now ssh

# 查看运行状态
sudo systemctl status ssh
```

### Windows

```powershell
# 以管理员身份运行 PowerShell
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
```

---

## 四、sshd 安全配置（重要）

编辑 `/etc/ssh/sshd_config`（macOS 路径相同）：

```sshd_config
# 禁用密码登录，只允许密钥认证（强烈推荐）
PasswordAuthentication no
PubkeyAuthentication yes

# 禁止 root 直接登录
PermitRootLogin no

# 只监听 Tailscale 虚拟 IP（可选，更安全）
# 先用 `tailscale ip -4` 查看本机的 Tailscale IP，例如 100.100.100.1
# ListenAddress 100.100.100.1

# 空闲超时断开（秒）
ClientAliveInterval 120
ClientAliveCountMax 3

# 端口（默认 22，可改为非标准端口减少扫描）
Port 22
```

修改完重启 sshd：

```bash
# Linux
sudo systemctl restart ssh

# macOS
sudo launchctl stop com.openssh.sshd
sudo launchctl start com.openssh.sshd
```

---

## 五、配置 SSH 密钥认证

在**连接端**（你的笔记本）生成密钥对：

```bash
# 生成 ED25519 密钥（推荐，比 RSA 更安全）
ssh-keygen -t ed25519 -C "your_email@example.com"
# 默认保存在 ~/.ssh/id_ed25519
```

将公钥复制到被连端：

```bash
# 方式一：ssh-copy-id（最简单）
ssh-copy-id user@<tailscale-ip>

# 方式二：手动追加
cat ~/.ssh/id_ed25519.pub | ssh user@<tailscale-ip> "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 方式三：如果还没配好 SSH，直接在被连端执行
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## 六、查看 Tailscale IP

在被连端执行：

```bash
tailscale ip -4
# 输出类似：100.72.45.123
```

或者登录 <https://login.tailscale.com/admin/machines> 在控制台查看所有设备的 IP。

---

## 七、连接端：配置 ~/.ssh/config

推荐配置 SSH config，省去每次手动输命令。编辑 `~/.ssh/config`：

```sshconfig
# 家里的台式机
Host home-desktop
    HostName 100.72.45.123        # 被连端的 Tailscale IP
    User your_username            # 登录用户名
    IdentityFile ~/.ssh/id_ed25519
    Port 22
    ServerAliveInterval 60
    ServerAliveCountMax 3

# 公司服务器（示例）
Host work-server
    HostName 100.88.12.34
    User ubuntu
    IdentityFile ~/.ssh/id_ed25519
    Port 22
    # 如果需要跳板机（Jump Host）
    # ProxyJump bastion-host

# 通配：所有 Tailscale 地址段统一配置
Host 100.*
    User your_username
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no      # 首次连接不弹警告（方便，但略降低安全性）
```

配置好后直接连接：

```bash
ssh home-desktop
# 等价于：ssh -i ~/.ssh/id_ed25519 your_username@100.72.45.123
```

---

## 八、使用 Tailscale SSH（可选进阶）

Tailscale 还提供内置的 SSH 功能，可以完全跳过本地 sshd 配置，由 Tailscale 接管认证：

```bash
# 被连端开启 Tailscale SSH
sudo tailscale up --ssh

# 连接端直接 SSH（无需配置 sshd 或密钥）
ssh user@home-desktop  # 用 MagicDNS 主机名
# 或
ssh user@100.72.45.123
```

> **注意：** Tailscale SSH 使用 Tailscale 账号认证，适合个人或团队场景，但需要在 Tailscale 控制台配置 ACL 策略。

---

## 九、常见问题排查

### 连接超时 / 无法连接

```bash
# 1. 检查两端 Tailscale 是否在线
tailscale status

# 2. 检查被连端 sshd 是否在运行
sudo systemctl status ssh          # Linux
sudo launchctl list | grep ssh     # macOS

# 3. 用 ping 测试 Tailscale 连通性
ping 100.72.45.123

# 4. 检查防火墙是否放行 22 端口
sudo ufw status                    # Ubuntu UFW
sudo iptables -L -n | grep 22

# macOS 防火墙：系统设置 → 网络 → 防火墙 → 确认 sshd 被允许
```

### Permission denied (publickey)

```bash
# 检查 authorized_keys 权限（必须严格）
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 查看 sshd 详细日志
sudo journalctl -u ssh -f          # Linux systemd
sudo tail -f /var/log/auth.log     # 旧版 Linux
sudo log stream --predicate 'process == "sshd"'  # macOS
```

### macOS 睡眠后断开

系统偏好设置 → 电池 → 取消勾选「连接电源时防止自动进入睡眠」，或者使用 `caffeinate` 命令：

```bash
# 让 Mac 保持唤醒（按 Ctrl+C 取消）
caffeinate -s
```

---

## 十、完整流程总结

| 步骤 | 被连端（家里的电脑） | 连接端（你的笔记本） |
|------|-------------------|--------------------|
| 1 | 安装 Tailscale 并登录 | 安装 Tailscale 并登录同一账号 |
| 2 | 开启 sshd | 生成 SSH 密钥对 |
| 3 | 配置 `/etc/ssh/sshd_config` | 复制公钥到被连端 |
| 4 | 查看 Tailscale IP | 配置 `~/.ssh/config` |
| 5 | — | `ssh home-desktop` 连接 |

---

## 参考资料

- [Tailscale 官方文档](https://tailscale.com/kb/start)
- [Tailscale SSH 文档](https://tailscale.com/kb/1193/tailscale-ssh)
- [OpenSSH 配置参考](https://man.openbsd.org/sshd_config)
