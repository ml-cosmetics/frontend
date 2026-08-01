"use client";

import * as React from "react";
import { Spark } from "@/components/layout/storefront-icons";
import { cn } from "@/lib/utils/cn";
import type { ReviewItem, ReviewStats } from "../types";

/**
 * ReviewsStitchView — Stitch layout for the `/reviews` page.
 *
 * Canvas: `Đánh giá - Aura Rose | ML Cosmetics`.
 *
 * Composition:
 *   1. Editorial hero with `spark` glyph + Playfair italic headline
 *      + total count badge.
 *   2. Simple masonry grid of review cards (no filter, no form, no
 *      pagination — matches the Stitch HTML "simplified for effort
 *      level 0.25" placeholder).
 */
export interface ReviewsStitchViewProps {
  stats: ReviewStats;
  items: ReviewItem[];
  className?: string;
}

export function ReviewsStitchView({ stats, items, className }: ReviewsStitchViewProps) {
  const visible = items.slice(0, 24);

  return (
    <div className={cn("space-y-10", className)}>
      {/* =========================== HERO =========================== */}
      <section className="text-center">
        <Spark
          size={36}
          filled
          className="mx-auto mb-4 text-4xl text-primary animate-pulse"
        />
        <h1 className="font-headline mb-4 text-4xl italic text-zinc-900 md:text-5xl lg:text-6xl">
          Khách hàng nói gì về ML Cosmetics
        </h1>
        <p className="font-medium text-lg text-zinc-600">
          {stats.total.toLocaleString("vi-VN")} đánh giá thật — không sửa, không lọc 💖
        </p>
      </section>

      {/* =========================== MASONRY GRID =========================== */}
      {visible.length === 0 ? (
        <div className="rounded-20px border border-rose-50 bg-white p-20 text-center">
          <p className="text-zinc-500 italic">
            Content simplified for effort level 0.25
          </p>
        </div>
      ) : (
        <div className="masonry-grid">
          {visible.map((review) => (
            <article
              key={review.id}
              className="masonry-item rounded-xl border border-rose-50 bg-white p-5 shadow-sm"
            >
              <ReviewMiniCard review={review} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

ReviewsStitchView.displayName = "ReviewsStitchView";

function ReviewMiniCard({ review }: { review: ReviewItem }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span className="font-body font-medium text-zinc-700">
          {review.author}
        </span>
        <StarsRow value={review.rating} />
      </div>
      <h3 className="font-headline text-base font-semibold italic text-zinc-900">
        {review.title}
      </h3>
      <p className="font-body text-sm leading-relaxed text-zinc-600">
        {review.body}
      </p>
    </div>
  );
}

ReviewMiniCard.displayName = "ReviewMiniCard";

function StarsRow({ value }: { value: number }) {
  return (
    <span className="inline-flex space-x-0.5 text-yellow-400">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {i < value ? "star" : "star"}
        </span>
      ))}
    </span>
  );
}

StarsRow.displayName = "StarsRow";