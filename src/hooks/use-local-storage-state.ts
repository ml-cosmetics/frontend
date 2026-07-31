"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Local-storage-backed state. Useful for UI preferences that should
 * survive a page refresh (sidebar collapse, table column visibility,
 * etc.). Always falls back to the initial value when the storage is
 * empty or unavailable (SSR / private mode).
 */
export function useLocalStorageState<T>(key: string, initial: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // Ignore corrupted entries.
    }
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage may be full or blocked — silently degrade.
      }
    },
    [key],
  );

  return [value, update];
}
