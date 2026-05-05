# 紫微知道

紫微知道是一个面向自用部署和后续商业化扩展的紫微斗数 AI 工作台。当前版本已经从原始开源页面发展为独立项目：保留 iztro 的排盘能力，重新组织 PC 工作台、移动端布局、模型接入和服务器部署方式。

## 当前能力

- PC 高密度看盘界面：浅色宫格、清晰文字、三方四正标记与连线。
- 移动端自适应：手机访问自动切换顶部栏和底部导航。
- 运限叠盘：支持大限、流年、流月、流日切换。
- AI 服务：命盘解读、年度运势、人生 K 线、双人合盘、分享卡片。
- 模型接入：支持百炼按量、Coding Plan OpenAI 兼容、Coding Plan Claude 兼容，以及自定义兼容接口。
- 一期自用部署：服务器保存 Coding Plan API Key，浏览器无需手动输入平台密钥。
- 二期预留：账号体系、充值额度、服务套餐、运营后台可以继续扩展。

## 与原开源项目的差异

- 产品定位从“开源命盘工具”调整为“紫微知道 AI 命理工作台”。
- UI 从偏展示型页面改为 PC 优先的工作台，并保留手机端可用体验。
- 命盘区改成接近传统看盘习惯的浅色高对比宫格。
- 新增大限、流年、流月、流日运限叠盘入口。
- 新增 Coding Plan 服务端代理，避免在浏览器暴露核心 API Key。
- 增加“我的”入口，为后续账户、充值、额度和后台能力留位置。

## 本地开发

```bash
cd app
npm install
npm run dev
```

默认访问：

```text
http://127.0.0.1:5173/
```

## 生产构建

```bash
cd app
npm run build
```

构建产物位于：

```text
app/dist/
```

## 部署状态

当前线上自用版本部署在：

```text
https://ziwei.snowfish.love
```

当前部署形态：

- Nginx 托管静态文件：`/var/www/ziwei`
- Node 代理服务：`ziwei-codingplan-proxy.service`
- 代理配置文件：`/etc/ziwei/codingplan.env`
- API 路由：
  - `/api/codingplan/openai/`
  - `/api/codingplan/anthropic/`
- Nginx Basic Auth 已开启。
- HTTPS 已通过 Certbot 配置。

服务器上的 `CODINGPLAN_API_KEY` 只放在 `/etc/ziwei/codingplan.env`，不要提交到 GitHub。

## 目录结构

```text
app/
├── server/                 # Coding Plan 服务端代理
├── src/
│   ├── components/         # UI 与业务组件
│   ├── knowledge/          # 紫微知识库
│   ├── lib/                # 排盘、LLM、评分等封装
│   └── stores/             # 状态管理
├── DEPLOYMENT_TODO.md      # 部署记录与后续路线图
└── package.json
```

## 致谢

- [iztro](https://github.com/SylarLong/iztro) - 紫微斗数排盘能力
- [lifekline](https://github.com/AICryptoHK/lifekline) - 人生 K 线视觉参考
