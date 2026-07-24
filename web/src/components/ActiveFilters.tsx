import type { FacetKey } from "../lib/types";

export interface ActiveFilterChip {
  key: FacetKey;
  value: string;
  label: string;
}

interface ActiveFiltersProps {
  query: string;
  chips: ActiveFilterChip[];
  onRemove: (key: FacetKey, value: string) => void;
  onClearQuery: () => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  query,
  chips,
  onRemove,
  onClearQuery,
  onClearAll
}: ActiveFiltersProps) {
  const trimmedQuery = query.trim();
  if (chips.length === 0 && !trimmedQuery) {
    return null;
  }
  return (
    <div className="active-filters" role="group" aria-label="Active filters">
      {trimmedQuery && (
        <button
          type="button"
          className="chip"
          onClick={onClearQuery}
          aria-label={`Clear search “${trimmedQuery}”`}
        >
          Search: “{trimmedQuery}”
          <span className="chip-remove" aria-hidden="true">
            ×
          </span>
        </button>
      )}
      {chips.map((chip) => (
        <button
          key={`${chip.key}:${chip.value}`}
          type="button"
          className="chip"
          onClick={() => onRemove(chip.key, chip.value)}
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <span className="chip-remove" aria-hidden="true">
            ×
          </span>
        </button>
      ))}
      <button type="button" className="chip chip-clear" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}
