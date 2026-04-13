---
title: 数据库重构 Prompt 合集
slug: "database-refactoring-prompts"
description: 从扫描现有数据库开始，分析问题、设计新架构、执行迁移、验证回滚的完整 Prompt 工作流
date: 2026-03-19T12:00:00+08:00
lastmod: 2026-03-19T12:00:00+08:00
draft: false
author: DBA Team
categories:
  - 游戏开发
tags:
  - refactoring
  - migration
  - schema
  - prompt
toc: true
---

## 阶段一:扫描现有数据库

### P1-01 全库结构扫描

```text
你是一位资深数据库架构师。

请对以下数据库进行完整结构扫描，输出一份详尽的现状报告。

【数据库信息】
- 数据库类型：{{DB_TYPE}}（如 MySQL 8.0 / PostgreSQL 15 / MongoDB 7）
- 连接方式 / DDL 来源：{{DDL_SOURCE}}
- 业务领域：{{BUSINESS_DOMAIN}}

【扫描要求】
1. 表清单：所有表名 + 行数估算 + 创建时间（如可获取）
2. 字段详情：每张表的字段名、类型、是否 NULL、默认值、注释
3. 索引清单：主键、唯一索引、普通索引、全文索引
4. 外键 & 约束：所有外键关系，绘制依赖图（Mermaid ERD 格式）
5. 存储过程 & 触发器：名称、触发时机、核心逻辑摘要
6. 视图清单：视图名称及其 SELECT 逻辑摘要

【输出格式】
- 用 Markdown 表格展示表/字段信息
- 用 Mermaid erDiagram 展示 ER 图
- 在报告末尾附上"扫描摘要"（总表数、总字段数、最大表、冗余表候选）
```

> **变量说明**：`{{DB_TYPE}}` · `{{DDL_SOURCE}}`（粘贴 DDL 或上传文件）· `{{BUSINESS_DOMAIN}}`

---

### P1-02 数据量 & 增长趋势分析

```text
你是一位数据库性能专家。

基于以下数据量统计，为我的数据库进行容量分析。

【输入数据】
{{TABLE_SIZE_STATS}}
（粘贴 information_schema 查询结果 或 mongostats 输出）

【分析维度】
1. 大表识别：列出 TOP 10 大表（按行数 & 存储大小）
2. 增长预测：基于历史数据估算 6/12/24 个月后的规模
3. 热点表：结合读写频率（如有 slow log / APM 数据 {{SLOW_LOG}}）
4. 分区建议：哪些表适合按时间/范围/哈希分区？
5. 归档候选：哪些表的历史数据可安全归档？

【输出格式】
- Markdown 表格 + 增长折线图 ASCII 示意
- 输出"容量风险评级"（🔴高 / 🟡中 / 🟢低）
```

> **变量说明**：`{{TABLE_SIZE_STATS}}` · `{{SLOW_LOG}}`（可选）

---

### P1-03 依赖关系 & 调用链扫描

```text
你是一位代码审计专家。

请分析以下代码仓库/SQL 调用记录，输出数据库依赖图谱。

【输入材料】
- 代码路径 / 关键 SQL 片段：{{CODE_OR_SQL_SNIPPETS}}
- 服务清单：{{SERVICE_LIST}}

【分析目标】
1. 表-服务矩阵：哪些服务读写哪些表（矩阵热力图 ASCII）
2. 高耦合表：被 3 个以上服务写入的表（重构高风险）
3. 孤立表：从未被查询的表（候选废弃）
4. 跨库 JOIN：列出所有跨库/跨服务联表查询
5. 隐式依赖：通过配置/硬编码表名引用的情况

【输出】
Mermaid flowchart 展示服务→表的调用关系。
给出"重构影响评分"（每张表影响的服务数 × 调用频率权重）。
```

> **变量说明**：`{{CODE_OR_SQL_SNIPPETS}}` · `{{SERVICE_LIST}}`

---

## 阶段二：分析现有问题

### P2-01 反范式 & 冗余问题诊断

```text
你是一位数据库规范化专家（精通 1NF/2NF/3NF/BCNF）。

请对以下 Schema 进行规范化审计：

【Schema 输入】
{{SCHEMA_DDL}}

【诊断清单】
□ 是否存在多值字段（逗号分隔存多值 → 违反 1NF）
□ 是否存在部分依赖（复合主键中字段只依赖部分键 → 违反 2NF）
□ 是否存在传递依赖（非键字段依赖另一个非键字段 → 违反 3NF）
□ 是否存在重复计算字段（如 total_price = quantity × unit_price）
□ JSON/TEXT 字段中是否隐藏了结构化数据

【输出格式】
对每个问题：
- 问题描述：具体表名.字段名 + 违反哪条规范
- 影响评估：导致什么数据异常（插入/更新/删除异常）
- 改造方案：给出重构后的 DDL（CREATE TABLE ...）
- 迁移 SQL：从旧结构迁移到新结构的 INSERT/UPDATE 语句
```

