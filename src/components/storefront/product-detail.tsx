"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Display, Body, TextLabel } from "@/components/ui/typography";
import { cn, formatVND, resolveImageUrl } from "@/lib/utils";
import type { APIError } from "@/lib/api";
import { productsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { Product, ProductImage } from "@/types";

/**
 * Product detail surface — gallery + read-only meta.
 *
 * Reads the product payload (server-hydrated) and renders:
 *  - a 4 / 5 main image with the active image URL
 *  - a thumbnail strip (radius 12) for quick swapping
 *  - desktop layout has the strip vertical on the left, mobile has
 *    it horizontal at the top.
 *
 * Read-only: there is no "Add to cart" or "Buy now" — the public
 * storefront is purely a catalogue.
 */
export interface ProductDetailProps {
  initialProduct: Product;
}

export function ProductDetail({ initialProduct }: ProductDetailProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const productQuery = useQuery<Product, APIError>({
    queryKey: queryKeys.products.detail(initialProduct.id),
    queryFn: () => productsApi.get(initialProduct.id),
    initialData: initialProduct,
  });

  const product = productQuery.data ?? initialProduct;

  const images = React.useMemo(() => {
    const list: ProductImage[] = [...(product.images ?? [])];
    // If no images are attached, fall back to the thumbnail URL.
    // The list endpoints pre-populate this; the detail view can be empty.
    if (list.length === 0) {
      const fallback = (product as unknown as { thumbnail_url?: string | null }).thumbnail_url;
      if (fallback) {
        list.push({
          id: "thumbnail",
          product_id: product.id,
          object_key: "",
          image_url: fallback,
          sort_order: 0,
        });
      }
    }
    return list.sort((a, b) => a.sort_order - b.sort_order);
  }, [product]);

  if (productQuery.isError) {
    return (
      <Container size="xl" className="py-12">
        <ErrorState
          error={productQuery.error}
          onRetry={() => productQuery.refetch()}
          title="Không tải được sản phẩm"
        />
      </Container>
    );
  }

  const hasComparePrice =
    typeof product.compare_at === "number" &&
    product.compare_at !== null &&
    product.compare_at > product.price;

  const discountPercent = hasComparePrice
    ? Math.round((1 - product.price / (product.compare_at as number)) * 100)
    : 0;

  return (
    <Section tone="default" spacing="xl" containerSize="xl">
      <Container size="xl">
        <div className="grid gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
          <Gallery
            images={images}
            activeIndex={activeIndex}
            onActiveChange={setActiveIndex}
            productName={product.name}
          />

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {hasComparePrice && (
                <Badge variant="default" className="rounded-full">
                  -{discountPercent}%
                </Badge>
              )}
              {product.status !== "active" && (
                <Badge variant="secondary" className="rounded-full">
                  {product.status === "archived" ? "Đã ngừng bán" : "Bản nháp"}
                </Badge>
              )}
            </div>

            <Display as="h1" level="sm" className="text-[32px] md:text-[40px]">
              {product.name}
            </Display>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-primary">
                {formatVND(product.price)}
              </span>
              {hasComparePrice && (
                <span className="text-[14px] text-muted-foreground line-through">
                  {formatVND(product.compare_at as number)}
                </span>
              )}
            </div>

            {product.description && (
              <div className="space-y-3 pt-2">
                <TextLabel level="caps" tone="default">
                  Mô tả sản phẩm
                </TextLabel>
                <Body level="md" className="whitespace-pre-line text-muted-foreground">
                  {product.description}
                </Body>
              </div>
            )}

            <div className="rounded-xl border border-hairline bg-surface-container-low p-4 text-[14px]">
              <TextLabel level="caps" tone="default" as="div" className="block">
                Cửa hàng Aura Vénus
              </TextLabel>
              <Body level="sm" className="mt-1 text-muted-foreground">
                Mỗi sản phẩm đều đi kèm giấy chứng nhận chính hãng. Vui lòng liên hệ để được
                tư vấn chi tiết và xác nhận tình trạng.
              </Body>
              <Button asChild className="mt-3">
                <a href="/contact">Liên hệ tư vấn</a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted-foreground">
              <span>Mã sản phẩm:</span>
              <span className="font-mono text-foreground">{product.id}</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* --------------------- Gallery --------------------- */

interface GalleryProps {
  images: ProductImage[];
  activeIndex: number;
  onActiveChange: (index: number) => void;
  productName: string;
}

function Gallery({ images, activeIndex, onActiveChange, productName }: GalleryProps) {
  if (images.length === 0) {
    return (
      <div className="grid aspect-[4/5] w-full place-items-center rounded-xl border border-hairline bg-surface-container-high text-[14px] text-muted-foreground">
        Sản phẩm chưa có hình ảnh
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="grid gap-3 md:grid-cols-[80px_1fr] md:gap-4">
      {/* Thumbnail strip */}
      <div
        className={cn(
          "flex gap-2 overflow-x-auto md:order-1 md:flex-col md:gap-3 md:overflow-y-auto md:pr-1",
          "scrollbar-thin",
        )}
        role="tablist"
        aria-label={`Hình ảnh ${productName}`}
      >
        {images.map((image, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Xem hình ${i + 1}`}
              onClick={() => onActiveChange(i)}
              className={cn(
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border border-hairline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "border-primary ring-2 ring-primary/30"
                  : "hover:border-primary/40",
              )}
            >
              <Image
                src={resolveImageUrl(image.image_url)}
                alt={`${productName} — hình ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Main image */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-hairline bg-surface-container-low md:order-2"
        role="tabpanel"
        aria-label={`Hình chính ${activeIndex + 1}`}
      >
        {activeImage ? (
          <Image
            src={resolveImageUrl(activeImage.image_url)}
            alt={`${productName} — hình ${activeIndex + 1}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        ) : (
          <Skeleton className="absolute inset-0" />
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-white">
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            {activeIndex + 1}/{images.length}
          </div>
        )}
      </div>
    </div>
  );
}
