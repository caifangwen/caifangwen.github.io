---
title: "用 n8n 搭建自动化爬虫：从零开始的完整教程"
slug: "n8n-web-scraping-tutorial"
date: 2026-04-02T16:09:44+08:00
lastmod: 2026-04-02T16:09:44+08:00
draft: false
tags: ["n8n", "爬虫", "自动化", "工作流", "no-code"]
categories: ["自动化运营"]
description: "手把手教你用 n8n 可视化工作流平台搭建网页爬虫，实现数据自动采集、清洗与存储，附社区热门爬虫模板推荐。"
author: ""
---

## 什么是 n8n？

n8n（发音 "n-eight-n"）是一款基于节点的开源工作流自动化平台，由德国开发者 Jan Oberhauser 于 2019 年创立，名称来源于 "nodemation"（节点自动化）。它的核心理念是：**把每一个动作封装成节点，用连线把节点串成流程**。

与 Zapier、Make（原 Integromat）相比，n8n 最大的优势是可以完全自托管，数据不出服务器，且支持 JavaScript / Python 自定义代码节点，灵活度极高。截至 2025 年，n8n 已完成 6000 万美元 B 轮融资，拥有超过 20 万活跃用户，集成数量超过 400+。

---

## 为什么用 n8n 做爬虫？

传统爬虫通常需要写 Python/Node.js 脚本，配置定时任务，再手动处理数据存储和通知。n8n 将这些环节**可视化**，让你用拖拽方式完成：

- **定时触发**（Schedule Trigger）：按 cron 表达式定时启动
- **HTTP 请求**（HTTP Request）：抓取目标页面 HTML 或 JSON
- **数据提取**（HTML Extract / Code）：解析 DOM 或用代码处理
- **数据存储**（Google Sheets / MySQL / Notion / Airtable）
- **通知推送**（Telegram / Email / Slack / 企业微信）

整个流程无需离开浏览器，非工程师也能上手。

---

## 部署 n8n

### 方式一：Docker（推荐自托管）

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

浏览器访问 `http://localhost:5678`，注册账号即可使用。

### 方式二：Docker Compose（生产推荐）

```yaml
# docker-compose.yml
version: "3"
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    volumes:
      - ~/.n8n:/home/node/.n8n
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=yourpassword
      - WEBHOOK_URL=https://your-domain.com/
```

```bash
docker-compose up -d
```

### 方式三：n8n Cloud（免部署）

