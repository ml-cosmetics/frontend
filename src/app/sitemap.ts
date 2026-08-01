import type { MetadataRoute } from "next";
import { productsApi } from "@/lib/api";
import { settingsApi } from "@/lib/api";

/**
 * Sitemap for the public storefront.
 *
 * Always-on routes (/, /products, /about, /contact) come first with
 * priority matched to their editorial weight. The dynamic product
 * detail pages are appended from `GET /v1/products` (first page
 * only — anything past page 1 is hidden behind pagination so
 * crawlers shouldn't index them).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const products = await productsApi
    .list({ page: 1, per_page: 100 })
    .catch(() => undefined);

  const settings = await settingsApi.get().catch(() => undefined);

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/about`,
      lastModified: settings?.company_name ? now : now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const productEntries: MetadataRoute.Sitemap = (products?.items ?? []).map((p) => ({
    url: `${base}/products/${p.slug || p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries];
}
