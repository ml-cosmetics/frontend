"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { productsApi, type ListProductsParams, type ProductStatusCounts } from "../api";

/**
 * useProductListCounts — pulls the aggregate counts powering the
 * Products tab bar (`Tất cả (30) / Đang bán (20) / ...`).
 *
 * The hook re-runs whenever `search` / `category_id` / `status` /
 * `out_of_stock` change. The tab bar uses different keys per tab so
 * we get a separate cached value for each filter combination.
 */
export function useProductListCounts(
  params: Pick<ListProductsParams, "search" | "category_id">,
  enabled = true,
) {
  return useQuery<ProductStatusCounts>({
    queryKey: queryKeys.products.counts(params),
    queryFn: () => productsApi.listCounts(params),
    enabled,
    // Counts are cheap server-side but we still dedupe aggressively
    // since the tab bar renders this on every page load and every
    // keystroke in the search box.
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
