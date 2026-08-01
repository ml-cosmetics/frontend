"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { mediaApi } from "../api";
import type { ID, MediaAsset, MediaFolder } from "@/types";

/**
 * Edit a media asset's alt text / tags.
 */
export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation<
    MediaAsset,
    Error,
    { id: ID; input: { alt_text?: string | null; tags?: string[] } }
  >({
    mutationFn: ({ id, input }) => mediaApi.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.media.all() });
      toast.success("Đã cập nhật media");
    },
    onError: (error) => {
      toast.error("Không thể cập nhật media", { description: error.message });
    },
  });
}

/**
 * Delete a media asset.
 */
export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ID>({
    mutationFn: (id) => mediaApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.media.all() });
      toast.success("Đã xoá tệp media");
    },
    onError: (error) => {
      toast.error("Không thể xoá tệp media", { description: error.message });
    },
  });
}

/**
 * Create a new folder in the media library tree.
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation<MediaFolder, Error, { name: string; parent_id?: ID | null }>({
    mutationFn: (input) => mediaApi.createFolder(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.media.folders() });
      toast.success("Đã tạo thư mục");
    },
    onError: (error) => {
      toast.error("Không thể tạo thư mục", { description: error.message });
    },
  });
}
