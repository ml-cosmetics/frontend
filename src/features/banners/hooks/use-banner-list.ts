"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { bannersApi } from "../api";
import type { Banner } from "@/types";

/**
 * `useBannerList` — fetches the full admin banner list.
 * The backend `GET /admin/banners` returns all banners with no
 * built-in pagination, so the hook returns the raw array.
 */
export function useBannerList() {
  return useQuery<Banner[]>({
    queryKey: queryKeys.banners.admin(),
    queryFn: () => bannersApi.list().then((r) => r.items),
  });
}
