# 公开发布与社区治理实施计划

> 对于代理执行者：必须使用 `superpowers:subagent-driven-development` 或 `superpowers:executing-plans`，按任务逐项执行。每一步均使用复选框跟踪。

**目标：** 将 `codewiki-showcase` 整理为具备明确许可证、版权边界、社区入口、自动化安全检查和 GitHub 发布治理的公开仓库，并发布首个 `v1.0.0` 版本。

**架构：** 保留现有 React/Vite/Express 应用结构，只在项目展示组件增加“无截图时的来源卡片”分支；将社区规则和安全自动化集中放入根目录与 `.github/`；GitHub 平台设置通过已认证的 `gh` CLI 完成，并在每个外部写入后回读实际状态。

**技术栈：** React、TypeScript、Vite、Express、pnpm、Vitest、GitHub Actions、Dependabot、CodeQL、GitHub CLI。

**规格：** `docs/superpowers/specs/2026-09-02-public-release-governance-design.md`

## 全局约束

- 许可证继续使用仓库现有标准 MIT 文本，`package.json` 继续保持 `"license": "MIT"`，不重复改写已经正确的内容。
- 所有新增 Markdown、YAML 和模板说明使用简体中文；`LICENSE` 保留标准 MIT 英文法律文本。
- `grok-wiki-official-demo_ehbhr5hr.png`、`deepwiki-official-ui_pa7wq5ja.png` 和 `codewiki-docs-interface_zj7hgx6c.png` 及其所有代码引用必须从公开发布物中移除。
- MIT 只覆盖本项目代码、明确属于本项目的文档和视觉资产；第三方项目、网页、博客、截图、商标和产品名称单独登记，不宣称已被本项目再许可。
- 不重写 Git 历史；当前文件和所有可达提交都要扫描高置信度凭据和敏感路径，发现真实凭据时停止公开流程并轮换凭据。
- CI 使用 Node.js 22、仓库声明的 pnpm 10.4.1 和 `pnpm install --frozen-lockfile`。
- GitHub `main` 保持默认分支；合并策略只保留 squash merge，保护规则禁止强制推送和删除分支。
- 不把 API 密钥、OAuth 密钥、JWT 密钥、数据库连接串、GitHub 令牌或其他凭据写入仓库、日志、Release 说明或对话。

---

### Task 1：收敛素材发布范围并修正无截图页面分支

**文件：**

- 修改：`asset_sources.md`
- 创建：`THIRD_PARTY_NOTICES.md`
- 修改：`client/src/pages/Home.tsx:29-48,145-172,188-238,498-512`
- 修改：`client/src/pages/home-restructure.css:52-118,216-218`
- 删除：`client/public/manus-storage/grok-wiki-official-demo_ehbhr5hr.png`
- 删除：`client/public/manus-storage/deepwiki-official-ui_pa7wq5ja.png`
- 删除：`client/public/manus-storage/codewiki-docs-interface_zj7hgx6c.png`
- 验证：`client/src/pages/Home.tsx`、`asset-mapping.json`、`asset_sources.md`

**接口：**

- 消费：现有 `Repository` 数据、`ProjectDossier` 组件和 `screenshotSource` 官方来源链接。
- 产出：`Repository.screenshot` 与 `Repository.screenshotAlt` 变为可选字段；无截图项目展示来源卡片，而不是渲染不存在的图片；素材清单与代码引用一一对应。

- [ ] **步骤 1：建立素材引用基线**

  运行以下命令，确认三张经审计后批准移除的图片被列为待删除，并记录其当前代码引用：

  ```bash
  rg -n "grok-wiki-official-demo|deepwiki-official-ui|codewiki-docs-interface" \
    client asset-mapping.json asset_sources.md README.md
  find client/public/manus-storage -maxdepth 1 -type f -print | sort
  ```

- [ ] **步骤 2：移除无明确再发布许可的二进制素材**

  使用补丁删除三张没有明确素材级再发布许可的 PNG；不删除其余 6 个素材，不修改数据库、存储代理或部署配置。

