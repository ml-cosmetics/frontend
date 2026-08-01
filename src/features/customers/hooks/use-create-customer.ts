"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { customersApi } from "../api";
import type { APIError } from "@/lib/api";
import type { CreateCustomerInput, Customer } from "@/types";

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation<Customer, APIError, CreateCustomerInput>({
    mutationFn: (input) => customersApi.create(input),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
      toast.success("Đã tạo khách hàng", {
        description: customer.full_name,
      });
    },
    onError: (error) => {
      toast.error("Không thể tạo khách hàng", {
        description: error.message,
      });
    },
  });
}
