"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { APIError } from "@/lib/api";
import { ordersApi } from "../api";
import type { Order } from "@/types";

/**
 * `useOrder` — fetches a single order by ID.
 */
export function useOrder(id: string | undefined) {
  return useQuery<Order, APIError>({
    queryKey: id ? queryKeys.orders.detail(id) : queryKeys.orders.detail(""),
    queryFn: () => {
      if (!id) {
        throw new APIError({
          status: 0,
          code: "INTERNAL",
          message: "Thiếu ID đơn hàng.",
        });
      }
      return ordersApi.get(id);
    },
    enabled: Boolean(id),
  });
}
