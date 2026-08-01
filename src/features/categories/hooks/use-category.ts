"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { categoriesApi } from "../api";
import type { Category } from "@/types";

/**
 * `useCategory` — fetches a single category by ID. Used by the edit
 * page to populate the form. Skips when the ID is `""` (while routing
 * is resolving).
 */
export function useCategory(id: string | undefined, enabled = true) {
  return useQuery<Category, Error>({
    queryKey: id
      ? queryKeys.categories.detail(id)
      : queryKeys.categories.detail(""),
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error("Thiếu ID danh mục."));
      }
      return categoriesApi.get(id);
    },
    enabled: Boolean(id) && enabled,
  });
}
