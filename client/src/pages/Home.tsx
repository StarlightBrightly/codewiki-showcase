/**
 * Style context — 维护者的工作台：瑞士编辑设计 + 研究笔记。
 * 墨黑索引轨道、雾白纸张、Signal Lime 只用于“已验证”和关键结论；叙事优先于装饰。
 */
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpenText,
  Braces,
  Check,
  CircleDot,
  Copy,
  ExternalLink,
  FileText,
  GitBranch,
  ImageOff,
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
  screenshot?: string;
  screenshotAlt?: string;
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
      "该公开仓库展示了从代码结构分析到 Wiki、图示和 Code Map 的交互式流程，适合对照源码和界面讨论生成与导览。",
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
    status: "公开仓库",
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
    status: "公开仓库",
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
    status: "实际使用",
    statusTone: "verified",
    tagline: "让本地代理围绕仓库上下文生成、提问与执行任务",
    description:
      "当前官网将 Grok-Wiki 定位为本地代理桌面工作区，包含 Projects、Wiki、Ask、Docs、Tasks 与 Terminal 等界面。它通过本地 CLI 代理处理模型访问与仓库工作流。",
    method: "选择仓库 → 本地代理建立上下文 → Wiki / Ask / Docs / Tasks",
    output: "桌面工作区、可追问的仓库上下文与任务流",
    bestFor: "希望在本地桌面工作区中围绕仓库提问、查阅文档并执行任务",
    talkPoint:
      "用一条实际使用路径来看：把具体问题放进仓库上下文，再回看证据与代码。",
    url: "https://grok-wiki.com/",
    urlLabel: "打开官网",
    screenshotSource: "https://grok-wiki.com/#product-overview",
  },
  {
    id: "devin-deepwiki",
    index: "05",
    name: "Devin / DeepWiki",
    label: "Cognition · 闭源服务体系",
    camp: "closed",
    status: "可在线问答",
    statusTone: "connected",
    tagline: "让代码库文档、问答和工程执行处在同一产品体系",
    description:
      "DeepWiki 是 Cognition 推出的 Devin Wiki 与 Devin Search 的免费公开版本。它负责公开仓库的文档、源码链接和问答；Devin 提供更完整的代码搜索、规划与工程执行能力。",
    method: "DeepWiki 索引与问答 → MCP 接入 → Devin 工程执行",
    output: "公开仓库 Wiki、架构图、源码链接与问答",
    bestFor: "希望先用公开仓库验证文档、架构图和问答能力的场景",
    talkPoint:
      "现场打开 DeepWiki，选一个公开仓库做简短问答，看它如何用文档和源码链接回答具体问题。",
    url: "https://deepwiki.com/",
    urlLabel: "打开 DeepWiki",
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

export function ProjectDossier({
  project,
  imageLoadError,
  onImageError,
}: {
  project: Repository;
  imageLoadError: boolean;
  onImageError: () => void;
}) {
  const headingId = `dossier-heading-${project.id}`;
  const campLabel = project.camp === "open" ? "开源组" : "闭源组";
  const hasScreenshot = Boolean(project.screenshot);

  return (
    <div
      className="project-dossier"
      id="project-dossier"
      role="region"
      aria-labelledby={headingId}
      aria-live="polite"
    >
      <figure className="dossier-visual">
        <a
          className="dossier-visual-link"
          href={project.screenshotSource}
          target="_blank"
          rel="noreferrer"
          aria-label={`打开 ${project.name} 的界面来源`}
        >
          {imageLoadError ? (
            <span className="dossier-visual-fallback" role="status">
              <ImageOff size={23} />
              <b>界面预览暂时未能加载</b>
              <small>可点击此处查看官方公开来源。</small>
            </span>
          ) : !hasScreenshot ? (
            <span className="dossier-visual-fallback" role="status">
              <ImageOff size={23} />
              <b>暂不提供截图</b>
              <small>打开官方来源</small>
            </span>
          ) : (
            <img
              src={project.screenshot}
              alt={project.screenshotAlt}
              loading="eager"
              decoding="async"
              onError={onImageError}
            />
          )}
          <span className="dossier-visual-caption">
            <span>{hasScreenshot ? "官方公开界面" : "仅提供文字来源"}</span>
            <span>
              查看来源 <ExternalLink size={12} />
            </span>
          </span>
        </a>
      </figure>
      <div className="dossier-main">
        <header className="dossier-heading">
          <p className="eyebrow">
            <span>{project.index}</span> {campLabel}
          </p>
          <h3 id={headingId}>{project.name}</h3>
          <p className="dossier-label">{project.label}</p>
          <a
            className="source-link"
            href={project.url}
            target="_blank"
            rel="noreferrer"
          >
            {project.urlLabel} <ExternalLink size={14} />
          </a>
        </header>
        <p className="dossier-summary">{project.description}</p>
        <dl className="dossier-facts">
          <div>
            <dt>工作流</dt>
            <dd>{project.method}</dd>
          </div>
          <div>
            <dt>主要产物</dt>
            <dd>{project.output}</dd>
          </div>
          <div>
            <dt>适用场景</dt>
            <dd>{project.bestFor}</dd>
          </div>
        </dl>
        <div className="talk-note">
          <span>讲解要点</span>
          <p>{project.talkPoint}</p>
        </div>
      </div>
    </div>
  );
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
  const hasUserPickedProject = useRef(false);

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

  useEffect(() => {
    if (!hasUserPickedProject.current) return;
    document
      .querySelector(".project-card.is-selected")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeProject]);

  const selectProject = (projectId: string) => {
    hasUserPickedProject.current = true;
    setActiveProject(projectId);
    setImageLoadError(false);
  };

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
            <span><strong>CODE / WIKI</strong><small>tech share · 10 min</small></span>
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
          <div className="current-cue"><span>当前章节</span><b>{currentChapter.label}</b><p>{currentChapter.time} / 10:00 · 按开源、闭源和工作流比较这些工具。</p></div>
          <div className="progress-wrap" aria-label={`讲解进度 ${progress}%`}><div className="progress-track"><span style={{ height: `${progress}%` }} /></div><span>{String(progress).padStart(2, "0")}%</span></div>
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
          <div className="hero-brand-mark" aria-label="Code Wiki 分享标志"><img src="/manus-storage/codewiki-mark_myu2b3hi.png" alt="" /><span>FIELD<br />INDEX</span></div>
          <div className="hero-content">
            <div className="eyebrow light"><span className="eyebrow-dot" /> 10 MIN TECH SHARE · 2026.09</div>
            <h1>代码库很大，<br /><em>让它来回答你的问题。</em></h1>
            <p className="hero-lede">这次分享将 Code Wiki 工具分为两组：可阅读和改造的开源项目，以及通过产品、桌面端与 MCP 接入的闭源服务。</p>
            <div className="hero-actions">
              <button
                className="signal-button"
                type="button"
                onClick={() => navigate("landscape")}
              >
                开始讲解 <ArrowDownRight size={17} />
              </button>
            </div>
          </div>
        </section>

        <section id="landscape" className="project-index section-anchor">
          <div className="section-heading split-heading">
            <div><div className="eyebrow"><span>01</span> 开放方式</div><h2>先看<strong>开源 / 闭源</strong>，<br />再看工作流。</h2></div>
            <p>开源与闭源并不决定工具优劣。它们影响的是你如何获得实现细节、如何部署和定制，以及是否通过产品接口把能力带入现有环境。</p>
          </div>

          <div className="camp-sections">
            {camps.map((camp) => {
              const campProjects = repositories.filter(
                (project) => project.camp === camp.id,
              );
              const selectedInCamp = selectedProject.camp === camp.id;

              return (
                <section
                  className={`camp-section camp-${camp.id} ${selectedInCamp ? "has-dossier" : ""}`}
                  key={camp.id}
                  aria-labelledby={`camp-${camp.id}`}
                >
                  <div className="camp-heading">
                    <div>
                      <div className="eyebrow">
                        <span>{camp.id === "open" ? "A" : "B"}</span>{" "}
                        {camp.eyebrow}
                      </div>
                      <h3 id={`camp-${camp.id}`}>{camp.title}</h3>
                    </div>
                    <p>{camp.summary}</p>
                  </div>
                  <div
                    className={`project-grid camp-grid ${camp.id === "closed" ? "camp-grid-closed" : ""}`}
                  >
                    {campProjects.map((project) => {
                      const selected = project.id === activeProject;
                      return (
                        <Fragment key={project.id}>
                          <article
                            className={`project-card ${selected ? "is-selected" : ""} ${project.statusTone === "verified" ? "is-verified" : ""}`}
                          >
                            <button
                              className="project-card-button"
                              type="button"
                              onClick={() => selectProject(project.id)}
                              aria-pressed={selected}
                              aria-controls="project-dossier"
                            >
                              <div className="card-topline">
                                <span className="project-number">
                                  {project.index}
                                </span>
                                <span className={`status-chip ${project.statusTone}`}>
                                  {project.statusTone === "verified" ? (
                                    <Check size={12} />
                                  ) : (
                                    <CircleDot size={11} />
                                  )}
                                  {project.status}
                                </span>
                              </div>
                              <h3>{project.name}</h3>
                              <p className="repo-label">{project.label}</p>
                              <p className="project-tagline">{project.tagline}</p>
                              <span className="inspect-label">
                                {selected ? "当前介绍" : "查看介绍"}
                                <ArrowDownRight size={15} />
                              </span>
                            </button>
                          </article>
                          {selected ? (
                            <ProjectDossier
                              project={selectedProject}
                              imageLoadError={imageLoadError}
                              onImageError={() => setImageLoadError(true)}
                            />
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </div>
                </section>
              );
            })}
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
            <div className="mcp-note"><ScanSearch size={18} /><div><span>现场演示</span><p>打开 DeepWiki，选一个公开仓库，提出一个具体问题，看文档、架构说明和源码链接如何支撑回答。</p></div></div>
            <a className="devin-docs-link" href="https://docs.devin.ai/work-with-devin/deepwiki-mcp" target="_blank" rel="noreferrer">查看 DeepWiki MCP 官方说明 <ExternalLink size={15} /></a>
          </div>
          <figure className="devin-visual">
            <a
              className="devin-source-card"
              href="https://cognition.com/blog/deepwiki"
              target="_blank"
              rel="noreferrer"
              aria-label="打开 Cognition 的 DeepWiki 官方来源"
            >
              <span className="dossier-visual-fallback" role="status">
                <ImageOff size={23} />
                <b>暂不提供截图</b>
                <small>打开官方来源 · 本仓库不复制闭源宣传截图。</small>
              </span>
            </a>
            <figcaption>Cognition 的 DeepWiki 官方介绍来源。</figcaption>
          </figure>
        </section>

        <section id="verified" className="verified-section section-anchor">
          <div className="fieldnotes-image" style={{ backgroundImage: "url('/manus-storage/grok-wiki-fieldnotes_frimdi9w.jpg')" }} />
          <div className="verified-copy">
            <div className="eyebrow"><span className="lime-marker">03</span> 实战焦点</div>
            <div className="verified-title-row"><h2>Grok-Wiki：<br /><em>从真实使用讲起。</em></h2><span className="verified-stamp"><Check size={14} /> 实际使用</span></div>
            <p className="verified-intro">接下来用 Grok-Wiki 走一条真实使用路径：打开本地工作区，提出具体问题，再回到代码核对。开源的 DeepWiki-Open、OpenWiki 与 CodeWiki 用来对照不同的实现和维护方式。</p>
            <div className="demo-flow" aria-label="Grok-Wiki 现场演示路径"><div><span>01</span><strong>打开本地工作区</strong><p>从一个正在用的仓库进入工作区。</p></div><div><span>02</span><strong>提出具体问题</strong><p>围绕调用链、模块职责或入口文件提问。</p></div><div><span>03</span><strong>回到证据</strong><p>在 Wiki、源码引用和代码结构之间完成核对。</p></div></div>
          </div>
        </section>

        <section id="comparison" className="comparison-section section-anchor">
          <div className="atlas-art" style={{ backgroundImage: "url('/manus-storage/codewiki-comparison-atlas_3c0n7t9g.jpg')" }} />
          <div className="comparison-content">
            <div className="section-heading compact-heading"><div className="eyebrow"><span>04</span> 如何选择</div><h2>用<strong>接入方式</strong>，<br />缩小选择范围。</h2><p>对照开放方式和工作流。开源一侧依据公开仓库，闭源一侧依据官网和官方文档。</p></div>
            <div className="comparison-table-wrap"><table><thead><tr><th>观察维度</th><th>开源项目</th><th>闭源产品 / 服务</th></tr></thead><tbody><tr><th>代表项目</th><td>DeepWiki-Open、OpenWiki、CodeWiki</td><td>Grok-Wiki、Devin / DeepWiki</td></tr><tr><th>获得能力的方式</th><td>阅读仓库、运行工具、修改实现或将产物纳入 Git。</td><td>通过官网、桌面工作区、应用接口或 MCP 连接使用。</td></tr><tr><th>知识沉淀</th><td>更容易将文档和配置当作可维护的代码资产。</td><td>更容易把已整理的上下文接入现成的提问与开发工作流。</td></tr><tr><th>现场能看到什么</th><td>实现路径、文档产物，以及复杂架构怎么被整理出来。</td><td>Grok-Wiki 的实际使用过程；DeepWiki 对公开仓库的简短问答。</td></tr></tbody></table></div>
          </div>
        </section>

        <section className="decision-section">
          <div className="decision-caption"><Network size={18} /><span>选择时先确认需要的是源码控制、文档维护，还是现成服务的接入效率。</span></div>
          <div className="decision-cards four-cards">
            <article><div className="decision-topline"><span className="decision-number">01</span><span className="decision-context">READ / MODIFY</span><span className="decision-icon"><Braces size={19} /></span></div><h3>希望查看或改造实现？</h3><p>从 DeepWiki-Open、OpenWiki 与 CodeWiki 开始，先用公开代码验证工具的边界。</p><a href="https://github.com/AsyncFuncAI/deepwiki-open" target="_blank" rel="noreferrer">查看开源组 <ArrowUpRight size={14} /></a></article>
            <article><div className="decision-topline"><span className="decision-number">02</span><span className="decision-context">COMMIT / MAINTAIN</span><span className="decision-icon blue"><GitBranch size={19} /></span></div><h3>希望文档留在 Git 中？</h3><p>OpenWiki 的 CLI、链接 Markdown 和持续更新机制，值得在同一仓库中验证。</p><a href="https://github.com/langchain-ai/openwiki" target="_blank" rel="noreferrer">查看 OpenWiki <ArrowUpRight size={14} /></a></article>
            <article><div className="decision-topline"><span className="decision-number">03</span><span className="decision-context">WEB / ASK</span><span className="decision-icon charcoal"><Network size={19} /></span></div><h3>想先在网页里提问？</h3><p>打开 DeepWiki，选一个公开仓库，直接看文档、架构图和问答结果。</p><a href="https://deepwiki.com/" target="_blank" rel="noreferrer">打开 DeepWiki <ArrowUpRight size={14} /></a></article>
            <article><div className="decision-topline"><span className="decision-number">04</span><span className="decision-context">DESKTOP / USE</span><span className="decision-icon"><ScanSearch size={19} /></span></div><h3>想看本地工作区怎么用？</h3><p>从 Grok-Wiki 的实际使用展开，看提问、上下文和代码核对如何串起来。</p><a href="https://grok-wiki.com/" target="_blank" rel="noreferrer">打开 Grok-Wiki <ArrowUpRight size={14} /></a></article>
          </div>
        </section>

        <section id="closing" className="closing-section section-anchor">
          <div className="closing-rule"><span>05</span><div /></div>
          <div className="closing-content">
            <p className="closing-kicker">Takeaway / 10:00</p><h2>Code Wiki 的价值，<br />在于让<strong>代码上下文</strong>进入工作流。</h2>
            <div className="closing-grid"><p>开源项目帮助团队掌握实现、产物与维护链路。闭源产品把文档、问答和工程任务放进可直接接入的服务中。选择时可以先问：需要看实现、把文档留在 Git，还是把问答接到现成工作流里。</p><div className="source-notes"><div><FileText size={16} /><span>资料范围</span><b>三个公开仓库与闭源产品官方资料</b></div><div><Braces size={16} /><span>分享立场</span><b>以实际使用为主，其余依据公开资料比较</b></div><div><BookOpenText size={16} /><span>下一步</span><b>会后用同一仓库把这些工作流都试一遍</b></div></div></div>
            <div className="aftertalk-kit" aria-label="会后项目与官方链接清单"><div className="aftertalk-heading"><div><span className="closing-kicker">After the talk</span><h3>会后项目与官方链接</h3></div><p>开源仓库、产品官网与 MCP 文档都可一键复制，便于会后继续阅读和验证。</p></div><div className="repo-copy-list">{repositories.map((project) => (<div className="repo-copy-item" key={project.id}><span className="repo-copy-index">{project.index}</span><div><a href={project.url} target="_blank" rel="noreferrer">{project.name} <ExternalLink size={13} /></a><code>{project.url}</code></div><button type="button" onClick={() => copyLink(project.id, project.url)} aria-label={`复制 ${project.name} 链接`}>{copiedLink === project.id ? <><Check size={14} /> 已复制</> : <><Copy size={14} /> 复制链接</>}</button></div>))}</div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
