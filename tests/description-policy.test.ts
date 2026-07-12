import test from "node:test";
import assert from "node:assert/strict";
import { findDescriptionLanguageIssues, validateCatalog } from "../scripts/validate.ts";
import type { CatalogData, Tool } from "../scripts/lib.ts";

const baseTool: Tool = {
  slug: "sample-tool",
  name: "Sample Tool",
  description: "CLI that runs repository-wide code searches and returns structured results.",
  website_url: "https://example.com",
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
};

const baseCatalog: CatalogData = {
  categories: [
    { slug: "coding-agents", name: "Coding agents", description: "Tools that change code with agentic workflows." }
  ],
  tags: [{ slug: "terminal", name: "Terminal", description: "Runs from a command-line interface." }],
  tools: [baseTool]
};

function validateDescription(description: string, curationStatus: "reviewed" | "draft" = "reviewed") {
  const tool: Tool = {
    ...baseTool,
    description,
    curation_status: curationStatus,
    ...(curationStatus === "draft" ? { review_notes: "Imported draft; verify metadata." } : {})
  };
  return validateCatalog({ ...baseCatalog, tools: [tool] }, { checkGeneratedReadme: false, checkSorted: false });
}

test("findDescriptionLanguageIssues flags clearly promotional copy as errors", () => {
  const issues = findDescriptionLanguageIssues(
    "The best-in-class, blazing fast coding agent. Revolutionary, state-of-the-art and trusted by millions!"
  );

  assert(issues.promotional.includes("best-in-class"));
  assert(issues.promotional.includes("blazing fast"));
  assert(issues.promotional.includes("Revolutionary"));
  assert(issues.promotional.includes("state-of-the-art"));
  assert(issues.promotional.includes("trusted by"));
  assert(issues.promotional.includes("exclamation mark"));
});

test("findDescriptionLanguageIssues flags hyphen and space phrase variants", () => {
  assert(findDescriptionLanguageIssues("A state of the art code assistant.").promotional.length > 0);
  assert(findDescriptionLanguageIssues("A cutting edge code assistant.").promotional.length > 0);
  assert(findDescriptionLanguageIssues("A lightning-fast code assistant.").promotional.length > 0);
  assert(findDescriptionLanguageIssues("Makes reviews 10x faster.").promotional.length > 0);
  assert(findDescriptionLanguageIssues("The #1 agent framework.").promotional.length > 0);
  assert(findDescriptionLanguageIssues("World's first autonomous SRE.").promotional.length > 0);
});

test("findDescriptionLanguageIssues flags emoji", () => {
  const issues = findDescriptionLanguageIssues("Deploy agents from your terminal 🚀");
  assert(issues.promotional.includes("emoji"));
});

test("findDescriptionLanguageIssues flags superlative claims", () => {
  assert(findDescriptionLanguageIssues("The fastest LLM inference engine available.").promotional.length > 0);
  assert(findDescriptionLanguageIssues("The easiest way to build agents.").promotional.length > 0);
  assert(findDescriptionLanguageIssues("The most powerful review agent.").promotional.length > 0);
});

test("factual descriptions from the real catalog pass with no findings", () => {
  const factual = [
    // Real corpus lines that contain near-miss words: fast, simple, free, your.
    "Rust-based engine for fast, flexible LLM inference with OpenAI-compatible APIs, web UI, and extensive quantization options.",
    "Simple web agent server built on Browser Use that exposes browser automation to other apps via HTTP APIs.",
    "Open-source toolkit for automated evaluation of RAG systems using reference-free and reference-based metrics.",
    "Local MCP server and browser extension that connect AI apps to your real browser profile for automating web tasks using AI tools.",
    "Self-hosted REST server that emulates the OpenAI API to run local ggml/llama.cpp and related models on your own hardware."
  ];

  for (const description of factual) {
    const issues = findDescriptionLanguageIssues(description);
    assert.deepEqual(issues.promotional, [], `unexpected promotional finding in: ${description}`);
    assert.deepEqual(issues.subjective, [], `unexpected subjective finding in: ${description}`);
  }
});

test("legitimate technical idioms are not flagged", () => {
  const idioms = [
    "Linter that enforces security best practices in agent configuration files.",
    "Uses best-effort matching to map failures to source lines in the report.",
    "Static analyzer for smart contract vulnerabilities in Solidity projects.",
    "Curated awesome list of Model Context Protocol servers grouped by capability."
  ];

  for (const description of idioms) {
    const issues = findDescriptionLanguageIssues(description);
    assert.deepEqual(issues.promotional, [], `unexpected promotional finding in: ${description}`);
    assert.deepEqual(issues.subjective, [], `unexpected subjective finding in: ${description}`);
  }
});

test("soft subjective wording is a warning, not an error", () => {
  const result = validateDescription("Monitoring dashboard for agents with an intuitive UI and robust alerting rules.");

  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
  assert(result.warnings.some((warning) => warning.includes('subjective wording ("intuitive")')));
  assert(result.warnings.some((warning) => warning.includes('subjective wording ("robust")')));
});

test("validateCatalog rejects promotional descriptions on reviewed and draft entries", () => {
  const reviewed = validateDescription("The best AI coding agent with unmatched context handling for large repos.");
  assert.equal(reviewed.ok, false);
  assert(reviewed.errors.some((error) => error.includes("promotional language")));

  const draft = validateDescription("Supercharge your workflow with this game-changing repo automation suite.", "draft");
  assert.equal(draft.ok, false);
  assert(draft.errors.some((error) => error.includes("promotional language")));
});

test("validateCatalog passes a neutral description without language findings", () => {
  const result = validateDescription("GitHub app that reviews pull requests and posts inline comments with suggested fixes.");

  assert.equal(result.ok, true);
  assert(!result.warnings.some((warning) => warning.includes("subjective wording")));
});
