---
title: "~/.ssh/config 完全指南：SSH 客户端配置文件详解"
date: 2026-03-22T18:48:36+08:00
draft: false
tags: ["SSH", "config", "PuTTY", "跳板机", "端口转发", "运维"]
categories: ["网络"]
description: "深入解析 SSH 客户端配置文件 ~/.ssh/config 的语法结构、每一条指令的含义，以及真实场景下的配置范例。"
slug: "ssh-config-guide"
---

## 前言

你可能见过这样一段内容：

```
Host prod-jump
    HostName 203.0.113.1
    User jumpuser
    Port 2222
    IdentityFile ~/.ssh/jump_ed25519
```

这是 **SSH 客户端配置文件**（`~/.ssh/config`）的内容。它的作用是：把一堆繁琐的命令行参数"存档"成一个简短的名字，让你只需要输入 `ssh prod-jump` 就能完成一次完整的连接。

本文将系统介绍这个文件的语法、每条指令的含义，以及常见场景下的配置写法。

> 当前时间：2026-03-22 18:48（北京时间）

---

## 一、文件在哪里？

| 系统 | 路径 |
|------|------|
| Linux / macOS | `~/.ssh/config` |
| Windows（OpenSSH） | `C:\Users\你的用户名\.ssh\config` |

文件不存在时需要手动创建：

```bash
mkdir -p ~/.ssh
touch ~/.ssh/config
chmod 600 ~/.ssh/config   # 权限必须是 600，否则 SSH 会拒绝读取
```

---

## 二、基本语法结构

```
Host <别名>
    <指令> <值>
    <指令> <值>
    ...

Host <另一个别名>
    <指令> <值>
    ...
```

### 核心规则

**1. `Host` 是一个"节"的开始**

`Host` 后面跟的是**别名**（你自己起的名字），每次 `ssh 别名` 时 SSH 就会读取该节下面的配置。

**2. 指令用缩进与 Host 区分**

缩进（空格或 Tab）表示该指令属于上方的 `Host` 节。缩进数量无要求，通常用 4 个空格。

**3. 匹配是从上到下，遇到第一个匹配就应用**

如果多个 `Host` 节都能匹配，**只有第一个生效**（全局默认 `Host *` 除外，它会补充未被其他节设置的值）。

**4. 大小写不敏感**

`HostName` 和 `hostname` 效果相同。

---

## 三、逐条指令详解

### 3.1 Host — 别名 / 匹配模式

```
Host prod-jump
Host 192.168.*
Host *.example.com
Host dev staging
Host *
```

- 纯文字：作为连接时使用的**别名**，例如 `ssh prod-jump`
- 通配符 `*`：匹配任意字符，`Host *` 表示匹配所有主机
- 通配符 `?`：匹配单个字符
- 多个名字：空格分隔，表示同一配置适用于多个别名
- `Host *` 放在文件最后，作为**全局默认值**

```
# 例：dev 和 staging 共用一套配置
Host dev staging
    User ubuntu
    IdentityFile ~/.ssh/test_ed25519
```

---

### 3.2 HostName — 真实主机地址

```
Host my-server
    HostName 203.0.113.10
```

- `Host` 是你输入的名字，`HostName` 才是真实的 IP 或域名
- 如果不写 `HostName`，SSH 会把 `Host` 的值当作真实地址去连接

```bash
# 有了上面的配置，这两条命令等价：
ssh my-server
ssh 203.0.113.10
```

---

### 3.3 User — 登录用户名

```
Host prod-web
    HostName 203.0.113.10
    User deploy
```

等价于命令行：

```bash
ssh deploy@203.0.113.10
```

省去了每次都要输入 `用户名@` 的麻烦。不同服务器通常用不同账号（`ubuntu`、`ec2-user`、`root`、`deploy`……），在 config 里统一管理非常方便。

---

### 3.4 Port — SSH 端口号

```
Host jump-server
    HostName 203.0.113.1
    Port 2222
```

SSH 默认端口是 **22**。如果服务器改了端口（出于安全或防扫描目的），就在这里指定。

等价于命令行：

```bash
ssh -p 2222 203.0.113.1
```

---

### 3.5 IdentityFile — 指定私钥文件

```
Host github.com
    IdentityFile ~/.ssh/github_ed25519

Host prod-web
    IdentityFile ~/.ssh/prod_ed25519
```

- 指定登录时使用的**私钥文件路径**
- 不同的服务器可以用不同的密钥，互相隔离
- Windows 路径写法：`C:/Users/you/.ssh/mykey` 或 `C:\Users\you\.ssh\mykey`

**结合 IdentitiesOnly 使用**：

```
Host github.com
    IdentityFile ~/.ssh/github_ed25519
    IdentitiesOnly yes
```

`IdentitiesOnly yes` 表示**只用这个密钥**，禁止 SSH 自动尝试其他密钥（当你有多个密钥时，SSH 默认会逐一尝试，`IdentitiesOnly` 可以避免被服务器因尝试次数过多而拒绝）。

---

