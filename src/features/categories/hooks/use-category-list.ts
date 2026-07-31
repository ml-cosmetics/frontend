"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { categoriesApi } from "@/lib/api/categories";
import type { ListCategoriesParams } from "@/lib/api/categories";

export function useCategoryList(params: ListCategoriesParams) {
  return useQuery({
    queryKey: queryKeys.categories.list(params as object),
    queryFn: () => categoriesApi.list(params),
  });
}
