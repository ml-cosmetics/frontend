"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { reportsApi } from "@/lib/api";

/**
 * Top-selling products — cached for 30s (per `docs/QUERY_STRATEGY.md`
 * §3) so re-mounts inside the 5-min `gcTime` window stay free.
 */
export function useTopProducts() {
  return useQuery({
    queryKey: queryKeys.reports.topProducts(),
    queryFn: () => reportsApi.topProducts(),
    staleTime: 30_000,
  });
}
