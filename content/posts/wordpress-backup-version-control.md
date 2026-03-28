---
title: "WordPress 站点备份与版本管理：像 Git 一样管理你的网站"
date: 2026-03-28T11:22:44+08:00
draft: false
tags: ["WordPress", "备份", "Git", "版本管理", "运维"]
categories: ["建站技术"]
description: "系统介绍多种 WordPress 站点备份与版本管理方案，从插件到 Git + WP-CLI，帮你找到最适合的策略。"
---

WordPress 站点一旦出问题——数据库崩溃、主题误改、插件冲突——如果没有完善的备份和版本管理，损失可能是灾难性的。本文介绍几种主流方案，从简单插件到类 Git 工作流，按需选择。

---

## 方案一：插件备份（快速上手）

适合**非技术用户**或小型站点，几乎零门槛。

### UpdraftPlus（推荐）

- 支持备份到 Google Drive、Dropbox、S3、FTP 等
- 可设置定时自动备份（文件 + 数据库分开）
- 免费版已够用，Pro 版支持增量备份和迁移

**基本配置思路：**

```
数据库备份频率：每天
文件备份频率：每周
保留份数：7（滚动覆盖）
远程存储：Google Drive 或 S3
```

### All-in-One WP Migration

- 一键导出整站为 `.wpress` 包
- 适合迁移和手动存档，不适合自动化

**缺点：** 插件方案本质是「快照」而非版本管理，无法追踪变更历史，回滚粒度较粗。

---

## 方案二：Git 管理主题与插件代码

这是最接近 Git 工作流的方案，适合**开发者**。

### 核心思路

WordPress 的代码部分（主题、插件、`wp-config.php`）可以纳入 Git，数据库和上传文件单独处理。

### 目录结构建议

```
my-wordpress/
├── .git/
├── .gitignore
├── wp-content/
│   ├── themes/          # ✅ 纳入 Git
│   ├── plugins/         # ✅ 纳入 Git（自定义插件）
│   └── uploads/         # ❌ 排除（用对象存储或单独备份）
├── wp-config.php        # ⚠️  纳入 Git，但敏感信息用环境变量
└── wp-config-sample.php
```

### `.gitignore` 参考

```gitignore
# 上传文件（体积大，不适合 Git）
wp-content/uploads/

# WordPress 核心（通过 Composer 或 WP-CLI 管理）
/wp-admin/
/wp-includes/
/wp-*.php
/index.php
/xmlrpc.php
/readme.html

# 第三方插件（通过 Composer 管理）
wp-content/plugins/*/
!wp-content/plugins/my-custom-plugin/

# 环境配置
.env
wp-config-local.php

# 缓存
wp-content/cache/
```

### 配合 WP-CLI 使用

```bash
# 导出数据库到 Git 可追踪的 SQL 文件
wp db export backups/db-$(date +%Y%m%d).sql

# 检查站点状态
wp core verify-checksums
wp plugin verify-checksums --all
```

### Git 工作流

```bash
# 开发新功能
git checkout -b feature/new-theme-header

# 提交变更
git add wp-content/themes/my-theme/
git commit -m "feat: 更新首页 header 布局"

# 合并到主分支
git checkout main
git merge feature/new-theme-header

# 打版本标签（类似快照）
git tag -a v1.2.0 -m "上线新首页设计"
```

---

## 方案三：WP-CLI + Shell 脚本自动化备份

适合有服务器权限的用户，实现**数据库 + 文件的定期自动备份**。

### 备份脚本示例

```bash
#!/bin/bash
# wp-backup.sh

SITE_DIR="/var/www/wordpress"
BACKUP_DIR="/backups/wordpress"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=30

mkdir -p "$BACKUP_DIR/$DATE"

# 1. 备份数据库
cd "$SITE_DIR"
wp db export "$BACKUP_DIR/$DATE/database.sql" --allow-root

# 2. 备份 wp-content（排除缓存）
tar --exclude='wp-content/cache' \
    --exclude='wp-content/uploads/cache' \
    -czf "$BACKUP_DIR/$DATE/wp-content.tar.gz" \
    wp-content/

# 3. 备份配置文件
cp wp-config.php "$BACKUP_DIR/$DATE/wp-config.php"

# 4. 删除超过 30 天的旧备份
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +$KEEP_DAYS -exec rm -rf {} \;

echo "✅ 备份完成：$BACKUP_DIR/$DATE"
```

