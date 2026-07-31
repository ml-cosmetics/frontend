import { get } from "./client";
import { adminApiClient } from "./axios";
import type { DashboardMetrics } from "@/types";

/**
 * Typed client for the aggregated dashboard endpoint. The backend
 * computes every metric server-side; the client just renders it.
 * Dashboard is admin-only — uses `adminApiClient` so the JWT is
 * attached and the 401 bounce-on-unauthorised flow stays consistent.
 */
export const dashboardApi = {
  get(): Promise<DashboardMetrics> {
    return get<DashboardMetrics>(adminApiClient, "/admin/dashboard");
  },
};