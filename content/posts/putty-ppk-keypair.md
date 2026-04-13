---
title: "PuTTY、PPK 与公私钥：SSH 密钥体系完全指南"
date: 2026-03-22T18:29:07+08:00
draft: false
tags: ["SSH", "PuTTY", "PPK", "公钥", "私钥", "密钥对", "安全"]
categories: ["网络"]
description: "从零理解 SSH 密钥认证体系：公钥、私钥、PPK 格式与 PuTTY 工具族的完整介绍与实操指南。"
slug: "putty-ppk-keypair"
---

## 前言

在日常的服务器运维、远程开发或云主机管理中，我们几乎绕不开一个话题：**如何安全地登录远程主机？**

密码登录简单直接，但存在被暴力破解的风险。而基于 **公私钥对（Key Pair）** 的 SSH 认证方式，配合 **PuTTY** 这一经典工具族，是 Windows 用户最常用的安全远程访问方案之一。

本文将系统介绍这套体系中的核心概念：**公钥（Public Key）**、**私钥（Private Key）**、**PPK 格式**，以及 **PuTTY 工具族**。

---

## 一、非对称加密与密钥对基础

### 1.1 对称加密 vs 非对称加密

| 类型 | 特点 | 典型算法 |
|------|------|----------|
| 对称加密 | 加密、解密使用同一把密钥 | AES、DES |
| 非对称加密 | 使用一对密钥：公钥加密，私钥解密（或反向签名） | RSA、Ed25519、ECDSA |

SSH 密钥认证基于**非对称加密**。

### 1.2 公钥（Public Key）

- 可以**公开分发**，不需要保密。
- 存放在远程服务器的 `~/.ssh/authorized_keys` 文件中。
- 作用：服务器用它来**验证**连接方是否持有对应的私钥。

### 1.3 私钥（Private Key）

- 必须**严格保密**，绝不能泄露或上传到公共平台。
- 存放在本地客户端机器上。
- 作用：客户端用它来**证明**自身身份，完成签名操作。

### 1.4 认证流程（简化）

```
客户端                            服务器
  |                                 |
  |  --- 发起连接请求 ------------>  |
  |                                 |  查找 authorized_keys 中的公钥
  |  <-- 发送随机挑战数据 ---------  |
  |                                 |
  |  用私钥对挑战数据签名           |
  |  --- 返回签名结果 ------------>  |
  |                                 |  用公钥验证签名
  |  <-- 验证通过，登录成功 -------  |
```

整个过程中，**私钥从不离开本地**，安全性远高于密码传输。

---

## 二、PPK 格式详解

### 2.1 什么是 PPK？

**PPK（PuTTY Private Key）** 是 PuTTY 工具族专用的私钥文件格式，扩展名为 `.ppk`。

它是 PuTTY 开发者 Simon Tatham 定义的一种私钥容器格式，与 OpenSSH 标准的 PEM 格式（`.pem`、`id_rsa`）**不兼容**，需要相互转换才能通用。

### 2.2 PPK 文件结构（PPK v3 示例）

```
PuTTY-User-Key-File-3: ssh-ed25519
Encryption: aes256-cbc
Comment: my-server-key
Public-Lines: 2
AAAAC3NzaC1lZDI1NTE5AAAA...（Base64 编码的公钥数据）
Private-Lines: 4
...（加密后的私钥数据）
Private-MAC: ...（完整性校验哈希）
```

- **Encryption**：私钥是否用口令（Passphrase）加密保护
- **Comment**：密钥注释，便于识别
- **Private-MAC**：防止文件被篡改的 MAC 校验值

### 2.3 PPK v2 vs PPK v3

| 版本 | PuTTY 支持起始版本 | 加密方式 | 推荐程度 |
|------|--------------------|----------|----------|
| PPK v2 | 早期版本 | AES-256-CBC + HMAC-SHA1 | 旧系统兼容用 |
| PPK v3 | 0.75+ | Argon2 密钥派生 + AES-256-CBC | ✅ 推荐 |

