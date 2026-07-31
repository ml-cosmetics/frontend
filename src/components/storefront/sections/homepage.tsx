"use client";

import * as React from "react";
import Link from "next/link";
import { PackageSearch, Sparkles } from "lucide-react";
import {
  useFeaturedCollectionsPublic,
} from "@/features/featured-collections/hooks";
import {
  featuredItemToListItem,
  findFeaturedCollectionBySlug,
} from "@/features/featured-collections";
import { ProductCard, type ProductCardTag } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ArrowForward } from "@/components/layout/storefront-icons";
import type {
  FeaturedCollectionItem,
  FeaturedCollectionPublic,
  ProductListItem,
} from "@/types";

/**
 * Aura Rose Luxury Treatment (Stitch public surface, route `/`) —
 * the homepage is composed of admin-curated, live-data sections.
 *
 * Section order is:
 *   1. BannerHero            — live hero from `GET /v1/banners`
 *                              (admin's curated slider).
 *   2. CollectionsBento     — admin-curated featured collections
 *                              ("Bộ sưu tập nổi bật"). One section
 *                              per active collection, with a layout
 *                              that adapts to the item count.
 *   3. BestSellers          — rounded-[2rem] container, 4 product
 *                              cards with star rating + price.
 *   4. PromiseStrip         — 4 trust icons (Chính hãng / Tư vấn 1:1
 *                              / Freeship / Đổi trả 7 ngày).
 *
 * The header, marquee, footer, and floating bubble are owned by
 * `PublicShell`, NOT rendered here. The page is composed of four
 * self-contained section components, each consumed by
 * `frontend/src/app/(public)/page.tsx`.
 */

// ---------- 1. Banner Hero ---------------------------------------------

export { BannerHero } from "./banner-hero";

// ---------- 2. Collections — "Bộ sưu tập nổi bật" ---------------------
//
// One section per active featured collection the admin has published.
//
// Data flow:
//   1. `useFeaturedCollectionsPublic` reads `GET /v1/featured-collections`
//      and returns the curated list + their ordered items.
//   2. Each collection renders its own header + grid; the grid shape
//      adapts to the item count so it always reads as a tidy grid:
//        - 1 item     → a single hero card spanning the full width
//        - 2–3 items  → bento (1 large + stacked right) — same shape
//          as the original Stitch design
//        - 4–6 items  → 2-up mobile / 3-up desktop grid
//        - 7+ items   → dense grid that scales the card size down so
//          all items stay readable without horizontal scroll
//   3. Each card is the shared `ProductCard`, with the projection
//      embedded in `FeaturedCollectionItem.product` mapped into
//      `ProductListItem` so the same Wishlist/Copy/Tag pills work.
//
// Empty state: when the admin hasn't published any collection yet
// (or the request is still in-flight and resolves to zero), we render
// a soft placeholder row that explains how to enable the section from
// the backoffice instead of leaving a blank gap.

/**
 * Re-use the shared projection from `@/features/featured-collections`
 * so the homepage bento and the `/promotions` page render the exact
 * same `ProductCard` shape (same image / tag / heart / copy
 * button / price layout).
 */

/**
 * Pick a Tailwind grid template class for the responsive layout that
 * matches the item count. The class set is intentionally narrow so
 * the design system can audit / override it later from one place.
 *
 * Hard cap: 5 columns max on desktop. Beyond that, the shared
 * `ProductCard` shrinks to a sliver (the copy/heart icon row stops
 * being tappable and the title clamps to a single character). We
 * keep the column count flat at 5 for 7+ items so every card stays
 * readable, accepting that longer collections will scroll vertically.
 */
function gridClassForCount(count: number): string {
  if (count <= 1) {
    return "grid-cols-1";
  }
  if (count <= 3) {
    // bento handled by the `BentoComposition` component instead.
    return "";
  }
  if (count <= 6) {
    return "grid-cols-2 md:grid-cols-3";
  }
  if (count <= 9) {
    return "grid-cols-2 md:grid-cols-4";
  }
  // 10+ items: cap at 5 columns on desktop so the ProductCard's
  // tag-pill + copy/heart row stays tappable and the title still
  // fits two readable lines.
  return "grid-cols-2 md:grid-cols-5";
}

