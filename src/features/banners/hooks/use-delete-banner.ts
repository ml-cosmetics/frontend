"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { bannersApi } from "../api";
import type { ID } from "@/types";

/**
 * `useDeleteBanner` — DELETE /admin/banners/:id.
 */
export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ID>({
    mutationFn: (id) => bannersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all() });
      toast.success("Đã xoá banner");
    },
    onError: (error) => {
      toast.error("Không thể xoá banner", { description: error.message });
    },
  });
}
