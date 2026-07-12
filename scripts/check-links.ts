import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { CatalogData, Tool, loadCatalog } from "./lib.ts";

// External link maintenance. This deliberately runs outside PR validation:
// results depend on network conditions, so it belongs in scheduled or
// manually triggered workflows only.
//
// Every URL is classified into one of three verdicts:
// - ok:           a request eventually returned HTTP 2xx.
// - broken:       confirmed dead (HTTP 404/410 or unresolvable DNS) on two
//                 independent attempts. Only this verdict fails the run.
// - inconclusive: bot walls (401/403/999), rate limits (429), server errors,
//                 timeouts, TLS/connection problems. Needs a re-run or a
//                 manual look; never fails the run.

export type LinkVerdict = "ok" | "broken" | "inconclusive";

export interface LinkAttempt {
  method: "HEAD" | "GET";
  status?: number;
  error?: string;
}

export interface LinkCheckResult {
  url: string;
  verdict: LinkVerdict;
  detail: string;
  attempts: LinkAttempt[];
}

type FetchLike = (url: string, init: { method: "HEAD" | "GET"; redirect: "follow"; signal: AbortSignal; headers: Record<string, string> }) => Promise<{ ok: boolean; status: number }>;

export interface LinkCheckOptions {
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  /** Extra GET attempts for transient failures (429/5xx/timeouts). */
  retries?: number;
  retryDelaysMs?: number[];
  userAgent?: string;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAYS_MS = [500, 2_000, 5_000];

// Some firewalls return 403 for obviously scripted user agents.
const DEFAULT_USER_AGENT = "awesome-ai-devtools/1.0 Link Checker";

type AttemptClass = "ok" | "broken" | "transient" | "inconclusive";

function classifyStatus(status: number): AttemptClass {
  if (status >= 200 && status <= 299) return "ok";
  if (status === 404 || status === 410) return "broken";
  if (status === 408 || status === 425 || status === 429 || status >= 500) return "transient";
  // 401/403/405/999/... are typically bot protection or method quirks.
  return "inconclusive";
}

function classifyError(error: unknown): { cls: AttemptClass; detail: string } {
  const err = error as { name?: string; message?: string; cause?: { code?: string; message?: string } };
  const code = err?.cause?.code ?? "";
  const message = err?.cause?.message ?? err?.message ?? String(error);

  if (err?.name === "AbortError" || err?.name === "TimeoutError" || code === "UND_ERR_CONNECT_TIMEOUT" || code === "UND_ERR_HEADERS_TIMEOUT") {
    return { cls: "transient", detail: "timeout" };
  }
  if (code === "ENOTFOUND") {
    // Unresolvable hostname: confirmed broken once it repeats.
    return { cls: "broken", detail: `DNS lookup failed (${code})` };
  }
  if (code === "EAI_AGAIN" || code === "ECONNRESET" || code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "EHOSTUNREACH" || code === "ENETUNREACH" || code === "EPIPE") {
    return { cls: "transient", detail: `connection failed (${code})` };
  }
  if (/CERT|TLS|SSL/i.test(code) || /certificate|TLS|SSL/i.test(message)) {
    return { cls: "inconclusive", detail: `TLS problem (${code || message})` };
  }
  if (/redirect count exceeded|maximum redirect/i.test(message)) {
    return { cls: "inconclusive", detail: "redirect loop" };
  }
  return { cls: "inconclusive", detail: code ? `${code}` : message };
}

export async function checkUrl(url: string, options: LinkCheckOptions = {}): Promise<LinkCheckResult> {
  const fetchImpl: FetchLike = options.fetchImpl ?? (globalThis.fetch as unknown as FetchLike);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const retryDelays = options.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS;
  const headers = { "User-Agent": options.userAgent ?? DEFAULT_USER_AGENT };
  const attempts: LinkAttempt[] = [];

  async function attempt(method: "HEAD" | "GET"): Promise<{ cls: AttemptClass; detail: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, { method, redirect: "follow", signal: controller.signal, headers });
      attempts.push({ method, status: response.status });
      return { cls: classifyStatus(response.status), detail: `HTTP ${response.status}` };
    } catch (error) {
      const classified = classifyError(error);
      attempts.push({ method, error: classified.detail });
      return classified;
    } finally {
      clearTimeout(timeout);
    }
  }

  const sleep = async (attemptIndex: number) => {
    const delay = retryDelays[Math.min(attemptIndex, retryDelays.length - 1)] ?? 0;
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  // HEAD is cheap but unreliable; anything other than 2xx re-checks with GET.
  const head = await attempt("HEAD");
  if (head.cls === "ok") {
    return { url, verdict: "ok", detail: head.detail, attempts };
  }

  let transientRetriesUsed = 0;
  let last = await attempt("GET");

  while (true) {
    if (last.cls === "ok") {
      return { url, verdict: "ok", detail: last.detail, attempts };
    }

    if (last.cls === "broken") {
      // Confirm with one more GET before declaring the link dead.
      await sleep(0);
      const confirm = await attempt("GET");
      if (confirm.cls === "ok") {
        return { url, verdict: "ok", detail: confirm.detail, attempts };
      }
      if (confirm.cls === "broken") {
        return { url, verdict: "broken", detail: `${confirm.detail} on ${attempts.length} attempts`, attempts };
      }
      return { url, verdict: "inconclusive", detail: `${confirm.detail} after ${attempts.length} attempts`, attempts };
    }

    if (last.cls === "transient" && transientRetriesUsed < retries) {
      await sleep(transientRetriesUsed);
      transientRetriesUsed += 1;
      last = await attempt("GET");
      continue;
    }

    return { url, verdict: "inconclusive", detail: `${last.detail} after ${attempts.length} attempts`, attempts };
  }
}

