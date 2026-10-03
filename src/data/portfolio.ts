export interface SkillGroup {
  title: string;
  items: string[];
}

interface Resume {
  name: string;
  role: string;
  skills: SkillGroup[];
  experience: { title: string; period: string; paragraphs: string[] }[];
  education: { school: string; period: string; major: string; degree: string; website: string; logo: string };
  certificates: string[];
  email: string;
  phone: string;
}

// Display and print views share this structured resume data.
export const resume = {
  name: "蔡方闻",
  role: "Google SEO  /  独立站建设  /  AI 驱动增长",
  skills: [
    {
      title: "Google SEO",
      items: [
        "Semrush",
        "Ahrefs",
        "GSC",
        "GA4",
        "????",
        "????"
      ]
    },
    {
      title: "?????",
      items: [
        "WordPress",
        "RankMath",
        "WooCommerce",
        "ACF",
        "Shopify Theme",
        "Shopify App"
      ]
    },
    {
      title: "AI ?????????",
      items: [
        "Claude",
        "GPT",
        "Prompt Engineering",
        "MCP",
        "Make",
        "?????"
      ]
    },
    {
      title: "????",
      items: [
        "HTML",
        "CSS",
        "JavaScript",
        "Next.js",
        "React",
        "Tailwind CSS",
        "Git",
        "Astro",
        "DevOps"
      ]
    },
    {
      title: "????",
      items: [
        "SQL",
        "Python",
        "PowerBI",
        "Tableau",
        "Looker Studio",
        "?????"
      ]
    },
    {
      title: "??????",
      items: [
        "LinkedIn",
        "TikTok",
        "Facebook",
        "X",
        "Discord",
        "Reddit"
      ]
    },
    {
      title: "?????????",
      items: [
        "Google Ads",
        "??AD",
        "???",
        "???",
        "??",
        "PS",
        "AI??"
      ]
    }
  ],
  experience: [
    {
      title: "某垂直领域前三外贸公司AI驱动增长",
      period: "2026.4-至今",
      paragraphs: [
        "基于 Shopify Online Store 2.0 (OS 2.0) 架构，主导主题从零模块化定制重构，开发 20+ 个可复用的 Liquid Sections 与 Blocks，提升运营团队页面搭建效率 60% 以上。",
        "对关键页面（PDP/PLP/Homepage）执行性能攻坚，移除 8 款冗余第三方 App，采用原生 JavaScript 替代重型脚本依赖；实现图片 WebP 自动转换、自适应 srcset 与按需懒加载（Lazyload）。",
        "引入预加载（Preload/Prefetch）机制与关键 CSS 提取，将全站 LCP（最大内容渲染时间）从 4.2s 压缩至 1.6s，Google PageSpeed Mobile 评分从 38 提升至 85+。",
        "结合 Shopify Markets 与 Currency API 完成多币种、多语言动态切换，优化 Mini-Cart 异步交互与加购流程，降低结账前流失率。"
      ]
    },
    {
      title: "某垂直领域前三外贸公司Google SEO 优化",
      period: "2023.1-2026.4",
      paragraphs: [
        "技术SEO ：定期通过 Screaming Frog 审计全站，优化 Crawl Budget 并修复技术缺陷。部署 JSON-LD 结构化数据以获取富媒体搜索展示，并协同开发完成 HTML/CSS 级的性能调整。监控 Core Web Vitals 指标，实施 WebP 转换与 CDN 策略优化 LCP 表现。持续改进移动端交互与无障碍设计，确保站点在 Google 移动优先索引中保持竞争优势。",
        "内容策略：运用 Semrush 搭建关键词矩阵，配合 RankMath 优化 TDK 与内链布局。执行 Topic Cluster 策略，结合 E-E-A-T 标准与 Surfer SEO 工具，系统性提升站点的垂直领域权重。",
        "数据分析：利用 GA4 探索分析与受众细分追踪 SEO 转化，通过归因模型评估流量质量。结合 GSC 挖掘潜词并开展 Gap 分析，借助 Looker Studio 自动化报表量化业务收益。",
        "独立站全链路架构开发：主导基于WordPress与WooCommerce的从零建设，利用Elementor完成高转化视觉设计。精细化设计SKU逻辑与产品字段，确保管理高效且体验流畅，实现站点0-1的稳健交付。"
      ]
    }
  ],
  education: {
    school: "??????",
    period: "2019.9-2023.6",
    major: "???",
    degree: "??",
    website: "https://www.zjgsu.edu.cn/",
    logo: "/images/portfolio/zjgsu-logo.png"
  },
  certificates: [
    "????",
    "?????"
  ],
  email: "frida_cai@qq.com",
  phone: "15706770218"
} satisfies Resume;
