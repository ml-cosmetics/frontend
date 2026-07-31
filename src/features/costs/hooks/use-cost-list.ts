"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { costsApi } from "../api";
import type { Cost, CostStats } from "@/types";

export function useCostList() {
  return useQuery<Cost[]>({
    queryKey: queryKeys.costs.list({ scope: "feed" }),
    queryFn: () => costsApi.list().then((r) => r.items),
  });
}

export function useCostStats() {
  return useQuery<CostStats>({
    queryKey: queryKeys.costs.list({ scope: "stats" }),
    queryFn: () => costsApi.stats(),
  });
}