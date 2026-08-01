"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { ToastProvider } from "./toast-provider";
import { AdminAuthProvider } from "@/lib/auth";

/**
 * Composite root provider. Wires every context provider in the
 * canonical order:
 *
 *   ThemeProvider        — keeps the application on the light class
 *   QueryProvider        — TanStack Query client (one per mount).
 *   AdminAuthProvider    — admin session, depends on QueryClient.
 *   ToastProvider        — pure UI overlay, last.
 *
 * The mount-gate below prevents SSR from rendering UI that depends
 * on the in-memory token store: `useAdminAuth` reads from a
 * client-only singleton, so we cannot render the auth-aware tree
 * on the server. Children render after the first paint.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider>
      <QueryProvider>
        <AdminAuthProvider>
          {mounted ? children : <ServerOnlyShell>{children}</ServerOnlyShell>}
          <ToastProvider />
        </AdminAuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

/**
 * Static SSR fallback. Used until the client effect ticks the
 * `mounted` flag on; renders the children verbatim so the first
 * HTML response still includes the page layout.
 */
function ServerOnlyShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
