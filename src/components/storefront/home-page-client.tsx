"use client";

import * as React from "react";
import { HomepageSkeleton } from "@/components/storefront/homepage-skeleton";
import {
  BannerHero,
  CollectionsBento,
  BestSellers,
  PromiseStrip,
} from "@/components/storefront/sections/homepage";

/**
 * Aura Rose Luxury Treatment — client shell for the `/` page.
 *
 * Renders the canonical Stitch loading skeleton on the very first
 * paint (before any products fetch has resolved) and the four
 * stitched sections afterwards. This matches the Stitch
 * `ML Cosmetics Aura Rose - Skeleton Loading` canvas where the
 * entire content area is replaced with a skeleton during the
 * initial network round-trip.
 *
 * The skeleton, marquee, footer, and floating bubble are owned by
 * `PublicShell` — this component only owns the content area.
 */
export function HomePageClient() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <HomepageSkeleton />;
  }

  return (
    <>
      <BannerHero />
      <CollectionsBento />
      <BestSellers />
      <PromiseStrip />
    </>
  );
}

HomePageClient.displayName = "HomePageClient";