# Ghibli Art Generator MVP

一个将用户照片转换为 Studio Ghibli 风格插画的 AI 图像生成器 MVP。

## 功能特性

- 🎨 **AI 图像生成**: 使用 OpenAI GPT-4 Vision + DALL-E 3 将用户照片转换为 Ghibli 风格插画
- 🔐 **Google 登录**: 集成 NextAuth.js 和 Google OAuth 2.0
- 💳 **Stripe 支付**: 月度订阅模式，支持 Stripe Checkout
- 👤 **用户面板**: 显示用户信息和订阅状态
- 🆓 **试用系统**: 未登录用户可免费试用一次
- 📱 **响应式设计**: 使用 TailwindCSS，支持移动端

## 技术栈

- **前端**: Next.js 15, React, TailwindCSS
- **认证**: NextAuth.js, Google OAuth
- **支付**: Stripe Checkout
- **AI**: OpenAI GPT-4 Vision, DALL-E 3
- **部署**: Vercel (推荐)

## 环境变量

创建 `.env.local` 文件：

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

## 项目结构

```
src/
├── app/
│   ├── api/           # API 路由
│   ├── checkout/      # 支付页面
│   ├── dashboard/     # 用户面板
│   ├── error/         # 错误页面
│   ├── login/         # 登录页面
│   └── page.tsx       # 首页
├── components/        # React 组件
└── lib/              # 工具函数
```

## 功能流程

1. 用户访问首页
2. 上传图片
3. 系统检查试用/订阅状态
4. 使用 GPT-4 Vision 分析图片
5. 使用 DALL-E 3 生成 Ghibli 风格图片
6. 用户下载生成的图片

## 注意事项

- 确保 OpenAI API 有足够额度
- Stripe 需要在测试模式下配置
- 图片大小限制 5MB
- 支持 JPG, PNG, WebP 格式