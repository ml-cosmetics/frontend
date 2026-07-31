"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { bannersApi } from "../api";
import type { Banner, ID } from "@/types";

/**
 * `useBanner` — fetches a single banner by ID for the edit page.
 */
export function useBanner(id: ID | undefined, enabled = true) {
  return useQuery<Banner, Error>({
    queryKey: id ? queryKeys.banners.detail(id) : queryKeys.banners.detail(""),
    queryFn: () => {
      if (!id) throw new Error("Thiếu ID banner.");
      return bannersApi.get(id);
    },
    enabled: Boolean(id) && enabled,
  });
}
