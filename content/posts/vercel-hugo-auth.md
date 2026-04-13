---
title: "Hugo + Vercel 部署权限保护完全指南"
date: 2026-03-29T02:16:18+08:00
draft: false
tags: ["Hugo", "Vercel", "权限控制", "中间件", "静态站点"]
categories: ["Hugo"]
description: "Hugo 生成的是纯静态 HTML，本文介绍三种在 Vercel 上为 Hugo 站点添加权限保护的方案：Vercel Middleware、Vercel 内置保护与前端加密方案，并附完整代码示例。"
---

## 背景：静态站点的鉴权难题

Hugo 是一款极快的静态站点生成器，它将 Markdown 内容编译成纯 HTML 文件。这带来了极佳的性能，但也带来了一个问题：**没有服务器，没有后端，无法在 HTML 内部写鉴权逻辑。**

好在 Vercel 提供了一层"边缘网络（Edge Network）"，可以在请求到达用户之前进行拦截和判断。这就是我们实现权限保护的关键所在。

本文介绍三种方案，从简单到复杂，按需选用。

---

## 方案一：Vercel Middleware（推荐，免费可用）

### 原理

Vercel Middleware 运行在 **Edge Runtime**，在 HTML 文件被发送给用户之前就能完成拦截。无论用户如何操作，未登录状态下根本拿不到受保护的 HTML。

### 实现步骤

**第一步：创建中间件文件**

在 Hugo 项目根目录创建 `middleware.ts`（与 `config.toml` 同级）：

```typescript
import { next } from '@vercel/edge';

export default function middleware(req: Request) {
  const url = new URL(req.url);
  const cookie = req.headers.get('cookie') ?? '';

  // 只保护 /private/ 路径下的内容
  if (url.pathname.startsWith('/private')) {
    const isAuthed = cookie.includes('auth_token=valid');

    if (!isAuthed) {
      // 未登录则重定向到登录页，并记录来源
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', url.pathname);
      return Response.redirect(loginUrl, 302);
    }
  }

  return next();
}

// 配置中间件匹配的路径，避免对所有请求生效影响性能
export const config = {
  matcher: ['/private/:path*'],
};
```

**第二步：创建登录用的 Serverless Function**

