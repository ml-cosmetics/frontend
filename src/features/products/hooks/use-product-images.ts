"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { adminApiClient } from "@/lib/api/axios";
import type { APIError } from "@/lib/api";
import type { ProductImage } from "@/types";

/**
 * `useProductImages` — fetches all images for a product. Used by
 * the edit page's gallery. Keeps the gallery in sync after a
 * successful upload / delete via React Query invalidation.
 */
export function useProductImages(id: string | undefined, enabled = true) {
  return useQuery<ProductImage[], APIError>({
    queryKey: id ? queryKeys.products.images(id) : queryKeys.products.images(""),
    queryFn: async () => {
      if (!id) return [];
      const response = await adminApiClient.get<{ data: RawImage[] }>(
        `/products/${id}/images`,
      );
      return (response.data.data ?? []).map(normalizeImage);
    },
    enabled: Boolean(id) && enabled,
  });
}

/**
 * The images endpoint returns `url` but the `ProductImage` type
 * uses `image_url`. Normalise the shape here so all consumers
 * receive a consistent `image_url` field.
 */
interface RawImage {
  id: string;
  object_key?: string;
  url?: string;
  image_url?: string;
  sort_order?: number;
}

function normalizeImage(raw: RawImage): ProductImage {
  return {
    id: raw.id,
    object_key: raw.object_key ?? "",
    // Backend returns `url`; fall back to `image_url` for safety.
    image_url: raw.url ?? raw.image_url ?? "",
    sort_order: raw.sort_order ?? 0,
  };
}
