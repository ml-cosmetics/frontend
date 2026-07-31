"use client";

import * as React from "react";
import { useEffect, useSyncExternalStore } from "react";

/**
 * Cross-component breadcrumb overrides.
 *
 * Server-rendered pages can't always resolve a friendly label for a
 * dynamic URL segment: admin-only resources sit behind a JWT that
 * lives in `localStorage` (never reachable from the SSR fetch
 * pipeline) and public resources might not always be authorised for
 * the SSR caller.
 *
 * Pages that know the label client-side — typically because the
 * `useQuery` call is already running inside the page body — write
 * the resolved label here, and the `Breadcrumb` component reads
 * from the store on every render. Writes are scoped to the current
 * pathname so navigating between two `/[id]/edit` pages doesn't
 * leak stale labels.
 *
 * Usage:
 *   useBreadcrumbOverride("/admin/featured-collections/<id>/edit", {
 *     "<id>": "BST Xuân 2026",
 *   });
 */

type OverrideMap = Record<string, string>;

interface Scope {
  pathname: string;
  overrides: OverrideMap;
}

const EMPTY: Scope = { pathname: "", overrides: {} };

class BreadcrumbOverrideStore {
  private scopes = new Map<string, OverrideMap>();
  private listeners = new Set<() => void>();

  /**
   * Apply `overrides` to `pathname`, scoped so navigating away
   * automatically invalidates the entry. Returns an unsubscribe
   * function for callers that want to clear earlier (rare).
   *
   * Notification policy: subscribers only hear about a change when
   * the merged scope actually differs from before. Without this
   * guard the breadcrumb sync component's write-on-render effect
   * creates a tight loop:
   *   render → set() → notify → re-render → effect cleanup → set()
   *   → notify → re-render → …
   * The cleanup branch used to notify unconditionally; we now skip
   * the call unless the cleanup actually mutates the scope map.
   */
  set(pathname: string, overrides: OverrideMap): () => void {
    const existing = this.scopes.get(pathname) ?? {};
    const merged = { ...existing, ...overrides };
    const same = shallowEqual(existing, merged);
    this.scopes.set(pathname, merged);
    if (!same) this.notify();
    return () => {
      const current = this.scopes.get(pathname);
      if (!current) return;
      const next: OverrideMap = {};
      for (const [key, value] of Object.entries(current)) {
        if (overrides[key] === value) continue;
        next[key] = value;
      }
      if (Object.keys(next).length === 0) {
        if (!this.scopes.has(pathname)) return;
        this.scopes.delete(pathname);
      } else if (shallowEqual(current, next)) {
        return;
      } else {
        this.scopes.set(pathname, next);
      }
      this.notify();
    };
  }

  /** Merge every active scope into one map. Latest write wins on
   * duplicate keys; scopes are iterated in insertion order. */
  snapshot(pathname: string): Scope {
    let merged: OverrideMap = {};
    for (const [scopePath, scopeOverrides] of this.scopes) {
      if (pathname === scopePath || pathname.startsWith(`${scopePath}/`)) {
        merged = { ...merged, ...scopeOverrides };
      }
    }
    return { pathname, overrides: merged };
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}

const store = new BreadcrumbOverrideStore();

/** `useSyncExternalStore` requires a stable subscribe reference. */
const stableSubscribe = store.subscribe.bind(store);

const getClientSnapshot = (pathname: string): (() => Scope) => {
  let last: Scope | null = null;
  return () => {
    const next = store.snapshot(pathname);
    if (
      last &&
      last.pathname === next.pathname &&
      shallowEqual(last.overrides, next.overrides)
    ) {
      return last;
    }
    last = next;
    return next;
  };
};

function shallowEqual(a: OverrideMap, b: OverrideMap): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/**
 * `useBreadcrumbOverrides` — read the merged override map for the
 * current pathname. Returns an empty object on the server so the
 * breadcrumb falls back to its raw segments during SSR.
 */
export function useBreadcrumbOverrides(pathname: string): OverrideMap {
  const subscribe = (listener: () => void) => stableSubscribe(listener);
  const getSnapshot = getClientSnapshot(pathname);
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY).overrides;
}

/**
 * `useBreadcrumbOverride` — convenience hook that registers
 * `overrides` against `pathname` for the lifetime of the calling
 * component. The PageHeader / form usually calls this; the entry is
 * removed automatically when the component unmounts (i.e. on
 * navigation).
 *
 * Hook order is stable across renders: we ALWAYS call the same set
 * of hooks regardless of whether `overrides` is currently `null`
 * (e.g. before the underlying query has resolved). Calling hooks
 * conditionally violates React's Rules of Hooks and triggers both a
 * "change in the order of Hooks" warning AND an infinite re-render
 * loop when the conditional effect flips back and forth on each
 * data tick.
 *
 * Deps note: the effect depends on `overridesKey`, a *primitive*
 * projection of `overrides`. This is intentional — the caller
 * passes a fresh `{ id: title }` object on every render, so depending
 * on `overrides` directly would re-run the effect every render and
 * create the notify→re-render→cleanup→notify loop. Projecting to a
 * stable string (`idKey||label`) keeps the effect bound to actual
 * data changes while keeping the public API ergonomic.
 */
export function useBreadcrumbOverride(
  pathname: string,
  overrides: OverrideMap | null | undefined,
): void {
  const subscribe = (listener: () => void) => stableSubscribe(listener);
  // Re-read the same snapshot stream so any change to the store
  // triggers a re-render of the subscriber component.
  const getSnapshot = getClientSnapshot(pathname);
  useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const overridesKey = React.useMemo(() => {
    if (!overrides) return "";
    return Object.entries(overrides)
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join("&");
  }, [overrides]);

  useEffect(() => {
    return store.set(pathname, overrides ?? {});
    // We deliberately depend on `overridesKey` (the primitive
    // projection) instead of `overrides` directly — otherwise the
    // caller's fresh object identity would re-run the effect every
    // render and re-trigger the notify loop we just fixed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, overridesKey]);
}