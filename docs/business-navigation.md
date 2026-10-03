# 业务导航维护

content 下的五个一级业务目录为 strategy（战略）、acquire（获客）、convert（转化）、retain（留存）、global（出海）。原 posts 目录已移除，原文章链接通过 frontmatter 的 url 保留，所有文章索引为 /articles/。

src/data/business-navigation.ts 配置导航路径与层级，每个主题的 term 对应分类或标签名称。src/lib/business.ts 精确匹配 categories/tags（忽略大小写和两端空格），父主题包含子主题的分类和标签。标题、描述和正文不参与筛选。

新增文章放入对应一级目录，categories 填写业务名称，tags 填写细分主题的 term。例如 categories: [获客]、tags: [技术 SEO]。保留原分类和标签，可以添加多个业务分类或主题标签。加载器也支持 cat、tag 字段。缺少分类或标签时在文章元数据中补充。

历史文章已补充业务分类和相关主题标签；没有匹配现有业务主题的文章收纳于 global。目录用于文件组织，筛选以元数据为准。空主题显示待补充提示。学习路径引用已有主题。