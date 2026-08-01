"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { contentApi } from "../api";
import type { ContentSection, UpdateContentInput } from "@/types";

export function useUpdateContent() {
  const queryClient = useQueryClient();
  return useMutation<ContentSection, Error, { key: string; input: UpdateContentInput }>({
    mutationFn: ({ key, input }) => contentApi.update(key, input),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.content.all() });
      toast.success("Đã lưu nội dung", { description: updated.title ?? updated.key });
    },
    onError: (error) => {
      toast.error("Không thể lưu nội dung", { description: error.message });
    },
  });
}
