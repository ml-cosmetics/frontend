"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { notificationsApi } from "../api";
import type { NotificationPreferences } from "@/types";

/**
 * `useNotificationPreferences` — backend-authoritative preferences.
 * The right-rail toggles are seeded from this and patched back on
 * change.
 */
export function useNotificationPreferences() {
  return useQuery<NotificationPreferences>({
    queryKey: queryKeys.notifications.list({ scope: "preferences" }),
    queryFn: () => notificationsApi.getPreferences(),
  });
}