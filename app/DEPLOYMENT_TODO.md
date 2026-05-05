# 部署记录与后续路线图

这份文档记录紫微知道当前自用部署状态，以及后续开放给外部用户前需要补齐的能力。

## 已完成

- 域名：`ziwei.snowfish.love`
- HTTPS：已通过 Certbot 配置。
- 访问密码：已通过 Nginx Basic Auth 开启。
- 静态站点：Nginx 托管 `/var/www/ziwei`。
- Coding Plan 代理：Node 服务 `ziwei-codingplan-proxy.service`。
- 服务器密钥配置：`/etc/ziwei/codingplan.env`。
- 前端默认模型：`Coding Plan (OpenAI 兼容)` + `qwen3.6-plus`。
- 浏览器端默认不再要求填写 Coding Plan API Key。
- PC 端看盘界面：浅色高对比宫格，支持大限、流年、流月、流日。

## 服务器密钥配置

在服务器编辑：

```bash
sudo nano /etc/ziwei/codingplan.env
```

内容示例：

```bash
CODINGPLAN_API_KEY=请填你的真实 Key
CODINGPLAN_OPENAI_BASE=https://coding.dashscope.aliyuncs.com/v1
CODINGPLAN_ANTHROPIC_BASE=https://coding.dashscope.aliyuncs.com/apps/anthropic
CODINGPLAN_DEFAULT_MODEL=qwen3.6-plus
```

代理服务每次请求都会读取这个文件。修改 API Key 后，通常不需要重启服务。

## 日常发布

本地构建：

```bash
npm install
npm run build
```

上传 `dist/` 到服务器的 `/var/www/ziwei`，然后检查：

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status ziwei-codingplan-proxy.service
```

## 一期继续优化

- 看盘宫格继续压缩到更稳定的一屏显示。
- 三方四正连线继续做视觉校准。
- 增加更明确的模型错误提示：Key 缺失、模型不存在、额度不足、跨域失败。
- 增加 `.env.example`，说明本地代理和服务器代理配置。
- 增加 Docker 或一键部署脚本。
- 增加 Playwright 截图回归，防止 PC 盘面再次溢出。

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
- 后端：Node.js/NestJS、Hono、Fastify 或 Python/FastAPI。
- 数据库：PostgreSQL。
- 缓存与限流：Redis。
- 支付：微信支付、支付宝，或先人工充值。
- 鉴权：邮箱/手机号注册，JWT + Refresh Token。

## 二期核心表草案

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

## 对外开放前必须补齐

- 平台 API Key 只留在服务端。
- 调用前校验登录态、余额和频控。
- 每次扣费都写入额度流水。
- 保存必要调用日志，避免保存过多隐私内容。
- 增加用户协议、隐私政策和命理预测免责声明。
