---
title: "邮件的底层原理：一封邮件是如何构成的"
date: 2026-03-16T20:14:30+08:00
draft: false
description: "深入邮件的底层世界了解邮件的构成"
tags: [邮件，协议，技术原理]
categories:
  - 游戏开发
  - 游戏开发
  - 游戏开发
  - 技术观察
  - 技术
  - 教程
author: Frida
---

# 邮件的底层原理：一封邮件是如何构成的？

## 前言

我们每天都在发送和接收邮件，但很少有人思考过：当你点击"发送"的瞬间，背后到底发生了什么？一封邮件的本质是什么？它由哪些部分组成？本文将带你深入邮件的底层世界。

---

## 一、邮件的本质：纯文本协议

邮件在网络传输中，**本质上是一段有格式的纯文本**。无论是图片、附件、还是 HTML 富文本，最终都会被编码成文本形式，通过标准协议传输。

核心协议栈：

| 协议 | 用途 | 端口 |
|------|------|------|
| **SMTP** (Simple Mail Transfer Protocol) | 发送邮件 | 25 / 465 / 587 |
| **IMAP** (Internet Message Access Protocol) | 接收/同步邮件 | 143 / 993 |
| **POP3** (Post Office Protocol 3) | 下载邮件 | 110 / 995 |

---

## 二、一封邮件的完整结构

一封完整的邮件由两大部分组成：

```
┌─────────────────────────────────┐
│           Header（头部）         │  ← 元数据：发件人、收件人、时间等
├─────────────────────────────────┤
│                                 │
│           Body（正文）           │  ← 内容：文本、HTML、附件
│                                 │
└─────────────────────────────────┘
```

头部和正文之间，用**一个空行**分隔。这是 RFC 5322 标准规定的。

---

## 三、Header（邮件头部）详解

头部是一系列 `Key: Value` 格式的字段，包含邮件的所有元数据。

### 3.1 核心字段

```
From: 张三 <zhangsan@example.com>
To: 李四 <lisi@example.com>
Cc: 王五 <wangwu@example.com>
Bcc: 秘密抄送 <secret@example.com>
Subject: =?UTF-8?B?5YWI5qyh5YaF5a655o6n5Yi2?=
Date: Sat, 07 Mar 2026 10:30:00 +0800
Message-ID: <20260307103000.abc123@example.com>
```

### 3.2 关键字段说明

**`From`** — 发件人
- 格式：`显示名 <邮件地址>`
- 注意：这个字段**可以伪造**，这也是钓鱼邮件存在的根本原因

**`To` / `Cc` / `Bcc`** — 收件人
- `To`：主要收件人
- `Cc`（Carbon Copy）：抄送，所有人可见
- `Bcc`（Blind Carbon Copy）：密送，其他人不可见；服务器在转发时会剥离 Bcc 字段

**`Subject`** — 主题
- 非 ASCII 字符（如中文）需要编码：`=?UTF-8?B?...?=`（Base64）或 `=?UTF-8?Q?...?=`（Quoted-Printable）

**`Message-ID`** — 邮件唯一标识符
- 全球唯一，用于追踪、回复引用
- 格式：`<随机串@发件域名>`

**`Date`** — 发送时间
- 遵循 RFC 2822 格式，包含时区信息

### 3.3 路由追踪字段：Received

每经过一个邮件服务器，就会在头部**顶部**插入一条 `Received` 记录：

```
Received: from mail.sender.com (mail.sender.com [192.168.1.1])
        by mx.receiver.com with ESMTP id abc123
        for <lisi@example.com>;
        Sat, 07 Mar 2026 10:30:05 +0800

Received: from client.local ([10.0.0.5])
        by mail.sender.com with ESMTP id xyz789;
        Sat, 07 Mar 2026 10:30:00 +0800
```

> 读取顺序：**从下往上** = 邮件传递的时间顺序。这是排查邮件延迟的重要依据。

### 3.4 反垃圾/认证字段

现代邮件系统还会添加安全认证字段：

