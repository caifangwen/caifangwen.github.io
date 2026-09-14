# FDE 核心工程能力（一）：全栈开发——一个人把系统从数据库做到浏览器

> 本文是「FDE 技能栈全景图」系列支柱一的三级细分文章，对应《核心工程能力》中的「全栈开发能力」一节。
> 父级文章：[FDE 技能栈之一：核心工程能力](./2026-09-14-fde-core-engineering.md)

## 开篇：一个典型的周五下午

周五下午四点，客户的仓储主管找到你：「周一集团领导来检查，能不能做一个页面，让我们看到各仓库的库存异常清单？就一张表，能筛选、能导出 Excel 就行。」

数据在哪？你已经接进 PostgreSQL 了，但「库存异常」的业务规则要现场确认。权限？仓储部的人能看，别的部门不能看。部署？还是那台没有外网的 CentOS 服务器。

没有前端同学，没有后端同学，没有产品经理——从确认规则、写 SQL、起 API、画页面到部署上线，全是你一个人。这个需求的合理交付时间是：周六一天做完，周日留缓冲。

这不是极端情况，这是 FDE 全栈能力的日常考卷。父级文章讲了「全栈要什么技术组合」，本文往下钻一层：**这套组合具体怎么搭、代码怎么组织、哪些坑必踩、怎么练到「一天交付一个内部工具」的速度**。

---

## 一、先划清楚能力边界：FDE 全栈的「会」与「不会」

互联网公司语境的「全栈」强调深度和性能，FDE 语境的全栈强调**完整链路的确定性交付**。两者的技能点分布差别很大：

**必须会（缺一个就交付不了）：**

- 一条完整的 CRUD 链路：数据库表设计 → REST API → 前端列表页 → 部署上线；
- 认证与权限：客户环境 100% 会问「谁能看什么」，JWT + RBAC 是最低配置；
- 前端三件套页面形态：筛选条件区 + 数据表格 + 图表，内部工具 90% 的页面是这三样的组合；
- 导出 Excel / CSV——别笑，客户对「能导出来给领导」的需求优先级远超你的想象。

**不用会（现场几乎用不上）：**

- 高并发、分布式、微服务治理——你的系统用户量通常是几十到几百；
- 前端工程化的深水区：微前端、SSR、复杂的构建调优；
- 像素级 UI 还原和交互动效。

一句话：FDE 全栈的瓶颈从来不是「能不能做出炫酷的东西」，而是**「能不能在没人帮你的情况下，不卡壳地把整条链路走通」**。任何一环需要你现场搜「xxx 怎么配」，交付速度就崩了。

还有一个边界问题容易被忽略：**不是所有需求都该用代码解决**。仓储主管说「想看到库存异常」，你多问两句可能发现：他每周一手工筛一遍 Excel 花两小时，真正痛的是这一步。那最划算的交付可能不是一个 Web 应用，而是一个每天早上 7 点自动跑出异常清单、发到他邮箱的脚本——两小时写完，当天见效。Web 应用是万能的，但万能不等于最优。全栈工程师在现场的价值，恰恰是能在一排交付形态（脚本、Notebook、Streamlit、Web 应用）里挑出投入产出比最高的那个，而不是逢需求就起项目。

---

## 二、后端：一套可以直接抄的最小工程结构

### 2.1 为什么是 FastAPI

FDE 场景下 Python + FastAPI 的优先级最高，原因很实际：

- 数据工程、脚本、Web 开发用同一门语言，上下文切换成本最低；
- 自动生成的 OpenAPI 文档（`/docs`）——给客户 IT 交接时这就是现成的接口文档；
- Pydantic 的请求校验让脏数据在入口就被拦住，少写一半防御性代码。

### 2.2 工程结构：五层目录，别多也别少

现场项目最大的敌人是「三个月后自己都看不懂」。一个经过验证的最小结构：

```
app/
├── main.py            # 入口：创建 app、注册路由、挂中间件
├── config.py          # 配置：全部从环境变量读，不写死
├── database.py        # 数据库连接与 session
├── models/            # SQLAlchemy 表模型
├── schemas/           # Pydantic 请求/响应模型
├── routers/           # 路由层：只做参数解析和调 service
├── services/          # 业务逻辑：SQL、计算、规则判断
└── core/
    ├── security.py    # JWT 签发与校验、密码哈希
    └── deps.py        # 依赖注入：get_db、get_current_user、权限检查
```

原则只有一条：**路由层不写业务逻辑，业务逻辑不进路由层**。现场需求变得快，业务规则集中在 `services/` 里，改规则时不用在十几个路由函数里翻找。

