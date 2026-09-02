# 贡献指南

感谢您关注 Code Wiki Showcase。请先阅读本指南和[行为准则](CODE_OF_CONDUCT.md)，再提交代码、文案、研究来源或素材变更。

## 开始开发

请使用 Node.js 22 和 pnpm 10.x。在本地执行：

```bash
git clone https://github.com/StarlightBrightly/codewiki-showcase.git
cd codewiki-showcase
pnpm install --frozen-lockfile
```

创建分支时使用能够表达变更类型的名称，例如：

```text
feature/增加研究筛选
fix/修正来源链接
```

## 本地验证

提交 Pull Request 前，至少运行以下命令，并在 Pull Request 中记录实际结果：

```bash
pnpm check
pnpm test
pnpm build
```

其中，`pnpm test` 运行服务端测试，`pnpm build` 会生成前端和服务端构建产物。涉及数据库时，运行数据库命令前必须确认 `DATABASE_URL` 指向的目标环境，避免误修改共享数据库。

## 内容、研究与素材

- 修改首页项目名称、定位、官方链接或事实表述时，同步检查 `research_sources.md`，保持研究口径和事实边界一致。
- 修改截图、动图、图标或其他展示素材时，必须在 `asset_sources.md` 记录来源、许可或使用边界，并按需要同步 `THIRD_PARTY_NOTICES.md` 和 `asset-mapping.json`。
- 文案应区分实际使用、官方公开界面和基于公开资料整理，不把调研结论写成未经验证的产品能力或性能承诺。
- 不要提交 `.env`、`.env.local` 等环境文件、API 密钥、令牌、JWT 密钥、数据库凭据或其他秘密。

## 提交约定

每个提交只解决一个目的，提交信息应清楚说明变更内容。请避免把无关的格式化、重命名或生成产物混入同一提交；`dist/` 等构建产物不应提交。

## Pull Request 检查项

提交 Pull Request 时，请确认：

- [ ] 已说明变更目的，并关联相关 Issue 或 Discussion（如有）。
- [ ] 已运行 `pnpm check`、`pnpm test` 和 `pnpm build`，并填写完整结果。
- [ ] 已同步受影响的文案、`research_sources.md`、`asset_sources.md` 或 `THIRD_PARTY_NOTICES.md`。
- [ ] 已说明新增或修改素材的来源、许可和第三方声明影响。
- [ ] 已检查未包含环境文件、密钥、令牌、个人信息或其他敏感信息。
- [ ] 已说明数据库、迁移或其他破坏性变更，并确认目标环境要求。
- [ ] 已说明是否存在破坏性变更；没有则明确写明“无”。

详细模板见[安全政策](SECURITY.md)。请勿在公开 Issue、Pull Request 或 Discussion 中发布漏洞细节或敏感信息。
