# FDE 数据工程实战：把客户的脏数据变成能用的资产

> 本文是「FDE 技能栈全景图」系列中「核心工程能力」支柱下的深度专题，聚焦数据工程这一个主题。
> 父级概览见：[FDE 技能栈之一：核心工程能力](./2026-09-14-fde-core-engineering.md)；系列总览见：[FDE 技能栈全景图](./2026-09-14-fde-skill-stack-pillar.md)。

## 开篇：一个典型得不能再典型的现场

驻场第二周，客户的数据仓库负责人把你拉到一边：「我们有 ERP、CRM、还有一个 Excel 台账在财务手里。三个地方的客户名单对不上，老板下周要看『每个大客户的真实应收账款』。你先搞搞看？」

你拿到的东西是：两个数据库的只读账号、一个共享盘上的 Excel 文件夹（里面有 47 个版本、命名是「最终版」「最终版2」「最终版-改」）、以及一句「数据质量应该还行」。

没有数据字典，没有接口文档，ER 图更是不存在。这就是 FDE 数据工程的真实起点——不是从设计一个优雅的数仓开始，而是从一堆脏数据里抢救出能回答业务问题的答案开始。

父级文章讲了数据工程的能力版图（SQL、管道、建模、大数据生态）。本文往下钻一层：**按你在现场实际动手的顺序**，把每一步怎么做、用什么命令、踩什么坑讲清楚。全文按六个环节展开：接数探查 → 清洗 → 管道落地 → 跨系统实体对齐 → 建模 → 现场约束下的性能与安全。

---

## 一、接数后的第一步：系统化的数据探查 SOP

父级文章给了「探查三板斧」（行数、分布、主键唯一性）。这里把它扩展成一个完整可复用的探查流程。目标是：**半天之内，你能向客户说清楚这份数据「脏在哪、能不能用、用它回答问题有什么风险」**。

### 1.1 先问元数据，再问数据

连上一个陌生库，第一件事不是 SELECT 业务表，而是查系统目录，把「这个库里到底有什么」搞清楚：

```sql
-- PostgreSQL：所有表及行数估计、表注释
SELECT schemaname, relname, n_live_tup AS est_rows,
       obj_description(relid) AS comment
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Oracle 对应版本
SELECT table_name, num_rows, comments
FROM all_tab_comments JOIN all_tables USING (table_name)
WHERE owner = 'ERP_PROD'
ORDER BY num_rows DESC NULLS LAST;
```

同时查列级元数据（`information_schema.columns`），导出成一张 Excel。这张「表-字段-类型-注释」清单，就是你和客户业务方开第一次对齐会的材料——**指着具体字段名问业务含义，比抽象地问「你们数据怎么用」有效十倍**。

### 1.2 列级 profiling：量化「脏的程度」

对核心表，逐列跑一个 profile：空值率、唯一值数、最常见值 Top 10。表少就手写 SQL，表多就写个 Python 脚本批量跑：

```python
import pandas as pd
from sqlalchemy import create_engine

eng = create_engine("postgresql+psycopg2://readonly:***@host:5432/erp")

def profile_table(table: str, limit: int = 100_000) -> pd.DataFrame:
    df = pd.read_sql(f"SELECT * FROM {table} LIMIT {limit}", eng)
    rows = []
    for col in df.columns:
        s = df[col]
        rows.append({
            "table": table,
            "column": col,
            "dtype": str(s.dtype),
            "null_pct": round(s.isna().mean() * 100, 2),
            "n_unique": s.nunique(),
            "top_values": ", ".join(
                f"{v}({c})" for v, c in s.value_counts().head(3).items()
            ),
        })
    return pd.DataFrame(rows)

report = pd.concat([profile_table(t) for t in ["customers", "orders", "invoices"]])
report.to_excel("profiling_report.xlsx", index=False)
```

这份报告几乎每次都能直接发现问题，而且是你跟客户沟通的证据——「`order_date` 有 12% 为空」比「数据好像有点问题」有说服力得多。

### 1.3 现场高频出现的脏数据模式（按出现频率排序）

