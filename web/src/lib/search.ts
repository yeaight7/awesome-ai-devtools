import type { CatalogTool } from "./types";

export function tokenize(query: string): string[] {
  return Array.from(new Set(query.toLowerCase().split(/\s+/).filter(Boolean)));
}

const NAME_EXACT = 6;
const NAME_PREFIX = 5;
const NAME_SUBSTRING = 4;
const TERM_MATCH = 2;
const DESCRIPTION_MATCH = 1;

/**
 * Deterministic query relevance: every token must match somewhere (AND
 * semantics); the score sums the strongest field match per token. Returns 0
 * when the tool does not match. No popularity or ranking signals involved.
 */
export function scoreTool(tool: CatalogTool, tokens: string[]): number {
  if (tokens.length === 0) {
    return 1;
  }
  let total = 0;
  for (const token of tokens) {
    let score = 0;
    if (tool.search.name.includes(token)) {
      score =
        tool.search.name === token
          ? NAME_EXACT
          : tool.search.name.startsWith(token)
            ? NAME_PREFIX
            : NAME_SUBSTRING;
    } else if (tool.search.terms.includes(token)) {
      score = TERM_MATCH;
    } else if (tool.search.description.includes(token)) {
      score = DESCRIPTION_MATCH;
    }
    if (score === 0) {
      return 0;
    }
    total += score;
  }
  return total;
}
