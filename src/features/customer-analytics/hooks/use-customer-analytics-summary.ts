"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { customerAnalyticsApi } from "../api";
import type { CustomerAnalyticsSummary } from "@/types";

/**
 * Read the customer analytics summary for the given period (default
 * 30 days). Period is part of the query key so toggling it
 * invalidates cleanly.
 */
export function useCustomerAnalyticsSummary(period = "30d") {
  return useQuery<CustomerAnalyticsSummary>({
    queryKey: queryKeys.customerAnalytics.summary(period),
    queryFn: () => customerAnalyticsApi.summary(period),
  });
}
