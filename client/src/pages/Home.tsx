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
  ChevronRight,
  CircleDot,
  Clock3,
  Code2,
  ExternalLink,
  FileText,
  GitBranch,
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
};

const repositories: Repository[] = [
  {
    id: "grok-wiki",
    index: "01",
    name: "Grok-Wiki",
    label: "deepwiki-open",
    status: "我实际使用过",
    statusTone: "verified",
    tagline: "把仓库变成可提问、可漫游的 Wiki",
    description:
      "面向 GitHub、GitLab 与 Bitbucket 仓库的开源 DeepWiki 实现。输入仓库后，工具会分析结构、生成文档与图示，并组织为可导航的 Wiki。",
    method: "仓库解析 → 文档 / 图示 → 对话与 Code Map",
    output: "交互式 Wiki、说明图与代码导览",
    bestFor: "需要在分享现场快速演示“读懂仓库”的效果",
    talkPoint: "我会把它当作唯一的实战 Demo：先问一个具体问题，再沿 Code Map 回到代码。",
    details: ["支持多种代码托管平台", "可生成可视化说明", "提供 Code Map 导览"],
    url: "https://github.com/AsyncFuncAI/deepwiki-open",
  },
  {
    id: "openwiki",
    index: "02",
    name: "OpenWiki",
    label: "langchain-ai/openwiki",
    status: "文档调研",
    statusTone: "research",
    tagline: "把 Wiki 写回你的代码库，并随变更维护",
    description:
      "一个生成并维护代码库或个人知识 Wiki 的 CLI。代理会把内容沉淀为相互链接的 Markdown，并提供供人探索的图谱可视化。",
    method: "代理阅读源代码 → 链接 Markdown → CI 持续更新",
    output: "仓库内 Wiki、OKF 内容与可探索图谱",
    bestFor: "希望把知识资产留在 Git，并让 CI 参与维护",
    talkPoint: "它的关键不是“生成一次”，而是把 Wiki 变成随提交更新的仓库产物。",
    details: ["CLI 形态", "代码库 / 个人知识两种模式", "支持自动化工作流更新"],
    url: "https://github.com/langchain-ai/openwiki",
  },
  {
    id: "codewiki",
    index: "03",
    name: "CodeWiki",
    label: "FSoft-AI4Code/CodeWiki",
    status: "文档调研",
    statusTone: "research",
    tagline: "以层级分解和多代理处理复杂仓库",
    description:
      "面向多语言仓库的自动化文档框架，强调跨文件、跨模块与系统层面的架构理解，而不只解释单个函数。",
    method: "层级拆分 → 递归多代理 → 多模态综合",
    output: "文字文档、架构图、数据流与时序图",
    bestFor: "关注大规模、多语言代码库的结构化文档生成",
    talkPoint: "它更像研究与工程框架：重点在如何保留架构上下文，而非只输出一页摘要。",
    details: ["面向九种编程语言", "递归多代理处理", "输出多类架构可视化"],
    url: "https://github.com/FSoft-AI4Code/CodeWiki",
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

  const navigate = (id: string) => {
    setRailOpen(false);
    scrollToId(id);
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
          <p>基于仓库 README 调研。Grok-Wiki 标记为实际使用，其余为阅读对比。</p>
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
            <h1>代码库很大，<br /><em>先让它</em>能被提问。</h1>
            <p className="hero-lede">用十分钟看三种 Code Wiki 路径：即时探索、持续维护，以及面向复杂架构的生成框架。</p>
            <div className="hero-actions">
              <button className="signal-button" type="button" onClick={() => navigate("landscape")}>开始讲解 <ArrowDownRight size={17} /></button>
              <a className="quiet-link light-link" href="https://github.com/AsyncFuncAI/deepwiki-open" target="_blank" rel="noreferrer">实际使用：Grok-Wiki <ExternalLink size={14} /></a>
            </div>
          </div>
          <div className="hero-margin-note"><span>核心判断</span><p>它们都在解释代码；真正的差异是：<b>知识最后留在哪里，如何持续变新。</b></p></div>
        </section>

        <section id="landscape" className="project-index section-anchor">
          <div className="section-heading split-heading">
            <div>
              <div className="eyebrow"><span>01</span> 三种路径</div>
              <h2>不是谁更好，<br />而是你要哪一种<strong>知识落点</strong>。</h2>
            </div>
            <p>这三者共同回答“如何让仓库更可读”，但它们对产物、维护方式与适用现场的回答并不相同。</p>
          </div>

          <div className="project-grid">
            {repositories.map((project) => (
              <article
                className={`project-card ${project.id === activeProject ? "is-selected" : ""} ${project.statusTone === "verified" ? "is-verified" : ""}`}
                key={project.id}
              >
                <button className="project-card-button" type="button" onClick={() => setActiveProject(project.id)} aria-pressed={project.id === activeProject}>
                  <div className="card-topline">
                    <span className="project-number">{project.index}</span>
                    <span className={`status-chip ${project.statusTone}`}>{project.statusTone === "verified" && <Check size={12} />}{project.status}</span>
                  </div>
                  <h3>{project.name}</h3>
                  <p className="repo-label">{project.label}</p>
                  <p className="project-tagline">{project.tagline}</p>
                  <span className="inspect-label">展开讲解笔记 <ChevronRight size={15} /></span>
                </button>
              </article>
            ))}
          </div>

          <div className="project-dossier" aria-live="polite">
            <div className="dossier-index"><span>{selectedProject.index}</span><div className="dossier-spine" /></div>
            <div className="dossier-main">
              <div className="dossier-heading">
                <div>
                  <div className="eyebrow"><span>{selectedProject.statusTone === "verified" ? "已验证" : "调研记录"}</span> 项目笔记</div>
                  <h3>{selectedProject.name}</h3>
                </div>
                <a className="source-link" href={selectedProject.url} target="_blank" rel="noreferrer">阅读仓库 <ExternalLink size={15} /></a>
              </div>
              <p className="dossier-summary">{selectedProject.description}</p>
              <div className="dossier-columns">
                <div><span>工作流</span><p>{selectedProject.method}</p></div>
                <div><span>主要产物</span><p>{selectedProject.output}</p></div>
                <div><span>适合何时提起</span><p>{selectedProject.bestFor}</p></div>
              </div>
              <div className="talk-note"><span>现场说法</span><p>“{selectedProject.talkPoint}”</p></div>
            </div>
          </div>
        </section>

        <section id="verified" className="verified-section section-anchor">
          <div className="fieldnotes-image" style={{ backgroundImage: "url('/manus-storage/grok-wiki-fieldnotes_90a38cf7.jpg')" }} />
          <div className="verified-copy">
            <div className="eyebrow"><span className="lime-marker">02</span> 实战焦点</div>
            <div className="verified-title-row">
              <h2>Grok-Wiki：<br /><em>把真实使用放在台前。</em></h2>
              <span className="verified-stamp"><Check size={14} /> 实际使用</span>
            </div>
            <p className="verified-intro">这不是一场三工具“横评”。我实际动手使用过的是 <strong>deepwiki-open / Grok-Wiki</strong>；因此演示和经验只围绕它展开，其他两项只作为值得继续验证的技术路径。</p>
            <div className="demo-flow" aria-label="Grok-Wiki 现场演示路径">
              <div><span>01</span><strong>输入仓库</strong><p>从一个真实项目开始，不抽象谈能力。</p></div>
              <div><span>02</span><strong>提出问题</strong><p>用一个具体的调用链或模块问题打开。</p></div>
              <div><span>03</span><strong>回到代码</strong><p>借助 Wiki、图示与 Code Map 建立证据链。</p></div>
            </div>
            <div className="speaker-cue"><Clock3 size={17} /><p><b>建议占用 2 分 30 秒。</b> 用“问题 → Wiki 回答 → 代码回看”三步，胜过泛泛展示功能列表。</p></div>
          </div>
        </section>

        <section id="comparison" className="comparison-section section-anchor">
          <div className="atlas-art" style={{ backgroundImage: "url('/manus-storage/codewiki-comparison-atlas_d6885035.jpg')" }} />
          <div className="comparison-content">
            <div className="section-heading compact-heading">
              <div className="eyebrow"><span>03</span> 如何选择</div>
              <h2>把比较拉回<br />你的<strong>工作流</strong>。</h2>
              <p>下面的表格用于讲解定位，不是基准测试，也不是功能承诺。每一列都从各仓库 README 的公开描述中提炼。</p>
            </div>
            <div className="comparison-table-wrap">
              <table>
                <thead><tr><th>观察维度</th><th>Grok-Wiki</th><th>OpenWiki</th><th>CodeWiki</th></tr></thead>
                <tbody>
                  <tr><th>优先解决</th><td>快速理解并探索仓库</td><td>生成、拥有并持续维护 Wiki</td><td>保留复杂架构上下文</td></tr>
                  <tr><th>主要入口</th><td>交互式 Wiki / 问答体验</td><td>CLI 与仓库内 Markdown</td><td>文档生成框架与多代理流程</td></tr>
                  <tr><th>知识落点</th><td>可导航 Wiki 与 Code Map</td><td>版本控制的 Wiki / OKF</td><td>结构化文档与多类图示</td></tr>
                  <tr><th>适合的分享句式</th><td>“让我先问这个仓库一个问题。”</td><td>“让文档成为提交的一部分。”</td><td>“规模变大后，上下文不能丢。”</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="decision-section">
          <div className="decision-caption"><Network size={18} /><span>选择不是排名，而是约束匹配。</span></div>
          <div className="decision-cards">
            <article><div className="decision-topline"><span className="decision-number">01</span><span className="decision-context">PRESENT / NOW</span><span className="decision-icon"><ScanSearch size={19} /></span></div><h3>要做现场 Demo？</h3><p>从你已实际使用过的 Grok-Wiki 出发；让观众看到“提问”如何引导理解。</p><a href="https://github.com/AsyncFuncAI/deepwiki-open" target="_blank" rel="noreferrer">查看 deepwiki-open <ArrowUpRight size={14} /></a></article>
            <article><div className="decision-topline"><span className="decision-number">02</span><span className="decision-context">COMMIT / MAINTAIN</span><span className="decision-icon blue"><GitBranch size={19} /></span></div><h3>要把文档留在 Git？</h3><p>OpenWiki 的 CLI、链接 Markdown 与持续更新思路更值得进一步验证。</p><a href="https://github.com/langchain-ai/openwiki" target="_blank" rel="noreferrer">查看 OpenWiki <ArrowUpRight size={14} /></a></article>
            <article><div className="decision-topline"><span className="decision-number">03</span><span className="decision-context">SCALE / CONTEXT</span><span className="decision-icon charcoal"><Layers3 size={19} /></span></div><h3>要研究大仓库架构？</h3><p>CodeWiki 的层级拆分、递归处理与多模态输出值得深入试跑。</p><a href="https://github.com/FSoft-AI4Code/CodeWiki" target="_blank" rel="noreferrer">查看 CodeWiki <ArrowUpRight size={14} /></a></article>
          </div>
        </section>

        <section id="closing" className="closing-section section-anchor">
          <div className="closing-rule"><span>04</span><div /></div>
          <div className="closing-content">
            <p className="closing-kicker">Takeaway / 10:00</p>
            <h2>Wiki 不只是文档。<br />它是一条把<strong>“代码”</strong>变成<strong>“可追问的上下文”</strong>的路径。</h2>
            <div className="closing-grid">
              <p>这次分享只对 Grok-Wiki 给出实际使用视角。OpenWiki 与 CodeWiki 则提供两个后续问题：知识能否被版本控制地维护？复杂架构能否在规模增长时仍被准确解释？</p>
              <div className="source-notes">
                <div><FileText size={16} /><span>资料范围</span><b>三个项目的公开 README</b></div>
                <div><Braces size={16} /><span>分享立场</span><b>实用经验 + 克制对比</b></div>
                <div><BookOpenText size={16} /><span>下一步</span><b>拿同一仓库做小规模验证</b></div>
              </div>
            </div>
            <div className="repository-links">
              {repositories.map((project) => <a key={project.id} href={project.url} target="_blank" rel="noreferrer"><CircleDot size={12} /> {project.name} <ExternalLink size={13} /></a>)}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
