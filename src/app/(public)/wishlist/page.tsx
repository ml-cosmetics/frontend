import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { WishlistView } from "@/features/wishlist/components/wishlist-view";
import type { ProductListItem } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * Public Wishlist page (`/wishlist`).
 *
 * Renders only the content area between the public shell (top nav /
 * marquee / footer / floating bubble) and the footer — header / footer
 * are owned by `PublicShell` and stay identical to every other public
 * page.
 *
 * The wishlist's item state lives in `localStorage` (see `useWishlist`)
 * so the page can be statically server-rendered: the recommendations
 * strip is the only data fetched here, and a fetching failure falls
 * back to an empty strip rather than blocking the route.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Wishlist",
    description:
      "Danh sách yêu thích của bạn tại ML Cosmetics — lưu giữ những món quà Aura Rose bạn đang nâng niu, chia sẻ hoặc mua ngay.",
  };
}

export default async function WishlistPage() {
  const recommendations = await fetchRecommendations();
  return (
    <Section tone="default" flush containerSize="2xl">
      <Container size="2xl" className="p-0">
        <WishlistView recommendations={recommendations} />
      </Container>
    </Section>
  );
}

/**
 * Resolve the "Bạn có thể cũng sẽ yêu thích" strip. Fetches the
 * newest active products server-side (no JWT, public endpoint) and
 * silently returns `[]` on failure so a transient API blip doesn't
 * break the page — the strip just disappears.
 *
 * The response envelope is intentionally tolerant: production
 * shapes the list under `{ data: { items, ... } }` while some
 * intermediate surfaces hand back `{ items: [...] }` flat. Both
 * are accepted so we don't break the route when the envelope
 * drifts.
 */
async function fetchRecommendations(): Promise<ProductListItem[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/v1/products?per_page=8&status=active`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const payload = (await res.json()) as
      | { data?: { items?: ProductListItem[] } }
      | { items?: ProductListItem[] }
      | null;
    if (!payload) return [];
    if ("items" in payload && Array.isArray(payload.items)) {
      return payload.items;
    }
    if ("data" in payload && payload.data && Array.isArray(payload.data.items)) {
      return payload.data.items;
    }
    return [];
  } catch {
    return [];
  }
}
