export interface TermRef {
  slug: string;
  name: string;
}

export interface ToolLink {
  kind: "website" | "docs" | "repo";
  url: string;
}

export interface CatalogTool {
  slug: string;
  name: string;
  description: string;
  links: ToolLink[];
  categories: TermRef[];
  primaryCategory: TermRef | null;
  tags: TermRef[];
  interfaces: string[];
  deployment: string;
  sourceModel: string;
  license: string;
  added: string;
  lastChecked: string;
  /** Precomputed lowercase haystacks so search stays allocation-free per keystroke. */
  search: {
    name: string;
    terms: string;
    description: string;
  };
}

export interface CatalogCounts {
  total: number;
  reviewed: number;
  draft: number;
}

export interface WebCatalog {
  tools: CatalogTool[];
  counts: CatalogCounts;
}

export const FACET_KEYS = [
  "categories",
  "tags",
  "interfaces",
  "deployment",
  "sourceModel",
  "license"
] as const;

export type FacetKey = (typeof FACET_KEYS)[number];

export type FacetSelections = Record<FacetKey, string[]>;

export const SORT_KEYS = ["relevance", "name-asc", "name-desc", "added-desc"] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export interface FilterState extends FacetSelections {
  query: string;
  /** null = automatic: relevance while a query is active, name order otherwise. */
  sort: SortKey | null;
}