- **主键重复**：同步任务重跑、没有唯一约束。用父级文章的 `ROW_NUMBER()` 模式去重前先搞清楚：重复是「完全重复」还是「同单号多版本」？后者要取最新版本，前者直接 `DISTINCT`。
- **枚举值爆炸**：`status` 字段有「已完成 / 完成 / 已結算 / Y / 1 / done」六种写法。`SELECT status, COUNT(*) ... GROUP BY status` 一目了然，然后和客户确认映射表。
- **金额单位混用**：元和万元混在同一列，通常按系统上线时间分段。用分布图（`width_bucket` 或 pandas 的 `hist`）看有没有明显的两个数量级聚集。
- **时间字段的坑**：字符串存日期、时区混乱（服务器本地时间 vs UTC）、`1970-01-01` 和 `0000-00-00` 这类默认值。先跑 `MIN/MAX`，超出业务合理范围的就是脏值。
- **中文编码**：老系统导出的 CSV 是 GBK，Python 默认 UTF-8 读直接报错。先 `file -i data.csv` 确认编码，读取时 `encoding="gbk"`。
- **「幽灵」外键**：订单表里的 `customer_id` 在客户表里查不到（历史数据迁移丢了）。`LEFT JOIN ... WHERE b.id IS NULL` 统计孤儿率，这个数字决定了你后续 JOIN 该用 INNER 还是 LEFT。

### 1.4 常见坑

- **只看抽样不看全量**。`LIMIT 100` 看到的永远是「比较好的那部分」。profiling 要么全量跑，要么明确知道抽样偏差。
- **发现问题不记录**。建一个 `data_issues.md`，每发现一个问题记一条：字段、现象、影响、待确认人。这份文件后面会变成你的清洗规则清单和与客户的对齐依据。

---

## 二、清洗：规则要显式、可追溯、能重算

### 2.1 清洗的第一原则：规则写在代码里，不在手里

新手最大的坑是「在 Excel 里手动改」「在 Notebook 里这里改一点那里改一点」。三个月后没人（包括你自己）说得清数据经过了什么处理。正确姿势：**每一步清洗都是一个可重跑的转换函数，输入原始数据，输出干净数据，规则显式写在代码里。**

```python
def clean_amount(df: pd.DataFrame) -> pd.DataFrame:
    """金额清洗规则（与财务确认于 2026-09-10，会议纪要 #7）：
    1. 2024-03 前的记录单位为万元，统一转为元
    2. 负金额为冲正记录，保留但打标
    3. 空金额置 0 并打标，不删除（保留审计线索）
    """
    df = df.copy()
    old_mask = df["biz_date"] < "2024-03-01"
    df.loc[old_mask, "amount"] = df.loc[old_mask, "amount"] * 10_000
    df["is_reversal"] = df["amount"] < 0
    df["amount_was_null"] = df["amount"].isna()
    df["amount"] = df["amount"].fillna(0)
    return df
```

注意两个细节：规则注释里写明**来源和日期**（谁确认的、什么时候），以及**坏数据打标而不是删除**——客户现场迟早有人拿着另一份数来对，删掉的记录你说不清，打了标的记录你能解释。

### 2.2 清洗结果是「结论 + 例外清单」

清洗完跑一个质量报告：处理前后行数、每条规则命中了多少条、还有多少例外没覆盖。把例外清单（比如金额为负但业务说是正常退款的）单独导出给客户确认。**让客户对例外签字，比让客户对「数据清洗」这个抽象概念签字容易得多，也安全得多。**

---

## 三、管道落地：从 cron 到调度器的务实演进

父级文章讲了幂等、增量水位线、分层三个原则。这里解决现场真正纠结的问题：**该上多重的家伙？**

### 3.1 按阶段选工具，别一步到位

| 阶段 | 形态 | 适用条件 |
|------|------|----------|
| 验证期 | 一个 Python 脚本 + cron | 数据源 ≤ 3 个，日频，只有你一个人维护 |
| 成长期 | 脚本组 + 运行日志表 + 失败告警 | 任务增多，需要知道「昨天跑没跑成功」 |
| 稳定期 | Airflow / Dagster / Prefect | 任务有依赖关系、多人协作、客户 IT 要接手 |

客户环境每多一个组件就多一份审批、多一分出故障的面。**一个带日志表和告警的 cron 脚本，胜过一套没人会维护的 Airflow。**