- [ ] **步骤 3：让项目卡片支持“仅来源”状态**

  在 `Repository` 类型中将 `screenshot` 和 `screenshotAlt` 改为可选；从 Grok-Wiki 与 Devin/DeepWiki 数据项中删除对应图片字段；保留 `screenshotSource` 作为官方来源链接。

  将 `ProjectDossier` 的视觉区改为以下行为：

  - 有截图时保持现有图片加载失败回退逻辑。
  - 无截图时渲染 `dossier-visual-fallback` 来源卡片，显示“暂不提供截图”和“打开官方来源”，不创建 `<img>` 标签。
  - 视觉区标题根据状态显示“官方公开界面”或“仅提供文字来源”。

  将 Devin/DeepWiki 章节中对已删除 PNG 的固定 `<img>` 替换为来源说明卡片，保留 DeepWiki MCP 官方说明链接，并明确说明本仓库不复制闭源宣传截图。

- [ ] **步骤 4：补齐来源和第三方声明**

  重写 `asset_sources.md`，只列出当前保留的 6 个文件：2 个开源项目来源素材和 4 个本项目视觉资产；删除过时的“已发布页面核验”叙述，增加 2026-09-02 素材审计记录。

  创建 `THIRD_PARTY_NOTICES.md`，至少包含以下条目：

  - DeepWiki-Open 截图、来源目录、上游 MIT 许可证和 `Copyright (c) 2024 Sheing Ng`。
  - OpenWiki 动图、来源目录、上游 MIT 许可证和上游许可证 URL。
  - CodeWiki 文档截图的原来源和移除原因；不把上游项目 README 的 MIT 声明当作截图本身的再发布授权。
  - 4 个本项目视觉资产的文件名和当前 Git 历史未发现外部来源的审计结论。
  - 三张已移除截图的文件名、原来源和移除原因。
  - 第三方品牌、商标、产品名称和网页内容不受本项目 MIT 许可证覆盖的声明。

- [ ] **步骤 5：验证素材闭包和前端回归**

  运行：

  ```bash
  ! rg -n "grok-wiki-official-demo|deepwiki-official-ui|codewiki-docs-interface" \
    client asset-mapping.json asset_sources.md README.md
  pnpm check
  pnpm build
  ```

  预期：旧文件名无任何引用，TypeScript 检查和生产构建均通过。

- [ ] **步骤 6：提交任务结果**

  ```bash
  git add asset_sources.md THIRD_PARTY_NOTICES.md \
    client/src/pages/Home.tsx client/src/pages/home-restructure.css \
    client/public/manus-storage/grok-wiki-official-demo_ehbhr5hr.png \
    client/public/manus-storage/deepwiki-official-ui_pa7wq5ja.png \
    client/public/manus-storage/codewiki-docs-interface_zj7hgx6c.png
  git commit -m "Checkpoint: 收敛公开素材与版权边界"
  ```

### Task 2：新增社区与维护文档

**文件：**

- 修改：`README.md`
- 创建：`CONTRIBUTING.md`
- 创建：`CODE_OF_CONDUCT.md`
- 创建：`SECURITY.md`
- 创建：`.github/ISSUE_TEMPLATE/bug_report.md`
- 创建：`.github/ISSUE_TEMPLATE/feature_request.md`
- 创建：`.github/ISSUE_TEMPLATE/config.yml`
- 创建：`.github/PULL_REQUEST_TEMPLATE.md`

**接口：**

- 消费：现有 README 的安装、命令、环境变量、研究来源和 MIT 说明。
- 产出：新贡献者可以从 README 进入贡献指南、讨论区、安全政策和第三方声明；GitHub 新 Issue/PR 获得结构化模板。

- [ ] **步骤 1：更新 README 入口和许可证徽章**

  在标题下增加指向 `LICENSE` 的 MIT 徽章：

  ```markdown
  [![许可证：MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  ```

  在现有许可证章节附近增加“参与贡献”“安全报告”“社区讨论”和“第三方素材声明”的相对链接；保留当前项目定位、命令和事实边界，不把项目描述扩展为性能承诺。

- [ ] **步骤 2：编写 CONTRIBUTING.md**

  包含以下可执行内容：克隆和 `pnpm install --frozen-lockfile`、Node.js 22、`pnpm check`/`pnpm test`/`pnpm build`、`feature/`/`fix/` 分支命名、单一目的提交、Pull Request 检查项、文案和研究来源同步、素材必须有来源/许可记录、不得提交环境文件和秘密、数据库命令必须确认目标环境。

