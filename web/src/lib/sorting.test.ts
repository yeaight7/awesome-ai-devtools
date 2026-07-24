import { describe, expect, it } from "vitest";
import { fixtureCatalog } from "../test/fixtures";
import { filterCatalog } from "./filtering";
import { effectiveSort } from "./sorting";
import { emptyFilterState } from "./url-state";

const tools = fixtureCatalog.tools;

describe("effectiveSort", () => {
  it("defaults to name order without a query and relevance with one", () => {
    expect(effectiveSort(emptyFilterState())).toBe("name-asc");
    expect(effectiveSort({ ...emptyFilterState(), query: "agent" })).toBe("relevance");
    expect(effectiveSort({ ...emptyFilterState(), query: "agent", sort: "name-asc" })).toBe(
      "name-asc"
    );
  });
});

describe("sorted results", () => {
  it("sorts by name descending", () => {
    const state = { ...emptyFilterState(), sort: "name-desc" as const };
    expect(filterCatalog(tools, state).tools.map((tool) => tool.name)).toEqual([
      "Delta Kit",
      "Beta Tracer",
      "Alpha Agent"
    ]);
  });

  it("sorts by added date, newest first", () => {
    const state = { ...emptyFilterState(), sort: "added-desc" as const };
    expect(filterCatalog(tools, state).tools.map((tool) => tool.slug)).toEqual([
      "beta-tracer",
      "alpha-agent",
      "delta-kit"
    ]);
  });

  it("puts stronger matches first under relevance", () => {
    // "agent" hits Alpha Agent's name but only Delta/Beta via weaker fields.
    const state = { ...emptyFilterState(), query: "agent" };
    const names = filterCatalog(tools, state).tools.map((tool) => tool.name);
    expect(names[0]).toBe("Alpha Agent");
  });
});
