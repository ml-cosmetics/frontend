"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { shippingApi } from "../api";
import type { Shipment, ShippingStats } from "@/types";

/**
 * `useShipmentList` — admin shipments feed.
 */
export function useShipmentList() {
  return useQuery<Shipment[]>({
    queryKey: queryKeys.shipping.list({ scope: "feed" }),
    queryFn: () => shippingApi.list().then((r) => r.items),
  });
}

export function useShippingStats() {
  return useQuery<ShippingStats>({
    queryKey: queryKeys.shipping.list({ scope: "stats" }),
    queryFn: () => shippingApi.stats(),
  });
}