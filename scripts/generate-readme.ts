import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  CatalogData,
  ROOT_FILES,
  Tool,
  loadCatalog,
  sortTools
} from "./lib.ts";

export function buildReadme(catalog: CatalogData): string {
  const sorted = sortTools(catalog.tools);
  const toolsByCategory = groupToolsByCategory(sorted);
  const populatedCategories = catalog.categories.filter((category) => (toolsByCategory.get(category.slug) ?? []).length > 0);

  const lines: string[] = [
    "<!-- GENERATED FILE: edit data/tools.yml, data/categories.yml, data/tags.yml, then run npm run generate. -->",
    "",
    "# Awesome AI Devtools",
    "",
    "<p align=\"center\"><strong>The open-source map of the AI developer tooling ecosystem.</strong></p>",
    "",
    "<p align=\"center\">Window-shop coding agents, IDE assistants, MCP tooling, evals, observability, security, and self-hosted AI dev stacks.</p>",
    "",
    `<p align="center"><code>${sorted.length} tools</code> <code>${populatedCategories.length} active shelves</code> <code>metadata-first</code> <code>generated README</code></p>`,
    "",
    "## Why this exists",
    "",
    "AI developer tooling changes quickly. This directory keeps entries in structured metadata so the public view can stay polished while the data remains sortable, reviewable, and validation-backed.",
    "",
    "No rankings. No launch hype. Just a clean storefront for discovering tools worth a closer look.",
    "",
    "## Storefront",
    "",
    "| Shelf | What you will find | Tools |",
    "| --- | --- | ---: |",
    ...populatedCategories.map((category) => renderShelfRow(category, toolsByCategory.get(category.slug) ?? [])),
    "",
    "## Browse The Shelves",
    ""
  ];

  for (const category of populatedCategories) {
    const categoryTools = toolsByCategory.get(category.slug) ?? [];
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
    ...sorted
      .slice()
      .sort((left, right) => right.added.localeCompare(left.added) || left.name.localeCompare(right.name, "en"))
      .slice(0, 8)
      .map((tool) => `- ${tool.added}: [${escapeMarkdown(tool.name)}](${tool.website_url})`),
    "",
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
    "Use official sources, keep descriptions factual, and leave uncertain metadata as `not specified` instead of guessing. See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/submission-guide.md](docs/submission-guide.md).",
    "",
    "## Roadmap",
    "",
    "- Keep the metadata schema small and strict.",
    "- Add contribution-friendly seed coverage category by category.",
    "- Build generated filters and richer comparison views after the data model settles.",
    "- Design a future importer after the schema, validator, and generator have real usage.",
    ""
  );

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
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

function renderShelfRow(category: { slug: string; name: string; description: string }, tools: Tool[]): string {
  return `| [${escapeTable(category.name)}](#${anchorFor(category.name)}) | ${escapeTable(category.description)} | ${tools.length} |`;
}

function renderToolRow(tool: Tool): string {
  return [
    `| [${escapeTable(tool.name)}](${tool.website_url})`,
    escapeTable(tool.description),
    escapeTable(renderExperience(tool)),
    `${renderLinks(tool)} |`
  ].join(" | ");
}

function renderLinks(tool: Tool): string {
  const links = [
    `[Website](${tool.website_url})`,
    tool.docs_url ? `[Docs](${tool.docs_url})` : undefined,
    tool.repo_url ? `[Repo](${tool.repo_url})` : undefined
  ].filter(Boolean);

  return links.join(" / ");
}

function renderExperience(tool: Tool): string {
  const values = [...tool.interfaces, tool.deployment]
    .map(displayValue)
    .filter((value) => value !== "");
  return values.length > 0 ? values.join(" · ") : "See details";
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
  return escapeMarkdown(value).replace(/\|/g, "\\|");
}

function escapeMarkdown(value: string): string {
  return value.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
}

function isCliEntrypoint(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}

if (isCliEntrypoint()) {
  const rootDir = process.cwd();
  const catalog = loadCatalog(rootDir);
  const content = buildReadme(catalog);
  writeFileSync(join(rootDir, ROOT_FILES.readme), content);
}
