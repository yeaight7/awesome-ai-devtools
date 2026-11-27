import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const require = createRequire(import.meta.url);
const scriptPath = new URL("../.github/scripts/pr-labels.cjs", import.meta.url);
function automation() {
  assert.ok(existsSync(scriptPath), "PR labeling implementation must exist");
  return require(fileURLToPath(scriptPath));
}
const taxonomy = YAML.stringify([
  { slug: "coding-agents", name: "Coding agents" },
  { slug: "mcp-servers", name: "MCP servers" },
  { slug: "agent-evals", name: "Agent evals" }
]);
const tool = (slug: string, categories = ["coding-agents"], extra = {}) => ({
  slug, name: slug, description: "A factual tool description", categories,
  tags: ["cli", "mcp"], interfaces: ["cli", "mcp"], sources: ["https://example.com", "https://example.org"], ...extra
});
const classify = (before: unknown[], after: unknown[], files = [{ filename: "data/tools.yml" }]) =>
  automation().classify({ files, before: YAML.stringify(before), after: YAML.stringify(after), taxonomy });

test("added tools receive catalog and their primary category label", () => {
  assert.deepEqual(classify([], [tool("new")]).wanted, ["catalog", "category:coding-agents"]);
});

test("edited and removed tools contribute their old and new primary categories", () => {
  const before = [tool("moving"), tool("removed", ["agent-evals"]), tool("unchanged", ["mcp-servers"])];
  const after = [tool("moving", ["mcp-servers"]), before[2]];
  assert.deepEqual(classify(before, after).wanted, ["catalog", "category:agent-evals", "category:coding-agents", "category:mcp-servers"]);
});

test("multi-category tools use primary_category without labeling secondary categories", () => {
  assert.deepEqual(classify([], [tool("multi", ["coding-agents", "mcp-servers"], { primary_category: "mcp-servers" })]).wanted,
    ["catalog", "category:mcp-servers"]);
});

test("ambiguous drafts and unknown categories produce warnings without guessed labels", () => {
  const result = classify([], [tool("ambiguous", ["coding-agents", "mcp-servers"]), tool("future", ["new-category"])]);
  assert.deepEqual(result.wanted, ["catalog"]);
  assert.equal(result.warnings.length, 2);
});

test("sorting tools, keys, and set-like arrays does not label unchanged tool categories", () => {
  const before = [tool("z"), tool("a", ["coding-agents", "mcp-servers"], { primary_category: "coding-agents" })];
  const after = [...before].reverse().map(value => Object.fromEntries(Object.entries(value).reverse().map(([key, item]) =>
    [key, Array.isArray(item) ? [...item].reverse() : item])));
  assert.deepEqual(classify(before, after).wanted, ["catalog"]);
});

test("YAML comments and formatting do not select tool categories", () => {
  const data = [tool("unchanged")];
  const result = automation().classify({ files: [{ filename: "data/tools.yml" }], before: YAML.stringify(data),
    after: `# reformatted\n${JSON.stringify(data)}`, taxonomy });
  assert.deepEqual(result.wanted, ["catalog"]);
});

test("area labels cover mixed changes and both sides of renames", () => {
  const files = [
    { filename: "data/tags.yml" }, { filename: "README.md" }, { filename: "docs/COMPARISON.md" },
    { filename: "assets/header.svg" }, { filename: "scripts/example.ts" }, { filename: "tests/example.test.ts" },
    { filename: "package-lock.json" }, { filename: "tsconfig.json" },
    { filename: "archive/old.yml", previous_filename: ".github/workflows/old.yml" },
    { filename: ".github/scripts/pr-labels.cjs" }
  ];
  assert.deepEqual(automation().classify({ files, before: "[]", after: "[]", taxonomy }).wanted,
    ["catalog", "documentation", "github-actions", "tooling"]);
});

test("unrelated file changes do not add labels or parse proposed tool YAML", () => {
  assert.deepEqual(automation().classify({ files: [{ filename: "LICENSE" }], before: "invalid", after: "invalid", taxonomy }).wanted, []);
});

for (const [name, after] of [
  ["malformed YAML", "- slug: [broken"],
  ["non-array documents", "slug: invalid"],
  ["duplicate slugs", YAML.stringify([tool("duplicate"), tool("duplicate")])],
  ["invalid category values", YAML.stringify([tool("bad", ["coding-agents"], { categories: "coding-agents" })])],
  ["invalid primary categories", YAML.stringify([tool("bad", ["coding-agents"], { primary_category: "mcp-servers" })])],
  ["custom YAML tags", "- !execute {slug: bad, categories: [coding-agents]}"],
  ["YAML aliases", "- &tool {slug: repeated, categories: [coding-agents]}\n- *tool"]
] as const) {
  test(`classification rejects ${name} before labels can change`, () => {
    const subject = automation();
    assert.throws(() => subject.classify({ files: [{ filename: "data/tools.yml" }], before: "[]", after, taxonomy }));
  });
}

