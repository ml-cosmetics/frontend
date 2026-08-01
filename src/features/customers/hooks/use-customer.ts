"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { APIError } from "@/lib/api";
import { customersApi } from "../api";
import type { Customer } from "@/types";

export function useCustomer(id: string | undefined, enabled = true) {
  return useQuery<Customer, APIError>({
    queryKey: id ? queryKeys.customers.detail(id) : queryKeys.customers.detail(""),
    queryFn: () => {
      if (!id) {
        throw new APIError({
          status: 0,
          code: "INTERNAL",
          message: "Thiếu ID khách hàng.",
        });
      }
      return customersApi.get(id);
    },
    enabled: Boolean(id) && enabled,
  });
}
