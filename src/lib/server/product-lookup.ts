import "server-only";

/**
 * Server-side lookup helpers used by dynamic admin routes to resolve
 * friendly labels for the breadcrumb (e.g. product / category / order
 * name) without forcing the whole page into CSR.
 *
 * Each helper swallows non-success responses and returns `null` so
 * the breadcrumb gracefully falls back to the raw ID when the entity
 * is missing — better than blocking the route on a single failed read.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const API_V1 = `${API_BASE_URL}/v1`;

interface ProductSummary {
  id: string;
  name: string;
  slug?: string;
}

/**
 * `fetchProductNameById` — looks up a product's display name by its ID.
 * Returns `null` when the product is missing, the API responds with a
 * non-2xx status, or the network call throws. The breadcrumb will then
 * fall back to the raw ID segment so users still see the route they
 * are on.
 */
export async function fetchProductNameById(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_V1}/products/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as
      | { data?: ProductSummary; name?: string }
      | null;
    const name = payload?.data?.name ?? payload?.name;
    if (typeof name !== "string" || name.length === 0) return null;
    return name;
  } catch {
    return null;
  }
}
