"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { categoriesApi } from "../api";
import type { ID } from "@/types";

/**
 * `useDeleteCategory` — DELETE /v1/categories/:id.
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ID>({
    mutationFn: (id) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(),
      });
      toast.success("Đã xoá danh mục");
    },
    onError: (error) => {
      toast.error("Không thể xoá danh mục", {
        description: error.message,
      });
    },
  });
}
