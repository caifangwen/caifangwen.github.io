# 项目审查、文件清理与代码组织说明

审查日期：2026-10-03。对象：当前本地工作区，审查开始时 Git 工作区干净。

## 1. 结论

这是一个 **Astro + TypeScript + Tailwind CSS 4 的中文静态内容站点**，由 Hugo 迁移而来。构建时读取 Markdown 并生成页面，浏览器负责搜索、菜单、主题、目录和代码复制，没有运行时数据库或服务端业务接口。

项目已经具备可复用组件、严格类型检查、内容回归测试、桌面与移动端浏览器测试，以及部署前的 CI 检查。主要质量债务集中在 Markdown 兼容转换、内容校验、样式覆盖和静态资源管理。现阶段适合逐步完善这些边界，无需为了整理目录重写框架。

本次实际执行了文件清理与文档纠正。下文列出的功能问题是审查发现，尚未进行业务行为重构。

## 2. 代码如何组织

```text
项目根目录
├── src/
│   ├── pages/                 页面与构建时生成的静态数据端点
│   ├── layouts/Base.astro    全站 HTML、SEO、导航、主题和搜索容器
│   ├── components/           内容卡片、列表、分页、导航等共享组件
│   │   └── portfolio/        简历页面专用展示组件
│   ├── lib/                  内容读取、Markdown 渲染、URL 与业务筛选
│   ├── data/                 业务导航、学习路径、简历、工具链接、历史 URL
│   ├── scripts/site.ts       浏览器公共交互
│   ├── styles/               Tailwind 入口、主题、基础与页面样式
│   └── assets/icons/         通过构建导入的 SVG 图标
├── content/                  Markdown 原稿和文章附件
├── public/                   原样复制的图片、简历和独立报告
├── tests/                    内容和业务规则测试
│   └── browser/              Playwright 桌面与移动端测试
├── scripts/                  Python 内容维护和图片缓存工具
├── docs/                     维护文档与本报告
├── .github/workflows/        检查、CodeQL 审查和 GitHub Pages 部署
├── astro.config.mjs          静态输出、站点 URL、部署路径、内容热更新
├── playwright.config.ts     预览服务和浏览器测试配置
├── package.json             依赖与 npm 命令
├── package-lock.json        可复现安装的依赖锁定文件
├── tsconfig.json            Astro 严格类型检查范围
├── vercel.json              Vercel 的备用构建配置
├── start_blog.bat/build.bat  Windows 启动与构建入口
└── dist/                    可重新生成的部署产物，Git 忽略
```

### 2.1 内容到页面的流程

1. `src/lib/content.ts` 递归读取 `content/`，用 `gray-matter` 解析 frontmatter。同名中文 `.zh-cn.md` 优先，跳过 `_index*` 和 `draft: true`。
2. `strategy/acquire/convert/retain/global` 五个业务目录统一映射成 `posts`；其他内容对应 `projects/shares/discussions/docs`。
3. 加载器生成 `Entry` 对象，整理日期、分类、标签、封面、阅读时间与 URL。地址依次采用显式 `url`、符合条件的历史 URL 映射、自动生成的地址；重复内容 URL 会中止构建。
4. `src/lib/markdown.ts` 使用 MarkdownIt、KaTeX、highlight.js，生成正文 HTML 与标题目录，并兼容部分 Hugo 短代码和相对附件地址。
5. `src/pages/[...route].astro` 生成文章详情、常规栏目分页、分类／标签／系列页，组合 `Base`、列表、卡片和分页组件。
6. `Base.astro` 引入 `global.css` 和公共交互脚本；Astro 构建输出到 `dist/`。

审查时实际加载 **251 条已发布内容**，清理后构建报告 **967 个页面**；两者不同是因为分类、标签、分页及业务主题会额外生成页面。

### 2.2 路由的职责

| 文件或路由 | 职责 |
| --- | --- |
| `index.astro` | 作者信息、精选项目、最近文章、分享和讨论 |
| `[...route].astro` | `/blog/*`、`/project/*` 等详情；`/articles/` 等分页列表；分类、标签、系列 |
| `[business]/[...topic].astro` | 五个业务栏目与主题聚合，以分类、标签筛选内容 |
| `learn/[...path].astro` | 学习路径首页与各条分阶段阅读路径 |
| `shares.astro` | 分享资源的完整列表与浏览器分类筛选 |
| `portfolio.astro` | 简历、技能、经历、项目亮点与打印入口 |
| `archives.astro` | 按月份归档的文章时间线 |
| `reports.astro` | 扫描 `public/reports` 的 HTML 报告并生成入口 |
| `media/[...asset].ts` | 将允许类型的内容附件输出为静态资源 |
| `index.json.ts` | 搜索数据，搜索时才由浏览器下载 |
| `index.xml.ts` | 文章 RSS |
| `sitemap.xml.ts`、`robots.txt.ts` | 站点地图与爬虫入口 |
| `about/contact/404.astro` | 固定页面 |

