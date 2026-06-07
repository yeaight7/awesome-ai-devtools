import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  Category,
  CatalogData,
  ROOT_FILES,
  Tool,
  loadCatalog,
  sortTools
} from "./lib.ts";

const INTENT_GROUPS = [
  {
    heading: "Build with agents",
    slugs: ["coding-agents", "terminal-agents", "ide-assistants", "browser-agents"]
  },
  {
    heading: "Extend agents",
    slugs: ["mcp-servers", "mcp-clients", "mcp-tooling", "agent-skill-packs", "prompt-workflow-libraries"]
  },
  {
    heading: "Operate agents",
    slugs: ["agent-observability", "agent-evals", "ai-devtools-security"]
  },
  {
    heading: "Run locally/self-host",
    slugs: ["self-hosted-ai-dev-stacks", "local-llm-developer-tools"]
  },
  {
    heading: "Automate repo work",
    slugs: [
      "repo-automation-tools",
      "ai-code-review-tools",
      "documentation-agents",
      "test-generation-agents",
      "devops-sre-agents"
    ]
  }
] as const;

const START_HERE_GROUPS = [
  {
    heading: "Agent skills and plugins",
    slugs: ["agent-powerups", "everything-claude-code", "claude-skills", "anthropic-skills", "superpowers"]
  },
  {
    heading: "Open-source coding agents",
    slugs: ["aider", "cline", "opencode", "openhands", "continue"]
  },
  {
    heading: "Self-hosted AI dev stacks",
    slugs: ["anythingllm", "dify", "onyx", "open-webui-platform", "tabby"]
  },
  {
    heading: "MCP tools",
    slugs: ["chrome-devtools-mcp", "github-mcp-server", "context7-mcp-server", "browserbase-mcp-server", "agent-powerups"]
  },
  {
    heading: "Observability and evals",
    slugs: ["arize-phoenix", "comet-opik", "helicone", "langfuse", "openlit"]
  },
  {
    heading: "Local-first picks",
    slugs: ["ollama", "lm-studio", "llamafile", "localai", "vllm"]
  }
] as const;

const MATRIX_LIMIT = 50;
export const DRAFT_QUEUE_LIMIT = 20;