- [ ] **步骤 3：编写 CODE_OF_CONDUCT.md**

  采用 Contributor Covenant 2.1 的中文化规则，覆盖尊重沟通、可接受/不可接受行为、执行责任和报告方式；报告方式指向维护者的 GitHub 私信或仓库配置的私下联系入口，不要求贡献者在公开 Issue 暴露隐私。

- [ ] **步骤 4：编写 SECURITY.md**

  说明支持 `main` 和最新 Release；漏洞、泄露凭据和敏感信息只通过 `https://github.com/StarlightBrightly/codewiki-showcase/security/advisories/new` 提交；禁止公开 Issue、Pull Request 或 Discussion 发布漏洞细节；凭据疑似泄露时先撤销/轮换，再提供最少必要证据；维护者目标是在 7 个工作日内确认报告。

- [ ] **步骤 5：编写 Issue 与 Pull Request 模板**

  `bug_report.md` 收集问题摘要、复现步骤、预期/实际结果、环境、日志脱敏确认和最小复现信息；`feature_request.md` 收集问题背景、建议方案、替代方案、范围和验收标准；`config.yml` 关闭空白 Issue，并链接 Discussions、Security Advisories、CONTRIBUTING 和 SECURITY；PR 模板要求填写目的、测试命令、文档/素材许可影响、敏感信息检查和破坏性变更说明。

- [ ] **步骤 6：验证文档格式和相对链接**

  运行：

  ```bash
  pnpm exec prettier --check README.md CONTRIBUTING.md CODE_OF_CONDUCT.md \
    SECURITY.md THIRD_PARTY_NOTICES.md .github/ISSUE_TEMPLATE/*.md \
    .github/ISSUE_TEMPLATE/config.yml .github/PULL_REQUEST_TEMPLATE.md
  rg -n "\]\([^https#][^)]+\)" README.md CONTRIBUTING.md SECURITY.md \
    .github/ISSUE_TEMPLATE .github/PULL_REQUEST_TEMPLATE.md
  ```

  逐项确认每个相对链接目标存在；对仓库尚未提供的 GitHub 动态页面只使用完整 URL，不伪造本地文件链接。

- [ ] **步骤 7：提交任务结果**

  ```bash
  git add README.md CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md \
    .github/ISSUE_TEMPLATE .github/PULL_REQUEST_TEMPLATE.md
  git commit -m "docs: 建立社区贡献与安全政策"
  ```

### Task 3：加入 CI、Dependabot、CodeQL 和依赖审查

**文件：**

- 创建：`.github/dependabot.yml`
- 创建：`.github/workflows/ci.yml`
- 创建：`.github/workflows/codeql.yml`
- 创建：`.github/workflows/dependency-review.yml`

**接口：**

- 消费：`package.json` 的 pnpm 脚本、`pnpm-lock.yaml` 和现有 `server/logo.test.ts`。
- 产出：稳定的 `CI / check`、`CodeQL / analyze` 和 `Dependency Review / review` 检查名称，供 GitHub 分支保护和贡献者使用。

- [ ] **步骤 1：配置 Dependabot**

  创建 `.github/dependabot.yml`，使用 `version: 2`，为 `/` 下的 `npm` 生态和 `/` 下的 `github-actions` 生态分别配置每周检查；npm 更新限制为每次最多 10 个开放 PR，GitHub Actions 更新限制为每次最多 5 个开放 PR。

- [ ] **步骤 2：创建 CI 工作流**

  创建以下工作流，使 job 名称固定为 `CI / check`：

  ```yaml
  name: CI
  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]
  permissions:
    contents: read
  jobs:
    check:
      name: check
      runs-on: ubuntu-latest
      env:
        VITE_APP_LOGO: https://codewiki-qn4bmd4p.manus.space/manus-storage/codewiki-mark_myu2b3hi.png
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
          with:
            version: 10.4.1
        - uses: actions/setup-node@v4
          with:
            node-version: 22
            cache: pnpm
        - run: pnpm install --frozen-lockfile
        - run: pnpm check
        - run: pnpm test
        - run: pnpm build
  ```

