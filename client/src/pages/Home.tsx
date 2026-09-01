/**
 * Style context — 维护者的工作台：瑞士编辑设计 + 研究笔记。
 * 墨黑索引轨道、雾白纸张、Signal Lime 只用于“已验证”和关键结论；叙事优先于装饰。
 */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpenText,
  Braces,
  Check,
  ChevronDown,
  CircleDot,
  Clock3,
  Copy,
  ExternalLink,
  FileText,
  GitBranch,
  ImageOff,
  Layers3,
  Menu,
  Network,
  ScanSearch,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

type Camp = "open" | "closed";
type StatusTone = "verified" | "research" | "connected";

type Repository = {
  id: string;
  index: string;
  name: string;
  label: string;
  camp: Camp;
  status: string;
  statusTone: StatusTone;
  tagline: string;
  description: string;
  method: string;
  output: string;
  bestFor: string;
  talkPoint: string;
  url: string;
  urlLabel: string;
  screenshot: string;
  screenshotAlt: string;
  screenshotSource: string;
};

const camps: { id: Camp; eyebrow: string; title: string; summary: string }[] = [
  {
    id: "open",
    eyebrow: "OPEN SOURCE / 可读、可改、可自管",
    title: "开源项目：把 Wiki 当作代码资产。",
    summary: "这组工具把实现、产物或维护链路留在可检查的仓库里，适合需要定制、复用和自行验证的团队。",
  },
  {
    id: "closed",
    eyebrow: "CLOSED PRODUCT / 服务与接口体验",
    title: "闭源产品：把代码理解接入现有工作台。",
    summary: "这组产品以完整服务、桌面应用或 MCP 入口交付能力，重点在于能否快速融入已有的开发与提问流程。",
  },
];