export function collectCatalogUrls(catalog: CatalogData): Map<string, string[]> {
  const urlToSlugs = new Map<string, Set<string>>();
  const add = (url: string | undefined, tool: Tool) => {
    if (!url) return;
    const slugs = urlToSlugs.get(url) ?? new Set<string>();
    slugs.add(tool.slug);
    urlToSlugs.set(url, slugs);
  };

  for (const tool of catalog.tools) {
    add(tool.website_url, tool);
    add(tool.repo_url, tool);
    add(tool.docs_url, tool);
    for (const source of tool.sources ?? []) {
      add(source, tool);
    }
  }

  return new Map(
    Array.from(urlToSlugs.entries())
      .sort(([left], [right]) => left.localeCompare(right, "en"))
      .map(([url, slugs]) => [url, Array.from(slugs).sort((a, b) => a.localeCompare(b, "en"))])
  );
}

export function formatLinkReport(results: LinkCheckResult[], urlToSlugs: Map<string, string[]>): string {
  const sorted = results.slice().sort((left, right) => left.url.localeCompare(right.url, "en"));
  const broken = sorted.filter((result) => result.verdict === "broken");
  const inconclusive = sorted.filter((result) => result.verdict === "inconclusive");
  const okCount = sorted.length - broken.length - inconclusive.length;

  const lines: string[] = [`Link check report: ${sorted.length} URLs checked.`, ""];

  const describe = (result: LinkCheckResult) => {
    const slugs = urlToSlugs.get(result.url) ?? [];
    const usedBy = slugs.length > 0 ? ` — tools: ${slugs.join(", ")}` : "";
    return `- ${result.url} — ${result.detail}${usedBy}`;
  };

  if (broken.length > 0) {
    lines.push(`Confirmed broken (${broken.length}) — fix or remove these URLs:`);
    lines.push(...broken.map(describe), "");
  }
  if (inconclusive.length > 0) {
    lines.push(`Inconclusive (${inconclusive.length}) — transient failures, rate limits, or bot walls; re-run or verify manually:`);
    lines.push(...inconclusive.map(describe), "");
  }

  lines.push(`Summary: ${okCount} ok, ${broken.length} confirmed broken, ${inconclusive.length} inconclusive.`);
  return lines.join("\n");
}

export async function checkUrls(
  urls: string[],
  options: LinkCheckOptions & { concurrency?: number; onProgress?: (done: number, total: number) => void } = {}
): Promise<LinkCheckResult[]> {
  const concurrency = Math.max(1, options.concurrency ?? 8);
  const queue = urls.slice();
  const results: LinkCheckResult[] = [];
  let done = 0;

  async function worker(): Promise<void> {
    while (true) {
      const url = queue.shift();
      if (url === undefined) return;
      const result = await checkUrl(url, options);
      results.push(result);
      done += 1;
      options.onProgress?.(done, urls.length);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, () => worker()));
  return results;
}

function isCliEntrypoint(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}

async function runCli(): Promise<void> {
  const args = parseArgs({
    options: {
      concurrency: { type: "string", default: "8" },
      "timeout-ms": { type: "string", default: String(DEFAULT_TIMEOUT_MS) },
      retries: { type: "string", default: String(DEFAULT_RETRIES) },
      only: { type: "string" }
    }
  });

  const concurrency = Number.parseInt(args.values.concurrency ?? "8", 10);
  const timeoutMs = Number.parseInt(args.values["timeout-ms"] ?? String(DEFAULT_TIMEOUT_MS), 10);
  const retries = Number.parseInt(args.values.retries ?? String(DEFAULT_RETRIES), 10);
  if ([concurrency, timeoutMs, retries].some((value) => !Number.isInteger(value) || value < 0) || concurrency === 0) {
    console.error("error: --concurrency, --timeout-ms, and --retries must be non-negative integers (concurrency > 0).");
    process.exit(2);
  }

  const catalog = loadCatalog(process.cwd());
  const urlToSlugs = collectCatalogUrls(catalog);
  let urls = Array.from(urlToSlugs.keys());
  if (args.values.only) {
    const needle = args.values.only;
    urls = urls.filter((url) => url.includes(needle));
  }

  console.error(`Checking ${urls.length} unique URLs (concurrency ${concurrency}, timeout ${timeoutMs}ms, retries ${retries})...`);

  const results = await checkUrls(urls, {
    concurrency,
    timeoutMs,
    retries,
    onProgress: (done, total) => {
      if (done % 50 === 0 || done === total) {
        console.error(`  ${done}/${total} checked`);
      }
    }
  });

  console.log(formatLinkReport(results, urlToSlugs));

  const brokenCount = results.filter((result) => result.verdict === "broken").length;
  process.exit(brokenCount > 0 ? 1 : 0);
}

if (isCliEntrypoint()) {
  runCli().catch((error) => {
    console.error(error);
    process.exit(2);
  });
}