### 加入 Crontab

```bash
# 每天凌晨 3 点执行备份
0 3 * * * /usr/local/bin/wp-backup.sh >> /var/log/wp-backup.log 2>&1
```

---

## 方案四：Git + 数据库版本化（进阶）

用 Git 管理数据库 Schema 变更，类似后端开发中的数据库迁移。

### 工具：Flyway 或 Liquibase（配合 WordPress）

对于 WordPress 场景，更实用的是**定期导出数据库 dump 并提交到独立的私有仓库**：

```bash
# 每次发布前导出
wp db export --add-drop-table db-snapshots/pre-release-v1.3.sql

# 提交到备份仓库
cd db-snapshots-repo
git add .
git commit -m "snapshot: v1.3 上线前数据库状态"
git push
```

### 结合 Git Tag 打快照

```bash
# 代码仓库
git tag -a "release-v1.3" -m "v1.3 正式上线"

# 同步数据库快照仓库也打同名 tag
cd db-snapshots-repo
git tag -a "release-v1.3"
```

这样代码版本与数据库状态可以一一对应。

---

## 方案五：云端完整方案（团队/生产环境推荐）

### 架构示意

```
┌─────────────────────────────────────────────┐
│                WordPress 站点               │
│                                             │
│  代码 → Git (GitHub/GitLab)                │
│  数据库 → RDS 自动快照 (每日)              │
│  上传文件 → S3/OSS (版本控制开启)          │
│  全站快照 → UpdraftPlus → S3               │
└─────────────────────────────────────────────┘
```

### AWS S3 开启版本控制

```bash
# 为存储桶开启版本控制
aws s3api put-bucket-versioning \
  --bucket my-wordpress-uploads \
  --versioning-configuration Status=Enabled

# 查看某个文件的历史版本
aws s3api list-object-versions \
  --bucket my-wordpress-uploads \
  --prefix wp-content/uploads/2026/03/image.jpg
```

这样 `uploads/` 目录中的每个文件都有完整的历史版本，可随时回滚。

---

## 方案对比

| 方案 | 难度 | 代码版本管理 | 数据库版本管理 | 适合场景 |
|------|------|-------------|---------------|---------|
| UpdraftPlus 插件 | ⭐ | ❌ | ✅ 快照 | 个人博客、小站 |
| Git 管理代码 | ⭐⭐⭐ | ✅ | ❌ | 开发者、主题开发 |
| WP-CLI + Shell | ⭐⭐ | ❌ | ✅ 定期快照 | 有服务器权限的用户 |
| Git + DB 快照 | ⭐⭐⭐⭐ | ✅ | ✅ 快照 | 中型站点、团队协作 |
| 云端完整方案 | ⭐⭐⭐⭐⭐ | ✅ | ✅ 连续 | 生产环境、电商站 |

---

## 推荐组合策略

**个人博客：**
> UpdraftPlus 自动备份到 Google Drive + Git 管理自定义主题

**小型企业站：**
> WP-CLI 每日备份脚本 + Git 代码仓库 + 发布前手动数据库快照

**生产/电商站：**
> Git + CI/CD 流水线 + RDS 自动快照 + S3 版本控制 + UpdraftPlus 双重保险

---

## 小结

WordPress 没有原生的版本管理机制，但通过组合工具完全可以实现类 Git 的工作流：

- **代码变更** → Git 追踪，精确到每一行
- **数据库状态** → 定期快照 + 打 Tag 对应
- **媒体文件** → 对象存储开启版本控制
- **整站恢复** → 插件备份兜底

核心原则：**3-2-1 备份策略**——3 份副本，存于 2 种介质，1 份异地。

---

*本文写于 2026-03-28，工具版本以官方最新文档为准。*
