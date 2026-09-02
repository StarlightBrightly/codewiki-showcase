# Code Wiki Showcase

面向技术分享的 Code Wiki 工具研究与对比工作台。

本项目是一个基于 React、Vite 和 Express 的全栈单页网站，用于在约 10 分钟的技术分享中，对照开源 Code Wiki 项目与闭源产品的获取方式、工作流和知识沉淀方式。首页将 DeepWiki-Open、OpenWiki、CodeWiki、Grok-Wiki 以及 Devin / DeepWiki 分为“开源项目”和“闭源产品 / 服务”两组展示。

网站内容不是性能评测，也不构成功能保证。Grok-Wiki 部分以实际使用路径为重点；其他项目主要依据公开仓库、官网和官方文档进行技术路径对比。完整的研究口径见 [`research_sources.md`](research_sources.md)。

## 当前能力

- 通过章节导航浏览“开场问题”“开源 / 闭源”“Devin / DeepWiki”“实战焦点”“如何选择”和“收束结论”。
- 点击项目卡片查看工作流、主要产物、适用场景、官方界面素材和来源链接。
- 使用滚动进度、平滑定位和演讲模式辅助现场讲解。
- 通过对比表和决策卡片，从源码控制、文档维护、网页问答和桌面工作区等维度缩小选择范围。
- 适配桌面端和移动端；官方素材加载失败时显示可访问来源链接的备用状态。
- 保留 OAuth 会话、用户表和 tRPC API 基础设施。首页默认允许匿名访问；完成登录后，侧栏可以显示当前用户并执行退出。
- `/manus-storage/*` 支持优先读取本地素材，在本地文件不存在时回退到 Forge 对象存储代理。

## 技术栈

| 层级       | 技术                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| 前端       | React 19、TypeScript、Vite、Tailwind CSS、Radix UI、Wouter、Lucide React |
| 服务端     | Node.js、Express、tRPC                                                   |
| 认证       | OAuth 回调、JWT 会话 Cookie                                              |
| 数据库     | Drizzle ORM、MySQL / `mysql2`                                            |
| 对象存储   | Forge 预签名接口与 S3；本地素材回退                                      |
| 测试与质量 | Vitest、TypeScript 严格检查、Prettier                                    |

## 快速开始

### 环境要求

- Node.js
- pnpm 10.x；项目在 `package.json` 的 `packageManager` 字段中声明了包管理器版本

在项目根目录安装依赖：

```bash
pnpm install --frozen-lockfile
```

如需启用 OAuth、数据库或远程素材存储，在项目根目录创建本地 `.env` 文件。`.env` 只用于本地配置，不应提交到版本库。

### 开发模式

```bash
pnpm dev
```

开发服务默认从 `3000` 端口开始寻找可用端口，也可以通过 `PORT` 指定首选端口。启动后访问终端输出的本地地址。

### 生产模式

```bash
pnpm build
pnpm start
```

`pnpm build` 会将前端构建到 `dist/public`，并将 Express 服务端打包到 `dist/index.js`。执行 `pnpm start` 前必须先完成构建。

## 常用命令

| 命令           | 用途                                               |
| -------------- | -------------------------------------------------- |
| `pnpm dev`     | 启动带 Vite 热更新的全栈开发服务                   |
| `pnpm check`   | 执行 TypeScript 严格类型检查，不生成文件           |
| `pnpm test`    | 使用 Vitest 运行服务端测试                         |
| `pnpm build`   | 构建前端静态文件和服务端入口                       |
| `pnpm start`   | 启动生产构建后的 Express 服务                      |
| `pnpm format`  | 使用 Prettier 格式化仓库文件                       |
| `pnpm db:push` | 生成并执行 Drizzle 数据库迁移；需要 `DATABASE_URL` |

涉及数据库的操作前，请确认 `DATABASE_URL` 指向目标环境，避免误修改共享数据库。

## 环境变量

以下变量均通过环境变量读取。密钥类变量只应保存在本地开发环境或部署平台的安全配置中。

| 变量                          | 作用                                               | 使用条件                         |
| ----------------------------- | -------------------------------------------------- | -------------------------------- |
| `PORT`                        | 服务端首选监听端口，默认从 `3000` 开始             | 可选                             |
| `NODE_ENV`                    | 区分开发模式和生产模式；项目脚本会自动设置         | 通常由脚本设置                   |
| `VITE_APP_ID`                 | OAuth 应用标识；前端发起登录、服务端签发会话时使用 | 启用登录时需要                   |
| `VITE_OAUTH_PORTAL_URL`       | 前端 OAuth 登录入口地址                            | 启用前端登录时需要               |
| `OAUTH_SERVER_URL`            | 服务端交换授权码和读取用户信息的 OAuth 服务地址    | 启用登录时需要                   |
| `JWT_SECRET`                  | 签发和验证登录会话 Cookie 的密钥                   | 启用登录时需要                   |
| `DATABASE_URL`                | MySQL 连接地址，用于保存用户信息                   | 需要持久化用户数据时配置         |
| `OWNER_OPEN_ID`               | 匹配用户 `openId` 后将其默认标记为管理员           | 需要管理员识别时配置             |
| `BUILT_IN_FORGE_API_URL`      | Forge 服务地址，用于对象存储及其他内置服务代理     | 使用远程素材或相关内置服务时配置 |
| `BUILT_IN_FORGE_API_KEY`      | Forge 服务访问密钥                                 | 使用远程素材或相关内置服务时配置 |
| `VITE_FRONTEND_FORGE_API_URL` | 前端地图组件使用的 Forge 服务地址                  | 启用地图组件时配置               |
| `VITE_FRONTEND_FORGE_API_KEY` | 前端地图组件使用的访问密钥                         | 启用地图组件时配置               |