> **变量说明**：`{{SCHEMA_DDL}}`

---

### P2-02 性能问题诊断

```text
你是一位 SQL 性能调优专家。

请分析以下慢查询，输出优化报告。

【慢查询列表】
{{SLOW_QUERIES}}

【EXPLAIN 输出（如有）】
{{EXPLAIN_OUTPUT}}

【分析维度】
1. 全表扫描识别：type=ALL 的查询，说明缺少哪个索引
2. 索引失效原因：函数包裹/隐式转换/最左匹配失效等
3. N+1 查询识别：循环中的重复查询模式
4. 大事务识别：长时间持锁的操作
5. 优化建议：
   - 推荐创建的复合索引（含字段顺序理由）
   - 可改写为 JOIN 的子查询
   - 可用物化视图/缓存层替代的高频查询

输出每条慢查询的"优化前 vs 优化后"对比。
```

> **变量说明**：`{{SLOW_QUERIES}}` · `{{EXPLAIN_OUTPUT}}`

---

## 阶段三：设计新架构

### P3-01 新 Schema 设计

```text
你是一位数据库架构设计专家。

请基于以下约束，设计全新的数据库 Schema。

【业务背景】
{{BUSINESS_REQUIREMENTS}}

【现有问题清单（来自阶段二分析）】
{{ISSUES_LIST}}

【设计约束】
- 目标数据库：{{TARGET_DB}}
- 预期 QPS：{{EXPECTED_QPS}}
- 数据规模：{{DATA_SCALE}}
- 是否分库分表：{{SHARDING_REQUIRED}}

【设计要求】
1. 命名规范：统一的表名/字段名规则（snake_case，含通用字段：id/created_at/updated_at/deleted_at）
2. 主键策略：自增 vs UUID vs 雪花 ID，给出理由
3. 软删除设计：deleted_at 字段策略 + 索引考量
4. 审计字段：created_by/updated_by 的设计
5. JSON 字段使用规范：哪些场景允许 JSON，哪些必须规范化

【输出】
- 完整的 CREATE TABLE DDL（含注释）
- Mermaid ERD 图
- 设计决策记录（ADR 格式：背景/决策/后果）
```

> **变量说明**：`{{BUSINESS_REQUIREMENTS}}` · `{{ISSUES_LIST}}` · `{{TARGET_DB}}` · `{{EXPECTED_QPS}}` · `{{DATA_SCALE}}` · `{{SHARDING_REQUIRED}}`

---

### P3-02 分库分表策略设计

```text
你是一位分布式数据库专家（熟悉 ShardingSphere / Vitess / TiDB）。

请为以下场景设计分库分表方案。

【目标表信息】
- 表名：{{TABLE_NAME}}
- 当前行数：{{CURRENT_ROWS}}
- 月增量：{{MONTHLY_GROWTH}}
- 主要查询模式：{{QUERY_PATTERNS}}

【设计要点】
1. Sharding Key 候选分析：列出 3 个候选字段，分析各自的数据分布均匀性
2. 分片数量计算：基于数据量 + 单片上限推算初始分片数及扩容方案
3. 路由规则：Hash 分片 vs Range 分片 vs List 分片的取舍
4. 跨片问题处理：
   - 跨片聚合查询方案
   - 跨片事务方案（2PC / Saga / 补偿）
   - 全局唯一 ID 方案
5. 读写分离：主从架构设计

【输出】
分片配置示例（YAML 或 SQL 注解格式）+ 风险清单
```

> **变量说明**：`{{TABLE_NAME}}` · `{{CURRENT_ROWS}}` · `{{MONTHLY_GROWTH}}` · `{{QUERY_PATTERNS}}`

---

## 阶段四：迁移策略

### P4-01 零停机迁移方案

```text
你是一位专注于在线迁移的数据库工程师。

请为以下迁移场景设计零停机方案。

【迁移背景】
- 源表结构：{{SOURCE_SCHEMA}}
- 目标表结构：{{TARGET_SCHEMA}}
- 业务 SLA：停机时间上限 {{MAX_DOWNTIME}}（如：0s / 30s / 5min）
- 日均写入量：{{DAILY_WRITES}}

【迁移步骤设计】

Phase 1 - 准备（不影响线上）
□ 创建新表（含所有索引）
□ 建立增量同步通道（binlog / CDC / trigger）

Phase 2 - 全量迁移（后台静默）
□ 分批 INSERT INTO new_table SELECT ...（batch_size={{BATCH_SIZE}}）
□ 限速策略（避免主库压力）
□ 进度监控 SQL

Phase 3 - 双写追增量
□ 应用层同时写旧表 + 新表的代码改造点
□ 数据一致性校验方案

Phase 4 - 读流量切换
□ 灰度放量策略（1% → 10% → 50% → 100%）
□ 快速回滚开关设计

Phase 5 - 旧表下线
□ 旧表重命名为 _deprecated_xxx
□ 观察期（建议 7 天）后删除

【输出】
每个 Phase 的具体 SQL + 应用代码改造点 + 预估耗时。
```

