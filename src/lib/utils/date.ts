import { format, formatDistanceToNow, parseISO } from "date-fns";

/**
 * Safely parse an ISO-8601 timestamp from the backend. Returns `null`
 * if the input is missing or unparseable. The backend always sends
 * UTC timestamps like `2025-01-15T10:00:00Z`.
 */
export function parseApiDate(input: string | null | undefined): Date | null {
  if (!input) return null;
  try {
    return parseISO(input);
  } catch {
    return null;
  }
}

/**
 * Format a date using a stable pattern. Returns `—` for missing input.
 */
export function formatDate(
  input: string | null | undefined,
  pattern = "dd/MM/yyyy",
): string {
  const date = parseApiDate(input);
  if (!date) return "—";
  return format(date, pattern);
}

/**
 * Format a date with time. Default pattern is `dd/MM/yyyy HH:mm`.
 */
export function formatDateTime(
  input: string | null | undefined,
  pattern = "dd/MM/yyyy HH:mm",
): string {
  const date = parseApiDate(input);
  if (!date) return "—";
  return format(date, pattern);
}

/**
 * Relative-time formatter (e.g. "2 hours ago"). Used in activity feeds.
 */
export function formatRelative(input: string | null | undefined): string {
  const date = parseApiDate(input);
  if (!date) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}
