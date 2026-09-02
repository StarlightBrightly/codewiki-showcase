# 公开发布与社区治理设计

## 目标

将 `codewiki-showcase` 整理为可公开发布、可接受外部贡献并具备基本安全门禁的 GitHub 仓库。该工作覆盖本地许可和素材边界、社区维护文件、持续集成、安全扫描、默认分支治理以及首个版本发布。

## 当前状态与约束

- 仓库当前位于 `main`，工作树干净，远程为 `origin`。
- 根目录已经存在标准 MIT `LICENSE`，`package.json` 已声明 `"license": "MIT"`；本轮只验证一致性，不重复改写。
- 项目是 React、Vite、Express、tRPC 和 MySQL/Drizzle 组成的全栈展示网站，依赖安装和构建使用 pnpm。
- 公开前必须完成当前工作树和可达 Git 历史的高置信度密钥扫描；若发现真实凭据，先停止公开流程并轮换凭据，不通过改写历史掩盖事件。
- 文档使用简体中文。许可证正文保留标准 MIT 英文文本，以避免用非标准翻译替代法律授权条款。
- GitHub 外部操作只使用维护者已认证的 `gh` 会话，不在仓库、日志或对话中写入令牌。

## 版权与素材决策

### 发布范围

保留下列素材并在 `asset_sources.md` 与 `THIRD_PARTY_NOTICES.md` 中登记：

1. `grok-wiki-interface_ub3aoljv.png`：来源为 `AsyncFuncAI/deepwiki-open` 的公开截图目录。
2. `openwiki-visualizer_80jboqa8.gif`：来源为 `langchain-ai/openwiki` 的公开静态资源目录。
3. `grok-wiki-fieldnotes_frimdi9w.jpg`、`codewiki-hero-graph_skxp5ef9.jpg`、`codewiki-comparison-atlas_3c0n7t9g.jpg` 和 `codewiki-mark_myu2b3hi.png`：登记为本项目视觉资产，不宣称属于第三方产品，也不把第三方商标或品牌授权纳入本项目许可证。

移除以下没有明确再发布许可证据的文件，并同步移除页面引用：

- `client/public/manus-storage/grok-wiki-official-demo_ehbhr5hr.png`：来自 Grok-Wiki 官网产品演示区的截图。
- `client/public/manus-storage/deepwiki-official-ui_pa7wq5ja.png`：来自 Cognition 官方博客的截图。
- `client/public/manus-storage/codewiki-docs-interface_zj7hgx6c.png`：来自 CodeWiki 官方文档页面的截图。

项目卡片的截图字段改为可选。没有截图的项目仍显示名称、官方来源链接和文字说明，不显示破损图片。这样可以在不复制闭源产品宣传图的情况下保留研究入口。

### 许可边界

- MIT 许可证覆盖本项目代码及明确属于本项目的文档和视觉资产；不自动覆盖第三方仓库、网站、博客中的代码、截图、商标、产品名称或其他内容。
- 对来自 MIT 上游仓库的素材保留项目名称、来源 URL 和上游许可说明。来源登记是归属和审计记录，不把上游授权转授为本项目授权。
- 对来源或原作者不确定的素材，不写入“已获授权”等未经证实的表述；维护者后续若发现素材不是原创，应补充授权记录或移除素材。

## 社区文件

新增或更新以下文件：

- `README.md`：在标题下增加 MIT 许可证徽章，补充贡献、安全报告、社区讨论和第三方素材边界入口。
- `CONTRIBUTING.md`：说明环境准备、分支命名、代码和文档范围、素材来源要求、测试命令、提交和 Pull Request 检查项。
- `CODE_OF_CONDUCT.md`：采用 Contributor Covenant 2.1 的中文化项目规则，并提供私下报告行为事件的维护者联系路径。
- `SECURITY.md`：只允许通过 GitHub 私密安全报告提交漏洞，禁止在公开 Issue 暴露漏洞细节；说明支持范围、处置目标和凭据泄露处理方式。
- `.github/ISSUE_TEMPLATE/bug_report.md`：收集复现步骤、预期结果、实际结果、环境和日志脱敏信息。
- `.github/ISSUE_TEMPLATE/feature_request.md`：收集问题背景、建议方案、替代方案和范围影响。
- `.github/ISSUE_TEMPLATE/config.yml`：关闭空白 Issue，并将一般讨论、漏洞报告和贡献指南链接到正确入口。
- `.github/PULL_REQUEST_TEMPLATE.md`：要求说明变更目的、测试结果、素材/许可影响和安全影响。
- `THIRD_PARTY_NOTICES.md`：逐项列出仓库中保留的第三方素材及其来源、许可证状态和使用边界。