访问 [https://app.n8n.cloud](https://app.n8n.cloud)，免费试用 14 天，适合快速验证想法。

---

## 核心节点介绍

在开始搭建爬虫前，先了解几个关键节点：

| 节点 | 用途 |
|------|------|
| **Schedule Trigger** | 定时触发工作流（如每小时、每天） |
| **HTTP Request** | 发送 GET/POST 请求，获取页面内容或 API 数据 |
| **HTML Extract** | 从 HTML 中用 CSS 选择器提取文本、链接等 |
| **Code** | 执行自定义 JavaScript 或 Python 代码 |
| **Set** | 设置/重命名字段，整理数据结构 |
| **IF / Switch** | 条件判断，根据数据走不同分支 |
| **Loop Over Items** | 遍历数组，对每条数据重复执行操作 |
| **Google Sheets** | 将数据写入 Google 表格 |
| **Send Email / Gmail** | 发送邮件通知或报告 |
| **Telegram** | 推送消息到 Telegram Bot |

---

## 实战一：抓取静态网页数据

以抓取 HackerNews 首页热帖为例，演示最基础的爬虫流程。

### 流程设计

```
Schedule Trigger → HTTP Request → HTML Extract → Set → Google Sheets
```

### 步骤详解

**Step 1：添加 Schedule Trigger**

新建工作流，点击 `+` 添加节点，搜索 `Schedule Trigger`。设置触发间隔，例如每天早上 8:00：

- Mode：`Cron`
- Cron Expression：`0 8 * * *`

**Step 2：添加 HTTP Request**

连接 HTTP Request 节点：

- Method：`GET`
- URL：`https://news.ycombinator.com/`
- Response Format：`String`（返回原始 HTML）

**Step 3：添加 HTML Extract**

连接 HTML Extract 节点，用 CSS 选择器提取数据：

- Source Data：`JSON`，字段选择上一步的 HTML 内容
- Key：`title`，CSS Selector：`.titleline > a`，Return Value：`Text`
- Key：`link`，CSS Selector：`.titleline > a`，Return Value：`Attribute`，Attribute：`href`
- Key：`score`，CSS Selector：`.score`，Return Value：`Text`

**Step 4：添加 Set 节点**

整理字段名称和格式，例如给数据添加 `crawled_at` 时间戳：

```javascript
// 在 Code 节点中也可以这样写
items[0].json.crawled_at = new Date().toISOString();
return items;
```

**Step 5：写入 Google Sheets**

添加 Google Sheets 节点：

1. 先在 Credentials 中配置 Google OAuth2
2. 选择目标 Spreadsheet 和 Sheet
3. Operation 选 `Append Row`
4. 字段映射：title、link、score、crawled_at

---

## 实战二：带翻页的深度爬取

很多场景需要翻页抓取（如抓取电商商品列表的多页数据），核心思路是用 **Loop Over Items** 节点循环处理每一页。

### 流程设计

```
Manual Trigger → Code（生成页码列表）→ Loop Over Items → HTTP Request → HTML Extract → Merge → Google Sheets
```

### 关键：生成页码列表

在 Code 节点中生成要爬取的页码数组：

```javascript
// 生成第 1～10 页的 URL 列表
const pages = [];
for (let i = 1; i <= 10; i++) {
  pages.push({
    json: {
      url: `https://example.com/list?page=${i}`,
      page: i
    }
  });
}
return pages;
```

Loop Over Items 会自动对数组中的每一项执行后续节点，实现翻页抓取。

---

## 实战三：结合 AI 的智能爬虫

n8n 原生支持 AI Agent，可以在抓取后接入大模型做内容理解、分类、摘要。

### 流程设计

```
Schedule Trigger → HTTP Request（抓取新闻）→ HTML Extract → AI Agent（摘要+分类）→ Notion / 飞书
```

### 配置 AI Agent 节点

1. 添加 AI Agent 节点，连接到 HTML Extract 输出
2. Chat Model 选择 OpenAI GPT-4 或本地 Ollama
3. Prompt 示例：

```
你是一个新闻编辑助手。请对以下新闻内容：
1. 用 2-3 句话做中文摘要
2. 打上 1-3 个分类标签（如：科技、AI、商业、政治）
3. 打分：1-5 分表示重要程度

新闻内容：{{ $json.content }}