export function buildReadme(catalog: CatalogData): string {
  const sorted = sortTools(catalog.tools);
  const reviewedTools = sorted.filter((tool) => tool.curation_status === "reviewed");
  const draftTools = sorted.filter((tool) => tool.curation_status === "draft");
  const reviewedByCategory = groupToolsByCategory(reviewedTools);
  const populatedCategories = catalog.categories.filter((category) => (reviewedByCategory.get(category.slug) ?? []).length > 0);
  const categoryBySlug = new Map(catalog.categories.map((category) => [category.slug, category]));
  const reviewedBySlug = new Map(reviewedTools.map((tool) => [tool.slug, tool]));

  const lines: string[] = [
    "<!-- GENERATED FILE: edit data/tools.yml, data/categories.yml, data/tags.yml, then run npm run generate. -->",
    "",
    "# Awesome AI Devtools",
    "",
    "<p align=\"center\"><img src=\"assets/awesome-ai-devtools-header.svg\" alt=\"Awesome AI Devtools ecosystem map\" width=\"100%\"></p>",
    "",
    "<p align=\"center\"><strong>The open-source map of the AI developer tooling ecosystem.</strong></p>",
    "",
    "<p align=\"center\">Window-shop coding agents, IDE assistants, MCP tooling, evals, observability, security, and self-hosted AI dev stacks.</p>",
    "",
    `<p align="center"><code>${sorted.length} tools</code> <code>${reviewedTools.length} reviewed</code> <code>${draftTools.length} draft</code> <code>${populatedCategories.length} active reviewed shelves</code></p>`,
    "",
    "## Why this exists",
    "",
    "AI developer tooling changes quickly. This directory keeps entries in structured metadata so the public view can stay polished while the data remains sortable, reviewable, and validation-backed.",
    "",
    "No rankings. No launch hype. Just a clean storefront for discovering tools worth a closer look.",
    "",
    "## Start here",
    "",
    ...renderStartHere(reviewedBySlug),
    "## Explore by intent",
    "",
    ...renderIntentGroups(categoryBySlug, reviewedByCategory),
    "## Comparison Matrix",
    "",
    `_Showing a curated top ${MATRIX_LIMIT} tools. See [docs/COMPARISON.md](docs/COMPARISON.md) for the full matrix of all ${reviewedTools.length} reviewed tools._`,
    "",
    "| Tool | Main shelf | OSS | Local | Self-hosted | CLI | IDE | MCP | Links |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...selectMatrixTools(reviewedTools).map((tool) => renderMatrixRow(tool, catalog.categories)),
    "",
    "<p align=\"center\"><img src=\"assets/awesome-ai-devtools-social-preview.gif\" alt=\"Awesome AI Devtools ecosystem map\" width=\"100%\"></p>",
    "",
	"## Browse The Shelves",
    ""
  ];

  for (const category of populatedCategories) {
    const categoryTools = reviewedByCategory.get(category.slug) ?? [];
    lines.push(`### ${category.name}`, "", category.description, "");
    lines.push("| Tool | Good for | Experience | Links |", "| --- | --- | --- | --- |");
    for (const tool of categoryTools) {
      lines.push(renderToolRow(tool));
    }
    lines.push("");
  }

  lines.push(
    "## New Arrivals",
    "",
    ...reviewedTools
      .slice()
      .sort((left, right) => right.added.localeCompare(left.added) || left.name.localeCompare(right.name, "en"))
      .slice(0, 8)
      .map((tool) => `- ${tool.added}: [${escapeMarkdown(tool.name)}](${tool.website_url})`),
    "",
    "## Needs review",
    "",
    draftTools.length === 0
      ? "No draft entries are waiting for review."
      : "Draft entries stay out of the main shelves until their metadata and sources are reviewed.",
    "",
    ...(draftTools.length > 0
      ? [
          "| Tool | Suggested shelf | Review note | Links |",
          "| --- | --- | --- | --- |",
          ...draftTools.slice(0, DRAFT_QUEUE_LIMIT).map((tool) => renderReviewQueueRow(tool, catalog.categories)),
          ...(draftTools.length > DRAFT_QUEUE_LIMIT
            ? [
                "",
                `_Showing ${DRAFT_QUEUE_LIMIT} of ${draftTools.length} draft entries. Full queue in \`data/tools.yml\`._`
              ]
            : []),
          ""
        ]
      : []),
    "## Submit a tool",
    "",
    "Add or update one tool by editing `data/tools.yml`, then run:",
    "",
    "```bash",
    "npm run sort",
    "npm run generate",
    "npm test",
    "```",
    "",
    "Use official sources, keep descriptions factual, and leave uncertain metadata as `not specified` instead of guessing. See [CONTRIBUTING.md](CONTRIBUTING.md).",
    "",
    "## Roadmap",
    "",
    ...renderRoadmap(draftTools, catalog.categories, reviewedByCategory),
    "- Add stale-entry and broken-link checks.",
    "- Improve generated filter views and category-level comparisons.",
    "- Keep the schema small and strict as the catalog grows.",
    ""
  );

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}

function renderRoadmap(draftTools: Tool[], categories: Category[], reviewedByCategory: Map<string, Tool[]>): string[] {
  const categoryOrder = new Map(categories.map((category, index) => [category.slug, index]));
  const reviewedCounts = categories.map((category) => ({
    category,
    count: reviewedByCategory.get(category.slug)?.length ?? 0
  }));
  const thinShelves = reviewedCounts
    .filter((item) => item.count > 0)
    .sort((left, right) => left.count - right.count || (categoryOrder.get(left.category.slug) ?? 0) - (categoryOrder.get(right.category.slug) ?? 0))
    .slice(0, 3);
  const emptyShelves = reviewedCounts.filter((item) => item.count === 0).map((item) => item.category);

  return [
    draftTools.length === 0
      ? "- Keep the reviewed shelves current while the draft queue is clear."
      : `- Review and promote ${draftTools.length} queued draft ${pluralizeEntry(draftTools.length)}, prioritising thin shelves.`,
    thinShelves.length === 0
      ? "- Expand thin reviewed shelves as quality entries are found."
      : `- Expand thin reviewed shelves: ${formatCategoryCounts(thinShelves)}.`,
    emptyShelves.length === 0
      ? "- Revisit shelf coverage as new AI devtool categories emerge."
      : `- Populate empty shelves when quality entries are found: ${formatCategoryNames(emptyShelves)}.`
  ];
}

function formatCategoryCounts(items: { category: Category; count: number }[]): string {
  return items
    .map((item) => `${item.category.name} (${item.count} reviewed)`)
    .join(", ");
}

function formatCategoryNames(categories: Category[]): string {
  return categories.map((category) => category.name).join(", ");
}

function pluralizeEntry(count: number): string {
  return count === 1 ? "entry" : "entries";
}

