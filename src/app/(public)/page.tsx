import type { Metadata } from "next";
import { HomePageClient } from "@/components/storefront";

/**
 * Public home page (`/`) — Aura Rose Luxury Treatment (Stitch).
 *
 * Composition (matches Stitch `ML Cosmetics Aura Rose - Skeleton
 * Loading` → `Aura Rose Homepage`):
 *   1. Skeleton placeholder during the first paint (rendered
 *      before the client effect resolves).
 *   2. BannerHero          — admin-curated banner slider (live).
 *   3. CollectionsBento    — chip filter + 2/3 feature + 1/3 stack.
 *   4. BestSellers         — 4 product cards inside a rounded-[2rem]
 *                            card.
 *   5. PromiseStrip        — 4 trust icons.
 *
 * The header, marquee, footer, and floating bubble are owned by
 * `PublicShell` (see `frontend/src/components/layout/public-shell.tsx`)
 * and rendered once for every public route.
 */

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      absolute: "ML Cosmetics — Aura Rose Luxury Treatment",
    },
    description:
      "Sự kết hợp hoàn hảo giữa ngọc bích Jadeite và sự quyến rũ hiện đại từ Dior, mang đến đẳng cấp sang trọng đầy nữ tính.",
  };
}

export default function HomePage() {
  return <HomePageClient />;
}