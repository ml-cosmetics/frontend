"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, resolveImageUrl } from "@/lib/utils";
import type { BannerPublic } from "@/types";

/**
 * Public storefront banner slider.
 *
 * Behaviour:
 *  - Auto-rotate every `intervalMs` (default 5 000 ms); pauses while
 *    the user hovers / focuses inside.
 *  - Manual next / previous chevrons appear on hover for desktop.
 *  - Indicator dots map 1:1 to slides; direct jump supported.
 *  - Renders nothing but an `EmptyState` placeholder if the API
 *    returns zero banners.
 *  - The first banner is rendered eagerly for LCP; the rest are
 *    visual-hidden off-screen to keep the DOM light.
 */
export interface BannerSliderProps {
  banners: BannerPublic[];
  intervalMs?: number;
  className?: string;
}

export function BannerSlider({ banners, intervalMs = 5_000, className }: BannerSliderProps) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const total = banners.length;

  const advance = React.useCallback(
    (step: number) => {
      if (total <= 1) return;
      setIndex((prev) => (prev + step + total) % total);
    },
    [total],
  );

  const goTo = React.useCallback((next: number) => {
    if (total <= 1) return;
    setIndex(((next % total) + total) % total);
  }, [total]);

  React.useEffect(() => {
    if (total <= 1 || paused) return;
    const id = window.setInterval(() => advance(1), intervalMs);
    return () => window.clearInterval(id);
  }, [advance, intervalMs, paused, total]);

  if (total === 0) return null;

  return (
    <section
      ref={containerRef}
      className={cn("group relative w-full overflow-hidden", className)}
      aria-roledescription="carousel"
      aria-label="Banner khuyến mãi"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative aspect-[16/7] w-full sm:aspect-[16/6] md:aspect-[16/5]">
        {banners.map((banner, i) => {
          const isActive = i === index;
          const inner = (
            <div
              key={banner.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${total}`}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity duration-500 ease-out",
                isActive ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {banner.image_url ? (
                <Image
                  src={resolveImageUrl(banner.image_url)}
                  alt={banner.title || "Banner"}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-surface-container-high text-muted-foreground">
                  {banner.title}
                </div>
              )}

              {(banner.title || banner.subtitle) && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 via-black/15 to-transparent">
                  <div className="mx-auto w-full max-w-[1280px] px-4 pb-12 md:px-8 md:pb-16 lg:px-16 lg:pb-20">
                    <div className="max-w-xl space-y-2 text-white">
                      {banner.subtitle && (
                        <p className="text-[12px] font-semibold uppercase tracking-[0.05em] opacity-90">
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.title && (
                        <h2 className="text-[32px] font-bold leading-[1.1] tracking-tight md:text-[56px]">
                          {banner.title}
                        </h2>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );

          if (banner.link) {
            return (
              <Link key={banner.id} href={banner.link} className="block h-full w-full">
                {inner}
              </Link>
            );
          }
          return inner;
        })}

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Banner trước"
              onClick={() => advance(-1)}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/85 p-2 text-foreground shadow-sm backdrop-blur transition-opacity hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:flex md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Banner sau"
              onClick={() => advance(1)}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/85 p-2 text-foreground shadow-sm backdrop-blur transition-opacity hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:flex md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur"
          role="tablist"
          aria-label="Chọn banner"
        >
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Chuyển đến banner ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                i === index ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
