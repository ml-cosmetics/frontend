"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { featuredCollectionsApi } from "../api";
import type { FeaturedCollection, ID } from "@/types";

/**
 * `useFeaturedCollection` — fetch one admin-side collection by id,
 * including its ordered items + product projection. Used by the
 * edit dialog.
 */
export function useFeaturedCollection(id: ID | null | undefined) {
  return useQuery<FeaturedCollection>({
    queryKey: id ? queryKeys.featuredCollections.detail(id) : ["featured-collection", "noop"],
    queryFn: () => {
      if (!id) throw new Error("featured collection id is required");
      return featuredCollectionsApi.get(id);
    },
    enabled: Boolean(id),
  });
}