function fakeGitHub(options: {
  before?: string; after?: string; current?: string[]; existing?: string[];
  closed?: boolean; changedDuringRun?: boolean; changedFiles?: number;
  files?: { filename: string; status?: string; previous_filename?: string }[];
  contentError?: Error;
  missingRef?: string;
  createError?: Error;
  labelCreatedConcurrently?: boolean;
} = {}) {
  const calls: { operation: string; args: any }[] = [];
  const warnings: string[] = [];
  const pr = {
    state: options.closed ? "closed" : "open", number: 52,
    changed_files: options.changedFiles ?? 1,
    base: { sha: "base-sha", ref: "main", repo: { name: "repo", owner: { login: "owner" } } },
    head: { sha: "fork-head-sha", repo: { name: "fork-repo", owner: { login: "contributor" } } }
  };
  let reads = 0;
  const record = (operation: string) => async (args: unknown) => { calls.push({ operation, args }); };
  const github = {
    rest: {
      pulls: {
        get: async () => ({ data: ++reads > 1 && options.changedDuringRun ? { ...pr, head: { ...pr.head, sha: "new-head" } } : pr }),
        listFiles: "files"
      },
      repos: {
        compareCommitsWithBasehead: async (args: unknown) => {
          calls.push({ operation: "compare", args });
          return { data: { merge_base_commit: { sha: "merge-base-sha" } } };
        },
        getContent: async (args: { owner: string; repo: string; ref: string; path: string }) => {
          calls.push({ operation: "content", args });
          if (options.contentError) throw options.contentError;
          if (args.ref === options.missingRef) throw Object.assign(new Error("Missing file"), { status: 404 });
          return { data: args.ref === "merge-base-sha" ? options.before ?? "[]" : options.after ?? YAML.stringify([tool("new")]) };
        }
      },
      issues: { listLabelsOnIssue: "current", listLabelsForRepo: "existing",
        createLabel: async (args: unknown) => {
          calls.push({ operation: "create", args });
          if (options.createError) throw options.createError;
        }, addLabels: record("add"), removeLabel: record("remove") }
    },
    paginate: async (method: string, args: unknown) => {
      calls.push({ operation: method, args });
      if (method === "files") return options.files ?? [{ filename: "data/tools.yml", status: "modified" }];
      if (method === "current") return (options.current ?? []).map(name => ({ name }));
      if (method === "existing") return [
        ...(options.existing ?? []),
        ...(options.labelCreatedConcurrently && calls.some(call => call.operation === "create") ? ["category:coding-agents"] : [])
      ].map(name => ({ name }));
      throw new Error(`Unexpected API ${method}`);
    }
  };
  return { github, context: { repo: { owner: "owner", repo: "repo" } },
    core: { info: () => {}, warning: (message: string) => warnings.push(message) }, calls, warnings, pr };
}

async function reconcile(options: Parameters<typeof fakeGitHub>[0] = {}) {
  const fixture = fakeGitHub(options);
  await automation().reconcile({ ...fixture, pull_number: 52, taxonomy });
  return fixture;
}
const mutations = (calls: { operation: string; args: any }[]) => calls.filter(call => ["create", "add", "remove"].includes(call.operation));

test("fork labeling reads merge-base and fork-head YAML as data, then reconciles only managed labels", async () => {
  const { calls } = await reconcile({ current: ["bug", "tool-submission", "category:retired", "documentation"], existing: ["catalog"] });
  assert.deepEqual(calls.filter(call => call.operation === "content").map(call => ({ owner: call.args.owner, repo: call.args.repo, ref: call.args.ref })), [
    { owner: "owner", repo: "repo", ref: "merge-base-sha" },
    { owner: "contributor", repo: "fork-repo", ref: "fork-head-sha" }
  ]);
  assert.deepEqual(mutations(calls), [
    { operation: "create", args: { owner: "owner", repo: "repo", name: "category:coding-agents", color: "5319e7", description: "Primary category of changed tools: Coding agents" } },
    { operation: "add", args: { owner: "owner", repo: "repo", issue_number: 52, labels: ["catalog", "category:coding-agents"] } },
    { operation: "remove", args: { owner: "owner", repo: "repo", issue_number: 52, name: "category:retired" } },
    { operation: "remove", args: { owner: "owner", repo: "repo", issue_number: 52, name: "documentation" } }
  ]);
});

test("idempotent reconciliation performs no writes when managed labels are current", async () => {
  const { calls } = await reconcile({ current: ["catalog", "category:coding-agents", "help wanted"], existing: ["catalog", "category:coding-agents"] });
  assert.deepEqual(mutations(calls), []);
});

