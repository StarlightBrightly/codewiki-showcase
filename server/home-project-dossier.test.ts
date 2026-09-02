import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProjectDossier } from "../client/src/pages/Home";

const project = {
  id: "openwiki",
  index: "02",
  name: "OpenWiki",
  label: "langchain-ai/openwiki",
  camp: "open" as const,
  status: "公开仓库",
  statusTone: "research" as const,
  tagline: "将 Wiki 保存在代码库中，并随变更更新",
  description: "OpenWiki 生成相互链接的 Markdown 文档。",
  method: "代理读取源代码 → 链接 Markdown → CI 持续更新",
  output: "仓库内 Wiki 与可探索图谱",
  bestFor: "希望让知识资产留在 Git 中的团队",
  talkPoint: "把 Wiki 视为仓库产物。",
  url: "https://github.com/langchain-ai/openwiki",
  urlLabel: "阅读仓库",
  screenshot: "/manus-storage/openwiki-visualizer_80jboqa8.gif",
  screenshotAlt: "OpenWiki 的文档可视化图谱与页面导航界面",
  screenshotSource: "https://github.com/langchain-ai/openwiki/blob/main/static/visualizer.gif",
};

function renderDossier(
  projectOverrides: Partial<typeof project> = {},
  imageLoadError = false,
) {
  return renderToStaticMarkup(
    createElement(ProjectDossier, {
      project: { ...project, ...projectOverrides },
      imageLoadError,
      onImageError: () => undefined,
    }),
  );
}

describe("ProjectDossier", () => {
  it("renders an image when the project provides a screenshot", () => {
    const markup = renderDossier();

    expect(markup).toContain(
      '<img src="/manus-storage/openwiki-visualizer_80jboqa8.gif"',
    );
    expect(markup).toContain("官方公开界面");
  });

  it("renders the load-error fallback when a screenshot fails to load", () => {
    const markup = renderDossier({}, true);

    expect(markup).toContain("界面预览暂时未能加载");
    expect(markup).not.toContain("<img");
  });

  it("renders a source card without an image when no screenshot is provided", () => {
    const markup = renderDossier({
      screenshot: undefined,
      screenshotAlt: undefined,
    });

    expect(markup).not.toContain("<img");
    expect(markup).toContain("暂不提供截图");
    expect(markup).toContain("打开官方来源");
    expect(markup).toContain(
      'href="https://github.com/langchain-ai/openwiki/blob/main/static/visualizer.gif"',
    );
    expect(markup).toContain("仅提供文字来源");
  });
});
