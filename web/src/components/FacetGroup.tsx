import { useId, useState } from "react";
import type { FacetOption } from "../lib/facets";

interface FacetGroupProps {
  legend: string;
  options: FacetOption[];
  /** Result counts under the current query and the other facets. */
  counts: Map<string, number>;
  selected: string[];
  onToggle: (value: string) => void;
  /** When set, only this many options show until the group is expanded. */
  collapsedCount?: number;
  /** Adds a text box to narrow long option lists (e.g. tags). */
  searchable?: boolean;
}

export function FacetGroup({
  legend,
  options,
  counts,
  selected,
  onToggle,
  collapsedCount,
  searchable = false
}: FacetGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("");
  const filterId = useId();
  const normalizedFilter = filter.trim().toLowerCase();

  let visible = options;
  if (normalizedFilter) {
    visible = options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalizedFilter) ||
        option.value.toLowerCase().includes(normalizedFilter)
    );
  } else if (collapsedCount !== undefined && !expanded && options.length > collapsedCount) {
    const head = options.slice(0, collapsedCount);
    const pinned = options.filter(
      (option) => selected.includes(option.value) && !head.includes(option)
    );
    visible = [...head, ...pinned];
  }

  return (
    <fieldset className="facet-group">
      <legend>{legend}</legend>
      {searchable && (
        <div className="facet-filter">
          <label className="visually-hidden" htmlFor={filterId}>
            Filter {legend.toLowerCase()} options
          </label>
          <input
            id={filterId}
            type="search"
            placeholder={`Filter ${legend.toLowerCase()}…`}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>
      )}
      <ul className="facet-options">
        {visible.map((option) => {
          const count = counts.get(option.value) ?? 0;
          const checked = selected.includes(option.value);
          const empty = count === 0 && !checked;
          return (
            <li key={option.value}>
              <label className={`facet-option${empty ? " is-empty" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={empty}
                  onChange={() => onToggle(option.value)}
                />
                <span className="facet-option-label">{option.label}</span>
                <span className="facet-option-count">{count}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {normalizedFilter && visible.length === 0 && (
        <p className="facet-note">No matching options.</p>
      )}
      {!normalizedFilter && collapsedCount !== undefined && options.length > collapsedCount && (
        <button
          type="button"
          className="link-button facet-more"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show fewer" : `Show all ${options.length}`}
        </button>
      )}
    </fieldset>
  );
}
