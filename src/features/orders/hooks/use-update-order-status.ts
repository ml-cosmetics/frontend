"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { ordersApi } from "../api";
import type { Order, OrderStatus } from "@/types";
import type { APIError } from "@/lib/api";

/**
 * `useUpdateOrderStatus` — PATCH /orders/:id.
 *
 * Mutation succeeds, then refetches the affected detail + list queries.
 * No optimistic update, no rollback, no cache patch — the backend is
 * the single source of truth.
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation<Order, APIError, { id: string; status: OrderStatus }>({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onSuccess: (_data, { id }) => {
      toast.success("Cập nhật trạng thái thành công");
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    },
    onError: (error) => {
      toast.error("Không thể cập nhật trạng thái đơn hàng", {
        description: "Đã xảy ra lỗi. Vui lòng thử lại.",
      });
      void error;
    },
  });
}
