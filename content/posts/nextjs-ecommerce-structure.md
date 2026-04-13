---
title: "Next.js 商城完整结构指南"
date: 2026-03-16T20:14:30+08:00
draft: false
description: "Next.js 电商网站的完整结构规划"
tags: [Next.js, 电商，网站结构]
categories:
  - 技术
author: Frida
slug: "nextjs-structure-guide"
---

# Next.js 商城完整结构指南

---

## 一、圆括号路由 `(groupName)` 是什么？

圆括号语法叫做 **Route Groups（路由分组）**，作用是**组织文件夹结构，但不影响 URL**。

### 对比三种括号写法

| 写法 | URL 影响 | 用途 |
|------|----------|------|
| `[slug]` | ✅ 有，动态参数 `/post/hello` | 动态路由，捕获参数 |
| `(group)` | ❌ 无，文件夹名不出现在 URL | 逻辑分组，共享 layout |
| `[...slug]` | ✅ 有，捕获多段 `/a/b/c` | 捕获任意深度路径 |
| `[[...slug]]` | ✅ 有，可选捕获 | 参数可有可无 |

### 圆括号示例

```
app/
├── (marketing)/          ← 括号不出现在 URL
│   ├── layout.tsx        ← 只作用于 marketing 组的 layout
│   ├── page.tsx          → /
│   └── about/
│       └── page.tsx      → /about
│
├── (shop)/               ← 括号不出现在 URL
│   ├── layout.tsx        ← 只作用于 shop 组的 layout（可加购物车栏）
│   ├── products/
│   │   └── page.tsx      → /products
│   └── cart/
│       └── page.tsx      → /cart
```

两个分组共享同一个域，但可以有**各自独立的 layout**，这是圆括号最大的价值。

---

## 二、渲染写在哪里？

渲染方式不是靠配置文件决定的，**直接写在 `page.tsx` / 组件文件里**，通过代码决定。

### SSG（静态生成）— 默认行为

```tsx
// app/products/page.tsx
// ★ 什么都不加 = 静态生成，构建时执行一次
export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json())

  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  )
}
```

### SSR（服务端渲染）— 加 `cache: 'no-store'`

```tsx
// app/orders/page.tsx
// ★ fetch 加 no-store = 每次请求都重新获取
export default async function OrdersPage() {
  const orders = await fetch('https://api.example.com/orders', {
    cache: 'no-store'   // ← 这一行决定了 SSR
  }).then(r => r.json())

  return <div>{/* 渲染订单 */}</div>
}
```

### ISR（增量静态再生）— 加 `revalidate`

```tsx
// app/products/[id]/page.tsx
// ★ 静态生成，但每 60 秒后台自动刷新
export const revalidate = 60  // ← 写在文件顶层，单位：秒

export default async function ProductPage({ params }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`)
    .then(r => r.json())

  return <div>{product.name}</div>
}
```

### CSR（客户端渲染）— 加 `'use client'`

```tsx
'use client'  // ← 文件第一行，决定在浏览器执行

import { useState } from 'react'