PPK v3 使用 **Argon2** 作为密钥派生函数（KDF），大幅提升了对暴力破解的抵抗能力。

### 2.4 PPK 与 OpenSSH 格式互转

**PPK → OpenSSH PEM**（使用 PuTTYgen）：

```
PuTTYgen → Conversions → Export OpenSSH key
```

**OpenSSH PEM → PPK**（使用 PuTTYgen）：

```
PuTTYgen → File → Load private key → 选择 .pem 文件 → Save private key
```

**命令行方式（使用 puttygen）**：

```bash
# PPK 转 OpenSSH
puttygen mykey.ppk -O private-openssh -o mykey.pem

# OpenSSH 转 PPK
puttygen mykey.pem -o mykey.ppk
```

---

## 三、PuTTY 工具族全览

PuTTY 不只是一个 SSH 客户端，它是一整套网络工具的集合，由 Simon Tatham 主导开发，开源免费。

### 3.1 PuTTY（主程序）

**用途**：SSH / Telnet / Rlogin / 串口 终端客户端

- 支持 SSH-1 和 SSH-2 协议（推荐只用 SSH-2）
- 支持隧道（端口转发）、X11 转发
- 可保存会话配置，方便重复连接
- 支持使用 PPK 私钥进行公钥认证

**典型使用场景**：

```
Host: 192.168.1.100
Port: 22
Connection type: SSH
→ Auth → Private key file: C:\Users\you\.ssh\mykey.ppk
```

### 3.2 PuTTYgen（密钥生成器）

**用途**：生成、转换、管理 SSH 密钥对

支持的密钥类型：

| 算法 | 推荐位数/曲线 | 说明 |
|------|--------------|------|
| RSA | 4096 bit | 兼容性最好 |
| DSA | 1024 bit | 已不推荐使用 |
| ECDSA | nistp256/384/521 | 现代椭圆曲线 |
| **Ed25519** | — | ✅ 最推荐，安全且高效 |
| Ed448 | — | 更高安全级别 |

**生成密钥对步骤**：

1. 打开 PuTTYgen
2. 选择密钥类型（推荐 Ed25519）
3. 点击 **Generate**，随机移动鼠标增加熵
4. 填写 **Key comment**（如 `user@hostname`）
5. 设置 **Key passphrase**（口令，强烈建议设置）
6. **Save public key** → 保存 `.pub` 文件
7. **Save private key** → 保存 `.ppk` 文件

### 3.3 Pageant（SSH 认证代理）

**用途**：在内存中缓存解密后的私钥，实现"一次输入口令，多次使用"

- 运行在系统托盘中
- PuTTY、PSCP、Plink 等工具会自动询问 Pageant 获取密钥
- 避免每次连接都要输入 Passphrase
- 关闭后自动清除内存中的私钥

**使用方式**：

```
启动 Pageant → Add Key → 选择 .ppk 文件 → 输入 Passphrase
```

之后 PuTTY 连接时会自动使用 Pageant 中的密钥。

### 3.4 PSCP（SCP 文件传输）

**用途**：基于 SSH 的安全文件复制工具（命令行）

```bash
# 上传文件到远程服务器
pscp -i mykey.ppk localfile.txt user@server:/remote/path/

# 从远程服务器下载文件
pscp -i mykey.ppk user@server:/remote/file.txt C:\local\
```

### 3.5 PSFTP（SFTP 客户端）

**用途**：交互式 SFTP 文件传输（命令行）

```bash
psftp -i mykey.ppk user@server
# 进入交互模式后
sftp> ls
sftp> get remote_file.txt
sftp> put local_file.txt
```

### 3.6 Plink（命令行 SSH 客户端）

**用途**：非交互式 SSH 命令执行，常用于脚本和自动化

```bash
# 在远程服务器执行命令
plink -i mykey.ppk user@server "df -h"

# 结合 Pageant 使用（无需指定密钥文件）
plink user@server uptime
```

