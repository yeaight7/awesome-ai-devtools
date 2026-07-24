import { scoreTool, tokenize } from "./search";
import { compareScored, effectiveSort, type ScoredTool } from "./sorting";
import { FACET_KEYS, type CatalogTool, type FacetKey, type FilterState } from "./types";

export interface FilterResult {
  tools: CatalogTool[];
  /** Per facet: value -> result count if only the other filters applied. */
  facetCounts: Record<FacetKey, Map<string, number>>;
}

export function toolFacetValues(tool: CatalogTool, key: FacetKey): string[] {
  switch (key) {
    case "categories":
      return tool.categories.map((term) => term.slug);
    case "tags":
      return tool.tags.map((term) => term.slug);
    case "interfaces":
      return tool.interfaces;
    case "deployment":
      return [tool.deployment];
    case "sourceModel":
      return [tool.sourceModel];
    case "license":
      return [tool.license];
  }
}

/** Values within a facet are OR-ed; distinct facets are AND-ed. */
function matchesFacet(tool: CatalogTool, key: FacetKey, selected: string[]): boolean {
  if (selected.length === 0) {
    return true;
  }
  const values = toolFacetValues(tool, key);
  return selected.some((value) => values.includes(value));
}

function countValues(tools: readonly CatalogTool[], key: FacetKey): Map<string, number> {
  const counts = new Map<string, number>();
  for (const tool of tools) {
    for (const value of new Set(toolFacetValues(tool, key))) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
}

export function filterCatalog(tools: readonly CatalogTool[], state: FilterState): FilterResult {
  const tokens = tokenize(state.query);
  const searched: ScoredTool[] = [];
  for (const tool of tools) {
    const score = scoreTool(tool, tokens);
    if (score > 0) {
      searched.push({ tool, score });
    }
  }

  const matchesAll = (tool: CatalogTool, excluded?: FacetKey): boolean =>
    FACET_KEYS.every((key) => key === excluded || matchesFacet(tool, key, state[key]));

  const results = searched.filter((entry) => matchesAll(entry.tool));
  const sort = effectiveSort(state);
  results.sort((left, right) => compareScored(left, right, sort));

  // Standard faceted-count behaviour: each facet's counts reflect the query
  // plus every other facet, so selecting within a facet widens, not zeroes,
  // its sibling options.
  const facetCounts = {} as Record<FacetKey, Map<string, number>>;
  for (const key of FACET_KEYS) {
    const candidates = searched
      .filter((entry) => matchesAll(entry.tool, key))
      .map((entry) => entry.tool);
    facetCounts[key] = countValues(candidates, key);
  }

  return { tools: results.map((entry) => entry.tool), facetCounts };
}
