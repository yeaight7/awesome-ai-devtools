import type { CatalogTool, FilterState, SortKey } from "./types";

export interface ScoredTool {
  tool: CatalogTool;
  score: number;
}

export function effectiveSort(state: FilterState): SortKey {
  if (state.sort) {
    return state.sort;
  }
  return state.query.trim() ? "relevance" : "name-asc";
}

function byName(left: CatalogTool, right: CatalogTool): number {
  return left.name.localeCompare(right.name, "en") || left.slug.localeCompare(right.slug, "en");
}

export function compareScored(left: ScoredTool, right: ScoredTool, sort: SortKey): number {
  switch (sort) {
    case "relevance":
      return right.score - left.score || byName(left.tool, right.tool);
    case "name-asc":
      return byName(left.tool, right.tool);
    case "name-desc":
      return -byName(left.tool, right.tool);
    case "added-desc":
      // `added` is YYYY-MM-DD, so lexical comparison is chronological.
      return right.tool.added.localeCompare(left.tool.added) || byName(left.tool, right.tool);
  }
}
