---
title: "使用 1Panel + Vultr VPS 搭建 x-ui WebSocket TLS CDN 节点完整教程"
date: 2026-03-28T15:39:10+08:00
draft: false
tags: ["VPS", "Vultr", "1Panel", "x-ui", "WebSocket", "TLS", "CDN", "Debian", "Nginx"]
categories: ["技术教程"]
description: "以 Debian 12 系统为例，使用 1Panel 面板统一管理 Nginx、SSL 证书与反向代理，配合 x-ui + WebSocket + TLS + Cloudflare CDN 搭建完整节点。"
author: "Admin"
---

## 前言

相比手动配置 Nginx 和 acme.sh，**1Panel** 提供了现代化的 Web 可视化运维界面，可以一站式管理：

- **Nginx 反向代理**（可视化配置，无需手写配置文件）
- **SSL 证书申请与自动续期**（内置 acme 集成）
- **网站管理、文件管理、计划任务** 等

本文在上一篇手动方案的基础上，改用 **1Panel** 统一管理服务器，其余架构不变：

> `客户端` → `Cloudflare CDN (443/TLS)` → `1Panel Nginx (反向代理)` → `x-ui (Xray / WebSocket)`

---

## 一、准备工作

### 1.1 购买 Vultr VPS

1. 前往 [vultr.com](https://www.vultr.com) 注册并充值
2. 新建实例，推荐配置：
   - **Cloud Compute – Shared CPU**
   - 地区：日本 / 新加坡 / 美国西岸
   - 操作系统：**Debian 12 x64**
   - 套餐：$6/月（1C 1G）起步，流量充足
3. 记录服务器 **公网 IP** 和 root 密码

### 1.2 准备域名与 Cloudflare

1. 将域名 NS 接入 Cloudflare（免费套餐）
2. 添加 A 记录，子域名指向 VPS IP：
   - **名称**：`node`（即 `node.example.com`）
   - **类型**：`A`
   - **内容**：`你的 VPS IP`
   - **代理状态**：先保持 **灰云（仅 DNS）**，待证书签发后再开橙云

---

## 二、初始化服务器

### 2.1 SSH 连接

```bash
ssh root@你的VPS_IP
```

### 2.2 系统更新

```bash
apt update && apt upgrade -y
apt install -y curl wget ufw
```

### 2.3 配置防火墙

```bash
ufw allow 22/tcp       # SSH
ufw allow 80/tcp       # HTTP（证书申请 / 重定向）
ufw allow 443/tcp      # HTTPS（CDN 入口）
ufw allow 8090/tcp     # 1Panel 面板默认端口
ufw allow 54321/tcp    # x-ui 面板端口
ufw enable
ufw status
```

### 2.4 开启 BBR 加速（推荐）

```bash
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
lsmod | grep bbr
```

---

## 三、安装 1Panel

### 3.1 一键安装脚本

```bash
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh
bash quick_start.sh
```

安装过程中按提示配置：

| 配置项 | 建议 |
|---|---|
| 面板端口 | `8090`（可自定义） |
| 面板用户名 | 自定义 |
| 面板密码 | 强密码 |
| 安全入口 | 自定义路径（如 `/mypanel`），增加安全性 |

### 3.2 查看安装信息

安装完成后会输出类似：

```
面板地址:  http://你的IP:8090/mypanel
用户名:    admin
密码:      xxxxxxxx
```

### 3.3 访问 1Panel

浏览器打开：`http://你的VPS_IP:8090/mypanel`，登录面板。

---

## 四、在 1Panel 中安装 Nginx

### 4.1 进入应用商店

1. 左侧菜单 → **「应用商店」**
2. 搜索 `OpenResty`（1Panel 推荐使用 OpenResty，兼容标准 Nginx 配置）
3. 点击 **安装**，端口保持默认（80 / 443）

> 1Panel 的网站管理功能依赖 OpenResty，安装后即可在「网站」模块可视化管理反向代理。

### 4.2 验证运行

安装完成后，访问 `http://你的VPS_IP`，看到 OpenResty 默认页面即成功。

---

## 五、安装 x-ui 面板

### 5.1 SSH 中执行一键安装

```bash
bash <(curl -Ls https://raw.githubusercontent.com/vaxilu/x-ui/master/install.sh)
```

按提示设置：
- **面板端口**：`54321`
- **用户名 / 密码**：自定义强密码

### 5.2 验证运行

```bash
x-ui status
```

此时 x-ui 监听在 `54321` 端口，通过 `http://你的VPS_IP:54321` 可临时访问面板。

---

## 六、在 x-ui 中添加 WebSocket 入站

浏览器访问 `http://你的VPS_IP:54321`，登录 x-ui 面板。

左侧菜单 → **「入站列表」→「添加入站」**，按如下参数填写：

| 参数 | 值 |
|---|---|
| 备注 | ws-cdn-node |
| 协议 | `vless`（或 vmess） |
| 监听 IP | 留空 |
| 端口 | `10086`（内部端口） |
| 传输协议 | `ws` |
| 路径 | `/ray`（自定义，后续 Nginx 需一致） |
| TLS | **关闭**（TLS 由 Nginx/1Panel 统一处理） |

点击 **添加**，记录生成的 **UUID**。

---

## 七、在 1Panel 中申请 SSL 证书

### 7.1 进入证书管理

左侧菜单 → **「网站」→「证书」→「申请证书」**

### 7.2 填写申请信息

| 参数 | 值 |
|---|---|
| 主域名 | `node.example.com` |
| 申请方式 | **HTTP 验证**（确保 80 端口通畅，Cloudflare 灰云） |
| 邮箱 | 你的邮箱 |
| CA 机构 | Let's Encrypt |

点击 **确认**，等待 30 秒左右，状态变为 **「已签发」** 即成功。

> 1Panel 会自动添加定时任务，证书到期前自动续期，无需手动操作。

---

## 八、在 1Panel 中创建反向代理网站

### 8.1 新建网站

左侧菜单 → **「网站」→「创建网站」→「反向代理」**

| 参数 | 值 |
|---|---|
| 主域名 | `node.example.com` |
| 代理地址 | `http://127.0.0.1:10086` |
| 备注 | xui-ws-node |

点击 **确认**创建。

### 8.2 配置 SSL

进入刚创建的网站 → **「HTTPS」**：

1. 开启 HTTPS
2. 选择刚申请的证书 `node.example.com`
3. 开启 **HTTP 自动跳转 HTTPS**
4. 点击 **保存**

### 8.3 配置 WebSocket 反代（编辑配置文件）

1Panel 对 WebSocket 需要添加请求头，进入网站 → **「配置文件」**，在 `location /` 块内追加或修改为：

```nginx
location /ray {
    proxy_pass http://127.0.0.1:10086;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 86400s;
}

location / {
    root /www/sites/node.example.com/index;
    index index.html;
}
```

> `/ray` 路径需与 x-ui 入站配置中的路径保持一致。

点击 **保存**，OpenResty 自动重载配置。

### 8.4 添加伪装页面（可选）

在 1Panel **「文件」** 模块，导航到 `/www/sites/node.example.com/index/`，上传或新建一个 `index.html`，使直接访问域名时返回正常网页，降低特征。

---

## 九、开启 Cloudflare CDN

1. 登录 Cloudflare，找到 `node.example.com` 的 A 记录
2. 将代理状态从 **灰云** 切换为 **橙云（已代理）**
3. 进入 **SSL/TLS** → 加密模式选择 **「完全（严格）」**
4. 进入 **网络** → 确认 **WebSocket** 已开启（默认开启）
5. （可选）**缓存 → 配置** 中对 `/ray` 路径添加缓存规则：跳过缓存

---

## 十、客户端配置

以 **v2rayN（Windows）/ v2rayNG（Android）/ Shadowrocket（iOS）** 为例：

### VLESS + WebSocket + TLS 参数

| 参数 | 值 |
|---|---|
| 地址（Host） | `node.example.com` |
| 端口 | `443` |
| UUID | x-ui 生成的 UUID |
| 加密 | `none` |
| 传输协议 | `ws` |
| 路径 | `/ray` |
| TLS | 开启 |
| SNI | `node.example.com` |
| 指纹 | `chrome`（可选） |
| 跳过证书验证 | `否` |

### 快捷导入

在 x-ui 面板 **入站列表** → 对应入站 → **「操作」→「二维码 / 复制链接」**，直接扫码或粘贴到客户端导入。

---

## 十一、1Panel 日常运维

### 查看服务状态

在 1Panel **「主页」** 仪表盘可实时查看 CPU、内存、流量、服务状态。

### 查看 Nginx / OpenResty 日志

**「网站」→ 对应网站 →「日志」**，可实时查看访问日志和错误日志。

### x-ui 常用命令

```bash
x-ui status    # 查看运行状态
x-ui log       # 查看实时日志
x-ui restart   # 重启服务
x-ui update    # 更新到最新版本
```

### 证书续期

1Panel 已自动添加续期计划任务，也可在 **「网站」→「证书」** 中手动点击 **续签** 验证。

### 防火墙管理

1Panel 提供可视化防火墙管理：**「主机」→「防火墙」**，可直接添加/删除端口规则，无需命令行操作。

---

## 十二、常见问题

**Q：1Panel 安装后无法访问面板？**  
检查 `ufw allow 8090/tcp` 是否已执行，同时确认 Vultr 后台的防火墙组（Firewall Group）已开放对应端口。

**Q：SSL 证书申请失败？**  
确认 Cloudflare 处于灰云（仅 DNS）状态，80 端口可访问，且 OpenResty 正在运行。

**Q：WebSocket 连接断开或无法握手？**  
检查 Nginx 配置中是否包含 `Upgrade` 和 `Connection` 请求头，以及 `proxy_read_timeout` 是否设置足够大。

**Q：开启 CDN 后无法连接？**  
确认 Cloudflare SSL/TLS 模式为 **「完全（严格）」**，不要使用「灵活」模式（会导致 SSL 握手失败）。

**Q：x-ui 面板与 1Panel 冲突？**  
两者使用不同端口，互不影响。x-ui 走 54321，1Panel 走 8090，均可同时运行。

---

## 总结

### 与手动方案对比

| 项目 | 手动方案 | 1Panel 方案 |
|---|---|---|
| Nginx 配置 | 手写配置文件 | 可视化 + 配置文件双模式 |
| 证书申请 | acme.sh 命令行 | 面板一键申请 + 自动续期 |
| 日志查看 | SSH + tail | 面板实时查看 |
| 防火墙管理 | ufw 命令行 | 面板可视化操作 |
| 上手难度 | 中等 | 低 |
| 灵活性 | 高 | 中高 |

### 完整链路回顾

```
客户端
  ↓ HTTPS 443
Cloudflare CDN（隐藏真实 IP）
  ↓ 回源 HTTPS
1Panel OpenResty（TLS 终止 + WebSocket 反代 /ray）
  ↓ HTTP WS 127.0.0.1:10086
x-ui / Xray Core（处理 VLESS/VMess 流量）
```

1Panel 让整个运维过程更直观，尤其适合不熟悉 Linux 命令行的用户，同时保留了对配置文件的完整控制权，兼顾易用性与灵活性。

---

*文章发布时间：2026-03-28 | 环境：Vultr / Debian 12 / 1Panel / x-ui / Cloudflare*
