---
title: "Next.js 网站结构详解"
date: 2026-03-16T20:14:30+08:00
draft: false
description: "Next.js 是基于 React 的全栈框架"
tags: [Next.js, React, 网站结构]
categories:
  - 技术
author: Frida
slug: "nextjs-structure-guide"
---



> Next.js 是基于 React 的全栈框架，由 Vercel 开发，内置路由、SSR、SSG、API 等能力，开箱即用。

---

## 一、创建项目

```bash
npx create-next-app@latest my-website
cd my-website
npm run dev
```

安装时会询问几个选项（推荐配置）：

| 选项 | 推荐选择 |
|------|----------|
| TypeScript | Yes |
| ESLint | Yes |
| Tailwind CSS | Yes |
| `src/` 目录 | Yes |
| App Router | Yes（现代方式） |

---

## 二、项目目录结构

```
my-website/
├── public/                  # 静态资源（图片、字体、图标）
│   └── logo.png
│
├── src/
│   ├── app/                 # ★ 核心：App Router 路由目录
│   │   ├── layout.tsx       # 全局布局（根组件，包裹所有页面）
│   │   ├── page.tsx         # 首页 → 对应路由 /
│   │   ├── globals.css      # 全局样式
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx     # 关于页面 → 对应路由 /about
│   │   │
│   │   ├── blog/
│   │   │   ├── page.tsx     # 博客列表 → /blog
│   │   │   └── [slug]/
│   │   │       └── page.tsx # 博客详情 → /blog/hello-world（动态路由）
│   │   │
│   │   └── api/
│   │       └── hello/
│   │           └── route.ts # API 接口 → GET /api/hello
│   │
│   └── components/          # 可复用 UI 组件
│       ├── Navbar.tsx
│       └── Footer.tsx
│
├── next.config.js           # Next.js 配置文件
├── tailwind.config.js       # Tailwind 配置
├── tsconfig.json            # TypeScript 配置
└── package.json
```

---

## 三、核心文件逐一解说

### 1. `app/layout.tsx` — 全局布局

每个页面都会被这个组件包裹，适合放导航栏、页脚、全局字体。

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: '我的网站',
  description: '用 Next.js 构建的网站',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <Navbar />
        <main>{children}</main>   {/* 各页面内容渲染到这里 */}
        <Footer />
      </body>
    </html>
  )
}
```

---

### 2. `app/page.tsx` — 首页

文件名 `page.tsx` 是 Next.js 的约定，对应该目录的路由页面。

```tsx
// src/app/page.tsx → 访问路径：/
export default function HomePage() {
  return (
    <div>
      <h1>欢迎来到我的网站</h1>
      <p>这是首页内容</p>
    </div>
  )
}
```

---

### 3. `app/about/page.tsx` — 静态子页面

在 `app/` 下新建文件夹，自动创建对应路由，**零配置**。

```tsx
// src/app/about/page.tsx → 访问路径：/about
export default function AboutPage() {
  return (
    <div>
      <h1>关于我们</h1>
      <p>这是关于页面</p>
    </div>
  )
}
```

---

### 4. `app/blog/[slug]/page.tsx` — 动态路由

用方括号 `[slug]` 表示动态参数，可匹配任意路径。

```tsx
// src/app/blog/[slug]/page.tsx → 访问路径：/blog/my-first-post
type Props = {
  params: { slug: string }
}

export default function BlogPostPage({ params }: Props) {
  return (
    <article>
      <h1>文章：{params.slug}</h1>
      <p>这里是文章正文内容...</p>
    </article>
  )
}
```

访问 `/blog/hello-world` 时，`params.slug` 就是 `"hello-world"`。

---

### 5. `app/api/hello/route.ts` — API 接口

Next.js 内置 API 路由，无需额外后端服务。

```ts
// src/app/api/hello/route.ts → 请求路径：GET /api/hello
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: '你好，世界！' })
}

export async function POST(request: Request) {
  const body = await request.json()
  return NextResponse.json({ received: body })
}
```

---

### 6. `components/Navbar.tsx` — 可复用组件

组件和 React 写法完全一致，放在 `components/` 统一管理。

```tsx
// src/components/Navbar.tsx
import Link from 'next/link'  // 使用 Next.js 的 Link 做页面跳转（性能更好）

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '16px' }}>
      <Link href="/">首页</Link>
      <Link href="/about">关于</Link>
      <Link href="/blog">博客</Link>
    </nav>
  )
}
```

---

## 四、路由规则总结

| 文件路径 | 访问 URL | 说明 |
|----------|----------|------|
| `app/page.tsx` | `/` | 首页 |
| `app/about/page.tsx` | `/about` | 静态页面 |
| `app/blog/page.tsx` | `/blog` | 博客列表 |
| `app/blog/[slug]/page.tsx` | `/blog/任意内容` | 动态路由 |
| `app/api/hello/route.ts` | `/api/hello` | API 接口 |

---

## 五、数据获取方式

Next.js 支持三种渲染模式，在同一个项目里可以混用：

### SSG — 静态生成（默认，性能最好）

```tsx
// 构建时就生成好 HTML，适合内容不常变的页面
export default async function BlogList() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

### SSR — 服务端渲染（每次请求实时生成）

```tsx
// 加上 cache: 'no-store' 就变成 SSR
export default async function NewsPage() {
  const news = await fetch('https://api.example.com/news', {
    cache: 'no-store'   // ← 关键，禁止缓存
  }).then(r => r.json())
  return <div>{news.headline}</div>
}
```

### CSR — 客户端渲染（浏览器中执行）

```tsx
'use client'  // ← 必须在文件顶部声明

import { useState, useEffect } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>点击 {count} 次</button>
}
```

---

## 六、`'use client'` vs 服务端组件

| | 服务端组件（默认） | 客户端组件（加 `'use client'`） |
|--|--|--|
| 运行环境 | Node.js 服务器 | 浏览器 |
| 能用 useState/useEffect | ❌ | ✅ |
| 能访问数据库/文件系统 | ✅ | ❌ |
| SEO 友好 | ✅ | ❌ |
| 适合场景 | 数据展示、静态内容 | 交互、表单、动画 |

**最佳实践**：默认用服务端组件，只有需要交互时才加 `'use client'`。

---

## 七、快速启动命令

```bash
npm run dev      # 开发模式（本地 http://localhost:3000）
npm run build    # 打包生产版本
npm run start    # 运行生产版本
npm run lint     # 代码检查
```

---

## 八、一句话总结

> **文件即路由** — 在 `app/` 目录下创建 `page.tsx`，就是创建一个页面；创建 `route.ts`，就是创建一个 API。其余的交给 Next.js 自动处理。