function groupToolsByCategory(tools: Tool[]): Map<string, Tool[]> {
  const grouped = new Map<string, Tool[]>();
  for (const tool of tools) {
    for (const category of tool.categories) {
      const current = grouped.get(category) ?? [];
      current.push(tool);
      grouped.set(category, current);
    }
  }
  return grouped;
}

function renderStartHere(reviewedBySlug: Map<string, Tool>): string[] {
  const lines: string[] = [];
  for (const group of START_HERE_GROUPS) {
    const tools = group.slugs.map((slug) => reviewedBySlug.get(slug)).filter((tool): tool is Tool => tool !== undefined);
    if (tools.length === 0) {
      continue;
    }

    lines.push(`### ${group.heading}`, "");
    for (const tool of tools) {
      lines.push(`- [${escapeMarkdown(tool.name)}](${tool.website_url}) - ${escapeMarkdown(tool.description)}`);
    }
    lines.push("");
  }
  return lines;
}

function renderIntentGroups(categoryBySlug: Map<string, Category>, toolsByCategory: Map<string, Tool[]>): string[] {
  const lines: string[] = [];
  for (const group of INTENT_GROUPS) {
    const shelves = group.slugs
      .map((slug) => categoryBySlug.get(slug))
      .filter((category): category is Category => category !== undefined && (toolsByCategory.get(category.slug) ?? []).length > 0);
    if (shelves.length === 0) {
      continue;
    }

    lines.push(`### ${group.heading}`, "");
    lines.push(
      shelves
        .map((category) => `[${escapeMarkdown(category.name)}](#${anchorFor(category.name)}) (${toolsByCategory.get(category.slug)?.length ?? 0})`)
        .join(" · ")
    );
    lines.push("");
  }
  return lines;
}

function renderToolRow(tool: Tool): string {
  return [
    `| [${escapeTable(tool.name)}](${tool.website_url})`,
    escapeTable(tool.description),
    escapeTable(renderExperience(tool)),
    `${renderLinks(tool)} |`
  ].join(" | ");
}

function renderMatrixRow(tool: Tool, orderedCategories: Category[]): string {
  return [
    `| [${escapeTable(tool.name)}](${tool.website_url})`,
    escapeTable(mainShelf(tool, orderedCategories)),
    yesNo(isOpenSource(tool)),
    yesNo(isLocal(tool)),
    yesNo(isSelfHosted(tool)),
    yesNo(hasInterfaceOrTag(tool, "cli", ["terminal"])),
    yesNo(hasInterfaceOrTag(tool, "ide", ["vscode", "jetbrains", "ide-assistant"])),
    yesNo(hasInterfaceOrTag(tool, "mcp", ["mcp"])),
    `${renderLinks(tool)} |`
  ].join(" | ");
}

function renderReviewQueueRow(tool: Tool, orderedCategories: Category[]): string {
  return [
    `| [${escapeTable(tool.name)}](${tool.website_url})`,
    escapeTable(mainShelf(tool, orderedCategories)),
    escapeTable(tool.review_notes ?? "Needs metadata review."),
    `${renderLinks(tool)} |`
  ].join(" | ");
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function renderLinks(tool: Tool): string {
  const websiteNorm = normalizeUrl(tool.website_url);
  const repoNorm = tool.repo_url ? normalizeUrl(tool.repo_url) : null;
  const docsNorm = tool.docs_url ? normalizeUrl(tool.docs_url) : null;

  const websiteMatchesRepo = repoNorm !== null && websiteNorm === repoNorm;
  const websiteMatchesDocs = docsNorm !== null && websiteNorm === docsNorm;

  const links: string[] = [];

  if (websiteMatchesRepo) {
    // Repo and Website are the same URL — Repo label is more informative.
    // Docs (if distinct) will appear before Repo below.
  } else if (websiteMatchesDocs) {
    // Docs and Website are the same URL — show Docs label to avoid a bare Website link.
    links.push(`[Docs](${tool.docs_url!})`);
  } else {
    links.push(`[Website](${tool.website_url})`);
  }

  // Add Docs when it is distinct from both website and repo.
  if (docsNorm !== null && !websiteMatchesDocs && (repoNorm === null || docsNorm !== repoNorm)) {
    links.push(`[Docs](${tool.docs_url!})`);
  }

  if (repoNorm !== null) {
    links.push(`[Repo](${tool.repo_url!})`);
  }

  // Fallback: tool always has a website_url — never leave an empty cell.
  if (links.length === 0) {
    links.push(`[Website](${tool.website_url})`);
  }

  return links.join(" / ");
}

function renderExperience(tool: Tool): string {
  const values = [...tool.interfaces, tool.deployment]
    .map(displayValue)
    .filter((value) => value !== "");
  return values.length > 0 ? values.join(" · ") : "See details";
}

function selectMatrixTools(tools: Tool[]): Tool[] {
  const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));
  const selected = new Map<string, Tool>();
  for (const group of START_HERE_GROUPS) {
    for (const slug of group.slugs) {
      const tool = bySlug.get(slug);
      if (tool) {
        selected.set(tool.slug, tool);
      }
    }
  }

  for (const tool of tools.slice().sort((left, right) => matrixScore(right) - matrixScore(left) || left.name.localeCompare(right.name, "en"))) {
    if (selected.size >= MATRIX_LIMIT) {
      break;
    }
    selected.set(tool.slug, tool);
  }

  return Array.from(selected.values()).slice(0, MATRIX_LIMIT);
}

