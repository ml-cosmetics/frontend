"use client";

import * as React from "react";
import type { WishlistItem } from "../types";

const STORAGE_KEY = "auravenus.wishlist.v1";

/**
 * Local-storage backed wishlist store. Wishlist persistence runs
 * entirely in the browser for now (`localStorage` under
 * `auravenus.wishlist.v1`); a backend persistence layer is a
 * follow-up once customer auth ships.
 *
 * Implementation note — singleton with subscriptions:
 * Every `useWishlist()` consumer shares the same in-memory list.
 * Previously each call site held its own `useState`, so mutations
 * on the wishlist page did not refresh the navbar badge until a
 * reload. The store now lives at module scope and emits a change
 * event after every mutation; the hook subscribes to that event
 * and re-renders, so the badge, the page, and any other call site
 * stay in sync.
 */
export interface WishlistState {
  items: WishlistItem[];
  isHydrated: boolean;
  add: (item: Omit<WishlistItem, "addedAt">) => void;
  remove: (id: string) => void;
  toggle: (item: Omit<WishlistItem, "addedAt">) => boolean;
  has: (id: string) => boolean;
  clear: () => void;
  count: number;
}

function readStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage quota exceeded or unavailable — fail silently, the UI
    // stays consistent with the in-memory state for this session.
  }
}

type Listener = () => void;

class WishlistStore {
  private items: WishlistItem[] = [];
  private isHydrated = false;
  private listeners = new Set<Listener>();

  getState() {
    return { items: this.items, isHydrated: this.isHydrated };
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }

  hydrate() {
    // Always re-read — used both for first-load hydration and for
    // cross-tab `storage` events where another tab may have updated
    // the list since our last sync.
    this.items = readStorage();
    this.isHydrated = true;
    this.emit();
  }

  add(item: Omit<WishlistItem, "addedAt">) {
    const existingIdx = this.items.findIndex((entry) => entry.id === item.id);
    const existing = existingIdx === -1 ? undefined : this.items[existingIdx];
    const next: WishlistItem = existing ?? { ...item, addedAt: new Date().toISOString() };
    const updated =
      existing === undefined ? [next, ...this.items] : this.items.map((entry, idx) => (idx === existingIdx ? next : entry));
    this.items = updated;
    writeStorage(updated);
    this.emit();
  }

  remove(id: string) {
    const next = this.items.filter((entry) => entry.id !== id);
    if (next.length === this.items.length) return;
    this.items = next;
    writeStorage(next);
    this.emit();
  }

  toggle(item: Omit<WishlistItem, "addedAt">): boolean {
    const existingIdx = this.items.findIndex((entry) => entry.id === item.id);
    if (existingIdx !== -1) {
      this.remove(item.id);
      return false;
    }
    this.add(item);
    return true;
  }

  clear() {
    if (this.items.length === 0) return;
    this.items = [];
    writeStorage([]);
    this.emit();
  }
}

// Module-level singleton — every `useWishlist()` consumer reads
// from and writes to this same store.
const store = new WishlistStore();

// Hydrate once on module load on the client so the very first
// consumer (e.g. the navbar badge on cold load) sees the latest
// localStorage value without waiting for a separate effect.
if (typeof window !== "undefined") {
  store.hydrate();
  // Cross-tab sync — when another tab mutates `localStorage` the
  // `storage` event fires here and we re-hydrate so the navbar
  // badge and any other open tab stay consistent.
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      store.hydrate();
    }
  });
}

export function useWishlist(): WishlistState {
  const [snapshot, setSnapshot] = React.useState(() => store.getState());

  React.useEffect(() => {
    // Pick up any change that happened between the initial
    // `store.getState()` call (synchronous) and the effect commit
    // (e.g. another tab wrote to `localStorage` via the `storage`
    // event).
    store.hydrate();
    setSnapshot(store.getState());
    return store.subscribe(() => setSnapshot(store.getState()));
  }, []);

  const items = snapshot.items;
  const has = React.useCallback(
    (id: string) => items.some((entry) => entry.id === id),
    [items],
  );

  return {
    items,
    isHydrated: snapshot.isHydrated,
    add: (item) => store.add(item),
    remove: (id) => store.remove(id),
    toggle: (item) => store.toggle(item),
    has,
    clear: () => store.clear(),
    count: items.length,
  };
}