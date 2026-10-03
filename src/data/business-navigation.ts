export interface BusinessTopic {
  path: string;
  title: string;
  description: string;
  term: string;
  children: BusinessTopic[];
}
const topic = (path: string, title: string, description: string, term: string, children: BusinessTopic[] = []): BusinessTopic => ({ path, title, description, term, children });
export const businessNavigation = [
  {
    ...topic('/strategy/', '战略', '从市场定位、增长目标到预算与测量，规划完整业务漏斗。', '战略', [
      topic('/strategy/planning/', '战略与规划', '市场定位、目标拆解、预算与渠道规划。', '战略与规划'),
      topic('/strategy/measurement/', '目标与测量', '以业务指标、归因与增量评估连接计划和结果。', '目标与测量'),
    ]), icon: 'chart', mega: false,
  },
  {
    ...topic('/acquire/', '获客', '连接自然搜索、AI 搜索、数字公关、广告与社媒的引流矩阵。', '获客', [
      topic('/acquire/organic/', '自然搜索', '搜索基础、关键词、技术、内容与视觉搜索。', '自然搜索', [
        topic('/acquire/technical/', '技术 SEO', '抓取、索引、结构化数据与站点性能。', '技术 SEO'),
        topic('/acquire/content/', '内容 SEO', '内容结构、主题集群与搜索意图。', '内容 SEO'),
        topic('/acquire/on-page/', '页面 SEO', '标题、内链、页面结构与元信息。', '页面 SEO'),
        topic('/acquire/keywords/', '关键词研究', '关键词矩阵、竞争分析与机会发现。', '关键词研究'),
        topic('/acquire/search-fundamentals/', '搜索基础与诊断', '搜索机制、GSC 排查与流量诊断。', '搜索基础与诊断'),
        topic('/acquire/video-visual/', '视频与视觉搜索', 'YouTube、短视频与图片搜索。', '视频与视觉搜索'),
      ]),
      topic('/acquire/local/', '本地搜索', '本地商家、地图入口与区域搜索。', '本地搜索'),
      topic('/acquire/ai-search/', 'AI 搜索与 GEO', '引用机制、GEO 策略与多引擎实践。', 'AI 搜索与 GEO', [
        topic('/acquire/citations/', '引用机制', 'AI 搜索中的引用、可见度与品牌提及。', '引用机制'),
        topic('/acquire/strategy/', 'GEO 策略与转型', '组织内容与站点能力，适应 AI 搜索。', 'GEO 策略与转型'),
        topic('/acquire/engines/', '多引擎实战', '不同 AI 搜索引擎的内容发现与呈现。', '多引擎实战'),
      ]),
      topic('/acquire/digital-pr/', '链接与数字公关', '从外链建设到媒体资源、品牌声誉与权威。', '链接与数字公关', [
        topic('/acquire/links/', '外链与权威', '外链质量、站点权威与链接建设。', '外链与权威'),
        topic('/acquire/media/', '媒体资源与 PR', '媒体资源、HARO 与数字公关。', '媒体资源与 PR'),
        topic('/acquire/reputation/', '声誉管理与维基', '品牌声誉、实体信息与维基内容。', '声誉管理与维基'),
      ]),
      topic('/acquire/paid/', '付费广告与联盟', '广告投放、联盟营销与创作者合作。', '付费广告与联盟', [
        topic('/acquire/ads/', '搜索、购物与社媒广告', '搜索广告、购物广告与社媒广告。', '搜索、购物与社媒广告'),
        topic('/acquire/affiliate/', '联盟营销体系', '联盟合作、佣金与伙伴运营。', '联盟营销体系'),
        topic('/acquire/influencer/', '网红与创作者合作', '创作者合作与内容推广。', '网红与创作者合作'),
      ]),
      topic('/acquire/social-email/', '社媒、邮件与私域', '社媒生态、邮件自动化与 B2B 线索培育。', '社媒、邮件与私域', [
        topic('/acquire/social/', '社媒运营与平台生态', '社媒运营与各平台内容分发。', '社媒运营与平台生态'),
        topic('/acquire/email/', '邮件自动化', '邮件运营与自动化触达。', '邮件自动化'),
        topic('/acquire/nurturing/', 'B2B 线索培育', '线索分层、培育与销售衔接。', 'B2B 线索培育'),
      ]),
    ]), icon: 'search', mega: true,
  },
  {
    ...topic('/convert/', '转化', '从 B2C 零售、B2B 询盘到平台与独立站协同，承接流量并推动行动。', '转化', [
      topic('/convert/b2c/', 'B2C 零售转化', '建站、购物车、结账与转化实验。', 'B2C 零售转化', [
        topic('/convert/cms/', 'CMS 与主题', '建站架构、CMS 与主题定制。', 'CMS 与主题'),
        topic('/convert/cro/', 'CRO 与实验', '转化策略、漏斗分析与 A/B 测试。', 'CRO 与实验'),
        topic('/convert/checkout/', '购物车与结账', '加购、结账摩擦与表单优化。', '购物车与结账'),
      ]),
      topic('/convert/b2b/', 'B2B 线索转化', 'B2B 建站、门控内容与询盘表单。', 'B2B 线索转化', [
        topic('/convert/architecture/', 'B2B 建站架构', '围绕业务线索组织企业站点。', 'B2B 建站架构'),
        topic('/convert/gated-content/', '门控内容与白皮书', '内容资产与线索收集。', '门控内容与白皮书'),
        topic('/convert/inquiry/', '询盘与表单设计', '线索收集、表单体验与质量评估。', '询盘与表单设计'),
      ]),
      topic('/convert/synergy/', '平台与独立站协同', '亚马逊与 DTC 的流量、库存和品牌协同。', '平台与独立站协同', [
        topic('/convert/traffic-routing/', '亚马逊与独立站导流', '平台与品牌站的流量衔接。', '亚马逊与独立站导流'),
        topic('/convert/inventory/', '多渠道库存同步', '多渠道商品与库存协同。', '多渠道库存同步'),
        topic('/convert/brand/', '品牌备案与协同', '品牌资料与多渠道运营。', '品牌备案与协同'),
      ]),
      topic('/convert/platforms/', '平台运营', 'Shopify、WooCommerce、Magento 与平台 SEO。', '平台运营', [
        topic('/convert/shopify/', 'Shopify', 'Shopify 建站与运营。', 'Shopify'),
        topic('/convert/woocommerce/', 'WooCommerce', 'WooCommerce 商店开发与运营。', 'WooCommerce'),
        topic('/convert/magento/', 'Magento', 'Magento 平台实践。', 'Magento'),
        topic('/convert/seo/', '平台 SEO', '电商平台的搜索与内容优化。', '平台 SEO'),
      ]),
    ]), icon: 'projects', mega: true,
  },
  {
    ...topic('/retain/', '留存', '通过生命周期运营与客户成功，支持复购和长期客户关系。', '留存', [
      topic('/retain/lifecycle/', '生命周期运营', '从首次触达到复购的生命周期管理。', '生命周期运营', [
        topic('/retain/loyalty/', '忠诚与复购', '会员、忠诚与复购运营。', '忠诚与复购'),
        topic('/retain/email-sequence/', '邮件序列', '按生命周期组织自动化触达。', '邮件序列'),
      ]),
      topic('/retain/customer-success/', '客户成功', '客户支持、使用体验与长期价值。', '客户成功'),
    ]), icon: 'heart', mega: false,
  },
  {
    ...topic('/global/', '出海', '把本地化、合规、交付和数据技术基建连接起来。', '出海', [
      topic('/global/localization/', '语言与本地化市场', '小语种、国际 SEO 与区域搜索引擎。', '语言与本地化市场', [
        topic('/global/minor-lang/', '小语种与国际 SEO', '语言市场、内容本地化与国际搜索。', '小语种与国际 SEO'),
        topic('/global/multi-engine/', '多引擎与区域', 'Naver、Yandex 等区域引擎。', '多引擎与区域'),
      ]),
      topic('/global/compliance/', '跨境合规', '产品环保、隐私数据、税务与广告主体合规。', '跨境合规', [
        topic('/global/product/', '产品与环保', '产品合规、EPR 与环保要求。', '产品与环保'),
        topic('/global/privacy/', '隐私与数据', '隐私、数据与访问同意。', '隐私与数据'),
        topic('/global/tax/', '税务与关税', '跨境税务与关税内容。', '税务与关税'),
        topic('/global/advertising/', '广告与主体合规', '广告及经营主体合规。', '广告与主体合规'),
      ]),
      topic('/global/fulfillment/', '交付与履约', '跨境物流、仓配与配送退换货。', '交付与履约', [
        topic('/global/logistics/', '跨境物流与仓配', '跨境物流、仓储与配送。', '跨境物流与仓配'),
        topic('/global/returns/', '配送与退换货政策', '交付体验与售后政策。', '配送与退换货政策'),
        topic('/global/payments/', '跨境支付', '支付能力与交易承接。', '跨境支付'),
      ]),
      topic('/global/infra/', '数据与技术基建', '数据测量、分析平台、服务器与前端性能。', '数据与技术基建', [
        topic('/global/data-metrics/', '归因与数据测量', '归因、增量、MMM 与分析平台。', '归因与数据测量'),
        topic('/global/server/', '服务器与部署', '服务器、容器与服务部署。', '服务器与部署'),
        topic('/global/log/', '日志与 Server Log', '服务日志与访问分析。', '日志与 Server Log'),
        topic('/global/performance/', '前端与性能', '前端实现与站点性能。', '前端与性能'),
        topic('/global/tools/', '工具与自动化', '分析工具与业务自动化工作流。', '工具与自动化'),
      ]),
    ]), icon: 'globe', mega: true,
  },
];
export const contentNavigation = [
  { path: '/articles/', title: '文章' }, { path: '/shares/', title: '分享' },
  { path: '/discussions/', title: '讨论' }, { path: '/categories/', title: '分类' },
  { path: '/projects/', title: '项目' }, { path: '/archives/', title: '归档' },
  { path: '/learn/', title: '学习路径' },
];
export const problemNavigation = [
  { title: '网站流量突然下跌，怎么排查？', path: '/acquire/search-fundamentals/' },
  { title: '亚马逊与独立站，怎么协同获客？', path: '/convert/synergy/' },
  { title: 'B2B 询盘，怎么拿到高质量线索？', path: '/convert/b2b/' },
  { title: '品牌在 AI 搜索里搜不到？', path: '/acquire/citations/' },
  { title: '联盟与网红合作，佣金怎么设计？', path: '/acquire/affiliate/' },
  { title: '出海欧盟，环保与税务怎么合规？', path: '/global/compliance/' },
  { title: '加购很多，为什么结账都流失了？', path: '/convert/checkout/' },
  { title: '小语种市场，怎么本土化获客？', path: '/global/minor-lang/' },
];
export const businessAliases: Record<string, string> = {};
export const learningPaths = [
  { slug: 'seo-foundations', title: '出海 SEO 从零到一指南', audience: '站长 / 营销新手', steps: ['/strategy/planning/', '/acquire/search-fundamentals/', '/acquire/keywords/', '/acquire/technical/', '/acquire/content/', '/global/data-metrics/'] },
  { slug: 'geo-search', title: 'AI 搜索与 GEO 流量实战', audience: '前沿营销人', steps: ['/acquire/citations/', '/acquire/strategy/', '/acquire/engines/'] },
  { slug: 'b2b-leads', title: 'B2B 企业全链路线索挖掘手册', audience: 'B2B 外贸 / SaaS 出海', steps: ['/convert/architecture/', '/convert/gated-content/', '/convert/inquiry/', '/acquire/nurturing/'] },
  { slug: 'amazon-dtc', title: '从 Amazon 到 DTC 独立站', audience: '亚马逊转型卖家', steps: ['/convert/traffic-routing/', '/convert/cms/', '/convert/inventory/', '/convert/brand/', '/convert/checkout/'] },
  { slug: 'digital-pr', title: '数字公关与高权重外链建设 SOP', audience: '海外 PR / SEO 专员', steps: ['/acquire/links/', '/acquire/media/', '/acquire/reputation/'] },
  { slug: 'compliance', title: '跨境电商合规避险指南', audience: '法务 / 运营负责人', steps: ['/global/product/', '/global/privacy/', '/global/tax/', '/global/advertising/'] },
];
