"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { productsApi } from "../api";
import type { APIError } from "@/lib/api";
import type { ID } from "@/types";

/**
 * `useDeleteProduct` — DELETE /v1/products/:id. Invalidates the
 * list cache so the deleted row disappears from the table. The
 * caller decides whether to bounce back a page when the current
 * page becomes empty.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation<void, APIError, ID>({
    mutationFn: (id) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      toast.success("Đã xoá sản phẩm");
    },
    onError: (error) => {
      toast.error("Không thể xoá sản phẩm", {
        description: error.message,
      });
    },
  });
}
