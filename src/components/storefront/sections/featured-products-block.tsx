"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PackageSearch } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeader } from "@/components/common/section-header";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGridSkeleton } from "@/components/storefront/storefront-skeletons";
import { ProductStatus } from "@/types";
import type { APIError } from "@/lib/api";
import { productsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { ListProductsParams } from "@/lib/api/products";
import type { PaginatedList, ProductListItem } from "@/types";

/**
 * Featured products grid.
 *
 * Calls `GET /v1/products?status=active` to pull the live catalogue
 * (using `status=active` as the implicit "featured" filter — the
 * public storefront must never show draft/archived products). Limit
 * is enforced server-side via `per_page`; the backend returns the
 * most-recently-updated items.
 */
export interface FeaturedProductsBlockProps {
  initialData?: PaginatedList<ProductListItem>;
  title?: string;
  eyebrow?: string;
  description?: string;
}

export function FeaturedProductsBlock({
  initialData,
  title = "Sản phẩm nổi bật",
  eyebrow = "Tuyển tập Aura Vénus",
  description = "Son dưỡng Dior và vòng tay ngọc Jadeite — tuyển chọn những món quà thanh lịch cho làn da và cổ tay của bạn.",
}: FeaturedProductsBlockProps) {
  const params: ListProductsParams = {
    status: ProductStatus.Active,
    page: 1,
    per_page: 8,
  };

  const query = useQuery<PaginatedList<ProductListItem>, APIError>({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsApi.list(params),
    initialData,
  });

  return (
    <Section tone="default" spacing="xl" containerSize="xl">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <Button variant="outline" asChild>
            <Link href="/products">
              Xem tất cả
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <div className="mt-10">
        {query.isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : query.data && query.data.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
            {query.data.items.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="Chưa có sản phẩm"
            description="Hiện chưa có sản phẩm nào được gắn nhãn nổi bật — hãy quay lại sau."
          />
        )}
      </div>
    </Section>
  );
}
