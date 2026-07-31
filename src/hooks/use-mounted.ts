"use client";

import { useEffect, useState } from "react";

/**
 * Hydration-safe mounted flag. `useEffect` only runs on the client,
 * so checking `mounted` lets server-rendered components skip
 * browser-only APIs (e.g. `window.localStorage`, `theme`).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