```
DKIM-Signature: v=1; a=rsa-sha256; d=example.com; s=mail;
    h=from:to:subject:date;
    bh=base64encodedBodyHash==;
    b=base64encodedSignature==

Authentication-Results: mx.receiver.com;
    dkim=pass header.d=example.com;
    spf=pass smtp.mailfrom=example.com;
    dmarc=pass
```

| 机制 | 全称 | 作用 |
|------|------|------|
| **SPF** | Sender Policy Framework | DNS 记录声明哪些 IP 可以发送该域名的邮件 |
| **DKIM** | DomainKeys Identified Mail | 用私钥对邮件头部签名，防止内容篡改 |
| **DMARC** | Domain-based Message Authentication | 定义 SPF/DKIM 失败时的处理策略（拒绝/隔离/放行） |

---

## 四、Body（邮件正文）详解

### 4.1 MIME：让邮件支持多媒体

原始的邮件只支持 ASCII 文本。**MIME**（Multipurpose Internet Mail Extensions）扩展了这一限制，允许邮件携带：
- 多种字符集（UTF-8 中文等）
- HTML 富文本
- 图片、附件
- 混合内容

关键头部字段：

```
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="----=_Part_Boundary_001"
```

### 4.2 Content-Type 类型

| 类型 | 说明 |
|------|------|
| `text/plain` | 纯文本 |
| `text/html` | HTML 富文本 |
| `multipart/mixed` | 混合内容（正文 + 附件） |
| `multipart/alternative` | 备选内容（纯文本版 + HTML 版） |
| `multipart/related` | 内嵌资源（HTML + 内嵌图片） |
| `image/jpeg`, `image/png` | 图片 |
| `application/octet-stream` | 通用二进制（附件） |
| `application/pdf` | PDF 文件 |

### 4.3 内容编码

```
Content-Transfer-Encoding: base64
Content-Transfer-Encoding: quoted-printable
Content-Transfer-Encoding: 7bit
```

- **7bit**：纯 ASCII，无需编码
- **Base64**：二进制文件（图片、附件）转文本
- **Quoted-Printable**：非 ASCII 文本（如中文），可读性更好，`=E4=B8=AD` 表示"中"

---

## 五、完整邮件示例

下面是一封**带 HTML 正文 + 附件**的完整原始邮件（RAW 格式）：

```
From: 张三 <zhangsan@example.com>
To: 李四 <lisi@example.com>
Cc: 王五 <wangwu@example.com>
Subject: =?UTF-8?B?5YWI5qyh5YaF5a655o6n5Yi2?=
Date: Sat, 07 Mar 2026 10:30:00 +0800
Message-ID: <20260307103000.a1b2c3@example.com>
MIME-Version: 1.0
Content-Type: multipart/mixed;
    boundary="==MIXED_BOUNDARY_001=="

--==MIXED_BOUNDARY_001==
Content-Type: multipart/alternative;
    boundary="==ALT_BOUNDARY_002=="

--==ALT_BOUNDARY_002==
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

=E6=9D=8E=E5=9B=9B=EF=BC=8C

=E8=BF=99=E6=98=AF=E4=B8=80=E5=B0=81=E6=B5=8B=E8=AF=95=E9=82=AE=E4=BB=B6=E3=80=82

=E8=AF=B7=E6=9F=A5=E6=94=B6=E9=99=84=E4=BB=B6=E3=80=82

=E7=A5=9D=E5=A5=BD=EF=BC=81
=E5=BC=A0=E4=B8=89

--==ALT_BOUNDARY_002==
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

<!DOCTYPE html>
<html>
<body>
  <p>=E6=9D=8E=E5=9B=9B=EF=BC=8C</p>
  <p>=E8=BF=99=E6=98=AF=E4=B8=80=E5=B0=81<strong>=E6=B5=8B=E8=AF=95=E9=82=AE=E4=BB=B6</strong>=E3=80=82</p>
  <p>=E8=AF=B7=E6=9F=A5=E6=94=B6=E9=99=84=E4=BB=B6=E3=80=82</p>
  <p>=E7=A5=9D=E5=A5=BD=EF=BC=81<br>=E5=BC=A0=E4=B8=89</p>
</body>
</html>

--==ALT_BOUNDARY_002==--

--==MIXED_BOUNDARY_001==
Content-Type: application/pdf; name="report.pdf"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="report.pdf"

JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0Zp
bHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVcoS...
（Base64 编码的 PDF 内容，此处截断）

--==MIXED_BOUNDARY_001==--
```

