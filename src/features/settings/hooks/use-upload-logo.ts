"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsApi } from "../api";
import type { SettingsUploadOutput } from "@/types";

/**
 * `useUploadLogo` — POST /admin/settings/logo.
 *
 * The returned `key` is the S3/storage key that the settings form
 * must include in the next `PUT /admin/settings` call.
 */
export function useUploadLogo() {
  return useMutation<SettingsUploadOutput, Error, File>({
    mutationFn: (file) => settingsApi.uploadLogo(file),
    onSuccess: () => {
      toast.success("Đã tải logo lên");
    },
    onError: (error) => {
      toast.error("Không thể tải logo lên", { description: error.message });
    },
  });
}
