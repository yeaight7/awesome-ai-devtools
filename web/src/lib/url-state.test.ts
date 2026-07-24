import { describe, expect, it } from "vitest";
import {
  countActiveFilters,
  emptyFilterState,
  hasActiveState,
  parseFilterState,
  serializeFilterState
} from "./url-state";

describe("url state", () => {
  it("serializes the default state to an empty string", () => {
    expect(serializeFilterState(emptyFilterState())).toBe("");
  });

  it("round-trips a full state", () => {
    const state = {
      ...emptyFilterState(),
      query: "mcp server",
      categories: ["mcp-servers", "coding-agents"],
      tags: ["automation"],
      interfaces: ["cli"],
      deployment: ["local"],
      sourceModel: ["open-source"],
      license: ["MIT"],
      sort: "added-desc" as const
    };
    expect(parseFilterState(serializeFilterState(state))).toEqual(state);
  });

  it("ignores unknown params and invalid sort values", () => {
    const state = parseFilterState("?q=agent&utm_source=x&sort=popularity&bogus=1");
    expect(state.query).toBe("agent");
    expect(state.sort).toBeNull();
    expect(countActiveFilters(state)).toBe(0);
  });

  it("deduplicates repeated facet values", () => {
    const state = parseFilterState("?cat=evals&cat=evals&tag=tracing");
    expect(state.categories).toEqual(["evals"]);
    expect(state.tags).toEqual(["tracing"]);
    expect(countActiveFilters(state)).toBe(2);
  });

  it("trims the query when serializing", () => {
    const state = { ...emptyFilterState(), query: "  agent  " };
    expect(serializeFilterState(state)).toBe("?q=agent");
  });

  it("reports active state for query-only and facet-only states", () => {
    expect(hasActiveState(emptyFilterState())).toBe(false);
    expect(hasActiveState({ ...emptyFilterState(), query: "x" })).toBe(true);
    expect(hasActiveState({ ...emptyFilterState(), tags: ["tracing"] })).toBe(true);
  });
});
