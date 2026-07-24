export const NOT_SPECIFIED = "not specified";

const VALUE_LABELS: Record<string, string> = {
  [NOT_SPECIFIED]: "Not specified",
  "open-source": "Open source",
  "source-available": "Source available",
  proprietary: "Proprietary",
  hosted: "Hosted",
  local: "Local",
  "self-hosted": "Self-hosted",
  hybrid: "Hybrid",
  api: "API",
  cli: "CLI",
  ide: "IDE",
  mcp: "MCP",
  web: "Web",
  browser: "Browser",
  desktop: "Desktop",
  framework: "Framework",
  library: "Library",
  "github-app": "GitHub App",
  "skill-pack": "Skill pack",
  template: "Template"
};

export function valueLabel(value: string): string {
  const known = VALUE_LABELS[value];
  if (known) {
    return known;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function isNotSpecified(value: string): boolean {
  return value === NOT_SPECIFIED;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeZone: "UTC"
});

export function formatDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return DATE_FORMAT.format(parsed);
}
