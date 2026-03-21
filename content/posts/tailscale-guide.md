---
title: "Tailscale 完全使用指南"
date: 2026-03-16T20:14:30+08:00
draft: false
description: "Tailscale 是一个基于 WireGuard 的现代化 VPN 解决方案"
tags: [VPN, Tailscale, 网络，安全]
categories:
  - 工具
author: Frida
---

# Tailscale 完全使用指南

Tailscale 是一个基于 WireGuard 的现代化虚拟私有网络(VPN)解决方案,它能够让你轻松地将分散在不同网络中的设备连接成一个安全的私有网络。与传统 VPN 不同,Tailscale 采用点对点连接,配置简单,几乎零配置即可使用。

## 什么是 Tailscale

Tailscale 构建在 WireGuard 协议之上,提供了一个安全、快速的网络层。它的核心优势在于简化了 WireGuard 的配置过程,通过中央协调服务器自动处理密钥交换和路由配置,同时实际的数据传输仍然是点对点进行的,确保了性能和隐私。

使用 Tailscale 可以实现远程访问家中或办公室的设备、在不同云服务器之间建立安全连接、与团队成员共享开发环境等场景。

## 安装 Tailscale

Tailscale 支持几乎所有主流平台,包括 Linux、macOS、Windows、iOS、Android 等。

**Linux 安装**

在大多数 Linux 发行版上,可以使用官方提供的安装脚本:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

对于 Ubuntu/Debian 系统,也可以手动添加软件源:

```bash
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/focal.gpg | sudo apt-key add -
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/focal.list | sudo tee /etc/apt/sources.list.d/tailscale.list
sudo apt update
sudo apt install tailscale
```

**macOS 安装**

可以从 Mac App Store 下载 Tailscale 应用,或者使用 Homebrew:

```bash
brew install tailscale
```

**Windows 安装**

访问 Tailscale 官网下载 Windows 安装程序,运行安装即可。

**移动设备**

在 iOS 的 App Store 或 Android 的 Google Play 商店搜索 "Tailscale" 下载安装。

## 初次配置

安装完成后,需要进行初始化和认证。

**启动 Tailscale**

在 Linux 上,运行:

```bash
sudo tailscale up
```

首次运行时,命令行会输出一个认证链接,需要在浏览器中打开这个链接进行身份验证。Tailscale 支持多种认证方式,包括 Google、Microsoft、GitHub 等账号登录。

在 macOS 和 Windows 上,启动应用后会自动弹出浏览器进行认证。

**验证连接**

认证成功后,设备会自动加入你的 Tailscale 网络(称为 tailnet)。每个设备会获得一个 100.x.y.z 格式的 IP 地址。

可以通过以下命令查看当前状态:

```bash
tailscale status
```

这会列出网络中所有在线的设备及其 IP 地址。

## 基本使用

**连接到其他设备**

一旦设备加入网络,就可以直接使用 Tailscale 分配的 IP 地址访问其他设备。例如,如果另一台设备的 IP 是 100.101.102.103,可以直接:

```bash
ssh user@100.101.102.103
ping 100.101.102.103
```

**使用 MagicDNS**

Tailscale 提供了 MagicDNS 功能,可以使用设备名称代替 IP 地址。在 Tailscale 管理后台启用 MagicDNS 后,可以直接使用设备名:

```bash
ssh user@my-server
ping laptop
```

设备名会自动解析为对应的 Tailscale IP 地址。

**文件传输**

Tailscale 内置了文件传输功能 Taildrop,可以在设备间快速传输文件:

```bash
tailscale file cp myfile.txt other-device:
```

在图形界面的应用中,也可以通过拖放方式发送文件。

## 高级功能

**子网路由(Subnet Router)**

子网路由允许通过一台 Tailscale 设备访问其所在的整个局域网。假设你有一台运行 Tailscale 的 Linux 服务器,IP 地址是 192.168.1.100,你想通过它访问整个 192.168.1.0/24 网络。

首先在这台服务器上启用 IP 转发:

```bash
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

然后以子网路由模式启动 Tailscale:

```bash
sudo tailscale up --advertise-routes=192.168.1.0/24
```

接着在 Tailscale 管理后台批准这个路由。现在你可以从任何 Tailscale 设备访问 192.168.1.x 网段的所有设备,即使它们没有安装 Tailscale。

**Exit Node(出口节点)**

Exit Node 功能可以将某台设备设置为网络出口,所有流量都通过它转发。这在需要特定地理位置的 IP 或更安全的公共网络访问时很有用。

在要作为出口的设备上:

```bash
sudo tailscale up --advertise-exit-node
```

在管理后台批准后,其他设备可以选择使用这个出口:

```bash
tailscale up --exit-node=exit-device-name
```

**ACL(访问控制列表)**

Tailscale 支持细粒度的访问控制。在管理后台的 Access Controls 页面,可以编写 JSON 格式的 ACL 规则,控制哪些设备或用户可以访问哪些资源。

例如,限制只有特定用户可以 SSH 到服务器:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["user@example.com"],
      "dst": ["server:22"]
    }
  ]
}
```

**自定义域名**

在 DNS 设置中,可以为 Tailscale 网络配置自定义域名,而不使用默认的 `.ts.net` 后缀。

## 实际应用场景

**远程办公访问**

在家中的电脑和公司的工作站都安装 Tailscale,可以在家中像在办公室一样访问所有内部资源,无需配置复杂的 VPN。

**个人服务器管理**

如果你在云端和家中都有服务器,Tailscale 可以让它们组成一个统一的私有网络,方便管理和数据同步。

**开发环境共享**

团队成员可以通过 Tailscale 直接访问彼此的开发环境,进行协作调试,而不需要暴露端口到公网。

**IoT 设备管理**

在树莓派或其他 IoT 设备上安装 Tailscale,可以从任何地方安全地访问和管理这些设备。

## 安全性考虑

Tailscale 的安全性建立在几个层面上。首先,所有连接都使用 WireGuard 的加密,确保数据传输安全。其次,身份验证通过可信的第三方提供商进行。再次,密钥交换通过 Tailscale 的协调服务器完成,但协调服务器本身无法解密你的流量。

建议定期检查已连接的设备列表,及时移除不再使用的设备,并合理配置 ACL 规则限制访问权限。

## 常见问题排查

**无法建立连接**

如果两台设备无法直接连接,可能是因为 NAT 穿透失败。可以查看详细状态:

```bash
tailscale netcheck
```

在某些严格的网络环境下,可能需要使用 DERP 中继服务器。

**性能问题**

如果发现连接速度慢,检查是否建立了直接连接:

```bash
tailscale ping other-device
```

输出会显示是直接连接还是通过中继。

**设备离线**

如果设备显示离线,确认 Tailscale 服务正在运行:

```bash
sudo systemctl status tailscaled
```

## 总结

Tailscale 通过简化 WireGuard 的配置过程,让搭建安全的私有网络变得非常简单。无论是个人使用还是团队协作,它都能提供可靠的解决方案。从基本的设备互联到高级的子网路由和访问控制,Tailscale 提供了丰富的功能来满足不同场景的需求。通过合理配置和使用,你可以构建一个安全、高效、易于管理的分布式网络。