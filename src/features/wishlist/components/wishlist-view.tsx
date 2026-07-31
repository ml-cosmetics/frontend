"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Share2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/common/empty-state";
import { useWishlist } from "../hooks/use-wishlist";
import { cn, formatVND } from "@/lib/utils";
import type { ProductListItem } from "@/types";
import type { WishlistItem } from "../types";

/**
 * Public Wishlist view.
 *
 * Composition (top → bottom):
 *   1. Editorial hero with share buttons and a small summary card.
 *   2. Sort + clear-all toolbar.
 *   3. Saved items rendered with the shared `ProductCard` in a
 *      4-up grid on desktop (xl breakpoint) — the exact same card
 *      used on `/products`, search, promotions and the homepage,
 *      with no prop overrides, so layout, tag pills, discount tag,
 *      heart toggle and copy-link button stay visually identical
 *      across the storefront. Removing an item happens by tapping
 *      the heart (same toggle as everywhere else). The shared
 *      `ProductCard` is the single source of truth.
 *   4. Empty state when the user has no saved items.
 *   5. "Sản phẩm nổi bật" recommendation strip in the same
 *      4-up grid so the page reads as one editorial system.
 */
export interface WishlistViewProps {
  recommendations: ProductListItem[];
  className?: string;
}

export function WishlistView({ recommendations, className }: WishlistViewProps) {
  const wishlist = useWishlist();
  const [shareMessage, setShareMessage] = React.useState<string | null>(null);

  const sortedItems = React.useMemo(() => {
    return [...wishlist.items].sort((a, b) =>
      a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0,
    );
  }, [wishlist.items]);

  const handleShare = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Wishlist của tôi",
          text: "Cùng xem những sản phẩm Aura Vénus tôi đang theo dõi.",
          url,
        });
        setShareMessage("Đã chia sẻ wishlist.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareMessage("Đã sao chép liên kết vào clipboard.");
      } else {
        setShareMessage("Trình duyệt không hỗ trợ chia sẻ tự động.");
      }
    } catch {
      setShareMessage("Không thể chia sẻ — vui lòng thử lại.");
    }
  }, []);

  React.useEffect(() => {
    if (!shareMessage) return;
    const id = window.setTimeout(() => setShareMessage(null), 2500);
    return () => window.clearTimeout(id);
  }, [shareMessage]);

  return (
    <div className={cn("space-y-10", className)}>
      {/* =========================== HERO =========================== */}
      <Section
        tone="default"
        spacing="lg"
        containerSize="2xl"
        className="pb-8 md:pb-10"
      >
        <Container size="2xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">
                <Heart className="h-3.5 w-3.5 fill-primary" aria-hidden="true" />
                Wishlist của tôi
              </span>
              <h1 className="text-balance text-[40px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground md:text-[56px]">
                Những món quà bạn đang nâng niu
              </h1>
              <p className="max-w-2xl text-[16px] leading-[1.6] text-muted-foreground">
                Danh sách các sản phẩm Aura Vénus bạn đang theo dõi — mỗi món đều được
                ML Cosmetics tuyển chọn cẩn thận.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleShare} variant="outline">
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Chia sẻ wishlist
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/products">
                    Khám phá thêm
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              {shareMessage && (
                <p
                  role="status"
                  aria-live="polite"
                  className="text-[13px] font-medium text-primary"
                >
                  {shareMessage}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-xl border border-hairline bg-card p-5 text-center shadow-sm">
              <SummaryStat label="Đã lưu" value={wishlist.count} />
              <SummaryStat
                label="Tổng giá trị"
                value={formatVND(
                  wishlist.items.reduce((sum, item) => sum + (item.price ?? 0), 0),
                )}
                small
              />
              <SummaryStat
                label="Đang giảm"
                value={wishlist.items.filter(
                  (item) =>
                    typeof item.compareAt === "number" &&
                    item.compareAt !== null &&
                    item.compareAt > item.price,
                ).length}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* =========================== TOOLBAR + GRID =========================== */}
      <Section
        tone="default"
        spacing="xl"
        containerSize="2xl"
        className="pt-0 pb-20 md:pt-2 md:pb-24"
      >
        <Container size="2xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-card p-4 shadow-sm md:p-6">
            <p className="text-[14px] text-muted-foreground">
              {wishlist.count === 0
                ? "Bạn chưa lưu sản phẩm nào."
                : `${wishlist.count} sản phẩm đã lưu — sắp xếp theo thời gian thêm gần nhất.`}
            </p>
            {wishlist.count > 0 && (
              <Button variant="outline" size="sm" onClick={wishlist.clear}>
                Xóa tất cả
              </Button>
            )}
          </div>

          {!wishlist.isHydrated ? (
            <GridSkeleton />
          ) : sortedItems.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Wishlist của bạn đang trống"
              description="Lưu lại những sản phẩm bạn yêu thích để dễ dàng quay lại sau."
              action={
                <Button asChild>
                  <Link href="/products">
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    Khám phá sản phẩm
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedItems.map((item, idx) => (
                <ProductCard
                  key={item.id}
                  product={wishlistItemToProduct(item)}
                  aspect="square"
                  priority={idx < 4}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* =========================== RECOMMENDATIONS =========================== */}
      {recommendations.length > 0 && (
        <Section tone="muted" spacing="lg" containerSize="2xl">
          <Container size="2xl">
            <div className="mb-8 flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">
                Sản phẩm nổi bật
              </span>
              <h2 className="text-[24px] font-semibold leading-[1.3] text-foreground md:text-[28px]">
                Bạn có thể cũng sẽ yêu thích
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recommendations.slice(0, 4).map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  aspect="square"
                  priority={idx < 4}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </div>
  );
}

WishlistView.displayName = "WishlistView";

/* ========================================================================== *
 * Helpers                                                                    *
 * ========================================================================== */

function SummaryStat({
  label,
  value,
  small,
}: {
  label: string;
  value: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className={cn("font-semibold leading-tight text-foreground", small ? "text-[14px]" : "text-[20px]")}>
        {value}
      </p>
      <p className="text-[12px] uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/** 4-up grid skeleton that mirrors the saved-items layout. */
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          aria-hidden="true"
          className="aspect-square animate-pulse rounded-2xl border border-hairline bg-surface-container-low"
        />
      ))}
    </div>
  );
}

/**
 * Map a `WishlistItem` to the `ProductListItem` shape the shared
 * `ProductCard` consumes. Identical to the homepage adapter — keeps
 * the wishlist page in lockstep with the editorial layout.
 */
function wishlistItemToProduct(item: WishlistItem): ProductListItem {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    compare_at: item.compareAt ?? null,
    thumbnail_url: item.thumbnailUrl,
    description: "",
    status: "active",
    created_at: "",
    updated_at: "",
  };
}