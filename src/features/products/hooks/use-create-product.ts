"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { productsApi } from "../api";
import type { APIError } from "@/lib/api";
import type { CreateProductInput, Product } from "@/types";

/**
 * `useCreateProduct` — POST /v1/products. Invalidates every list
 * cache (broad) so the new product shows up the next time any page
 * fetches. Toast + redirect is the caller's job; the mutation only
 * reports success / failure.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, APIError, CreateProductInput>({
    mutationFn: (input) => productsApi.create(input),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      // Newly created product has empty images, but the detail
      // cache will be populated by the redirect / edit-page flow.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(product.id),
      });
      toast.success("Đã tạo sản phẩm", {
        description: product.name,
      });
    },
    onError: (error) => {
      toast.error("Không thể tạo sản phẩm", {
        description: error.message,
      });
    },
  });
}
