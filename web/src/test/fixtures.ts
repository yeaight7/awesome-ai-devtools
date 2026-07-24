import { normalizeCatalog, type RawCatalog } from "../lib/normalize";

export const rawFixture: RawCatalog = {
  categories: [
    { slug: "coding-agents", name: "Coding agents", description: "Agents that edit code." },
    { slug: "mcp-servers", name: "MCP servers", description: "Model Context Protocol servers." },
    { slug: "evals", name: "Evals", description: "Evaluation tooling." }
  ],
  tags: [
    { slug: "automation", name: "Automation", description: "Automation workflows." },
    { slug: "tracing", name: "Tracing", description: "Execution tracing." }
  ],
  tools: [
    {
      slug: "alpha-agent",
      name: "Alpha Agent",
      description: "Terminal coding agent that edits files in a local Git repository.",
      website_url: "https://alpha.example.com",
      repo_url: "https://github.com/example/alpha-agent",
      docs_url: "https://docs.alpha.example.com",
      categories: ["coding-agents", "mcp-servers"],
      primary_category: "mcp-servers",
      tags: ["automation"],
      interfaces: ["api", "cli"],
      deployment: "local",
      source_model: "open-source",
      license: "MIT",
      curation_status: "reviewed",
      added: "2026-01-05",
      last_checked: "2026-03-01"
    },
    {
      slug: "beta-tracer",
      name: "Beta Tracer",
      description: "Hosted tracing dashboard for agent runs with span-level inspection.",
      website_url: "https://beta.example.com",
      repo_url: "https://beta.example.com",
      docs_url: "https://beta.example.com",
      categories: ["evals"],
      tags: ["tracing", "unknown-tag"],
      interfaces: ["web"],
      deployment: "not specified",
      source_model: "proprietary",
      license: "not specified",
      curation_status: "reviewed",
      added: "2026-02-10",
      last_checked: "2026-02-10"
    },
    {
      slug: "gamma-draft",
      name: "Gamma Draft",
      description: "Draft entry that must never appear in the public catalog view.",
      website_url: "https://gamma.example.com",
      categories: ["shiny-new-category"],
      tags: ["untriaged"],
      interfaces: ["web-app"],
      deployment: "cloud",
      source_model: "not specified",
      license: "not specified",
      curation_status: "draft",
      added: "2026-03-15",
      last_checked: "2026-03-15"
    },
    {
      slug: "delta-kit",
      name: "Delta Kit",
      description: "Library for building evaluation harnesses around LLM applications.",
      website_url: "https://delta.example.com",
      docs_url: "https://delta.example.com/docs",
      categories: ["coding-agents"],
      tags: [],
      interfaces: ["library"],
      deployment: "hybrid",
      source_model: "source-available",
      license: "Apache-2.0",
      curation_status: "reviewed",
      added: "2025-12-01",
      last_checked: "2026-01-20"
    }
  ]
};

export const fixtureCatalog = normalizeCatalog(rawFixture);
