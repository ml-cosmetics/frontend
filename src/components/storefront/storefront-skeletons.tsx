"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

/**
 * Skeletons matching the public storefront blocks.
 *
 * Each skeleton mirrors the actual surface area so the layout
 * doesn't jump when the data arrives. All skeletons are pure CSS
 * with the standard `animate-pulse` shimmer.
 */

export interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-hairline bg-card",
        className,
      )}
      aria-hidden
    >
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-2 p-4 md:p-5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({ count = 8, className }: ProductGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6",
        className,
      )}
      aria-label="Đang tải sản phẩm"
      role="status"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <Skeleton
      className={cn("h-32 rounded-xl border border-hairline", className)}
      aria-hidden
    />
  );
}

export function CategoryGridSkeleton({ count = 6, className }: ProductGridSkeletonProps) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6", className)}
      aria-label="Đang tải danh mục"
      role="status"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BannerSliderSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn("aspect-[16/7] w-full rounded-none sm:aspect-[16/6] md:aspect-[16/5]", className)}
      aria-hidden
    />
  );
}

export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 py-10 md:py-16", className)} aria-hidden>
      <Skeleton className="h-10 w-3/4 md:h-14 md:w-1/2" />
      <Skeleton className="h-4 w-2/3 md:h-5 md:w-1/3" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
