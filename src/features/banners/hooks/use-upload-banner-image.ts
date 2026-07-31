"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { bannersApi } from "../api";
import type { UploadFileOutput } from "@/types";

/**
 * `useUploadBannerImage` — POST /v1/admin/upload.
 *
 * The banner image lives in a separate opaque store: the admin
 * uploads the file first, gets back an `object_key` + public `url`,
 * and then persists the `object_key` on the banner through a follow-
 * up PUT. This hook covers only the upload step; persistence is
 * handled by the editor form so it can stay in sync with the local
 * draft state.
 */
export function useUploadBannerImage() {
  return useMutation<
    UploadFileOutput,
    Error,
    File,
    { previousKey?: string }
  >({
    mutationFn: (file) => bannersApi.upload(file),
    onError: (error) => {
      toast.error("Không thể tải ảnh lên", { description: error.message });
    },
  });
}
