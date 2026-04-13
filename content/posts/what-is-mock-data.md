---
title: "什么是 Mock 数据？"
date: 2026-03-20T15:06:17+08:00
draft: false
tags: ["mock", "测试", "开发", "前端", "后端"]
categories: ["游戏开发"]
description: "全面介绍 Mock 数据的概念、用途、常见工具及最佳实践，帮助开发者提升协作效率与测试质量。"
author: "Claude"
slug: "what-is-mock-data"
---

## 什么是 Mock 数据？

**Mock 数据**（模拟数据）是在软件开发和测试过程中，用来**模拟真实数据或接口响应**的假数据。它并非来自真实的数据库或后端服务，而是由开发者或工具人工构造，用以代替尚未就绪的真实数据源。

"Mock" 一词源自英语，意为"模仿、仿造"。在开发语境中，Mock 数据让开发者可以在真实环境尚未准备好的情况下，照常推进工作。

---

## 为什么需要 Mock 数据？

### 1. 前后端并行开发

在前后端分离的项目中，前端工程师往往需要在后端接口完成之前就开始开发页面。Mock 数据让前端可以按照约定好的接口格式，自行模拟数据进行开发，无需等待后端。

### 2. 单元测试与集成测试

测试时，我们通常不希望真正调用外部接口或数据库（速度慢、有副作用、依赖网络）。Mock 数据可以隔离被测模块，让测试更稳定、更快速。

### 3. 边界条件与异常场景模拟

真实环境中，某些极端情况（如接口超时、返回空数据、返回错误码）难以复现。Mock 数据可以轻松构造这些场景，帮助开发者提前处理异常。

### 4. 演示与原型验证

在产品 Demo 或原型阶段，使用 Mock 数据可以快速展示功能效果，而无需搭建完整的后端服务。

---

## 为什么用 Mock，而不是本地数据库？

很多人会问：我直接在本地跑一个数据库，填几条测试数据不就行了？Mock 和本地数据库并不是同一个层面的东西，各有适用场景，但 Mock 在很多情况下有本地数据库无法替代的优势。

### 对比总览

| 维度 | Mock 数据 | 本地数据库 |
|------|-----------|------------|
| **启动成本** | 零配置，即写即用 | 需安装、初始化、建表、填数据 |
| **团队协作** | 配置文件提交 Git，所有人一致 | 每人本地环境各自维护，容易不一致 |
| **CI/CD 环境** | 天然支持，无需额外服务 | 需在流水线中启动数据库服务 |
| **异常场景** | 可精确控制超时、报错、空数据 | 难以稳定复现极端情况 |
| **数据隔离** | 每次测试可重置，互不污染 | 测试之间共享状态，容易相互影响 |
| **网络依赖** | 完全离线可用 | 本地数据库也需进程运行，偶有端口冲突 |
| **速度** | 内存级响应，毫秒级 | 有 I/O 开销，相对较慢 |

### 本地数据库更适合的场景

Mock 并不是万能的。当你需要以下能力时，本地数据库更合适：

- **测试复杂查询逻辑**：JOIN、事务、索引性能等，必须真实数据库才能验证。
- **数据迁移脚本验证**：Schema 变更需要在真实数据库上执行和回滚。
- **ORM 行为测试**：验证 Hibernate、Prisma 等 ORM 生成的 SQL 是否正确。
- **端到端（E2E）测试**：模拟完整用户流程时，通常需要真实的数据持久化。

### 结论

> **Mock 解决的是"依赖隔离"问题，本地数据库解决的是"真实行为验证"问题。** 两者不是替代关系，而是互补关系——单元测试和接口联调用 Mock，集成测试和 E2E 测试用真实数据库。

---

## 如何清除 Mock 数据？

Mock 数据的清除策略取决于你使用的方式。以下按场景分类说明。

### 1. 代码中的静态 Mock（硬编码）

直接删除或注释掉对应代码块。建议配合环境变量控制开关，而非散落在业务代码里：

```javascript
// 推荐：通过环境变量控制
const userData = import.meta.env.DEV
  ? mockUserData          // 开发环境用 Mock
  : await fetchUser()     // 生产环境调真实接口
```

上线时只需将 `DEV` 环境变量关闭，Mock 代码自动不生效，无需手动删除。

### 2. Mock.js 拦截的清除

Mock.js 会全局拦截 `XMLHttpRequest`，需要显式移除：

```javascript
// 清除指定接口的 Mock
Mock.mock('/api/user', null)  // 传入 null 即可移除该拦截

// 或者：只在开发模式下引入 Mock 模块
if (process.env.NODE_ENV === 'development') {
  await import('./mocks/setup')
}
```

