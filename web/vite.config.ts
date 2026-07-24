import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vitest/config";
import { loadCatalog } from "../scripts/lib";
import { normalizeCatalog } from "./src/lib/normalize";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const VIRTUAL_ID = "virtual:catalog";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

// Serves the catalog data as a build-time virtual module: the YAML files are
// read through the root loader, normalized once, and inlined as JSON, so the
// browser bundle never ships a YAML parser and can never drift from data/.
function catalogData(): Plugin {
  const dataFiles = ["tools.yml", "categories.yml", "tags.yml"].map((name) =>
    path.join(repoRoot, "data", name)
  );
  return {
    name: "catalog-data",
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) {
        return;
      }
      for (const file of dataFiles) {
        this.addWatchFile(file);
      }
      const catalog = normalizeCatalog(loadCatalog(repoRoot));
      return `export default ${JSON.stringify(catalog)};`;
    },
    handleHotUpdate({ file, server }) {
      if (!dataFiles.includes(path.normalize(file))) {
        return;
      }
      const module = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (module) {
        server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: "full-reload" });
      }
    }
  };
}

export default defineConfig({
  // GitHub Pages serves project sites under /<repo>/; the deploy workflow
  // sets BASE_PATH, local dev and PR validation builds default to /.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), catalogData()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false
  }
});
