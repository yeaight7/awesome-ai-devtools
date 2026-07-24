import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "../../../scripts/lib";
import { normalizeCatalog } from "./normalize";

// Guards the boundary against the real dataset: whatever passes root
// validation must normalize into a complete, renderable catalog.
describe("normalizeCatalog with the repository data", () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
  const raw = loadCatalog(repoRoot);
  const catalog = normalizeCatalog(raw);

  it("keeps only reviewed tools and reports counts consistently", () => {
    expect(catalog.tools.length).toBe(catalog.counts.reviewed);
    expect(catalog.counts.reviewed + catalog.counts.draft).toBe(catalog.counts.total);
    expect(catalog.counts.reviewed).toBeGreaterThan(200);
  });

  it("produces a complete card model for every tool", () => {
    for (const tool of catalog.tools) {
      expect(tool.slug).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.links.length).toBeGreaterThanOrEqual(1);
      expect(tool.links[0].kind).toBe("website");
      expect(tool.primaryCategory).not.toBeNull();
      expect(tool.categories.length).toBeGreaterThanOrEqual(1);
      expect(tool.added).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(tool.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("has no duplicate slugs", () => {
    const slugs = catalog.tools.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves every reviewed category and tag reference to a definition", () => {
    const definedCategories = new Set(raw.categories.map((category) => category.slug));
    const definedTags = new Set(raw.tags.map((tag) => tag.slug));
    for (const tool of catalog.tools) {
      for (const term of [...tool.categories, tool.primaryCategory!]) {
        expect(definedCategories.has(term.slug), `undefined category ${term.slug} on ${tool.slug}`).toBe(true);
      }
      for (const term of tool.tags) {
        expect(definedTags.has(term.slug), `undefined tag ${term.slug} on ${tool.slug}`).toBe(true);
      }
    }
  });
});
