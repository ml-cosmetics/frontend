"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { APIError } from "@/lib/api";
import { productsApi } from "../api";
import type { Product } from "@/types";

/**
 * `useProduct` — fetches a single product by ID. Used by the edit
 * page to populate the form. Skips when the ID is the placeholder
 * value (`""` while routing is resolving).
 */
export function useProduct(id: string | undefined, enabled = true) {
  return useQuery<Product, APIError>({
    queryKey: id ? queryKeys.products.detail(id) : queryKeys.products.detail(""),
    queryFn: () => {
      if (!id) {
        throw new APIError({
          status: 0,
          code: "INTERNAL",
          message: "Thiếu ID sản phẩm.",
        });
      }
      return productsApi.get(id);
    },
    enabled: Boolean(id) && enabled,
  });
}