- [ ] **步骤 3：创建 CodeQL 工作流**

  创建 `name: CodeQL` 的工作流，在 `push` 到 `main`、面向 `main` 的 Pull Request 和每周计划任务上运行；使用当前官方支持的 `github/codeql-action/init@v4` 与 `github/codeql-action/analyze@v4`，语言为 `javascript-typescript`，构建模式为 `none`，job id/name 固定为 `analyze`，权限最小化为 `contents: read`、`actions: read`、`packages: read` 和 `security-events: write`。

- [ ] **步骤 4：创建依赖审查工作流**

  创建 `name: Dependency Review` 的工作流，只在面向 `main` 的 Pull Request 上运行，使用 `actions/dependency-review-action@v4`，job id/name 固定为 `review`，仅授予 `contents: read`。

- [ ] **步骤 5：验证 YAML、检查名称和本地脚本**

  运行：

  ```bash
  pnpm exec prettier --check .github/dependabot.yml .github/workflows/*.yml
  pnpm check
  VITE_APP_LOGO=https://codewiki-qn4bmd4p.manus.space/manus-storage/codewiki-mark_myu2b3hi.png pnpm test
  pnpm build
  ```

  预期：6 个测试全部通过；若没有外部网络，记录网络限制，不将网络不可达误报为代码失败。

- [ ] **步骤 6：提交任务结果**

  ```bash
  git add .github/dependabot.yml .github/workflows
  git commit -m "ci: 建立持续集成与安全扫描"
  ```

### Task 4：执行公开发布前的安全、版权和许可证审计

**文件：**

- 验证：`LICENSE`
- 验证：`package.json`
- 修改：`package.json`（仅增加 `audit:public-release` 脚本，保留 `license: "MIT"`）
- 创建：`scripts/audit-public-release.mjs`
- 创建：`scripts/audit-public-release.test.mjs`
- 验证：当前 Git 工作树和所有可达提交
- 验证：`client/public/manus-storage`、`asset-mapping.json`、`asset_sources.md`、`THIRD_PARTY_NOTICES.md`

审计报告必须明确区分 Task 2 的 `README.md`/`CONTRIBUTING.md` 变更与 Task 4 各轮实际提交的文件归属，不得将前者或未由本轮修改的文件表述为 Task 4 文件。

报告标题必须标注最新修复轮次，并明确区分当前最终快照、历史轮次快照和任务文件归属。

**接口：**

- 消费：任务 1–3 的文件和执行审计时由 `git rev-list --all` 得到的全部可达提交。
- 产出：可重复运行的 `pnpm audit:public-release` 和可附在 Release/PR 中的审计结果；没有真实凭据、敏感路径、未登记素材引用和许可证字段漂移。

- [ ] **步骤 1：核验许可证元数据**

  运行：

  ```bash
  test "$(sed -n '1p' LICENSE)" = "MIT License"
  node -e 'const p=require("./package.json"); if(p.license!=="MIT") process.exit(1)'
  git diff --check
  ```

- [ ] **步骤 2：扫描当前文件中的高置信度凭据**

  先写 `scripts/audit-public-release.test.mjs` 的失败测试，使用临时目录中的被 `.gitignore` 忽略的 `.env` 和 `sk-proj-` 形式样例验证扫描结果只返回路径、不返回内容；再实现 `scripts/audit-public-release.mjs`。脚本使用 `rg --no-ignore --hidden`，覆盖 AWS access key、GitHub token、OpenAI-style key（包括 `sk-proj-`）、Slack token、npm token、Google API key、私钥块和带凭据的 URL；排除 `node_modules`、`dist`、`.git`、审计工作目录和二进制素材。脚本必须把 `rg` 的 0（命中）、1（无命中）和 2（执行错误）区分处理，错误不得转化为通过。

- [ ] **步骤 3：扫描全部可达 Git 历史**

  脚本对 `git rev-list --all` 的每个提交执行同样的高置信度扫描，并扫描历史树中的 `.env`、私钥、凭据、密码和 token 文件名；输出完整 refs、提交数量、逐提交匹配计数和退出码，但只保留提交哈希和路径。发现真实凭据时停止公开、轮换凭据并另行处理历史清理，不使用 `git reset --hard`。

