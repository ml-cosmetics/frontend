"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { featuredCollectionsApi } from "../api";
import type { FeaturedCollection, ID, UpdateFeaturedCollectionInput } from "@/types";

export function useUpdateFeaturedCollection() {
  const queryClient = useQueryClient();
  return useMutation<
    FeaturedCollection,
    Error,
    { id: ID; input: UpdateFeaturedCollectionInput }
  >({
    mutationFn: ({ id, input }) => featuredCollectionsApi.update(id, input),
    onSuccess: (collection) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.featuredCollections.all() });
      toast.success("Đã cập nhật bộ sưu tập", { description: collection.title });
    },
    onError: (error) => {
      toast.error("Không thể cập nhật bộ sưu tập", { description: error.message });
    },
  });
}