### 2.3 认证：JWT 的最小可用实现

客户内网系统用 JWT 足够（不需要上完整的 OAuth2 授权服务器）。核心代码就这么多：

```python
# core/security.py
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext

SECRET_KEY = "从环境变量读"          # os.environ["SECRET_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8        # 对齐客户一个工作班次

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(user_id: int, role: str) -> str:
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

权限检查做成依赖注入，路由上一行搞定：

```python
# core/deps.py
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

bearer = HTTPBearer()

def require_role(*allowed: str):
    def checker(cred: HTTPAuthorizationCredentials = Depends(bearer)):
        try:
            payload = jwt.decode(cred.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            raise HTTPException(status_code=401, detail="登录已过期")
        if payload["role"] not in allowed:
            raise HTTPException(status_code=403, detail="无权限")
        return payload
    return checker

# 路由中使用
@router.get("/api/inventory/anomalies")
def list_anomalies(user=Depends(require_role("warehouse", "admin"))):
    ...
```

### 2.4 RBAC：三张表起步，够用五年

不要一开始就设计复杂的权限体系。最小可用模型：

```sql
CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    username   VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    display_name VARCHAR(64),
    is_active  BOOLEAN DEFAULT TRUE
);

CREATE TABLE roles (
    id   SERIAL PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,    -- 'admin' / 'warehouse' / 'viewer'
    name VARCHAR(64)
);

CREATE TABLE user_roles (
    user_id INT REFERENCES users(id),
    role_id INT REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);
```

现场经验：**客户说要「很灵活的权限」，实际需要的是「三四个固定角色」**。先用角色枚举顶住，等真的出现第五种角色再扩展数据级权限（如「只能看自己仓库的数据」——在查询里加一个 `WHERE warehouse_id IN (...)` 条件就够了，不需要引入权限框架）。

### 2.5 后端常见坑

- **密码和密钥硬编码进代码**。交付时客户安全扫描一扫一个准，整改成本远高于一开始就用环境变量。`config.py` 里全部走 `os.environ`，本地开发用 `.env`（记得加 `.gitignore`）。
- **同步接口里跑长任务**。导出十万行 Excel 的接口直接同步执行，前端超时、客户刷新、任务重复跑三次。超过 5 秒的操作就扔进后台任务（FastAPI 的 `BackgroundTasks` 或 Celery），返回任务 ID 让前端轮询状态。
- **时间字段不带时区**。客户的系统时区混乱是常态。库内统一存 UTC 或明确时区的 `TIMESTAMPTZ`，展示层再转——不然对账时「昨天的单子跑到今天」这种 bug 能查你一天。

---

## 三、前端：内部工具页面的固定套路

### 3.1 你只需要掌握一种页面骨架

现场 90% 的前端需求是这个骨架：**顶部筛选区 + 中间数据表格 + 右上角操作按钮 + 可选的图表**。用 React + Ant Design 实现，一个页面的核心代码结构是固定的：

```jsx
import { useState, useEffect } from 'react';
import { Table, Form, Select, DatePicker, Button, message } from 'antd';

