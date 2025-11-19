# 设计文档

## 项目概述

个人作品展示平台是一个现代化的全栈 Web 应用，采用 React + Vite 作为前端框架，Supabase 作为后端即服务(BaaS)解决方案，通过 Netlify 进行部署。该平台为创作者提供作品展示、用户互动和内容管理功能。

## 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: React Context + useReducer
- **UI 组件库**: Tailwind CSS + Headless UI
- **表单处理**: React Hook Form + Zod 验证
- **HTTP 客户端**: Supabase JavaScript SDK
- **部署平台**: Netlify

### 后端服务 (Supabase)
- **数据库**: PostgreSQL
- **认证**: Supabase Auth (支持邮箱/密码登录)
- **存储**: Supabase Storage (用于图片文件)
- **实时功能**: Supabase Realtime (用于评论和点赞实时更新)
- **API**: 自动生成的 REST API

## 数据库设计

### 1. profiles 表 (用户资料)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. portfolios 表 (作品)
```sql
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. interactions 表 (点赞和评论)
```sql
CREATE TABLE interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment')),
  content TEXT, -- 仅评论类型使用
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保用户对同一作品只能点赞一次
  UNIQUE(portfolio_id, user_id, type) WHERE type = 'like'
);
```

## 组件架构

### 页面组件
```
src/
├── pages/
│   ├── HomePage.tsx          # 首页 - 作品浏览
│   ├── PortfolioDetailPage.tsx # 作品详情页
│   ├── ProfilePage.tsx       # 个人资料页
│   ├── LoginPage.tsx         # 登录页
│   └── RegisterPage.tsx      # 注册页
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # 导航栏
│   │   ├── Footer.tsx        # 页脚
│   │   └── Layout.tsx        # 布局容器
│   ├── portfolio/
│   │   ├── PortfolioCard.tsx # 作品卡片
│   │   ├── PortfolioGrid.tsx # 作品网格
│   │   ├── PortfolioForm.tsx # 作品表单
│   │   └── PortfolioDetail.tsx # 作品详情
│   ├── user/
│   │   ├── UserProfile.tsx   # 用户资料组件
│   │   ├── AuthForm.tsx      # 认证表单
│   │   └── Avatar.tsx        # 头像组件
│   └── common/
│       ├── SearchBar.tsx     # 搜索栏
│       ├── CategoryFilter.tsx # 分类筛选
│       ├── LoadingSpinner.tsx # 加载指示器
│       └── ErrorMessage.tsx  # 错误提示
```

### 状态管理设计
```typescript
// 全局状态接口
interface AppState {
  user: User | null;
  portfolios: Portfolio[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    searchTerm: string;
  };
}

// Context 提供者
const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
}>();
```

## 接口设计

### Supabase 数据服务
```typescript
class SupabaseService {
  // 认证相关
  async signUp(email: string, password: string): Promise<AuthResponse>
  async signIn(email: string, password: string): Promise<AuthResponse>
  async signOut(): Promise<void>
  async getCurrentUser(): Promise<User | null>
  
  // 用户资料
  async getProfile(userId: string): Promise<Profile>
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>
  async uploadAvatar(userId: string, file: File): Promise<string>
  
  // 作品管理
  async getPortfolios(filters?: PortfolioFilters): Promise<Portfolio[]>
  async getPortfolio(id: string): Promise<Portfolio>
  async createPortfolio(portfolio: CreatePortfolioData): Promise<Portfolio>
  async updatePortfolio(id: string, updates: Partial<Portfolio>): Promise<Portfolio>
  async deletePortfolio(id: string): Promise<void>
  async uploadPortfolioImage(file: File): Promise<string>
  
  // 互动功能
  async toggleLike(portfolioId: string, userId: string): Promise<boolean>
  async addComment(portfolioId: string, userId: string, content: string): Promise<Comment>
  async getComments(portfolioId: string): Promise<Comment[]>
  async deleteComment(commentId: string): Promise<void>
}
```

## 用户界面设计

### 响应式布局
- **桌面端 (≥1024px)**: 3-4 列网格布局，侧边栏导航
- **平板端 (768px-1023px)**: 2-3 列网格布局，顶部导航
- **移动端 (<768px)**: 单列布局，汉堡菜单

### 设计系统
```css
/* 主色调 */
:root {
  --primary-color: #3B82F6;    /* 蓝色 */
  --secondary-color: #10B981;  /* 绿色 */
  --accent-color: #F59E0B;     /* 橙色 */
  --neutral-gray: #6B7280;     /* 灰色 */
  --background: #F9FAFB;       /* 浅灰背景 */
  --surface: #FFFFFF;          /* 白色表面 */
}

/* 字体层级 */
.text-h1 { font-size: 2.5rem; font-weight: 700; }
.text-h2 { font-size: 2rem; font-weight: 600; }
.text-h3 { font-size: 1.5rem; font-weight: 600; }
.text-body { font-size: 1rem; font-weight: 400; }
.text-caption { font-size: 0.875rem; font-weight: 400; }
```

## 错误处理策略

### 前端错误处理
1. **网络错误**: 显示重试按钮和友好提示
2. **认证错误**: 自动跳转到登录页面
3. **表单验证错误**: 实时显示字段级错误信息
4. **文件上传错误**: 显示进度条和错误状态

### 后端错误处理
1. **数据库约束错误**: 返回具体的验证错误信息
2. **权限错误**: 返回 403 状态码和权限提示
3. **资源不存在**: 返回 404 状态码和友好提示
4. **服务器错误**: 记录日志并返回通用错误信息

## 性能优化

### 前端优化
- **代码分割**: 使用 React.lazy() 进行路由级代码分割
- **图片优化**: 使用 WebP 格式，实现懒加载
- **缓存策略**: 利用 React Query 进行数据缓存
- **Bundle 优化**: 使用 Vite 的 Tree Shaking 和压缩

### 后端优化
- **数据库索引**: 为常用查询字段添加索引
- **图片存储**: 使用 Supabase Storage 的 CDN 加速
- **实时订阅**: 仅在需要时启用 Realtime 功能
- **查询优化**: 使用 Supabase 的 RLS (Row Level Security)

## 测试策略

### 单元测试
- **组件测试**: 使用 React Testing Library
- **工具函数测试**: 使用 Vitest
- **API 服务测试**: Mock Supabase 客户端

### 集成测试
- **端到端测试**: 使用 Playwright 测试关键用户流程
- **API 集成测试**: 测试与 Supabase 的数据交互

### 测试覆盖率目标
- 组件测试覆盖率: ≥80%
- 工具函数测试覆盖率: ≥90%
- 关键用户流程 E2E 测试: 100%

## 部署配置

### Netlify 部署设置
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_SUPABASE_URL = "your-supabase-url"
  VITE_SUPABASE_ANON_KEY = "your-supabase-anon-key"
```

### 环境变量配置
```env
# .env.local
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_NAME=Portfolio Showcase Platform
```

## 安全考虑

### 认证安全
- 使用 Supabase Auth 的内置安全功能
- 实现 Row Level Security (RLS) 策略
- 设置适当的 CORS 策略

### 数据安全
- 敏感数据加密存储
- 文件上传类型和大小限制
- SQL 注入防护 (Supabase 内置)

### 前端安全
- XSS 防护 (React 内置)
- CSRF 防护通过 SameSite cookies
- 敏感信息不在前端存储