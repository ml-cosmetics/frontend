"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { bannersApi } from "../api";
import type { Banner, CreateBannerInput } from "@/types";

/**
 * `useCreateBanner` — POST /admin/banners.
 */
export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation<Banner, Error, CreateBannerInput>({
    mutationFn: (input) => bannersApi.create(input),
    onSuccess: (banner) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all() });
      toast.success("Đã tạo banner", { description: banner.title });
    },
    onError: (error) => {
      toast.error("Không thể tạo banner", { description: error.message });
    },
  });
}
