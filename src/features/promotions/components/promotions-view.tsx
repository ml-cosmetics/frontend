"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PromotionItem, PromotionStatus } from "../types";
import { statusForPromotion } from "../types";

/**
 * Public Promotions view — the canonical Stitch layout
 * (`b406a95fdd7c44d7b898a3680eba06ae`).
 *
 * Composition:
 *   1. Editorial hero — eyebrow + headline + subtitle + a status
 *      legend.
 *   2. Hero card pair — two large promotional cards with tone-tinted
 *      backgrounds, "live" badge, optional countdown chip.
 *   3. Promo grid — smaller cards (2 cols tablet / 3 cols desktop).
 *
 * The "live" / "upcoming" / "ended" status is derived from
 * `startsAt` / `endsAt`. Each card stays linked to its `href` from
 * the canonical mapping so the destination is admin-controlled.
 */
export interface PromotionsViewProps {
  hero: PromotionItem[];
  cards: PromotionItem[];
  className?: string;
}

export function PromotionsView({ hero, cards, className }: PromotionsViewProps) {
  return (
    <div className={cn("space-y-10", className)}>
      {hero.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {hero.slice(0, 2).map((item) => (
            <HeroCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {cards.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((item) => (
            <PromoCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

PromotionsView.displayName = "PromotionsView";

/* ========================================================================== *
 * Hero card                                                                  *
 * ========================================================================== */

const TONE_CLASSES: Record<1 | 2 | 3 | 4, string> = {
  1: "from-rose-100 via-rose-50 to-surface text-rose-900",
  2: "from-amber-100 via-amber-50 to-surface text-amber-900",
  3: "from-violet-100 via-violet-50 to-surface text-violet-900",
  4: "from-emerald-100 via-emerald-50 to-surface text-emerald-900",
};

const STATUS_LABELS: Record<PromotionStatus, string> = {
  live: "Đang diễn ra",
  upcoming: "Sắp diễn ra",
  ended: "Đã kết thúc",
};

const STATUS_CLASSES: Record<PromotionStatus, string> = {
  live: "bg-primary text-primary-foreground",
  upcoming: "bg-amber-500 text-white",
  ended: "bg-muted text-muted-foreground",
};

function HeroCard({ item }: { item: PromotionItem }) {
  const status = statusForPromotion(item);
  const tone = TONE_CLASSES[item.tone ?? 1];
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-hairline bg-gradient-to-br p-6 md:p-10 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        tone,
      )}
    >
      <Link
        href={item.href}
        aria-label={item.title}
        className="absolute inset-0 z-0 focus-visible:outline-none"
      >
        <span className="sr-only">{item.title}</span>
      </Link>
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {item.eyebrow}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold",
              STATUS_CLASSES[status],
            )}
          >
            {STATUS_LABELS[status]}
          </span>
          {item.badge && (
            <span className="inline-flex items-center rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-background">
              {item.badge}
            </span>
          )}
        </div>

        <h2 className="text-balance text-[24px] font-bold leading-[1.2] md:text-[32px]">
          {item.title}
        </h2>

        {item.description && (
          <p className="max-w-md text-[15px] leading-[1.6] opacity-80">{item.description}</p>
        )}

        {status === "live" && mounted && (
          <Countdown endsAt={item.endsAt} />
        )}

        <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-[14px] font-medium text-background transition-colors group-hover:bg-foreground/90">
          Khám phá ngay
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function Countdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) return null;

  const end = new Date(endsAt).getTime();
  const diff = Math.max(0, end - now);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (diff <= 0) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[12px] font-medium text-foreground backdrop-blur">
      <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      <span suppressHydrationWarning>
        Còn {String(hours).padStart(2, "0")}:
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </span>
    </span>
  );
}

/* ========================================================================== *
 * Standard promo card                                                        *
 * ========================================================================== */

function PromoCard({ item }: { item: PromotionItem }) {
  const status = statusForPromotion(item);
  const tone = TONE_CLASSES[item.tone ?? 1];

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-hairline bg-gradient-to-br p-5 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:p-6",
        tone,
      )}
    >
      <Link
        href={item.href}
        aria-label={item.title}
        className="absolute inset-0 z-0 focus-visible:outline-none"
      >
        <span className="sr-only">{item.title}</span>
      </Link>
      <div className="relative z-10 flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-foreground backdrop-blur">
            {item.eyebrow}
          </span>
          {item.badge && (
            <span className="inline-flex items-center rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-background">
              {item.badge}
            </span>
          )}
        </div>
        <h3 className="text-[18px] font-semibold leading-[1.3]">{item.title}</h3>
        {item.description && (
          <p className="text-[14px] leading-[1.6] opacity-80">{item.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
              STATUS_CLASSES[status],
            )}
          >
            {STATUS_LABELS[status]}
          </span>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold">
            Xem chi tiết
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
}