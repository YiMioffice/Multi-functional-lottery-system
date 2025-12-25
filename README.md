# 多功能抽奖系统

一个功能强大的在线抽奖系统，支持转盘抽奖、用户管理、分享链接等功能。

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库
npx prisma generate
npx prisma migrate dev --name init
npm run seed

# 3. 启动开发服务器
npm run dev

# 4. 访问应用
# 浏览器打开 http://localhost:3000
# 使用默认管理员账户登录：admin@lottery.com / admin123456
```

## 📋 默认账户

系统提供以下默认账户供测试使用：

| 角色 | 邮箱 | 密码 | 说明 |
|------|------|------|------|
| 管理员 | `admin@lottery.com` | `admin123456` | 拥有所有权限 |
| 普通用户 | `user@lottery.com` | `user123456` | 仅能管理自己的转盘 |

⚠️ **重要**：生产环境请删除或修改默认账户密码！

## 功能特点

### 用户系统
- ✅ 用户注册和登录
- ✅ JWT 身份验证
- ✅ 用户角色管理（管理员/普通用户）

### 转盘抽奖
- ✅ 创建自定义转盘
- ✅ 支持均匀概率和加权概率两种模式
- ✅ 奖品支持上传图片
- ✅ 精美的转盘动画效果

### 分享功能
- ✅ 为每个转盘生成唯一分享码
- ✅ 通过分享链接让其他人参与抽奖
- ✅ 无需登录即可参与抽奖（只需输入姓名）

### 管理功能
- ✅ 转盘管理（创建、编辑、删除）
- ✅ 查看抽奖记录
- ✅ 查看参与人员和中奖情况
- ✅ 数据统计

## 技术栈

- **前端框架**: Next.js 14 (React)
- **样式**: Tailwind CSS
- **数据库**: SQLite (Prisma ORM)
- **身份验证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **文件上传**: 本地文件系统

## 项目结构

```
multi-functional-lottery-system/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── auth/               # 登录注册页面
│   ├── dashboard/          # 管理面板
│   ├── share/              # 分享抽奖页面
│   └── api/                # API 路由
│       ├── auth/           # 认证API
│       ├── wheels/         # 转盘管理API
│       ├── share/          # 分享API
│       ├── draw-records/   # 抽奖记录API
│       └── upload/         # 文件上传API
├── lib/
│   ├── prisma.ts           # Prisma 客户端
│   ├── auth.ts             # 认证工具
│   ├── api.ts              # API 请求封装
│   ├── storage.ts          # localStorage 工具
│   └── lottery-utils.ts    # 抽奖算法
├── prisma/
│   └── schema.prisma       # 数据库模型
├── public/
│   └── uploads/            # 上传的图片
└── ...
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

可以修改 `.env` 中的配置：

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. 初始化数据库

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

数据库初始化后，系统会自动创建以下默认账户：

**默认管理员账户：**
- 邮箱：`admin@lottery.com`
- 密码：`admin123456`
- 角色：管理员

**测试用户账户：**
- 邮箱：`user@lottery.com`
- 密码：`user123456`
- 角色：普通用户

⚠️ **安全提示**：首次登录后请立即修改默认密码！

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

## 使用指南

### 创建转盘

1. 注册/登录账号
2. 进入管理面板
3. 点击"创建新转盘"
4. 填写转盘名称、描述
5. 添加奖品并设置权重（可上传图片）
6. 选择概率模式（均匀/加权）
7. 创建完成

### 分享转盘

1. 在管理面板找到要分享的转盘
2. 点击"分享"按钮复制分享链接
3. 将链接发送给其他人
4. 其他人打开链接后输入姓名即可参与抽奖

### 查看抽奖记录

1. 在管理面板点击转盘的"查看详情"
2. 可以看到：
   - 所有奖品配置
   - 抽奖记录列表
   - 参与人数统计
   - 中奖情况统计

## API 接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 转盘管理
- `GET /api/wheels` - 获取用户的所有转盘
- `POST /api/wheels` - 创建新转盘
- `GET /api/wheels/[id]` - 获取转盘详情
- `PUT /api/wheels/[id]` - 更新转盘
- `DELETE /api/wheels/[id]` - 删除转盘

### 分享和抽奖
- `GET /api/share/[shareCode]` - 通过分享码获取转盘
- `POST /api/draw-records` - 创建抽奖记录
- `GET /api/draw-records?wheelId=xxx` - 获取转盘的抽奖记录

### 文件上传
- `POST /api/upload` - 上传图片

## 数据库模型

### User（用户）
- id: 用户ID
- email: 邮箱（唯一）
- username: 用户名
- password: 密码（加密）
- role: 角色（admin/user）

### Wheel（转盘）
- id: 转盘ID
- name: 转盘名称
- description: 描述
- isUniform: 是否均匀概率
- shareCode: 分享码（唯一）
- userId: 创建者ID

### Prize（奖品）
- id: 奖品ID
- name: 奖品名称
- weight: 权重
- imageUrl: 图片URL
- order: 排序
- wheelId: 所属转盘ID

### DrawRecord（抽奖记录）
- id: 记录ID
- participantName: 参与者姓名
- wheelId: 转盘ID
- prizeId: 中奖奖品ID
- createdAt: 抽奖时间

## 部署

### 构建生产版本

```bash
npm run build
npm start
```

### 注意事项

1. 生产环境请务必修改 `JWT_SECRET`
2. 建议使用 PostgreSQL 或 MySQL 替代 SQLite
3. 图片上传建议使用云存储服务（如 AWS S3、阿里云 OSS）
4. 设置适当的文件上传大小限制

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
