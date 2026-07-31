"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { bannersApi } from "../api";
import type { Banner, ID } from "@/types";

/**
 * `useToggleBannerStatus` — PATCH /activate or PATCH /deactivate.
 *
 * Mutation succeeds, then refetches the banner list. No optimistic
 * update — the displayed status reflects the latest backend state.
 */
export function useToggleBannerStatus() {
  const queryClient = useQueryClient();

  return useMutation<Banner, Error, ToggleArgs>({
    mutationFn: ({ id, activate }) =>
      activate ? bannersApi.activate(id) : bannersApi.deactivate(id),
    onSuccess: (_data, { activate }) => {
      toast.success(
        activate ? "Đã kích hoạt banner" : "Đã vô hiệu hoá banner",
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.banners.all() });
    },
    onError: (error) => {
      toast.error("Không thể thay đổi trạng thái banner", {
        description: error.message,
      });
    },
  });
}

interface ToggleArgs {
  id: ID;
  activate: boolean;
}
