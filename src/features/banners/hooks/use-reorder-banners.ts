"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bannersApi } from "../api";
import { queryKeys } from "@/lib/query";
import type { ID } from "@/types";

/**
 * `useReorderBanners` — persists a new sort order for the banner
 * slider.
 *
 * The admin editor keeps the drag-and-drop ordering in local state
 * and only commits it to the backend when the operator clicks
 * "Lưu thứ tự". We iterate the list sequentially and PATCH each
 * banner's `position` through the existing `PUT /admin/banners/:id`
 * endpoint — one round-trip per item, in order, so partial failures
 * don't leave the store half-updated.
 *
 * On success the banner-list query is invalidated so the admin list
 * (and the public homepage slider) reflect the new ordering.
 */
export interface BannerPositionInput {
  id: ID;
  position: number;
}

export interface ReorderBannersArgs {
  items: BannerPositionInput[];
}

export function useReorderBanners() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ReorderBannersArgs>({
    mutationFn: async ({ items }) => {
      // Persist positions one-by-one. Fail fast on the first error so
      // the operator notices and we don't leave a partial reorder on
      // disk that's hard to reason about.
      for (const { id, position } of items) {
        await bannersApi.update(id, { position });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.banners.all() });
      toast.success("Đã lưu thứ tự banner");
    },
    onError: (error) => {
      toast.error("Không thể lưu thứ tự banner", { description: error.message });
    },
  });
}