### 3.6 ProxyJump — 跳板机（堡垒机）

```
Host prod-db
    HostName 10.0.0.5
    User dbadmin
    ProxyJump jumpuser@203.0.113.1:2222
```

**含义**：连接 `prod-db` 时，先 SSH 登录跳板机 `203.0.113.1:2222`，再从跳板机跳转到内网的 `10.0.0.5`。

```
你的电脑 ──SSH──▶ 跳板机(203.0.113.1:2222) ──SSH──▶ 目标机(10.0.0.5)
```

也可以引用另一个 `Host` 别名：

```
Host prod-jump
    HostName 203.0.113.1
    User jumpuser
    Port 2222
    IdentityFile ~/.ssh/jump_ed25519

Host prod-db
    HostName 10.0.0.5
    User dbadmin
    ProxyJump prod-jump           # ← 直接引用上面的别名
    IdentityFile ~/.ssh/prod_ed25519
```

多级跳转（经过两台跳板机）：

```
Host final-target
    HostName 10.10.0.1
    ProxyJump jump1,jump2         # 逗号分隔，依次经过
```

---

### 3.7 LocalForward — 本地端口转发

```
Host db-tunnel
    HostName 203.0.113.10
    User ubuntu
    LocalForward 3307 localhost:3306
```

**含义**：连接 `db-tunnel` 时，自动把本地的 `3307` 端口映射到**远程服务器视角**的 `localhost:3306`（即远程服务器上的 MySQL）。

```
你的电脑:3307 ──隧道──▶ 远程服务器:3306
```

```bash
ssh db-tunnel
# 连接成功后，在本地打开数据库客户端：
# Host: 127.0.0.1  Port: 3307  就能访问远程 MySQL
```

等价于命令行：`ssh -L 3307:localhost:3306 ubuntu@203.0.113.10`

---

### 3.8 RemoteForward — 远程端口转发

```
Host expose-local
    HostName 203.0.113.10
    User ubuntu
    RemoteForward 8888 localhost:8080
```

**含义**：连接时，把**远程服务器的 `8888` 端口**转发到你本地的 `8080`。

```
外网用户 ──▶ 远程服务器:8888 ──隧道──▶ 你的电脑:8080
```

等价于命令行：`ssh -R 8888:localhost:8080 ubuntu@203.0.113.10`

---

### 3.9 DynamicForward — SOCKS5 动态代理

```
Host socks-proxy
    HostName 203.0.113.10
    User ubuntu
    DynamicForward 1080
```

**含义**：在本地 `1080` 端口创建一个 SOCKS5 代理，所有流量通过远程服务器转发。

等价于命令行：`ssh -D 1080 ubuntu@203.0.113.10`

---

### 3.10 ServerAliveInterval / ServerAliveCountMax — 保活

```
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

| 指令 | 含义 |
|------|------|
| `ServerAliveInterval 60` | 每 60 秒向服务器发送一个保活包 |
| `ServerAliveCountMax 3` | 最多发 3 次无响应后断开连接 |

解决长时间不操作后连接自动断开的问题，在 `Host *` 里全局设置即可。

---

### 3.11 AddKeysToAgent — 自动加入 ssh-agent

```
Host *
    AddKeysToAgent yes
```

首次使用某个密钥时，自动将其加入 `ssh-agent`（或 macOS Keychain），后续无需重复输入 Passphrase。

---

### 3.12 ForwardAgent — 代理转发

```
Host dev-server
    HostName 203.0.113.10
    User ubuntu
    ForwardAgent yes
```

**含义**：登录到 `dev-server` 后，可以在那台服务器上继续使用你**本地的 SSH 密钥**（比如在服务器上执行 `git push` 到 GitHub，用的是你本地的密钥）。

> ⚠️ 安全提示：只在你信任的服务器上开启 `ForwardAgent`，在不信任的机器上启用有安全风险。

---

### 3.13 StrictHostKeyChecking — 主机指纹验证

```
Host *
    StrictHostKeyChecking ask        # 默认：首次连接询问
    
Host 10.0.0.*
    StrictHostKeyChecking no         # 内网自动接受（不推荐用于公网）
    UserKnownHostsFile /dev/null     # 不保存 known_hosts（临时环境）
