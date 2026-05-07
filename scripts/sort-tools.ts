import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT_FILES, loadCatalog, serializeTools } from "./lib.ts";

export function sortedToolsFileContent(rootDir = process.cwd()): string {
  return serializeTools(loadCatalog(rootDir).tools);
}

function isCliEntrypoint(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}

if (isCliEntrypoint()) {
  const rootDir = process.cwd();
  writeFileSync(join(rootDir, ROOT_FILES.tools), sortedToolsFileContent(rootDir));
}
