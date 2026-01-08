# StudyPilot - AI驱动的考试练习平台

## 项目概述

**StudyPilot** 是一个面向大学生（特别是昆士兰大学学生）的智能化考试练习平台。通过融合间隔重复算法、AI辅导、游戏化机制和全面的学习分析，为学生提供高效的备考体验。

## 核心特性

### 📚 多模式学习系统
- **练习模式**: 传统问答练习，支持AI讲解和错题记录
- **闪卡模式**: 基于SM-2算法的间隔重复系统（SRS）
- **沉浸模式**: 全屏无干扰专注练习
- **考试模式**: 计时模拟考试，支持期中/期末真题

### 🤖 AI智能辅导
- 集成智谱AI（ZhipuAI）的glm-4-flash模型
- 按需生成题目详解，支持中英文自适应
- 1小时缓存机制，优化响应速度
- 自动填充数据库空白讲解

### 📊 全方位学习分析
- 科目和主题双层进度跟踪
- 按难度分类的正确率统计
- 每日练习趋势图表（基于Recharts）
- 雷达图多维能力评估
- 单题用时跟踪

### 🎯 间隔重复系统（SRS）
- 完整实现SM-2算法
- 四级评分系统（再次/困难/良好/简单）
- 动态调整复习间隔（ease factor: 1.3-∞）
- 预览下次复习时间
- 独立的闪卡复习记录表

### 🚀 病毒式增长机制
- 独特的双向解锁推荐系统
  - 用户A邀请用户B
  - A使用推荐解锁高级题库时，B自动获得相同题库
- 个性化邀请码生成
- 推荐数据统计仪表盘

### 💰 灵活的内容变现
- 免费基础题目
- VIP订阅（通过Stripe支付）
- 推荐解锁（病毒式增长）
- 单题库购买

### 🔐 单设备登录强制
- 基于Supabase Realtime的实时会话监控
- 检测到异地登录立即强制退出
- localStorage + 数据库双重验证
- 优雅处理并发登录

### 📅 学术日历集成
- 整合昆士兰大学、澳洲昆州、中国节假日
- 分层过滤（可选择显示哪些日历）
- Webcal订阅支持（可导入日历应用）
- 事件优先级可视化

### 🎨 现代化用户界面
- 毛玻璃拟态设计（Glassmorphism）
- Framer Motion流畅动画
- Lenis平滑滚动
- 暗黑/明亮主题切换
- 响应式布局

### 🌐 国际化支持
- 中英文双语切换
- next-intl服务端消息加载
- Cookie持久化语言偏好
- 动态路由本地化

## 技术架构

### 前端技术栈
- **框架**: Next.js 16.1.1 (App Router)
- **语言**: TypeScript 5.9.3
- **UI**: React 19.2.3
- **样式**: Tailwind CSS 4
- **动画**: Framer Motion
- **图标**: Lucide React
- **状态管理**: Zustand（仅用于练习会话）
- **表单验证**: Zod
- **图表**: Recharts
- **日历**: React Big Calendar
- **代码编辑**: Monaco Editor
- **数学渲染**: KaTeX (LaTeX支持)
- **PDF导出**: @react-pdf/renderer, jsPDF

### 后端技术栈
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth (邮箱OTP + Google OAuth)
- **实时通信**: Supabase Realtime
- **缓存/限流**: Redis (滑动窗口算法)
- **支付**: Stripe (Checkout + Webhooks)
- **AI**: 智谱AI (ZhipuAI API)
- **安全**: 行级安全策略（RLS）

### 核心架构模式
- **服务端组件优先**: 默认使用React Server Components
- **Server Actions**: 替代传统API路由处理数据变更
- **边缘计算就绪**: 支持Vercel Edge Runtime
- **类型安全**: Supabase自动生成TypeScript类型
- **速率限制**: Redis分布式限流（严格/标准/宽松预设）

## 数据库设计

### 核心表结构
```sql
-- 用户系统
profiles (扩展用户信息: 等级, 连续天数, VIP状态, 活跃会话ID)

-- 内容组织
subjects (科目: STEM/Humanities分类)
topics (主题: 科目内知识点细分)
questions (题目: 6种题型支持)
question_banks (题库: 带解锁机制)
exams (考试: 结构化试卷)

-- 用户数据
user_answers (答题历史: 带模式跟踪)
mistakes (错题: 错误计数和时间戳)
bookmarks (收藏题目)
user_progress (科目进度)
topic_progress (主题掌握度)
flashcard_reviews (闪卡复习: SRS元数据)

-- 社交与增长
referral_codes (推荐码)
referrals (推荐关系)
user_bank_unlocks (题库解锁记录)
shared_mistakes (分享的错题集)

-- 反馈与支付
question_feedback (题目反馈: 错误/太难/重复)
payments (Stripe交易记录)
```

### 关键设计特性
- ✅ 全表行级安全策略（RLS）
- ✅ UUID + slug双重标识
- ✅ JSONB灵活数据存储
- ✅ 级联删除保证数据完整性
- ✅ Realtime发布（profiles表）

## 题型支持

支持6种题目类型：
1. **单选题** (single_choice): 经典选择题
2. **多选题** (multiple_choice): 多个正确答案
3. **填空题** (fill_blank): 文本输入
4. **代码输出题** (code_output): 预测代码运行结果（含语法高亮）
5. **手写题** (handwrite): 画布手写输入（perfect-freehand库）
6. **判断题** (true_false): 对错判断

所有题型均支持：
- LaTeX数学公式渲染
- Markdown格式化
- 代码语法高亮
- 图片资源引用

