# 图片评分系统

这是一个基于Next.js构建的图片评分系统，用于收集用户对图片的审美评分数据，旨在建立开源的审美评分数据集。

## 主要功能

- 用户认证系统
- 图片随机展示和评分
- 实时评分反馈
- 暗色/亮色主题切换
- 响应式设计

## 技术栈

- **前端框架**: Next.js 15.1
- **UI组件**: HeroUI React
- **样式**: Tailwind CSS
- **状态管理**: React Hooks (useReducer)
- **认证**: NextAuth.js
- **数据库**: MongoDB
- **开发工具**: TypeScript, ESLint

## 开发环境设置

1. 克隆仓库并安装依赖：
```bash
git clone <repository-url>
cd <project-directory>
pnpm install
```

2. 配置环境变量：
创建 `.env.local` 文件并添加必要的环境变量：
```env
MONGODB_URI=your_mongodb_uri
```

3. 启动开发服务器：
```bash
pnpm dev
```

## 项目结构

```
src/
├── app/                 # Next.js 应用路由
├── components/         # React 组件
├── config/            # 配置文件
├── lib/               # 工具库
├── types/             # TypeScript 类型定义
└── utils/             # 通用工具函数
```

## 评分系统说明

评分标准：
- 1分：极低质量，无效图，低质量白膜图
- 2分：质量较低或美学差的图
- 3分：普通作品
- 4分：质量或美学较高的图片
- 5分：极高质量/美学，杰作

## 数据隐私

- 用户的注册信息和OAuth2信息将被严格保密
- 评分数据以匿名形式公开，作为开源数据集的一部分
- 数据集仅用于学术研究目的

## 贡献指南

欢迎提交 Pull Requests 和 Issues。在提交之前，请确保：

1. 代码通过 ESLint 检查
2. 新功能包含适当的测试
3. 遵循现有的代码风格

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系方式

如有任何问题或建议，请通过以下方式联系：

- GitHub: [@shiertier](https://github.com/shiertier)
