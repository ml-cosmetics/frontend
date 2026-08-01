"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { categoriesApi } from "../api";
import type { Category, CreateCategoryInput } from "@/types";

/**
 * `useCreateCategory` — POST /v1/categories. Invalidates the list
 * cache so the new category shows up. Toast is handled by the
 * mutation callbacks; the caller is responsible for any redirect.
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, CreateCategoryInput>({
    mutationFn: (input) => categoriesApi.create(input),
    onSuccess: (category) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(),
      });
      toast.success("Đã tạo danh mục", {
        description: category.name,
      });
    },
    onError: (error) => {
      toast.error("Không thể tạo danh mục", {
        description: error.message,
      });
    },
  });
}