export default function AddToCartButton({ productId }) {
  const [added, setAdded] = useState(false)

  return (
    <button onClick={() => setAdded(true)}>
      {added ? '✅ 已加入购物车' : '加入购物车'}
    </button>
  )
}
```

### 渲染方式速查

| 决定因素 | 渲染方式 |
|----------|----------|
| 普通 async 函数 + fetch（默认） | SSG |
| fetch 加 `cache: 'no-store'` | SSR |
| 文件顶部 `export const revalidate = N` | ISR |
| 文件顶部 `'use client'` | CSR |

---

## 三、Next.js 商城完整目录结构

```
my-shop/
├── public/
│   └── images/                      # 商品图片等静态资源
│
├── src/
│   ├── app/
│   │   │
│   │   ├── (auth)/                  # 认证页面分组（独立布局，无顶部导航）
│   │   │   ├── layout.tsx           # 简洁的认证布局
│   │   │   ├── login/
│   │   │   │   └── page.tsx         → /login
│   │   │   ├── register/
│   │   │   │   └── page.tsx         → /register
│   │   │   └── forgot-password/
│   │   │       └── page.tsx         → /forgot-password
│   │   │
│   │   ├── (shop)/                  # 商城主体分组（带顶部导航 + 购物车图标）
│   │   │   ├── layout.tsx           # 含 Navbar / Footer 的主布局
│   │   │   │
│   │   │   ├── page.tsx             → /            首页（Banner + 推荐商品）
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── page.tsx         → /products    商品列表（筛选、分页）
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     → /products/42 商品详情
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx     → /categories/electronics  分类页
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   └── page.tsx         → /cart        购物车页面
│   │   │   │
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx         → /checkout    填写收货信息
│   │   │   │   └── success/
│   │   │   │       └── page.tsx     → /checkout/success  支付成功页
│   │   │   │
│   │   │   └── account/             # 需要登录才能访问
│   │   │       ├── page.tsx         → /account     个人中心
│   │   │       ├── orders/
│   │   │       │   ├── page.tsx     → /account/orders      订单列表
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx → /account/orders/99   订单详情
│   │   │       └── profile/
│   │   │           └── page.tsx     → /account/profile     编辑资料
│   │   │
│   │   ├── (admin)/                 # 后台管理分组（独立布局，侧边栏导航）
│   │   │   ├── layout.tsx           # 管理后台布局
│   │   │   └── admin/
│   │   │       ├── page.tsx         → /admin       仪表盘
│   │   │       ├── products/
│   │   │       │   └── page.tsx     → /admin/products  商品管理
│   │   │       └── orders/
│   │   │           └── page.tsx     → /admin/orders    订单管理
│   │   │
│   │   ├── api/                     # 后端 API（Next.js Route Handlers）
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts     # NextAuth 认证处理
│   │   │   │   └── register/
│   │   │   │       └── route.ts     # POST /api/auth/register
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── route.ts         # GET /api/products（商品列表）
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts     # GET/PUT/DELETE /api/products/[id]
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   └── route.ts         # GET/POST/DELETE /api/cart
│   │   │   │
│   │   │   ├── orders/
│   │   │   │   ├── route.ts         # POST /api/orders（创建订单）
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts     # GET /api/orders/[id]
│   │   │   │
│   │   │   └── payment/
│   │   │       ├── create/
│   │   │       │   └── route.ts     # POST /api/payment/create（发起支付）
│   │   │       └── webhook/
│   │   │           └── route.ts     # POST /api/payment/webhook（支付回调）
│   │   │
│   │   ├── layout.tsx               # 根布局（html/body/全局 Provider）
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx           # 顶部导航（含购物车图标 + 用户头像）
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── product/
│   │   │   ├── ProductCard.tsx      # 商品卡片（列表用）
│   │   │   ├── ProductGallery.tsx   # 商品图片轮播（详情页）
│   │   │   └── AddToCartButton.tsx  # 加入购物车按钮（'use client'）
│   │   │
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx       # 侧滑购物车抽屉（'use client'）
│   │   │   └── CartItem.tsx         # 购物车单项（修改数量/删除）
│   │   │
│   │   ├── checkout/
│   │   │   ├── AddressForm.tsx      # 收货地址表单（'use client'）
│   │   │   └── PaymentForm.tsx      # 支付方式选择（'use client'）
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx           # 通用按钮
│   │       ├── Input.tsx            # 通用输入框
│   │       └── Modal.tsx            # 通用弹窗
│   │
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth 配置
│   │   ├── db.ts                    # 数据库连接（Prisma）
│   │   ├── stripe.ts                # Stripe 支付 SDK 初始化
│   │   └── utils.ts                 # 工具函数（格式化价格等）
│   │
│   ├── store/
│   │   └── cartStore.ts             # Zustand 购物车全局状态
│   │
│   ├── types/
│   │   └── index.ts                 # TypeScript 类型定义
│   │
│   └── middleware.ts                # 路由守卫（保护需要登录的页面）
│
├── prisma/
│   └── schema.prisma                # 数据库模型定义
│
├── next.config.js
├── .env.local                       # 环境变量（数据库密码、API 密钥等）
└── package.json
```

---

## 四、关键功能实现详解

### 1. 登录认证（NextAuth）

**`src/lib/auth.ts`** — 配置登录方式

```ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    // 账号密码登录
    CredentialsProvider({
      name: 'credentials',
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const user = await db.user.findUnique({
          where: { email: credentials.email }
        })
        // 验证密码...
        return user
      }
    }),
    // Google 第三方登录
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  pages: {
    signIn: '/login',   // 自定义登录页
  }
}
```

**`src/middleware.ts`** — 路由守卫，保护需要登录的页面

```ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' }
})

// 匹配这些路径时自动检查登录状态
export const config = {
  matcher: ['/account/:path*', '/checkout', '/admin/:path*']
}
```

---

### 2. 购物车（Zustand 全局状态）

**`src/store/cartStore.ts`**

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'  // 持久化到 localStorage

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => set(state => {
        const existing = state.items.find(i => i.id === newItem.id)
        if (existing) {
          // 已有则数量 +1
          return {
            items: state.items.map(i =>
              i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          }
        }
        return { items: [...state.items, { ...newItem, quantity: 1 }] }
      }),

      removeItem: (id) => set(state => ({
        items: state.items.filter(i => i.id !== id)
      })),

      updateQuantity: (id, quantity) => set(state => ({
        items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
      })),

      clearCart: () => set({ items: [] }),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'cart-storage' }  // localStorage key
  )
)
```