test("malformed proposed YAML leaves repository and PR labels untouched", async () => {
  const fixture = fakeGitHub({ after: "- slug: [broken", current: ["documentation"] });
  await assert.rejects(automation().reconcile({ ...fixture, pull_number: 52, taxonomy }));
  assert.deepEqual(mutations(fixture.calls), []);
});

test("unexpected content API failures leave labels untouched", async () => {
  const fixture = fakeGitHub({ contentError: Object.assign(new Error("Forbidden"), { status: 403 }) });
  await assert.rejects(automation().reconcile({ ...fixture, pull_number: 52, taxonomy }), /Forbidden/);
  assert.deepEqual(mutations(fixture.calls), []);
});

test("closed PRs do not read files or mutate labels", async () => {
  const { calls } = await reconcile({ closed: true });
  assert.deepEqual(calls, []);
});

test("changed heads are detected before label writes", async () => {
  const { calls, warnings } = await reconcile({ changedDuringRun: true });
  assert.deepEqual(mutations(calls), []);
  assert.equal(warnings.length, 1);
});

test("incomplete changed-file lists fail before label writes", async () => {
  const fixture = fakeGitHub({ changedFiles: 3001 });
  await assert.rejects(automation().reconcile({ ...fixture, pull_number: 52, taxonomy }), /changed.file/i);
  assert.deepEqual(mutations(fixture.calls), []);
});

test("a newly added catalog can have no merge-base tools file", async () => {
  const { calls } = await reconcile({ files: [{ filename: "data/tools.yml", status: "added" }], missingRef: "merge-base-sha" });
  assert.deepEqual(calls.find(call => call.operation === "add")?.args.labels, ["catalog", "category:coding-agents"]);
});

test("a removed catalog still labels the removed tools' categories", async () => {
  const { calls } = await reconcile({ before: YAML.stringify([tool("removed")]),
    files: [{ filename: "data/tools.yml", status: "removed" }], missingRef: "fork-head-sha" });
  assert.deepEqual(calls.find(call => call.operation === "add")?.args.labels, ["catalog", "category:coding-agents"]);
});

test("a missing modified catalog is an API failure, not an empty catalog", async () => {
  const fixture = fakeGitHub({ missingRef: "fork-head-sha" });
  await assert.rejects(automation().reconcile({ ...fixture, pull_number: 52, taxonomy }), /Missing file/);
  assert.deepEqual(mutations(fixture.calls), []);
});

test("concurrent repository-label creation does not fail reconciliation", async () => {
  const { calls } = await reconcile({ existing: ["catalog"],
    createError: Object.assign(new Error("Already exists"), { status: 422 }), labelCreatedConcurrently: true });
  assert.deepEqual(calls.find(call => call.operation === "add")?.args.labels, ["catalog", "category:coding-agents"]);
});

test("label creation errors are surfaced when the label does not exist", async () => {
  const fixture = fakeGitHub({ existing: ["catalog"], createError: Object.assign(new Error("Invalid label"), { status: 422 }) });
  await assert.rejects(automation().reconcile({ ...fixture, pull_number: 52, taxonomy }), /Invalid label/);
  assert.equal(fixture.calls.filter(call => ["add", "remove"].includes(call.operation)).length, 0);
});

test("the label workflow passes a validated manual number to the actual reconciler", async () => {
  const path = new URL("../.github/workflows/pr-labels.yml", import.meta.url);
  assert.ok(existsSync(path), "PR labels workflow must exist");
  const workflow = YAML.parse(readFileSync(path, "utf8"));
  const script = workflow.jobs.label.steps.find((step: any) => step.with?.script).with.script;
  const fixture = fakeGitHub();
  // GitHub's shared issue-label endpoint requires PR write access when its
  // target is a pull request, even if repository label creation is permitted.
  fixture.github.rest.issues.addLabels = async (args: unknown) => {
    if (workflow.jobs.label.permissions["pull-requests"] !== "write") {
      throw Object.assign(new Error("PR labels require pull-requests: write"), { status: 403 });
    }
    fixture.calls.push({ operation: "add", args });
  };
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const execute = new AsyncFunction("github", "context", "core", "process", "require", script);
  const workflowRequire = createRequire(new URL("../package.json", import.meta.url));
  await execute(fixture.github, fixture.context, fixture.core, { env: { PR_NUMBER: "52" } }, workflowRequire);
  assert.ok(mutations(fixture.calls).some(call => call.operation === "add"));
  await assert.rejects(execute(fixture.github, fixture.context, fixture.core, { env: { PR_NUMBER: "bad" } }, workflowRequire), /PR number/);
});
