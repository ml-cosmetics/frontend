"use client";

import type {
  FeaturedCollectionItem,
  FeaturedCollectionPublic,
  ProductListItem,
} from "@/types";

/**
 * `featuredItemToListItem` — project a `FeaturedCollectionItem` (slim
 * admin-curated shape returned by `GET /v1/featured-collections`)
 * into the full `ProductListItem` consumed by the shared
 * `ProductCard`.
 *
 * Why this lives here rather than inside any individual section:
 *   • Both the homepage bento and the `/promotions` page need the
 *     same projection. Keeping it in one place guarantees the
 *     storefront's "khuyến mãi" card never drifts from the
 *     homepage's "nổi bật" card — same image / tag / heart /
 *     copy button / price layout.
 *   • The admin picker does NOT pre-fetch `category`,
 *     `description`, or `cost` per item; they intentionally fall
 *     back to safe defaults (`null` / `""`) so a card never has
 *     undefined behaviour at render time.
 */
export function featuredItemToListItem(
  item: FeaturedCollectionItem,
): ProductListItem {
  const p = item.product;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: "",
    status: p.status,
    price: p.price,
    compare_at: p.compare_at ?? null,
    cost: null,
    thumbnail_url: p.thumbnail_url,
    category: null,
    created_at: "",
    updated_at: "",
  };
}

/**
 * `findFeaturedCollectionBySlug` — locate a featured collection
 * inside the public list by slug. The page-wide sections ("nổi
 * bật", "khuyến mãi", "quà tặng") are all just regular admin-curated
 * collections, so consumers pick their own by `slug`. Returns
 * `undefined` when the admin hasn't published anything matching
 * yet — callers must surface that with an `EmptyState` instead of
 * fabricating fake products.
 */
export function findFeaturedCollectionBySlug(
  collections: FeaturedCollectionPublic[],
  slug: string,
): FeaturedCollectionPublic | undefined {
  return collections.find((c) => c.slug === slug);
}
