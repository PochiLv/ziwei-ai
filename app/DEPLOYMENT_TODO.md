# 部署与二期 TODO

这份 TODO 先把需要你醒来确认的事项集中放在这里。第一期先做成可部署自用版本；二期再考虑开放注册、充值和额度。

## 需要你确认

- 百炼 API 类型：你当前确认使用 Coding Plan；第一期默认厂商已切到 `Coding Plan (OpenAI 兼容)`。
- Coding Plan 的实际模型名：已确认并默认使用 `qwen3.6-plus`。
- 你优先使用 OpenAI 兼容还是 Claude 兼容：百炼按量和 Coding Plan 的两种入口都已放进设置面板。
- 服务器环境：系统版本、是否已有 Nginx、域名是否已备案和解析。
- 是否需要 HTTPS：正式给外部访问时建议用 HTTPS，后续可接 Certbot 或云厂商证书。
- 第一版是否需要一个简单访问密码：如果网址可能被别人访问，建议先加一层 Nginx Basic Auth。
- 是否保留浏览器本地保存 API Key：自用没问题，对外开放必须改服务端代理。

## 第一期范围

- PC 端打开：工作台布局，左侧导航，右侧内容区。
- 手机端打开：顶部品牌栏，底部功能导航。
- 功能保持不变：命盘解读、年度运势、人生 K 线、双人合盘、分享卡片。
- 命盘排盘：基于 iztro `horoscope()` 支持大限、流年、流月、流日叠盘。
- 视觉方向：以浅色纸面、高对比文字、清晰宫格为主，避免深紫黑背景影响看盘。
- 模型设置：内置百炼按量 API 与 Coding Plan 的 OpenAI / Claude 兼容端点。
- 部署方式：构建静态 `dist/`，通过 Nginx 或静态托管访问。

## 第一期部署清单

- 在服务器安装 Node.js LTS。
- 拉取或上传项目代码。
- 进入 `app` 目录执行 `npm install`。
- 执行 `npm run build`。
- 将 `dist/` 目录交给 Nginx 托管。
- 配置 `/api/codingplan/openai/` 和 `/api/codingplan/anthropic/` 反向代理，否则浏览器直连 Coding Plan 会出现 CORS / Failed to fetch。
- 浏览器访问域名，进入设置面板填百炼 API Key。
- 生成一个命盘，测试 AI 解读流式输出。

## 建议的服务器目录

```text
/var/www/ziwei/dist
/etc/nginx/sites-available/ziwei.conf
/etc/nginx/sites-enabled/ziwei.conf
```

## Nginx Basic Auth 可选

如果第一期只想自己访问，但服务器域名是公网可达，建议先加访问密码。

示例：

```nginx
location / {
  auth_basic "Ziwei Private";
  auth_basic_user_file /etc/nginx/.ziwei_htpasswd;
  try_files $uri $uri/ /index.html;
}
```

## 二期商业化架构

开放给外部用户后，建议拆成：

```text
Web 前端
  -> API 后端
    -> 用户系统
    -> 订单/充值系统
    -> 额度账本
    -> 大模型代理
    -> 调用日志
    -> 管理后台
```

推荐技术选型：

- 前端：继续 React，后续可迁移 Next.js 方便 SEO 和服务端能力。
- 后端：Node.js/NestJS、Hono、Fastify 或 Python/FastAPI 都可以。
- 数据库：PostgreSQL。
- 缓存与限流：Redis。
- 支付：微信支付、支付宝，或先人工充值。
- 鉴权：邮箱/手机号注册，JWT + Refresh Token。

## 二期核心表设计草案

```text
users
- id
- username
- password_hash
- phone
- email
- status
- created_at

credit_accounts
- user_id
- balance
- total_recharged
- total_used
- updated_at

credit_ledger
- id
- user_id
- type
- amount
- reason
- request_id
- created_at

ai_requests
- id
- user_id
- feature
- provider
- model
- prompt_tokens
- completion_tokens
- cost_credits
- status
- created_at

orders
- id
- user_id
- amount_cny
- credits
- payment_provider
- status
- created_at
```

## 二期接口草案

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/me
GET  /api/credits
POST /api/ai/interpret-chart
POST /api/ai/yearly-fortune
POST /api/ai/kline-reason
POST /api/orders/create
POST /api/payments/webhook
GET  /api/admin/users
GET  /api/admin/requests
```

## 后端代理调用模型时要做的事

- 从服务端环境变量读取百炼 API Key。
- 不把平台 Key 返回给浏览器。
- 每次调用前检查用户额度。
- 预估或固定扣费，调用成功后入账。
- 对单用户、单 IP、单功能做频控。
- 保存必要调用日志，避免保存过多隐私内容。
- 给命理服务加免责声明。

## 待优化

- 将 ECharts、Markdown、分享图相关模块做代码分包，降低首屏 JS 体积。
- 将 API Key 设置面板改成部署模式感知：自用模式显示本地 Key，商业模式隐藏 Key 输入。
- 增加错误提示细节：模型不存在、Key 无效、余额不足、跨域失败。
- 增加 `.env.example` 和 Docker 部署文件。
- 增加 Playwright 截图回归测试。
