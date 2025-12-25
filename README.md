# 多功能抽奖系统

基于 Next.js 14+ 开发的轻量化多功能抽奖系统，界面简洁，操作简单。

## 功能特性

### 1. 转盘抽奖
- 支持均匀转盘（所有奖项概率均等）
- 支持不均匀转盘（自定义每个奖项的权重占比）
- 可手动配置奖项名称、权重、奖品名称
- 动态转盘动画，展示中奖结果
- 抽奖历史记录

### 2. 暗箱抽奖
- 盲抽模式，自定义奖池列表和概率
- 支持 "单次抽取" 和 "5 次连抽" 两种模式
- 均匀或不均匀概率配置
- 抽奖历史记录

### 3. 数字抽奖
- 输入开奖范围（如 1-100）
- 随机生成中奖数字
- 动画效果增强体验
- 历史记录和统计分析

### 4. 名单抽奖
- 支持上传纯文本 / CSV 格式的名单列表
- 手动添加/删除参与人
- 自定义抽取数量
- 中奖名单展示

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **UI**: React 18 + Tailwind CSS
- **语言**: TypeScript
- **数据存储**: localStorage（前端本地存储）
- **路由**: App Router (app/ 目录)

## 项目结构

```
multi-functional-lottery-system/
├── app/
│   ├── layout.tsx          # 根布局，包含导航栏
│   ├── page.tsx            # 首页
│   ├── globals.css         # 全局样式
│   └── lottery/
│       ├── wheel/          # 转盘抽奖
│       ├── box/            # 暗箱抽奖
│       ├── number/         # 数字抽奖
│       └── list/           # 名单抽奖
├── lib/
│   ├── storage.ts          # localStorage 工具类
│   └── lottery-utils.ts    # 抽奖算法工具
├── public/                 # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 3. 打开浏览器

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 路由说明

- `/` - 首页（功能导航）
- `/lottery/wheel` - 转盘抽奖
- `/lottery/box` - 暗箱抽奖
- `/lottery/number` - 数字抽奖
- `/lottery/list` - 名单抽奖

## 使用说明

### 转盘抽奖

1. 点击 "编辑配置" 按钮
2. 配置奖项名称和权重（如果不勾选 "均匀概率"）
3. 点击 "开始抽奖" 按钮
4. 转盘转动后显示中奖结果

### 暗箱抽奖

1. 编辑奖项配置（名称和权重）
2. 选择 "单次抽取" 或 "5次连抽"
3. 查看抽取结果

### 数字抽奖

1. 设置最小值和最大值
2. 点击 "开始开奖"
3. 查看随机生成的中奖数字

### 名单抽奖

1. 上传 .txt 或 .csv 文件（每行一个姓名）
2. 或手动添加参与人
3. 设置抽取人数
4. 点击 "开始抽奖"

## 数据存储

所有数据使用浏览器 localStorage 存储，包括：
- 奖项配置
- 抽奖历史记录
- 用户设置

注意：清除浏览器缓存会导致数据丢失。

## 构建生产版本

```bash
npm run build
npm start
```

## 注意事项

- 本项目仅适用于 PC 端
- 无需后端服务，纯前端实现
- 数据仅存储在本地浏览器，不支持跨设备同步
- 建议使用现代浏览器（Chrome、Firefox、Edge 等）

## License

MIT
