"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { mediaApi } from "../api";
import type { MediaAsset, MediaFolder, MediaLibraryStats } from "@/types";

/**
 * Read the canonical media folder tree.
 */
export function useMediaFolders() {
  return useQuery<MediaFolder[]>({
    queryKey: queryKeys.media.folders(),
    queryFn: () => mediaApi.folders().then((r) => r.items),
  });
}

/**
 * Read the canonical media asset list.
 */
export function useMediaList() {
  return useQuery<{ items: MediaAsset[]; total: number }>({
    queryKey: queryKeys.media.list({ scope: "all" }),
    queryFn: () => mediaApi.list(),
  });
}

/**
 * Read storage usage stats for the page header.
 */
export function useMediaStats() {
  return useQuery<MediaLibraryStats>({
    queryKey: queryKeys.media.stats(),
    queryFn: () => mediaApi.stats(),
  });
}