这些 `.ts` 端点在静态构建时生成文件，不表示部署后存在常驻 API 服务。

### 2.3 日常改动应放在哪里

| 需求 | 修改位置 |
| --- | --- |
| 新文章 | `content/` 下对应业务目录，填写标题、日期、分类、标签与稳定 slug |
| 新项目 | `content/projects/`；首页精选还需要 `featured: true` |
| 业务分类或学习路径 | `src/data/business-navigation.ts` |
| 简历资料 | `src/data/portfolio.ts`，同时检查下载用 DOCX 是否需要同步 |
| 工具链接与图标 | `src/data/tool-links.ts`、`site-icons.json`、`public/images/portfolio/` |
| 全站作者与基本信息 | `src/lib/site.ts` |
| 内容读取规则 | `src/lib/content.ts` |
| Markdown 展示规则 | `src/lib/markdown.ts` |
| 页面结构 | `src/pages/`，共享片段放 `components/` |
| 主题颜色 | `src/styles/themes.css` |
| 浏览器交互 | `src/scripts/site.ts`，页面专属交互也可放对应 Astro 页面 |
| 部署域名和路径 | `SITE_URL`、`BASE_PATH`；CI 同步修改 workflow 的环境变量 |

## 3. 已执行的清理

共删除 **22 个文件，341,414 字节，约 333 KiB**。其中 19 个是版本控制文件，3 个是本地忽略的日志。删除前核查源码、报告与文章引用，并扫描全部 251 条已发布正文的渲染结果：没有实际 `href/src` 指向旧 `/css/`、`/js/`、`/fonts/` 资源。

| 删除范围 | 数量 | 原因 |
| --- | ---: | --- |
| `public/css/custom.css`、`fjGallery.css`、`glightbox.min.css` | 3 | 当前样式由 `src/styles/global.css` 导入，无运行时引用 |
| `public/js/macy.js`、`gumshoe.polyfills.min.js`、`glightbox.min.js`、`fjGallery.min.js` | 4 | 旧主题第三方脚本，当前交互未加载它们 |
| `public/fonts/lg.svg`、`lg.ttf`、`lg.woff`、`lg.woff2` | 4 | 属于旧库的字体，当前站点没有引用 |
| `content/未命名.canvas`、`content/未命名.base` | 2 | 空画布和仅含默认视图的空表格，不参加内容构建 |
| `mcp_output/files/` 的两个 YAML 与部署指南 | 3 | 旧 Hugo 参数、菜单与部署说明，不用于 Astro |
| `mcp_output/files2/` 的部署 BAT、映射表、移动端指南 | 3 | 旧迁移输出，与当前构建链无关联 |
| `build-check.log`、`build-validation.log`、`type-check.log` | 3 | 本地验证日志，可重建且已被 Git 忽略 |

同步纠正了 README：实际默认域名、根路径部署、触发分支与部署限制、Playwright 自动启动预览服务的方式。内容修复工具的示例也改为现有的 `content/acquire` 目录。

### 保留的文件及原因

- 历史 Markdown、Hugo 教程、`_index` 与中英文同名原稿：其中一些不直接渲染，但属于写作原稿或迁移兼容资料，不能按“未 import”删除。
- `legacy-urls.json`、Hugo 短代码兼容逻辑：参与当前构建，保护历史链接。
- `public/reports`、简历及其不同导出版本：独立交付物可能存在外部链接。发现 W15 两份 DOCX 哈希相同、两份 W14 Markdown 哈希相同；保留公开地址，后续可通过明确的归档／重定向方案去重。
- `.obsidian/`：作者编辑器配置；虽然被忽略，其中四个 JSON 仍在 Git 跟踪。未修改作者工作环境，建议后续单独取消跟踪。
- `mcp_output` 中的截图：未列入旧配置清理范围，保留作为已有视觉记录。
- `node_modules/`、`.astro/`、`dist/`：依赖、构建缓存与最新验证产物，保留以便继续开发和预览。
- Python 工具、Windows BAT 和 `vercel.json`：仍有独立维护／启动／部署用途。

## 4. 代码质量：已有优点

