"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ImageOff } from "lucide-react";
import { cn, resolveImageUrl } from "@/lib/utils";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useQueryStateParts } from "@/components/common/query-state-view";
import { usePublicBanners } from "@/features/banners/hooks";
import type { BannerPublic } from "@/types";

/**
 * Public storefront hero — powered by the admin-curated banner
 * slider (`GET /v1/banners`).
 *
 * Design intent:
 *   • Editorial hero frame, not a one-shot image. Each banner slide
 *     carries its own artwork + headline + CTA coming from the
 *     backoffice, so a new campaign can ship without code changes.
 *   • Copy block lives in a soft glass panel pinned bottom-left on
 *     desktop (so the slider's artwork stays the focal point),
 *     centred on mobile.
 *   • `< . . . >` pagination bar — arrow + filled dots + arrow,
 *     permanently visible at the bottom of the hero. Aesthetic
 *     matches the admin's `BannerSliderEditor` for a unified feel.
 *   • The eyebrow chip, gradient underline, and primary CTA inherit
 *     the Aura Rose palette (rose-100 chip, rose-500 underline,
 *     primary-filled pill) so the section still reads as part of
 *     the storefront even though the imagery is dynamic.
 *   • Error / empty contracts (previously hardcoded fallback):
 *     the homepage used to silently drop in a `FALLBACK_SLIDE` when
 *     the API returned `[]` OR errored, which masked outages. We
 *     now render the canonical `ErrorState` / `EmptyState` so the
 *     user can tell the difference between "no banners yet" and
 *     "the server is having a moment".
 */

interface BannerHeroProps {
  className?: string;
  intervalMs?: number;
}

export function BannerHero({ className, intervalMs = 5_000 }: BannerHeroProps) {
  const query = usePublicBanners();
  const state = useQueryStateParts(query);

  // Loading: render a soft pastel placeholder so the layout
  // doesn't reflow when the data arrives. We deliberately do NOT
  // show fake content — the user's first impression must match
  // the layout they'll see after data loads.
  if (state.isLoading) {
    return (
      <section
        className={cn(
          "grid w-full place-items-center bg-gradient-to-br from-rose-100 via-rose-50 to-white",
          className,
        )}
        aria-hidden
      >
        <div className="grid h-72 w-full max-w-7xl place-items-center text-rose-300">
          <ArrowRight className="h-10 w-10 animate-pulse" />
        </div>
      </section>
    );
  }

  if (state.isError) {
    return (
      <section className={cn("w-full px-4 py-12", className)}>
        <ErrorState
          error={state.error}
          onRetry={() => query.refetch()}
          title="Không tải được banner"
        />
      </section>
    );
  }

  // Items can still be empty after filter — a banner without an
  // image_url is silently dropped, so an empty `[]` here means the
  // admin hasn't published anything yet. We surface that as an
  // `EmptyState` rather than rendering a fake slide.
  const banners = state.data.filter((b) => Boolean(b.image_url));

  if (banners.length === 0) {
    return (
      <section className={cn("w-full px-4 py-16", className)}>
        <EmptyState
          icon={ImageOff}
          title="Chưa có banner nổi bật"
          description="Admin có thể tạo banner mới trong trang quản trị để hiển thị ở đây."
        />
      </section>
    );
  }

  // From here on, `banners.length >= 1` — delegate to the inner
  // renderer that owns the slider-only hooks (useState/useCallback
  // for the rotation logic). Splitting the component this way lets
  // the public-facing `BannerHero` keep the four canonical
  // states (loading / error / empty / ready) as plain early
  // returns without breaking the Rules of Hooks.
  return (
    <BannerCarousel
      className={className}
      intervalMs={intervalMs}
      banners={banners}
    />
  );
}

interface BannerCarouselProps {
  className?: string;
  intervalMs: number;
  banners: BannerPublic[];
}

