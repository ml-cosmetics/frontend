"use client";

import { useQueries } from "@tanstack/react-query";
import { ordersApi } from "../api";
import { queryKeys } from "@/lib/query";
import type { OrderStatus } from "@/types";

export const ORDER_STATUS_FILTERS = [
  "all",
  "created",
  "shipping",
  "done",
  "cancelled",
] as const;

export type OrderStatusFilter = (typeof ORDER_STATUS_FILTERS)[number];

/**
 * Map the on-screen "all" tab to a request with no `status` param so the
 * backend returns the unfiltered total.
 */
function toStatusParam(filter: OrderStatusFilter): OrderStatus | undefined {
  return filter === "all" ? undefined : (filter as OrderStatus);
}

/**
 * `useOrderStatusCounts` — fires five parallel `GET /orders?status=…&per_page=1`
 * requests and returns the live total for each filter. Used to label the
 * tab strip and the pipeline summary cards on `/admin/orders`.
 *
 * Why five round-trips and not a single `?status=*` aggregation?
 *   The backend ships no "by-status breakdown" endpoint, and adding one
 *   would touch the wire contract. Five per_page=1 requests are cheap
 *   (each returns 1 row + pagination metadata) and React Query
 *   deduplicates them across mounts, so the steady state is one cache
 *   entry per filter, refreshed in the background.
 *
 * Counts are read from `pagination.total` — i.e. the **server-side
 * filtered count**, not a count of whatever page slice happens to be
 * loaded in the table. That avoids the bug where switching tabs wipes
 * every other tab's count to zero while the new tab's request is in
 * flight.
 */
export function useOrderStatusCounts() {
  const results = useQueries({
    queries: ORDER_STATUS_FILTERS.map((filter) => ({
      queryKey: [...queryKeys.orders.list({ status: toStatusParam(filter), per_page: 1, page: 1 })] as const,
      queryFn: () =>
        ordersApi.list({
          status: toStatusParam(filter),
          per_page: 1,
          page: 1,
        }),
      // Keep the previous total visible while the next filter's request
      // is in flight. Without this the tab label would briefly show 0
      // whenever the user clicks a different filter.
      placeholderData: (prev: Awaited<ReturnType<typeof ordersApi.list>> | undefined) => prev,
    })),
  });

  const counts = {} as Record<OrderStatusFilter, number>;
  ORDER_STATUS_FILTERS.forEach((filter, idx) => {
    counts[filter] = results[idx]?.data?.pagination?.total ?? 0;
  });

  const isLoading = results.some((r) => r.isLoading);
  const isFetching = results.some((r) => r.isFetching);

  return { counts, isLoading, isFetching };
}