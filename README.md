# QuizMaster - 智能刷题平台

基于 Next.js 15 + Supabase + Tailwind CSS 构建的现代刷题网站。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS + Glassmorphism 设计
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth (邮箱验证码 + Google OAuth)
- **状态管理**: Zustand
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

1. 前往 [Supabase](https://supabase.com) 创建新项目
2. 复制环境变量配置：

```bash
cp .env.local.example .env.local
```

3. 填入你的 Supabase 项目 URL 和 anon key：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 初始化数据库

在 Supabase SQL Editor 中执行 `supabase/schema.sql` 文件的内容，并依次执行 `supabase/migrations` 目录下的补丁（例如 `20260107_active_session_enforcement.sql`），以确保 `profiles.active_session_id` 字段和 Realtime 订阅都已经配置好。Realtime 必须开启，单设备登录守卫才能收到被踢下线通知。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 落地页
│   ├── login/             # 登录页
│   ├── subjects/          # 科目选择
│   ├── practice/          # 刷题界面
│   └── profile/           # 个人中心
├── components/
│   ├── ui/                # 通用 UI 组件
│   └── layout/            # 布局组件
├── lib/
│   └── supabase/          # Supabase 客户端配置
├── stores/                # Zustand 状态管理
└── types/                 # TypeScript 类型定义
```

## 功能特性

- 落地页（营销展示）
- 邮箱验证码登录 / Google OAuth
- 科目选择（筛选、搜索）
- 题型选择（知识点、难度、数量）
- 刷题界面（多题型支持）
- 个人中心（学习进度、错题本）

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 点击 Deploy

## 配置 Google OAuth（可选）

1. 在 Google Cloud Console 创建 OAuth 应用
2. 在 Supabase Dashboard > Authentication > Providers 启用 Google
3. 填入 Client ID 和 Client Secret
