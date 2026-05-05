# 紫微知道 App

这是紫微知道的前端应用和轻量服务端代理。当前版本以自用部署为目标，同时为后续开放注册、充值、额度和后台管理预留结构。

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS
- iztro 紫微斗数排盘
- Recharts / ECharts 可视化
- Coding Plan 服务端代理

## 功能

- 命盘解读：排盘、宫位信息、AI 批注。
- 运限叠盘：按目标日期切换大限、流年、流月、流日。
- 年度运势：结合流年趋势生成提醒。
- 人生 K 线：以阶段评分展示百岁起伏。
- 双人合盘：输入两人信息后生成关系分析。
- 分享卡片：生成适合传播的命格素材。
- 我的：承载模型设置与后续账号、充值、套餐、后台入口。

## 本地开发

```bash
npm install
npm run dev
```

默认访问：

```text
http://127.0.0.1:5173/
```

本地开发时，Vite 会把 `/api/codingplan/openai/` 和 `/api/codingplan/anthropic/` 代理到本机 Node 服务或远端配置，具体以 `vite.config.ts` 为准。

## 生产构建

```bash
npm run build
```

构建产物：

```text
dist/
```

## 服务器部署

当前推荐形态：

```text
Browser
  -> Nginx 静态站点
  -> /api/codingplan/*
  -> Node proxy
  -> Coding Plan API
```

服务器文件位置：

```text
/var/www/ziwei                     # 静态站点
/opt/ziwei/codingplan-proxy.mjs    # Node 代理
/etc/ziwei/codingplan.env          # API Key 配置
```

`/etc/ziwei/codingplan.env` 示例：

```bash
CODINGPLAN_API_KEY=请在服务器上填写
CODINGPLAN_OPENAI_BASE=https://coding.dashscope.aliyuncs.com/v1
CODINGPLAN_ANTHROPIC_BASE=https://coding.dashscope.aliyuncs.com/apps/anthropic
CODINGPLAN_DEFAULT_MODEL=qwen3.6-plus
```

代理服务会在每次请求时读取配置文件，修改 Key 后通常不需要重启服务。

## 模型配置

默认推荐：

- Provider: `Coding Plan (OpenAI 兼容)`
- Model: `qwen3.6-plus`
- API Key: 由服务器 `/etc/ziwei/codingplan.env` 提供

如果改用百炼按量、自定义 OpenAI 兼容服务或 Claude 兼容服务，可以在页面的「设置模型」里调整。只有非服务器托管模式才需要在浏览器填写 API Key。

## 安全边界

- 不要把真实 API Key 写入仓库。
- 自用阶段用 Nginx Basic Auth 控制访问。
- 对外开放前，需要增加用户登录、额度账本、频控、订单和调用日志。
- 命理预测服务需要补充用户协议与免责声明。
