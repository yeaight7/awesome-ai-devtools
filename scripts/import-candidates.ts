import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildReadme } from "./generate-readme.ts";
import {
  CatalogData,
  DEPLOYMENT_TYPES,
  DeploymentType,
  INTERFACE_TYPES,
  InterfaceType,
  ROOT_FILES,
  SOURCE_MODEL_TYPES,
  SourceModelType,
  Tool,
  isHttpUrl,
  loadCatalog,
  serializeTools,
  sortedUnique
} from "./lib.ts";

interface CandidateInput {
  slug?: unknown;
  name?: unknown;
  description?: unknown;
  website_url?: unknown;
  repo_url?: unknown;
  docs_url?: unknown;
  categories?: unknown;
  tags?: unknown;
  interfaces?: unknown;
  deployment?: unknown;
  source_model?: unknown;
  license?: unknown;
  sources?: unknown;
  notes?: unknown;
  confidence?: unknown;
  uncertain?: unknown;
}

export interface ImportOptions {
  today?: string;
}

export interface ImportFileOptions extends ImportOptions {
  rootDir?: string;
  dryRun?: boolean;
}

export interface ImportIssue {
  line: number;
  name?: string;
  reason: string;
}

export interface ImportSummary {
  imported: string[];
  skippedDuplicates: ImportIssue[];
  rejected: ImportIssue[];
  droppedValues: ImportIssue[];
}

export interface ImportResult extends ImportSummary {
  catalog: CatalogData;
}

interface Indexes {
  slugs: Set<string>;
  names: Set<string>;
  repoUrls: Set<string>;
  websiteUrls: Set<string>;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function importCandidateLines(catalog: CatalogData, content: string, options: ImportOptions = {}): ImportResult {
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const nextCatalog: CatalogData = {
    categories: catalog.categories,
    tags: catalog.tags,
    tools: [...catalog.tools]
  };
  const result: ImportResult = {
    catalog: nextCatalog,
    imported: [],
    skippedDuplicates: [],
    rejected: [],
    droppedValues: []
  };
  const categoryLookup = buildLookup(catalog.categories);
  const tagLookup = buildLookup(catalog.tags);
  const indexes = buildIndexes(nextCatalog.tools);

  content.split(/\r?\n/).forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();
    if (trimmed === "") {
      return;
    }

    let candidate: CandidateInput;
    try {
      candidate = JSON.parse(trimmed) as CandidateInput;
    } catch (error) {
      result.rejected.push({
        line: lineNumber,
        reason: `line ${lineNumber}: Invalid JSON. ${(error as Error).message}`
      });
      return;
    }

    const conversion = candidateToTool(candidate, {
      today,
      line: lineNumber,
      categoryLookup,
      tagLookup,
      indexes
    });

    if (conversion.kind === "rejected") {
      result.rejected.push(conversion.issue);
      return;
    }

    if (conversion.kind === "duplicate") {
      result.skippedDuplicates.push(conversion.issue);
      return;
    }

    if (conversion.droppedValues.length > 0) {
      result.droppedValues.push(...conversion.droppedValues);
    }

    nextCatalog.tools.push(conversion.tool);
    addToIndexes(indexes, conversion.tool);
    result.imported.push(conversion.tool.slug);
  });

  return result;
}

export function importCandidatesFromFile(path: string, options: ImportFileOptions = {}): ImportResult {
  const rootDir = options.rootDir ?? process.cwd();
  const catalog = loadCatalog(rootDir);
  const content = readFileSync(path, "utf8");
  const result = importCandidateLines(catalog, content, options);

  if (!options.dryRun && result.rejected.length === 0) {
    writeFileSync(join(rootDir, ROOT_FILES.tools), serializeTools(result.catalog.tools));
    writeFileSync(join(rootDir, ROOT_FILES.readme), buildReadme(result.catalog));
  }

  return result;
}