- [ ] **步骤 4：校验素材闭包**

  确认 `asset-mapping.json` 中的每个目标文件存在、`Home.tsx` 中的每个 `/manus-storage/` 文件已登记、已删除三张截图不再出现在当前代码中；确认 `THIRD_PARTY_NOTICES.md` 明确排除第三方素材的 MIT 覆盖范围。

- [ ] **步骤 5：确认审计门禁**

  ```bash
  pnpm audit:public-release
  git status --short --branch --untracked-files=all
  git log --all --oneline --decorate -10
  git diff --stat main...HEAD
  ```

  `pnpm audit:public-release`、格式检查和前四步无阻断发现时，以终端结果作为发布门禁，不创建没有文件变化的空提交；若审计发现需要修正文件，只提交修正本身，不把秘密或完整扫描输出写入提交。

### Task 5：合并治理改动并执行 GitHub 外部设置

**文件/外部对象：**

- 修改 Git：当前隔离分支、根工作树 `main`、远程 `origin`
- 修改 GitHub：`StarlightBrightly/codewiki-showcase` 仓库设置、`main` 分支保护和 Release

**接口：**

- 消费：任务 1–4 的提交、有效的 `gh` 认证和 GitHub Actions 检查名称。
- 产出：公开仓库、启用 Issues/Discussions/安全能力、受保护的默认分支和 `v1.0.0` Release。

- [ ] **步骤 1：确认 GitHub 认证和远端提交**

  运行 `gh auth status`；若 token 仍无效，暂停外部写入，让维护者在本机执行 `gh auth login -h github.com`，然后重新验证当前账号对目标仓库具有管理员权限。不得读取或索取 token 内容。

- [ ] **步骤 2：把隔离分支快进合并到 main**

  在根工作树确认干净后执行：

  ```bash
  git status --short --branch --untracked-files=all
  git merge --ff-only codex/public-release-governance
  git push origin main
  ```

  推送前再次执行当前文件和历史审计；推送目标提交后，使用 `gh api` 读取该提交的
  `check-runs[].name`，等待对应 CI 和 CodeQL 检查成功。若任一检查缺少、失败或超时，
  立即停止，不继续配置分支保护；不得预设或假定任何检查名称。

- [ ] **步骤 3：启用仓库功能和安全分析**

  使用 `gh repo edit` 开启 Public、Issues、Discussions、默认分支 `main`、squash merge 和合并后删除主题分支，并关闭 merge commit 与 rebase merge；同时以 GitHub REST API 的 `security_and_analysis` 字段启用依赖图、Dependabot alerts、Dependabot security updates、Secret Scanning 和 Secret Scanning Push Protection。再调用 `PUT /repos/StarlightBrightly/codewiki-showcase/private-vulnerability-reporting` 启用私密漏洞报告，随后调用同一端点 `GET` 并要求返回 `enabled=true`。只有确认该状态后，才将 `https://github.com/StarlightBrightly/codewiki-showcase/security/advisories/new` 作为安全报告的唯一入口。每个 API 响应只记录状态字段，不记录任何令牌或敏感响应内容。

- [ ] **步骤 4：设置 main 分支保护**

  在前一步确认推送目标提交的实际检查名称且 CI、CodeQL 均成功后，将读取到的名称原样传给 `PUT /repos/StarlightBrightly/codewiki-showcase/branches/main/protection`；不得在 API 请求中预设 `CI / check` 或 `CodeQL / analyze`。除实际 `contexts` 外设置：

  ```text
  required_status_checks.strict = true
  required_status_checks.contexts = ["<已由 check-runs[].name 读取并确认成功的 CI 名称>", "<已由 check-runs[].name 读取并确认成功的 CodeQL 名称>"]
  required_pull_request_reviews.dismiss_stale_reviews = true
  required_pull_request_reviews.required_approving_review_count = 1
  required_pull_request_reviews.require_code_owner_reviews = false
  required_pull_request_reviews.require_last_push_approval = false
  required_conversation_resolution = true
  required_linear_history = true
  enforce_admins = false
  allow_force_pushes = false
  allow_deletions = false
  ```

  不把依赖审查设为唯一必需门禁；它仍在 Pull Request 上运行。保护规则设置后回读 JSON，确认 `main` 的 `protected` 状态和上述关键字段。