### 结构分析图

```
邮件（multipart/mixed）
│
├── Header 头部
│   ├── From / To / Cc
│   ├── Subject（UTF-8 编码）
│   ├── Date / Message-ID
│   └── MIME-Version / Content-Type
│
└── Body 正文
    │
    ├── Part 1: multipart/alternative（正文内容）
    │   ├── text/plain（纯文本版，供不支持 HTML 的客户端显示）
    │   └── text/html（HTML 富文本版，优先显示）
    │
    └── Part 2: application/pdf（附件）
        ├── Content-Disposition: attachment
        └── Base64 编码的文件内容
```

---

## 六、邮件的发送过程

```
[你的邮件客户端]
      │  SMTP (587端口，带认证)
      ▼
[你的邮件服务器 MTA]  ← 查询 DNS MX 记录，找到对方服务器
      │  SMTP (25端口)
      ▼
[对方邮件服务器 MTA]  ← 验证 SPF/DKIM/DMARC
      │  存储到邮箱
      ▼
[对方邮件客户端]  ← IMAP/POP3 拉取邮件
```

**MX 记录**（Mail Exchange）：DNS 中指定接收邮件的服务器，例如：
```
example.com  MX  10  mail.example.com
example.com  MX  20  backup-mail.example.com
```
数字越小优先级越高。

---

## 七、有趣的细节

### 7.1 Bcc 是怎么实现的？
发件服务器会为每个 Bcc 收件人单独发送一份邮件，但在发送给其他收件人的版本中**完全删除 Bcc 字段**。Bcc 收件人收到的邮件头部通常是：
```
To: undisclosed-recipients:;
```

### 7.2 "已读回执"如何工作？
HTML 邮件中嵌入一个 1×1 像素的透明图片：
```html
<img src="https://tracker.example.com/pixel?id=唯一标识" width="1" height="1">
```
当你打开邮件加载图片时，发件方服务器就记录了"已读"。**关闭邮件客户端的自动加载图片**可以防止被追踪。

### 7.3 邮件头部可以伪造吗？
`From` 字段完全可以写任何内容，这是钓鱼邮件的根源。SPF、DKIM、DMARC 就是为了解决这个问题：
- **SPF**：证明"我是从授权的 IP 发出的"
- **DKIM**：证明"邮件内容没有被篡改"
- **DMARC**：告诉收件方"如果验证失败，请拒绝/隔离这封邮件"

---

## 八、总结

| 层次 | 内容 |
|------|------|
| **传输协议** | SMTP 发送，IMAP/POP3 接收 |
| **格式标准** | RFC 5322（邮件格式）、RFC 2045-2049（MIME） |
| **头部** | From/To/Subject/Date/Message-ID/Received |
| **正文** | MIME 多部分结构，支持纯文本、HTML、附件 |
| **编码** | Base64（二进制）、Quoted-Printable（文本） |
| **安全** | SPF/DKIM/DMARC 防伪造和篡改 |

一封看似普通的邮件，背后是数十年积累的协议标准和工程智慧。理解这些底层原理，不仅能帮助排查邮件问题，也能让你在面对钓鱼邮件、垃圾邮件时更加从容。

---

*参考标准：RFC 5321 (SMTP)、RFC 5322 (邮件格式)、RFC 2045-2049 (MIME)、RFC 7208 (SPF)、RFC 6376 (DKIM)、RFC 7489 (DMARC)*
