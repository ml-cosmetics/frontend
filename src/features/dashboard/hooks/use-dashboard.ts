"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { dashboardApi } from "../api";
import type { DashboardMetrics } from "@/types";

/**
 * `useDashboard` — fetches aggregated dashboard metrics. Cached for 60s
 * (see `docs/QUERY_STRATEGY.md` §3) so a back-and-forth nav switch does
 * not re-hit the aggregator.
 */
export function useDashboard() {
  return useQuery<DashboardMetrics>({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => dashboardApi.get(),
    staleTime: 60_000,
  });
}
