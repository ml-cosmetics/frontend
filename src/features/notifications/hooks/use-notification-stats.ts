"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { notificationsApi } from "../api";
import type { NotificationStats } from "@/types";

/**
 * `useNotificationStats` — unread / today / week / total counters
 * for the KPI strip at the top of the page.
 */
export function useNotificationStats() {
  return useQuery<NotificationStats>({
    queryKey: queryKeys.notifications.list({ scope: "stats" }),
    queryFn: () => notificationsApi.stats(),
  });
}