"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { ordersApi, type ListOrdersParams } from "../api";

export function useOrders(params: ListOrdersParams = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersApi.list(params),
  });
}