/**
 * Render a single product card. Wraps the shared `ProductCard` so
 * the section file can swap the renderer later (e.g. for a custom
 * deal badge) without touching the layout code.
 */
function CollectionProductCard({
  item,
  priority,
}: {
  item: FeaturedCollectionItem;
  priority: boolean;
}) {
  return (
    <ProductCard
      product={featuredItemToListItem(item)}
      priority={priority}
    />
  );
}

/**
 * Editorial section header used by every featured-collection block
 * on the homepage (headline + subsequent). Composition:
 *
 *   • Eyebrow chip — rose-100 pill that surfaces the admin-curated
 *     collection *kind* (default: "Bộ sưu tập"). Mirrors the chip
 *     that sits on top of every banner slide in `BannerHero` so the
 *     homepage reads as one editorial system.
 *   • Headline — large `font-headline` with a subtle italic accent
 *     on the second segment of the title (split on " — "). Pulls the
 *     eye toward the descriptive half without breaking the canonical
 *     collection name.
 *   • Gradient underline — 64×2px rose-500 → transparent divider that
 *     anchors the title and adds a hint of color without competing
 *     with the headline typography.
 *   • Subtitle — slightly larger + zinc-500, capped at `max-w-2xl`
 *     so it never crowds the card grid below.
 *   • "Xem tất cả" CTA — outlined pill button with arrow that shifts
 *     right on hover. Renders only when the collection has items so
 *     the empty state stays calm.
 *
 * `variant="headline"` swaps the chip color and CTA into a filled
 * primary button so the first collection reads as the editorial
 * centerpiece, while subsequent collections stay light/outlined.
 */
