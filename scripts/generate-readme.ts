import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  CatalogData,
  ROOT_FILES,
  Tool,
  loadCatalog,
  slugNameMap,
  sortTools
} from "./lib.ts";

export function buildReadme(catalog: CatalogData): string {
  const sorted = sortTools(catalog.tools);
  const categoryNames = slugNameMap(catalog.categories);
  const toolsByCategory = groupToolsByCategory(sorted);
  const populatedCategories = catalog.categories.filter((category) => (toolsByCategory.get(category.slug) ?? []).length > 0);
  const emptyCategories = catalog.categories.filter((category) => (toolsByCategory.get(category.slug) ?? []).length === 0);
  const orderedCategories = [...populatedCategories, ...emptyCategories];

  const lines: string[] = [
    "<!-- GENERATED FILE: edit data/tools.yml, data/categories.yml, data/tags.yml, then run npm run generate. -->",
    "",
    "# Awesome AI Devtools",
    "",
    "A structured directory of AI tools for developers: coding agents, MCP, browser agents, agent skills, evals, observability, security, and self-hosted workflows.",
    "",
    "## Why this exists",
    "",
    "AI developer tooling changes quickly. This repository keeps tool entries in structured metadata so listings can be validated, sorted, generated, reviewed, and later filtered without turning the README into the source of truth.",
    "",
    "The goal is not fake completeness or rankings. The goal is a useful, maintainable map of the AI developer tooling ecosystem.",
    "",
    "## Quick navigation",
    "",
    `- ${sorted.length} seed tools`,
    `- ${catalog.categories.length} categories`,
    `- ${catalog.tags.length} tags`,
    "- [Comparison matrix](#comparison-matrix)",
    "- [Categories](#categories)",
    "- [Submit a tool](#submit-a-tool)",
    "",
    "## Comparison matrix",
    "",
    "| Tool | Categories | Interfaces | Deployment | Source model | License |",
    "| --- | --- | --- | --- | --- | --- |",
    ...sorted.map((tool) => renderMatrixRow(tool, categoryNames)),
    "",
    "## Categories",
    ""
  ];

  for (const category of orderedCategories) {
    const categoryTools = toolsByCategory.get(category.slug) ?? [];
    lines.push(`### ${category.name}`, "", category.description, "");

    if (categoryTools.length === 0) {
      lines.push("_No seed entries yet._", "");
      continue;
    }

    for (const tool of categoryTools) {
      lines.push(renderToolBullet(tool), "");
    }
  }

  lines.push(
    "## Recently added",
    "",
    ...sorted
      .slice()
      .sort((left, right) => right.added.localeCompare(left.added) || left.name.localeCompare(right.name, "en"))
      .slice(0, 5)
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
    "Use official sources, keep descriptions factual, and leave uncertain metadata as `unknown` instead of guessing. See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/submission-guide.md](docs/submission-guide.md).",
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

function renderMatrixRow(tool: Tool, categoryNames: Map<string, string>): string {
  const categories = tool.categories.map((slug) => categoryNames.get(slug) ?? slug).join(", ");
  return [
    `| ${escapeTable(tool.name)}`,
    escapeTable(categories),
    escapeTable(tool.interfaces.join(", ")),
    escapeTable(tool.deployment),
    escapeTable(tool.source_model),
    `${escapeTable(tool.license)} |`
  ].join(" | ");
}

function renderToolBullet(tool: Tool): string {
  const links = [
    `[website](${tool.website_url})`,
    tool.repo_url ? `[repo](${tool.repo_url})` : undefined,
    tool.docs_url ? `[docs](${tool.docs_url})` : undefined
  ].filter(Boolean);

  return `- [${escapeMarkdown(tool.name)}](${tool.website_url}) - ${tool.description} _${links.join(" | ")}_`;
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
