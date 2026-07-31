import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";

export const CUSTOMERS_KEYS = {
  top: (limit: number) => ["reports", "top-customers", limit] as const,
};

export function useTopCustomers(limit: number = 5) {
  return useQuery({
    queryKey: CUSTOMERS_KEYS.top(limit),
    queryFn: () => reportsApi.topCustomers(limit),
  });
}