- [ ] **步骤 5：创建首个 Release**

  确认远程 `main` 已包含治理提交且没有现存 `v1.0.0` 标签后执行：

  ```bash
  gh release create v1.0.0 \
    --repo StarlightBrightly/codewiki-showcase \
    --target main \
    --title "v1.0.0 — 首次公开发布" \
    --notes "首次公开发布 Code Wiki Showcase。\n\n本版本包含：MIT 许可证、社区贡献指南、行为准则、安全政策、Issue/PR 模板、CI、Dependabot、CodeQL 和依赖审查。默认分支 main 已启用 Pull Request、审查、CI/CodeQL 和对话解决要求。第三方素材与项目 MIT 许可的边界见 THIRD_PARTY_NOTICES.md。欢迎通过 Issues、Discussions 和 Pull Request 参与。"
  ```

- [ ] **步骤 6：记录和提交外部状态**

  保存仓库 URL、Release URL、标签提交、保护规则摘要、Actions 运行 ID 和安全分析状态到本轮终端记录；不保存认证信息、完整安全告警响应或任何秘密。

### Task 6：最终回读、分支收尾与交付

**文件/外部对象：**

- 验证：根工作树、隔离 worktree、远程 `origin/main`
- 验证：GitHub 仓库设置、Actions、分支保护、标签和 Release

**接口：**

- 消费：任务 5 的远程提交、检查运行和平台设置。
- 产出：可复核的文件路径、提交哈希、测试结果、审计结果和 GitHub URL；工作树无未预期改动。

- [ ] **步骤 1：回读本地和远程 Git 状态**

  运行：

  ```bash
  git status --short --branch --untracked-files=all
  git log -1 --format='%H %s'
  git ls-remote origin refs/heads/main refs/tags/v1.0.0
  git worktree list --porcelain
  ```

  确认 `origin/main` 与本地 `main` 指向同一提交，`v1.0.0` 指向公开发布提交。

- [ ] **步骤 2：回读 GitHub 运行态**

  使用 `gh repo view` 和 `gh api` 读取：`visibility`、`default_branch`、`has_issues`、`has_discussions`、`security_and_analysis`、`private-vulnerability-reporting`（要求 `enabled=true`）、分支保护 JSON、最新 Actions 运行、Release 元数据和标签提交。再次从目标提交的 `check-runs[].name` 回读并记录实际 CI、CodeQL 名称及成功状态；若安全报告端点未确认启用，不得把 Security Advisory URL 作为入口。分别记录依赖审查是否成功、跳过或尚未触发。

- [ ] **步骤 3：移除隔离 worktree**

  确认隔离 worktree 干净后执行 `git worktree remove /Users/Mitchell/DropboxMaestral/PersonalCode/codewiki-showcase/.worktrees/public-release-governance`，再运行 `git worktree prune`，回读 `git worktree list` 和 `git branch --list`。不删除 `main`、远程分支或其他 worktree。

- [ ] **步骤 4：按验证证据交付结果**

  最终说明实际完成的本地文件、删除的三张截图、许可证状态、当前/历史扫描结果、测试结果、GitHub 设置、Release 链接和任何仍受账户计划或认证影响的能力；区分本地静态文件、Actions 运行和 GitHub 平台真实状态。

## 全局完成门槛

- `LICENSE` 首行是 `MIT License`，`package.json.license` 是 `MIT`。
- 三张无明确素材级再发布许可的截图已从当前版本树删除，代码、映射和来源清单无残留发布引用。
- README、贡献指南、行为准则、安全政策、Issue/PR 模板和第三方声明全部存在且为简体中文。
- `pnpm check`、`VITE_APP_LOGO=... pnpm test`、`pnpm build` 和格式检查通过；既有网络测试的外部资源结果单独标注。
- 当前文件和所有可达历史高置信度敏感扫描无真实凭据命中。
- `pnpm audit:public-release` 通过，且报告记录执行时的 refs、提交覆盖数、退出码和命中计数，不输出秘密内容。
- 远程仓库为 Public，Issues/Discussions 已启用，默认分支为 `main`，`main` 保护规则和安全扫描状态已回读。
- `v1.0.0` Release 存在并指向最终治理提交；本地和远程 Git 状态均可复核。
