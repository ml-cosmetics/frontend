"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Keeps admin and operator surfaces on the light Aura Vénus theme.
 * A previous dark preference is cleared so these routes never switch back.
 */
export function ForceLightTheme() {
  const { setTheme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setTheme("light");
    try {
      localStorage.setItem("theme", "light");
    } catch {
      // ignore
    }
  }, [setTheme]);

  return null;
}
