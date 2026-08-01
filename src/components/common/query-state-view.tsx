"use client";

import * as React from "react";
import { EmptyState, type EmptyStateProps } from "./empty-state";
import { ErrorState, type ErrorStateProps } from "./error-state";

/**
 * `QueryStateView` — render-by-query-state wrapper that consolidates
 * the standard React Query loading / error / empty transitions used
 * throughout the storefront and admin.
 *
 * Why this exists:
 *   • Every section + page used to write the same triple-branch
 *     block (isLoading → skeleton, isError → "Lỗi tải" + retry,
 *     data is empty → "Chưa có dữ liệu").  The slight wording /
 *     class drift between copies was confusing for users and an
 *     accessibility hazard (different aria roles, different focus
 *     targets).  This component makes the canonical visual
 *     contract the only thing shipped to the browser.
 *   • We intentionally take a `state` prop rather than a full
 *     React Query result so callers don't have to refactor every
 *     hook.  `useQueryStateParts` (below) extracts the four pieces
 *     for you.
 *
 * Visual contract:
 *   loading  → nothing (caller renders their own skeleton; this
 *              layer stays silent so the loading state can be
 *              local to its container)
 *   error    → `ErrorState` (red bubble + alert role + retry CTA)
 *   empty    → `EmptyState` (neutral bubble + status role)
 *   ready    → `children` (rendered as-is)
 *
 * The retry button is rendered only when an `onRetry` callback is
 * supplied — for product list pages, that's the React Query
 * `refetch()`; for read-only widgets it can be omitted.
 */
export interface QueryStateViewProps<T> {
  /** State shape — see `useQueryStateParts`. */
  state: QueryStateParts<T>;
  /** Optional React Query refetch (or any handler). */
  onRetry?: () => void;
  /** Empty-state copy. Required when `state.isReady` is possible. */
  emptyState: Omit<EmptyStateProps, "className">;
  /** Optional override for the error title. */
  errorTitle?: string;
  /** Children rendered when the data is non-empty. */
  children: (data: T) => React.ReactNode;
}

/**
 * `QueryStateParts` is the minimum slice of React Query state we
 * need to drive the four transitions. We expose it as a separate
 * type so callers can `destructure` once and feed it here.
 */
export interface QueryStateParts<T> {
  isLoading: boolean;
  isError: boolean;
  isReady: boolean;
  error: unknown;
  data: T;
}

export function QueryStateView<T>({
  state,
  onRetry,
  emptyState,
  errorTitle,
  children,
}: QueryStateViewProps<T>) {
  // Loading state is intentionally a no-op so the caller can render
  // a section-specific skeleton (a card grid skeleton vs. a banner
  // skeleton look different on purpose).
  if (state.isLoading) return null;

  if (state.isError) {
    const errorProps: ErrorStateProps = {
      error: state.error,
      onRetry,
      title: errorTitle,
    };
    return <ErrorState {...errorProps} />;
  }

  if (!state.isReady) {
    return <EmptyState {...emptyState} />;
  }

  return <>{children(state.data)}</>;
}

/**
 * `useQueryStateParts` — extracts the four transitions from a
 * React Query result. Hooked here (rather than inside the calling
 * feature) because the rules of "isReady" are universal: data is
 * ready when query has resolved, has no error, and the value is
 * non-empty (for array data; non-null for scalar).
 */
export function useQueryStateParts<T>(
  query: {
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    data: T | undefined;
  },
  options: {
    /** Treat which value as "empty"? Defaults to `undefined` or
     *  length-0 arrays. */
    isEmpty?: (data: T) => boolean;
  } = {},
): QueryStateParts<NonNullable<T>> {
  const isEmpty = options.isEmpty ?? defaultIsEmpty;
  const data = query.data as NonNullable<T> | undefined;

  // We treat the query as "ready" only when:
  //   • data exists  (server returned a value), and
  //   • data isn't empty per the supplied predicate (so a
  //     `data: []` from the server still surfaces the EmptyState
  //     rather than rendering the children with nothing to show).
  const isReady =
    !!data && !query.isLoading && !query.isError && !isEmpty(data);

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    isReady,
    error: query.error,
    data: data as NonNullable<T>,
  };
}

function defaultIsEmpty<T>(value: T): boolean {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    // Paginated lists expose `items`; treat empty items as empty
    // so the user sees "Chưa có dữ liệu" instead of a blank
    // table.
    const items = (value as { items?: unknown[] }).items;
    if (Array.isArray(items)) return items.length === 0;
  }
  return false;
}
