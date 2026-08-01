"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { featuredCollectionsApi } from "../api";
import type { CreateFeaturedCollectionInput, FeaturedCollection } from "@/types";

export function useCreateFeaturedCollection() {
  const queryClient = useQueryClient();
  return useMutation<FeaturedCollection, Error, CreateFeaturedCollectionInput>({
    mutationFn: (input) => featuredCollectionsApi.create(input),
    onSuccess: (collection) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.featuredCollections.all() });
      toast.success("Đã tạo bộ sưu tập", { description: collection.title });
    },
    onError: (error) => {
      toast.error("Không thể tạo bộ sưu tập", { description: error.message });
    },
  });
}