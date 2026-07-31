"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { inventoryApi } from "../api";
import type { PaginatedList } from "@/types/api";
import { LOW_STOCK_THRESHOLD } from "../constants";
import type { InventoryRow } from "../types/inventory-row";
import type { ListInventoryParams } from "@/lib/api/inventory";

/**
 * `useInventoryList` — fetches the enriched inventory list from the backend.
 *
 * The backend `GET /v1/inventories` already accepts `search`, `stock`,
 * and `sort` query params, so we forward them straight through. The
 * `stock` filter is applied server-side using `LowStockThreshold` to
 * keep the FE/BE classification aligned.
 */
export function useInventoryList(
  params: ListInventoryParams,
  stock?: "in_stock" | "low_stock" | "out_of_stock",
) {
  return useQuery<PaginatedList<InventoryRow>>({
    queryKey: queryKeys.inventory.list({ ...params, stock }),
    queryFn: () =>
      inventoryApi.list({
        ...params,
        stock,
        sort: params.sort,
      }),
  });
}

// Re-export the constant so consumers can reference it from one place
// without reaching into `constants.ts` themselves.
export { LOW_STOCK_THRESHOLD };

/**
 * Classify a row's quantity locally for UI badges that don't go
 * through a server-side filter. Mirrors the BACKEND repo's
 * `LowStockThreshold` semantics.
 */
export function classifyStock(quantity: number | null | undefined) {
  if (quantity == null || quantity <= 0) return "out_of_stock" as const;
  if (quantity <= LOW_STOCK_THRESHOLD) return "low_stock" as const;
  return "in_stock" as const;
}
