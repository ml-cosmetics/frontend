"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { reportsApi } from "@/lib/api";

/**
 * Recent orders — cached for 30s (per `docs/QUERY_STRATEGY.md` §3).
 */
export function useRecentOrders() {
  return useQuery({
    queryKey: queryKeys.reports.recentOrders(),
    queryFn: () => reportsApi.recentOrders(),
    staleTime: 30_000,
  });
}
