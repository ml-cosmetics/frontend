"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { customersApi } from "../api";
import type { APIError } from "@/lib/api";
import type { ID } from "@/types";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation<void, APIError, ID>({
    mutationFn: (id) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
      toast.success("Đã xoá khách hàng");
    },
    onError: (error) => {
      toast.error("Không thể xoá khách hàng", {
        description: error.message,
      });
    },
  });
}
