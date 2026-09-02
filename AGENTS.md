# Repository Guidelines

## 项目结构与模块组织

- `client/` 是 Vite + React 前端；页面位于 `client/src/pages/`，通用组件位于 `client/src/components/`，基础 UI 组件位于 `client/src/components/ui/`。
- `server/` 是 Express、tRPC 和 OAuth/存储等服务端代码；核心基础设施位于 `server/_core/`，路由入口是 `server/routers.ts`。
- `shared/` 存放前后端共用的常量、类型和错误定义；`drizzle/` 存放数据库 schema、关系和迁移文件。
- `asset-mapping.json`、`asset_sources.md` 和 `research_sources.md` 记录展示素材及其来源。构建产物写入 `dist/`，不应提交。

## 构建、测试与本地开发

先执行 `pnpm install --frozen-lockfile`，按 `pnpm-lock.yaml` 安装依赖。常用命令如下：

```bash
pnpm dev       # 启动带 Vite 热更新的全栈开发服务，默认从 3000 端口开始寻找可用端口
pnpm check     # TypeScript 严格类型检查，不生成文件
pnpm test      # 使用 Vitest 运行 server/**/*.test.ts 和 server/**/*.spec.ts
pnpm build     # 构建前端到 dist/public，并将服务端打包到 dist/index.js
pnpm start     # 运行生产服务；执行前先完成 pnpm build
pnpm format    # 使用 Prettier 格式化仓库文件
pnpm db:push   # 生成并执行 Drizzle 迁移；需要配置 DATABASE_URL
```

## 编码风格与命名约定

遵循 `.prettierrc`：2 个空格、禁止 Tab、双引号、分号、80 列和 LF 换行。TypeScript 保持 `strict`；优先使用 `@/` 与 `@shared/` 路径别名。React 组件和页面使用 PascalCase，hooks 使用 `useXxx`，函数和变量使用 camelCase。

## 测试指南

测试使用 Node 环境下的 Vitest。服务端测试放在 `server/`，文件命名为 `<功能>.test.ts` 或 `<功能>.spec.ts`，用 `describe` 分组、用 `it` 描述可观察行为；例如 `pnpm exec vitest run server/auth.logout.test.ts`。当前未设置覆盖率门槛，新增路由或关键逻辑应覆盖成功、失败和边界行为。

## 提交与拉取请求

现有提交采用 `Checkpoint:` 前缀并附中文摘要，例如 `Checkpoint: 修正部署产物目录`。保持每次提交聚焦单一变更。PR 应说明变更目的和影响，列出已运行的 `pnpm check`、`pnpm test`、`pnpm build`，界面改动附前后对比截图，并注明环境变量、数据库迁移或部署影响。

## 安全与配置

不要提交 `.env`、`.env.local` 等环境文件、API 密钥、JWT 密钥、数据库凭据或生成产物；常见环境文件已列入 `.gitignore`。服务端配置集中在 `server/_core/env.ts`，本地运行前按需配置 `DATABASE_URL`、`JWT_SECRET`、OAuth 和 Forge 存储相关变量。涉及数据库的命令先确认目标环境，避免误改共享数据库。

## 参考文档

- [pnpm 官方文档](https://pnpm.io/)
- [Vite 官方指南](https://vite.dev/guide/)
- [Vitest 官方指南](https://vitest.dev/guide/)
- [Prettier 官方文档](https://prettier.io/docs/)