function candidateToTool(
  candidate: CandidateInput,
  context: {
    today: string;
    line: number;
    categoryLookup: Map<string, string>;
    tagLookup: Map<string, string>;
    indexes: Indexes;
  }
):
  | { kind: "imported"; tool: Tool; droppedValues: ImportIssue[] }
  | { kind: "duplicate"; issue: ImportIssue }
  | { kind: "rejected"; issue: ImportIssue } {
  const name = optionalString(candidate.name);
  if (!name) {
    return reject(context.line, undefined, "missing required name.");
  }

  const description = optionalString(candidate.description);
  if (!description) {
    return reject(context.line, name, "missing required description.");
  }

  const urls = {
    website_url: optionalUrl(candidate.website_url),
    repo_url: optionalUrl(candidate.repo_url),
    docs_url: optionalUrl(candidate.docs_url)
  };
  if (!urls.website_url && !urls.repo_url && !urls.docs_url) {
    return reject(context.line, name, "at least one of website_url, repo_url, or docs_url must be a valid http(s) URL.");
  }

  const slug = normalizeSlug(optionalString(candidate.slug) ?? name);
  if (!SLUG_PATTERN.test(slug)) {
    return reject(context.line, name, `could not generate valid slug from "${optionalString(candidate.slug) ?? name}".`);
  }

  const duplicateReason = findDuplicate(slug, name, urls.repo_url, urls.website_url, context.indexes);
  if (duplicateReason) {
    return {
      kind: "duplicate",
      issue: {
        line: context.line,
        name,
        reason: duplicateReason
      }
    };
  }

  const droppedValues: ImportIssue[] = [];
  const categories = mapKnownValues("categories", candidate.categories, context.categoryLookup, context.line, name, droppedValues);
  if (categories.length === 0) {
    return reject(context.line, name, "no valid categories mapped. Use exact category slug or display name.");
  }

  const tags = mapKnownValues("tags", candidate.tags, context.tagLookup, context.line, name, droppedValues);
  if (tags.length === 0) {
    return reject(context.line, name, "no valid tags mapped. Use exact tag slug or display name.");
  }

  const interfaces = mapEnums("interfaces", candidate.interfaces, INTERFACE_TYPES, context.line, name, droppedValues) as InterfaceType[];
  if (interfaces.length === 0) {
    return reject(context.line, name, "no valid interfaces mapped. Use known interface enum values.");
  }

  const deployment = mapEnumValue(candidate.deployment, DEPLOYMENT_TYPES) as DeploymentType | undefined;
  const sourceModel = mapEnumValue(candidate.source_model, SOURCE_MODEL_TYPES) as SourceModelType | undefined;
  const sources = collectSources(candidate.sources, urls);
  if (sources.length === 0) {
    return reject(context.line, name, "sources must include at least one valid http(s) URL.");
  }

  const reviewNotes = buildReviewNotes(candidate, droppedValues);
  const websiteUrl = urls.website_url ?? urls.docs_url ?? urls.repo_url;
  if (!websiteUrl) {
    return reject(context.line, name, "website_url fallback failed.");
  }

  const tool: Tool = {
    slug,
    name,
    description,
    website_url: websiteUrl,
    categories,
    tags,
    interfaces,
    deployment: deployment ?? "unknown",
    source_model: sourceModel ?? "unknown",
    license: optionalString(candidate.license) ?? "unknown",
    curation_status: "draft",
    review_notes: reviewNotes,
    added: context.today,
    last_checked: context.today,
    sources
  };

  if (urls.repo_url) {
    tool.repo_url = urls.repo_url;
  }
  if (urls.docs_url) {
    tool.docs_url = urls.docs_url;
  }

  return {
    kind: "imported",
    tool,
    droppedValues
  };
}

function buildLookup(items: Array<{ slug: string; name: string }>): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const item of items) {
    lookup.set(normalizeLookupKey(item.slug), item.slug);
    lookup.set(normalizeLookupKey(item.name), item.slug);
  }
  return lookup;
}

function mapKnownValues(
  field: string,
  value: unknown,
  lookup: Map<string, string>,
  line: number,
  name: string,
  droppedValues: ImportIssue[]
): string[] {
  const mapped: string[] = [];
  for (const item of stringArray(value)) {
    const slug = lookup.get(normalizeLookupKey(item));
    if (slug) {
      mapped.push(slug);
    } else {
      droppedValues.push({ line, name, reason: `dropped unknown ${field} value "${item}".` });
    }
  }
  return sortedUnique(mapped);
}

function mapEnums(
  field: string,
  value: unknown,
  allowed: readonly string[],
  line: number,
  name: string,
  droppedValues: ImportIssue[]
): string[] {
  const mapped: string[] = [];
  for (const item of stringArray(value)) {
    const normalized = normalizeEnum(item);
    if (allowed.includes(normalized)) {
      mapped.push(normalized);
    } else {
      droppedValues.push({ line, name, reason: `dropped unknown ${field} value "${item}".` });
    }
  }
  return sortedUnique(mapped);
}

function mapEnumValue(value: unknown, allowed: readonly string[]): string | undefined {
  const normalized = optionalString(value);
  if (!normalized) {
    return undefined;
  }
  const candidate = normalizeEnum(normalized);
  return allowed.includes(candidate) ? candidate : undefined;
}

