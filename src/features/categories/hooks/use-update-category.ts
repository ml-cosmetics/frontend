"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { categoriesApi } from "../api";
import type { Category, ID, UpdateCategoryInput } from "@/types";

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, { id: ID; input: UpdateCategoryInput }>({
    mutationFn: ({ id, input }) => categoriesApi.update(id, input),
    onSuccess: (category) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      toast.success("Đã cập nhật danh mục", {
        description: category.name,
      });
    },
    onError: (error) => {
      toast.error("Không thể cập nhật danh mục", {
        description: error.message,
      });
    },
  });
}