const repositories: Repository[] = [
  {
    id: "deepwiki-open",
    index: "01",
    name: "DeepWiki-Open",
    label: "AsyncFuncAI/deepwiki-open",
    camp: "open",
    status: "公开仓库",
    statusTone: "research",
    tagline: "以公开实现探索交互式 Code Wiki 的生成与导览",
    description:
      "该公开仓库展示了从代码结构分析到 Wiki、图示和 Code Map 的交互式流程。本页将它放在开源组，作为可阅读、可验证的实现路径。",
    method: "仓库解析 → 文档 / 图示 → 可导航的代码导览",
    output: "交互式 Wiki、说明图与代码结构索引",
    bestFor: "希望查看实现思路，或在自己的环境中进一步验证交互体验",
    talkPoint: "它提供了一条公开实现路径，适合用源码和实际界面来讨论 Code Wiki 的构成。",
    url: "https://github.com/AsyncFuncAI/deepwiki-open",
    urlLabel: "阅读仓库",
    screenshot: "/manus-storage/grok-wiki-interface_ub3aoljv.png",
    screenshotAlt: "DeepWiki-Open 公开仓库中的实际 Wiki 生成入口界面",
    screenshotSource: "https://github.com/AsyncFuncAI/deepwiki-open/tree/main/screenshots",
  },
  {
    id: "openwiki",
    index: "02",
    name: "OpenWiki",
    label: "langchain-ai/openwiki",
    camp: "open",
    status: "文档调研",
    statusTone: "research",
    tagline: "将 Wiki 保存在代码库中，并随变更更新",
    description:
      "OpenWiki 是面向代码库和个人知识的 CLI 工具。它生成相互链接的 Markdown 文档，并提供可探索图谱，适合把文档维护纳入版本控制与 CI 流程。",
    method: "代理读取源代码 → 链接 Markdown → CI 持续更新",
    output: "仓库内 Wiki、OKF 内容与可探索图谱",
    bestFor: "希望让知识资产留在 Git 中，并随提交持续维护的团队",
    talkPoint: "把 Wiki 视为仓库产物，让文档的更新节奏与代码变更保持同步。",
    url: "https://github.com/langchain-ai/openwiki",
    urlLabel: "阅读仓库",
    screenshot: "/manus-storage/openwiki-visualizer_80jboqa8.gif",
    screenshotAlt: "OpenWiki 的文档可视化图谱与页面导航界面",
    screenshotSource: "https://github.com/langchain-ai/openwiki/blob/main/static/visualizer.gif",
  },
  {
    id: "codewiki",
    index: "03",
    name: "CodeWiki",
    label: "FSoft-AI4Code/CodeWiki",
    camp: "open",
    status: "文档调研",
    statusTone: "research",
    tagline: "用层级分解与多代理处理复杂仓库",
    description:
      "CodeWiki 面向多语言仓库生成结构化文档，并梳理函数、跨文件调用、模块关系和系统架构。它强调在复杂系统中保留分层的架构上下文。",
    method: "层级拆分 → 递归多代理 → 多模态综合",
    output: "文字文档、架构图、数据流与时序图",
    bestFor: "关注大规模、多语言代码库的结构化文档生成",
    talkPoint: "当仓库复杂度上升，文档生成过程需要显式保留模块关系和分层上下文。",
    url: "https://github.com/FSoft-AI4Code/CodeWiki",
    urlLabel: "阅读仓库",
    screenshot: "/manus-storage/codewiki-docs-interface_zj7hgx6c.png",
    screenshotAlt: "CodeWiki 自动生成的代码库文档浏览界面",
    screenshotSource: "https://fsoft-ai4code.github.io/CodeWiki/docs/index.html",
  },
  {
    id: "grok-wiki",
    index: "04",
    name: "Grok-Wiki",
    label: "grok-wiki.com · 闭源产品",
    camp: "closed",
    status: "我实际使用过",
    statusTone: "verified",
    tagline: "让本地代理围绕仓库上下文生成、提问与执行任务",
    description:
      "当前官网将 Grok-Wiki 定位为本地代理桌面工作区，包含 Projects、Wiki、Ask、Docs、Tasks 与 Terminal 等界面。它通过本地 CLI 代理处理模型访问与仓库工作流。",
    method: "选择仓库 → 本地代理建立上下文 → Wiki / Ask / Docs / Tasks",
    output: "桌面工作区、可追问的仓库上下文与任务流",
    bestFor: "希望在本地代理工作流中快速建立仓库理解，并已具备实际使用经验的场景",
    talkPoint: "本次分享会用实际使用路径展示：把一个具体问题放进仓库上下文，再回看证据与代码。",
    url: "https://grok-wiki.com/",
    urlLabel: "打开官网",
    screenshot: "/manus-storage/grok-wiki-official-demo_ehbhr5hr.png",
    screenshotAlt: "Grok-Wiki 官网展示的本地代理桌面工作区，包含项目侧栏与任务面板",
    screenshotSource: "https://grok-wiki.com/#product-overview",
  },
  {
    id: "devin-deepwiki",
    index: "05",
    name: "Devin / DeepWiki",
    label: "Cognition · 闭源服务体系",
    camp: "closed",
    status: "MCP 客户端已安装",
    statusTone: "connected",
    tagline: "让代码库文档、问答和工程执行处在同一产品体系",
    description:
      "DeepWiki 是 Cognition 推出的 Devin Wiki 与 Devin Search 的免费公开版本。它负责公开仓库的文档、源码链接和问答；Devin 提供更完整的代码搜索、规划与工程执行能力。",
    method: "DeepWiki 索引与问答 → MCP 接入 → Devin 工程执行",
    output: "公开仓库 Wiki、代码库问答与 MCP 工具调用",
    bestFor: "希望将公开仓库的结构、内容和问答能力接入本地 AI 客户端的场景",
    talkPoint: "今天已安装 DeepWiki MCP 客户端；现场可先展示结构读取、内容读取和基于仓库的问答三类能力。",
    url: "https://deepwiki.com/",
    urlLabel: "打开 DeepWiki",
    screenshot: "/manus-storage/deepwiki-official-ui_pa7wq5ja.png",
    screenshotAlt: "Cognition 官方展示的 DeepWiki 文档页面，包含目录、源码入口和 Ask Devin 提问区域",
    screenshotSource: "https://cognition.com/blog/deepwiki",
  },
];