请用 JSON 格式返回：{"summary": "...", "tags": [], "score": 3}
```

4. 用 Code 节点解析 AI 返回的 JSON，再写入 Notion 数据库

---

## 反爬处理技巧

在 HTTP Request 节点的 **Headers** 中设置以下参数，模拟真实浏览器：

```json
{
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Referer": "https://www.google.com/"
}
```

其他技巧：

- **添加延迟**：在 Loop 中插入 Wait 节点（1～3 秒随机延迟），避免触发频率限制
- **代理 IP**：在 HTTP Request 的 Proxy 配置中填写代理地址
- **Cookie 处理**：先用一个 HTTP Request 获取 Cookie，再用 Set 节点将 Cookie 传递给后续请求
- **JS 渲染页面**：对于 SPA 页面，推荐配合 **Crawl4AI** 或 **Firecrawl** MCP 工具（见下节）

---

## 集成 Firecrawl / Crawl4AI

对于 JavaScript 渲染的动态页面，原生 HTTP Request 无法获取完整内容。推荐接入专业爬虫服务：

### Firecrawl

[Firecrawl](https://www.firecrawl.dev/) 是一个支持 JS 渲染、自动处理反爬的爬虫 API 服务。在 n8n 中通过 HTTP Request 节点调用：

```
POST https://api.firecrawl.dev/v0/scrape
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "url": "https://target-website.com",
  "formats": ["markdown", "html"]
}
```

Firecrawl 返回干净的 Markdown 格式内容，非常适合接入 AI Agent 做后续处理。

### Crawl4AI（开源免费）

[Crawl4AI](https://github.com/unclecode/crawl4ai) 是一款开源的 AI 友好爬虫工具，支持 MCP 协议，可以作为 n8n AI Agent 的 Tool 直接调用，实现"一键抓取任意网站"。

---

## 社区热门爬虫工作流推荐

以下是 n8n 官方模板库和社区中广受欢迎的爬虫相关工作流：

### 1. 网页爬虫 + 邮件/CSV 报告

- **模板 ID**：在 n8n 模板库搜索 "web scraper csv email"
- **功能**：定时抓取目标网页，将结果以 CSV 格式发送邮件，并同步到 Google Sheets

### 2. GitHub 热门项目自动追踪

- **来源**：知乎/社区分享
- **功能**：分页抓取 GitHub Star 超过 5000 的开源项目，自动写入飞书多维表格，支持断点续跑
- **适用场景**：技术雷达、内容推荐、榜单生成

### 3. 全平台热榜聚合（RSSHub + n8n）

- **功能**：通过 RSSHub 订阅微博、B站、豆瓣、知乎等平台热榜，n8n 定时拉取并汇总推送到 Telegram 或 Notion
- **参考**：B站"全网信息流自动收集神器！n8n + RSSHub 教你抓全平台热榜"

### 4. 短视频内容自动归档到 Notion

- **功能**：手机端一键触发，将短视频备份到存储桶，AI 自动提取标签和摘要写入 Notion 知识库
- **特点**：结合 Notion AI 做自动分类，构建个人视频知识库

### 5. 自动化信息采集系统（AI 内容助手）

- **功能**：每天 8 点定时启动，采集 RSS / 自定义来源文章，AI 自动整理分类，输出到内容平台
- **适用场景**：自媒体日报、AI 科技早报、行业简报

### 6. 网站可用性监控

- **官方模板**：[Host Your Own Uptime Monitoring](https://n8n.io/workflows/2327-host-your-own-uptime-monitoring-with-scheduled-triggers/)
- **功能**：定时检查网站状态码、响应时间、SSL 证书，状态变化时自动发送警报
- **核心逻辑**：`定时触发 → HTTP 检查 → 状态判断 → 通知推送`

### 7. SEO 关键词排名追踪

- **功能**：定期抓取搜索引擎结果页，追踪指定关键词的网站排名变化，写入 Google Sheets 形成趋势图

---

## 社区工作流资源库

| 资源 | 地址 | 说明 |
|------|------|------|
| n8n 官方模板库 | https://n8n.io/workflows/ | 官方收录，质量有保障 |
| n8n-workflows（Zie619） | https://github.com/Zie619/n8n-workflows | 4343 个生产就绪工作流，支持全文搜索 |
| n8n-workflow（44510） | https://github.com/44510/n8n-workflow | 2053 个模板，含 FastAPI 本地搜索服务 |
| n8n 中文社区 | https://community.n8n.io/ | 官方论坛，有中文讨论区 |

> **导入方法**：下载工作流 `.json` 文件，在 n8n 编辑器菜单（☰）选择「Import workflow」，导入后更新 Credentials 和 Webhook URL 即可使用。

---

## 常见问题

**Q：n8n 能爬需要登录的网站吗？**

可以。先用 HTTP Request 发送登录请求获取 Session Cookie 或 Token，再在后续请求的 Headers 中附带认证信息即可。

**Q：遇到动态渲染（Vue/React 页面）怎么办？**

原生 HTTP Request 只能拿到初始 HTML，无法执行 JavaScript。推荐接入 Firecrawl、Crawl4AI 或 Browserless 等无头浏览器服务。

**Q：工作流执行失败怎么排查？**

在 n8n 主界面左侧菜单点击 `Executions`，查看每次执行的详细日志，出错节点会标红，点击可看到输入输出数据。

**Q：抓取数据量很大，会不会超时？**

可以启用 n8n 的分批处理（Batch Size），或将大任务拆分为多个子工作流，通过 `Execute Workflow` 节点调用。

---

## 总结

n8n 把爬虫工程中最繁琐的部分——调度、请求、解析、存储、通知——都封装成了可视化节点，大大降低了数据采集的门槛。对于大多数静态页面爬取和 API 数据采集场景，用 n8n 搭建的爬虫完全够用，而且维护成本极低。

更进一步，当你把爬虫和 AI Agent 节点结合时，就能构建真正的**智能信息采集系统**：自动抓取 → 自动理解 → 自动分发，全程无人值守。

> **法律提示**：使用爬虫前请确认目标网站的 `robots.txt` 和使用条款，遵守数据合规要求，切勿用于非法用途。
