import { describe, expect, it } from "vitest";
import { fixtureCatalog } from "../test/fixtures";
import { filterCatalog } from "./filtering";
import { emptyFilterState } from "./url-state";

const tools = fixtureCatalog.tools;

describe("filterCatalog", () => {
  it("returns everything with the default state", () => {
    const result = filterCatalog(tools, emptyFilterState());
    expect(result.tools.map((tool) => tool.slug)).toEqual([
      "alpha-agent",
      "beta-tracer",
      "delta-kit"
    ]);
  });

  it("ORs values inside a facet and ANDs across facets", () => {
    const orState = { ...emptyFilterState(), categories: ["coding-agents", "evals"] };
    expect(filterCatalog(tools, orState).tools).toHaveLength(3);

    const andState = {
      ...emptyFilterState(),
      categories: ["coding-agents"],
      sourceModel: ["open-source"]
    };
    expect(filterCatalog(tools, andState).tools.map((tool) => tool.slug)).toEqual([
      "alpha-agent"
    ]);
  });

  it("combines search queries with facet filters", () => {
    const state = { ...emptyFilterState(), query: "agent", deployment: ["local"] };
    expect(filterCatalog(tools, state).tools.map((tool) => tool.slug)).toEqual(["alpha-agent"]);

    const noMatch = { ...emptyFilterState(), query: "agent", deployment: ["hosted"] };
    expect(filterCatalog(tools, noMatch).tools).toHaveLength(0);
  });

  it("filters by 'not specified' as a first-class facet value", () => {
    const state = { ...emptyFilterState(), deployment: ["not specified"] };
    expect(filterCatalog(tools, state).tools.map((tool) => tool.slug)).toEqual(["beta-tracer"]);
  });

  it("computes facet counts excluding the facet's own selection", () => {
    const state = { ...emptyFilterState(), categories: ["evals"] };
    const { facetCounts } = filterCatalog(tools, state);
    // Sibling category options keep their unfiltered counts...
    expect(facetCounts.categories.get("coding-agents")).toBe(2);
    expect(facetCounts.categories.get("evals")).toBe(1);
    // ...while other facets reflect the category selection.
    expect(facetCounts.sourceModel.get("proprietary")).toBe(1);
    expect(facetCounts.sourceModel.get("open-source")).toBeUndefined();
  });

  it("narrows facet counts by the active query", () => {
    const state = { ...emptyFilterState(), query: "tracing" };
    const { facetCounts } = filterCatalog(tools, state);
    expect(facetCounts.categories.get("evals")).toBe(1);
    expect(facetCounts.categories.get("coding-agents")).toBeUndefined();
  });
});
