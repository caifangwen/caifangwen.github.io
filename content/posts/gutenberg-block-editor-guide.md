---
title: "深入了解 Gutenberg：WordPress 区块编辑器完全指南"
slug: "wordpress-gutenberg-block-editor-complete-guide"
date: 2026-04-12T02:22:22+08:00
lastmod: 2026-04-12T02:22:22+08:00
draft: false
tags: ["WordPress", "Gutenberg", "区块编辑器", "全站编辑", "FSE"]
categories: ["WordPress"]
description: "全面介绍 WordPress Gutenberg 区块编辑器的历史背景、核心概念、常用区块、全站编辑（FSE）、插件生态与使用技巧，帮助你充分发挥 Gutenberg 的潜力。"
---

## 一、什么是 Gutenberg？

**Gutenberg** 是 WordPress 自 5.0 版本（2018年12月）起内置的默认编辑器，以活字印刷术发明者**约翰内斯·古腾堡（Johannes Gutenberg）**命名，寓意"印刷革命"。

它彻底改变了 WordPress 的内容创作方式：将页面和文章的每一个内容单元抽象为独立的**区块（Block）**，通过拖拽、组合这些区块来构建页面，而不再依赖传统的富文本输入框。

Gutenberg 的开发是一个持续推进的项目，官方将其分为四个阶段：

1. **更简单的编辑体验**（已完成）：替代经典编辑器，引入区块概念
2. **自定义区块**（已完成）：允许主题和插件注册自定义区块
3. **全站编辑（FSE）**（进行中）：用区块编辑器管理整个网站的视觉结构
4. **多人协作**（规划中）：支持实时协同编辑

---

## 二、核心概念：区块（Block）

区块是 Gutenberg 的基本单位，每一段文字、每一张图片、每一个按钮都是一个独立的区块。

### 2.1 区块的基本操作

- **插入区块**：点击段落间的 `+` 按钮，或输入 `/` 调出快速搜索面板
- **移动区块**：拖拽左侧手柄，或使用上下箭头按钮调整顺序
- **复制/粘贴区块**：右键菜单支持复制整个区块（包含设置）
- **删除区块**：选中后按 `Backspace` 或通过右键菜单删除
- **转换区块类型**：许多区块支持互相转换，例如段落转标题、列表转引用

### 2.2 区块的三层设置

每个区块被选中后，右侧面板会显示三类设置：

| 层级 | 说明 |
|------|------|
| **工具栏（Toolbar）** | 悬浮在区块顶部，提供对齐、加粗、链接等快捷操作 |
| **区块设置（Block）** | 右侧面板，控制该区块的样式、颜色、间距等属性 |
| **文档设置（Document）** | 右侧面板顶部切换，控制文章的发布状态、分类、特色图片等 |

### 2.3 区块与经典编辑器的本质区别

经典编辑器将整篇内容存储为一段 HTML 字符串；而 Gutenberg 将每个区块单独存储，并在 HTML 注释中嵌入结构化的元数据，例如：

```html
<!-- wp:paragraph {"fontSize":"large"} -->
<p class="has-large-font-size">这是一段文字</p>
<!-- /wp:paragraph -->
```

这种结构使得区块可以被程序化地解析、渲染和转换，是未来全站编辑和多端输出的基础。

---

## 三、内置区块分类详解

Gutenberg 内置了数十个区块，按功能分为以下几类：

### 3.1 文本类区块

| 区块名称 | 用途 |
|----------|------|
| **段落（Paragraph）** | 基础文字输入，支持自定义字号、颜色、行距 |
| **标题（Heading）** | H1–H6 标题，支持锚点链接 |
| **列表（List）** | 有序/无序列表，支持多级嵌套 |
| **引用（Quote）** | 带来源的引用块 |
| **代码（Code）** | 等宽代码块，保留缩进和空格 |
| **预格式化（Preformatted）** | 保留原始格式的文本 |
| **经典段落（Classic）** | 内嵌一个迷你版经典编辑器 |
| **脚注（Footnotes）** | 自动管理文章脚注 |

### 3.2 媒体类区块

