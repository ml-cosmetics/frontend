"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { featuredCollectionsApi } from "../api";
import type { ID } from "@/types";

export function useDeleteFeaturedCollection() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ID>({
    mutationFn: (id) => featuredCollectionsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.featuredCollections.all() });
      toast.success("Đã xoá bộ sưu tập");
    },
    onError: (error) => {
      toast.error("Không thể xoá bộ sưu tập", { description: error.message });
    },
  });
}