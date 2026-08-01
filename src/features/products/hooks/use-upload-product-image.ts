"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { productsApi } from "../api";
import type { APIError } from "@/lib/api";
import type { ID, ProductImage } from "@/types";

/**
 * `useUploadProductImage` — upload a single file to MinIO.
 *
 * This hook is intentionally *purely* a file upload. It does NOT
 * persist the new key into the product's image list — that step is
 * handled by the edit form when the user clicks "Lưu thay đổi".
 * Persisting immediately on upload would skip the user's reordering
 * and force an extra round-trip per file.
 *
 * Returned value still includes the new key + url so callers can
 * inject it into the local image order array without re-fetching.
 *
 * Cancellation: the caller may pass `signal` in the variables. When
 * aborted, the in-flight upload request rejects with an axios
 * `CanceledError`; the gallery swallows that case (no error toast)
 * and drops the local preview.
 */
export interface UploadedImage {
  object_key: string;
  url: string;
}

export function useUploadProductImage() {
  const queryClient = useQueryClient();
  return useMutation<
    UploadedImage,
    APIError,
    { id: ID; file: File; signal?: AbortSignal }
  >({
    mutationFn: async ({ file, signal }) => {
      const uploaded = await productsApi.uploadFile(file, { signal });
      return { object_key: uploaded.object_key, url: uploaded.url };
    },
    onSuccess: (_uploaded, variables) => {
      // We don't invalidate the images query anymore — the gallery is
      // driven by local state, and React Query would re-paint the grid
      // before the user finishes reordering. The edit form invalidates
      // once on save.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.id),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.all(),
      });
      toast.success("Đã tải ảnh lên", {
        description: variables.file.name,
      });
    },
    onError: (error, variables) => {
      if (error?.name === "CanceledError") return;
      toast.error("Không thể tải ảnh lên", {
        description: `${variables.file.name}: ${error.message}`,
      });
    },
  });
}

// Keep the legacy export so any remaining imports compile.
export type { ProductImage };

