"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowForward,
  Chat,
  ChevronLeft,
  ChevronRight,
  Close,
  LocalShipping,
  PlayCircle,
  Verified,
} from "@/components/layout/storefront-icons";
import { Button } from "@/components/ui/button";
import { cn, formatVND, resolveImageUrl } from "@/lib/utils";
import { productsApi } from "@/lib/api";
import type { APIError } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { Product, ProductImage, ProductStatus } from "@/types";

/**
 * ProductDetailStitch — Stitch product-detail screen (`aa370e8d…`).
 *
 * Renders only the data the backend actually exposes:
 *   1. Gallery — `product.images[]` (with `thumbnail_url` fallback).
 *   2. Header — category eyebrow + product name + status badge
 *      (draft / archived).
 *   3. Price block — current price, strikethrough compare-at,
 *      discount %.
 *   4. Description — `product.description`.
 *   5. CTAs (Zalo + Messenger).
 *   6. Mã sản phẩm (id).
 *
 * Sections that depend on data not yet wired up to the backend are
 * hidden rather than rendering placeholder copy:
 *   - 4.9 star rating + sold counter (no reviews API)
 *   - Scarcity progress bar (no live inventory feed)
 *   - Size / material / personalization pickers (variants not in the
 *     data model yet — left for the cart revamp)
 *   - "Đang có N người xem" social-proof pill (no realtime telemetry)
 *   - Hardcoded "Quà tặng kèm độc quyền" callout (no promo API)
 *
 * Read-only by design — the storefront is a catalogue, no cart yet.
 */

type RawImage = Partial<ProductImage> & { url?: string };

function normalizeImages(
  product: Product & { thumbnail_url?: string | null },
): ProductImage[] {
  const raw = ((product.images ?? []) as RawImage[])
    .map<ProductImage | null>((item, idx) => {
      const url = item.url ?? item.image_url;
      if (!url) return null;
      return {
        id: item.id ?? `image-${idx}`,
        product_id: item.product_id ?? product.id,
        object_key: item.object_key ?? "",
        image_url: url,
        sort_order: typeof item.sort_order === "number" ? item.sort_order : idx,
      };
    })
    .filter((item): item is ProductImage => item !== null);

  if (raw.length === 0 && product.thumbnail_url) {
    raw.push({
      id: "thumbnail",
      product_id: product.id,
      object_key: "",
      image_url: product.thumbnail_url,
      sort_order: 0,
    });
  }
  return raw.sort((a, b) => a.sort_order - b.sort_order);
}

const STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Bản nháp",
  active: "Đang bán",
  archived: "Ngừng kinh doanh",
};

const STATUS_CLASSES: Record<ProductStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  archived: "bg-zinc-200 text-zinc-700",
};

export interface ProductDetailStitchProps {
  initialProduct: Product & { thumbnail_url?: string | null };
}

