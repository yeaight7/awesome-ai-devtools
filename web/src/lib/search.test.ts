import { describe, expect, it } from "vitest";
import { fixtureCatalog } from "../test/fixtures";
import { scoreTool, tokenize } from "./search";

const alpha = fixtureCatalog.tools.find((tool) => tool.slug === "alpha-agent")!;
const beta = fixtureCatalog.tools.find((tool) => tool.slug === "beta-tracer")!;

describe("tokenize", () => {
  it("lowercases, splits on whitespace, and deduplicates", () => {
    expect(tokenize("  Alpha   ALPHA agent ")).toEqual(["alpha", "agent"]);
    expect(tokenize("")).toEqual([]);
  });
});

describe("scoreTool", () => {
  it("matches everything when the query is empty", () => {
    expect(scoreTool(alpha, [])).toBe(1);
  });

  it("ranks name matches above metadata and description matches", () => {
    const nameScore = scoreTool(alpha, ["alpha"]);
    const termScore = scoreTool(alpha, ["automation"]);
    const descriptionScore = scoreTool(alpha, ["terminal"]);
    expect(nameScore).toBeGreaterThan(termScore);
    expect(termScore).toBeGreaterThan(descriptionScore);
    expect(descriptionScore).toBeGreaterThan(0);
  });

  it("ranks exact and prefix name matches above substring matches", () => {
    expect(scoreTool(alpha, ["alpha agent"])).toBeGreaterThan(scoreTool(alpha, ["alpha"]));
    expect(scoreTool(alpha, ["alpha"])).toBeGreaterThan(scoreTool(alpha, ["gent"]));
  });

  it("requires every token to match (AND semantics)", () => {
    expect(scoreTool(alpha, ["alpha", "zzz-nope"])).toBe(0);
    expect(scoreTool(alpha, ["alpha", "terminal"])).toBeGreaterThan(0);
  });

  it("matches category names, tags, license, and other metadata", () => {
    expect(scoreTool(beta, ["evals"])).toBeGreaterThan(0);
    expect(scoreTool(beta, ["tracing"])).toBeGreaterThan(0);
    expect(scoreTool(alpha, ["mit"])).toBeGreaterThan(0);
    expect(scoreTool(alpha, ["cli"])).toBeGreaterThan(0);
  });
});
