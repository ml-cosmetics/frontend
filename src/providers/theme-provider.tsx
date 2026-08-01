"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Theme provider. Mirrors the architecture decision: the storefront
 * section is light-only (the `attribute` is set but the toggle is
 * hidden in the public layout), the admin section gets a full
 * light / dark toggle in the topbar.
 *
 * `defaultTheme="light"` keeps the first paint consistent with the
 * brand colours. `enableSystem` lets the storefront follow the OS
 * preference when the user hasn't picked anything.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
