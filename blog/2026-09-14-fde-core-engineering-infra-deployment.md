# FDE 基础设施与部署实战：在隔离网里把系统送上线

> 本文是「FDE 技能栈全景图」系列中「支柱一：核心工程能力」下的深度专题，展开讲**基础设施与部署**。
> 父级概览见：[核心工程能力](./2026-09-14-fde-core-engineering.md)，系列总览见：[FDE 技能栈全景图](./2026-09-14-fde-skill-stack-pillar.md)。

## 一个典型的现场

给客户做的数据看板终于开发完了。演示定在周四上午九点，给分管副总看。周三下午你带着 U 盘里的镜像包到客户机房，发现：

- 服务器上的 Docker 是 1.13 老版本，`docker compose`（v2 插件）根本不存在；
- `docker load` 到一半磁盘满了——`/var/lib/docker` 挂在了一个 40G 的系统分区上；
- 应用起来了，但访问数据库超时，客户网络部说「服务器区到数据库区的防火墙只开了 1521，没开 5432」；
- 客户的 HTTPS 证书是自签的，浏览器满屏红色警告，领导看了皱眉头。

这些问题没有一个是代码问题，但每一个都能让你的演示翻车。这就是基础设施与部署能力值得单独成文的原因：**在客户现场，代码交付出去之前还有一整个环节，而这个环节几乎全部落在 FDE 一个人头上。**

父级文章对这一主题做了概览（Linux 基本功、Docker、CI/CD、Git 规范、云与私有化），本文往下钻一层：现场部署的心智模型、离线交付的完整流程、可复用的排障 playbook、上线与回滚的具体操作。

---

## 一、先建立正确的心智模型

互联网公司养成的部署直觉，到了客户现场要主动「降级」：

| 互联网习惯 | 客户现场现实 |
|---|---|
| 随时发布，一天发十次 | 变更要走审批，窗口可能一周一次 |
| 挂了立刻回滚，用户无感 | 回滚也要走流程，故障期间业务真的停 |
| 监控告警齐全 | 大概率没有监控，客户用户就是你的告警 |
| 基础设施有 SRE 兜底 | 你就是 SRE，还是兼职的 |
| 随便拉镜像、装依赖 | 无外网，装一个 `vim` 插件都要想替代方案 |

由此得出三条部署铁律：

1. **简单优先于先进。** 单机 Docker Compose 能解决的，不上 K8s。你每引入一个组件，客户 IT 就要多维护一个组件，而你迟早会离开现场。
2. **可回滚优先于可升级。** 任何一次变更，先想清楚「失败了怎么回到上一个状态」，再动手。
3. **客户能接手优先于自己方便。** 部署文档、一键脚本、数据卷位置——这些比架构优雅重要得多。验收标准不是「系统多牛」，而是「你走了系统还活着」。

---

## 二、Linux 现场排障：四个方向的 playbook

父级文章列了基础命令，这里按故障类型组织成可以直接套用的排查路径。现场排障的关键不是命令背得多，而是**有顺序**：先确认现象，再逐层缩小范围，不要一上来就重启。

### 2.1 「服务访问不了」

按从近到远的顺序排：

```bash
# 1. 进程活着吗
systemctl status myapp          # 或 docker compose ps

# 2. 端口在监听吗，监听在哪个地址上
ss -tlnp | grep 8080
# 注意：如果显示 127.0.0.1:8080 而不是 0.0.0.0:8080，
# 外部机器永远访问不到——这是 bind 地址配错，最常见的坑之一

# 3. 本机能不能通
curl -v http://127.0.0.1:8080/health

# 4. 本机通、外部不通 → 防火墙/安全组/网络 ACL
firewall-cmd --list-ports       # firewalld（CentOS/RHEL）
iptables -L -n                  # iptables
# 以上都没问题还不通 → 找客户网络部查区间防火墙，提供「源地址、目标地址、端口、协议」四要素
```

和客户网络部门沟通时，把四要素一次给全（`从 10.20.1.15 访问 10.30.2.8 的 TCP 5432`），能省掉三天的来回扯皮。

### 2.2 「服务挂了/频繁重启」

```bash
# 看退出原因
journalctl -u myapp --since "today" | tail -100
docker compose logs --tail 200 myapp

# 如果是被 OOM Killer 杀掉的（容器莫名重启的高发原因）
dmesg | grep -i "killed process"
free -h
```

