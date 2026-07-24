import { useCallback, useEffect, useState } from "react";
import type { FilterState } from "../lib/types";
import { emptyFilterState, parseFilterState, serializeFilterState } from "../lib/url-state";

/**
 * Filter state mirrored into the URL query string so every search and filter
 * combination is shareable. Uses replaceState to avoid flooding history with
 * per-keystroke entries; back/forward still restores shared URLs via popstate.
 */
export function useFilterState() {
  const [state, setState] = useState<FilterState>(() =>
    parseFilterState(window.location.search)
  );

  useEffect(() => {
    const onPopState = () => setState(parseFilterState(window.location.search));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const update = useCallback((patch: Partial<FilterState>) => {
    setState((previous) => {
      const next = { ...previous, ...patch };
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${serializeFilterState(next)}`
      );
      return next;
    });
  }, []);

  const reset = useCallback(() => update(emptyFilterState()), [update]);

  return { state, update, reset };
}