function matrixScore(tool: Tool): number {
  let score = 0;
  if (isOpenSource(tool)) score += 4;
  if (isSelfHosted(tool)) score += 3;
  if (isLocal(tool)) score += 3;
  if (hasInterfaceOrTag(tool, "mcp", ["mcp"])) score += 3;
  if (hasInterfaceOrTag(tool, "cli", ["terminal"])) score += 2;
  if (hasInterfaceOrTag(tool, "ide", ["vscode", "jetbrains", "ide-assistant"])) score += 2;
  if (tool.repo_url) score += 1;
  return score;
}

function mainShelf(tool: Tool, orderedCategories: Category[]): string {
  const primarySlug = tool.primary_category;
  if (primarySlug) {
    const primary = orderedCategories.find((cat) => cat.slug === primarySlug);
    if (primary) return primary.name;
  }
  const match = orderedCategories.find((cat) => tool.categories.includes(cat.slug));
  return match?.name ?? titleize(tool.categories[0] ?? "not specified");
}

function isOpenSource(tool: Tool): boolean {
  return tool.source_model === "open-source" || tool.tags.includes("open-source");
}

function isLocal(tool: Tool): boolean {
  return tool.deployment === "local" || tool.tags.includes("local-first") || tool.tags.includes("offline");
}

function isSelfHosted(tool: Tool): boolean {
  return tool.deployment === "self-hosted" || tool.tags.includes("self-hosted");
}

function hasInterfaceOrTag(tool: Tool, value: string, tagValues: string[]): boolean {
  return tool.interfaces.includes(value) || tagValues.some((tag) => tool.tags.includes(tag));
}

function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

function displayValue(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "" || normalized === "unknown" || normalized === "not specified") {
    return "";
  }

  const labels: Record<string, string> = {
    api: "API",
    cli: "CLI",
    mcp: "MCP",
    ide: "IDE",
    web: "Web",
    desktop: "Desktop",
    browser: "Browser",
    "github-app": "GitHub app",
    "ide-extension": "IDE extension",
    "web-app": "Web app",
    "desktop-app": "Desktop app",
    "mcp-client": "MCP client",
    local: "Local",
    hosted: "Hosted",
    cloud: "Cloud",
    hybrid: "Hybrid",
    "self-hosted": "Self-hosted"
  };
  return labels[normalized] ?? titleize(value);
}

function titleize(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function anchorFor(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeTable(value: string): string {
  return value.replace(/[\\|\[\]]/g, (match) => `\\${match}`);
}

function escapeMarkdown(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

function isCliEntrypoint(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}

if (isCliEntrypoint()) {
  const rootDir = process.cwd();
  const catalog = loadCatalog(rootDir);
  
  const content = buildReadme(catalog);
  writeFileSync(join(rootDir, ROOT_FILES.readme), content);

  const comparisonContent = buildComparisonMatrix(catalog);
  writeFileSync(join(rootDir, "docs", "COMPARISON.md"), comparisonContent);
}

export function buildComparisonMatrix(catalog: CatalogData): string {
  const sorted = sortTools(catalog.tools);
  const reviewedTools = sorted.filter((tool) => tool.curation_status === "reviewed");

  const lines: string[] = [
    "<!-- GENERATED FILE: edit data/tools.yml, data/categories.yml, data/tags.yml, then run npm run generate. -->",
    "",
    "# Full Comparison Matrix",
    "",
    `This is the complete comparison matrix for all ${reviewedTools.length} reviewed tools.`,
    "",
    "| Tool | Main shelf | OSS | Local | Self-hosted | CLI | IDE | MCP | Links |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...reviewedTools.map((tool) => renderMatrixRow(tool, catalog.categories)),
    ""
  ];

  return lines.join("\n") + "\n";
}