function collectSources(candidateSources: unknown, urls: { website_url?: string; repo_url?: string; docs_url?: string }): string[] {
  return sortedUnique([
    ...stringArray(candidateSources).map((value) => value.trim()).filter(isHttpUrl),
    ...Object.values(urls).filter((value): value is string => Boolean(value))
  ]);
}

function buildReviewNotes(candidate: CandidateInput, droppedValues: ImportIssue[]): string {
  const parts = ["Imported draft; verify metadata before marking reviewed."];
  const notes = optionalString(candidate.notes);
  const confidence = optionalString(candidate.confidence);
  const uncertain = stringArray(candidate.uncertain);
  if (notes) {
    parts.push(`notes: ${notes}`);
  }
  if (confidence) {
    parts.push(`confidence: ${confidence}`);
  }
  if (uncertain.length > 0) {
    parts.push(`uncertain: ${uncertain.join(", ")}`);
  }
  if (droppedValues.length > 0) {
    parts.push(`dropped: ${droppedValues.map((issue) => issue.reason.replace(/\.$/, "")).join("; ")}`);
  }
  return parts.join(" ");
}

function buildIndexes(tools: Tool[]): Indexes {
  const indexes: Indexes = {
    slugs: new Set(),
    names: new Set(),
    repoUrls: new Set(),
    websiteUrls: new Set()
  };
  for (const tool of tools) {
    addToIndexes(indexes, tool);
  }
  return indexes;
}

function addToIndexes(indexes: Indexes, tool: Pick<Tool, "slug" | "name" | "website_url" | "repo_url">): void {
  indexes.slugs.add(tool.slug);
  indexes.names.add(normalizeLookupKey(tool.name));
  indexes.websiteUrls.add(normalizeUrl(tool.website_url));
  if (tool.repo_url) {
    indexes.repoUrls.add(normalizeUrl(tool.repo_url));
  }
}

function findDuplicate(slug: string, name: string, repoUrl: string | undefined, websiteUrl: string | undefined, indexes: Indexes): string | undefined {
  if (indexes.slugs.has(slug)) {
    return `duplicate slug "${slug}".`;
  }
  if (indexes.names.has(normalizeLookupKey(name))) {
    return `duplicate name "${name}".`;
  }
  if (repoUrl && indexes.repoUrls.has(normalizeUrl(repoUrl))) {
    return `duplicate repo_url "${repoUrl}".`;
  }
  if (websiteUrl && indexes.websiteUrls.has(normalizeUrl(websiteUrl))) {
    return `duplicate website_url "${websiteUrl}".`;
  }
  return undefined;
}

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeEnum(value: string): string {
  return value.trim().toLowerCase().replace(/[_\s]+/g, "-");
}

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, "").toLowerCase();
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function optionalUrl(value: unknown): string | undefined {
  const text = optionalString(value);
  return text && isHttpUrl(text) ? text : undefined;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(optionalString).filter((item): item is string => Boolean(item));
}

function reject(line: number, name: string | undefined, reason: string): { kind: "rejected"; issue: ImportIssue } {
  return {
    kind: "rejected",
    issue: {
      line,
      name,
      reason: `line ${line}: ${reason}`
    }
  };
}

function printSummary(result: ImportSummary, dryRun: boolean): void {
  console.log(`${dryRun ? "Dry run" : "Import"} summary:`);
  console.log(`- imported: ${result.imported.length}${result.imported.length ? ` (${result.imported.join(", ")})` : ""}`);
  console.log(`- skipped duplicates: ${result.skippedDuplicates.length}`);
  console.log(`- rejected: ${result.rejected.length}`);
  console.log(`- dropped values: ${result.droppedValues.length}`);
  if (!dryRun && result.rejected.length > 0) {
    console.log("- write skipped: rejected candidates must be fixed first");
  }

  for (const issue of [...result.skippedDuplicates, ...result.rejected, ...result.droppedValues]) {
    console.log(`- line ${issue.line}${issue.name ? ` (${issue.name})` : ""}: ${issue.reason}`);
  }
}

function isCliEntrypoint(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}

if (isCliEntrypoint()) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const file = args.find((arg) => !arg.startsWith("--"));

  if (!file) {
    console.error("Usage: npm run import:candidates -- path/to/candidates.jsonl [--dry-run]");
    process.exit(1);
  }

  const result = importCandidatesFromFile(file, { dryRun });
  printSummary(result, dryRun);

  if (result.rejected.length > 0) {
    process.exit(1);
  }
}
