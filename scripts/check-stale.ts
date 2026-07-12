import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { Tool, isValidDate, loadCatalog } from "./lib.ts";

export const DEFAULT_MAX_AGE_DAYS = 180;
const OLDEST_PREVIEW_LIMIT = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface StaleCheckOptions {
  maxAgeDays?: number;
  asOf?: string;
}

export interface StaleEntry {
  slug: string;
  name: string;
  curationStatus: string;
  lastChecked: string;
  ageDays: number;
}

export interface StaleReport {
  asOf: string;
  maxAgeDays: number;
  totalTools: number;
  staleEntries: StaleEntry[];
  oldestEntries: StaleEntry[];
  invalidDates: Array<{ slug: string; lastChecked: string }>;
}

export function buildStaleReport(tools: Tool[], options: StaleCheckOptions = {}): StaleReport {
  const maxAgeDays = options.maxAgeDays ?? DEFAULT_MAX_AGE_DAYS;
  const asOf = options.asOf ?? new Date().toISOString().slice(0, 10);
  if (!isValidDate(asOf)) {
    throw new Error(`invalid as-of date "${asOf}". Use YYYY-MM-DD.`);
  }
  if (!Number.isInteger(maxAgeDays) || maxAgeDays < 0) {
    throw new Error(`invalid max age "${maxAgeDays}". Use a non-negative integer number of days.`);
  }

  const asOfMs = Date.parse(`${asOf}T00:00:00.000Z`);
  const entries: StaleEntry[] = [];
  const invalidDates: Array<{ slug: string; lastChecked: string }> = [];

  for (const tool of tools) {
    if (!isValidDate(tool.last_checked ?? "")) {
      invalidDates.push({ slug: tool.slug ?? "<missing slug>", lastChecked: String(tool.last_checked ?? "") });
      continue;
    }
    const ageDays = Math.floor((asOfMs - Date.parse(`${tool.last_checked}T00:00:00.000Z`)) / MS_PER_DAY);
    entries.push({
      slug: tool.slug,
      name: tool.name,
      curationStatus: tool.curation_status,
      lastChecked: tool.last_checked,
      ageDays
    });
  }

  const byOldest = (left: StaleEntry, right: StaleEntry) =>
    left.lastChecked.localeCompare(right.lastChecked) || left.slug.localeCompare(right.slug, "en");
  entries.sort(byOldest);
  invalidDates.sort((left, right) => left.slug.localeCompare(right.slug, "en"));

  return {
    asOf,
    maxAgeDays,
    totalTools: tools.length,
    staleEntries: entries.filter((entry) => entry.ageDays > maxAgeDays),
    oldestEntries: entries.slice(0, OLDEST_PREVIEW_LIMIT),
    invalidDates
  };
}

export function formatStaleReport(report: StaleReport): string {
  const lines: string[] = [
    `Stale entry report (as of ${report.asOf}, threshold ${report.maxAgeDays} days)`,
    `Catalog: ${report.totalTools} tools.`,
    ""
  ];

  if (report.staleEntries.length === 0) {
    lines.push(`No entries have a last_checked older than ${report.maxAgeDays} days.`);
  } else {
    lines.push(`Stale entries (${report.staleEntries.length}):`);
    for (const entry of report.staleEntries) {
      lines.push(`- ${entry.slug} [${entry.curationStatus}] last_checked ${entry.lastChecked} (${entry.ageDays} days ago)`);
    }
  }

  lines.push("", `Oldest entries (${report.oldestEntries.length} shown):`);
  for (const entry of report.oldestEntries) {
    lines.push(`- ${entry.slug} [${entry.curationStatus}] last_checked ${entry.lastChecked} (${entry.ageDays} days ago)`);
  }

  if (report.invalidDates.length > 0) {
    lines.push("", `Entries with invalid last_checked dates (${report.invalidDates.length}):`);
    for (const entry of report.invalidDates) {
      lines.push(`- ${entry.slug}: "${entry.lastChecked}"`);
    }
  }

  lines.push(
    "",
    "Re-verify stale entries against their sources, update metadata if needed, and set last_checked to the verification date."
  );

  return lines.join("\n");
}

function isCliEntrypoint(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}

if (isCliEntrypoint()) {
  const args = parseArgs({
    options: {
      "max-age-days": { type: "string" },
      "as-of": { type: "string" },
      "fail-on-stale": { type: "boolean", default: false }
    }
  });

  const maxAgeRaw = args.values["max-age-days"];
  const maxAgeDays = maxAgeRaw === undefined ? DEFAULT_MAX_AGE_DAYS : Number(maxAgeRaw);

  let report: StaleReport;
  try {
    report = buildStaleReport(loadCatalog(process.cwd()).tools, {
      maxAgeDays,
      asOf: args.values["as-of"]
    });
  } catch (error) {
    console.error(`error: ${(error as Error).message}`);
    process.exit(2);
  }

  console.log(formatStaleReport(report));

  // Reporting stays exit 0 by default: entries aging naturally must not fail
  // CI. --fail-on-stale is for maintenance runs that want a hard signal.
  if (args.values["fail-on-stale"] && report.staleEntries.length > 0) {
    process.exit(1);
  }
}
