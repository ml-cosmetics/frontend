"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { settingsApi } from "../api";
import type { Settings, UpdateSettingsInput } from "@/types";

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation<Settings, Error, UpdateSettingsInput>({
    mutationFn: (input) => settingsApi.update(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() });
      toast.success("Đã lưu cài đặt");
    },
    onError: (error) => {
      toast.error("Không thể lưu cài đặt", { description: error.message });
    },
  });
}