## 项目结构

```
study-pilot/
├── src/
│   ├── app/                    # Next.js App Router页面
│   │   ├── admin/             # 管理面板（受保护路由）
│   │   ├── library/           # 科目浏览与选择
│   │   ├── practice/          # 练习会话页面
│   │   ├── profile/           # 用户仪表盘
│   │   ├── calendar/          # 学术日历
│   │   ├── payment/           # 支付页面
│   │   └── api/               # API路由（Stripe/Calendar）
│   ├── components/
│   │   ├── ui/                # 可复用UI组件
│   │   ├── layout/            # 布局组件
│   │   ├── auth/              # 会话守卫
│   │   └── [功能组件]
│   ├── lib/
│   │   ├── supabase/          # Supabase客户端
│   │   ├── actions/           # Server Actions
│   │   ├── ai/                # AI提供商抽象
│   │   ├── srs.ts             # SM-2算法实现
│   │   ├── rateLimit.ts       # Redis限流
│   │   └── stripe.ts          # 支付逻辑
│   ├── stores/                # Zustand状态管理
│   ├── types/                 # TypeScript类型定义
│   └── messages/              # i18n翻译文件
├── supabase/
│   ├── schema.sql             # 数据库主模式
│   └── migrations/            # 迁移文件
├── public/                    # 静态资源
└── middleware.ts              # 认证与路由中间件
```

## 安全机制

### 多层安全防护
1. **数据库层**: 全表RLS策略，用户只能访问自己的数据
2. **中间件层**: 路由级别的认证检查
3. **应用层**: Server Actions输入验证（Zod schemas）
4. **网络层**: Redis分布式限流

### 会话管理
- 30天Session Cookie（secure + sameSite）
- 单设备登录强制（active_session_id）
- Realtime订阅监控会话变化
- 检测到异常立即退出登录

### 速率限制
```typescript
严格模式: 5次/分钟   (支付、反馈提交)
标准模式: 30次/分钟  (答题记录、进度更新)
宽松模式: 100次/分钟 (内容获取)
认证模式: 10次/15分钟 (登录、注册)
```

### 支付安全
- Stripe Webhook签名验证
- 幂等性处理（防止重复支付）
- 服务端订单验证

## 性能优化

### 渲染策略
- Server Components默认
- 客户端组件仅在必要时使用
- 动态导入延迟加载
- 静态生成（静态页面）

### 数据缓存
- AI响应unstable_cache（1小时）
- Next.js自动数据缓存
- CDN友好的资源结构

### 数据库优化
- 索引优化（subjects.slug, questions.subject_id等）
- JSONB查询优化
- 连接池管理（Supabase）

## SEO优化

- 完整的元数据配置
- JSON-LD结构化数据（Website/Organization/SoftwareApplication/FAQ）
- 多语言hreflang标签
- Open Graph + Twitter Cards
- Google Search Console验证
- 动态sitemap生成

## 开发指南

### 环境要求
- Node.js 18+
- pnpm（推荐）或 npm
- Supabase项目（数据库+认证）
- Redis实例（限流）
- Stripe账号（支付）
- ZhipuAI API密钥（AI功能）

### 环境变量
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# AI
ZHIPU_API_KEY=

# Admin
ADMIN_EMAIL=
```

### 本地开发
```bash
# 安装依赖
pnpm install

# 运行开发服务器
pnpm dev

# 类型检查
pnpm type-check

# 构建生产版本
pnpm build
```

### 数据库迁移
```bash
# 应用迁移
npx supabase migration up

# 生成TypeScript类型
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

## 部署

### Vercel部署（推荐）
1. 连接GitHub仓库
2. 配置环境变量
3. 自动部署main分支

### 注意事项
- 配置Stripe Webhook端点
- 设置Supabase重定向URL
- 启用Redis持久化（生产环境）

## 路线图

### 已完成功能
- ✅ 完整的题目练习系统
- ✅ 间隔重复算法
- ✅ AI讲解集成
- ✅ 推荐系统
- ✅ 支付集成
- ✅ 学术日历
- ✅ 单设备登录
- ✅ 国际化

### 计划功能
- 🔲 移动端App（React Native）
- 🔲 协作学习（学习小组）
- 🔲 实时对战模式
- 🔲 AI生成练习题
- 🔲 语音朗读题目
- 🔲 OCR扫描题目录入

## 技术亮点

### 1. 创新的推荐机制
双向解锁设计实现病毒式增长，区别于传统单向激励模型。

### 2. 企业级会话管理
基于Supabase Realtime的实时会话失效，无需轮询，资源消耗低。

### 3. 灵活的AI提供商抽象
```typescript
interface AIProvider {
  generateExplanation(question: Question): Promise<string>
}
```
可轻松切换至OpenAI/Claude等其他模型。

### 4. 科学的学习算法
完整实现SM-2算法，ease factor动态调整，优化长期记忆效果。

### 5. 类型安全的全栈开发
Supabase自动生成数据库类型，Server Actions + Zod验证，端到端类型安全。

## 贡献指南

欢迎提交Issue和Pull Request！

### 代码规范
- TypeScript严格模式
- ESLint + Prettier
- 提交前运行类型检查
- 遵循现有代码风格

### Commit规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/配置更新
```

## 许可证

本项目采用MIT许可证。

## 联系方式

- GitHub Issues: [项目问题跟踪](https://github.com/your-repo/study-pilot/issues)
- Email: support@studypilot.com（示例）

---

**StudyPilot** - 让备考更高效，让学习更科学 🚀
