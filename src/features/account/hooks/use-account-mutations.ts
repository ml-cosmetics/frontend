"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { accountApi } from "../api";
import type { AccountProfile, UpdateAccountProfileInput } from "@/types";

/**
 * Persist edits to the operator's own profile (name, phone, locale,
 * address). Invalidates the profile query so the chrome refreshes
 * from the new server state.
 */
export function useUpdateAccountProfile() {
  const queryClient = useQueryClient();
  return useMutation<AccountProfile, Error, UpdateAccountProfileInput>({
    mutationFn: (input) => accountApi.updateProfile(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.account.profile() });
      toast.success("Đã lưu hồ sơ cá nhân");
    },
    onError: (error) => {
      toast.error("Không thể lưu hồ sơ", {
        description: error.message,
      });
    },
  });
}
