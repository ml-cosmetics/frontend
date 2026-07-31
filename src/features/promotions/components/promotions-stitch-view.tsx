"use client";

import * as React from "react";
import Link from "next/link";
import {
  AutoAwesome,
  Chat,
  FeaturedSeasonalAndGifts,
} from "@/components/layout/storefront-icons";
import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Body } from "@/components/ui/typography";
import {
  ProductCard,
  type ProductCardTag,
} from "@/components/storefront/product-card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import {
  featuredItemToListItem,
  findFeaturedCollectionBySlug,
  useFeaturedCollectionsPublic,
} from "@/features/featured-collections";
import type { PromotionsContentPayload } from "@/features/promotions/types";
import type { ProductListItem } from "@/types";

/**
 * PromotionsStitchView — Stitch layout for the `/promotions` page.
 *
 * Canvas: `Khuyến mãi - ML Cosmetics`.
 *
 * Composition:
 *   1. Breadcrumb (Trang chủ → Khuyến mãi).
 *   2. Page header — italic Playfair headline + subline + description.
 *   3. Hero promo banner — gradient pink, "Mùa Lễ Hè 2026" chip,
 *      big italic title, countdown timer (Days / Hours / Minutes /
 *      Seconds), two pill buttons, floating "Quà tặng" badge.
 *   4. Product grid — 4 cards with discount % badge, favorite overlay,
 *      name, price, contact button.
 *
 * Source of truth for the grid (khác với task trước: trước đây dùng
 * `FALLBACK_PRODUCTS` cứng):
 *   • The storefront hits `GET /v1/featured-collections` and looks
 *     up the admin-curated collection with slug `khuyen-mai`. The
 *     admin curates this list in the backoffice (same UX as the
 *     "Bộ sưu tập nổi bật" picker on the homepage), so what the
 *     user sees on this page matches what the operator picked —
 *     never fabricated fictional products.
 *   • When the collection is empty or the API errors, we render
 *     the canonical `EmptyState` / `ErrorState` (with retry) so a
 *     transient outage or a missed config step is visible to the
 *     operator, not silently masked by placeholder content.
 *
 * Source of truth for the hero (countdown + season chip):
 *   • These are pure design-intent copy (Stitch canvas). They don't
 *     depend on any backend endpoint so we keep them as static
 *     constants — they would only become a "fake fallback" if they
 *     were pretending to fetch live data.
 */
export interface PromotionsStitchViewProps {
  intro: PromotionsContentPayload["intro"];
  className?: string;
}

const DEFAULT_INTRO_TITLE = "Ưu đãi đang diễn ra";
const DEFAULT_SUBTITLE = "Ưu đãi ngọt ngào";
const DEFAULT_SEASON = "Mùa Lễ Hè 2026";

/**
 * The canonical slug the admin should use when creating a
 * featured collection meant to power the `/promotions` page.
 * Surface it in the empty-state hint so the operator knows where
 * to wire the grid up.
 */
const PROMOTIONS_COLLECTION_SLUG = "khuyen-mai";

