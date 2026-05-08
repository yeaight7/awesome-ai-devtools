import test from "node:test";
import assert from "node:assert/strict";
import { buildReadme, DRAFT_QUEUE_LIMIT } from "../scripts/generate-readme.ts";
import { validateCatalog } from "../scripts/validate.ts";
import type { CatalogData } from "../scripts/lib.ts";

const sampleCatalog: CatalogData = {
  categories: [
    {
      slug: "coding-agents",
      name: "Coding agents",
      description: "Tools that can inspect and change code with agentic workflows."
    },
    {
      slug: "agent-skill-packs",
      name: "Agent skill packs",
      description: "Reusable instruction, workflow, or capability packs for coding agents."
    }
  ],
  tags: [
    {
      slug: "terminal",
      name: "Terminal",
      description: "Runs from a command-line interface."
    },
    {
      slug: "mcp",
      name: "MCP",
      description: "Supports Model Context Protocol workflows."
    },
    {
      slug: "self-hosted",
      name: "Self-hosted",
      description: "Can be deployed and operated by the user."
    }
  ],
  tools: [
    {
      slug: "sample-agent",
      name: "Sample Agent",
      description: "Small factual entry used to verify generated README output.",
      website_url: "https://example.com",
      repo_url: "https://github.com/example/sample-agent",
      docs_url: "https://example.com/docs",
      categories: ["coding-agents"],
      tags: ["terminal"],
      interfaces: ["cli"],
      deployment: "local",
      source_model: "open-source",
      license: "MIT",
      curation_status: "reviewed",
      added: "2026-05-07",
      last_checked: "2026-05-07",
      sources: ["https://example.com/docs"]
    },
    {
      slug: "agent-powerups",
      name: "Agent Powerups",
      description: "Curated skill packs and commands for coding agents across local developer workflows.",
      website_url: "https://github.com/yeaight7/agent-powerups",
      repo_url: "https://github.com/yeaight7/agent-powerups",
      categories: ["agent-skill-packs"],
      tags: ["mcp", "self-hosted"],
      interfaces: ["cli", "mcp"],
      deployment: "self-hosted",
      source_model: "open-source",
      license: "MIT",
      curation_status: "reviewed",
      added: "2026-05-08",
      last_checked: "2026-05-08",
      sources: ["https://github.com/yeaight7/agent-powerups"]
    },
    {
      slug: "draft-agent",
      name: "Draft Agent",
      description: "Draft candidate that should stay out of reviewed README shelves.",
      website_url: "https://draft.example.com",
      categories: ["coding-agents"],
      tags: ["terminal"],
      interfaces: ["cli"],
      deployment: "local",
      source_model: "not specified",
      license: "not specified",
      curation_status: "draft",
      review_notes: "Needs source review before promotion.",
      added: "2026-05-08",
      last_checked: "2026-05-08",
      sources: ["https://draft.example.com"]
    }
  ]
};

