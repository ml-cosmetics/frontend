"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { featuredCollectionsApi } from "../api";
import type { FeaturedCollectionPublic } from "@/types";

/**
 * `useFeaturedCollectionsPublic` — fetches the storefront list of
 * active featured collections with their items + product projection.
 *
 * Returns the raw array; callers decide how to render each section.
 * The endpoint is uncached on purpose because the homepage should
 * always reflect the admin's current picker state, but React
 * Query still de-duplicates concurrent requests.
 */
export function useFeaturedCollectionsPublic() {
  return useQuery<FeaturedCollectionPublic[]>({
    queryKey: queryKeys.featuredCollections.public(),
    queryFn: () =>
      featuredCollectionsApi.listPublic().then((r) => r.items),
  });
}