const chapters = [
  { id: "opening", label: "开场问题", time: "0:00" },
  { id: "landscape", label: "开源 / 闭源", time: "1:00" },
  { id: "devin", label: "Devin / DeepWiki", time: "3:20" },
  { id: "verified", label: "实战焦点", time: "5:30" },
  { id: "comparison", label: "如何选择", time: "7:30" },
  { id: "closing", label: "收束结论", time: "9:20" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  const [activeProject, setActiveProject] = useState("grok-wiki");
  const [activeChapter, setActiveChapter] = useState("opening");
  const [progress, setProgress] = useState(0);
  const [railOpen, setRailOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const selectedProject = useMemo(
    () => repositories.find((project) => project.id === activeProject) ?? repositories[0],
    [activeProject],
  );
  const currentChapter = chapters.find((chapter) => chapter.id === activeChapter) ?? chapters[0];

  useEffect(() => {
    const updateScrollState = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, Math.round((window.scrollY / total) * 100)) : 0);
      const nearest = chapters
        .map((chapter) => {
          const element = document.getElementById(chapter.id);
          return { id: chapter.id, distance: element ? Math.abs(element.getBoundingClientRect().top - 160) : Infinity };
        })
        .sort((a, b) => a.distance - b.distance)[0];
      if (nearest?.id) setActiveChapter(nearest.id);
    };
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => setImageLoadError(false), [activeProject]);

  const navigate = (id: string) => {
    setRailOpen(false);
    scrollToId(id);
  };

  const copyLink = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = url;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      document.body.removeChild(helper);
    }
    setCopiedLink(id);
    window.setTimeout(() => setCopiedLink((current) => (current === id ? null : current)), 1600);
  };

  return (
    <div className={`workbench-shell ${presentationMode ? "presentation-mode" : ""}`}>
      <aside className={`talk-rail ${railOpen ? "is-open" : ""}`} aria-label="分享章节导航">
        <div className="rail-header">
          <a className="rail-brand" href="#opening" onClick={(event) => { event.preventDefault(); navigate("opening"); }}>
            <img src="/manus-storage/codewiki-mark_myu2b3hi.png" alt="Code Wiki 分享标志" />
            <span><strong>CODE / WIKI</strong><small>field notes · 10 min</small></span>
          </a>
          <button className="rail-close" type="button" aria-label="关闭章节导航" onClick={() => setRailOpen(false)}><X size={18} /></button>
        </div>

        <nav className="chapter-nav" aria-label="章节">
          {chapters.map((chapter, index) => (
            <button className={`chapter-link ${activeChapter === chapter.id ? "is-active" : ""}`} type="button" key={chapter.id} onClick={() => navigate(chapter.id)}>
              <span className="chapter-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="chapter-copy">{chapter.label}</span>
              <time>{chapter.time}</time>
            </button>
          ))}
        </nav>

        <div className="rail-bottom">
          <div className="current-cue"><span>NOW SPEAKING</span><b>{currentChapter.label}</b><p>{currentChapter.time} / 10:00 · 以产品边界和实际接入状态组织讲解。</p></div>
          <div className="progress-wrap" aria-label={`阅读进度 ${progress}%`}><div className="progress-track"><span style={{ height: `${progress}%` }} /></div><span>{String(progress).padStart(2, "0")}%</span></div>
          <button className={`presentation-toggle ${presentationMode ? "is-active" : ""}`} type="button" aria-pressed={presentationMode} onClick={() => setPresentationMode((value) => !value)}>
            <Sparkles size={14} />{presentationMode ? "退出演讲模式" : "演讲模式"}
          </button>
          <p>开源项目依据公开仓库整理；闭源产品依据官网与官方文档整理。</p>
          {isAuthenticated && user && (
            <div className="auth-status-mini">
              <span>{user.name}</span>
              <button onClick={() => logout()}>退出</button>
            </div>
          )}
        </div>
      </aside>
      <main className="talk-content">
        <header className="mobile-header">
          <a href="#opening" className="mobile-brand" onClick={(event) => { event.preventDefault(); navigate("opening"); }}><img src="/manus-storage/codewiki-mark_myu2b3hi.png" alt="" /><span>CODE / WIKI</span></a>
          <button className="menu-button" type="button" aria-label="打开章节导航" onClick={() => setRailOpen(true)}><Menu size={20} /></button>
        </header>

        <section id="opening" className="hero section-anchor">
          <div className="hero-art" style={{ backgroundImage: "url('/manus-storage/codewiki-hero-graph_skxp5ef9.jpg')" }} />
          <div className="hero-overlay" />
          <div className="hero-brand-mark" aria-label="Code Wiki 研究工作台标志"><img src="/manus-storage/codewiki-mark_myu2b3hi.png" alt="" /><span>FIELD<br />INDEX</span></div>
          <div className="hero-content">
            <div className="eyebrow light"><span className="eyebrow-dot" /> 10 MIN TECH SHARE · 2026.09</div>
            <h1>理解代码库，<br /><em>先分清工具的边界。</em></h1>
            <p className="hero-lede">这次分享将 Code Wiki 工具分为两组：可阅读和改造的开源项目，以及通过产品、桌面端与 MCP 接入的闭源服务。</p>
            <div className="hero-actions"><button className="signal-button" type="button" onClick={() => navigate("landscape")}>开始讲解 <ArrowDownRight size={17} /></button><a className="quiet-link light-link" href="https://grok-wiki.com/" target="_blank" rel="noreferrer">实际使用：Grok-Wiki <ExternalLink size={14} /></a></div>
          </div>
          <div className="hero-margin-note"><span>本次新增</span><p>Devin 与 DeepWiki 作为同一产品体系介绍。<b>今天已安装 DeepWiki MCP 客户端。</b></p></div>
        </section>

        <section id="landscape" className="project-index section-anchor">
          <div className="section-heading split-heading">
            <div><div className="eyebrow"><span>01</span> 开放方式</div><h2>先看<strong>开源 / 闭源</strong>，<br />再看工作流。</h2></div>
            <p>开源与闭源并不决定工具优劣。它们影响的是你如何获得实现细节、如何部署和定制，以及是否通过产品接口把能力带入现有环境。</p>
          </div>

          <div className="camp-sections">
            {camps.map((camp) => (
              <section className={`camp-section camp-${camp.id}`} key={camp.id} aria-labelledby={`camp-${camp.id}`}>
                <div className="camp-heading"><div><div className="eyebrow"><span>{camp.id === "open" ? "A" : "B"}</span> {camp.eyebrow}</div><h3 id={`camp-${camp.id}`}>{camp.title}</h3></div><p>{camp.summary}</p></div>
                <div className={`project-grid camp-grid ${camp.id === "closed" ? "camp-grid-closed" : ""}`}>
                  {repositories.filter((project) => project.camp === camp.id).map((project) => (
                    <article className={`project-card ${project.id === activeProject ? "is-selected" : ""} ${project.statusTone === "verified" ? "is-verified" : ""}`} key={project.id}>
                      <button className="project-card-button" type="button" onClick={() => { setActiveProject(project.id); setImageLoadError(false); }} aria-pressed={project.id === activeProject}>
                        <div className="card-topline"><span className="project-number">{project.index}</span><span className={`status-chip ${project.statusTone}`}>{project.statusTone === "verified" ? <Check size={12} /> : <CircleDot size={11} />}{project.status}</span></div>
                        <h3>{project.name}</h3><p className="repo-label">{project.label}</p><p className="project-tagline">{project.tagline}</p>
                        <span className="inspect-label">{project.id === activeProject ? "已展开项目界面与要点" : "查看项目界面与要点"} <ChevronDown size={15} /></span>
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="project-dossier" key={selectedProject.id} aria-live="polite">
            <div className="dossier-index"><span>{selectedProject.index}</span><div className="dossier-spine" /></div>
            <div className="dossier-main">
              <div className="dossier-heading"><div><div className="eyebrow"><span>{selectedProject.camp === "open" ? "开源组" : "闭源组"}</span> 项目笔记</div><h3>{selectedProject.name}</h3></div><a className="source-link" href={selectedProject.url} target="_blank" rel="noreferrer">{selectedProject.urlLabel} <ExternalLink size={15} /></a></div>
              <figure className="dossier-visual">
                <div className="dossier-visual-head"><span>官方公开界面</span><a href={selectedProject.screenshotSource} target="_blank" rel="noreferrer">查看来源 <ExternalLink size={13} /></a></div>
                <a className="dossier-visual-link" href={selectedProject.screenshotSource} target="_blank" rel="noreferrer" aria-label={`打开 ${selectedProject.name} 的界面来源`}>
                  {imageLoadError ? <span className="dossier-visual-fallback" role="status"><ImageOff size={23} /><b>界面预览暂时未能加载</b><small>可点击此处查看官方公开来源。</small></span> : <img src={selectedProject.screenshot} alt={selectedProject.screenshotAlt} loading="eager" decoding="async" onError={() => setImageLoadError(true)} />}
                </a>
                <figcaption>{imageLoadError ? "已提供官方来源作为备用入口。" : "点击界面图可打开官方来源。"}</figcaption>
              </figure>
              <p className="dossier-summary">{selectedProject.description}</p>
              <div className="dossier-columns"><div><span>工作流</span><p>{selectedProject.method}</p></div><div><span>主要产物</span><p>{selectedProject.output}</p></div><div><span>适用场景</span><p>{selectedProject.bestFor}</p></div></div>
              <div className="talk-note"><span>项目要点</span><p>{selectedProject.talkPoint}</p></div>
            </div>
          </div>
        </section>

        <section id="devin" className="devin-section section-anchor">
          <div className="devin-copy">
            <div className="eyebrow"><span className="lime-marker">02</span> CLOSED SYSTEM / COGNITION</div>
            <h2>Devin 与 DeepWiki：<br /><em>同一体系的两个层级。</em></h2>
            <p className="devin-intro">DeepWiki 负责帮助开发者理解仓库：生成文档、架构图、源码链接，并围绕代码库提问。Devin 则把这类上下文带入更完整的工程工作流，包括代码搜索、规划和开发任务执行。</p>
            <div className="devin-chain" aria-label="Devin 与 DeepWiki 的关系">
              <div><span>01 / READ</span><strong>DeepWiki</strong><p>公开仓库的 Wiki、源码链接与问答入口。</p></div>
              <div><span>02 / CONNECT</span><strong>DeepWiki MCP</strong><p>将结构、内容和问答能力接入兼容 MCP 的本地客户端。</p></div>
              <div><span>03 / ACT</span><strong>Devin</strong><p>在更完整的应用中处理代码搜索、规划与工程执行。</p></div>
            </div>
            <div className="mcp-note"><Network size={18} /><div><span>你的接入状态</span><p><b>今天已安装 DeepWiki MCP 客户端。</b> 分享现场可先展示 `read_wiki_structure`、`read_wiki_contents` 与 `ask_question` 三类能力；页面不把“已安装”写成“已完成效果验证”。</p></div></div>
            <a className="devin-docs-link" href="https://docs.devin.ai/work-with-devin/deepwiki-mcp" target="_blank" rel="noreferrer">查看 DeepWiki MCP 官方说明 <ExternalLink size={15} /></a>
          </div>
          <figure className="devin-visual"><img src="/manus-storage/deepwiki-official-ui_pa7wq5ja.png" alt="Cognition 官方展示的 DeepWiki VS Code 文档页面" /><figcaption>官方示例：DeepWiki 文档页中同时保留目录、源码入口和 Ask Devin 提问区域。</figcaption></figure>
        </section>

        <section id="verified" className="verified-section section-anchor">
          <div className="fieldnotes-image" style={{ backgroundImage: "url('/manus-storage/grok-wiki-fieldnotes_frimdi9w.jpg')" }} />
          <div className="verified-copy">
            <div className="eyebrow"><span className="lime-marker">03</span> 实战焦点</div>
            <div className="verified-title-row"><h2>Grok-Wiki：<br /><em>从真实使用讲起。</em></h2><span className="verified-stamp"><Check size={14} /> 实际使用</span></div>
            <p className="verified-intro">本次分享会把 Grok-Wiki 放在闭源产品组中讨论，并以实际使用经验作为现场演示的主线。开源组的 DeepWiki-Open、OpenWiki 与 CodeWiki 用于补充不同的实现与维护路径。</p>
            <div className="demo-flow" aria-label="Grok-Wiki 现场演示路径"><div><span>01</span><strong>打开本地工作区</strong><p>从一个真实仓库进入，而非抽象罗列功能。</p></div><div><span>02</span><strong>提出具体问题</strong><p>围绕调用链、模块职责或入口文件提问。</p></div><div><span>03</span><strong>回到证据</strong><p>在 Wiki、源码引用和代码结构之间完成核对。</p></div></div>
            <div className="speaker-cue"><Clock3 size={17} /><p><b>建议占用 2 分 30 秒。</b> 以“问题 → 回答 → 回看代码”的顺序，呈现工具如何服务于理解。</p></div>
          </div>
        </section>

        <section id="comparison" className="comparison-section section-anchor">
          <div className="atlas-art" style={{ backgroundImage: "url('/manus-storage/codewiki-comparison-atlas_3c0n7t9g.jpg')" }} />
          <div className="comparison-content">
            <div className="section-heading compact-heading"><div className="eyebrow"><span>04</span> 如何选择</div><h2>用<strong>接入方式</strong>，<br />缩小选择范围。</h2><p>表格用于解释开放方式与工作流的差异。开源项目内容来自公开 README；闭源产品内容来自官网与官方文档。</p></div>
            <div className="comparison-table-wrap"><table><thead><tr><th>观察维度</th><th>开源项目</th><th>闭源产品 / 服务</th></tr></thead><tbody><tr><th>代表项目</th><td>DeepWiki-Open、OpenWiki、CodeWiki</td><td>Grok-Wiki、Devin / DeepWiki</td></tr><tr><th>获得能力的方式</th><td>阅读仓库、运行工具、修改实现或将产物纳入 Git。</td><td>通过官网、桌面工作区、应用接口或 MCP 连接使用。</td></tr><tr><th>知识沉淀</th><td>更容易将文档和配置当作可维护的代码资产。</td><td>更容易把已整理的上下文接入现成的提问与开发工作流。</td></tr><tr><th>当前分享中的位置</th><td>用于观察实现、文档产物和复杂架构处理策略。</td><td>Grok-Wiki 作为实际使用案例；DeepWiki MCP 作为当天已完成的客户端接入。</td></tr></tbody></table></div>
          </div>
        </section>

        <section className="decision-section">
          <div className="decision-caption"><Network size={18} /><span>选择时先确认需要的是源码控制、文档维护，还是现成服务的接入效率。</span></div>
          <div className="decision-cards four-cards">
            <article><div className="decision-topline"><span className="decision-number">01</span><span className="decision-context">READ / MODIFY</span><span className="decision-icon"><Braces size={19} /></span></div><h3>希望查看或改造实现？</h3><p>从 DeepWiki-Open、OpenWiki 与 CodeWiki 开始，先用公开代码验证工具的边界。</p><a href="https://github.com/AsyncFuncAI/deepwiki-open" target="_blank" rel="noreferrer">查看开源组 <ArrowUpRight size={14} /></a></article>
            <article><div className="decision-topline"><span className="decision-number">02</span><span className="decision-context">COMMIT / MAINTAIN</span><span className="decision-icon blue"><GitBranch size={19} /></span></div><h3>希望文档留在 Git 中？</h3><p>OpenWiki 的 CLI、链接 Markdown 和持续更新机制，值得在同一仓库中验证。</p><a href="https://github.com/langchain-ai/openwiki" target="_blank" rel="noreferrer">查看 OpenWiki <ArrowUpRight size={14} /></a></article>
            <article><div className="decision-topline"><span className="decision-number">03</span><span className="decision-context">MCP / CONNECT</span><span className="decision-icon charcoal"><Network size={19} /></span></div><h3>想从本地客户端提问？</h3><p>DeepWiki MCP 已完成安装，可用公开仓库验证结构、内容 and 问答工具。</p><a href="https://docs.devin.ai/work-with-devin/deepwiki-mcp" target="_blank" rel="noreferrer">查看 MCP 文档 <ArrowUpRight size={14} /></a></article>
            <article><div className="decision-topline"><span className="decision-number">04</span><span className="decision-context">PRESENT / NOW</span><span className="decision-icon"><ScanSearch size={19} /></span></div><h3>准备现场演示？</h3><p>从实际使用过的 Grok-Wiki 展开，直观呈现提问、上下文与代码核对的过程。</p><a href="https://grok-wiki.com/" target="_blank" rel="noreferrer">打开 Grok-Wiki <ArrowUpRight size={14} /></a></article>
          </div>
        </section>

        <section id="closing" className="closing-section section-anchor">
          <div className="closing-rule"><span>05</span><div /></div>
          <div className="closing-content">
            <p className="closing-kicker">Takeaway / 10:00</p><h2>Code Wiki 的价值，<br />在于让<strong>代码上下文</strong>进入工作流。</h2>
            <div className="closing-grid"><p>开源项目帮助团队掌握实现、产物与维护链路。闭源产品把文档、问答和工程任务放进可直接接入的服务中。这次分享以 Grok-Wiki 的实际使用为主线，并补充了今天完成安装的 DeepWiki MCP 客户端。</p><div className="source-notes"><div><FileText size={16} /><span>资料范围</span><b>三个公开仓库与闭源产品官方资料</b></div><div><Braces size={16} /><span>分享立场</span><b>实际经验、接入状态与克制对比</b></div><div><BookOpenText size={16} /><span>下一步</span><b>用同一仓库验证各类工作流</b></div></div></div>
            <div className="aftertalk-kit" aria-label="会后项目与官方链接清单"><div className="aftertalk-heading"><div><span className="closing-kicker">After the talk</span><h3>会后项目与官方链接</h3></div><p>开源仓库、产品官网与 MCP 文档都可一键复制，便于会后继续阅读和验证。</p></div><div className="repo-copy-list">{repositories.map((project) => (<div className="repo-copy-item" key={project.id}><span className="repo-copy-index">{project.index}</span><div><a href={project.url} target="_blank" rel="noreferrer">{project.name} <ExternalLink size={13} /></a><code>{project.url}</code></div><button type="button" onClick={() => copyLink(project.id, project.url)} aria-label={`复制 ${project.name} 链接`}>{copiedLink === project.id ? <><Check size={14} /> 已复制</> : <><Copy size={14} /> 复制链接</>}</button></div>))}</div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
