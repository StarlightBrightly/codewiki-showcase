# DeepWiki 与 Devin MCP：对 Agent 是否比不用更有益

日期：2026-09-02。公开仓 / 私有仓谁能访问，不在本文讨论范围内。

要回答的问题：**在 Cursor 里干活的 Agent，调用这两个 MCP，是否比只使用本机 Read / Grep / [`AGENTS.md`](../AGENTS.md) 更有益？**

对照基线（不用 MCP）：Agent 已挂载 `autocode-ltm-ms`，可直接打开源码与规范；未挂载的公开库只能靠训练数据或网上检索。本轮实测仓库：`StarlightBrightly/autocode-ltm-ms`（已挂载）、`facebook/react`（未挂载）。未测本机 `codegraph`。

## 结论

**对已挂载的业务仓，不是稳定净收益。** Devin 的 `ask_question` 在「长期记忆对外路径」上把 `@RequestMapping("/faas/memory")` 说成 context-path，若 Agent 信了就会少写 `/ltm/v1`。同一问题不用 MCP、只读 [`AGENTS.md`](../AGENTS.md) 与 `plugin/src/main/java/com/polarizon/rag/plugin/ltm/controller/LtmMemoryController.java`，答案是对的。`read_wiki_contents` 一次塞进整本 Wiki（LTM 约 4400 行），比定向 Grep 更占上下文。

**对未挂载的公开库，比不用更有益。** DeepWiki 与 Devin 对 React 协调器 / 调度器都给出带源文件路径的职责划分；本工作区没有 React 源码，不用 MCP 时 Agent 只能靠参数记忆，容易把当前文件名说错。

**Devin 的会话与知识笔记本轮零条**，多调几次只增加往返，没有组织级额外记忆可吃。

因此：Agent 默认仍应从本机源码和 [`AGENTS.md`](../AGENTS.md) 起步。DeepWiki 留给「仓不在工作区」的公开库。Devin 对已挂载仓最多当目录（`read_wiki_structure`）或带文件引用的提问（`ask_question`），答完必须打开源码；不要把 `read_wiki_contents` 当第一跳。

## 已挂载业务仓：用 MCP 对比不用

人类丢给 Agent 的问题：「长期记忆对外怎么调？控制器映射和带 context-path 的完整路径分别是什么？」

| 路径 | Agent 得到什么 | 相对基线 |
| --- | --- | --- |
| 不用 MCP：读 [`AGENTS.md`](../AGENTS.md) | 控制器映射 `/faas/memory/record` 等；完整路径 `/ltm/v1/faas/memory/*` | 基线，正确 |
| 不用 MCP：读 `LtmMemoryController.java` | `@RequestMapping("/faas/memory")` 与四个 `@PostMapping` | 映射正确；完整路径还要读 `application-*.yaml` |
| DeepWiki `ask_question` | 仓未索引，提问失败 | 多一次失败调用，零收益 |
| Devin `ask_question` | 四条映射与源码一致；把 `/faas/memory` 称为 context-path；完整路径写成 `/faas/memory/record` | **映射有益、完整路径有害**。若不再读本机文件，比不用更差 |

全景类问题（「仓库怎么组织」）：

- Devin `read_wiki_structure`：9 章目录，能让 Agent 知道有「HTTP API」可查。对陌生大仓，这比从根目录盲搜快。本仓已有 [`AGENTS.md`](../AGENTS.md) 三模块说明与控制器路径，目录的增量有限。
- Devin `read_wiki_contents`：一次返回整本（约 308 KB / 4400 行），且不能按章取。Agent 上下文被一篇远程综述占满，其中 Overview 还把工程写成「autocode + plugin 两模块」，本机实际是 `autocode/api` + `autocode/biz` + `plugin`。**比定向打开 `plugin/` 更差。**
- Wiki 正文没有 `context-path`、`/ltm/v1`，索引的是 GitHub 快照，看不到本机未提交改动。

判断：已挂载且规范仓已写明易错点的服务，**不用 MCP 更稳**。Devin 只在「这片代码 Agent 完全没概念、规范也没写」时，用 `read_wiki_structure` 或 `ask_question` 换一张地图，然后立刻用本机文件否证。

## 未挂载公开库：用 MCP 对比不用

工作区没有 `facebook/react`。问题：「协调器与调度器各管什么、如何配合？」

| 路径 | Agent 得到什么 | 相对基线 |
| --- | --- | --- |
| 不用 MCP | 训练数据里的 React 模型，文件名与当前主干可能对不上 | 基线，可能过时 |
| DeepWiki `read_wiki_structure` + `ask_question` | 可点选目录；回答落到 `ReactFiberWorkLoop.js`、`Scheduler.js`、Lanes、`shouldYield` | **有益**：有当前路径可跟 |
| Devin 同一问题 | 结构接近，并带 Wiki 章节引用 | 与 DeepWiki 同级有益 |
| DeepWiki `read_wiki_contents` | 整本约 9200 行 | 提问已够用；整本灌入不值得 |

判断：Agent 要改或对照**未挂载**的公开库时，用 DeepWiki（或 Devin 的同一套提问）比纯靠参数更有益。不要为了「翻一章」去拉整本 Wiki。

## 提问前扫 Devin 会话 / 笔记

`devin_session_search`、`devin_knowledge_manage list` 本轮全空。失败信息清楚，不会逼 Agent 去建 session。

相对基线：多三次只读调用，零增量。Agent 不应在每次问代码库之前例行扫一遍，除非人类明确问「Devin 里有没有人查过」。

## Agent 调用策略（按是否更有益）

1. 问题落在已挂载仓，且 [`AGENTS.md`](../AGENTS.md) 或本地文件能直接答：不调这两个 MCP。
2. 问题落在未挂载的公开 GitHub 库：调 DeepWiki `ask_question`（需要目录时再 `read_wiki_structure`）。
3. 已挂载仓、规范没有写、目录又大：可调 Devin `read_wiki_structure` 或 `ask_question`，拿到路径后必须打开本机文件。完整 URL、模块数、未提交行为以本机为准。
4. 不要调用 `read_wiki_contents` 作为探索手段（当前实现会整本返回）。
5. 不要为「问代码库」去建 Devin session 或 `generate_wiki`。
