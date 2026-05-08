import { readFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";

export const INTERFACE_TYPES = [
  "api",
  "browser",
  "cli",
  "desktop",
  "framework",
  "github-app",
  "ide",
  "library",
  "mcp",
  "skill-pack",
  "template",
  "web"
] as const;

export const DEPLOYMENT_TYPES = ["hosted", "local", "self-hosted", "hybrid", "not specified"] as const;
export const SOURCE_MODEL_TYPES = ["open-source", "source-available", "proprietary", "not specified"] as const;
export const CURATION_STATUS_TYPES = ["reviewed", "draft"] as const;

export type InterfaceType = (typeof INTERFACE_TYPES)[number];
export type DeploymentType = (typeof DEPLOYMENT_TYPES)[number];
export type SourceModelType = (typeof SOURCE_MODEL_TYPES)[number];
export type CurationStatus = (typeof CURATION_STATUS_TYPES)[number];

export interface Category {
  slug: string;
  name: string;
  description: string;
}

export interface Tag {
  slug: string;
  name: string;
  description: string;
}

export interface Tool {
  slug: string;
  name: string;
  description: string;
  website_url: string;
  repo_url?: string;
  docs_url?: string;
  categories: string[];
  primary_category?: string;
  tags: string[];
  interfaces: string[];
  deployment: string;
  source_model: string;
  license: string;
  curation_status: CurationStatus;
  review_notes?: string;
  added: string;
  last_checked: string;
  sources: string[];
}

export interface CatalogData {
  categories: Category[];
  tags: Tag[];
  tools: Tool[];
}

export const ROOT_FILES = {
  categories: join("data", "categories.yml"),
  tags: join("data", "tags.yml"),
  tools: join("data", "tools.yml"),
  readme: "README.md"
} as const;

export function loadCatalog(rootDir = process.cwd()): CatalogData {
  return {
    categories: readYamlArray<Category>(join(rootDir, ROOT_FILES.categories), "categories"),
    tags: readYamlArray<Tag>(join(rootDir, ROOT_FILES.tags), "tags"),
    tools: readYamlArray<Tool>(join(rootDir, ROOT_FILES.tools), "tools")
  };
}

export function readText(path: string): string {
  return readFileSync(path, "utf8");
}

export function readYamlArray<T>(path: string, label: string): T[] {
  const parsed = YAML.parse(readText(path));
  if (!Array.isArray(parsed)) {
    throw new Error(`${path} must contain a YAML array of ${label}.`);
  }
  return parsed as T[];
}

export function normalizeTool(tool: Tool): Tool {
  const normalized: Tool = {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    website_url: tool.website_url
  } as Tool;

  if (tool.repo_url) {
    normalized.repo_url = tool.repo_url;
  }
  if (tool.docs_url) {
    normalized.docs_url = tool.docs_url;
  }

  normalized.categories = sortedUnique(tool.categories ?? []);
  if (tool.primary_category) {
    normalized.primary_category = tool.primary_category;
  }
  normalized.tags = sortedUnique(tool.tags ?? []);
  normalized.interfaces = sortedUnique(tool.interfaces ?? []);
  normalized.deployment = tool.deployment;
  normalized.source_model = tool.source_model;
  normalized.license = tool.license;
  normalized.curation_status = tool.curation_status;
  if (tool.review_notes) {
    normalized.review_notes = tool.review_notes.trim();
  }
  normalized.added = tool.added;
  normalized.last_checked = tool.last_checked;
  normalized.sources = sortedUnique(tool.sources ?? []);
  return normalized;
}

export function sortTools(tools: Tool[]): Tool[] {
  return tools
    .map(normalizeTool)
    .sort((left, right) => left.name.localeCompare(right.name, "en") || left.slug.localeCompare(right.slug, "en"));
}

export function serializeTools(tools: Tool[]): string {
  return YAML.stringify(sortTools(tools), {
    lineWidth: 0,
    singleQuote: false
  });
}

export function slugNameMap<T extends { slug: string; name: string }>(items: T[]): Map<string, string> {
  return new Map(items.map((item) => [item.slug, item.name]));
}

export function slugItemMap<T extends { slug: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.slug, item]));
}

export function sortedUnique(values: string[]): string[] {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right, "en"));
}

export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function readmeAnchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