OOM 的对策：给容器加内存限制（`docker compose` 里的 `mem_limit` 或 v2 语法的 `deploy.resources.limits`），Java 应用必须显式设 `-Xmx`，否则 JVM 按宿主机内存申请堆，容器一限内存就被杀。

### 2.3 「磁盘满了」

离线环境的头号事故，因为没人监控：

```bash
df -h                                  # 哪个分区满了
du -xh --max-depth=1 / | sort -h | tail -10   # 定位大目录
docker system df                       # Docker 占了多少
docker system prune -a                 # 慎用：清掉所有未使用镜像
```

高频元凶：应用日志没做轮转、`docker logs` 无限增长（json-file 驱动默认不轮转）、数据库 WAL/binlog 堆积。对策是**部署第一天就配好日志轮转**，别等出事：

```yaml
# docker-compose.yml 中给每个服务加上
services:
  myapp:
    logging:
      driver: json-file
      options:
        max-size: "100m"
        max-file: "5"
```

### 2.4 「连不上数据库 / 连不上对方的接口」

```bash
# DNS 解析问题（内网 DNS 经常配置不全）
dig erp-db.corp.local
getent hosts erp-db.corp.local

# 端口连通性（没有 telnet/nc 时用 bash 自带的）
timeout 3 bash -c '</dev/tcp/10.30.2.8/5432' && echo OK || echo FAIL

# 看 TLS/证书问题
curl -v https://partner-api.corp.local/ 2>&1 | grep -i ssl
openssl s_client -connect partner-api.corp.local:443 -servername partner-api.corp.local
```

客户内网里 `/etc/hosts` 手工加解析是常态，写进部署文档，否则换台机器就翻车。

---

## 三、容器化交付：把「能跑」变成「能交付」

### 3.1 Dockerfile：生产可用的最小模板

FDE 场景对镜像的要求：**小、可复现、时区正确、非 root 运行**。一个 Python 应用的参考模板：

```dockerfile
# ---- 构建阶段 ----
FROM python:3.12-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---- 运行阶段 ----
FROM python:3.12-slim
ENV TZ=Asia/Shanghai \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
# 离线环境装不了 tzdata 的话，基础镜像里通常已带；没有就把时区文件打进镜像

COPY --from=builder /install /usr/local
WORKDIR /app
COPY . .

RUN useradd -r -u 10001 appuser && chown -R appuser /app
USER appuser

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

几个容易踩的细节：

- **`requirements.txt` 必须锁版本**（`pip freeze > requirements.txt` 或直接用 `uv pip compile` / pip-tools）。不锁版本的镜像，三个月后重建就是另一个软件。
- **时区**：很多 slim 镜像默认 UTC，报表里的「今天」会差 8 小时。除了 `TZ` 环境变量，确认镜像里有 `/usr/share/zoneinfo`。
- **镜像里不要放任何环境相关配置和密钥**，用环境变量或挂载的配置文件注入。同一个镜像要能原样部署到测试和生产。

### 3.2 离线交付的标准流程

这是 FDE 和普通后端拉开差距的地方。完整流程：

```bash
# === 在有网环境（你的开发机/公司构建机）===
docker build -t myapp:1.3.0 .
docker tag myapp:1.3.0 myapp:latest

# 导出所有需要的镜像（应用 + 依赖的中间件，一个都不能少）
docker save myapp:1.3.0 postgres:16-alpine redis:7-alpine \
  | gzip > myapp-bundle-1.3.0.tar.gz

# 同时准备好：docker-compose.yml、.env.example、部署文档、升级脚本
sha256sum myapp-bundle-1.3.0.tar.gz > SHA256SUMS   # 摆渡后校验完整性

