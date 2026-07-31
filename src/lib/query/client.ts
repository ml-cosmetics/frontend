import { QueryClient } from "@tanstack/react-query";

/**
 * Global React Query defaults.
 *
 * The backend is the single source of truth — we treat the cache as a
 * thin request-coordination layer, not as an optimisation surface.
 * Every query fetches on mount, every mutation triggers an explicit
 * refetch of the affected keys, and nothing tries to be clever about
 * staleness, garbage collection, or background refetching.
 */
export const DEFAULT_QUERY_OPTIONS = {
  staleTime: 0,
  gcTime: 5 * 60_000,
  retry: (failureCount: number, error: unknown): boolean => {
    const status = (error as { status?: number } | null)?.status;
    if (typeof status === "number" && status >= 400 && status < 500) return false;
    return failureCount < 2;
  },
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
} as const;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: DEFAULT_QUERY_OPTIONS,
      mutations: {
        retry: false,
      },
    },
  });
}
