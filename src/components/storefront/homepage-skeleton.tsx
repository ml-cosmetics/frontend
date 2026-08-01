import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * HomepageSkeleton — Stitch loading state for the public homepage.
 *
 * Mirrors the canonical Stitch HTML 1:1 (canvas
 * `ML Cosmetics Aura Rose - Skeleton Loading`):
 *   1. Hero card with rotated badge + 2 title bars + 2 button bars
 *   2. Section header (eyebrow + title)
 *   3. 4×2 product grid (mobile stacks to 1 column)
 *   4. Best-seller section header
 *   5. Features row (3 upsell icons inside a frosted card)
 *   6. Reviews row (3 review cards)
 *
 * The skeleton pulses between the Aura Rose rose-50 (`#FBCFE8`) and
 * rose-100 (`#FCE7F3`) tokens via the `aura-skeleton` keyframe defined
 * inline below — no Tailwind extension required.
 */
export interface HomepageSkeletonProps {
  className?: string;
}

export function HomepageSkeleton({ className }: HomepageSkeletonProps) {
  return (
    <div
      className={cn(
        "aura-skeleton mx-auto max-w-7xl space-y-24 px-6 py-12",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Đang tải trang chủ"
    >
      {/* =========================== HERO =========================== */}
      <section
        className={cn(
          "relative flex h-[614px] flex-col justify-center items-start p-12 lg:p-24",
          "overflow-hidden rounded-[20px] bg-rose-200 md:h-[716px]",
        )}
      >
        <div className="mb-6 h-6 w-32 rounded-full bg-white/50" />
        <div className="mb-4 h-16 w-3/4 rounded-[20px] bg-white/40 md:w-1/2" />
        <div className="mb-8 h-16 w-2/3 rounded-[20px] bg-white/40 md:w-1/3" />
        <div className="flex gap-4">
          <div className="h-12 w-40 rounded-[20px] bg-white/60" />
          <div className="h-12 w-40 rounded-[20px] bg-white/40" />
        </div>
      </section>

      {/* =========================== SECTION HEADER 1 =========================== */}
      <section className="mx-auto space-y-4 text-center">
        <div className="mx-auto h-4 w-24 rounded-full bg-rose-200" />
        <div className="mx-auto h-10 w-64 rounded-full bg-rose-200" />
      </section>

      {/* =========================== PRODUCT GRID 4×2 =========================== */}
      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <SkeletonProductCard key={idx} hiddenOnMobile={idx >= 4} />
        ))}
      </section>

      {/* =========================== BEST SELLER HEADER =========================== */}
      <section className="space-y-4 pt-12 text-center">
        <div className="mx-auto h-4 w-32 rounded-full bg-rose-200" />
        <div className="mx-auto h-10 w-72 rounded-full bg-rose-200" />
      </section>

      {/* =========================== FEATURES ROW =========================== */}
      <section
        className={cn(
          "grid grid-cols-1 gap-12 rounded-[20px] border border-rose-50 bg-white/50 p-12 backdrop-blur-sm md:grid-cols-3",
        )}
      >
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="relative flex flex-col items-center space-y-4 text-center">
            <div className="absolute -right-4 -top-4 h-6 w-6 rounded-full bg-rose-200 opacity-50" />
            <div className="h-20 w-20 rounded-full bg-rose-200" />
            <div className="h-6 w-40 rounded-full bg-rose-200" />
            <div className="h-4 w-full rounded-full bg-rose-200" />
          </div>
        ))}
      </section>

      {/* =========================== REVIEWS ROW =========================== */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="space-y-6 rounded-[20px] border border-rose-50 bg-white p-8 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-rose-200" />
              <div className="h-4 w-24 rounded-full bg-rose-200" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-full rounded-full bg-rose-200" />
              <div className="h-3 w-full rounded-full bg-rose-200" />
              <div className="h-3 w-2/3 rounded-full bg-rose-200" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

HomepageSkeleton.displayName = "HomepageSkeleton";

/* ----------------------------------------------------------------------- */

interface SkeletonProductCardProps {
  hiddenOnMobile?: boolean;
}

function SkeletonProductCard({ hiddenOnMobile }: SkeletonProductCardProps) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-[20px] border border-rose-50 bg-white p-4 shadow-sm",
        hiddenOnMobile && "hidden md:block",
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-rose-200">
        <div className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/60" />
      </div>
      <div className="h-4 w-3/4 rounded-full bg-rose-200" />
      <div className="h-4 w-1/2 rounded-full bg-rose-200" />
    </div>
  );
}

SkeletonProductCard.displayName = "SkeletonProductCard";