- 内容、展示数据、组件和页面已有清晰分层；业务导航集中在数据文件中。
- 使用 Astro 严格 TypeScript 配置，当前类型检查无错误、警告或提示。
- 内容重复 URL 会明确报错；中文覆盖、草稿过滤、固定日期等迁移规则已有测试。
- 动态搜索结果使用 DOM 节点和 `textContent`；代码文本进行 HTML 转义，JSON-LD 转义 `<`，Mermaid 使用严格模式。
- 搜索数据与 Mermaid 按需加载；搜索请求失败可重试，异步搜索通过版本号避免旧结果覆盖新输入。
- 已有键盘入口、焦点样式、无障碍标签、移动端适配和减少动画偏好的处理。
- CI 包含类型检查、内容测试、构建、浏览器测试、CodeQL；部署需要检查通过。

## 5. 代码质量：发现与优先级

P1 表示建议优先解决的内容正确性问题；P2 表示性能、维护或防错改进；P3 表示日常整理。不将以下问题描述为已修复。

### P1：短代码处理会改写代码示例

位置：`src/lib/markdown.ts` 的 `shortcodes()` 与 `md.render(shortcodes(entry.body))`。

转换发生在 Markdown 解析之前，直接对整个正文做正则替换，没有区分正文与代码围栏。实际复现：在 `text` 代码块内放置 `{{< linkcard ... >}}`，输出变成转义的 `<a class="link-card" ...>`，原始教程示例被改变。现有测试检查普通短代码能渲染，但没有验证代码块内短代码保持原样。

建议将兼容转换移到 Markdown token／插件层，仅处理允许的正文区域，保留 fenced code 与 inline code；补充围栏、行内代码和嵌套示例的回归测试。

### P1：存在 6 处生成后失效的站内链接

扫描已发布正文的根路径 `href/src`，剔除 query/hash 并解码后，对照 `dist/` 文件和 `index.html`；发现以下目标不存在：

| 来源 | 缺失目标 |
| --- | --- |
| `global/foreign-trade-salesperson-training.md` | `/posts/foreign-trade-inquiry-to-deal/` |
| `convert/order-attribution-vs-assistant.md` | `/posts/solo-site-partnership` |
| `acquire/google-sem-skill-collection.md` | `/posts/how-to-build-skill-system` |
| `acquire/narrow/hugo-template-primer.md` | `/layout/variables`、`/layout/functions`、`/content/front-matter` |

前三项仍指向旧 `/posts/` 路径，应按当前 `Entry.url` 修正；后三项需确认是 Hugo 文档引用还是历史本地页面，再改成相应正式文档地址。不要只机械替换路径前缀，历史文章可能使用中文 URL。

建议把生成后的站内链接检查纳入 CI。此次检查限定正文中的双引号／单引号根路径引用，不覆盖全站所有页面、远程地址、CSS URL 和外部站点可用性。

### P2：搜索索引偏大，每次输入都扫描全文

位置：`src/pages/index.json.ts`、`src/scripts/site.ts`。

当前索引 **2,956,506 字节，约 2.82 MiB，未压缩**，包含各条内容近乎完整的正文。每次 `input` 都对全文拼接、转小写并筛选，没有防抖；多关键词会重复这段字符串工作。移动端首次搜索的下载和主线程负担值得关注，但本次没有测量实际网络传输大小或交互耗时。

建议先预计算可搜索的小写文本并增加短防抖，再根据真实数据决定是否需要压缩正文、专用索引或 Web Worker。

### P2：Mermaid 依赖分块较大

构建有超过 500 kB 的分块提示；当前 `_astro` 中最大的 JS 文件约 **1.39 MiB**，另有约 **647 KiB** 的块。公共脚本通过动态 import 加载 Mermaid，并非每个首页访问都会下载这些文件；具体图表触发的请求链与传输压缩尚未测量。

建议测量实际使用的图表类型与资源请求，再考虑精简图表能力或构建时渲染。不能只调大警告阈值当作性能优化。

### P2：frontmatter 与路由校验覆盖不完整

位置：`src/lib/content.ts`、`src/pages/[...route].astro`、`src/lib/business.ts`。

当前标题等字段通过 `String()` 宽松转换，日期无效时静默回退，分类与标签没有先 trim 再去重；`url` 只要求以 `/` 开头。重复检查仅覆盖内容条目之间，没有把固定页面、分类、业务路由一起纳入。`getTopic()` 与部分页面数据查找使用非空断言，配置错误时缺少有上下文的说明。

建议增加明确的 frontmatter schema、统一规范化 URL、完整路由冲突校验与包含源文件名的诊断。标签 trim 去重应同时检查已有内容受影响的分类路径。

### P2：多份样式存在覆盖，维护成本偏高

位置：`src/styles/global.css`、`base.css`、`components.css`、`custom.css`、`mobile-optimizations.css`。

当前导入既有迁移样式又有入口文件内新增规则，存在重复选择器；扫描到 **112 行含 `!important`**。同一个组件的展示可能受多处文件和媒体查询控制，调整时需要了解整个层叠顺序。`global.css` 还承担大量具体导航、目录和归档样式。