```

| 值 | 含义 |
|----|------|
| `ask`（默认） | 首次连接询问是否信任，之后记录到 `known_hosts` |
| `yes` | 严格模式，未知主机直接拒绝 |
| `no` | 跳过验证（不安全，仅限受控内网） |

---

### 3.14 其他常用指令速览

| 指令 | 示例值 | 说明 |
|------|--------|------|
| `Compression` | `yes` | 开启传输压缩，慢速网络有效 |
| `ConnectTimeout` | `10` | 连接超时秒数 |
| `LogLevel` | `QUIET` / `DEBUG` | 日志级别，调试时用 `DEBUG` |
| `TCPKeepAlive` | `yes` | TCP 层保活（与 ServerAlive 配合） |
| `ControlMaster` | `auto` | SSH 连接复用（多个会话共用一条连接） |
| `ControlPath` | `~/.ssh/cm-%r@%h:%p` | 连接复用 socket 路径 |
| `ControlPersist` | `10m` | 最后一个会话退出后连接保持时长 |
| `VisualHostKey` | `yes` | 显示主机指纹的 ASCII 图形（随机艺术） |
| `RequestTTY` | `yes` | 强制分配伪终端 |
| `SendEnv` | `LANG LC_*` | 向服务器传递本地环境变量 |

---

## 四、特殊变量（Tokens）

在 `IdentityFile`、`ControlPath` 等值中可以使用这些占位符：

| 变量 | 含义 |
|------|------|
| `%h` | 目标主机名（HostName 的值） |
| `%r` | 登录用户名 |
| `%p` | 端口号 |
| `%u` | 本地用户名 |
| `%l` | 本地主机名 |
| `%i` | 本地用户 UID |
| `~` | 家目录 |

常见用法：

```
ControlPath ~/.ssh/cm-%r@%h:%p
# 展开后例如：~/.ssh/cm-ubuntu@203.0.113.10:22
```

---

## 五、完整示例：一份生产级 config 文件

```
# ============================================================
# 全局默认（放在文件最后，补充其他节未设置的值）
# ============================================================
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    AddKeysToAgent yes
    Compression yes
    ControlMaster auto
    ControlPath ~/.ssh/cm-%r@%h:%p
    ControlPersist 5m

# ============================================================
# GitHub
# ============================================================
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_ed25519
    IdentitiesOnly yes

# 公司 GitHub 账号（使用别名区分）
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_work_ed25519
    IdentitiesOnly yes

# ============================================================
# 生产环境
# ============================================================

# 跳板机 / 堡垒机
Host prod-jump
    HostName 203.0.113.1
    User jumpuser
    Port 2222
    IdentityFile ~/.ssh/jump_ed25519

# Web 服务器（可直连）
Host prod-web
    HostName 203.0.113.10
    User deploy
    IdentityFile ~/.ssh/prod_ed25519

# 数据库（内网，经跳板机）
Host prod-db
    HostName 10.0.0.5
    User dbadmin
    ProxyJump prod-jump
    IdentityFile ~/.ssh/prod_ed25519
    # 顺便把 MySQL 端口映射到本地
    LocalForward 3307 localhost:3306

# ============================================================
# 测试 / 开发环境
# ============================================================
Host staging dev
    HostName 203.0.113.20
    User ubuntu
    IdentityFile ~/.ssh/staging_ed25519
    ForwardAgent yes

# ============================================================
# 本地虚拟机（跳过指纹验证）
# ============================================================
Host 192.168.56.*
    User vagrant
    IdentityFile ~/.vagrant.d/insecure_private_key
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    LogLevel QUIET
```

---

## 六、验证配置是否正确

```bash
# 打印 SSH 连接某个 Host 时实际使用的完整参数（不真正连接）
ssh -G prod-db

# 输出示例：
# hostname 10.0.0.5
# user dbadmin
# port 22
# identityfile /home/you/.ssh/prod_ed25519
# proxyjump prod-jump
# ...
```

`-G` 选项非常有用，可以在不实际建立连接的情况下检查配置是否按预期生效。

---

## 七、常见问题

### Q：config 文件不生效怎么办？

检查文件权限：

```bash
chmod 600 ~/.ssh/config
chmod 700 ~/.ssh
```

SSH 对权限非常严格，`config` 文件权限如果太宽松（如 `644`），SSH 会直接忽略它。

### Q：`Host *` 要放在哪里？

**放在文件末尾**。SSH 匹配时从上到下找第一个匹配的 `Host`，`Host *` 会匹配一切，如果放在最前面，后面的具体配置就永远不会被读到。正确用法是让 `Host *` 作为"兜底默认值"放在最后。

### Q：Windows 路径怎么写？

```
# 正斜杠和反斜杠都支持
IdentityFile C:/Users/you/.ssh/mykey
IdentityFile C:\Users\you\.ssh\mykey

# 也可以用 ~ 代表家目录
IdentityFile ~/.ssh/mykey
```

### Q：ProxyJump 和老版本的 ProxyCommand 有什么区别？

`ProxyJump`（OpenSSH 7.3+）是 `ProxyCommand` 的简化版，内部等价于：

```
ProxyCommand ssh -W %h:%p prod-jump
```

优先使用 `ProxyJump`，更简洁，且支持代理链（逗号分隔多个跳板机）。

---

## 总结

`~/.ssh/config` 的本质是把命令行参数变成"配置文件"。一份好的 config 文件可以：

- 把 `ssh -i ~/.ssh/prod_ed25519 -p 2222 -J jumpuser@203.0.113.1 dbadmin@10.0.0.5` 这样的长命令缩短为 `ssh prod-db`
- 统一管理所有服务器的用户名、端口、密钥、跳板机设置
- 让脚本、VSCode Remote-SSH、Git 等工具自动复用这些配置

掌握它，是迈向高效 SSH 工作流的关键一步。