| 区块名称 | 用途 |
|----------|------|
| **图像（Image）** | 插入图片，支持 alt 文本、链接、圆角、遮罩 |
| **图集（Gallery）** | 多图网格展示，支持列数、裁剪模式 |
| **音频（Audio）** | 内嵌音频播放器 |
| **视频（Video）** | 上传本地视频 |
| **封面（Cover）** | 带文字叠加的背景图/背景视频区块 |
| **文件（File）** | 提供文件下载链接 |
| **媒体与文字（Media & Text）** | 图文并排布局 |

### 3.3 设计类区块

| 区块名称 | 用途 |
|----------|------|
| **按钮（Buttons）** | 单个或组合的 CTA 按钮 |
| **列（Columns）** | 多列自适应布局容器 |
| **分组（Group）** | 将多个区块打包为一个容器，统一设置背景色、内边距 |
| **行（Row）** | 水平排列的弹性布局容器 |
| **堆叠（Stack）** | 垂直排列的弹性布局容器 |
| **网格（Grid）** | CSS Grid 布局容器（较新版本引入） |
| **分隔线（Separator）** | 水平分割线 |
| **间距（Spacer）** | 可调节高度的空白间距 |

### 3.4 小部件类区块

| 区块名称 | 用途 |
|----------|------|
| **短代码（Shortcode）** | 插入 WordPress 短代码 |
| **自定义 HTML** | 插入任意 HTML 片段 |
| **最新文章** | 动态展示最新文章列表 |
| **最新评论** | 展示最新评论 |
| **归档** | 按月/年归档链接 |
| **分类列表** | 展示分类目录 |
| **标签云** | 展示标签云 |
| **RSS** | 嵌入外部 RSS 订阅内容 |
| **搜索** | 搜索表单 |
| **社交链接** | 社交媒体图标链接组 |

### 3.5 嵌入类区块（Embeds）

支持一键嵌入 YouTube、Vimeo、Twitter/X、Instagram、TikTok、Spotify、SoundCloud、GitHub Gist 等数十个平台。

---

## 四、可复用区块与同步模式

### 4.1 可复用区块（Reusable Blocks）

可复用区块允许将一个或一组区块保存为模板，在多篇文章中重复使用。从 WordPress 6.3 起，可复用区块已升级为**已同步模式（Synced Patterns）**。

**使用场景举例：**

- 固定的文章末尾 CTA（订阅引导、联系方式）
- 全站统一的免责声明段落
- 重复使用的促销横幅

### 4.2 同步 vs 非同步

| 模式 | 行为 |
|------|------|
| **已同步（Synced）** | 修改原始模式后，所有引用该模式的地方同步更新 |
| **未同步（Not Synced）** | 相当于复制粘贴，各处独立编辑，互不影响 |

---

## 五、全站编辑（Full Site Editing，FSE）

全站编辑是 Gutenberg 项目第三阶段的核心成果，从 WordPress 5.9 开始逐步引入，需要配合支持 FSE 的**区块主题（Block Theme）**使用。

### 5.1 FSE 的核心组件

**模板（Templates）**

定义特定页面类型的完整布局结构，例如首页模板、单篇文章模板、归档模板、404 模板等。

**模板部件（Template Parts）**

页眉（Header）、页脚（Footer）、侧边栏等可在多个模板中复用的区域。

**样式（Styles）**

全局设计令牌，统一管理全站的字体、颜色、间距、按钮样式，无需编写 CSS。

**导航区块（Navigation Block）**

可视化编辑菜单结构，支持下拉菜单、汉堡菜单等响应式导航。

### 5.2 theme.json

区块主题使用 `theme.json` 文件定义全局样式规范，包括调色板、字体比例、间距预设等，是 FSE 设计系统的核心配置文件：

```json
{
  "version": 2,
  "settings": {
    "color": {
      "palette": [
        { "name": "Primary", "slug": "primary", "color": "#0073aa" },
        { "name": "Secondary", "slug": "secondary", "color": "#23282d" }
      ]
    },
    "typography": {
      "fontSizes": [
        { "name": "Small", "slug": "small", "size": "0.875rem" },
        { "name": "Large", "slug": "large", "size": "1.5rem" }
      ]
    }
  }
}
```

