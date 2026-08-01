"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { BannerSlider } from "@/components/storefront/banner-slider";
import { BannerSliderSkeleton } from "@/components/storefront/storefront-skeletons";
import type { APIError } from "@/lib/api";
import { bannersApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { BannerPublic } from "@/types";

/**
 * Banner block for the home page.
 *
 * Calls `GET /v1/banners` (the public route; admin auth is not
 * required). Returns only banners that are active and within their
 * scheduled window. Passing `initialData` from the server component
 * keeps the first paint populated, avoiding a layout shift.
 */
export interface BannerBlockProps {
  initialData?: { items: BannerPublic[] };
  /** ms between auto-rotations. Defaults to 5 000. */
  intervalMs?: number;
}

export function BannerBlock({ initialData, intervalMs }: BannerBlockProps) {
  const query = useQuery<{ items: BannerPublic[] }, APIError>({
    queryKey: queryKeys.banners.public(),
    queryFn: () => bannersApi.listPublic(),
    initialData,
  });

  if (query.isLoading && !query.data) {
    return <BannerSliderSkeleton />;
  }
  if (query.isError) {
    // Banners are optional marketing content. A network failure should
    // not break the home page — fall back to no slider.
    return null;
  }
  if (!query.data || query.data.items.length === 0) {
    return null;
  }
  return <BannerSlider banners={query.data.items} intervalMs={intervalMs} />;
}
