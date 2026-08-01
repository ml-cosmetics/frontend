"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { notificationsApi } from "../api";
import type { Notification } from "@/types";

/**
 * `useNotificationList` — feed of all notifications for the
 * admin user. The backend returns everything in one shot (no
 * pagination needed for the surface).
 */
export function useNotificationList() {
  return useQuery<Notification[]>({
    queryKey: queryKeys.notifications.list({ scope: "feed" }),
    queryFn: () => notificationsApi.list().then((r) => r.items),
  });
}