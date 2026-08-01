"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { bannersApi } from "../api";
import type { Banner, ID, UpdateBannerInput } from "@/types";

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation<Banner, Error, { id: ID; input: UpdateBannerInput }>({
    mutationFn: ({ id, input }) => bannersApi.update(id, input),
    onSuccess: (banner) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.banners.all() });
      toast.success("Đã cập nhật banner", { description: banner.title });
    },
    onError: (error) => {
      toast.error("Không thể cập nhật banner", { description: error.message });
    },
  });
}
