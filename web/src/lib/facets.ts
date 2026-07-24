import { valueLabel, NOT_SPECIFIED } from "./format";
import { toolFacetValues } from "./filtering";
import { FACET_KEYS, type CatalogTool, type FacetKey } from "./types";

export interface FacetOption {
  value: string;
  label: string;
  /** Count across the whole catalog; used for stable ordering. */
  total: number;
}

const byLabel = (left: FacetOption, right: FacetOption) =>
  left.label.localeCompare(right.label, "en");

const byTotalThenLabel = (left: FacetOption, right: FacetOption) =>
  right.total - left.total || byLabel(left, right);

const notSpecifiedLast = (compare: (l: FacetOption, r: FacetOption) => number) => {
  return (left: FacetOption, right: FacetOption) => {
    const leftUnspecified = left.value === NOT_SPECIFIED ? 1 : 0;
    const rightUnspecified = right.value === NOT_SPECIFIED ? 1 : 0;
    return leftUnspecified - rightUnspecified || compare(left, right);
  };
};

const ORDERING: Record<FacetKey, (l: FacetOption, r: FacetOption) => number> = {
  categories: byLabel,
  tags: byTotalThenLabel,
  interfaces: byLabel,
  deployment: notSpecifiedLast(byLabel),
  sourceModel: notSpecifiedLast(byLabel),
  license: notSpecifiedLast(byTotalThenLabel)
};

function optionLabel(tool: CatalogTool, key: FacetKey, value: string): string {
  if (key === "categories") {
    return tool.categories.find((term) => term.slug === value)?.name ?? value;
  }
  if (key === "tags") {
    return tool.tags.find((term) => term.slug === value)?.name ?? value;
  }
  if (key === "license") {
    return value === NOT_SPECIFIED ? "Not specified" : value;
  }
  return valueLabel(value);
}

/**
 * Derives the selectable options per facet from the catalog itself, so the UI
 * always offers exactly the values present in the reviewed data.
 */
export function buildFacetOptions(
  tools: readonly CatalogTool[]
): Record<FacetKey, FacetOption[]> {
  const result = {} as Record<FacetKey, FacetOption[]>;
  for (const key of FACET_KEYS) {
    const options = new Map<string, FacetOption>();
    for (const tool of tools) {
      for (const value of new Set(toolFacetValues(tool, key))) {
        const existing = options.get(value);
        if (existing) {
          existing.total += 1;
        } else {
          options.set(value, { value, label: optionLabel(tool, key, value), total: 1 });
        }
      }
    }
    result[key] = Array.from(options.values()).sort(ORDERING[key]);
  }
  return result;
}
