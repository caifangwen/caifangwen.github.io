---
title: "使用 Vultr VPS 搭建 x-ui + WebSocket + TLS + CDN 节点完整教程"
date: 2026-03-28T14:56:47+08:00
draft: false
tags: ["VPS", "Vultr", "x-ui", "WebSocket", "TLS", "CDN", "Debian", "代理"]
categories: ["技术教程"]
description: "以 Debian 系统为例，完整介绍在 Vultr VPS 上部署 x-ui 面板，配合 WebSocket + TLS + CDN（Cloudflare）的节点搭建全流程。"
author: "Admin"
---

## 前言

本文以 **Vultr VPS + Debian 12** 为基础环境，完整演示如何部署 **x-ui 面板**，并配置 **WebSocket + TLS + Cloudflare CDN** 的完整链路方案。

> **架构示意：**  
> `客户端` → `Cloudflare CDN (443/TLS)` → `Nginx (反向代理)` → `x-ui (Xray Core / WebSocket)`

---

## 一、准备工作

### 1.1 购买 Vultr VPS

1. 前往 [vultr.com](https://www.vultr.com) 注册并充值
2. 创建新实例，推荐配置：
   - **Cloud Compute – Shared CPU**
   - 地区：日本 / 新加坡 / 美国（根据需求选择）
   - 操作系统：**Debian 12 x64**
   - 套餐：$6/月（1C 1G 起步即可）
3. 记录服务器 **公网 IP**、SSH 登录密码

### 1.2 准备域名与 Cloudflare

1. 购买或使用已有域名（推荐 Namecheap / Cloudflare Registrar）
2. 将域名 **NS 记录**接入 Cloudflare（免费套餐即可）
3. 在 Cloudflare 添加 A 记录，将子域名指向 VPS IP：
   - **名称**：`sub`（自定义，如 `node.example.com`）
   - **类型**：`A`
   - **内容**：`你的 VPS IP`
   - **代理状态**：先设置为 **仅 DNS（灰云）**，待配置完成后再开启代理（橙云）

---

## 二、初始化服务器

### 2.1 SSH 连接

```bash
ssh root@你的VPS_IP
```

### 2.2 系统更新

```bash
apt update && apt upgrade -y
apt install -y curl wget vim ufw unzip socat
```

### 2.3 配置防火墙

```bash
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP (证书申请)
ufw allow 443/tcp     # HTTPS (CDN 入口)
ufw allow 54321/tcp   # x-ui 面板端口（可自定义）
ufw enable
ufw status
```

### 2.4 开启 BBR 加速（可选但推荐）

```bash
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
# 验证
lsmod | grep bbr
```

---

## 三、申请 TLS 证书

使用 **acme.sh** 申请免费 Let's Encrypt 证书。

### 3.1 安装 acme.sh

```bash
curl https://get.acme.sh | sh -s email=你的邮箱@example.com
source ~/.bashrc
```

### 3.2 申请证书（HTTP 验证方式）

确保 80 端口已开放且域名已解析到本机 IP（Cloudflare 保持灰云状态）：

```bash
~/.acme.sh/acme.sh --set-default-ca --server letsencrypt

~/.acme.sh/acme.sh --issue -d node.example.com --standalone \
  --key-file /etc/ssl/private/node.example.com.key \
  --fullchain-file /etc/ssl/certs/node.example.com.crt
```

> 若域名已接入 Cloudflare DNS，也可使用 DNS API 方式申请，无需 80 端口。

### 3.3 证书路径确认

```bash
ls /etc/ssl/certs/node.example.com.crt
ls /etc/ssl/private/node.example.com.key
```

---

## 四、安装 x-ui 面板

### 4.1 一键安装

```bash
bash <(curl -Ls https://raw.githubusercontent.com/vaxilu/x-ui/master/install.sh)
```

安装过程中按提示设置：
- **面板端口**：建议改为非默认端口，如 `54321`
- **用户名 / 密码**：自定义强密码

### 4.2 验证运行状态

```bash
x-ui status
# 或
systemctl status x-ui
```

### 4.3 访问面板

浏览器访问：`http://你的VPS_IP:54321`

使用刚才设置的用户名和密码登录。

---

## 五、在 x-ui 中添加 Inbound（入站配置）

登录 x-ui 面板后，点击左侧 **「入站列表」→「添加入站」**，填写如下配置：

| 参数 | 值 |
|---|---|
| 备注 | ws-tls-node |
| 协议 | vless 或 vmess |
| 监听 IP | 留空（监听所有） |
| 端口 | `10086`（内部端口，不对外暴露） |
| 传输协议 | ws（WebSocket） |
| 路径 | `/ws`（自定义，需与 Nginx 一致） |
| TLS | **关闭**（TLS 由 Nginx 统一处理） |

点击 **添加** 保存，记录生成的 **UUID**。

---

## 六、安装并配置 Nginx 反向代理

### 6.1 安装 Nginx

```bash
apt install -y nginx
```

### 6.2 创建站点配置

```bash
vim /etc/nginx/conf.d/node.example.com.conf
```

粘贴以下内容（替换域名和路径）：

```nginx
server {
    listen 443 ssl http2;
    server_name node.example.com;

    ssl_certificate     /etc/ssl/certs/node.example.com.crt;
    ssl_certificate_key /etc/ssl/private/node.example.com.key;

    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # x-ui 面板反代（可选，通过域名访问面板）
    location /xui/ {
        proxy_pass http://127.0.0.1:54321/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket 反代（对应 x-ui 入站路径）
    location /ws {
        proxy_pass http://127.0.0.1:10086;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400s;
    }

    # 伪装页面（访问根路径返回正常网页，增加隐蔽性）
    location / {
        root /var/www/html;
        index index.html;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name node.example.com;
    return 301 https://$host$request_uri;
}
```

### 6.3 测试并重启 Nginx

```bash
nginx -t
systemctl restart nginx
systemctl enable nginx
```

---

## 七、开启 Cloudflare CDN

1. 登录 Cloudflare，找到之前添加的 A 记录
2. 将代理状态从 **灰云（仅 DNS）** 切换为 **橙云（已代理）**
3. 进入 **SSL/TLS** 设置，将加密模式改为 **`完全（严格）`**
4. （可选）在 **网络** 选项中开启 **WebSocket 支持**（默认已开启）

> **重要**：Cloudflare 免费套餐下，WebSocket 流量走 443 端口，无需额外配置。

---

## 八、客户端配置

以 **v2rayN（Windows）** 或 **v2rayNG（Android）** 为例：

### VLESS + WebSocket + TLS + CDN 配置参数

| 参数 | 值 |
|---|---|
| 地址 | `node.example.com`（你的域名） |
| 端口 | `443` |
| UUID | x-ui 生成的 UUID |
| 加密 | none |
| 传输协议 | ws |
| 路径 | `/ws` |
| TLS | 开启 |
| SNI | `node.example.com` |
| 指纹 | chrome（可选） |
| 跳过证书验证 | 否 |

或直接在 x-ui 面板的入站列表中点击 **「操作」→「二维码」** 扫码导入。

---

## 九、维护与管理

### 查看 x-ui 状态

```bash
x-ui status
x-ui log      # 查看日志
x-ui restart  # 重启面板
```

### 证书自动续期

acme.sh 安装后会自动添加 crontab 任务，可手动验证：

```bash
~/.acme.sh/acme.sh --renew -d node.example.com --force
```

### 更新 x-ui

```bash
x-ui update
```

---

## 十、常见问题

**Q：连接超时或无法访问？**  
检查顺序：防火墙端口 → Nginx 是否运行 → x-ui 入站端口是否监听 → Cloudflare DNS 是否生效。

**Q：证书申请失败？**  
确认 80 端口未被占用，域名 DNS 已解析到本机 IP（Cloudflare 处于灰云状态）。

**Q：CDN 开启后速度变慢？**  
可在 Cloudflare 的 **速度 → 优化** 中开启 HTTP/3，或尝试其他 Cloudflare 边缘节点（优选 IP）。

**Q：x-ui 面板无法访问？**  
```bash
x-ui restart
ufw allow 54321/tcp
```

---

## 总结

完整链路：  
`客户端` **→** `Cloudflare CDN (443 HTTPS)` **→** `Nginx (TLS 终止 + WebSocket 反代)` **→** `x-ui / Xray Core (10086 WS)`

这套方案的优势：
- **CDN 隐藏真实 IP**，提升安全性
- **WebSocket over TLS** 流量特征接近正常 HTTPS，隐蔽性强
- **Nginx 伪装站点** 降低被识别风险
- **x-ui 面板** 可视化管理，多用户多协议支持

---

*文章发布时间：2026-03-28 | 环境：Vultr / Debian 12 / x-ui / Cloudflare*
