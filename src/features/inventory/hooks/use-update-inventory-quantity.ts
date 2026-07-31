"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { inventoryApi } from "../api";
import type { Inventory } from "@/types";

/**
 * `useUpdateInventoryQuantity` — PATCH /v1/inventories/:id/set-quantity.
 *
 * Uses the dedicated `set-quantity` endpoint (atomic on the backend)
 * rather than PUT so we don't trigger stale-write races against
 * concurrent adjustments. Refetches the inventory list on success so
 * the displayed quantity always reflects the latest server state.
 *
 * The `reason` field is optional; the backend accepts it but doesn't
 * persist it yet (P2-3 audit log will hook in here).
 */
export function useUpdateInventoryQuantity() {
  const queryClient = useQueryClient();

  return useMutation<
    Inventory,
    Error,
    { id: string; quantity: number; reason?: string }
  >({
    mutationFn: ({ id, quantity, reason }) =>
      inventoryApi.setQuantity(id, { quantity, reason }),
    onSuccess: () => {
      toast.success("Đã cập nhật số lượng tồn kho");
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
    },
    onError: (error) => {
      toast.error("Không thể cập nhật số lượng", {
        description: error.message,
      });
    },
  });
}

/**
 * Input shape for the inventory adjustment dialog.
 */
export interface AdjustQuantityInput {
  adjustment: number;
  reason?: string;
}