# === 客户内网 ===
sha256sum -c SHA256SUMS
gunzip -c myapp-bundle-1.3.0.tar.gz | docker load
docker compose up -d
```

注意三点：

1. **依赖镜像一起打包。** 别假设客户环境里有 `postgres:16-alpine`——隔离网里什么都没有。
2. **Python/系统依赖提前固化。** 永远不要指望在现场 `pip install`。如果有编译型依赖（`psycopg2`、`pandas`），全部用 wheel 在构建阶段装好，现场只有 `docker load` 一步。
3. **核对客户环境的 Docker 版本和 CPU 架构。** 老服务器可能是 Docker 1.13（没有 `docker compose` 插件，只有独立的 `docker-compose` v1 二进制），也可能是 ARM 架构的国产服务器（鲲鹏、飞腾）。**在有网环境按目标架构构建**（`docker buildx build --platform linux/arm64`），别到了机房才发现架构不对。

### 3.3 docker-compose.yml：生产可用的最小模板

```yaml
services:
  app:
    image: myapp:1.3.0
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://app:${DB_PASSWORD}@db:5432/myapp
    volumes:
      - ./config:/app/config:ro        # 配置外挂，改配置不用重建镜像
      - app-data:/app/data             # 业务数据
    depends_on:
      db:
        condition: service_healthy
    logging:
      driver: json-file
      options:
        max-size: "100m"
        max-file: "5"

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    # 数据库端口不要映射到宿主机，除非确有必要——少一个暴露面

volumes:
  app-data:
  pg-data:
```

要点：`restart: unless-stopped`（断电重启后自动拉起，这是没有 K8s 时的高可用）、健康检查、日志轮转、密钥走 `.env` 文件（权限 `chmod 600`，绝不进 Git）、**数据卷命名并在文档里写清楚路径**。

### 3.4 内网镜像仓库

客户环境如果不止一台服务器，或者客户 IT 后续要自己部署，`docker save/load` 就不够用了。两个务实选择：

- **registry:2**：Docker 官方镜像仓库，一个容器就起来，配个 TLS 或内网互信即可；
- **Harbor**：需要权限管理、镜像扫描、Web 界面时用，政企客户接受度高。

单台服务器的项目不必上仓库，save/load 加版本号管理足够。

---

## 四、CI/CD：内网里的最小流水线

现场流水线的目标不是「先进」，是**交付物可复现**——任何人（包括三个月后的你）能从 Git 里的某个 tag 构建出和线上一模一样的镜像。

GitLab 社区版可以私有化部署在客户内网，是隔离网场景的主流。一个够用的 `.gitlab-ci.yml`：

```yaml
stages: [test, build, package]

test:
  stage: test
  image: python:3.12-slim
  script:
    - pip install -r requirements.txt -r requirements-dev.txt
    - pytest tests/ -q

build:
  stage: build
  script:
    - docker build -t myapp:$CI_COMMIT_TAG .
    # 内网有仓库就 push；没有就导出 tar 包作为 artifact
    - docker save myapp:$CI_COMMIT_TAG | gzip > myapp-$CI_COMMIT_TAG.tar.gz
  artifacts:
    paths:
      - myapp-$CI_COMMIT_TAG.tar.gz
  only:
    - tags   # 只认 tag 发布，杜绝「随手改随手发」
```

配套纪律：

- **只在 tag 上构建发布件**，版本号语义化（`v1.3.0`），每个版本附一份变更记录（哪怕只是 commit 列表）。客户问你「现在跑的是哪个版本」时必须三秒答出来。
- 没有条件搭 CI 时，一个 `make release` 脚本把「测试 → 构建 → 导出 → 算 checksum」串起来，达到同样效果。关键是构建过程不依赖任何一台特定笔记本上的环境。
- Runner 用客户内网的一台机器注册（shell executor 最省事），构建机别用你个人的笔记本。

---

## 五、上线与回滚：把变更当手术对待

### 5.1 上线前 checklist（可直接打印）

```
[ ] 新版本镜像已在测试环境（或客户准生产环境）验证过
[ ] 数据库变更（DDL/迁移脚本）已评审，且有对应的回退脚本
[ ] 已备份：数据库全量备份完成并验证可恢复（做过一次恢复演练）
[ ] 当前运行版本已记录（镜像 tag + Git commit）
[ ] 回滚步骤已写在纸上，且镜像 tar 包就在服务器上
[ ] 变更窗口已与业务方确认（避开结账日、月末跑批等业务高峰）
[ ] 客户 IT 和业务方的联系人已通知到位
```

数据库变更是最容易出事的环节。原则：**先改库再发应用，且库变更向后兼容**（加列可以，删列/改列类型拆成两次发布）。用 Alembic（SQLAlchemy 生态）或 Flyway/Liquibase（Java 生态）管理迁移，别手工在库里执行 DDL。

### 5.2 回滚方案

容器化的好处在这里体现：回滚 = 切回旧镜像。

```bash
# 升级
docker compose pull            # 或 docker load 新镜像
docker compose up -d