function FeaturedCollectionHeader({
  eyebrow = "Bộ sưu tập",
  title,
  subtitle,
  ctaHref,
  ctaLabel = "Xem tất cả",
  showCta = true,
  variant = "subsequent",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  ctaHref?: string;
  ctaLabel?: string;
  showCta?: boolean;
  variant?: "headline" | "subsequent";
}) {
  const [lead, ...rest] = title.split(" — ");
  const accent = rest.join(" — ");
  const isHeadline = variant === "headline";

  return (
    <div
      className={[
        "flex flex-col gap-4 sm:gap-5",
        isHeadline
          ? "items-center text-center"
          : "items-start md:flex-row md:items-end md:justify-between",
      ].join(" ")}
    >
      <div
        className={[
          "flex flex-col gap-3 sm:gap-4",
          isHeadline ? "items-center" : "items-start",
        ].join(" ")}
      >
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] shadow-sm",
            isHeadline
              ? "bg-gradient-to-r from-primary to-rose-400 text-white"
              : "bg-rose-100 text-primary",
          ].join(" ")}
        >
          <span
            className={[
              "h-1.5 w-1.5 rounded-full",
              isHeadline ? "bg-white" : "bg-primary",
            ].join(" ")}
            aria-hidden
          />
          {eyebrow}
        </span>

        <h2
          className={[
            "font-headline font-bold leading-tight text-zinc-900",
            isHeadline
              ? "text-3xl sm:text-4xl md:text-5xl"
              : "text-2xl sm:text-3xl md:text-4xl",
          ].join(" ")}
        >
          <span>{lead}</span>
          {accent ? (
            <>
              {" "}
              <span className="block font-light italic text-zinc-500 sm:inline">
                — {accent}
              </span>
            </>
          ) : null}
        </h2>

        <span
          aria-hidden
          className={[
            "h-[2px] w-16 rounded-full bg-gradient-to-r from-primary to-transparent",
            isHeadline ? "" : "md:mx-0",
          ].join(" ")}
        />

        {subtitle ? (
          <p
            className={[
              "max-w-2xl font-body leading-relaxed text-zinc-500",
              isHeadline
                ? "text-base sm:text-lg"
                : "text-sm sm:text-base",
              isHeadline ? "" : "md:max-w-xl",
            ].join(" ")}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {showCta && ctaHref ? (
        <Link
          href={ctaHref}
          className={[
            "group inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200",
            isHeadline
              ? "bg-primary text-white shadow-lg shadow-rose-200/60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-200/80"
              : "border border-rose-200 bg-white text-primary hover:border-primary hover:bg-rose-50",
            isHeadline ? "" : "md:self-auto",
          ].join(" ")}
        >
          {ctaLabel}
          <ArrowForward
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Bento composition for 2–3 items: 1 large card on the left + the
 * remaining cards stacked on the right. Mirrors the original Stitch
 * reference at desktop sizes, but degrades to a single column on
 * mobile / tablet so all cards stay readable on small screens.
 */
function BentoComposition({ items }: { items: FeaturedCollectionItem[] }) {
  const lead = items[0];
  const rest = items.slice(1, 3);
  if (!lead) return null;
  return (
    /*
      Outer row mirrors the same `space-between` pattern as the bento
      above (`BentoMasonryCard`):
        • `md:items-start` so each card sits at its own natural
          height — `items-stretch` would stretch the lead card's
          `<Link>` to match the right column's taller height and
          leave an invisible clickable strip below the visible tile.
        • `md:justify-between` pins the lead card to the left edge
          and the right column to the right edge of the row, so the
          whole frame reads as one editorial block that lines up
          with the sections below (`BestSellers` / `PromiseStrip`).
        • `md:gap-10` (40px) gives the cards breathing room in the
          middle.
      Percentages come from the upper bento's `md:basis-[58%]` /
      `md:basis-[32%]` so the two bento sections stay visually
      consistent (lead card ~58% wide, right column ~32% wide,
      ~10% air in the middle). The outer `max-w-7xl` matches the
      frame used by the other homepage sections.
    */
    <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
      <div className="md:basis-[58%] md:min-w-0 md:shrink-0">
        <CollectionProductCard item={lead} priority />
      </div>
      {rest.length > 0 ? (
        <div className="grid flex-1 grid-cols-1 gap-4 sm:gap-5 md:basis-[32%] md:shrink-0 md:grid-cols-1 md:gap-5">
          {rest.map((it) => (
            <CollectionProductCard key={it.id} item={it} priority={false} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Render a single featured-collection section. Layout adapts to the
 * item count via `gridClassForCount` / `BentoComposition`; the header
 * is uniform so multiple sections read as one editorial block.
 */
function FeaturedCollectionSection({
  collection,
}: {
  collection: FeaturedCollectionPublic;
}) {
  const items = collection.items ?? [];
  const gridClass = gridClassForCount(items.length);
  const useBento = items.length >= 2 && items.length <= 3;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-6 md:py-16">
      <FeaturedCollectionHeader
        variant="subsequent"
        title={collection.title}
        subtitle={collection.subtitle}
        ctaHref={`/products?collection=${collection.slug}`}
        showCta={items.length > 0}
      />

      <div className="mt-6 sm:mt-8">
        {items.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-6 py-12 text-center text-sm text-zinc-500">
            Bộ sưu tập này chưa có sản phẩm. Hãy vào{" "}
            <Link
              href="/admin/featured-collections"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              trang quản trị
            </Link>{" "}
            để chọn sản phẩm.
          </div>
        ) : useBento ? (
          <BentoComposition items={items} />
        ) : (
          <div className={`grid gap-4 sm:gap-5 md:gap-6 ${gridClass}`}>
            {items.map((it, idx) => (
              <CollectionProductCard
                key={it.id}
                item={it}
                priority={idx < 4}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Top-level "Bộ sưu tập nổi bật" section. Reads the admin-curated
 * featured collections from the public endpoint and renders one
 * section per active collection. We expose the four canonical
 * states (loading / error / empty / ready) so the user can tell
 * the difference between "no collections yet" (admin-side action
 * needed) and "the server is having a moment" (transient).
 */
export function CollectionsBento() {
  const query = useFeaturedCollectionsPublic();

  if (query.isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-6 md:py-16">
        <div className="mb-8 h-10 w-64 animate-pulse rounded-full bg-rose-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-square animate-pulse rounded-2xl bg-rose-100"
            />
          ))}
        </div>
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-6 md:py-16">
        <ErrorState
          error={query.error}
          onRetry={() => query.refetch()}
          title="Không tải được bộ sưu tập"
        />
      </section>
    );
  }

  const collections = query.data ?? [];

  if (collections.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-6 md:py-16">
        <h2 className="mb-3 font-headline text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
          Bộ sưu tập nổi bật
        </h2>
        <EmptyState
          icon={Sparkles}
          title="Chưa có bộ sưu tập nổi bật"
          description={
            <>
              Bộ sưu tập nổi bật sẽ xuất hiện ở đây sau khi admin đăng
              một bộ sưu tập trong{" "}
              <Link
                href="/admin/featured-collections"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                trang quản trị
              </Link>
              .
            </>
          }
        />
      </section>
    );
  }

  // First (or only) collection drives the canonical "Bộ sưu tập nổi
  // bật" header / sub-header wording when at least one exists.
  const headerCollection =
    findFeaturedCollectionBySlug(collections, "noibat") ??
    collections[0]!;

  return (
    <div data-testid="featured-collections-root">
      {/*
        The first section uses the canonical "Bộ sưu tập nổi bật"
        title so the homepage anchor / SEO / visual hierarchy stays
        consistent with the original Stitch layout. Subsequent
        collections render under their own admin-given title inside
        `FeaturedCollectionSection`.

        Wrapped in a soft rose-gradient card so the bento below reads
        as an editorial centerpiece instead of floating on the bare
        page background. The card uses a subtle ring + shadow so it
        stays visually quiet — the actual focal point is the bento
        inside.
      */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 md:px-6 md:pt-16">
        <div className="overflow-hidden rounded-[2rem] border border-rose-100/80 bg-gradient-to-br from-white via-[#FFF6FA] to-[#FDE7F0] p-6 shadow-sm ring-1 ring-rose-100/40 sm:p-8 md:p-10">
          <FeaturedCollectionHeader
            variant="headline"
            eyebrow="Bộ sưu tập nổi bật"
            title={headerCollection!.title}
            subtitle={headerCollection!.subtitle}
            ctaHref={`/products?collection=${headerCollection!.slug}`}
            showCta={(headerCollection!.items ?? []).length > 0}
          />

          <div className="mt-8 sm:mt-10 md:mt-12">
            <FeaturedCollectionSectionBody collection={headerCollection!} />
          </div>
        </div>
      </section>

      {collections.slice(1).map((collection) => (
        <FeaturedCollectionSection
          key={collection.id}
          collection={collection}
        />
      ))}
    </div>
  );
}

/**
 * Body-only renderer for the headline collection. Shares the
 * layout helpers with `FeaturedCollectionSection` but lets the
 * parent control the surrounding header markup.
 */
function FeaturedCollectionSectionBody({
  collection,
}: {
  collection: FeaturedCollectionPublic;
}) {
  const items = collection.items ?? [];
  const gridClass = gridClassForCount(items.length);
  const useBento = items.length >= 2 && items.length <= 3;

  if (items.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-6 py-12 text-center text-sm text-zinc-500">
        Bộ sưu tập này chưa có sản phẩm.
      </div>
    );
  }

  if (useBento) {
    return <BentoComposition items={items} />;
  }

  return (
    <div className={`grid gap-4 sm:gap-5 md:gap-6 ${gridClass}`}>
      {items.map((it, idx) => (
        <CollectionProductCard key={it.id} item={it} priority={idx < 4} />
      ))}
    </div>
  );
}

// ---------- 3. Best Sellers --------------------------------------------

/**
 * `useBestSellers` — wrapped query that resolves the best-sellers
 * surface via the admin-curated featured collections (slug
 * `bestseller` is the canonical key; falls back to the first
 * available collection when admin hasn't named one explicitly
 * yet). The hook returns the raw `ProductListItem[]` so the page
 * can render empty / error / ready separately (see the
 * loading / error / empty / ready pattern from the previous
 * task).
 */
function useBestSellers() {
  const collectionsQuery = useFeaturedCollectionsPublic();
  const items = React.useMemo<ProductListItem[]>(() => {
    if (!collectionsQuery.data) return [];
    const collection =
      findFeaturedCollectionBySlug(collectionsQuery.data, "bestseller") ??
      collectionsQuery.data[0];
    return (collection?.items ?? []).map(featuredItemToListItem).slice(0, 4);
  }, [collectionsQuery.data]);

  return {
    items,
    isLoading: collectionsQuery.isLoading,
    isError: collectionsQuery.isError,
    error: collectionsQuery.error,
    refetch: collectionsQuery.refetch,
  };
}

export function BestSellers() {
  const query = useBestSellers();

  if (query.isLoading) {
    return (
      <section className="mx-auto my-12 max-w-7xl rounded-[2rem] border border-surface-border bg-white px-6 py-16 shadow-sm">
        <div className="mb-12 grid place-items-center text-center">
          <div className="mb-3 h-8 w-72 animate-pulse rounded-full bg-rose-100" />
          <div className="h-4 w-96 animate-pulse rounded-full bg-rose-100" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-square animate-pulse rounded-2xl bg-rose-100"
            />
          ))}
        </div>
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className="mx-auto my-12 max-w-7xl rounded-[2rem] border border-surface-border bg-white px-6 py-16 shadow-sm">
        <ErrorState
          error={query.error}
          onRetry={() => query.refetch()}
          title="Không tải được sản phẩm bán chạy"
        />
      </section>
    );
  }

  const items = query.items;

  if (items.length === 0) {
    return (
      <section className="mx-auto my-12 max-w-7xl rounded-[2rem] border border-surface-border bg-white px-6 py-16 shadow-sm">
        <EmptyState
          icon={PackageSearch}
          title="Chưa có sản phẩm bán chạy"
          description="Sản phẩm bán chạy sẽ xuất hiện ở đây sau khi admin đăng và cập nhật trong trang quản trị."
        />
      </section>
    );
  }

  return (
    <section className="mx-auto my-12 max-w-7xl rounded-[2rem] border border-surface-border bg-white px-6 py-16 shadow-sm">
      <div className="mb-12 text-center">
        <h2 className="mb-2 font-headline text-3xl font-bold text-zinc-900">
          Best seller — Còn hàng, được yêu thích nhất
        </h2>
        <p className="font-body text-zinc-500">Đã bán chạy nhất trong tháng qua</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, idx) => (
          <ProductCard
            key={item.id}
            product={item}
            tags={computeBestSellerTags(item)}
            priority={idx < 4}
          />
        ))}
      </div>
    </section>
  );
}

function computeBestSellerTags(item: ProductListItem): ProductCardTag[] | undefined {
  const tags: ProductCardTag[] = [];
  const createdAt = Date.parse(item.created_at);
  const isNew =
    Number.isFinite(createdAt) && Date.now() - createdAt < 30 * 24 * 60 * 60 * 1000;
  if (isNew) tags.push({ label: "Mới về", tone: "new" });
  if (item.compare_at && item.compare_at > item.price) {
    tags.push({ label: "Bán chạy", tone: "best" });
  }
  return tags.length > 0 ? tags : undefined;
}

// ---------- 4. Promise Strip -------------------------------------------

const PROMISE_ITEMS = [
  { icon: "verified", label: "Chính hãng 100%" },
  { icon: "support_agent", label: "Tư vấn 1:1" },
  { icon: "local_shipping", label: "Freeship toàn quốc" },
  { icon: "published_with_changes", label: "Đổi trả 7 ngày" },
];

export function PromiseStrip() {
  return (
    <section className="mx-auto my-8 max-w-7xl border-y border-rose-100 px-6 py-8">
      <div className="grid grid-cols-2 divide-x divide-rose-50 gap-6 text-center md:grid-cols-4">
        {PROMISE_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center p-4"
          >
            <span className="material-symbols-outlined mb-2 text-3xl text-primary">
              {item.icon}
            </span>
            <span className="text-sm font-medium text-zinc-800">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}