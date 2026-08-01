import { get } from "./client";
import { adminApiClient } from "./axios";
import type { ActivityLog, ActivityStats, ID } from "@/types";

/**
 * Activity log API — admin surface under `/admin/activity`. The backend
 * projects audit events the operator team has emitted (logins,
 * mutations, system alerts). The list endpoint accepts a small set
 * of filter params and returns the canonical `items` envelope.
 */
export const activityApi = {
  list(): Promise<{ items: ActivityLog[]; total: number }> {
    return get<{ items: ActivityLog[]; total: number }>(adminApiClient, "/admin/activity");
  },

  stats(): Promise<ActivityStats> {
    return get<ActivityStats>(adminApiClient, "/admin/activity/stats");
  },

  get(id: ID): Promise<ActivityLog> {
    return get<ActivityLog>(adminApiClient, `/admin/activity/${id}`);
  },
};