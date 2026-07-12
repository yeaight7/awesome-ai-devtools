import test from "node:test";
import assert from "node:assert/strict";
import {
  checkUrl,
  checkUrls,
  collectCatalogUrls,
  formatLinkReport,
  type LinkCheckResult
} from "../scripts/check-links.ts";
import type { CatalogData, Tool } from "../scripts/lib.ts";

interface ScriptedResponse {
  status?: number;
  error?: unknown;
}

function fetchScript(responses: ScriptedResponse[]) {
  const calls: Array<{ method: string }> = [];
  const fetchImpl = async (_url: string, init: { method: "HEAD" | "GET" }) => {
    calls.push({ method: init.method });
    const next = responses.shift();
    if (!next) {
      throw new Error("fetch script exhausted: more requests than scripted responses");
    }
    if (next.error !== undefined) {
      throw next.error;
    }
    return { ok: next.status! >= 200 && next.status! <= 299, status: next.status! };
  };
  return { fetchImpl, calls };
}

function networkError(code: string): Error {
  return Object.assign(new Error("fetch failed"), { cause: { code, message: code } });
}

function abortError(): Error {
  return Object.assign(new Error("This operation was aborted"), { name: "AbortError" });
}

const fastOptions = { retryDelaysMs: [0], timeoutMs: 5_000 };

test("checkUrl returns ok on a 2xx HEAD response with a single attempt", async () => {
  const { fetchImpl, calls } = fetchScript([{ status: 200 }]);
  const result = await checkUrl("https://good.example.com", { ...fastOptions, fetchImpl });

  assert.equal(result.verdict, "ok");
  assert.deepEqual(calls, [{ method: "HEAD" }]);
});

test("checkUrl falls back to GET when HEAD is rejected with 405", async () => {
  const { fetchImpl, calls } = fetchScript([{ status: 405 }, { status: 200 }]);
  const result = await checkUrl("https://no-head.example.com", { ...fastOptions, fetchImpl });

  assert.equal(result.verdict, "ok");
  assert.deepEqual(calls, [{ method: "HEAD" }, { method: "GET" }]);
});

test("checkUrl does not trust a HEAD 404 when GET succeeds", async () => {
  const { fetchImpl } = fetchScript([{ status: 404 }, { status: 200 }]);
  const result = await checkUrl("https://head-404-get-200.example.com", { ...fastOptions, fetchImpl });

  assert.equal(result.verdict, "ok");
});

test("checkUrl confirms a broken link only after repeated 404 GETs", async () => {
  const { fetchImpl, calls } = fetchScript([{ status: 404 }, { status: 404 }, { status: 404 }]);
  const result = await checkUrl("https://gone.example.com", { ...fastOptions, fetchImpl });

  assert.equal(result.verdict, "broken");
  assert.match(result.detail, /HTTP 404/);
  // HEAD, first GET, confirmation GET.
  assert.deepEqual(
    calls.map((call) => call.method),
    ["HEAD", "GET", "GET"]
  );
});

test("checkUrl treats a recovered 404 as ok, not broken", async () => {
  const { fetchImpl } = fetchScript([{ status: 404 }, { status: 404 }, { status: 200 }]);
  const result = await checkUrl("https://flaky-cdn.example.com", { ...fastOptions, fetchImpl });

  assert.equal(result.verdict, "ok");
});

test("checkUrl classifies persistent rate limiting as inconclusive after retries", async () => {
  const { fetchImpl, calls } = fetchScript([{ status: 429 }, { status: 429 }, { status: 429 }, { status: 429 }]);
  const result = await checkUrl("https://rate-limited.example.com", { ...fastOptions, fetchImpl, retries: 2 });

  assert.equal(result.verdict, "inconclusive");
  assert.match(result.detail, /HTTP 429/);
  // HEAD + initial GET + 2 retries.
  assert.equal(calls.length, 4);
});

test("checkUrl recovers when a transient 5xx clears up on retry", async () => {
  const { fetchImpl } = fetchScript([{ status: 500 }, { status: 502 }, { status: 200 }]);
  const result = await checkUrl("https://briefly-down.example.com", { ...fastOptions, fetchImpl, retries: 2 });

  assert.equal(result.verdict, "ok");
});

test("checkUrl classifies persistent timeouts as inconclusive", async () => {
  const { fetchImpl } = fetchScript([
    { error: abortError() },
    { error: abortError() },
    { error: abortError() },
    { error: abortError() }
  ]);
  const result = await checkUrl("https://slow.example.com", { ...fastOptions, fetchImpl, retries: 2 });

  assert.equal(result.verdict, "inconclusive");
  assert.match(result.detail, /timeout/);
});

test("checkUrl confirms unresolvable DNS as broken", async () => {
  const { fetchImpl } = fetchScript([
    { error: networkError("ENOTFOUND") },
    { error: networkError("ENOTFOUND") },
    { error: networkError("ENOTFOUND") }
  ]);
  const result = await checkUrl("https://no-such-domain.example.com", { ...fastOptions, fetchImpl });

  assert.equal(result.verdict, "broken");
  assert.match(result.detail, /DNS lookup failed/);
});