最低成本的「穷人版调度」，长这样：

```bash
# /opt/etl/run_daily.sh
#!/bin/bash
set -euo pipefail
cd /opt/etl
LOG="logs/$(date +%F).log"

python extract_erp.py   >> "$LOG" 2>&1
python clean_and_load.py >> "$LOG" 2>&1
python reconcile.py      >> "$LOG" 2>&1

# 失败告警：任何一步挂了，发企业微信 webhook
if [ $? -ne 0 ]; then
  curl -s -X POST "$WECHAT_WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"ETL失败 $(date +%F)，请查日志 $LOG\"}}"
fi
```

配合一张运行日志表（任务名、开始/结束时间、读写行数、状态），你就有了可观测性的最小闭环。

### 3.2 幂等写入的具体实现

「管道一定会重跑」是现场的铁律。两种主流幂等写法：

```sql
-- 方式一：upsert（PostgreSQL），按业务主键覆盖
INSERT INTO dwd_orders (order_no, status, amount, updated_at)
SELECT order_no, status, amount, updated_at FROM stg_orders
ON CONFLICT (order_no) DO UPDATE SET
    status = EXCLUDED.status,
    amount = EXCLUDED.amount,
    updated_at = EXCLUDED.updated_at
WHERE EXCLUDED.updated_at > dwd_orders.updated_at;  -- 防止旧数据覆盖新数据

-- 方式二：分区删除重插（Hive/Spark 或按天分区的场景）
DELETE FROM dwd_orders WHERE biz_date = :run_date;
INSERT INTO dwd_orders SELECT * FROM stg_orders WHERE biz_date = :run_date;
```

方式二更适合「按天重跑」的批处理：重跑某天 = 删掉那天重插，逻辑简单，不容易出错。

### 3.3 对账（reconciliation）：信任的基石

管道跑完，客户问的第一句话永远是「数对不对」。你不能回答「应该对」。每天管道末尾自动跑对账：

```sql
-- 源与目标的行数、总额对账
SELECT
  (SELECT COUNT(*) FROM source_invoices
    WHERE biz_date = '2026-09-13') AS src_rows,
  (SELECT COALESCE(SUM(amount), 0) FROM source_invoices
    WHERE biz_date = '2026-09-13') AS src_amount,
  (SELECT COUNT(*) FROM dwd_invoices
    WHERE biz_date = '2026-09-13') AS tgt_rows,
  (SELECT COALESCE(SUM(amount), 0) FROM dwd_invoices
    WHERE biz_date = '2026-09-13') AS tgt_amount;
```

行数差、总额差超过阈值就告警。对账结果也写进日志表——三个月后客户质疑历史数据时，你能拿出「每天对账记录」自证清白，这是驻场工程师很重要的自我保护。

### 3.4 常见坑

- **水位线漏数据**：源系统的 `updated_at` 不可靠（批量导入不改时间戳）时，纯增量会悄悄丢数据。对策：增量为主 + 每周一次全量对账兜底，差异自动告警。
- **时区没对齐**：源库北京时间、数仓 UTC，「按天重跑」跑出来的永远差 8 小时的边界数据。所有时间戳入库时统一转换，转换规则写进代码注释。
- **管道和客户月结冲突**：月初客户系统跑批、数据库被锁或变慢，你的管道超时失败。把重试间隔和超时时间设宽，月初几天加宽水位线窗口。

---

## 四、跨系统实体对齐：FDE 数据工程最硬的一仗

这是父级文章没展开、但几乎每个项目都会撞上的事：**ERP 里的「客户 A」、CRM 里的「客户A有限公司」、Excel 里的「A公司」，是不是同一个客户？** 对不齐，「每个大客户的真实应收账款」就算不出来。

### 4.1 对齐的基本思路：确定规则优先，模糊匹配兜底

按可靠性从高到低分四层：

1. **有统一编码最好**：统一社会信用代码、税号是天然 join key。先检查各源系统里这个字段的填率——「系统里有这个字段」和「大家认真填了」是两回事。
2. **辅助键组合**：名称 + 电话、名称 + 地址，命中率比单字段高得多。
3. **标准化后匹配**：公司名称做标准化（去空格、全半角统一、去「有限公司/有限责任公司」后缀、繁简转换）再精确匹配。
4. **模糊匹配兜底**：剩余的用字符串相似度。Python 生态 `rapidfuzz` 是常用工具：

