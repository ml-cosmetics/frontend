"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { reportsApi } from "@/lib/api";

/**
 * Low-stock products — cached for 30s (per `docs/QUERY_STRATEGY.md`
 * §3). Inventory signals move slowly; 30s is plenty for the operator.
 */
export function useLowStock() {
  return useQuery({
    queryKey: queryKeys.reports.lowStock(),
    queryFn: () => reportsApi.lowStock(),
    staleTime: 30_000,
  });
}
