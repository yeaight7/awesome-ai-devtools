import {
  FACET_KEYS,
  SORT_KEYS,
  type FacetKey,
  type FilterState,
  type SortKey
} from "./types";

const FACET_PARAMS: Record<FacetKey, string> = {
  categories: "cat",
  tags: "tag",
  interfaces: "if",
  deployment: "deploy",
  sourceModel: "source",
  license: "license"
};

export function emptyFilterState(): FilterState {
  return {
    query: "",
    sort: null,
    categories: [],
    tags: [],
    interfaces: [],
    deployment: [],
    sourceModel: [],
    license: []
  };
}

/** Parses a location search string; unknown params and sort values are ignored. */
export function parseFilterState(search: string): FilterState {
  const params = new URLSearchParams(search);
  const state = emptyFilterState();
  state.query = params.get("q") ?? "";
  const sort = params.get("sort");
  if (sort && (SORT_KEYS as readonly string[]).includes(sort)) {
    state.sort = sort as SortKey;
  }
  for (const key of FACET_KEYS) {
    state[key] = Array.from(new Set(params.getAll(FACET_PARAMS[key]).filter(Boolean)));
  }
  return state;
}

/** Serializes to a shareable query string ("" when everything is default). */
export function serializeFilterState(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.query.trim()) {
    params.set("q", state.query.trim());
  }
  for (const key of FACET_KEYS) {
    for (const value of state[key]) {
      params.append(FACET_PARAMS[key], value);
    }
  }
  if (state.sort) {
    params.set("sort", state.sort);
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export function countActiveFilters(state: FilterState): number {
  return FACET_KEYS.reduce((sum, key) => sum + state[key].length, 0);
}

export function hasActiveState(state: FilterState): boolean {
  return countActiveFilters(state) > 0 || state.query.trim().length > 0;
}