```python
from rapidfuzz import process, fuzz

name = "客户A有限公司"
candidates = master_names  # 主数据的名称列表
matches = process.extract(name, candidates, scorer=fuzz.token_sort_ratio, limit=3)
# [('客户A股份有限公司', 87), ('A客户商贸公司', 62), ...]
```

相似度分数设两档阈值：≥ 90 自动通过，70–90 进人工确认队列，< 70 判为不匹配。**人工确认队列是必需品，不是奢侈品**——给客户业务方一个 Excel，让他们对拿不准的匹配打勾，这个确认过程本身就是对齐会的好材料。

### 4.2 落地的关键：mapping 表是一等公民

对齐结果必须物化成一张 mapping 表：

```
entity_id | source_system | source_id | match_method | confidence | confirmed_by
E0001     | erp           | C100234   | tax_no       | 100        | 自动
E0001     | crm           | 88210     | name_fuzzy   | 87         | 张三(2026-09-12)
```

所有下游 JOIN 都走 `entity_id`，不走原始 ID 互相关联。好处：规则改了只改 mapping 表；匹配错了有审计线索（谁确认的、什么方法匹配的）；新接第四个系统时，只需新增 mapping 行，不动任何下游逻辑。

### 4.3 常见坑

- **追求 100% 自动匹配**。规则匹配能覆盖 80% 就不错，剩下 20% 靠人工。一开始就上算法做实体解析（entity resolution），投入产出比很低，而且错了没人能解释。
- **mapping 表不版本化**。客户后来会改口「这两个其实是一家，上个月拆错了」。mapping 表要留修改历史，或者至少能按日期重出任何时点的版本。

---

## 五、建模落地：从业务流程图到第一张可用的表

父级文章讲了星型模型、SCD、本体思维的概念。这里给一套现场可执行的最小流程。

### 5.1 先画流程，再谈模型

拿一张白纸（或白板），和客户业务方一起画：业务动作按顺序是什么，每个动作在哪个系统留下什么数据。以「应收账款」场景为例：

```
报价(CRM) → 合同(CRM/纸质) → 发货(WMS) → 开票(ERP) → 收款(ERP/银行流水)
```

每一步标注：系统名、关键表、关键字段、数据产生的延迟（开票可能比发货晚两周——这就是「应收账款」的业务含义）。这张图是你建模的输入，也是和客户确认理解的工具。**建模错误九成是业务理解错误，不是技术错误。**

### 5.2 最小可用的模型：一张事实表 + 少量维度

别一上来设计企业级数仓。第一个迭代通常只需要：

- **一张事实表**：粒度定死（一行 = 一张发票？一行 = 一个订单的一次状态变更？粒度是建模最重要的决定，定错了后面全返工）；
- **三四张维度表**：客户（对齐后的 `entity_id`）、产品、组织、日期。

SCD 别过度设计：客户维度如果业务只关心「现在的归属」，Type 1（直接覆盖）就够；只有「要按历史时点还原」（比如审计、按当时的销售归属算提成）才上 Type 2 拉链表。Type 2 的核心实现：

```sql
-- 客户维度拉链表：闭区间 [valid_from, valid_to)，9999-12-31 表示当前有效
CREATE TABLE dim_customer (
    entity_id    TEXT,
    sales_rep    TEXT,
    region       TEXT,
    valid_from   DATE,
    valid_to     DATE,
    PRIMARY KEY (entity_id, valid_from)
);
-- 变更时：旧记录封版 + 新记录插入
UPDATE dim_customer SET valid_to = '2026-09-01'
WHERE entity_id = 'E0001' AND valid_to = DATE '9999-12-31';
INSERT INTO dim_customer VALUES ('E0001', '李四', '华东', '2026-09-01', '9999-12-31');
```

### 5.3 本体思维的实际用法

