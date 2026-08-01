"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { productsApi } from "../api";
import type { APIError } from "@/lib/api";
import type { ID, Product, UpdateProductInput } from "@/types";

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, APIError, { id: ID; input: UpdateProductInput }>({
    mutationFn: ({ id, input }) => productsApi.update(id, input),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      // When the form re-orders / replaces images, both the detail
      // payload and the gallery cache need to refresh.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.images(product.id),
      });
      toast.success("Đã cập nhật sản phẩm", {
        description: product.name,
      });
    },
    onError: (error) => {
      toast.error("Không thể cập nhật sản phẩm", {
        description: error.message,
      });
    },
  });
}
