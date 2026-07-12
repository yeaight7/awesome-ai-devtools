import test from "node:test";
import assert from "node:assert/strict";
import { buildStaleReport, formatStaleReport, DEFAULT_MAX_AGE_DAYS } from "../scripts/check-stale.ts";
import type { Tool } from "../scripts/lib.ts";

function makeTool(overrides: Partial<Tool>): Tool {
  return {
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
    added: "2026-01-01",
    last_checked: "2026-01-01",
    sources: ["https://example.com/docs"],
    ...overrides
  };
}

test("buildStaleReport keeps fresh entries out of the stale list", () => {
  const report = buildStaleReport([makeTool({ last_checked: "2026-06-01" })], {
    asOf: "2026-07-12",
    maxAgeDays: 90
  });

  assert.equal(report.totalTools, 1);
  assert.deepEqual(report.staleEntries, []);
  assert.equal(report.oldestEntries.length, 1);
});

test("buildStaleReport treats the threshold as inclusive: stale only when strictly older", () => {
  // 2026-04-13 is exactly 90 days before 2026-07-12.
  const atThreshold = buildStaleReport([makeTool({ last_checked: "2026-04-13" })], {
    asOf: "2026-07-12",
    maxAgeDays: 90
  });
  assert.deepEqual(atThreshold.staleEntries, []);

  const oneDayOlder = buildStaleReport([makeTool({ last_checked: "2026-04-12" })], {
    asOf: "2026-07-12",
    maxAgeDays: 90
  });
  assert.equal(oneDayOlder.staleEntries.length, 1);
  assert.equal(oneDayOlder.staleEntries[0].ageDays, 91);
});

test("buildStaleReport sorts stale entries oldest first with slug tiebreak", () => {
  const report = buildStaleReport(
    [
      makeTool({ slug: "b-tool", name: "B", last_checked: "2025-01-05" }),
      makeTool({ slug: "a-tool", name: "A", last_checked: "2025-01-05" }),
      makeTool({ slug: "c-tool", name: "C", last_checked: "2024-11-01" })
    ],
    { asOf: "2026-07-12", maxAgeDays: 90 }
  );

  assert.deepEqual(
    report.staleEntries.map((entry) => entry.slug),
    ["c-tool", "a-tool", "b-tool"]
  );
});

test("buildStaleReport reports invalid last_checked dates instead of crashing", () => {
  const report = buildStaleReport(
    [makeTool({ slug: "bad-date", last_checked: "not-a-date" }), makeTool({ slug: "good", last_checked: "2026-07-01" })],
    { asOf: "2026-07-12", maxAgeDays: 90 }
  );

  assert.deepEqual(report.invalidDates, [{ slug: "bad-date", lastChecked: "not-a-date" }]);
  assert.equal(report.staleEntries.length, 0);
  assert.equal(report.oldestEntries.length, 1);
});

test("buildStaleReport rejects invalid options", () => {
  assert.throws(() => buildStaleReport([], { asOf: "13-07-2026" }), /invalid as-of date/);
  assert.throws(() => buildStaleReport([], { maxAgeDays: -1 }), /invalid max age/);
  assert.throws(() => buildStaleReport([], { maxAgeDays: Number.NaN }), /invalid max age/);
});

test("buildStaleReport defaults to the documented threshold", () => {
  const report = buildStaleReport([makeTool({ last_checked: "2026-07-01" })], { asOf: "2026-07-12" });
  assert.equal(report.maxAgeDays, DEFAULT_MAX_AGE_DAYS);
});

test("formatStaleReport produces a deterministic, actionable report", () => {
  const report = buildStaleReport(
    [
      makeTool({ slug: "old-tool", name: "Old Tool", last_checked: "2025-12-01" }),
      makeTool({ slug: "fresh-tool", name: "Fresh Tool", last_checked: "2026-07-01" })
    ],
    { asOf: "2026-07-12", maxAgeDays: 90 }
  );

  const text = formatStaleReport(report);
  assert.match(text, /Stale entry report \(as of 2026-07-12, threshold 90 days\)/);
  assert.match(text, /Catalog: 2 tools\./);
  assert.match(text, /Stale entries \(1\):/);
  assert.match(text, /- old-tool \[reviewed\] last_checked 2025-12-01 \(223 days ago\)/);
  assert.match(text, /Oldest entries \(2 shown\):/);
  assert.match(text, /set last_checked to the verification date/);

  // Same input must produce byte-identical output.
  assert.equal(text, formatStaleReport(report));
});

test("formatStaleReport states when nothing is stale", () => {
  const report = buildStaleReport([makeTool({ last_checked: "2026-07-01" })], { asOf: "2026-07-12", maxAgeDays: 90 });
  assert.match(formatStaleReport(report), /No entries have a last_checked older than 90 days\./);
});