test("checkUrl treats bot walls (403) as inconclusive without retrying", async () => {
  const { fetchImpl, calls } = fetchScript([{ status: 403 }, { status: 403 }]);
  const result = await checkUrl("https://bot-wall.example.com", { ...fastOptions, fetchImpl });

  assert.equal(result.verdict, "inconclusive");
  assert.equal(calls.length, 2);
});

test("checkUrl treats TLS problems as inconclusive", async () => {
  const { fetchImpl } = fetchScript([
    { error: networkError("DEPTH_ZERO_SELF_SIGNED_CERT") },
    { error: networkError("DEPTH_ZERO_SELF_SIGNED_CERT") }
  ]);
  const result = await checkUrl("https://bad-cert.example.com", { ...fastOptions, fetchImpl });

  assert.equal(result.verdict, "inconclusive");
  assert.match(result.detail, /TLS problem/);
});

function makeTool(overrides: Partial<Tool>): Tool {
  return {
    slug: "tool-a",
    name: "Tool A",
    description: "CLI that runs repository-wide code searches and returns structured results.",
    website_url: "https://a.example.com",
    categories: ["coding-agents"],
    tags: ["terminal"],
    interfaces: ["cli"],
    deployment: "local",
    source_model: "open-source",
    license: "MIT",
    curation_status: "reviewed",
    added: "2026-01-01",
    last_checked: "2026-01-01",
    sources: ["https://a.example.com/docs"],
    ...overrides
  };
}

test("collectCatalogUrls dedupes URLs across fields and maps them to sorted slugs", () => {
  const catalog: CatalogData = {
    categories: [],
    tags: [],
    tools: [
      makeTool({
        slug: "tool-b",
        website_url: "https://shared.example.com",
        repo_url: "https://github.com/example/tool-b",
        sources: ["https://shared.example.com"]
      }),
      makeTool({
        slug: "tool-a",
        website_url: "https://shared.example.com",
        sources: ["https://a.example.com/docs"]
      })
    ]
  };

  const urlToSlugs = collectCatalogUrls(catalog);

  assert.deepEqual(Array.from(urlToSlugs.keys()), [
    "https://a.example.com/docs",
    "https://github.com/example/tool-b",
    "https://shared.example.com"
  ]);
  assert.deepEqual(urlToSlugs.get("https://shared.example.com"), ["tool-a", "tool-b"]);
});

test("formatLinkReport is deterministic and separates broken from inconclusive", () => {
  const results: LinkCheckResult[] = [
    { url: "https://z-broken.example.com", verdict: "broken", detail: "HTTP 404 on 3 attempts", attempts: [] },
    { url: "https://ok.example.com", verdict: "ok", detail: "HTTP 200", attempts: [] },
    { url: "https://a-broken.example.com", verdict: "broken", detail: "HTTP 410 on 3 attempts", attempts: [] },
    { url: "https://maybe.example.com", verdict: "inconclusive", detail: "HTTP 429 after 4 attempts", attempts: [] }
  ];
  const urlToSlugs = new Map<string, string[]>([
    ["https://z-broken.example.com", ["tool-z"]],
    ["https://a-broken.example.com", ["tool-a", "tool-b"]],
    ["https://maybe.example.com", ["tool-m"]]
  ]);

  const report = formatLinkReport(results, urlToSlugs);

  assert.match(report, /Link check report: 4 URLs checked\./);
  assert.match(report, /Confirmed broken \(2\)/);
  assert.match(report, /Inconclusive \(1\)/);
  assert.match(report, /Summary: 1 ok, 2 confirmed broken, 1 inconclusive\./);
  // Broken section sorted by URL, with tool attribution.
  assert(report.indexOf("https://a-broken.example.com") < report.indexOf("https://z-broken.example.com"));
  assert.match(report, /https:\/\/a-broken\.example\.com — HTTP 410 on 3 attempts — tools: tool-a, tool-b/);
  // Same input, same output.
  assert.equal(report, formatLinkReport(results, urlToSlugs));
});

test("formatLinkReport reports a fully healthy run without failure sections", () => {
  const results: LinkCheckResult[] = [{ url: "https://ok.example.com", verdict: "ok", detail: "HTTP 200", attempts: [] }];
  const report = formatLinkReport(results, new Map());

  assert.match(report, /Summary: 1 ok, 0 confirmed broken, 0 inconclusive\./);
  assert.doesNotMatch(report, /Confirmed broken/);
  assert.doesNotMatch(report, /Inconclusive/);
});

test("checkUrls processes every URL through a bounded worker pool", async () => {
  const urls = Array.from({ length: 20 }, (_, i) => `https://site-${String(i).padStart(2, "0")}.example.com`);
  let inFlight = 0;
  let maxInFlight = 0;
  const fetchImpl = async () => {
    inFlight += 1;
    maxInFlight = Math.max(maxInFlight, inFlight);
    await new Promise((resolve) => setTimeout(resolve, 5));
    inFlight -= 1;
    return { ok: true, status: 200 };
  };

  const results = await checkUrls(urls, { ...fastOptions, fetchImpl, concurrency: 4 });

  assert.equal(results.length, 20);
  assert(results.every((result) => result.verdict === "ok"));
  assert(maxInFlight <= 4, `expected at most 4 concurrent requests, saw ${maxInFlight}`);
});