export function ProductDetailStitch({
  initialProduct,
}: ProductDetailStitchProps) {
  const productQuery = useQuery<Product, APIError>({
    queryKey: queryKeys.products.detail(initialProduct.id),
    queryFn: () => productsApi.get(initialProduct.id),
    initialData: initialProduct,
  });
  const product = productQuery.data ?? initialProduct;

  const images = React.useMemo(
    () => normalizeImages(product),
    [product],
  );

  const [activeIndex, setActiveIndex] = React.useState(0);
  // Lightbox state — `null` = closed, otherwise the index of the
  // currently-zoomed image. Decoupled from `activeIndex` so the gallery
  // thumbnail strip keeps its selection while the user pans around in
  // the lightbox.
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(
    null,
  );

  const hasComparePrice =
    typeof product.compare_at === "number" &&
    product.compare_at !== null &&
    product.compare_at > product.price;

  const discountPercent = hasComparePrice
    ? Math.round((1 - product.price / (product.compare_at as number)) * 100)
    : 0;

  // Always show the main hero + one secondary slot. Pad with the
  // "video" affordance when we have fewer than 2 product images so the
  // gallery grid stays balanced (Stitch spec).
  const thumbSlots = React.useMemo(() => {
    const base = images.slice(0, 4);
    return [
      ...base,
      ...Array.from({ length: Math.max(0, 5 - base.length) }, () => null),
    ];
  }, [images]);

  const safeIndex = Math.min(activeIndex, Math.max(images.length - 1, 0));
  const activeImage = images[safeIndex];
  const status = product.status as ProductStatus | undefined;

  return (
    <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
      {/* =========================== GALLERY =========================== */}
      <div className="flex w-full flex-col gap-6 lg:w-3/5">
        <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-rose-100 bg-white p-4 shadow-[0_0_40px_rgba(225,29,116,0.10)]">
          {activeImage?.image_url ? (
            <button
              type="button"
              onClick={() => setLightboxIndex(safeIndex)}
              aria-label="Phóng to ảnh"
              className="block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Image
                src={resolveImageUrl(activeImage.image_url)}
                alt={`${product.name} — hình chính`}
                width={1200}
                height={1200}
                priority
                className="h-full w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ) : (
            <div className="grid h-full w-full place-items-center rounded-xl bg-surface-container text-sm text-muted-foreground">
              Sản phẩm chưa có hình ảnh
            </div>
          )}

          {/* Floating chips anchored top-left. Backed by data, not
              marketing copy — only shown when we have the bits needed
              to justify them (compare-price → discount %, active
              status → GRA badge). */}
          <div className="absolute left-6 top-6 flex flex-col gap-2">
            {hasComparePrice && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-white/90 px-3 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur">
                -{discountPercent}%
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur">
              <Verified size={14} />
              Chính hãng
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur">
              <LocalShipping size={14} />
              Giao 24h
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {thumbSlots.map((slot, idx) => {
            const isActive = slot && idx === safeIndex;
            if (!slot) {
              return (
                <div
                  key={`empty-${idx}`}
                  aria-hidden
                  className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-dashed border-rose-100 bg-zinc-50/50"
                >
                  <PlayCircle
                    size={28}
                    className="text-zinc-300"
                  />
                </div>
              );
            }
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Xem hình ${idx + 1}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "aspect-square overflow-hidden rounded-xl border-2 transition-colors",
                  isActive
                    ? "border-primary"
                    : "border-rose-100 opacity-70 hover:border-primary/50 hover:opacity-100",
                )}
              >
                <Image
                  src={resolveImageUrl(slot.image_url)}
                  alt={`${product.name} — hình ${idx + 1}`}
                  width={240}
                  height={240}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================== INFO =========================== */}
      <div className="flex w-full flex-col lg:w-2/5">
        {product.category?.name && (
          <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-primary">
            {product.category.name}
          </span>
        )}
        <h1 className="mb-3 font-headline text-3xl italic leading-tight text-zinc-900 md:text-4xl">
          {product.name}
        </h1>

        {status && status !== "active" && (
          <div className="mb-5">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                STATUS_CLASSES[status],
              )}
            >
              {STATUS_LABELS[status]}
            </span>
          </div>
        )}

        <div className="mb-8 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatVND(product.price)}
          </span>
          {hasComparePrice && (
            <>
              <span className="text-lg text-zinc-400 line-through">
                {formatVND(product.compare_at as number)}
              </span>
              <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-bold text-primary">
                Tiết kiệm {discountPercent}%
              </span>
            </>
          )}
        </div>

        {product.description && (
          <div className="mb-8 rounded-xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/40 p-5 shadow-sm">
            <p className="mb-2 text-sm font-bold text-zinc-900">
              Mô tả sản phẩm
            </p>
            <p className="whitespace-pre-line text-[15px] leading-[1.7] text-zinc-700">
              {product.description}
            </p>
          </div>
        )}

        {/* Variant pickers (size / material / personalize) are
            intentionally hidden until the backend exposes product
            variants. See the file-level JSDoc. */}

        {/* CTAs — primary (Zalo) + outline (Messenger). Both are sized
            larger than the default spec (`h-14`), use a `btn-shimmer`
            shine sweep on hover, scale up slightly on hover and press
            down on click for a tactile feel. */}
        <div className="mb-6 flex flex-col gap-4">
          <Button
            asChild
            className="btn-shimmer group/cta h-14 w-full rounded-2xl bg-primary px-6 text-lg font-bold tracking-wide text-primary-foreground shadow-[0_10px_30px_-10px_rgba(225,29,116,0.55)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(225,29,116,0.7)] hover:brightness-110 active:translate-y-0 active:scale-[0.96] active:shadow-[0_6px_18px_-8px_rgba(225,29,116,0.5)]"
          >
            <a href="/contact">
              <Chat size={24} className="transition-transform duration-200 group-hover/cta:scale-110" />
              <span>Tư vấn qua Zalo</span>
              <ArrowForward
                size={24}
                className="transition-transform duration-200 group-hover/cta:translate-x-1"
              />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="btn-shimmer group/cta h-14 w-full rounded-2xl border-2 border-primary bg-transparent px-6 text-lg font-bold tracking-wide text-primary shadow-[0_4px_18px_-8px_rgba(225,29,116,0.3)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_18px_40px_-12px_rgba(225,29,116,0.5)] active:translate-y-0 active:scale-[0.96]"
          >
            <a href="/contact">
              <Chat
                size={24}
                className="transition-transform duration-200 group-hover/cta:scale-110"
              />
              <span>Mua nhanh qua Messenger</span>
            </a>
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-rose-100 pt-6 text-sm text-zinc-500">
          <span>Mã sản phẩm:</span>
          <span className="font-mono text-foreground">{product.id}</span>
        </div>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          productName={product.name}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}

