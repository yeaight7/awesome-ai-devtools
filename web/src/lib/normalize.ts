import type { CatalogTool, TermRef, ToolLink, WebCatalog } from "./types";

// Raw shapes mirror Tool/Category/Tag/CatalogData in ../../scripts/lib.ts. They
// are declared structurally here so browser code never imports node-flavoured
// modules; vite.config.ts type-checks the real loader output against these.
export interface RawTerm {
  slug: string;
  name: string;
  description?: string;
}

export interface RawTool {
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
  curation_status: string;
  added: string;
  last_checked: string;
}

export interface RawCatalog {
  categories: RawTerm[];
  tags: RawTerm[];
  tools: RawTool[];
}

function termResolver(terms: RawTerm[]): (slug: string) => TermRef {
  const bySlug = new Map(terms.map((term) => [term.slug, term.name]));
  // Draft-originated slugs may not exist in the definition files yet; fall back
  // to the slug itself instead of dropping the value.
  return (slug) => ({ slug, name: bySlug.get(slug) ?? slug });
}

function buildLinks(tool: RawTool): ToolLink[] {
  const links: ToolLink[] = [{ kind: "website", url: tool.website_url }];
  const seen = new Set([tool.website_url]);
  if (tool.docs_url && !seen.has(tool.docs_url)) {
    links.push({ kind: "docs", url: tool.docs_url });
    seen.add(tool.docs_url);
  }
  if (tool.repo_url && !seen.has(tool.repo_url)) {
    links.push({ kind: "repo", url: tool.repo_url });
  }
  return links;
}

function normalizeTool(
  tool: RawTool,
  resolveCategory: (slug: string) => TermRef,
  resolveTag: (slug: string) => TermRef
): CatalogTool {
  const categories = (tool.categories ?? []).map(resolveCategory);
  const tags = (tool.tags ?? []).map(resolveTag);
  const primarySlug = tool.primary_category ?? tool.categories?.[0];
  const interfaces = tool.interfaces ?? [];
  const terms = [
    ...categories.flatMap((term) => [term.slug, term.name]),
    ...tags.flatMap((term) => [term.slug, term.name]),
    ...interfaces,
    tool.deployment,
    tool.source_model,
    tool.license
  ]
    .join(" ")
    .toLowerCase();

  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    links: buildLinks(tool),
    categories,
    primaryCategory: primarySlug ? resolveCategory(primarySlug) : null,
    tags,
    interfaces,
    deployment: tool.deployment,
    sourceModel: tool.source_model,
    license: tool.license,
    added: tool.added,
    lastChecked: tool.last_checked,
    search: {
      name: tool.name.toLowerCase(),
      terms,
      description: tool.description.toLowerCase()
    }
  };
}

/**
 * Builds the public catalog view: reviewed entries only, slugs resolved to
 * display names, links deduplicated. Taxonomy rules stay in scripts/validate.ts;
 * this layer only prepares validated data for display.
 */
export function normalizeCatalog(raw: RawCatalog): WebCatalog {
  const resolveCategory = termResolver(raw.categories);
  const resolveTag = termResolver(raw.tags);
  const reviewed = raw.tools.filter((tool) => tool.curation_status === "reviewed");

  const tools = reviewed
    .map((tool) => normalizeTool(tool, resolveCategory, resolveTag))
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name, "en") || left.slug.localeCompare(right.slug, "en")
    );

  return {
    tools,
    counts: {
      total: raw.tools.length,
      reviewed: reviewed.length,
      draft: raw.tools.length - reviewed.length
    }
  };
}
