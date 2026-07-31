"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsApi } from "../api";
import type { SettingsUploadOutput } from "@/types";

/**
 * `useUploadFavicon` — POST /admin/settings/favicon.
 */
export function useUploadFavicon() {
  return useMutation<SettingsUploadOutput, Error, File>({
    mutationFn: (file) => settingsApi.uploadFavicon(file),
    onSuccess: () => {
      toast.success("Đã tải favicon lên");
    },
    onError: (error) => {
      toast.error("Không thể tải favicon lên", { description: error.message });
    },
  });
}