export default function AnomalyList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async (params = {}) => {
    setLoading(true);
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/inventory/anomalies?${query}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (res.status === 401) { window.location.href = '/login'; return; }
    setData((await res.json()).items);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <>
      <Form form={form} layout="inline" onFinish={fetchData}>
        <Form.Item name="warehouse"><Select options={warehouses} placeholder="仓库" /></Form.Item>
        <Form.Item name="date"><DatePicker.RangePicker /></Form.Item>
        <Button type="primary" htmlType="submit">查询</Button>
        <Button onClick={() => exportExcel(form.getFieldsValue())}>导出</Button>
      </Form>
      <Table dataSource={data} loading={loading} rowKey="id"
             columns={columns} pagination={{ pageSize: 20 }} />
    </>
  );
}
```

把这一套骨架写熟到「不看参考能默写」，你的前端交付速度就过关了。之后所有页面都是它的变体。

### 3.2 图表：ECharts 一个库打全场

客户要的图来来回回就几种：趋势折线、占比饼图、排行柱状图。ECharts 的「配置项」模式非常适合现场——复制官方示例、替换数据字段、改标题，十分钟出一张能看的图。

两个实用建议：

- **图表数据由后端聚合好再返回**，不要在前端做 `group by`。后端 SQL 一个 `GROUP BY` 搞定的事，前端处理既慢又容易错。
- 图表容器记得处理「数据为空」的情况。客户筛选出一个空结果集，页面上一片空白，他会认为系统坏了而不是没数据。

### 3.3 前端常见坑

- **在客户的老浏览器上翻车**。部分政企终端还停在不支持现代语法的旧浏览器。Vite 构建时配好 `build.target`（如 `'es2015'`），并在交付前**用客户的真实终端机器验证一次**——在 Demo 现场发现白屏是最差的时间点。
- **Token 过期没有全局处理**。用户挂着页面一下午，回来后点任何按钮都 401。在 fetch 封装层统一拦截 401 跳登录页（上面代码里已经体现），别在每个页面单独处理。
- **表格不做分页**。上线第一周数据量小没事，一个月后查询 30 秒。前后端都默认分页，没有例外。

---

## 四、端到端交付：把链路拼起来的标准动作

从「需求确认」到「客户能用」，一个内部工具的完整交付动作序列：

1. **确认规则（0.5-2 小时）**：拉着业务方对着真实数据确认「库存异常」的判定规则，当场写进 SQL 跑给他看结果对不对。规则不确认就动手，返工率接近 100%。
2. **起 API（1-2 小时）**：按上面的工程结构写路由和服务层，`/docs` 里自测。
3. **画页面（2-3 小时）**：套用页面骨架，接真实 API。
4. **加权限（0.5 小时）**：建角色、加 `require_role`。
5. **打包部署（0.5-1 小时）**：前后端用一个 Compose 文件收编——

```yaml
# docker-compose.yml
services:
  web:
    build: .
    ports: ["8080:8000"]
    environment:
      - DATABASE_URL=postgresql://app:${DB_PASSWORD}@db:5432/inventory
      - SECRET_KEY=${SECRET_KEY}
    depends_on: [db]
    restart: unless-stopped

  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data   # 数据卷，容器删了数据还在
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped

volumes:
  pgdata:
```

前端构建产物由后端静态托管（FastAPI 挂 `StaticFiles`），一个容器搞定，不引入 Nginx——除非客户 IT 有明确要求。组件越少，交接时客户越容易接手。

6. **现场验证清单**：客户的浏览器打开 → 登录 → 查询 → 筛选 → 导出 → 换个无权限账号验证 403 → 重启服务器后 `docker compose up -d` 能自动拉起。

---

## 五、练习与自测

### 练习方法：限时完整交付

全栈能力没法靠背练出来，只有一个有效方法：**给自己限时，做完整的东西**。推荐练习（难度递增）：

1. **48 小时练习**：找一个公开数据集（如电商订单数据），做出带登录、列表筛选、一张图表、Excel 导出的完整应用，Docker Compose 一键启动。第一遍做不完就复盘卡在哪一环，针对性补。
2. **角色扮演练习**：做完后换个角色当「客户」——用 Safari 或旧 Edge 打开、输错密码、筛个没数据的条件、直接改数据库再刷新页面。这些就是真实客户会干的事。
3. **交接练习**：给你做的东西写一份一页纸的部署文档，然后删掉本地环境，仅凭这份文档在一台干净机器（虚拟机）上重新部署起来。部署不起来，说明文档或工程化有洞。

### 自测清单

- [ ] 能在不看参考的情况下写出 FastAPI 的最小工程结构（路由/服务/模型分层）
- [ ] 能默写 JWT 签发 + 校验 + 基于角色的依赖注入
- [ ] 能解释 RBAC 三张表的设计，并说出「数据级权限」的最简实现方式
- [ ] 能在 2 小时内从零搭出「筛选 + 表格 + 导出」的完整页面
- [ ] 知道 401/403 在前端的全局处理方案
- [ ] 能一个 `docker-compose.yml` 把应用 + 数据库起起来，并说清数据卷的作用
- [ ] 任意一个内部工具需求，能在 48 小时内交付到「客户真实终端可用」

### 达标标准

最终极的自测只有一条：**任意给你一句模糊的客户需求（如「我想看看各仓库的异常库存」），你能否在 48 小时内独立完成从规则确认到部署上线的全部环节，中间不需要搜索任何基础性问题**（「JWT 怎么签」「Ant Design 表格怎么用」这类）。可以搜具体业务规则、可以查报错，但不能卡在工具的基本用法上。

---

## 结语

FDE 的全栈不是「什么都会一点」，而是**「一条链路上没有任何一环会卡住你」**。把这一套最小结构（FastAPI 分层工程 + JWT/RBAC + AntD 页面骨架 + Compose 一键部署）练成肌肉记忆，你在现场就拥有了一样最值钱的东西：客户早上说出口的需求，晚上就能看到东西跑起来。

回到父级文章看完整支柱：[FDE 技能栈之一：核心工程能力](./2026-09-14-fde-core-engineering.md)。
