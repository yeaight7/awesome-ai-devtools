import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildReadme } from "./generate-readme.ts";
import {
  CatalogData,
  CURATION_STATUS_TYPES,
  DEPLOYMENT_TYPES,
  INTERFACE_TYPES,
  ROOT_FILES,
  SOURCE_MODEL_TYPES,
  Tool,
  isHttpUrl,
  isValidDate,
  loadCatalog,
  readText,
  serializeTools,
  slugItemMap
} from "./lib.ts";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOOL_DESCRIPTION_MIN = 40;
const TOOL_DESCRIPTION_MAX = 160;

export interface ValidationOptions {
  readmeContent?: string;
  toolsFileContent?: string;
  checkGeneratedReadme?: boolean;
  checkSorted?: boolean;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCatalog(catalog: CatalogData, options: ValidationOptions = {}): ValidationResult {
  const errors: string[] = [];
  const checkGeneratedReadme = options.checkGeneratedReadme ?? true;
  const checkSorted = options.checkSorted ?? true;
  const categories = slugItemMap(catalog.categories);
  const tags = slugItemMap(catalog.tags);

  validateSlugSet("category", catalog.categories, errors);
  validateSlugSet("tag", catalog.tags, errors);
  validateSlugSet("tool", catalog.tools, errors);

  for (const category of catalog.categories) {
    validateRequiredString(`category ${category.slug}`, "name", category.name, errors);
    validateRequiredString(`category ${category.slug}`, "description", category.description, errors);
  }

  for (const tag of catalog.tags) {
    validateRequiredString(`tag ${tag.slug}`, "name", tag.name, errors);
    validateRequiredString(`tag ${tag.slug}`, "description", tag.description, errors);
  }

  for (const tool of catalog.tools) {
    validateTool(tool, categories, tags, errors);
  }

  if (checkSorted && options.toolsFileContent !== undefined) {
    const expected = serializeTools(catalog.tools);
    if (options.toolsFileContent !== expected) {
      errors.push("data/tools.yml is not sorted or normalized. Run `npm run sort`.");
    }
  }

  if (checkGeneratedReadme && options.readmeContent !== undefined) {
    const expected = buildReadme(catalog);
    if (options.readmeContent !== expected) {
      errors.push("README.md is stale. Run `npm run generate`.");
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

function validateTool(
  tool: Tool,
  categories: Map<string, { slug: string }>,
  tags: Map<string, { slug: string }>,
  errors: string[]
): void {
  const label = `tool ${tool.slug ?? "<missing slug>"}`;

  validateRequiredString(label, "slug", tool.slug, errors);
  validateRequiredString(label, "name", tool.name, errors);
  validateRequiredString(label, "description", tool.description, errors);
  validateRequiredString(label, "website_url", tool.website_url, errors);
  validateRequiredString(label, "deployment", tool.deployment, errors);
  validateRequiredString(label, "source_model", tool.source_model, errors);
  validateRequiredString(label, "license", tool.license, errors);
  validateRequiredString(label, "curation_status", tool.curation_status, errors);
  validateRequiredString(label, "added", tool.added, errors);
  validateRequiredString(label, "last_checked", tool.last_checked, errors);

  if (tool.slug && !SLUG_PATTERN.test(tool.slug)) {
    errors.push(`${label}: slug must match ${SLUG_PATTERN}.`);
  }

  if (tool.description && (tool.description.length < TOOL_DESCRIPTION_MIN || tool.description.length > TOOL_DESCRIPTION_MAX)) {
    errors.push(
      `${label}: description must be ${TOOL_DESCRIPTION_MIN}-${TOOL_DESCRIPTION_MAX} characters. Current length: ${tool.description.length}.`
    );
  }

  validateUrl(label, "website_url", tool.website_url, errors);
  validateOptionalUrl(label, "repo_url", tool.repo_url, errors);
  validateOptionalUrl(label, "docs_url", tool.docs_url, errors);

  if (tool.curation_status && !CURATION_STATUS_TYPES.includes(tool.curation_status)) {
    errors.push(`${label}: invalid curation_status "${tool.curation_status}". Allowed: ${CURATION_STATUS_TYPES.join(", ")}.`);
  }

  validateStringArray(label, "categories", tool.categories, errors);
  validateStringArray(label, "tags", tool.tags, errors);
  validateStringArray(label, "interfaces", tool.interfaces, errors);

  if (tool.curation_status === "reviewed") {
    validateReviewedTaxonomy(tool, label, categories, tags, errors);
  }

  if (tool.curation_status === "draft" && (typeof tool.review_notes !== "string" || tool.review_notes.trim() === "")) {
    errors.push(`${label}: draft entries must include review_notes.`);
  }

  validateDate(label, "added", tool.added, errors);
  validateDate(label, "last_checked", tool.last_checked, errors);
  if (isValidDate(tool.added) && isValidDate(tool.last_checked) && tool.last_checked < tool.added) {
    errors.push(`${label}: last_checked must be the same as or later than added.`);
  }

  validateStringArray(label, "sources", tool.sources, errors);
  for (const source of stringItems(tool.sources)) {
    validateUrl(label, "sources", source, errors);
  }
}

function validateReviewedTaxonomy(
  tool: Tool,
  label: string,
  categories: Map<string, { slug: string }>,
  tags: Map<string, { slug: string }>,
  errors: string[]
): void {
  for (const category of stringItems(tool.categories)) {
    if (!categories.has(category)) {
      errors.push(`${label}: unknown category "${category}". Add it to data/categories.yml or remove the reference.`);
    }
  }

  for (const tag of stringItems(tool.tags)) {
    if (!tags.has(tag)) {
      errors.push(`${label}: unknown tag "${tag}". Add it to data/tags.yml or remove the reference.`);
    }
  }

  for (const value of stringItems(tool.interfaces)) {
    if (!INTERFACE_TYPES.includes(value as (typeof INTERFACE_TYPES)[number])) {
      errors.push(`${label}: invalid interface "${value}". Allowed: ${INTERFACE_TYPES.join(", ")}.`);
    }
  }

  if (tool.deployment && !DEPLOYMENT_TYPES.includes(tool.deployment as (typeof DEPLOYMENT_TYPES)[number])) {
    errors.push(`${label}: invalid deployment "${tool.deployment}". Allowed: ${DEPLOYMENT_TYPES.join(", ")}.`);
  }

  if (tool.source_model && !SOURCE_MODEL_TYPES.includes(tool.source_model as (typeof SOURCE_MODEL_TYPES)[number])) {
    errors.push(`${label}: invalid source_model "${tool.source_model}". Allowed: ${SOURCE_MODEL_TYPES.join(", ")}.`);
  }
}

function stringItems(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function validateSlugSet(label: string, items: Array<{ slug?: string }>, errors: string[]): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (!item.slug) {
      errors.push(`${label}: missing required slug.`);
      continue;
    }
    if (!SLUG_PATTERN.test(item.slug)) {
      errors.push(`${label} ${item.slug}: slug must match ${SLUG_PATTERN}.`);
    }
    if (seen.has(item.slug)) {
      errors.push(`duplicate ${label} slug "${item.slug}".`);
    }
    seen.add(item.slug);
  }
}

function validateRequiredString(label: string, field: string, value: unknown, errors: string[]): void {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label}: missing required ${field}.`);
  }
}

function validateStringArray(label: string, field: string, value: unknown, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    errors.push(`${label}: ${field} must be a non-empty array of strings.`);
  }
}

function validateUrl(label: string, field: string, value: unknown, errors: string[]): void {
  if (typeof value !== "string" || !isHttpUrl(value)) {
    errors.push(`${label}: ${field} must be a valid http(s) URL.`);
  }
}

function validateOptionalUrl(label: string, field: string, value: unknown, errors: string[]): void {
  if (value !== undefined) {
    validateUrl(label, field, value, errors);
  }
}

function validateDate(label: string, field: string, value: unknown, errors: string[]): void {
  if (typeof value !== "string" || !isValidDate(value)) {
    errors.push(`${label}: ${field} must be a valid YYYY-MM-DD date.`);
  }
}

function isCliEntrypoint(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}

if (isCliEntrypoint()) {
  const rootDir = process.cwd();
  const catalog = loadCatalog(rootDir);
  const readmePath = join(rootDir, ROOT_FILES.readme);
  const toolsPath = join(rootDir, ROOT_FILES.tools);
  const result = validateCatalog(catalog, {
    readmeContent: existsSync(readmePath) ? readText(readmePath) : "",
    toolsFileContent: readText(toolsPath),
    checkGeneratedReadme: true,
    checkSorted: true
  });

  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Validation passed.");
}