在根目录创建 `api/login.ts`（Vercel 会自动识别 `api/` 目录为 Serverless Functions）：

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 建议将密码存入 Vercel 环境变量，不要硬编码
const SITE_PASSWORD = process.env.SITE_PASSWORD ?? 'changeme';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { password, redirect = '/' } = req.body as {
    password: string;
    redirect?: string;
  };

  if (password === SITE_PASSWORD) {
    // 设置 HttpOnly Cookie，防止 XSS 读取
    res.setHeader(
      'Set-Cookie',
      `auth_token=valid; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
    );
    return res.redirect(302, redirect as string);
  }

  return res.redirect(302, `/login?error=1&redirect=${redirect}`);
}
```

**第三步：在 Hugo 中创建登录页**

在 `content/login.md` 中创建登录页内容（使用 `layout: login` 指定自定义模板）：

```markdown
---
title: "请登录"
layout: "login"
---
```

然后在 `layouts/_default/login.html` 中写登录表单：

```html
{{ define "main" }}
<div class="login-container">
  <h1>🔒 访问受限</h1>
  {{ if .Params.error }}
    <p class="error">密码错误，请重试。</p>
  {{ end }}
  <form method="POST" action="/api/login">
    <input type="hidden" name="redirect"
           value="{{ .Params.redirect | default "/" }}">
    <input type="password" name="password"
           placeholder="请输入访问密码" required>
    <button type="submit">进入</button>
  </form>
</div>
{{ end }}
```

**第四步：在 Vercel 中设置环境变量**

进入 Vercel Dashboard → Project → Settings → Environment Variables，添加：

```
SITE_PASSWORD = your_secret_password_here
```

**第五步：配置 `vercel.json`**

在根目录创建 `vercel.json`，告诉 Vercel Hugo 的构建命令：

```json
{
  "buildCommand": "hugo --minify",
  "outputDirectory": "public",
  "installCommand": "apt-get install hugo -y || brew install hugo"
}
```

> **提示**：建议使用 Vercel 的 Hugo 官方模板，构建配置会更顺畅。

### 适用场景

- 需要按路径细分权限（如仅保护 `/private/`、`/members/`）
- 免费用户
- 希望自定义登录页面样式

---

## 方案二：Vercel Deployment Protection（零代码，Pro 版）

如果你订阅了 **Vercel Pro（$20/月）**，官方提供了开箱即用的保护方案。

### 操作步骤

1. 进入 Vercel Dashboard → 选择项目
2. 点击 **Settings → Deployment Protection**
3. 开启 **Password Protection** 或 **Vercel Authentication**

开启后，所有访客必须输入你设定的密码，或使用 Vercel 账号登录，才能访问站点。

### 优缺点

| | |
|---|---|
| ✅ 优点 | 零代码，点击即用；官方支持，安全性极高 |
| ❌ 缺点 | 仅支持保护整站，无法细化到某个路径；需要付费 |

---

## 方案三：前端加密（StaticShield，无需服务器）

如果你不想接触任何后端代码，只是想给某个页面加个简单密码，可以使用 **StaticShield**。

### 原理

StaticShield 会对页面内容进行混淆加密。用户访问页面时，JS 弹出密码框，输入正确密码后才解密并渲染内容。

### 在 Hugo 中使用

在需要保护的页面的 Front Matter 中引入 StaticShield 脚本（通过自定义 shortcode 或 partial）：

```html
<!-- layouts/partials/staticshield.html -->
<script
  src="https://staticshield.vercel.app/script.js"
  data-cap="your_password_capsule_id"
  data-site-title="访问受限"
  data-message="请输入访问密码"
></script>
```

然后在 `layouts/_default/baseof.html` 中条件引入：

```html
{{ if .Params.protected }}
  {{ partial "staticshield.html" . }}
{{ end }}
```

在需要保护的文章中：

```markdown
---
title: "会员专属内容"
protected: true
---
```

### 安全性说明

⚠️ **注意**：前端加密方案本质上是「障碍」而非「防线」。懂技术的用户可以通过以下方式绕过：

- 在浏览器开发者工具中暂停 JS 执行
- 分析内存中已解密的内容
- 直接查看混淆后的源码

**适合**：半公开内容、防君子不防小人的场景。**不适合**：敏感文档、付费内容。

---

## 方案对比

| 特性 | Middleware 方案 | Vercel Pro 保护 | StaticShield |
|------|----------------|----------------|--------------|
| 安全性 | ⭐⭐⭐⭐⭐ 边缘拦截 | ⭐⭐⭐⭐⭐ 官方支持 | ⭐⭐ 可绕过 |
| 路径细分 | ✅ 可指定任意路径 | ❌ 仅限全站 | ✅ 可指定页面 |
| 自定义登录页 | ✅ 完全自定义 | ❌ 使用官方页面 | ⚠️ 有限定制 |
| 成本 | 免费额度内可用 | $20/月 | 有免费版 |
| 代码量 | 中等 | 零代码 | 极少 |

---

## 推荐选择路径

```
你是 Vercel Pro 用户吗？
├── 是 → 直接用 Deployment Protection，零代码搞定
└── 否 → 需要高安全性吗？
        ├── 是 → 使用 Middleware + Serverless Function 方案
        └── 否（仅防普通用户）→ 使用 StaticShield
```

> 💡 **另一个选项**：如果你愿意迁移到 **Cloudflare Pages**，它的免费版自带 **Cloudflare Access**，支持邮箱验证码登录，无需写一行代码，权限保护能力比 Vercel 免费版强大很多。

---

## 小结

Hugo 的纯静态特性并不是权限控制的阻碍，关键在于找对「拦截层」。Vercel 的 Edge Middleware 是目前免费方案里安全性最高的做法，值得投入一点时间配置。如果你在实践中遇到问题，欢迎在评论区留言交流。
