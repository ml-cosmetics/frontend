"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { customersApi, type ListCustomersParams } from "../api";

export function useCustomerList(params: ListCustomersParams) {
  return useQuery({
    queryKey: queryKeys.customers.list(params as object),
    queryFn: () => customersApi.list(params),
  });
}
