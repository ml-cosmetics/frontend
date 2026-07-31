"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { featuredCollectionsApi } from "../api";
import type { FeaturedCollection, PaginatedList } from "@/types";

export interface AdminListParams {
  page?: number;
  per_page?: number;
}

/**
 * `useFeaturedCollectionsAdminList` — paginated admin list with
 * the full row shape (incl. inactive collections and timestamps).
 */
export function useFeaturedCollectionsAdminList(params: AdminListParams = {}) {
  return useQuery<PaginatedList<FeaturedCollection>>({
    queryKey: queryKeys.featuredCollections.adminList(params),
    queryFn: () => featuredCollectionsApi.list(params),
  });
}

export function featuredCollectionListToRows(
  list: PaginatedList<FeaturedCollection> | undefined,
): FeaturedCollection[] {
  return list?.items ?? [];
}