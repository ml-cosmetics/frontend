"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { shippingApi } from "../api";
import type { ID, Shipment, UpdateShipmentInput } from "@/types";

/**
 * `useUpdateShipment` — PATCH /admin/shipping/:id. Used by the
 * status / carrier change actions.
 */
export function useUpdateShipment() {
  const queryClient = useQueryClient();
  return useMutation<Shipment, Error, { id: ID; input: UpdateShipmentInput }>({
    mutationFn: ({ id, input }) => shippingApi.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipping.all() });
      toast.success("Đã cập nhật vận đơn");
    },
    onError: (error) => {
      toast.error("Không thể cập nhật vận đơn", {
        description: error.message,
      });
    },
  });
}

export function useDeleteShipment() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ID>({
    mutationFn: (id) => shippingApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipping.all() });
      toast.success("Đã xoá vận đơn");
    },
    onError: (error) => {
      toast.error("Không thể xoá vận đơn", { description: error.message });
    },
  });
}