# Netlify 部署指南

## 部署前准备

### 1. 环境变量配置

在 Netlify 控制台中设置以下环境变量：

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_NAME=Portfolio Showcase Platform
```

### 2. Supabase 项目配置

确保 Supabase 项目已正确配置：
- 数据库表已创建
- RLS 策略已设置
- Storage bucket 已配置
- 认证设置已完成

## 部署步骤

### 方法一：通过 Git 连接自动部署

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 Netlify 控制台中连接仓库
3. 选择分支（通常是 `main` 或 `master`）
4. 构建设置会自动从 `netlify.toml` 读取
5. 设置环境变量
6. 点击 "Deploy site"

### 方法二：手动部署

1. 本地构建项目：
   ```bash
   npm run build
   ```

2. 将 `dist` 文件夹拖拽到 Netlify 控制台

### 方法三：使用 Netlify CLI

1. 安装 Netlify CLI：
   ```bash
   npm install -g netlify-cli
   ```

2. 登录 Netlify：
   ```bash
   netlify login
   ```

3. 在项目根目录初始化：
   ```bash
   netlify init
   ```

4. 部署：
   ```bash
   netlify deploy --prod
   ```

## 部署后配置

### 1. 自定义域名（可选）

1. 在 Netlify 控制台中进入 "Domain settings"
2. 点击 "Add custom domain"
3. 输入域名并验证
4. 配置 DNS 记录指向 Netlify

### 2. HTTPS 配置

Netlify 会自动为所有站点启用 HTTPS，包括自定义域名。

### 3. 表单处理配置

如果使用联系表单：
1. 在 HTML 表单中添加 `netlify` 属性
2. 或使用 Netlify Functions 处理表单提交

### 4. 分析和监控

1. 启用 Netlify Analytics（付费功能）
2. 集成 Google Analytics
3. 配置错误监控

## 环境配置

### 生产环境
- 自动从 `main` 分支部署
- 使用生产环境变量
- 启用所有安全头

### 预览环境
- 从 Pull Request 自动创建
- 使用预览环境变量
- 便于测试新功能

### 开发环境
- 从开发分支部署
- 使用开发环境变量
- 用于内部测试

## 性能优化

### 1. 构建优化
- 启用 CSS 和 JS 压缩
- 启用图片压缩
- 配置缓存策略

### 2. CDN 配置
- Netlify 自动提供全球 CDN
- 静态资源自动缓存
- 支持 HTTP/2

### 3. 预渲染（可选）
对于 SEO 要求高的页面，可以考虑：
- 使用 Netlify 的预渲染功能
- 或集成 Next.js/Nuxt.js 等 SSR 框架

## 安全配置

### 1. 安全头
`netlify.toml` 中已配置以下安全头：
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security

### 2. 访问控制
- 配置 IP 白名单（如需要）
- 设置密码保护（开发环境）
- 配置 OAuth 认证（企业功能）

## 监控和维护

### 1. 部署状态监控
- 查看部署日志
- 设置部署失败通知
- 监控构建时间

### 2. 性能监控
- 使用 Lighthouse 插件
- 监控 Core Web Vitals
- 设置性能预算

### 3. 错误监控
- 集成 Sentry 或其他错误监控服务
- 配置错误通知
- 定期检查错误日志

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本
   - 验证依赖项安装
   - 查看构建日志

2. **环境变量问题**
   - 确认变量名正确
   - 检查变量值格式
   - 重新部署以应用更改

3. **路由问题**
   - 确认 `_redirects` 文件或 `netlify.toml` 重定向规则
   - 检查 React Router 配置

4. **API 连接问题**
   - 验证 Supabase URL 和密钥
   - 检查 CORS 设置
   - 确认网络连接

### 调试技巧

1. 使用 Netlify Dev 本地测试：
   ```bash
   netlify dev
   ```

2. 查看部署日志：
   ```bash
   netlify logs
   ```

3. 测试函数：
   ```bash
   netlify functions:invoke contact
   ```

## 备份和恢复

### 1. 代码备份
- 使用 Git 版本控制
- 定期推送到远程仓库
- 创建发布标签

### 2. 数据库备份
- 使用 Supabase 的备份功能
- 定期导出数据
- 测试恢复流程

### 3. 配置备份
- 导出 Netlify 站点配置
- 备份环境变量
- 记录自定义设置

## 成本优化

### 1. 带宽优化
- 启用图片压缩
- 使用适当的缓存策略
- 优化资源大小

### 2. 构建时间优化
- 使用增量构建
- 优化依赖项
- 并行化构建步骤

### 3. 功能使用
- 监控 Functions 使用量
- 优化表单提交处理
- 合理使用分析功能