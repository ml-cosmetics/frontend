"use client";

import { useQuery } from "@tanstack/react-query";
import { bannersApi } from "../api";
import { queryKeys } from "@/lib/query";
import type { BannerPublic } from "@/types";

/**
 * `usePublicBanners` — fetches the active banner slider for the
 * public storefront (`GET /v1/banners`).
 *
 * The endpoint returns only banners that are currently active and
 * in their scheduled window, ordered by `position`. Falls back to
 * `[]` on error so the storefront can render its own empty state
 * instead of bubbling a hard failure to the page boundary.
 */
export function usePublicBanners() {
  return useQuery<BannerPublic[]>({
    queryKey: queryKeys.banners.public(),
    queryFn: () => bannersApi.listPublic().then((r) => r.items),
    staleTime: 60_000,
  });
}