## 自动化验证与安全配置

### 持续集成

`.github/workflows/ci.yml` 在 `push` 和 `pull_request` 上运行 Node.js 22 与 pnpm 锁文件安装，并依次执行：

```text
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

现有 `server/logo.test.ts` 依赖 `VITE_APP_LOGO` 环境变量；CI 显式提供当前已使用的 HTTPS 图片地址，避免把缺少本地环境变量误判为代码失败。该地址不是秘密，不写入 GitHub Secrets。

### 安全工作流

- `.github/dependabot.yml` 每周检查根目录 npm 依赖和 GitHub Actions 依赖。
- `.github/workflows/codeql.yml` 使用 CodeQL 分析 JavaScript/TypeScript，并在推送到 `main`、Pull Request 和每周计划任务上运行。
- `.github/workflows/dependency-review.yml` 在 Pull Request 上检查新增依赖的许可和已知漏洞风险。

GitHub 仓库设置同时开启依赖图、Dependabot alerts、Dependabot security updates、Secret Scanning 和 Push Protection；若账户计划不提供某项能力，记录 GitHub 实际返回状态，不以工作流文件存在冒充平台功能已启用。

## GitHub 仓库治理

外部写入按以下顺序执行：

1. 将本地验证通过的治理提交推送到现有私有仓库，确认 GitHub Actions 能启动。
2. 确认仓库无敏感信息后改为 Public，并开启 Issues 和 Discussions。
3. 将 `main` 设为默认分支，启用 squash merge，关闭 merge commit 和 rebase merge，合并后删除主题分支。
4. 为 `main` 设置保护：必须通过 Pull Request、至少 1 个批准、推送新提交后重新审核、解决全部对话、分支与目标分支保持最新，并通过 `CI / check` 和 `CodeQL / analyze`；禁止强制推送和删除分支。依赖审查继续在 Pull Request 上运行，但不将其作为唯一合并门禁，以免没有依赖变更时造成平台状态缺失。
5. 创建 `v1.0.0` 首个 Release，目标提交为公开发布治理提交，标题和说明使用简体中文，并链接许可证、贡献指南、安全政策与第三方声明。

保护规则允许仓库管理员在紧急情况下绕过，以避免单维护者因无法自审而永久锁死仓库；日常变更仍按 Pull Request 流程进行。

## 验证策略

本地验证分为四层：

1. 文档和配置：Prettier 检查新增/修改文本与 YAML，JSON/YAML 可解析，Markdown 链接路径存在。
2. 代码回归：`pnpm check`、`pnpm test`、`pnpm build`；网络依赖测试要标注真实外部资源状态。
3. 安全与版权：当前文件和所有可达提交的高置信度密钥扫描、敏感文件路径扫描、素材清单与代码引用逐项对齐。
4. 远端运行态：回读仓库可见性、默认分支、Issues、Discussions、安全分析、分支保护、Actions 运行、远程提交、标签和 Release；区分 GitHub 平台实际状态与本地静态文件。

## 非目标

- 不重写 Git 历史；当前审计未发现高置信度密钥或敏感文件路径。
- 不修改数据库 schema、业务 API、部署平台或与公开发布无关的前端交互。
- 不将第三方素材重新打包为本项目的 MIT 许可内容。
- 不启用需要额外付费计划才能保证的 GitHub 能力并声称其已生效。

## 参考依据

- GitHub：设置仓库可见性：https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility
- GitHub：管理分支保护规则：https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule
- GitHub：仓库安全与分析设置：https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-security-and-analysis-settings-for-your-repository
- GitHub：配置 Dependabot 版本更新：https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-dependency-updates
- GitHub：社区健康文件：https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file
- Contributor Covenant 2.1：https://www.contributor-covenant.org/version/2/1/code_of_conduct/
- Open Source Initiative MIT License：https://opensource.org/license/mit/