test("buildReadme renders grouped navigation, start here, matrix, reviewed shelves, and draft queue", () => {
  const readme = buildReadme(sampleCatalog);

  assert.match(readme, /<!-- GENERATED FILE: edit data\/tools\.yml/);
  assert.match(readme, /<img src="assets\/hero\.svg" alt="Awesome AI Devtools ecosystem map"/);
  assert.match(readme, /<code>3 tools<\/code> <code>2 reviewed<\/code> <code>1 draft<\/code> <code>2 active reviewed shelves<\/code>/);
  assert.match(readme, /## Start here/);
  assert.match(readme, /### Agent skills and plugins/);
  assert.match(readme, /- \[Agent Powerups\]\(https:\/\/github\.com\/yeaight7\/agent-powerups\)/);
  assert.match(readme, /## Explore by intent/);
  assert.match(readme, /### Build with agents/);
  assert.match(readme, /### Extend agents/);
  assert.match(readme, /## Comparison Matrix/);
  assert.match(readme, /\| Tool \| Main shelf \| OSS \| Local \| Self-hosted \| CLI \| IDE \| MCP \| Links \|/);
  assert.match(readme, /\| \[Sample Agent\]\(https:\/\/example\.com\) \| Coding agents \| Yes \| Yes \| No \| Yes \| No \| No \| \[Website\]/);
  assert.match(readme, /\| \[Agent Powerups\]\(https:\/\/github\.com\/yeaight7\/agent-powerups\) \| Agent skill packs \| Yes \| No \| Yes \| Yes \| No \| Yes \| \[Website\]/);
  assert.match(readme, /## Needs review/);
  assert.match(readme, /Draft Agent/);
  assert.doesNotMatch(readme, /unknown/i);
  assert.doesNotMatch(readme, /curation_status/i);
  assert.match(readme, /\| Tool \| Good for \| Experience \| Links \|/);
  assert.match(readme, /\| \[Sample Agent\]\(https:\/\/example\.com\) \| Small factual entry used to verify generated README output\. \| CLI · Local \| \[Website\]/);
  assert.match(readme, /### Coding agents/);
  assert.match(readme, /Small factual entry used to verify generated README output\./);
  assert.doesNotMatch(readme, /\| \[Draft Agent\]\(https:\/\/draft\.example\.com\) \| Draft candidate that should stay out of reviewed README shelves\./);
});

test("validateCatalog reports duplicate slugs and unknown category references", () => {
  const invalidCatalog: CatalogData = {
    ...sampleCatalog,
    tools: [
      sampleCatalog.tools[0],
      {
        ...sampleCatalog.tools[0],
        categories: ["missing-category"]
      }
    ]
  };

  const result = validateCatalog(invalidCatalog, {
    readmeContent: buildReadme(sampleCatalog),
    checkGeneratedReadme: false,
    checkSorted: false
  });

  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes("duplicate tool slug")));
  assert(result.errors.some((error) => error.includes("unknown category")));
});

test("validateCatalog enforces 40-180 character descriptions", () => {
  const invalidCatalog: CatalogData = {
    ...sampleCatalog,
    tools: [
      {
        ...sampleCatalog.tools[0],
        description: "x".repeat(181)
      }
    ]
  };

  const result = validateCatalog(invalidCatalog, {
    checkGeneratedReadme: false,
    checkSorted: false
  });

  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes("40-180 characters")));
});

test("validateCatalog rejects literal unknown metadata values", () => {
  const invalidCatalog: CatalogData = {
    ...sampleCatalog,
    tools: [
      {
        ...sampleCatalog.tools[0],
        deployment: "unknown",
        license: "unknown"
      }
    ]
  };

  const result = validateCatalog(invalidCatalog, {
    checkGeneratedReadme: false,
    checkSorted: false
  });

  assert.equal(result.ok, false);
  assert(result.errors.some((error) => error.includes('use "not specified" instead of "unknown"')));
});

test("validateCatalog reports source-quality warnings without failing validation", () => {
  const warningCatalog: CatalogData = {
    ...sampleCatalog,
    tools: [
      {
        ...sampleCatalog.tools[0],
        sources: ["https://competitor.test/comparison"]
      }
    ]
  };

  const result = validateCatalog(warningCatalog, {
    checkGeneratedReadme: false,
    checkSorted: false
  });

  assert.equal(result.ok, true);
  assert(result.warnings.some((warning) => warning.includes("source host")));
});

test("mainShelf resolves by canonical category order, not alphabetical tool.categories order", () => {
  // In this catalog coding-agents is canonical position 0, agent-skill-packs is position 1.
  // The tool has both; after normalizeTool() its categories array is ["agent-skill-packs", "coding-agents"]
  // (alphabetical). mainShelf must still return "Coding agents" (canonical winner).
  const canonicalCatalog: CatalogData = {
    categories: [
      { slug: "coding-agents", name: "Coding agents", description: "Agentic coding tools." },
      { slug: "agent-skill-packs", name: "Agent skill packs", description: "Skill packs." }
    ],
    tags: [{ slug: "terminal", name: "Terminal", description: "CLI." }],
    tools: [
      {
        slug: "multi-cat-tool",
        name: "Multi Cat Tool",
        description: "A tool that belongs to both coding-agents and agent-skill-packs categories.",
        website_url: "https://example.com/multi",
        // deliberately listed in opposite order from canonical — normalizer will sort alphabetically
        categories: ["coding-agents", "agent-skill-packs"],
        tags: ["terminal"],
        interfaces: ["cli"],
        deployment: "local",
        source_model: "open-source",
        license: "MIT",
        curation_status: "reviewed",
        added: "2026-05-08",
        last_checked: "2026-05-08",
        sources: ["https://example.com/multi"]
      }
    ]
  };

  const readme = buildReadme(canonicalCatalog);
  // After normalizeTool, categories = ["agent-skill-packs", "coding-agents"] (alphabetical).
  // categories[0] = "agent-skill-packs" → wrong answer would be "Agent skill packs".
  // Canonical order: coding-agents (index 0) wins → correct answer is "Coding agents".
  assert.match(readme, /\| \[Multi Cat Tool\].*\| Coding agents \|/);
  assert.doesNotMatch(readme, /\| \[Multi Cat Tool\].*\| Agent skill packs \|/);
});

test("validateCatalog rejects citation and research artifact patterns in public fields", () => {
  // [web: in description
  const webCiteCatalog: CatalogData = {
    ...sampleCatalog,
    tools: [{ ...sampleCatalog.tools[0], description: "A tool that [web:123] retrieves context for a workflow." }]
  };
  const webCiteResult = validateCatalog(webCiteCatalog, { checkGeneratedReadme: false, checkSorted: false });
  assert.equal(webCiteResult.ok, false);
  assert(webCiteResult.errors.some((e) => e.includes("citation artifact")));

  // filecite in name
  const fileciteCatalog: CatalogData = {
    ...sampleCatalog,
    tools: [{ ...sampleCatalog.tools[0], name: "filecite Tool Extra Text Here Padding" }]
  };
  const fileciteResult = validateCatalog(fileciteCatalog, { checkGeneratedReadme: false, checkSorted: false });
  assert.equal(fileciteResult.ok, false);
  assert(fileciteResult.errors.some((e) => e.includes("citation artifact")));

  // CJK bracket in description
  const cjkCatalog: CatalogData = {
    ...sampleCatalog,
    tools: [{ ...sampleCatalog.tools[0], description: "Text with 【citation artifact】 embedded inside it here." }]
  };
  const cjkResult = validateCatalog(cjkCatalog, { checkGeneratedReadme: false, checkSorted: false });
  assert.equal(cjkResult.ok, false);
  assert(cjkResult.errors.some((e) => e.includes("citation artifact")));

  // Clean tool must pass
  const cleanResult = validateCatalog(sampleCatalog, { checkGeneratedReadme: false, checkSorted: false });
  assert.equal(cleanResult.ok, true);
});

test("buildReadme truncates draft queue to DRAFT_QUEUE_LIMIT when there are many drafts", () => {
  const draftTemplate = sampleCatalog.tools[2]; // draft-agent
  const manyDraftsCatalog: CatalogData = {
    ...sampleCatalog,
    tools: [
      sampleCatalog.tools[0], // one reviewed tool
      ...Array.from({ length: DRAFT_QUEUE_LIMIT + 5 }, (_, i) => ({
        ...draftTemplate,
        slug: `draft-${String(i + 1).padStart(2, "0")}`,
        name: `Draft Tool ${String(i + 1).padStart(2, "0")}`,
        website_url: `https://draft-${i + 1}.example.com`,
        sources: [`https://draft-${i + 1}.example.com`]
      }))
    ]
  };

  const readme = buildReadme(manyDraftsCatalog);

  // The first entry should appear
  assert.match(readme, /Draft Tool 01/);
  // Entry at position DRAFT_QUEUE_LIMIT+1 should not appear
  const overflowName = `Draft Tool ${String(DRAFT_QUEUE_LIMIT + 1).padStart(2, "0")}`;
  assert.doesNotMatch(readme, new RegExp(overflowName));
  // Truncation notice must be present
  assert.match(readme, new RegExp(`Showing ${DRAFT_QUEUE_LIMIT} of ${DRAFT_QUEUE_LIMIT + 5}`));
  assert.match(readme, /data\/tools\.yml/);
});
