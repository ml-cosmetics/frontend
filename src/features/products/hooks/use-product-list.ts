"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { productsApi, type ListProductsParams } from "../api";

export function useProductList(params: ListProductsParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params as object),
    queryFn: () => productsApi.list(params),
  });
}