### 3.7 工具族对比总览

| 工具 | 类型 | 主要用途 |
|------|------|----------|
| PuTTY | GUI | 交互式 SSH 终端 |
| PuTTYgen | GUI | 密钥生成与转换 |
| Pageant | GUI（托盘） | SSH 密钥代理 |
| PSCP | CLI | SCP 文件复制 |
| PSFTP | CLI | SFTP 交互传输 |
| Plink | CLI | 脚本化 SSH 命令 |

---

## 四、实战：完整的密钥认证配置流程

### 步骤 1：生成密钥对

使用 PuTTYgen 生成 Ed25519 密钥对，保存：
- `myserver_ed25519.ppk`（私钥，保留在本地）
- `myserver_ed25519.pub`（公钥，准备上传）

### 步骤 2：将公钥部署到服务器

```bash
# 在服务器上执行
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 将公钥内容追加到 authorized_keys
echo "ssh-ed25519 AAAA...（公钥内容）" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

> 公钥内容就是 PuTTYgen 界面顶部文本框中的内容（以 `ssh-ed25519` 或 `ssh-rsa` 开头的一整行）。

### 步骤 3：配置 PuTTY 使用私钥

```
PuTTY → Session → 填写 Host Name 和 Port
→ Connection → SSH → Auth → Credentials
→ Private key file for authentication → 浏览选择 .ppk 文件
→ 回到 Session → 填写 Saved Sessions 名称 → Save
```

### 步骤 4：连接测试

点击 **Open**，若配置正确，将直接进入 Shell（或提示输入 Passphrase）。

---

## 五、安全最佳实践

1. **始终为私钥设置 Passphrase**：即使 PPK 文件泄露，攻击者也无法直接使用。
2. **使用 Ed25519 或 ECDSA**：避免使用已过时的 DSA 或短位数 RSA。
3. **定期轮换密钥**：建议每年或在人员变动时更换密钥对。
4. **不要将私钥上传至 Git 仓库**：这是最常见的密钥泄露途径。
5. **使用 Pageant 管理密钥**：避免明文私钥文件长时间暴露在磁盘上。
6. **禁用服务器密码登录**：在 `/etc/ssh/sshd_config` 中设置 `PasswordAuthentication no`。
7. **限制 authorized_keys 权限**：文件权限必须为 `600`，目录为 `700`。

---

## 六、常见问题

### Q：PPK 文件可以直接在 Linux/macOS 上用吗？

不能直接用。需要先用 `puttygen` 转换为 OpenSSH 格式：

```bash
puttygen mykey.ppk -O private-openssh -o ~/.ssh/mykey
chmod 600 ~/.ssh/mykey
```

### Q：AWS / 阿里云下载的 `.pem` 密钥如何在 PuTTY 中使用？

需要用 PuTTYgen 将 `.pem` 转换为 `.ppk`：

```
PuTTYgen → File → Load private key → 选择 .pem → Save private key → 保存为 .ppk
```

### Q：提示 "Server refused our key" 怎么办？

检查以下几点：
- 服务器 `~/.ssh/authorized_keys` 中的公钥格式是否正确（应为单行，不能有换行）
- `~/.ssh` 目录权限是否为 `700`
- `authorized_keys` 文件权限是否为 `600`
- `/etc/ssh/sshd_config` 中是否开启了 `PubkeyAuthentication yes`

---

## 总结

| 概念 | 核心要点 |
|------|---------|
| 公钥 | 可公开，放在服务器 `authorized_keys` |
| 私钥 | 严格保密，存于本地 |
| PPK | PuTTY 专用私钥格式，v3 推荐 |
| PuTTYgen | 生成与转换密钥的工具 |
| PuTTY | Windows 下最主流的 SSH 客户端 |
| Pageant | 私钥代理，免除重复输入 Passphrase |

掌握这套体系，你就拥有了一把既方便又安全的"数字钥匙"，可以放心地管理任何远程服务器。
