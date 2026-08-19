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

type Repository = {
  id: string;
  index: string;
  name: string;
  label: string;
  status: string;
  statusTone: "verified" | "research";
  tagline: string;
  description: string;
  method: string;
  output: string;
  bestFor: string;
  talkPoint: string;
  details: string[];
  url: string;
  screenshot: string;
  screenshotAlt: string;
  screenshotSource: string;
};

const repositories: Repository[] = [
  {
    id: "grok-wiki",
    index: "01",
    name: "Grok-Wiki",
    label: "deepwiki-open",
    status: "我实际使用过",
    statusTone: "verified",
    tagline: "让仓库中的知识可检索、可追问",
    description:
      "面向 GitHub、GitLab 与 Bitbucket 仓库的开源 DeepWiki 实现。输入仓库后，工具会分析结构、生成文档与图示，并组织为可导航的 Wiki。",
    method: "仓库解析 → 文档 / 图示 → 对话与 Code Map",
    output: "交互式 Wiki、说明图与代码导览",
    bestFor: "适合在分享现场演示如何快速理解一个仓库",
    talkPoint: "适合用作现场 Demo：从具体问题出发，再通过 Code Map 回到代码细节。",
    details: ["支持多种代码托管平台", "可生成可视化说明", "提供 Code Map 导览"],
    url: "https://github.com/AsyncFuncAI/deepwiki-open",
    screenshot: "/manus-storage/grok-wiki-official-demo_951e3c08.png",
    screenshotAlt: "Grok-Wiki 官网展示的本地代理桌面工作区，包含项目侧栏与任务面板",
    screenshotSource: "https://grok-wiki.com/#product-overview",
  },
  {
    id: "openwiki",
    index: "02",
    name: "OpenWiki",
    label: "langchain-ai/openwiki",
    status: "文档调研",
    statusTone: "research",
    tagline: "将 Wiki 保存在代码库中，并随变更更新",
    description:
      "一个为代码库或个人知识生成并维护 Wiki 的 CLI 工具。代理会读取源资料，生成相互链接的 Markdown 文档，并提供可探索的可视化图谱。",
    method: "代理读取源代码 → 链接 Markdown → CI 持续更新",
    output: "仓库内 Wiki、OKF 内容与可探索图谱",
    bestFor: "适合将知识资产留在 Git 中，并通过 CI 自动维护",
    talkPoint: "将 Wiki 作为仓库产物，随着每次提交持续更新。",
    details: ["CLI 工具", "支持代码库和个人知识两种模式", "支持自动化工作流更新"],
    url: "https://github.com/langchain-ai/openwiki",
    screenshot: "/manus-storage/openwiki-visualizer_d0d38f84.gif",
    screenshotAlt: "OpenWiki 的文档可视化图谱与页面导航界面",
    screenshotSource: "https://github.com/langchain-ai/openwiki/blob/main/static/visualizer.gif",
  },
  {
    id: "codewiki",
    index: "03",
    name: "CodeWiki",
    label: "FSoft-AI4Code/CodeWiki",
    status: "文档调研",
    statusTone: "research",
    tagline: "用层级分解与多代理处理复杂仓库",
    description:
      "面向多语言仓库的自动化文档框架，可梳理函数、跨文件调用、模块关系和系统架构。",
    method: "层级拆分 → 递归多代理 → 多模态综合",
    output: "文字文档、架构图、数据流与时序图",
    bestFor: "关注大规模、多语言代码库的结构化文档生成",
    talkPoint: "聚焦架构上下文的保留、分解与结构化输出。",
    details: ["支持九种编程语言", "递归多代理处理", "输出多类架构可视化"],
    url: "https://github.com/FSoft-AI4Code/CodeWiki",
    screenshot: "/manus-storage/codewiki-docs-interface_cddfe08d.png",
    screenshotAlt: "CodeWiki 自动生成的代码库文档浏览界面",
    screenshotSource: "https://fsoft-ai4code.github.io/CodeWiki/docs/index.html",
  },
];

