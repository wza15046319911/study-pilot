针对 **Next.js + Supabase** (无独立后端) 的架构，我们不能使用 Redis 中间件方案。最优雅、符合 Supabase 生态的解法是利用 **Postgres 数据库存储状态** 配合 **Supabase Realtime (实时订阅)**。

### 核心思路：逻辑作废法

1. **数据库标记**：在 `profiles` 表（或用户表）中增加一个字段 `last_session_id`。
2. **登录动作**：用户每次登录成功后，生成一个随机 UUID，更新到数据库的 `last_session_id`。
3. **当前客户端**：将这个 UUID 保存在本地（内存/State）。
4. **监听被踢**：前端使用 Supabase Realtime 订阅 `profiles` 表。如果发现数据库里的 `last_session_id` 变了，说明有人在别处登录了，立刻执行登出操作。

---

### 具体实现步骤

#### 1. 数据库准备 (Supabase Dashboard / SQL)

假设你已经有一个与 `auth.users` 关联的 `public.profiles` 表。我们需要加一个字段。

```sql
-- 1. 添加当前活跃 Session 的标识字段
ALTER TABLE public.profiles 
ADD COLUMN active_session_id UUID;

-- 2. 开启该表的 Realtime 功能 (必须开启，否则前端收不到通知)
alter publication supabase_realtime add table profiles;

```

#### 2. 登录后的处理 (Next.js)

在用户登录成功后（调用 `signInWithPassword` 或 `signInWithOtp` 之后），你需要生成一个新的 ID 并更新到数据库。

```typescript
// utils/auth-helpers.ts 或你的登录组件中
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/client';

export const handlePostLogin = async (userId: string) => {
  const supabase = createClient();
  const newSessionId = uuidv4();

  // 1. 更新数据库中的 session ID
  const { error } = await supabase
    .from('profiles')
    .update({ active_session_id: newSessionId })
    .eq('id', userId);

  if (error) {
    console.error('更新Session状态失败', error);
    return;
  }

  // 2. 将这个 ID 存入 localStorage 或全局 State (用于跟数据库对比)
  // 注意：这个 ID 仅用于判断“我是不是最新的”，不要用于鉴权
  if (typeof window !== 'undefined') {
    localStorage.setItem('my_device_session_id', newSessionId);
  }
  
  return newSessionId;
};

```

#### 3. 全局监听组件 (Client Component)

在 Next.js 的根布局 (`layout.tsx`) 或顶层 Provider 中，放置一个监听组件。这个组件负责监听“我是否被踢了”。

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function SessionGuard() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // 获取当前用户
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 获取本地保存的 Session ID (这是登录时存进去的)
      const mySessionId = localStorage.getItem('my_device_session_id');

      // 订阅 profiles 表的变化
      const channel = supabase
        .channel('kick-out-listener')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`, // 只监听当前用户的变化
          },
          (payload) => {
            const newActiveSessionId = payload.new.active_session_id;

            // 核心逻辑：如果数据库里的 ID 变了，且不等于我手里的 ID
            if (newActiveSessionId && newActiveSessionId !== mySessionId) {
              
              console.warn('检测到在其他设备登录，正在下线...');
              
              // 1. 强制登出 Supabase
              supabase.auth.signOut().then(() => {
                // 2. 清除本地存的 ID
                localStorage.removeItem('my_device_session_id');
                
                // 3. UI 提示 (可以使用 Toast 或 Alert)
                alert('您的账号已在其他设备登录，当前设备被迫下线。');
                
                // 4. 跳转回登录页
                router.replace('/login');
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkUser();
  }, [router, supabase]);

  return null; // 这个组件不需要渲染任何 UI
}

```

#### 4. 将监听组件放入 Layout

打开 `app/layout.tsx`:

```tsx
import SessionGuard from './components/SessionGuard'; 

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionGuard /> {/* 放在这里 */}
        {children}
      </body>
    </html>
  );
}

```