**`src/components/product/AddToCartButton.tsx`** — 加入购物车按钮

```tsx
'use client'

import { useCartStore } from '@/store/cartStore'

export default function AddToCartButton({ product }) {
  const addItem = useCartStore(state => state.addItem)

  return (
    <button
      onClick={() => addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      })}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg"
    >
      加入购物车
    </button>
  )
}
```

---

### 3. 下单（创建订单 API）

**`src/app/api/orders/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  // 验证登录
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { items, address } = await request.json()

  // 计算总价（在服务端重新计算，防止前端篡改价格）
  const productIds = items.map(i => i.id)
  const products = await db.product.findMany({
    where: { id: { in: productIds } }
  })
  const total = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id)
    return sum + product.price * item.quantity
  }, 0)

  // 创建订单
  const order = await db.order.create({
    data: {
      userId: session.user.id,
      total,
      address: JSON.stringify(address),
      status: 'PENDING',           // 待支付
      items: {
        create: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: products.find(p => p.id === item.id).price
        }))
      }
    }
  })

  return NextResponse.json({ orderId: order.id })
}
```

---

### 4. 支付（Stripe）

**`src/app/api/payment/create/route.ts`** — 创建支付会话

```ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { orderId } = await request.json()

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } }
  })

  // 创建 Stripe 支付会话
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: order.items.map(item => ({
      price_data: {
        currency: 'cny',
        product_data: { name: item.product.name },
        unit_amount: Math.round(item.price * 100),  // Stripe 用分
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?orderId=${orderId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
    metadata: { orderId }
  })

  return NextResponse.json({ url: session.url })  // 跳转到 Stripe 支付页
}
```

**`src/app/api/payment/webhook/route.ts`** — 支付回调（异步通知）

```ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  // 验证回调来自 Stripe（防伪造）
  const event = stripe.webhooks.constructEvent(
    body, sig, process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orderId = session.metadata.orderId

    // 更新订单状态为已支付
    await db.order.update({
      where: { id: orderId },
      data: { status: 'PAID' }
    })
  }

  return NextResponse.json({ received: true })
}
```

---

## 五、数据库模型（Prisma）

**`prisma/schema.prisma`**

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?
  createdAt DateTime @default(now())
  orders    Order[]
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String
  price       Float
  stock       Int
  images      String[]
  category    String
  orderItems  OrderItem[]
}

model Order {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  total     Float
  status    String      @default("PENDING")  // PENDING / PAID / SHIPPED / DONE
  address   String
  createdAt DateTime    @default(now())
  items     OrderItem[]
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float   // 下单时的价格快照
}
```

---

## 六、完整用户购物流程

```
用户访问 /products
        ↓
浏览商品，点击「加入购物车」
→ AddToCartButton（客户端组件）
→ useCartStore.addItem()  写入全局状态（自动同步到 localStorage）
        ↓
点击购物车图标，进入 /cart
→ 展示所有 CartItem，可修改数量 / 删除
        ↓
点击「去结算」→ /checkout
→ 检查 middleware.ts 登录状态（未登录跳转 /login）
→ 填写收货地址（AddressForm）
        ↓
点击「提交订单」
→ POST /api/orders   在服务端创建订单（返回 orderId）
→ POST /api/payment/create  创建 Stripe 支付会话
→ 跳转到 Stripe 托管支付页面
        ↓
用户完成支付
→ Stripe 回调 POST /api/payment/webhook
→ 更新订单状态为 PAID
→ 跳转到 /checkout/success
        ↓
用户在 /account/orders 查看订单记录
```

---

## 七、主要依赖包

```bash
# 认证
npm install next-auth

# 数据库 ORM
npm install prisma @prisma/client

# 全局状态（购物车）
npm install zustand

# 支付
npm install stripe

# 表单验证
npm install react-hook-form zod

# UI 组件库
npm install @shadcn/ui
```

---

## 八、`.env.local` 环境变量

```bash
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/myshop"

# NextAuth
NEXTAUTH_SECRET="随机字符串"
NEXTAUTH_URL="http://localhost:3000"

# Google 登录（可选）
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe 支付
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# 网站地址
NEXT_PUBLIC_URL="http://localhost:3000"
```

---

## 九、一句话总结各模块职责

| 模块 | 技术方案 | 职责 |
|------|----------|------|
| 路由 | App Router（文件即路由） | 页面导航和 URL 管理 |
| 认证 | NextAuth | 登录 / 注册 / Session |
| 路由守卫 | middleware.ts | 拦截未登录访问 |
| 购物车 | Zustand + localStorage | 跨页面持久化状态 |
| 下单 | API Route + Prisma | 服务端创建并校验订单 |
| 支付 | Stripe Checkout | 安全托管支付流程 |
| 数据库 | PostgreSQL + Prisma | 用户、商品、订单持久化 |
