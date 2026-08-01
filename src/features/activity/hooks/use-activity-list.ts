"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { activityApi } from "../api";
import type { ActivityLog, ActivityStats } from "@/types";

/**
 * Read the canonical activity log feed. Returns the resolved list and
 * the total count (used by the page-level pagination footer).
 */
export function useActivityList() {
  return useQuery<{ items: ActivityLog[]; total: number }>({
    queryKey: queryKeys.activity.list({ scope: "feed" }),
    queryFn: () => activityApi.list(),
  });
}

/**
 * Read the activity dashboard summary: today's events, week total,
 * logins, alerts, 24h timeline and top users.
 */
export function useActivityStats() {
  return useQuery<ActivityStats>({
    queryKey: queryKeys.activity.stats(),
    queryFn: () => activityApi.stats(),
  });
}
