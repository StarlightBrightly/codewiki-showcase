# Devin 与 DeepWiki：网站内容核验依据

| 主题 | 可用于网站的结论 | 官方来源 |
|---|---|---|
| 产品关系 | DeepWiki 是 Cognition 推出的 Devin Wiki 与 Devin Search 的免费公开版本。 | https://cognition.com/blog/deepwiki |
| Devin 工作流 | Devin 在连接仓库时会自动建立 DeepWiki；Ask Devin 会使用 Wiki 与代码搜索中的上下文。 | https://docs.devin.ai/work-with-devin/deepwiki |
| 公开入口 | DeepWiki 面向公开 GitHub 仓库提供文档、架构图、源码链接与问答；私有仓库能力依赖 Devin 账户与应用工作流。 | https://docs.devin.ai/work-with-devin/deepwiki |
| MCP 接入 | DeepWiki MCP 是面向公开仓库的远程服务，无需认证；提供结构读取、内容读取和基于代码库的问答三类能力。 | https://docs.devin.ai/work-with-devin/deepwiki-mcp |
| 公开仓库 | CognitionAI/deepwiki 公开仓库主要说明 DeepWiki 服务与 MCP 入口，仓库本身不包含完整 DeepWiki 产品实现。 | https://github.com/CognitionAI/deepwiki |

## 页面表达边界

网站将 **Devin / DeepWiki** 作为同一产品体系介绍：DeepWiki 负责代码库文档、索引和问答，Devin 提供更完整的工程执行体验。用户已说明自己在当天安装了 DeepWiki MCP 客户端；页面会将此事实标为用户的实际接入背景，而不会推断其具体使用结果。

在“开源 / 闭源”视角中，OpenWiki、CodeWiki 与 deepwiki-open 按其开源仓库呈现。Devin / DeepWiki 和 Grok-Wiki 按商业产品或闭源服务呈现；CognitionAI/deepwiki 的公开说明仓库不等同于 DeepWiki 产品源代码。