### 3. MSW（Mock Service Worker）的清除

MSW 的设计本身就支持优雅的启停：

```javascript
// 启动
worker.start()

// 停止（清除所有拦截）
worker.stop()

// 只重置 handler，不停止 worker
worker.resetHandlers()
```

在测试中，通常配合 `afterEach` / `afterAll` 自动清理：

```javascript
afterEach(() => worker.resetHandlers())
afterAll(() => worker.stop())
```

### 4. JSON Server 的清除

JSON Server 是一个独立进程，直接关闭即可。其数据文件（`db.json`）可以用 Git 恢复到初始状态：

```bash
# 停止服务
Ctrl + C

# 恢复数据文件到初始状态
git checkout db.json
```

### 5. Jest / Vitest 中函数 Mock 的清除

```javascript
// 清除单个 Mock 的调用记录（保留实现）
mockFn.mockClear()

// 重置 Mock 实现和调用记录
mockFn.mockReset()

// 恢复为原始真实实现
mockFn.mockRestore()

// 全局自动清理（推荐在 jest.config.js 中配置）
// jest.config.js
module.exports = {
  clearMocks: true,    // 每个测试前自动 clear
  resetMocks: false,
  restoreMocks: true,  // 每个测试后自动 restore
}
```

### 清除时机建议

| 场景 | 推荐做法 |
|------|----------|
| 联调开始前 | 将 Mock 开关切换为真实接口，逐个验证 |
| 测试结束后 | 用 `afterEach` 自动重置，避免测试间污染 |
| 上线发布前 | CI 流水线中不加载 Mock 模块，环境变量控制 |
| 长期维护 | 将 Mock 文件统一放在 `src/mocks/` 目录，便于整体删除或禁用 |

---

## Mock 数据的常见形式

### 静态 Mock

直接在代码中硬编码数据，或将数据写入 JSON 文件。

```json
{
  "id": 1,
  "name": "张三",
  "email": "zhangsan@example.com",
  "age": 28
}
```

### 动态 Mock（Mock Server）

使用工具启动一个本地服务器，根据请求路径返回对应的模拟数据，支持随机生成、延迟响应等高级功能。

### 函数级 Mock

在测试框架中，对某个函数或模块进行 Mock，替换其真实实现。

```javascript
// 使用 Jest 模拟一个 API 调用函数
jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: 1, name: '张三' })
}));
```

---

## 常用 Mock 工具

| 工具 | 适用场景 | 特点 |
|------|----------|------|
| **Mock.js** | 前端 | 语法简洁，支持随机数据生成 |
| **JSON Server** | 前后端 | 基于 JSON 文件快速启动 REST API |
| **MSW（Mock Service Worker）** | 前端 | 拦截浏览器/Node 网络请求，无侵入 |
| **Faker.js** | 通用 | 生成各类随机假数据（姓名、地址、邮箱等） |
| **Postman Mock Server** | API 调试 | 在 Postman 中直接创建 Mock 接口 |
| **Jest / Vitest Mock** | 单元测试 | 对模块、函数进行精细化 Mock |
| **WireMock** | Java 后端 | HTTP Mock 服务，支持复杂匹配规则 |

---

## Mock.js 示例

[Mock.js](http://mockjs.com) 是前端最常用的 Mock 数据库之一，支持通过模板语法快速生成随机数据。

```javascript
import Mock from 'mockjs'

const data = Mock.mock({
  'list|10': [{         // 生成 10 条数据
    'id|+1': 1,         // id 自增
    'name': '@cname',   // 随机中文姓名
    'age|18-60': 1,     // 18~60 之间的随机整数
    'email': '@email',  // 随机邮箱
    'city': '@city'     // 随机城市
  }]
})

console.log(data)
```

---

## Mock 数据的最佳实践

1. **与真实接口保持契约一致**：Mock 数据的结构应严格遵循接口文档（如 OpenAPI/Swagger），避免联调时出现字段不一致的问题。

2. **覆盖边界与异常情况**：不只 Mock 正常返回，还要模拟空数据、错误码、超时等场景。

3. **环境隔离**：Mock 只应在开发和测试环境启用，生产环境必须使用真实数据。

4. **及时同步更新**：接口变更时，对应的 Mock 数据也要同步修改，防止出现"假的绿灯"。

5. **与团队共享**：将 Mock 配置纳入版本控制，方便团队成员共同维护。

---

## 总结

Mock 数据是现代软件开发中不可或缺的工程实践。它让前后端解耦、测试可控、开发提速。合理使用 Mock 工具，能显著提升团队的开发效率与代码质量。

> 好的 Mock，是优秀工程实践的一部分——它不是在"作弊"，而是在"隔离复杂性"。
