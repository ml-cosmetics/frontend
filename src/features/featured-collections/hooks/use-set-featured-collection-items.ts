"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { featuredCollectionsApi } from "../api";
import type { FeaturedCollection, ID, SetFeaturedCollectionItemsInput } from "@/types";

/**
 * `useSetFeaturedCollectionItems` — wholesale replace the
 * collection's product list. The backend handles de-duplication
 * and ordering in a single transaction; the UI just hands off the
 * admin's picker order as-is.
 */
export function useSetFeaturedCollectionItems() {
  const queryClient = useQueryClient();
  return useMutation<
    FeaturedCollection,
    Error,
    { id: ID; input: SetFeaturedCollectionItemsInput }
  >({
    mutationFn: ({ id, input }) => featuredCollectionsApi.setItems(id, input),
    onSuccess: (collection) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.featuredCollections.all() });
      toast.success("Đã lưu danh sách sản phẩm", {
        description: `${collection.items.length} sản phẩm trong bộ sưu tập`,
      });
    },
    onError: (error) => {
      toast.error("Không thể lưu danh sách sản phẩm", { description: error.message });
    },
  });
}