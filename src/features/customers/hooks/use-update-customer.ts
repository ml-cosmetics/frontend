"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { customersApi } from "../api";
import type { APIError } from "@/lib/api";
import type { Customer, ID, UpdateCustomerInput } from "@/types";

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation<Customer, APIError, { id: ID; input: UpdateCustomerInput }>({
    mutationFn: ({ id, input }) => customersApi.update(id, input),
    onSuccess: (customer) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
      toast.success("Đã cập nhật khách hàng", {
        description: customer.full_name,
      });
    },
    onError: (error) => {
      toast.error("Không thể cập nhật khách hàng", {
        description: error.message,
      });
    },
  });
}
