"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { ordersApi } from "../api";
import type { APIError } from "@/lib/api";
import type { CreateOrderInput, Order } from "@/types";

/**
 * `useCreateOrder` — POST /v1/admin/orders.
 *
 * Backend is the source of truth: on success we invalidate every
 * `orders.*` query (the detail cache for the freshly-minted id is
 * already invalidated by `orders.all()`, but we list it explicitly
 * so the post-mutation refetch hits both keys deterministically).
 * The caller decides what to do with the created order (close the
 * dialog, redirect to detail, etc.) by reading the mutation result.
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<Order, APIError, CreateOrderInput>({
    mutationFn: (input) => ordersApi.create(input),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(order.id),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all() });
      toast.success("Đã tạo đơn hàng", {
        description: `#${order.id.slice(0, 8)}…`,
      });
    },
    onError: (error) => {
      toast.error("Không thể tạo đơn hàng", {
        description: error.message,
      });
    },
  });
}