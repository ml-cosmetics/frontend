"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { inventoryApi } from "../api";
import type { Inventory } from "@/types";
import type { BulkAdjustInventoryInput } from "@/lib/api/inventory";

/**
 * `useBulkAdjustInventory` — POST /v1/inventories/bulk-adjust.
 *
 * Applies a signed delta to many inventory rows in one round-trip.
 * Returns the rows the backend actually touched (rows that would
 * have gone negative are skipped — see service-layer docs). Refetches
 * the inventory list on success so totals stay accurate.
 */
export function useBulkAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation<
    { items: Inventory[] },
    Error,
    BulkAdjustInventoryInput
  >({
    mutationFn: (input) => inventoryApi.bulkAdjust(input),
    onSuccess: (data) => {
      const touched = data.items.length;
      toast.success(`Đã điều chỉnh ${touched} sản phẩm`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
    },
    onError: (error) => {
      toast.error("Không thể điều chỉnh hàng loạt", {
        description: error.message,
      });
    },
  });
}
