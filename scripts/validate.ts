import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildComparisonMatrix, buildReadme } from "./generate-readme.ts";
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
  normalizeEol,
  readText,
  serializeTools,
  slugItemMap
} from "./lib.ts";
import parseSpdx from "spdx-expression-parse";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ARTIFACT_PATTERNS: RegExp[] = [/\[web:/, /filecite/, /<file_attachment/, /【/, /】/];
const TOOL_DESCRIPTION_MIN = 40;
const TOOL_DESCRIPTION_MAX = 180;
const KNOWN_EVIDENCE_HOSTS = new Set([
  // Package registries and ecosystems
  "arxiv.org",
  "crates.io",
  "ecosyste.ms",
  "hexdocs.pm",
  "marketplace.visualstudio.com",
  "npmjs.com",
  "pkg.go.dev",
  "pypi.org",
  // Documentation hosting
  "github.io",
  "githubusercontent.com",
  "mintlify.wiki",
  "readthedocs.io",
  // Research
  "aclanthology.org",
  "tmlr.org",
  // MCP ecosystem
  "mcpservers.org",
  "modelcontextprotocol.info",
  "modelcontextprotocol.io",
  "smithery.ai",
  // Community and news
  "dev.to",
  "dzone.com",
  "helpnetsecurity.com",
  "linkedin.com",
  "reddit.com",
  "venturebeat.com",
  "ycombinator.com",
  "youtube.com",
  // Official tech company sites used as evidence
  "ai-sdk.dev",
  "augmentcode.com",
  "browserless.io",
  "cognee.ai",
  "composio.dev",
  "digitalocean.com",
  "go.dev",
  "google.com",
  "googleblog.com",
  "ibm.com",
  "langchain.com",
  "lfaidata.foundation",
  "lobehub.com",
  "mem0.ai",
  "microsoft.com",
  "mistral.ai",
  "newreleases.io",
  "openai.com",
  "openobserve.ai",
  "pulumi.com",
  "redhat.com",
  // Education and tutorials
  "datacamp.com",
  "realpython.com",
  // Secondary evidence: blogs, adopter sites, tracking
  "automateed.com",
  "byteiota.com",
  "colaberry.ai",
  "davemateer.com",
  "discoveredlabs.com",
  "dynamicbusiness.com",
  "f4.fund",
  "fluidattacks.com",
  "latitude.so",
  "localaimaster.com",
  "meoadvisors.com",
  "noze.it",
  "pamelafox.org",
  "progress.com",
  "serverspace.io",
  "shyft.ai",
  "starlog.is",
  "sumbits.ai",
  "theodo.com",
]);

// Description language policy. Calibrated against the existing catalog:
// the promotional tier (validation errors) has zero matches in current data,
// so it only blocks new hype copy; the subjective tier (warnings) surfaces
// soft marketing wording without failing validation. Patterns are word-bounded
// phrases with exceptions for legitimate technical idioms ("best practices",
// "smart contract", "awesome list"), so factual text and product names pass.
const PROMOTIONAL_LANGUAGE_PATTERNS: RegExp[] = [
  /\b(?:best[ -]in[ -]class|world[ -]class|industry[ -]leading|market[ -]leading|award[ -]winning|top[ -]rated)\b/i,
  /\b(?:revolutionary|groundbreaking|game[ -]chang(?:ing|er))\b/i,
  /\b(?:cutting[ -]edge|state[ -]of[ -]the[ -]art)\b/i,
  /\b(?:blazing(?:ly)?|lightning)[ -]fast\b/i,
  /\bblazingly\b/i,
  /\b(?:unmatched|unparalleled|unrivaled|second to none)\b/i,
  /\b(?:supercharge|turbocharge)[sd]?\b/i,
  /\bon steroids\b/i,
  /(?:^|[\s(])#1\b/,
  /\bnumber[ -]one\b/i,
  /\bworld'?s (?:best|first|fastest|leading|largest|most)\b/i,
  /\bthe best\b(?!\s+(?:practices?|effort))/i,
  /\b(?:fastest|easiest|simplest|smartest)\b/i,
  /\bmost (?:powerful|advanced|popular|complete|comprehensive|accurate|capable|intelligent)\b/i,
  /\b(?:amazing|incredible|phenomenal|magical)\b/i,
  /\b(?:trusted|loved) by\b/i,
  /\b\d+x (?:faster|better|more)\b/i
];

const SUBJECTIVE_LANGUAGE_PATTERNS: RegExp[] = [
  /\bpowerful\b/i,
  /\bseamless(?:ly)?\b/i,
  /\beffortless(?:ly)?\b/i,
  /\bintuitive(?:ly)?\b/i,
  /\belegant(?:ly)?\b/i,
  /\bbeautiful(?:ly)?\b/i,
  /\b(?:gorgeous|stunning|delightful)\b/i,
  /\benterprise[ -]grade\b/i,
  /\bproduction[ -]ready\b/i,
  /\bbattle[ -]tested\b/i,
  /\bfeature[ -]rich\b/i,
  /\b(?:frictionless|painless(?:ly)?|hassle[ -]free)\b/i,
  /\brobust\b/i,
  /\bintelligent(?:ly)?\b/i,
  /\bsmart\b(?!\s+contracts?)/i,
  /\bnext[ -]gen(?:eration)?\b/i,
  /\bawesome\b(?!\s+lists?)/i,
  /\b(?:superior|ultimate|innovative)\b/i
];

export interface DescriptionLanguageIssues {
  promotional: string[];
  subjective: string[];
}

export function findDescriptionLanguageIssues(description: string): DescriptionLanguageIssues {
  const promotional: string[] = [];
  const subjective: string[] = [];

  for (const pattern of PROMOTIONAL_LANGUAGE_PATTERNS) {
    const match = description.match(pattern);
    if (match) {
      promotional.push(match[0].trim());
    }
  }
  if (description.includes("!")) {
    promotional.push("exclamation mark");
  }
  if (/\p{Extended_Pictographic}/u.test(description)) {
    promotional.push("emoji");
  }

  for (const pattern of SUBJECTIVE_LANGUAGE_PATTERNS) {
    const match = description.match(pattern);
    if (match) {
      subjective.push(match[0].trim());
    }
  }

  return { promotional, subjective };
}

export interface ValidationOptions {
  readmeContent?: string;
  toolsFileContent?: string;
  comparisonContent?: string;
  checkGeneratedReadme?: boolean;
  checkSorted?: boolean;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCatalog(catalog: CatalogData, options: ValidationOptions = {}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const checkGeneratedReadme = options.checkGeneratedReadme ?? true;
  const checkSorted = options.checkSorted ?? true;
  const categories = slugItemMap(catalog.categories);
  const tags = slugItemMap(catalog.tags);

  validateSlugSet("category", catalog.categories, errors);
  validateSlugSet("tag", catalog.tags, errors);
  validateSlugSet("tool", catalog.tools, errors);
  validateUniqueNames(catalog.tools, errors);
  validateUniqueUrls(catalog.tools, warnings);

  for (const category of catalog.categories) {
    validateRequiredString(`category ${category.slug}`, "name", category.name, errors);
    validateRequiredString(`category ${category.slug}`, "description", category.description, errors);
  }

  for (const tag of catalog.tags) {
    validateRequiredString(`tag ${tag.slug}`, "name", tag.name, errors);
    validateRequiredString(`tag ${tag.slug}`, "description", tag.description, errors);
  }

  for (const tool of catalog.tools) {
    validateTool(tool, categories, tags, errors, warnings);
  }

  if (checkSorted && options.toolsFileContent !== undefined) {
    const expected = serializeTools(catalog.tools);
    if (normalizeEol(options.toolsFileContent) !== expected) {
      errors.push("data/tools.yml is not sorted or normalized. Run `npm run sort`.");
    }
  }

  if (checkGeneratedReadme && options.readmeContent !== undefined) {
    const expected = buildReadme(catalog);
    if (normalizeEol(options.readmeContent) !== expected) {
      errors.push("README.md is stale. Run `npm run generate`.");
    }
  }

  if (checkGeneratedReadme && options.comparisonContent !== undefined) {
    const expected = buildComparisonMatrix(catalog);
    if (normalizeEol(options.comparisonContent) !== expected) {
      errors.push("docs/COMPARISON.md is stale. Run `npm run generate`.");
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

function validateTool(
  tool: Tool,
  categories: Map<string, { slug: string }>,
  tags: Map<string, { slug: string }>,
  errors: string[],
  warnings: string[]
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
  validateNotUnknown(label, "deployment", tool.deployment, errors);
  validateNotUnknown(label, "source_model", tool.source_model, errors);
  validateNotUnknown(label, "license", tool.license, errors);

  if (tool.license && tool.license !== "not specified" && tool.license !== "NOASSERTION") {
    try {
      parseSpdx(tool.license);
    } catch (e: any) {
      errors.push(`${label}: invalid license "${tool.license}". Must be a valid SPDX expression. Details: ${e.message}`);
    }
  }

  if (tool.slug && !SLUG_PATTERN.test(tool.slug)) {
    errors.push(`${label}: slug must match ${SLUG_PATTERN}.`);
  }

  if (tool.description && (tool.description.length < TOOL_DESCRIPTION_MIN || tool.description.length > TOOL_DESCRIPTION_MAX)) {
    errors.push(
      `${label}: description must be ${TOOL_DESCRIPTION_MIN}-${TOOL_DESCRIPTION_MAX} characters. Current length: ${tool.description.length}.`
    );
  }

  if (typeof tool.description === "string") {
    const language = findDescriptionLanguageIssues(tool.description);
    for (const phrase of language.promotional) {
      errors.push(`${label}: description contains promotional language ("${phrase}"). Keep descriptions factual and neutral.`);
    }
    for (const phrase of language.subjective) {
      warnings.push(`${label}: description uses subjective wording ("${phrase}"); prefer neutral phrasing.`);
    }
  }

  validateNoArtifacts(label, "name", tool.name, errors);
  validateNoArtifacts(label, "description", tool.description, errors);
  validateNoArtifacts(label, "website_url", tool.website_url, errors);
  validateNoArtifacts(label, "docs_url", tool.docs_url, errors);
  validateNoArtifacts(label, "repo_url", tool.repo_url, errors);

  validateUrl(label, "website_url", tool.website_url, errors);
  validateOptionalUrl(label, "repo_url", tool.repo_url, errors);
  validateOptionalUrl(label, "docs_url", tool.docs_url, errors);

  if (tool.curation_status && !CURATION_STATUS_TYPES.includes(tool.curation_status)) {
    errors.push(`${label}: invalid curation_status "${tool.curation_status}". Allowed: ${CURATION_STATUS_TYPES.join(", ")}.`);
  }

  validateStringArray(label, "categories", tool.categories, errors);
  validateStringArray(label, "tags", tool.tags, errors);
  validateStringArray(label, "interfaces", tool.interfaces, errors);

  if (tool.primary_category !== undefined) {
    if (!categories.has(tool.primary_category)) {
      errors.push(`${label}: primary_category "${tool.primary_category}" is not a known category slug.`);
    } else if (!stringItems(tool.categories).includes(tool.primary_category)) {
      errors.push(`${label}: primary_category "${tool.primary_category}" must also be listed in categories.`);
    }
  }

  if (tool.curation_status === "reviewed") {
    validateReviewedTaxonomy(tool, label, categories, tags, errors);
    if (stringItems(tool.categories).length > 1 && !tool.primary_category) {
      errors.push(`${label}: reviewed tools with multiple categories must set primary_category.`);
    }
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

  if (tool.curation_status === "reviewed") {
    validateReviewedSourceHosts(tool, label, warnings);
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

function validateUniqueNames(tools: Tool[], errors: string[]): void {
  const byName = new Map<string, string[]>();
  for (const tool of tools) {
    if (typeof tool.name !== "string" || tool.name.trim() === "") continue;
    const key = tool.name.trim().toLowerCase();
    const slugs = byName.get(key) ?? [];
    slugs.push(tool.slug ?? "<missing slug>");
    byName.set(key, slugs);
  }
  for (const [name, slugs] of byName) {
    if (slugs.length > 1) {
      errors.push(`duplicate tool name "${name}" used by: ${slugs.join(", ")}.`);
    }
  }
}

// Shared URLs usually mean the same project was entered twice (for example a
// draft facet of an already reviewed tool). Merging is a curation decision,
// so this warns instead of failing.
function validateUniqueUrls(tools: Tool[], warnings: string[]): void {
  for (const field of ["website_url", "repo_url"] as const) {
    const byUrl = new Map<string, string[]>();
    for (const tool of tools) {
      const value = tool[field];
      if (typeof value !== "string" || value.trim() === "") continue;
      const key = value.trim().replace(/\/+$/, "").toLowerCase();
      const slugs = byUrl.get(key) ?? [];
      slugs.push(tool.slug ?? "<missing slug>");
      byUrl.set(key, slugs);
    }
    for (const [url, slugs] of byUrl) {
      if (slugs.length > 1) {
        warnings.push(`tools ${slugs.join(", ")} share the same ${field} "${url}"; merge or differentiate the entries.`);
      }
    }
  }
}

function validateNoArtifacts(label: string, field: string, value: unknown, errors: string[]): void {
  if (typeof value !== "string") return;
  for (const pattern of ARTIFACT_PATTERNS) {
    if (pattern.test(value)) {
      errors.push(`${label}: ${field} contains a research or citation artifact.`);
      return;
    }
  }
}

function validateRequiredString(label: string, field: string, value: unknown, errors: string[]): void {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label}: missing required ${field}.`);
  }
}

function validateNotUnknown(label: string, field: string, value: unknown, errors: string[]): void {
  if (typeof value === "string" && value.trim().toLowerCase() === "unknown") {
    errors.push(`${label}: ${field} must use "not specified" instead of "unknown".`);
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

function validateReviewedSourceHosts(tool: Tool, label: string, warnings: string[]): void {
  const officialHosts = new Set(
    [tool.website_url, tool.docs_url, tool.repo_url]
      .filter((value): value is string => typeof value === "string")
      .map(registrableHost)
      .filter((value) => value !== "")
  );

  for (const source of stringItems(tool.sources)) {
    const sourceHost = registrableHost(source);
    if (sourceHost === "" || officialHosts.has(sourceHost) || KNOWN_EVIDENCE_HOSTS.has(sourceHost)) {
      continue;
    }
    warnings.push(`${label}: source host "${sourceHost}" is not an official website, docs, repo, or known package/evidence host.`);
  }
}

function registrableHost(value: string): string {
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    const parts = host.split(".");
    return parts.length >= 2 ? parts.slice(-2).join(".") : host;
  } catch {
    return "";
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
  const comparisonPath = join(rootDir, ROOT_FILES.comparison);
  const result = validateCatalog(catalog, {
    readmeContent: existsSync(readmePath) ? readText(readmePath) : "",
    toolsFileContent: readText(toolsPath),
    comparisonContent: existsSync(comparisonPath) ? readText(comparisonPath) : "",
    checkGeneratedReadme: true,
    checkSorted: true
  });

  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`error: ${error}`);
    }
    process.exit(1);
  }

  for (const warning of result.warnings) {
    console.warn(`warning: ${warning}`);
  }

  if (result.warnings.length > 0) {
    console.log(`Validation passed with ${result.warnings.length} warning(s).`);
  } else {
    console.log("Validation passed.");
  }
}
