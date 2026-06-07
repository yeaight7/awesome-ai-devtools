import { loadCatalog } from "./lib.ts";
import { parseArgs } from "node:util";

const args = parseArgs({
  options: {
    concurrency: { type: "string", default: "10" }
  }
});
const concurrency = parseInt(args.values.concurrency || "10", 10);

const catalog = loadCatalog(process.cwd());
const urls = new Set<string>();

for (const tool of catalog.tools) {
  if (tool.website_url) urls.add(tool.website_url);
  if (tool.repo_url) urls.add(tool.repo_url);
  if (tool.docs_url) urls.add(tool.docs_url);
  for (const source of tool.sources || []) {
    urls.add(source);
  }
}

const urlList = Array.from(urls).sort();
console.log(`Found ${urlList.length} unique URLs to check.`);

interface CheckResult {
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
}

// Ensure the user agent doesn't look completely like an automated script,
// some firewalls return 403 otherwise.
const fetchOptions = {
  headers: {
    "User-Agent": "awesome-ai-devtools/1.0 Link Checker"
  }
};

async function checkUrl(url: string): Promise<CheckResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    let response = await fetch(url, { method: "HEAD", signal: controller.signal, ...fetchOptions });
    clearTimeout(timeout);
    
    // Some servers return 405/403/400 for HEAD, fallback to GET
    if (!response.ok && [405, 403, 400].includes(response.status)) {
      const getController = new AbortController();
      const getTimeout = setTimeout(() => getController.abort(), 10000);
      response = await fetch(url, { method: "GET", signal: getController.signal, ...fetchOptions });
      clearTimeout(getTimeout);
    }
    
    return { url, ok: response.ok, status: response.status };
  } catch (error: any) {
    return { url, ok: false, error: error.message };
  }
}

async function run() {
  const results: CheckResult[] = [];
  const failures: CheckResult[] = [];
  
  for (let i = 0; i < urlList.length; i += concurrency) {
    const chunk = urlList.slice(i, i + concurrency);
    const chunkPromises = chunk.map(url => checkUrl(url));
    const chunkResults = await Promise.all(chunkPromises);
    
    for (const res of chunkResults) {
      if (res.ok) {
        process.stdout.write(".");
      } else {
        process.stdout.write("X");
        failures.push(res);
      }
      results.push(res);
    }
  }
  
  console.log(`\n\nChecked ${results.length} URLs.`);
  
  if (failures.length > 0) {
    console.error(`\nFound ${failures.length} broken links:`);
    for (const f of failures) {
      if (f.status) {
        console.error(`- ${f.url} (Status: ${f.status})`);
      } else {
        console.error(`- ${f.url} (Error: ${f.error})`);
      }
    }
    // We exit with 0 during testing so we don't break our own workflow if external sites are down.
    // In a real CI, we might exit 1 if we want strict enforcement.
    // Given the variability of network responses, let's exit 1 to flag issues in CI.
    process.exit(1);
  } else {
    console.log("All links are healthy!");
    process.exit(0);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