### 5.3 推荐的 FSE 区块主题

- **Twenty Twenty-Four / Twenty Twenty-Five**：WordPress 官方默认主题，完整 FSE 支持
- **Ollie**：设计精美的开源区块主题
- **Kadence**：兼顾 FSE 与传统主题的混合方案，生态完整
- **GeneratePress**：轻量高性能，支持 FSE

---

## 六、区块插件生态

Gutenberg 拥有活跃的插件生态，许多插件通过注册自定义区块来扩展编辑器功能。

### 6.1 常用区块插件

| 插件名称 | 特点 |
|----------|------|
| **Spectra（原 Ultimate Addons for Gutenberg）** | 30+ 高质量区块，性能较好，免费 |
| **Kadence Blocks** | 功能全面，含表单、弹窗、动画，免费+付费 |
| **GenerateBlocks** | 极简设计理念，性能优先，4个核心区块覆盖大多数需求 |
| **CoBlocks** | GoDaddy 出品，专注内容创作场景 |
| **Otter Blocks** | ThemeIsle 出品，含 AI 写作辅助 |
| **WooCommerce Blocks** | WooCommerce 官方出品，电商专用区块 |

### 6.2 区块插件的选择原则

- **性能敏感站点**：优先选择 GenerateBlocks 或 Spectra，避免加载未使用的区块 CSS
- **快速建站**：Kadence Blocks 功能最全，适合快速交付
- **电商站点**：优先启用 WooCommerce Blocks，获得原生购物体验

---

## 七、键盘快捷键

熟练使用快捷键可以大幅提升 Gutenberg 的编辑效率：

| 快捷键 | 功能 |
|--------|------|
| `/` | 在段落中快速搜索并插入区块 |
| `Ctrl/Cmd + Z` | 撤销操作 |
| `Ctrl/Cmd + Shift + Z` | 重做操作 |
| `Ctrl/Cmd + S` | 保存草稿 |
| `Ctrl/Cmd + Shift + D` | 复制当前区块 |
| `Ctrl/Cmd + Alt + T` | 在上方插入新区块 |
| `Ctrl/Cmd + Alt + Y` | 在下方插入新区块 |
| `Shift + Alt + Z` | 删除当前区块 |
| `Ctrl/Cmd + \`` | 切换代码编辑器模式 |
| `Ctrl/Cmd + Shift + Alt + M` | 切换全宽/全屏无干扰模式 |

---

## 八、Gutenberg 的优势与局限

### 优势

- **原生内置，无需额外插件**，减少依赖，安全性更高
- **持续官方维护**，跟随 WordPress 核心更新
- **输出代码语义化**，对 SEO 友好
- **页面性能优于页面构建器**，不引入冗余 CSS/JS
- **全站编辑潜力巨大**，是 WordPress 未来的核心方向
- **REST API 支持**，区块内容可通过 API 输出为结构化数据，适合 Headless WordPress

### 局限

- **复杂布局设计能力不及 Elementor**，像素级精确控制有限
- **第三方区块质量参差不齐**，需要筛选
- **FSE 学习成本较高**，对非技术用户不够友好
- **部分高级功能（动画、弹窗）仍需插件补充**

---

## 九、Gutenberg 与 Headless WordPress

Gutenberg 的区块结构天然适合 Headless 架构。通过 WordPress REST API 或 **WPGraphQL** 插件，可以将区块内容以 JSON 格式输出给前端框架（Next.js、Nuxt.js、Astro 等）消费。

**WPGraphQL for Gutenberg** 等插件可以将每个区块解析为独立的 GraphQL 节点，前端可以根据区块类型渲染对应的组件，实现真正的内容与表现分离。

---

## 十、总结

Gutenberg 已经从最初饱受争议的"破坏性更新"，成长为 WordPress 生态的核心基础设施。随着全站编辑的持续成熟，它正在重新定义"用 WordPress 建站"的方式——不再依赖臃肿的页面构建器，而是通过轻量、语义化的区块系统，兼顾编辑体验、页面性能与开发灵活性。

对于新建站点，强烈建议直接基于 Gutenberg 和区块主题构建，拥抱 WordPress 的未来方向。