建议按主题 token、基础排版、组件、页面拆清责任，逐组件合并覆盖规则。不要直接删除所有 `!important`，应保留减少动画等合理场景，并以现有桌面／移动测试验证外观。

### P2：公共脚本和万能页面职责偏多

`src/scripts/site.ts` 同时处理主题、菜单、搜索、代码按钮、目录、浮动工具栏、阅读进度和 Mermaid；`[...route].astro` 同时生成路由、决定列表行为并渲染长篇文章模板。大量代码压在单行，定位变化和审阅 diff 较困难。

建议渐进拆分 `initSearch/initTheme/initNavigation/initArticle` 与 `ArticleContent/ArticleMeta/ArticleNavigation` 等边界。仍保留一个入口统一初始化，无需为了拆文件引入 UI 框架。

### P2：独立 HTML 报告带有本机字体路径

`public/reports/dibibi-greenhouses-analysis-v2.html` 从约第 1118 行开始包含 `file:///C:/Program%20Files/MarkText/...` 的 KaTeX 字体 URL。报告被原样发布后，其他机器不能通过这些地址加载字体；影响取决于报告是否实际使用对应字形。本次没有逐份检查报告的视觉效果。

建议重新导出为可移植 HTML，或将依赖资源改成站点内可发布地址；同时建立报告入口、标题和资源检查。

### P2：原始 HTML 的信任边界需要明确

MarkdownIt 启用 `html: true`，文章正文通过 `set:html` 输出。这适合作者自行维护的可信内容，但代码块转义测试不代表原始 HTML 被净化。若以后接入外部投稿或自动采集，内容可包含可执行 HTML。

建议在写作流程中明确只接受可信正文；来源改变时再添加允许列表净化与相应测试。本次没有证据表明当前内容遭到利用。

### P3：资源与索引管理仍可完善

- `.gitignore` 无法停止跟踪已经提交的 `.obsidian` 配置；后续可保留本地文件并取消跟踪。
- `shares.astro` 首页展示所有分享，但通用路由仍从第 2 页起生成分享分页，形成两种浏览模型。可明确采用筛选全列表，还是稳定分页。
- `sitemap.xml.ts` 与页面生成器分别计算分页和路由；当前可工作，但规则容易随改动漂移，建议共享路由生成逻辑。
- `reports.astro` 从文件路径生成显示标题，缺少统一报告元数据与排序。
- `fix_markdown_code_blocks.py` 以同数量围栏找结束，内部若出现同长度独立围栏可能提前结束；不要当作完整 Markdown 解析器使用。
- `fetch_portfolio_assets.py` 依赖正则提取 TypeScript 字符串链接，下载后直接写缓存和 JSON；批次部分失败可能留下新图片而未更新映射。建议增加临时文件、确定性排序与完整成功后的映射替换。
- 暂无独立格式化／lint 命令；类型检查与 CodeQL 不能代替格式一致性和所有可维护性检查。

## 6. 推荐处理顺序

1. 先修复代码块内短代码转换与 6 个站内链接，并加入对应回归检查。
2. 再补 frontmatter 和路由完整校验，减少发布时的隐性错误。
3. 随后优化搜索数据与输入处理，并测量真实 Mermaid 加载成本。
4. 最后逐组件收拢样式、拆公共交互和文章模板，整理报告与编辑器配置。

## 7. 验证记录与范围

| 检查 | 结果 |
| --- | --- |
| `npm run check` | 52 个文件；0 errors、0 warnings、0 hints |
| `npm test` | 8 项通过；覆盖内容规则、全部正文渲染、业务归类、任务列表、公式与锚点等 |
| 清理后 `npm run build` | 成功，967 个页面；仍有大分块提示 |
| `npm run test:browser` | 构建完成后重跑，18 项全部通过；覆盖导航、搜索、主题、目录、简历、分享及移动端 |
| 旧资源引用检查 | 251 条已发布正文无旧 `/css/`、`/js/`、`/fonts/` 引用，源码与独立报告未发现这些资源的实际加载 |
| 站内正文链接检查 | 发现 6 处缺失，详见问题列表 |
| 短代码代码围栏复现 | 确认教程代码会被转换 |

初次浏览器测试为 17 项通过、1 项失败；失败时页面为 `/portfolio/` 的 404，发生在重新构建 `dist/` 的时间段。为避免预览读取到尚未生成的文件，完成构建后重新运行整套测试，最终 18 项全部通过。维护时应先完成构建，再运行浏览器测试。

本报告依据本地源码、构建产物和测试。未运行远程 CI／CodeQL、未进行线上部署、未做联网依赖漏洞审计、未验证全部外部链接；也不把静态检查通过解释为全部功能和性能问题已经消除。