ProductDetailStitch.displayName = "ProductDetailStitch";

/* ----------------------------------------------------------------------- *
 * ImageLightbox — fullscreen zoom for the product gallery.
 *
 * Native implementation (no Radix) so the layout stays a full-viewport
 * stage rather than a centred modal panel. Provides:
 *   - Esc / X / backdrop click to close
 *   - Prev / next arrows when the product has > 1 image
 *   - Body scroll lock while open
 *   - Counter "i / n" in the top-left corner
 *
 * Click target is the entire stage minus the chrome, so the user can
 * always escape even if they drag a thumb past the image edges.
 * ----------------------------------------------------------------------- */

interface ImageLightboxProps {
  images: ProductImage[];
  index: number;
  productName: string;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}

function ImageLightbox({
  images,
  index,
  productName,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const total = images.length;
  const safeIndex = ((index % total) + total) % total;
  const current = images[safeIndex];

  // Esc to close + arrow keys to navigate.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (total <= 1) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onIndexChange((safeIndex - 1 + total) % total);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onIndexChange((safeIndex + 1) % total);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onIndexChange, safeIndex, total]);

  // Lock page scroll while the lightbox is open.
  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!current?.image_url) {
    // Nothing to show — close immediately so we don't trap the user.
    onClose();
    return null;
  }

  const goPrev = () => onIndexChange((safeIndex - 1 + total) % total);
  const goNext = () => onIndexChange((safeIndex + 1) % total);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Phóng to ảnh ${safeIndex + 1} / ${total}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-lightbox-fade-in"
    >
      {/* Counter — top-left */}
      <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur">
        {safeIndex + 1} / {total}
      </div>

      {/* Close button — top-right */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <Close size={20} />
      </button>

      {/* Prev / next arrows — only useful when there's more than one
          image. */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Ảnh trước"
            className="absolute left-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Ảnh sau"
            className="absolute right-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Backdrop click target (covers the area around the image). */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        tabIndex={-1}
        className="absolute inset-0"
      />

      {/* The image itself — not a button so clicks don't close the
          lightbox. Uses `object-contain` to fit any aspect ratio
          inside the viewport without cropping. */}
      <div className="relative z-[1] flex h-full w-full items-center justify-center p-12 sm:p-16">
        <Image
          src={resolveImageUrl(current.image_url)}
          alt={`${productName} — ảnh ${safeIndex + 1}`}
          width={1600}
          height={1600}
          sizes="100vw"
          className="max-h-full max-w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}

ImageLightbox.displayName = "ImageLightbox";