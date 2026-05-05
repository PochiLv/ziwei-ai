# 紫微知道

紫微斗数 AI 命理工作台。第一期目标是自用部署：保留现有排盘、命盘解读、年度运势、人生 K 线、双人合盘、分享卡片等功能，通过浏览器配置模型 API Key 后即可在服务器网址访问。

## 当前版本

- React 19 + TypeScript + Vite
- PC 端工作台布局：左侧导航、顶部状态栏、右侧内容区滚动
- 移动端自适应：顶部品牌栏、底部功能导航
- 命盘区支持按目标日期切换大限、流年、流月、流日叠盘
- 盘面改为浅色高对比布局，优先保证看盘信息密度和可读性
- 内置百炼按量 API 与 Coding Plan 的 OpenAI / Claude 兼容配置
- API Key 仅保存在当前浏览器本地，适合第一期自用

## 本地开发

```bash
npm install
npm run dev
```

默认访问：

```text
http://127.0.0.1:5173/
```

## 生产构建

```bash
npm run build
```

构建产物位于：

```text
dist/
```

可以用任意静态网站服务器部署 `dist` 目录。

## 推荐部署方式

### Nginx

```nginx
server {
  listen 80;
  server_name your-domain.com;

  root /var/www/ziwei/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/codingplan/openai/ {
    proxy_pass https://coding.dashscope.aliyuncs.com/v1/;
    proxy_ssl_server_name on;
    proxy_set_header Host coding.dashscope.aliyuncs.com;
    proxy_set_header Authorization $http_authorization;
    proxy_set_header Content-Type $content_type;
  }

  location /api/codingplan/anthropic/ {
    proxy_pass https://coding.dashscope.aliyuncs.com/apps/anthropic/;
    proxy_ssl_server_name on;
    proxy_set_header Host coding.dashscope.aliyuncs.com;
    proxy_set_header x-api-key $http_x_api_key;
    proxy_set_header anthropic-version $http_anthropic_version;
    proxy_set_header Content-Type $content_type;
  }
}
```

部署步骤：

```bash
npm install
npm run build
sudo mkdir -p /var/www/ziwei
sudo cp -r dist /var/www/ziwei/
sudo nginx -t
sudo systemctl reload nginx
```

### Docker 可选方案

后续如果你希望 Docker 部署，可以新增 `Dockerfile`，用 Node 构建后交给 Nginx 镜像托管静态文件。

## 模型配置

进入页面后点击「设置模型」，选择：

- `百炼按量 (OpenAI 兼容)`
- `百炼按量 (Claude 兼容)`
- `Coding Plan (OpenAI 兼容)`
- `Coding Plan (Claude 兼容)`
- 或其他兼容服务

百炼按量默认端点已内置：

```text
OpenAI 兼容: https://dashscope.aliyuncs.com/compatible-mode/v1
Claude 兼容: https://dashscope.aliyuncs.com/apps/anthropic/v1
```

Coding Plan 默认端点也已保留：

```text
OpenAI 兼容: https://coding.dashscope.aliyuncs.com/v1
Claude 兼容: https://coding.dashscope.aliyuncs.com/apps/anthropic
默认模型: qwen3.6-plus
```

如果你的百炼后台展示了不同模型名或不同 endpoint，可在「高级设置」里覆盖 `BaseURL` 和 `Model`。对外网站建议优先使用百炼按量 API，Coding Plan 是否适合你的业务场景需要按阿里云套餐规则再确认。

## 安全说明

第一期是自用版本，API Key 保存在浏览器 `localStorage`，不会提交到仓库，也不会上传到你自己的服务器。但如果未来提供给外部用户使用，不能继续让前端直连模型平台。

对外开放时应改成：

- 用户只访问你的网站
- 你的后端保存平台 API Key
- 前端调用你的后端接口
- 后端校验登录、额度、频控，再代理调用大模型

## 后续 TODO

详见 [DEPLOYMENT_TODO.md](./DEPLOYMENT_TODO.md)。
