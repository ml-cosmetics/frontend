import { get } from "./client";
import { adminApiClient } from "./axios";
import type { CustomerAnalyticsSummary } from "@/types";

/**
 * Customer analytics API — admin surface under
 * `/admin/customer-analytics`. Returns the consolidated summary that
 * powers the overview, traffic, behaviour, channels and products
 * tabs. The backend switches the dataset by `period`.
 */
export const customerAnalyticsApi = {
  summary(period = "30d"): Promise<CustomerAnalyticsSummary> {
    return get<CustomerAnalyticsSummary>(
      adminApiClient,
      "/admin/customer-analytics/summary",
      { period },
    );
  },
};