即使不用 Palantir Foundry，「以业务对象为中心」的思维方式也很实用：建模前先列出客户嘴里高频出现的**名词**（订单、设备、工单、合同）和**动词**（下单、报修、结算）。名词是实体，动词是关系和事实表。当你的表结构和客户的语言体系一一对应时，客户自己就能看懂你的模型——这在汇报和验收时的价值，怎么强调都不过分。

---

## 六、现场约束：性能、权限与安全的红线

### 6.1 别在生产库上跑重查询

这是现场大忌，没有之一。你的一条全表 `JOIN` 把客户的 ERP 拖慢，影响的可能是几百人的日常工作，这种事故一次就够毁掉信任。正确路径，按优先级：

1. 谈一个**只读副本/备库**（Oracle Data Guard、MySQL/PostgreSQL 的从库都行）；
2. 退而求其次：**定时导出**（客户 IT 夜间跑导出脚本，你白天在落地文件上干活）；
3. 都没有：所有查询加 `LIMIT` 试探、避开业务高峰（早 9 点到晚 6 点）、大查询拆小分批跑。

### 6.2 数据安全的几条红线

- **不确定能不能碰的数据，先不碰。** 客户身份证号、银行卡、病历这类字段，业务没明确要求就别抽进来。
- **脱敏在源头做，不在下游做。** 电话号码在抽取环节就 `LEFT(phone, 3) || '****' || RIGHT(phone, 4)`，别让明文进你的管道。事后脱敏意味着明文已经在你的环境里躺过了。
- **连接串和密码不进 Git、不进文档正文、不进聊天群。** 用环境变量；客户给的账号到期主动提醒更换。把客户生产密码提交进仓库是真实发生过的重大事故。
- **离开现场前清理。** 你的测试环境、临时表、本地导出的数据文件，驻场结束要清单式清理并与客户 IT 确认。

---

## 七、练习与自测

### 7.1 一个两周的自练项目

模拟完整现场流程，建议这样搭：

1. **找脏数据**：Kaggle 上找两份同一领域、结构不同的公开数据集（比如两份电商订单数据），再手工制造麻烦——改一批编码为 GBK、往金额列里混入万元单位的值、复制 5% 的行制造重复、把一部分客户名改成「全称/简称」两种写法。
2. **探查**：跑本文 1.2 的 profiling 脚本，写一份一页纸的数据质量问题清单。
3. **清洗 + 对齐**：写显式规则的清洗脚本，用 `rapidfuzz` 做两份数据的客户对齐，产出 mapping 表。
4. **管道 + 对账**：用 cron（或 Docker 起一个 Airflow）把流程串成每日任务，实现幂等写入和行数/总额对账，故意杀一次进程验证重跑不出错。
5. **交付**：Streamlit 或一张 SQL 视图回答「每个客户的总应收」，附一页对账报告。

全程 Docker Compose 跑起来（PostgreSQL + 你的脚本），这顺便把部署也练了。

### 7.2 自测清单

- [ ] 拿到一个陌生库的只读账号，半天内能产出一份「数据质量问题清单 + 可用性结论」
- [ ] 清洗规则全部在代码里，且能说出每条规则「谁确认的、为什么」
- [ ] 管道杀掉进程重跑三次，结果和跑一次完全一致（幂等）
- [ ] 能解释水位线增量在什么情况下会丢数据，以及自己的兜底方案
- [ ] 能落地一张带人工确认流程的实体 mapping 表，并解释为什么下游都走统一 `entity_id`
- [ ] 能手写 SCD Type 2 的封版 + 插入 SQL，并说清什么时候 Type 1 就够
- [ ] 能对账：给出昨天管道的源/目标行数与总额差异，并知道差异超阈值时先查什么
- [ ] 能说出自己处理的数据里哪些字段是敏感的、在哪里做的脱敏

## 结语

数据工程在 FDE 技能栈里是「重中之重」，不是因为工具多高级，而是因为它是几乎所有现场价值的地基——数据接不进来、洗不干净、对不齐，上面的分析和应用全是空中楼阁。把这六个环节练熟，你拿到任何客户的一堆烂数据，都知道第一步做什么、最后怎么交付。

回到能力版图的全景，以及数据工程之外的两块基石（全栈开发、基础设施与部署），见父级文章：[FDE 技能栈之一：核心工程能力](./2026-09-14-fde-core-engineering.md)。
