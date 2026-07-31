"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { createQueryClient } from "@/lib/query";

/**
 * Client-side Query provider. Wraps the React tree with a freshly
 * created `QueryClient` (so SSR / client-server handoff is clean —
 * we never share query state across requests).
 *
 * Mounting ReactQueryDevtools behind a `process.env.NODE_ENV`
 * check so the dev-only bundle is excluded from production.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