function BannerCarousel({
  className,
  intervalMs,
  banners,
}: BannerCarouselProps) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const total = banners.length;

  const advance = React.useCallback(
    (step: number) => {
      if (total <= 1) return;
      setIndex((prev) => (prev + step + total) % total);
    },
    [total],
  );

  const goTo = React.useCallback(
    (next: number) => {
      if (total <= 1) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  // Auto-rotate while no user interaction is happening. Reset the
  // timer whenever the active slide changes so a manual dot click
  // doesn't immediately flip away from the slide the operator just
  // picked.
  React.useEffect(() => {
    if (total <= 1 || paused) return;
    const id = window.setInterval(() => advance(1), intervalMs);
    return () => window.clearInterval(id);
  }, [advance, index, intervalMs, paused, total]);

  const active = banners[index];
  if (!active) return null;

  return (
    <section
      className={cn(
        "group relative w-full overflow-hidden bg-rose-50/40",
        className,
      )}
      aria-roledescription="carousel"
      aria-label="Banner nổi bật"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Slide stack — fade between frames. Sized as a centred
          square card (400 → 600 → 900 px) instead of a full-bleed
          hero, so admin-uploaded portrait / square artwork is
          displayed at native proportions without aggressive
          cropping. */}
      <div className="mx-auto w-full max-w-[400px] px-4 sm:max-w-[600px] md:max-w-[900px]">
        <div className="relative aspect-square w-full">
          {banners.map((banner, i) => {
            const isActive = i === index;
            return (
              <div
                key={banner.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${total}`}
                aria-hidden={!isActive}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 ease-out",
                  isActive
                    ? "opacity-100"
                    : "pointer-events-none opacity-0",
                )}
              >
                <Image
                  src={resolveImageUrl(banner.image_url)}
                  alt={banner.title || "Banner nổi bật"}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  className="object-cover"
                />
                {/* Editorial gradient — keeps the white copy readable
                    on light or dark cover photos without forcing a
                    hard black wash that would dull rose imagery. */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/15 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              </div>
            );
          })}

        {/* Copy panel — pinned bottom on every breakpoint. With the
            hero running at a near-square aspect ratio, the copy
            stays at the bottom so the artwork stays the focal
            point and the white headline never crowds the subject. */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-20 sm:px-8 md:px-12 lg:px-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center md:mx-0 md:items-start md:text-left">
            {active.subtitle ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-100/95 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-primary shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                {active.subtitle}
              </span>
            ) : null}
            <h1 className="mt-4 font-headline text-3xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl">
              {active.title}
            </h1>
            <span
              aria-hidden
              className="mt-4 h-[2px] w-16 rounded-full bg-gradient-to-r from-rose-300/90 to-transparent"
            />
            {active.link ? (
              <Link
                href={active.link}
                className="mt-6 inline-flex items-center gap-2 self-center rounded-full bg-white px-6 py-3 text-sm font-medium text-primary shadow-lg shadow-rose-200/40 transition-all hover:-translate-y-0.5 hover:shadow-xl md:self-start"
              >
                Khám phá ngay
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>

        {/* `< . . . >` pagination — permanently visible so the slider
            reads as one editorial unit. Sits centred at the very
            bottom so it never overlaps the copy panel. Compact on
            purpose: the bar is a small indicator strip, not a piece
            of chrome, so it never takes more than a sliver of the
            hero's width. */}
        {total > 1 ? (
          <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center px-4 sm:bottom-6">
            <div
              className="flex items-center gap-1.5 rounded-md bg-black/30 px-2.5 py-1 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-black/20"
              role="tablist"
              aria-label="Chọn banner"
            >
              <button
                type="button"
                aria-label="Banner trước"
                onClick={() => advance(-1)}
                className="inline-flex h-5 w-5 items-center justify-center rounded-md text-white/85 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <ArrowLeft className="h-3 w-3" aria-hidden />
              </button>
              {banners.map((banner, i) => {
                const isActive = i === index;
                return (
                  <button
                    key={banner.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Chuyển đến banner ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-1.5 rounded-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                      isActive
                        ? "w-3 bg-white shadow-sm"
                        : "w-1 bg-white/55 hover:bg-white/80",
                    )}
                  />
                );
              })}
              <button
                type="button"
                aria-label="Banner sau"
                onClick={() => advance(1)}
                className="inline-flex h-5 w-5 items-center justify-center rounded-md text-white/85 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <ArrowRight className="h-3 w-3" aria-hidden />
              </button>
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </section>
  );
}
