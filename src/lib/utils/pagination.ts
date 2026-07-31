import type { Pagination, PageRequest } from "@/types/api";

/**
 * Normalise a caller-facing `{ page, per_page }` request into the
 * wire shape every backend list endpoint actually understands.
 *
 * The Go backend exposes pagination as `offset` + `limit` (via
 * `paginationkit.OffsetRequest`), so every list call must translate
 * the page-number abstraction down to that wire shape before
 * serialising the URL. Sending `?page=…&per_page=…` is silently
 * ignored — Gin only honours the `limit` / `offset` form tags — and
 * the repo then runs with `limit=0`, returning the whole collection
 * regardless of which page the caller asked for.
 *
 * Output is clamped to `[1, 100]` for `limit` and `limit ∈ [1, 100]`
 * for the resulting offset arithmetic (defaults: page 1, 20 per page).
 */
export function toPageRequest(input: Partial<PageRequest> = {}): {
  offset: number;
  limit: number;
} {
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const limit = Math.min(100, Math.max(1, Math.floor(input.per_page ?? 20)));
  const offset = (page - 1) * limit;
  return { offset, limit };
}

/**
 * Stringify a params object for `axios`. Skips `undefined` / `null` /
 * empty-string values so they don't pollute the query string.
 */
export function toQueryString(params: Record<string, unknown> = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      search.set(key, value.join(","));
      continue;
    }
    search.set(key, String(value));
  }
  const out = search.toString();
  return out ? `?${out}` : "";
}

/**
 * Compute a 1-based "from / to" range for the current page, given the
 * backend pagination block. Useful for header subtitles like
 * "Showing 21–40 of 132".
 */
export function paginationRange(p: Pagination): { from: number; to: number } {
  const from = p.total === 0 ? 0 : p.offset + 1;
  const to = Math.min(p.offset + p.limit, p.total ?? p.offset + p.limit);
  return { from, to };
}

/**
 * Build a TanStack-Query-friendly page param object. Used in
 * `useQuery` query keys so lists keyed by page are cached correctly.
 */
export function pageKey(params: PageRequest): readonly [number, number] {
  return [params.page ?? 1, params.per_page ?? 20] as const;
}