const chapters = [
  { id: "opening", label: "开场问题", time: "0:00" },
  { id: "landscape", label: "三种路径", time: "1:00" },
  { id: "verified", label: "实战焦点", time: "4:00" },
  { id: "comparison", label: "如何选择", time: "6:30" },
  { id: "closing", label: "收束结论", time: "9:00" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [activeProject, setActiveProject] = useState("grok-wiki");
  const [activeChapter, setActiveChapter] = useState("opening");
  const [progress, setProgress] = useState(0);
  const [railOpen, setRailOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [copiedRepository, setCopiedRepository] = useState<string | null>(null);
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

  useEffect(() => {
    setImageLoadError(false);
  }, [activeProject]);

  const navigate = (id: string) => {
    setRailOpen(false);
    scrollToId(id);
  };

  const copyRepositoryUrl = async (id: string, url: string) => {
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
    setCopiedRepository(id);
    window.setTimeout(() => setCopiedRepository((current) => (current === id ? null : current)), 1600);
  };

  return (
    <div className={`workbench-shell ${presentationMode ? "presentation-mode" : ""}`}>
      <aside className={`talk-rail ${railOpen ? "is-open" : ""}`} aria-label="分享章节导航">
        <div className="rail-header">
          <a className="rail-brand" href="#opening" onClick={(event) => { event.preventDefault(); navigate("opening"); }}>
            <img src="/manus-storage/codewiki-mark_541b0d2d.png" alt="Code Wiki 分享标志" />
            <span>
              <strong>CODE / WIKI</strong>
              <small>field notes · 10 min</small>
            </span>
          </a>
          <button className="rail-close" type="button" aria-label="关闭章节导航" onClick={() => setRailOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="chapter-nav" aria-label="章节">
          {chapters.map((chapter, index) => (
            <button
              className={`chapter-link ${activeChapter === chapter.id ? "is-active" : ""}`}
              type="button"
              key={chapter.id}
              onClick={() => navigate(chapter.id)}
            >
              <span className="chapter-index">0{index + 1}</span>
              <span className="chapter-copy">{chapter.label}</span>
              <time>{chapter.time}</time>
            </button>
          ))}
        </nav>

        <div className="rail-bottom">
          <div className="current-cue">
            <span>NOW SPEAKING</span>
            <b>{currentChapter.label}</b>
            <p>{currentChapter.time} / 10:00 · 抓住一个具体问题，再给出证据。</p>
          </div>
          <div className="progress-wrap" aria-label={`阅读进度 ${progress}%`}>
            <div className="progress-track"><span style={{ height: `${progress}%` }} /></div>
            <span>{String(progress).padStart(2, "0")}%</span>
          </div>
          <button
            className={`presentation-toggle ${presentationMode ? "is-active" : ""}`}
            type="button"
            aria-pressed={presentationMode}
            onClick={() => setPresentationMode((value) => !value)}
          >
            <Sparkles size={14} />
            {presentationMode ? "退出演讲模式" : "演讲模式"}
          </button>
          <p>内容基于仓库 README 整理。Grok-Wiki 为实际使用项目；其他项目用于文档对比。</p>
        </div>
      </aside>

      <main className="talk-content">
        <header className="mobile-header">
          <a href="#opening" className="mobile-brand" onClick={(event) => { event.preventDefault(); navigate("opening"); }}>
            <img src="/manus-storage/codewiki-mark_541b0d2d.png" alt="" />
            <span>CODE / WIKI</span>
          </a>
          <button className="menu-button" type="button" aria-label="打开章节导航" onClick={() => setRailOpen(true)}>
            <Menu size={20} />
          </button>
        </header>

        <section id="opening" className="hero section-anchor">
          <div className="hero-art" style={{ backgroundImage: "url('/manus-storage/codewiki-hero-graph_faf27bc9.jpg')" }} />
          <div className="hero-overlay" />
          <div className="hero-brand-mark" aria-label="Code Wiki 研究工作台标志">
            <img src="/manus-storage/codewiki-mark_541b0d2d.png" alt="" />
            <span>FIELD<br />INDEX</span>
          </div>
          <div className="hero-content">
            <div className="eyebrow light"><span className="eyebrow-dot" /> 10 MIN TECH SHARE · 2026.08</div>
            <h1>代码库很大，<br /><em>先让它</em>回答问题。</h1>
            <p className="hero-lede">用十分钟梳理三条 Code Wiki 路线：即时探索、持续维护，以及面向复杂架构的生成框架。</p>
            <div className="hero-actions">
              <button className="signal-button" type="button" onClick={() => navigate("landscape")}>开始讲解 <ArrowDownRight size={17} /></button>
              <a className="quiet-link light-link" href="https://github.com/AsyncFuncAI/deepwiki-open" target="_blank" rel="noreferrer">实际使用：Grok-Wiki <ExternalLink size={14} /></a>
            </div>
          </div>
          <div className="hero-margin-note"><span>核心判断</span><p>它们都在解释代码。<b>知识如何沉淀、如何更新，决定了各自的工作流。</b></p></div>
        </section>

        <section id="landscape" className="project-index section-anchor">
          <div className="section-heading split-heading">
            <div>
              <div className="eyebrow"><span>01</span> 三种路径</div>
              <h2>按你的工作流，<br />选择<strong>知识沉淀方式</strong>。</h2>
            </div>
            <p>这三者都在回答“如何让仓库更易读”。它们在输出形态、维护方式和适用场景上各有侧重。</p>
          </div>

          <div className="project-grid">
            {repositories.map((project) => (
              <article
                className={`project-card ${project.id === activeProject ? "is-selected" : ""} ${project.statusTone === "verified" ? "is-verified" : ""}`}
                key={project.id}
              >
                <button className="project-card-button" type="button" onClick={() => { setActiveProject(project.id); setImageLoadError(false); }} aria-pressed={project.id === activeProject}>
                  <div className="card-topline">
                    <span className="project-number">{project.index}</span>
                    <span className={`status-chip ${project.statusTone}`}>{project.statusTone === "verified" && <Check size={12} />}{project.status}</span>
                  </div>
                  <h3>{project.name}</h3>
                  <p className="repo-label">{project.label}</p>
                  <p className="project-tagline">{project.tagline}</p>
                  <span className="inspect-label">{project.id === activeProject ? "已展开实际界面" : "查看实际界面与项目要点"} <ChevronDown size={15} /></span>
                </button>
              </article>
            ))}
          </div>

          <div className="project-dossier" key={selectedProject.id} aria-live="polite">
            <div className="dossier-index"><span>{selectedProject.index}</span><div className="dossier-spine" /></div>
            <div className="dossier-main">
              <div className="dossier-heading">
                <div>
                  <div className="eyebrow"><span>{selectedProject.statusTone === "verified" ? "已验证" : "调研记录"}</span> 项目笔记</div>
                  <h3>{selectedProject.name}</h3>
                </div>
                <a className="source-link" href={selectedProject.url} target="_blank" rel="noreferrer">阅读仓库 <ExternalLink size={15} /></a>
              </div>
              <figure className="dossier-visual">
                <div className="dossier-visual-head">
                  <span>官方公开界面</span>
                  <a href={selectedProject.screenshotSource} target="_blank" rel="noreferrer">查看来源 <ExternalLink size={13} /></a>
                </div>
                <a className="dossier-visual-link" href={selectedProject.screenshotSource} target="_blank" rel="noreferrer" aria-label={`打开 ${selectedProject.name} 的界面来源`}>
                  {imageLoadError ? (
                    <span className="dossier-visual-fallback" role="status">
                      <ImageOff size={23} />
                      <b>界面预览暂时未能加载</b>
                      <small>可点击此处查看官方公开来源。</small>
                    </span>
                  ) : (
                    <img
                      src={selectedProject.screenshot}
                      alt={selectedProject.screenshotAlt}
                      loading="eager"
                      decoding="async"
                      onError={() => setImageLoadError(true)}
                    />
                  )}
                </a>
                <figcaption>{imageLoadError ? "已提供官方来源作为备用入口。" : "点击界面图可打开官方来源。"}</figcaption>
              </figure>
              <p className="dossier-summary">{selectedProject.description}</p>
              <div className="dossier-columns">
                <div><span>工作流</span><p>{selectedProject.method}</p></div>
                <div><span>主要产物</span><p>{selectedProject.output}</p></div>
                <div><span>适用场景</span><p>{selectedProject.bestFor}</p></div>
              </div>
              <div className="talk-note"><span>项目要点</span><p>{selectedProject.talkPoint}</p></div>
            </div>
          </div>
        </section>

        <section id="verified" className="verified-section section-anchor">
          <div className="fieldnotes-image" style={{ backgroundImage: "url('/manus-storage/grok-wiki-fieldnotes_90a38cf7.jpg')" }} />
          <div className="verified-copy">
            <div className="eyebrow"><span className="lime-marker">02</span> 实战焦点</div>
            <div className="verified-title-row">
              <h2>Grok-Wiki：<br /><em>从真实使用讲起。</em></h2>
              <span className="verified-stamp"><Check size={14} /> 实际使用</span>
            </div>
            <p className="verified-intro">本次分享聚焦实际使用经验。我实际动手使用过 <strong>deepwiki-open / Grok-Wiki</strong>；演示和经验围绕它展开，其余两个项目用于补充说明后续可验证的技术路线。</p>
            <div className="demo-flow" aria-label="Grok-Wiki 现场演示路径">
              <div><span>01</span><strong>输入仓库</strong><p>从一个真实项目开始，不抽象谈能力。</p></div>
              <div><span>02</span><strong>提出问题</strong><p>围绕一个具体的调用链或模块提出问题。</p></div>
              <div><span>03</span><strong>回到代码</strong><p>借助 Wiki、图示与 Code Map 建立证据链。</p></div>
            </div>
            <div className="speaker-cue"><Clock3 size={17} /><p><b>建议占用 2 分 30 秒。</b> 用“问题 → Wiki 回答 → 代码回看”三步，串起具体功能和证据。</p></div>
          </div>
        </section>

        <section id="comparison" className="comparison-section section-anchor">
          <div className="atlas-art" style={{ backgroundImage: "url('/manus-storage/codewiki-comparison-atlas_d6885035.jpg')" }} />
          <div className="comparison-content">
            <div className="section-heading compact-heading">
              <div className="eyebrow"><span>03</span> 如何选择</div>
              <h2>围绕你的<strong>工作流</strong><br />选择合适的工具。</h2>
              <p>下表用于说明各项目的定位，内容根据各仓库 README 的公开描述整理。本页未进行性能测试或功能验证。</p>
            </div>
            <div className="comparison-table-wrap">
              <table>
                <thead><tr><th>观察维度</th><th>Grok-Wiki</th><th>OpenWiki</th><th>CodeWiki</th></tr></thead>
                <tbody>
                  <tr><th>主要关注</th><td>快速理解并探索仓库</td><td>生成、保存并持续维护 Wiki</td><td>保留复杂架构上下文</td></tr>
                  <tr><th>主要入口</th><td>交互式 Wiki / 问答体验</td><td>CLI 与仓库内 Markdown</td><td>文档生成框架与多代理流程</td></tr>
                  <tr><th>知识落点</th><td>可导航 Wiki 与 Code Map</td><td>版本控制的 Wiki / OKF</td><td>结构化文档与多类图示</td></tr>
                  <tr><th>现场可用的说法</th><td>“我先问这个仓库一个问题。”</td><td>“让文档随着每次提交持续更新。”</td><td>“仓库变大后，架构上下文也要保留下来。”</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="decision-section">
          <div className="decision-caption"><Network size={18} /><span>选择时要结合具体的工作流约束。</span></div>
          <div className="decision-cards">
            <article><div className="decision-topline"><span className="decision-number">01</span><span className="decision-context">PRESENT / NOW</span><span className="decision-icon"><ScanSearch size={19} /></span></div><h3>准备现场演示？</h3><p>以实际使用过的 Grok-Wiki 展开，直观呈现“提问”如何帮助理解代码。</p><a href="https://github.com/AsyncFuncAI/deepwiki-open" target="_blank" rel="noreferrer">查看 deepwiki-open <ArrowUpRight size={14} /></a></article>
            <article><div className="decision-topline"><span className="decision-number">02</span><span className="decision-context">COMMIT / MAINTAIN</span><span className="decision-icon blue"><GitBranch size={19} /></span></div><h3>希望文档留在 Git 中？</h3><p>OpenWiki 的 CLI、链接 Markdown 和持续更新机制，值得上手验证。</p><a href="https://github.com/langchain-ai/openwiki" target="_blank" rel="noreferrer">查看 OpenWiki <ArrowUpRight size={14} /></a></article>
            <article><div className="decision-topline"><span className="decision-number">03</span><span className="decision-context">SCALE / CONTEXT</span><span className="decision-icon charcoal"><Layers3 size={19} /></span></div><h3>需要梳理大仓库架构？</h3><p>CodeWiki 的层级拆分、递归处理和多模态输出，适合进一步上手验证。</p><a href="https://github.com/FSoft-AI4Code/CodeWiki" target="_blank" rel="noreferrer">查看 CodeWiki <ArrowUpRight size={14} /></a></article>
          </div>
        </section>

        <section id="closing" className="closing-section section-anchor">
          <div className="closing-rule"><span>04</span><div /></div>
          <div className="closing-content">
            <p className="closing-kicker">Takeaway / 10:00</p>
            <h2>Wiki 让<strong>“代码上下文”</strong><br />可被<strong>“检索、追问和理解”</strong>。</h2>
            <div className="closing-grid">
              <p>本次分享聚焦 Grok-Wiki 的实际使用体验。OpenWiki 和 CodeWiki 也带来两个后续问题：知识能否在版本控制中持续维护？复杂架构能否随着仓库规模增长继续被准确解释？</p>
              <div className="source-notes">
                <div><FileText size={16} /><span>资料范围</span><b>三个项目的公开 README</b></div>
                <div><Braces size={16} /><span>分享立场</span><b>实用经验 + 克制对比</b></div>
                <div><BookOpenText size={16} /><span>下一步</span><b>拿同一仓库做小规模验证</b></div>
              </div>
            </div>
            <div className="aftertalk-kit" aria-label="会后仓库链接清单">
              <div className="aftertalk-heading">
                <div>
                  <span className="closing-kicker">After the talk</span>
                  <h3>会后仓库链接清单</h3>
                </div>
                <p>点击“复制链接”即可将仓库地址保存到剪贴板，便于会后继续验证和阅读。</p>
              </div>
              <div className="repo-copy-list">
                {repositories.map((project) => (
                  <div className="repo-copy-item" key={project.id}>
                    <span className="repo-copy-index">{project.index}</span>
                    <div>
                      <a href={project.url} target="_blank" rel="noreferrer">{project.name} <ExternalLink size={13} /></a>
                      <code>{project.url}</code>
                    </div>
                    <button type="button" onClick={() => copyRepositoryUrl(project.id, project.url)} aria-label={`复制 ${project.name} 仓库链接`}>
                      {copiedRepository === project.id ? <><Check size={14} /> 已复制</> : <><Copy size={14} /> 复制链接</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