> **变量说明**：`{{SOURCE_SCHEMA}}` · `{{TARGET_SCHEMA}}` · `{{MAX_DOWNTIME}}` · `{{DAILY_WRITES}}` · `{{BATCH_SIZE}}`

---

### P4-02 迁移脚本生成

```text
你是一位精通 SQL 脚本编写的数据库工程师。

请生成以下迁移场景的完整脚本（含错误处理 & 断点续传）。

【迁移任务】
从 {{SOURCE_TABLE}} 迁移到 {{TARGET_TABLE}}
字段映射关系：
{{FIELD_MAPPING}}
（格式：旧字段 -> 新字段，如：user_name -> username，status_code -> is_active (status_code=1)）

【脚本要求】
1. 分批处理：每批 {{BATCH_SIZE}} 条，用 WHERE id > last_id AND id <= last_id+batch_size
2. 进度记录：写入 migration_progress 表（table_name, last_id, batch_count, updated_at）
3. 断点续传：脚本启动时从 migration_progress 读取上次进度
4. 数据校验：每批次迁移后，对比源/目标行数 + checksum
5. 限速控制：批次间 SLEEP({{SLEEP_MS}}/1000) 避免压垮主库
6. 错误日志：失败记录写入 migration_errors 表

输出：可直接执行的 SQL 脚本（MySQL / PostgreSQL，按 {{DB_TYPE}} 适配语法）
```

> **变量说明**：`{{SOURCE_TABLE}}` · `{{TARGET_TABLE}}` · `{{FIELD_MAPPING}}` · `{{BATCH_SIZE}}` · `{{SLEEP_MS}}` · `{{DB_TYPE}}`

---

## 阶段五：验证与回滚

### P5-01 数据一致性验证

```text
你是一位数据质量工程师。

请为以下迁移生成完整的数据一致性验证方案。

【对比目标】
- 源表：{{SOURCE_TABLE}}
- 目标表：{{TARGET_TABLE}}
- 业务关键字段：{{KEY_FIELDS}}

【验证层级】

Level 1 - 数量验证
SELECT COUNT(*) 对比（含按时间段分片验证）

Level 2 - 校验和验证
对关键字段计算 MD5/CRC32 聚合校验和

Level 3 - 采样验证
随机抽取 1000 条记录，逐字段比对

Level 4 - 业务逻辑验证
验证以下业务不变量（需根据 {{BUSINESS_INVARIANTS}} 定制）：
- 外键引用完整性
- 金额/数量字段总和一致
- 状态枚举值合法性

Level 5 - 差异报告
生成 diff 报告：仅在源表/仅在目标表/数据不一致的记录

【输出】
可直接执行的验证 SQL 脚本 + 自动化检查脚本（Python / Shell）。
最终输出"通过/失败"的检查清单（Markdown 格式）。
```

> **变量说明**：`{{SOURCE_TABLE}}` · `{{TARGET_TABLE}}` · `{{KEY_FIELDS}}` · `{{BUSINESS_INVARIANTS}}`

---

### P5-02 回滚预案设计

```text
你是一位 SRE 工程师，专注于数据库变更安全。

请为以下迁移计划设计完整的回滚预案。

【迁移计划概述】
{{MIGRATION_PLAN_SUMMARY}}

【回滚预案要求】
对每个迁移阶段，定义：

| 阶段 | 回滚触发条件 | 回滚操作 | 预计恢复时间 |
|------|------------|---------|------------|

触发条件示例：
- 错误率上升 > 0.1%
- P99 延迟增加 > 50ms
- 数据校验失败
- 业务告警触发

回滚操作要求：
1. 应用层回滚：Feature Flag 关闭双写，切回旧表读
2. 数据层回滚：将迁移后新增数据同步回旧表的 SQL
3. 中间件层回滚：连接池/读写分离配置回退

【监控指标清单】
列出迁移期间必须监控的关键指标（Grafana 面板 / 告警规则配置）

【演练计划】
建议在正式迁移前如何在测试环境模拟回滚演练。

输出格式：Runbook（标准操作手册）Markdown 格式。
```

> **变量说明**：`{{MIGRATION_PLAN_SUMMARY}}`
