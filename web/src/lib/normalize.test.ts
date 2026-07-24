import { describe, expect, it } from "vitest";
import { fixtureCatalog, rawFixture } from "../test/fixtures";
import { normalizeCatalog } from "./normalize";

describe("normalizeCatalog", () => {
  it("excludes draft entries from the public catalog", () => {
    expect(fixtureCatalog.tools.map((tool) => tool.slug)).not.toContain("gamma-draft");
    expect(fixtureCatalog.counts).toEqual({ total: 4, reviewed: 3, draft: 1 });
  });

  it("sorts tools by name", () => {
    expect(fixtureCatalog.tools.map((tool) => tool.name)).toEqual([
      "Alpha Agent",
      "Beta Tracer",
      "Delta Kit"
    ]);
  });

  it("resolves category and tag names from the definition files", () => {
    const alpha = fixtureCatalog.tools.find((tool) => tool.slug === "alpha-agent");
    expect(alpha?.categories).toEqual([
      { slug: "coding-agents", name: "Coding agents" },
      { slug: "mcp-servers", name: "MCP servers" }
    ]);
    expect(alpha?.tags).toEqual([{ slug: "automation", name: "Automation" }]);
  });

  it("uses primary_category when present and first category otherwise", () => {
    const alpha = fixtureCatalog.tools.find((tool) => tool.slug === "alpha-agent");
    const delta = fixtureCatalog.tools.find((tool) => tool.slug === "delta-kit");
    expect(alpha?.primaryCategory).toEqual({ slug: "mcp-servers", name: "MCP servers" });
    expect(delta?.primaryCategory).toEqual({ slug: "coding-agents", name: "Coding agents" });
  });

  it("falls back to the slug for unknown term references", () => {
    const beta = fixtureCatalog.tools.find((tool) => tool.slug === "beta-tracer");
    expect(beta?.tags).toContainEqual({ slug: "unknown-tag", name: "unknown-tag" });
  });

  it("deduplicates links pointing at the same URL", () => {
    const beta = fixtureCatalog.tools.find((tool) => tool.slug === "beta-tracer");
    expect(beta?.links).toEqual([{ kind: "website", url: "https://beta.example.com" }]);

    const alpha = fixtureCatalog.tools.find((tool) => tool.slug === "alpha-agent");
    expect(alpha?.links.map((link) => link.kind)).toEqual(["website", "docs", "repo"]);

    const delta = fixtureCatalog.tools.find((tool) => tool.slug === "delta-kit");
    expect(delta?.links.map((link) => link.kind)).toEqual(["website", "docs"]);
  });

  it("precomputes lowercase search haystacks including metadata", () => {
    const alpha = fixtureCatalog.tools.find((tool) => tool.slug === "alpha-agent");
    expect(alpha?.search.name).toBe("alpha agent");
    expect(alpha?.search.terms).toContain("mcp servers");
    expect(alpha?.search.terms).toContain("mit");
    expect(alpha?.search.terms).toContain("open-source");
  });

  it("keeps off-enum draft values out without throwing", () => {
    expect(() => normalizeCatalog(rawFixture)).not.toThrow();
  });
});
