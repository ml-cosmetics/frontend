"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the current media-query state. Used for responsive tweaks
 * (e.g. switching the sidebar to a drawer under 768px).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia(query);
    const handle = () => setMatches(media.matches);
    handle();
    media.addEventListener("change", handle);
    return () => media.removeEventListener("change", handle);
  }, [query]);

  return matches;
}
