import type { MetadataRoute } from "next";

/**
 * Crawler rules. The admin / auth route groups are explicitly
 * disallowed; everything else (the public storefront + the API
 * surface — the latter is hosted on a separate origin so this
 * restriction is just defensive) is allowed.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/login", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