export function PromotionsStitchView({
  intro,
  className,
}: PromotionsStitchViewProps) {
  const headline = intro?.title?.trim() || DEFAULT_INTRO_TITLE;
  const subtitle = intro?.subtitle?.trim() || DEFAULT_SUBTITLE;

  const collectionsQuery = useFeaturedCollectionsPublic();
  const collection = collectionsQuery.data
    ? findFeaturedCollectionBySlug(
        collectionsQuery.data,
        PROMOTIONS_COLLECTION_SLUG,
      )
    : undefined;

  return (
    <main className={cn("min-h-screen pb-20", className)}>
      {/* =========================== BREADCRUMB =========================== */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <nav
          aria-label="Breadcrumb"
          className="flex text-sm font-medium text-primary/70"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="inline-flex items-center transition-colors hover:text-primary"
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined mx-1 text-sm">
                  chevron_right
                </span>
                <span
                  aria-current="page"
                  className="font-semibold text-primary"
                >
                  Khuyến mãi
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* =========================== PAGE HEADER =========================== */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-8 text-center">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent blur-xl"
        />
        <h1 className="mb-4 font-display text-4xl italic font-bold tracking-tight text-zinc-900 drop-shadow-sm md:text-5xl lg:text-6xl">
          {headline}
          <span className="font-body mt-2 block text-2xl font-normal italic text-primary md:text-3xl">
            — Chỉ trong mùa lễ 2026 —
          </span>
        </h1>
        <Body className="mx-auto mt-4 max-w-2xl text-zinc-600">
          {subtitle}
        </Body>
      </section>

      {/* =========================== HERO PROMO BANNER =========================== */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <HeroPromoBanner />
      </section>

      {/* =========================== PRODUCT GRID =========================== */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-3xl italic font-bold text-zinc-900">
            Khám phá thêm
          </h2>
          <Link
            href="/products"
            className="group flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Xem tất cả
            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </Link>
        </div>

        {collectionsQuery.isLoading ? (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                aria-hidden
                className="aspect-square animate-pulse rounded-2xl bg-rose-100"
              />
            ))}
          </div>
        ) : collectionsQuery.isError ? (
          <ErrorState
            error={collectionsQuery.error}
            onRetry={() => collectionsQuery.refetch()}
            title="Không tải được danh sách khuyến mãi"
          />
        ) : !collection ? (
          <EmptyState
            icon={PackageSearch}
            title="Chưa có sản phẩm khuyến mãi"
            description={
              <>
                Vào{" "}
                <Link
                  href="/admin/featured-collections/new"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  trang quản trị
                </Link>{" "}
                và tạo một bộ sưu tập có slug{" "}
                <code className="rounded bg-rose-100 px-1.5 py-0.5 font-mono text-[12px] text-primary">
                  {PROMOTIONS_COLLECTION_SLUG}
                </code>{" "}
                để hiển thị danh sách sản phẩm ở đây.
              </>
            }
          />
        ) : collection.items.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Bộ sưu tập khuyến mãi chưa có sản phẩm"
            description="Thêm sản phẩm vào bộ sưu tập trong trang quản trị để hiển thị ở đây."
          />
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {collection.items.map((item) => (
              <PromoCardWithContact
                key={item.id}
                product={featuredItemToListItem(item)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

PromotionsStitchView.displayName = "PromotionsStitchView";

/* ----------------------------------------------------------------------- *
 * Promo card wrapper — reuses the shared `ProductCard` for every promo
 * item so the storefront stays consistent (same image / tag / title /
 * price / heart / copy button), and appends the promo-only "Liên hệ tư
 * vấn" footer button below the card.
 * ----------------------------------------------------------------------- */

function buildPromoTag(product: ProductListItem): ProductCardTag | undefined {
  const hasDiscount =
    typeof product.compare_at === "number" &&
    product.compare_at !== null &&
    product.compare_at > product.price;
  if (hasDiscount) {
    const pct = Math.round(
      (1 - product.price / (product.compare_at as number)) * 100,
    );
    return { label: `-${pct}%`, tone: "sale" };
  }
  return { label: "MỚI", tone: "new" };
}

function PromoCardWithContact({ product }: { product: ProductListItem }) {
  const tag = buildPromoTag(product);
  return (
    // `h-full` + grid `items-stretch` (see above) keeps the wrapper
    // cards the same height as the tallest sibling in the row, so the
    // "Liên hệ tư vấn" button below stays aligned in a single row
    // even when product titles wrap to a second line.
    <div className="flex h-full flex-col gap-3">
      {/* `flex-1` lets the ProductCard absorb whatever vertical space
          the wrapper has, so cards in the same row grow together. */}
      <ProductCard
        product={product}
        tags={tag ? [tag] : undefined}
        className="flex-1"
      />
      <Link
        href="/contact"
        onClick={(event) => event.stopPropagation()}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
      >
        <Chat size={16} />
        Liên hệ tư vấn
      </Link>
    </div>
  );
}

PromoCardWithContact.displayName = "PromoCardWithContact";

/* ----------------------------------------------------------------------- *
 * Hero Promo Banner
 * ----------------------------------------------------------------------- */

function HeroPromoBanner() {
  const [countdown, setCountdown] = React.useState({
    days: 7,
    hours: 14,
    minutes: 32,
    seconds: 18,
  });

  React.useEffect(() => {
    // Anchor the countdown to a fixed future date so the SSR + first
    // client render match (avoids hydration mismatch). The countdown
    // ticks every second after mount.
    const target = new Date();
    target.setDate(target.getDate() + 7);
    target.setHours(23, 59, 59, 0);

    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const seconds = Math.floor(diff / 1000) % 60;
      const minutes = Math.floor(diff / (1000 * 60)) % 60;
      const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      setCountdown({ days, hours, minutes, seconds });
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#E11D74] via-[#FF6B8B] to-[#FF8A8A] shadow-2xl">
      <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/2 rounded-full bg-black/5 blur-2xl" />
      <div className="relative z-10 grid grid-cols-1 items-center gap-12 p-10 lg:grid-cols-2 lg:p-16">
        <div className="space-y-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-wider shadow-inner backdrop-blur-md">
            <AutoAwesome size={16} filled className="animate-pulse text-base" />
            {DEFAULT_SEASON}
          </div>
          <h2 className="font-display text-4xl italic font-bold leading-tight lg:text-5xl">
            Giảm đến 25% ngọc Jadeite
            <br />
            <span className="font-normal text-white/90">
              + Tặng kèm hộp quà cao cấp
            </span>
          </h2>
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-widest text-white/80">
              Thời gian còn lại
            </p>
            <div className="flex gap-3">
              <CountdownCell value={countdown.days} label="Ngày" />
              <CountdownSeparator />
              <CountdownCell value={countdown.hours} label="Giờ" />
              <CountdownSeparator />
              <CountdownCell value={countdown.minutes} label="Phút" />
              <CountdownSeparator />
              <CountdownCell value={countdown.seconds} label="Giây" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button className="rounded-full bg-white px-8 py-4 font-semibold text-primary hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95">
              <Chat size={18} />
              Tư vấn ngay qua Zalo
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-2 border-white/50 bg-transparent px-8 py-4 font-semibold text-white hover:border-white hover:bg-white/10 active:scale-95"
            >
              Xem chi tiết
            </Button>
          </div>
        </div>
        <div className="relative flex min-h-[400px] items-center justify-center lg:h-full">
          <div className="absolute inset-0 animate-pulse-slow rounded-full bg-white/20 opacity-60 blur-[80px] mix-blend-overlay" />
          <div className="absolute -top-4 -right-4 z-20 flex rotate-12 animate-float items-center gap-1 rounded-full border-2 border-primary/20 bg-white px-4 py-2 font-bold text-primary shadow-xl md:top-10 md:right-10">
            <FeaturedSeasonalAndGifts size={14} filled className="text-sm" />
            Quà tặng
          </div>
          <div className="relative z-10 flex h-72 w-72 items-center justify-center rounded-[2rem] bg-white/20 backdrop-blur-md md:h-96 md:w-96">
            <FeaturedSeasonalAndGifts
              size={80}
              className="text-white/70"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

HeroPromoBanner.displayName = "HeroPromoBanner";

function CountdownCell({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="flex h-20 w-16 flex-col items-center justify-center rounded-[1rem] border border-white/30 bg-white/20 shadow-lg backdrop-blur-sm">
      <span className="text-2xl font-bold">{String(value).padStart(2, "0")}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
}

CountdownCell.displayName = "CountdownCell";

function CountdownSeparator() {
  return (
    <span className="font-display text-2xl font-bold opacity-50">:</span>
  );
}

CountdownSeparator.displayName = "CountdownSeparator";
