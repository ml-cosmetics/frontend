"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FolderTree } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeader } from "@/components/common/section-header";
import { CategoryCard } from "@/components/storefront/category-card";
import { CategoryGridSkeleton } from "@/components/storefront/storefront-skeletons";
import type { APIError } from "@/lib/api";
import { categoriesApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { Category, PaginatedList } from "@/types";

/**
 * "Browse by collection" block on the home page.
 *
 * Calls `GET /v1/categories?active=true&per_page=N` and renders each
 * category as a tile. The block is server-data only — clicking a card
 * sends the user to `/products?category=<id>` which the products list
 * reads via `searchParams`.
 */
export interface CategoriesBlockProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  initialData?: PaginatedList<Category>;
  perPage?: number;
}

export function CategoriesBlock({
  title = "Danh mục sản phẩm",
  eyebrow = "Bộ sưu tập",
  description = "Khám phá sản phẩm theo từng bộ sưu tập — từ son dưỡng Dior đến vòng tay ngọc Jadeite chính hãng.",
  initialData,
  perPage = 6,
}: CategoriesBlockProps) {
  const params = { active: true, page: 1, per_page: perPage };
  const query = useQuery<PaginatedList<Category>, APIError>({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => categoriesApi.list(params),
    initialData,
  });

  return (
    <Section tone="muted" spacing="xl" containerSize="xl">
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
          <CategoryGridSkeleton count={perPage} />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : query.data && query.data.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {query.data.items.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderTree}
            title="Chưa có danh mục"
            description="Các danh mục sẽ xuất hiện ở đây khi được cấu hình trong trang quản trị."
          />
        )}
      </div>
    </Section>
  );
}
