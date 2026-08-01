import { get, patch, post } from "./client";
import { adminApiClient } from "./axios";
import type {
  ID,
  Notification,
  NotificationPreferences,
  NotificationStats,
  UpdateNotificationPreferencesInput,
} from "@/types";

/**
 * Notifications API — admin surface. The backend exposes the
 * canonical notification list under `/admin/notifications` plus a
 * handful of stateful actions (mark read, mark all read, update
 * preferences).
 */
export const notificationsApi = {
  list(): Promise<{ items: Notification[] }> {
    return get<{ items: Notification[] }>(adminApiClient, "/admin/notifications");
  },

  stats(): Promise<NotificationStats> {
    return get<NotificationStats>(adminApiClient, "/admin/notifications/stats");
  },

  getPreferences(): Promise<NotificationPreferences> {
    return get<NotificationPreferences>(adminApiClient, "/admin/notifications/preferences");
  },

  updatePreferences(
    input: UpdateNotificationPreferencesInput,
  ): Promise<NotificationPreferences> {
    return patch<NotificationPreferences, UpdateNotificationPreferencesInput>(
      adminApiClient,
      "/admin/notifications/preferences",
      input,
    );
  },

  markRead(id: ID): Promise<Notification> {
    return post<Notification, Record<string, never>>(
      adminApiClient,
      `/admin/notifications/${id}/read`,
      {},
    );
  },

  markAllRead(): Promise<{ updated: number }> {
    return post<{ updated: number }, Record<string, never>>(
      adminApiClient,
      "/admin/notifications/read-all",
      {},
    );
  },
};