# 验证失败，回滚（前提是 compose 文件里保留了旧 tag 的记录）
docker compose down
# 把 docker-compose.yml 里的 tag 改回 1.2.0
docker compose up -d
```

数据库的回滚靠两样东西：**变更前的备份**（终局手段）和**每个迁移脚本对应的 downgrade**（首选）。没有 down 脚本的迁移不允许上线。

上线后留观察期：至少盯半天，确认定时任务跑过一轮、客户高频操作路径走通，再宣布完成。

---

## 六、安全与合规的底线

安全合规有专文展开（支柱五），这里只列部署环节必须守住的几条：

- **密钥不进镜像、不进 Git、不进文档。** `.env` 权限 600，部署文档里只写「密码向客户 IT 索取」。
- **最小暴露面**：数据库、Redis 端口不映射到宿主机；对外只暴露一个 Nginx 反向代理端口；管理接口（如 `/metrics`、admin 后台）加访问控制。
- **日志里不打印敏感信息**：手机号、身份证号在日志里脱敏。等保测评和客户的审计都可能翻日志。
- **不确定能不能碰的数据，先不碰**，先问客户的数据安全负责人。

---

## 七、常见坑汇总（每一条都是真金白银换来的）

1. **到了现场才发现架构/版本不兼容**：ARM 服务器、老 Docker、老内核（某些新镜像要求内核 3.10+）。对策：第一次去现场就做环境摸底，要一份服务器清单（OS、内核、Docker 版本、CPU 架构、磁盘、网络拓扑），形成《环境勘察表》模板以后每个项目复用。
2. **在客户的测试环境验证不充分就发生产**：客户的「测试环境」经常和生产环境数据不同步、权限不同。至少把演示路径在生产同构环境走一遍。
3. **升级覆盖了配置**：把配置文件打进镜像，一升级配置全丢。配置必须外挂（volume 或环境变量）。
4. **没有留旧版本镜像**：磁盘紧张时 `docker system prune -a` 把旧镜像清了，回滚无路。旧版本 tar 包至少在服务器上保留一份。
5. **忽略时钟同步**：内网服务器没配 NTP，时钟漂移导致 JWT 校验失败、定时任务错乱、对账数据对不上。检查：`timedatectl`，让客户内网提供 NTP 源。
6. **文档只写给自己看**：部署文档的读者是客户 IT 的新人。假设读者没见过你的系统，每一步给出命令和预期输出。

---

## 八、练习方法与自测

**练习一：离线交付模拟（核心练习，建议做两遍）**

在自己机器上搭完整应用（FastAPI + PostgreSQL + Redis + 前端），然后：

1. 断网（或开一台无任何外网的虚拟机），只靠一个 tar 包和 compose 文件把系统完整部署起来；
2. 制造一次故障（杀掉数据库容器、写满磁盘、改错配置），按第二节的 playbook 排障；
3. 做一次「版本升级 + 数据库迁移 + 回滚」的全流程演练。
4. 验收标准：整个部署过程只靠你写的文档就能完成，不依赖你脑子里的记忆。

**练习二：环境摸底**

找一台你从没碰过的 Linux 机器（云主机开个新实例即可），30 分钟内输出一份环境勘察报告：OS/内核/Docker 版本、CPU 架构、内存磁盘、网络出口、已有服务占用端口、时钟是否同步。

**自测清单**

- [ ] 能在陌生 Linux 机器上独立定位「端口不通」是应用没起、bind 地址错、防火墙还是网络 ACL 的问题
- [ ] 能写出多阶段构建的 Dockerfile，镜像锁定版本、非 root 运行、时区正确
- [ ] 能完成一次完整的离线交付：构建 → 打包 → 校验 → load → 启动，含全部依赖镜像
- [ ] 能解释并演示「数据库迁移失败时如何回滚」
- [ ] 能搭一个 tag 触发的最小 CI，产出带 checksum 的发布件
- [ ] 写的部署文档能让一个没接触过系统的工程师照着完成部署

## 结语

基础设施与部署是 FDE 技能栈里最不显眼、却最直接影响交付速度的一环——客户不会记得你的代码写得多优雅，但会记得「系统部署顺不顺、出了问题能不能半小时内恢复」。把离线交付流程、排障 playbook、上线 checklist 练成肌肉记忆，你在现场的每一小时都会更值钱。

回到父级文章继续读核心工程能力的另外两块（全栈开发、数据工程）：[核心工程能力](./2026-09-14-fde-core-engineering.md)。
