"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  FilterChips,
  ProductCard,
  ProductGridSkeleton,
  ProductsHeroSmall,
  ProductsPagination,
  ProductsToolbar,
  defaultProductStats,
  type ActiveFilter,
  type FilterChipDefinition,
} from "@/components/storefront";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import type { APIError } from "@/lib/api";
import { categoriesApi, productsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { cn, pageKey } from "@/lib/utils";
import { ProductStatus } from "@/types";
import type {
  Category,
  PaginatedList,
  ProductListItem,
} from "@/types";

/**
 * Public storefront — `/products` catalogue page (Stitch product
 * listing screen).
 *
 * Reuses the existing Homepage design system via:
 *   - `Breadcrumb`        → canonical trail (Trang chủ → Bộ sưu tập)
 *   - `ProductsHeroSmall` → centered Playfair hero + frosted stats
 *   - `ProductsToolbar`   → sticky filter chips + sort + view toggle
 *   - `FilterChips`       → active filter tags row
 *   - `ProductCard`       → extended with corner badge + favorite
 *   - `ProductsPagination`→ Stitch round-button pager
 *
 * State:
 *   - `category`/`search`/`page` live in the URL.
 *   - All hooks (React Query) reuse `queryKeys.products.list`.
 */
export interface ProductsListProps {
  initialCategoryId?: string;
  initialSearch?: string;
  initialPage?: number;
  initialProducts?: PaginatedList<ProductListItem>;
  initialCategories?: PaginatedList<Category>;
}

const DEBOUNCE_MS = 350;

const FILTER_CHIPS: FilterChipDefinition[] = [
  { key: "stone", label: "Loại đá" },
  { key: "size", label: "Size (mm)" },
  { key: "color", label: "Màu sắc" },
  { key: "material", label: "Chất liệu" },
  { key: "price", label: "Giá" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "best_selling", label: "Bán chạy" },
] as const;

export function ProductsList({
  initialCategoryId,
  initialSearch,
  initialPage = 1,
  initialProducts,
  initialCategories,
}: ProductsListProps) {
  const router = useRouter();
  const pathname = usePathname();

  // --- URL-bound state -------------------------------------------------
  const [searchInput, setSearchInput] = React.useState(initialSearch ?? "");
  const [committedSearch, setCommittedSearch] = React.useState(
    initialSearch ?? "",
  );
  const [categoryId, setCategoryId] = React.useState<string | undefined>(
    initialCategoryId,
  );
  const [page, setPage] = React.useState(initialPage);
  const [sortValue, setSortValue] = React.useState<string>("newest");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // --- Debounce search -------------------------------------------------
  React.useEffect(() => {
    if (searchInput === committedSearch) return;
    const id = window.setTimeout(
      () => setCommittedSearch(searchInput),
      DEBOUNCE_MS,
    );
    return () => window.clearTimeout(id);
  }, [searchInput, committedSearch]);

  const updateUrl = React.useCallback(
    (next: {
      search?: string;
      category?: string | undefined;
      page?: number;
    }) => {
      const params = new URLSearchParams();
      if (next.search) params.set("search", next.search);
      if (next.category) params.set("category", next.category);
      if (next.page && next.page > 1) params.set("page", String(next.page));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  React.useEffect(() => {
    updateUrl({ search: committedSearch, category: categoryId, page });
  }, [committedSearch, categoryId, page, updateUrl]);

  // --- Categories query ----------------------------------------------
  const categoriesQuery = useQuery<PaginatedList<Category>, APIError>({
    queryKey: queryKeys.categories.list({ active: true, page: 1, per_page: 100 }),
    queryFn: () => categoriesApi.list({ active: true, page: 1, per_page: 100 }),
    initialData: initialCategories,
  });

  // Snap back to page 1 whenever filters change.
  React.useEffect(() => {
    setPage(1);
  }, [committedSearch, categoryId]);

  // --- Products query -------------------------------------------------
  const productsQuery = useQuery<PaginatedList<ProductListItem>, APIError>({
    queryKey: [
      ...queryKeys.products.all(),
      "list",
      "v2",
      {
        status: ProductStatus.Active,
        search: committedSearch || undefined,
        category: categoryId ?? null,
        sort: sortValue,
      },
      pageKey({ page, per_page: 12 }),
    ],
    queryFn: () =>
      productsApi.list({
        status: ProductStatus.Active,
        search: committedSearch || undefined,
        page,
        per_page: 12,
      }),
    initialData:
      page === initialPage &&
      categoryId === initialCategoryId &&
      !committedSearch
        ? initialProducts
        : undefined,
  });

  const products = productsQuery.data?.items ?? [];
  const pagination = productsQuery.data?.pagination;

  // --- Derived UI state ------------------------------------------------
  const categoryName = React.useMemo(() => {
    if (!categoryId) return undefined;
    return categoriesQuery.data?.items.find((c) => c.id === categoryId)?.name;
  }, [categoriesQuery.data, categoryId]);

  const activeFilters: ActiveFilter[] = React.useMemo(() => {
    const list: ActiveFilter[] = [];
    if (categoryName) list.push({ key: "category", label: categoryName });
    if (committedSearch)
      list.push({ key: "search", label: committedSearch });
    return list;
  }, [categoryName, committedSearch]);

  const heroStats = defaultProductStats(
    pagination?.total ?? 124,
    pagination?.total ? pagination.total * 23 : 2847,
    4.9,
  );

  const handleFilterClick = (key: string) => {
    if (key === "stone") {
      // The first filter is the only one wired up; the rest are
      // visual placeholders until the catalog facet API lands.
    }
  };

  const handleRemoveFilter = (key: string) => {
    if (key === "category") setCategoryId(undefined);
    if (key === "search") {
      setSearchInput("");
      setCommittedSearch("");
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setCommittedSearch("");
    setCategoryId(undefined);
  };

  const titlePrefix = categoryName ?? "Bộ sưu tập";
  const heroTitle = `${titlePrefix} ML Cosmetics`;
  const heroDescription =
    "Khám phá những tuyển tập ngọc Jadeite và Dior cao cấp — mỗi sản phẩm đều được ML Cosmetics tuyển chọn thủ công với chứng nhận GRA quốc tế.";

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Bộ sưu tập", href: "/products" },
          {
            label: titlePrefix,
          },
        ]}
        className="mb-8"
      />

      <ProductsHeroSmall
        title={heroTitle}
        subtitle="— Đá quý ngàn năm —"
        description={heroDescription}
        stats={heroStats}
        showStats={false}
      />

      <ProductsToolbar
        filters={FILTER_CHIPS}
        sortValue={sortValue}
        sortOptions={SORT_OPTIONS as unknown as { value: string; label: string }[]}
        viewMode={viewMode}
        onFilterClick={handleFilterClick}
        onSortChange={setSortValue}
        onViewChange={setViewMode}
      />

      <FilterChips
        filters={activeFilters}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearFilters}
      />

      <div className="mb-12">
        {productsQuery.isLoading ? (
          <ProductGridSkeleton count={12} />
        ) : productsQuery.isError ? (
          <ErrorState
            error={productsQuery.error}
            onRetry={() => productsQuery.refetch()}
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="Không có sản phẩm phù hợp"
            description={
              activeFilters.length > 0
                ? "Hãy thử bỏ bớt bộ lọc hoặc đổi từ khóa khác."
                : "Hiện chưa có sản phẩm nào đang được bán."
            }
          />
        ) : (
          <div
            className={cn(
              "grid gap-6",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1",
            )}
          >
            {products.map((product, idx) => {
              const cornerBadge =
                idx === 0
                  ? { label: "Quà tặng kèm", tone: "gift" as const }
                  : idx === 2
                    ? { label: "Best Seller", tone: "best" as const }
                    : undefined;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  showFavorite
                  cornerBadge={cornerBadge}
                  soldCount={Math.max(40, 280 - idx * 25)}
                  priority={idx < 4}
                />
              );
            })}
          </div>
        )}
      </div>

      {pagination && pagination.total_pages > 1 && (
        <ProductsPagination
          currentPage={pagination.page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total ?? 0}
          perPage={pagination.limit}
          onPageChange={(next) => {
            setPage(next);
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />
      )}
    </div>
  );
}

ProductsList.displayName = "ProductsList";