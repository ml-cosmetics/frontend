"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { productsApi } from "../api";
import type { APIError } from "@/lib/api";
import type { ID } from "@/types";

/**
 * `useDeleteProductImage` — DELETE /v1/admin/products/:id/images/:imageId.
 */
export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  return useMutation<void, APIError, { productId: ID; imageId: ID }>({
    mutationFn: ({ productId, imageId }) =>
      productsApi.deleteImage(productId, imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.images(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.productId),
      });
      toast.success("Đã xoá ảnh");
    },
    onError: (error) => {
      toast.error("Không thể xoá ảnh", {
        description: error.message,
      });
    },
  });
}