只访问首页并使用仓库内的本地素材时，可以不配置数据库和 Forge 存储变量。OAuth 相关变量缺失时，登录流程无法正常完成；数据库不可用时，服务端会跳过用户持久化，但不会影响无需登录的公开页面启动。

> 注意：带有 `VITE_` 前缀的变量会在 Vite 构建时注入浏览器端代码。`VITE_FRONTEND_FORGE_API_KEY` 只能配置允许公开暴露的前端凭据，不能放置高敏服务端密钥。

## 项目结构

```text
.
├── client/
│   ├── public/manus-storage/  # 本地素材回退目录
│   └── src/
│       ├── components/        # 通用组件与基础 UI 组件
│       ├── contexts/          # 主题等 React 上下文
│       ├── hooks/             # 通用 React Hooks
│       ├── pages/Home.tsx     # Code Wiki 分享首页
│       ├── pages/NotFound.tsx # 404 页面
│       └── App.tsx            # 前端路由与全局 Provider
├── server/
│   ├── _core/                 # Express、OAuth、tRPC、存储和运行时基础设施
│   ├── db.ts                  # Drizzle 数据库访问辅助函数
│   ├── routers.ts             # tRPC 路由入口
│   └── storage.ts             # Forge / S3 存储辅助函数
├── shared/                    # 前后端共享常量、类型和错误定义
├── drizzle/                   # 数据库 schema、关系和迁移元数据
├── asset-mapping.json         # 逻辑素材名到运行时资源路径的映射
├── asset_sources.md           # 展示素材来源与发布资源核验记录
├── research_sources.md        # 项目调研来源和内容边界
├── vite.config.ts             # Vite、路径别名和构建输出配置
└── package.json               # 脚本、依赖和包管理器配置
```

当前前端路由如下：

| 路径     | 页面               |
| -------- | ------------------ |
| `/`      | Code Wiki 分享首页 |
| `/404`   | 404 页面           |
| 其他路径 | 回退到 404 页面    |

`client/src/pages/ComponentShowcase.tsx` 是基础组件演示页面源码，目前未在 `App.tsx` 中注册为公开路由。

## 内容与素材维护

首页项目资料集中在 [`client/src/pages/Home.tsx`](client/src/pages/Home.tsx) 的 `repositories` 数据中。修改项目名称、定位、官方链接或展示素材时，应同步检查以下文件：

1. [`research_sources.md`](research_sources.md)：项目定位、研究口径和事实边界。
2. [`asset_sources.md`](asset_sources.md)：界面截图、动图及其官方来源。
3. [`asset-mapping.json`](asset-mapping.json)：逻辑素材名与带哈希资源路径的映射。
4. `client/public/manus-storage/`：本地素材文件。

素材说明应区分“实际使用”“官方公开界面”和“基于公开资料整理”，避免把调研结论写成亲自验证过的产品能力。外部页面或仓库发生变化时，应同时更新来源记录和首页文案。

## 认证与数据存储说明

- OAuth 回调地址为 `/api/oauth/callback`。
- tRPC API 挂载在 `/api/trpc`，当前包含系统路由和 `auth.me`、`auth.logout`。
- 用户表定义在 [`drizzle/schema.ts`](drizzle/schema.ts)，首次初始化或结构变化时使用 `pnpm db:push`。
- 服务端通过 `/manus-storage/*` 提供素材访问：先检查本地安全路径，再在配置完整时向 Forge 请求签名地址并重定向。
- 不要把 OAuth 密钥、JWT 密钥、数据库连接串或 Forge API 密钥写入 README、源码或提交记录。

## 验证建议

提交前至少运行：

```bash
pnpm exec prettier --check README.md
pnpm check
pnpm test
pnpm build
```

其中，`pnpm test` 和 `pnpm build` 可能受到本地依赖、环境变量、数据库或部署平台配置影响；记录结果时应区分代码检查、局部测试和真实外部服务验证。

## 参考资料

### 项目与产品来源

- [DeepWiki-Open](https://github.com/AsyncFuncAI/deepwiki-open)
- [OpenWiki](https://github.com/langchain-ai/openwiki)
- [CodeWiki](https://github.com/FSoft-AI4Code/CodeWiki)
- [Grok-Wiki 官网](https://grok-wiki.com/)
- [DeepWiki](https://deepwiki.com/)
- [DeepWiki MCP 官方说明](https://docs.devin.ai/work-with-devin/deepwiki-mcp)

### 工具链文档

- [pnpm 官方文档](https://pnpm.io/)
- [Vite 官方指南](https://vite.dev/guide/)
- [Vitest 官方指南](https://vitest.dev/guide/)
- [Prettier 官方文档](https://prettier.io/docs/)

## 许可证

本项目使用 [MIT License](LICENSE) 发布，标准许可证文本可参阅 [Open Source Initiative 的 MIT License](https://opensource.org/license/mit/)。第三方项目名称、产品名称、截图和其他展示素材仍归其各自权利人所有；素材使用范围和来源记录见 [`asset_sources.md`](asset_sources.md)。
