import { formatDate, isNotSpecified, valueLabel } from "../lib/format";
import type { CatalogTool, ToolLink } from "../lib/types";

const LINK_LABELS: Record<ToolLink["kind"], string> = {
  website: "Website",
  docs: "Docs",
  repo: "Repository"
};

interface ToolCardProps {
  tool: CatalogTool;
  activeTags: string[];
  onToggleTag: (slug: string) => void;
}

function MetaValue({ value }: { value: string }) {
  if (isNotSpecified(value)) {
    return <span className="is-unspecified">Not specified</span>;
  }
  return <>{valueLabel(value)}</>;
}

export function ToolCard({ tool, activeTags, onToggleTag }: ToolCardProps) {
  return (
    <article className="tool-card">
      <div className="tool-card-head">
        <h3 className="tool-name">{tool.name}</h3>
        {tool.primaryCategory && (
          <span className="tool-category">{tool.primaryCategory.name}</span>
        )}
      </div>
      <p className="tool-description">{tool.description}</p>
      <dl className="tool-meta">
        <div className="tool-meta-item">
          <dt>Interfaces</dt>
          <dd>
            {tool.interfaces.length > 0 ? (
              tool.interfaces.map(valueLabel).join(", ")
            ) : (
              <span className="is-unspecified">Not specified</span>
            )}
          </dd>
        </div>
        <div className="tool-meta-item">
          <dt>Deployment</dt>
          <dd>
            <MetaValue value={tool.deployment} />
          </dd>
        </div>
        <div className="tool-meta-item">
          <dt>Source</dt>
          <dd>
            <MetaValue value={tool.sourceModel} />
          </dd>
        </div>
        <div className="tool-meta-item">
          <dt>License</dt>
          <dd>
            {isNotSpecified(tool.license) ? (
              <span className="is-unspecified">Not specified</span>
            ) : (
              tool.license
            )}
          </dd>
        </div>
      </dl>
      {tool.tags.length > 0 && (
        <ul className="tool-tags" aria-label={`Tags for ${tool.name}`}>
          {tool.tags.map((tag) => (
            <li key={tag.slug}>
              <button
                type="button"
                className="tag-chip"
                aria-pressed={activeTags.includes(tag.slug)}
                onClick={() => onToggleTag(tag.slug)}
              >
                {tag.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="tool-card-foot">
        <ul className="tool-links">
          {tool.links.map((link) => (
            <li key={link.kind}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {LINK_LABELS[link.kind]}
                <span className="visually-hidden">
                  {" "}
                  for {tool.name} (opens in a new tab)
                </span>
                <span className="external-mark" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="tool-dates">
          Added {formatDate(tool.added)} · Checked {formatDate(tool.lastChecked)}
        </p>
      </div>
    </article>
  );
}
