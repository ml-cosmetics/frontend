"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Mic, SlidersHorizontal, LayoutGrid, List as ListIcon, Search as SearchIcon, X } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGridSkeleton } from "@/components/storefront/storefront-skeletons";
import { SearchEmptyState } from "@/components/storefront/search-empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Display, Body, TextLabel, Headline } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination as PaginationControl } from "@/components/common/pagination";
import { SortDropdown } from "@/components/common/sort-dropdown";
import { categoriesApi, productsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { cn, resolveImageUrl } from "@/lib/utils";
import { ProductStatus } from "@/types";
import type { APIError } from "@/lib/api";
import type { Category, PaginatedList, ProductListItem } from "@/types";

/**
 * Public storefront — search results.
 *
 * Stitch spec: `b6a2c4eb244a4c5299f0ae01f9e5621a`
 *   — "ML Cosmetics — Kết quả tìm kiếm "Ngọc Bích Xanh""
 *
 * Composition (matches Stitch layout top → bottom):
 *   1. Hero block — eyebrow / big query / count / search bar / chip row.
 *   2. Tab strip — categories with per-tab counts + sort + grid/list toggle.
 *   3. Sidebar + product grid — filters live in the sidebar; the grid
 *      shows up to 12 products per page.
 *   4. Pagination — uses the shared `Pagination` control.
 *   5. Editorial "Bạn có thể quan tâm" section — three content cards
 *      driven by the canonical Stitch design source.
 *
 * URL contract:
 *   - `?q=<query>`        — committed search term
 *   - `?category=<id>`    — selected category tab (omit for "Tất cả")
 *   - `?page=<n>`         — current page (only when > 1)
 */
export interface SearchResultsViewProps {
  initialQuery: string;
  initialCategoryId?: string;
  initialPage?: number;
  initialProducts?: PaginatedList<ProductListItem>;
  initialCategories?: PaginatedList<Category>;
}

type CategoryTab = { id: string; name: string; count?: number };

const DEBOUNCE_MS = 350;
const DEFAULT_TAB_ID = "__all";

/**
 * Mock product pool used while the backend wishlist / search
 * endpoints are being wired up. Matches the "ngọc bích xanh"
 * search example so the page renders with real-looking data even
 * when the search endpoint returns nothing.
 *
 * The shapes align with `ProductListItem` so swapping in a real
 * query result later is a one-line change.
 */
interface MockProduct {
  id: string;
  name: string;
  price: number;
  thumbnailUrl: string;
  soldCount: number;
  giftBadge?: boolean;
}

const MOCK_POOL: MockProduct[] = [
  {
    id: "set-qua-vong-ngoc-dior",
    name: "Set Quà Vòng Ngọc & Dior",
    price: 8500000,
    thumbnailUrl:
      "https://i.pinimg.com/736x/fa/55/4e/fa554e31ae3ac4e8e4481820d2eb768a.jpg",
    soldCount: 12,
    giftBadge: true,
  },
  {
    id: "vong-ngoc-bich-co-dien",
    name: "Vòng Ngọc Bích Cổ Điển",
    price: 4200000,
    thumbnailUrl:
      "https://i.pinimg.com/736x/43/a1/eb/43a1eb9a8bbd5ab7661d58d7530094ea.jpg",
    soldCount: 45,
  },
  {
    id: "day-chuyen-mat-ngoc-tron",
    name: "Dây Chuyền Mặt Ngọc Tròn",
    price: 2800000,
    thumbnailUrl:
      "https://i.pinimg.com/736x/07/8f/59/078f59b572bdeaf2de5c1d2f751c13f3.jpg",
    soldCount: 28,
  },
  {
    id: "nhan-ngoc-bich-kim-tien",
    name: "Nhẫn Ngọc Bích Kim Tiền",
    price: 1500000,
    thumbnailUrl: "",
    soldCount: 89,
  },
];

function toProductListItem(mock: MockProduct): ProductListItem {
  return {
    id: mock.id,
    name: mock.name,
    slug: mock.id,
    description: mock.name,
    price: mock.price,
    compare_at: null,
    cost: null,
    thumbnail_url: mock.thumbnailUrl,
    status: ProductStatus.Active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function buildMockSearchResult(query: string): {
  items: ProductListItem[];
  pagination: PaginatedList<ProductListItem>["pagination"];
} | null {
  // Always show the mock pool, even for empty queries — matches
  // the "ngọc bích xanh" search example from Stitch. The query is
  // accepted for future filtering hooks; for now it is read so the
  // React-Query cache can re-run when it changes.
  void query;
  const items = MOCK_POOL.map(toProductListItem);
  return {
    items,
    pagination: {
      page: 1,
      limit: 12,
      offset: 0,
      total: 24,
      total_pages: 2,
      has_next: true,
      has_previous: false,
    },
  };
}

/**
 * Suggestion chips shown below the search field. Const values match
 * the canonical Stitch design (`b6a2c4eb244a4c5299f0ae01f9e5621a`).
 */
const SUGGESTION_CHIPS = [
  "vòng tay 18mm",
  "dây chuyền jadeite",
  "nhẫn vàng 18k",
  "ngọc bích phỉ thúy",
  "quà tặng cao cấp",
] as const;

export function SearchResultsView({
  initialQuery,
  initialCategoryId,
  initialPage = 1,
  initialProducts,
  initialCategories,
}: SearchResultsViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  // --- Local form state -------------------------------------------------
  const [searchInput, setSearchInput] = React.useState(initialQuery);
  const [committedSearch, setCommittedSearch] = React.useState(initialQuery);
  const [activeTabId, setActiveTabId] = React.useState<string>(
    initialCategoryId ?? DEFAULT_TAB_ID,
  );
  const [page, setPage] = React.useState(initialPage);
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [sizeFilter, setSizeFilter] = React.useState<"all" | "54" | "56">("all");
  const [stoneFilter, setStoneFilter] = React.useState<"all" | "jadeite" | "landscape">("all");

  // --- Debounce: type-to-search ----------------------------------------
  React.useEffect(() => {
    if (searchInput === committedSearch) return;
    const id = window.setTimeout(() => setCommittedSearch(searchInput), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [searchInput, committedSearch]);

  // --- URL sync (shareable, SSR-friendly) -------------------------------
  const updateUrl = React.useCallback(
    (next: { search?: string; category?: string | null; page?: number }) => {
      const params = new URLSearchParams();
      if (next.search) params.set("q", next.search);
      if (next.category) params.set("category", next.category);
      if (next.page && next.page > 1) params.set("page", String(next.page));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  React.useEffect(() => {
    updateUrl({
      search: committedSearch,
      category: activeTabId === DEFAULT_TAB_ID ? null : activeTabId,
      page,
    });
  }, [committedSearch, activeTabId, page, updateUrl]);

  // --- Reset to page 1 when filters change ------------------------------
  React.useEffect(() => {
    setPage(1);
  }, [committedSearch, activeTabId]);

  // --- Categories (for the tab strip + counts) --------------------------
  const categoriesQuery = useQuery<PaginatedList<Category>, APIError>({
    queryKey: queryKeys.categories.list({ active: true, page: 1, per_page: 100 }),
    queryFn: () => categoriesApi.list({ active: true, page: 1, per_page: 100 }),
    initialData: initialCategories,
  });

  // --- Products ---------------------------------------------------------
  const productsQuery = useQuery<PaginatedList<ProductListItem>, APIError>({
    queryKey: [
      ...queryKeys.products.all(),
      "search",
      { q: committedSearch, page },
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
      (activeTabId === (initialCategoryId ?? DEFAULT_TAB_ID)) &&
      committedSearch === initialQuery
        ? initialProducts
        : undefined,
  });

  const products = productsQuery.data?.items ?? [];
  const pagination = productsQuery.data?.pagination;
  const totalCount = pagination?.total ?? 0;

  // Mock fallback — render the demo product pool whenever the
  // backend has nothing to show so the page still demonstrates the
  // full Stitch layout. Disable in production by removing this
  // branch once the search endpoint is live.
  const mockResult = React.useMemo(
    () => buildMockSearchResult(committedSearch),
    [committedSearch],
  );
  const isMockFallback =
    !productsQuery.isLoading &&
    !productsQuery.isError &&
    (products.length === 0 || !productsQuery.data);
  const effectiveProducts = isMockFallback && mockResult ? mockResult.items : products;
  const effectivePagination = isMockFallback && mockResult ? mockResult.pagination : pagination;
  const effectiveTotal = effectivePagination?.total ?? totalCount;

  // --- Stitch empty state ---------------------------------------------
  // When the query has finished and returned zero items, take over
  // the whole content area with the Stitch empty-state instead of
  // the sidebar + grid shell. The header / marquee / footer / floating
  // bubble are owned by `PublicShell` and stay on screen.
  const showEmptyState =
    !productsQuery.isLoading &&
    !productsQuery.isError &&
    products.length === 0 &&
    Boolean(committedSearch) &&
    !isMockFallback;

  // --- Tab data ---------------------------------------------------------
  const tabs: CategoryTab[] = React.useMemo(() => {
    const items = categoriesQuery.data?.items ?? [];
    return [
      { id: DEFAULT_TAB_ID, name: "Tất cả", count: effectiveTotal },
      ...items.map((c) => ({ id: c.id, name: c.name })),
    ];
  }, [categoriesQuery.data, effectiveTotal]);

  // --- Quick chip suggestions (Stitch shows 5 illustrative chips) -------
  const [sort, setSort] = React.useState<
    "default" | "price-asc" | "price-desc" | "newest"
  >("default");

  if (showEmptyState) {
    return (
      <SearchEmptyState
        query={committedSearch}
        onSearch={(next) => {
          setSearchInput(next);
          setCommittedSearch(next);
          setActiveTabId(DEFAULT_TAB_ID);
          setSizeFilter("all");
          setStoneFilter("all");
          setPage(1);
        }}
        onContactClick={() => router.push("/contact")}
      />
    );
  }

  return (
    <div className="bg-surface text-foreground">
      {/* =========================== HERO =========================== */}
      <Section tone="default" spacing="lg" containerSize="xl">
        <Container size="lg" className="text-center">
          <TextLabel level="caps" tone="muted" className="mb-2 block">
            Đang tìm kiếm
          </TextLabel>
          <Display
            as="h1"
            level="sm"
            className="mb-3 text-balance italic"
          >
            {committedSearch || "ngọc bích xanh"}
          </Display>
          <Body className="mb-8 text-[14px] text-muted-foreground">
            {productsQuery.isLoading
              ? "Đang tải kết quả…"
              : effectiveTotal > 0
                ? `Tìm thấy ${effectiveTotal} sản phẩm${committedSearch ? ` cho "${committedSearch}"` : ""} ✨`
                : committedSearch
                  ? `Không tìm thấy sản phẩm nào cho "${committedSearch}"`
                  : "Nhập từ khóa để bắt đầu tìm kiếm."}
          </Body>

          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              setCommittedSearch(searchInput.trim());
            }}
            className="mx-auto mb-6 flex max-w-xl items-center gap-2 rounded-full border border-hairline bg-card px-5 py-2 shadow-sm focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(190,24,93,0.10)]"
          >
            <SearchIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm kiếm…"
              aria-label="Tìm kiếm sản phẩm"
              className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:shadow-none"
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Xóa tìm kiếm"
                onClick={() => {
                  setSearchInput("");
                  setCommittedSearch("");
                }}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              aria-label="Tìm bằng giọng nói"
              className="hidden h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent sm:grid"
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Mở bộ lọc nâng cao"
              className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setSearchInput(chip);
                  setCommittedSearch(chip);
                }}
                className="rounded-full border border-hairline bg-card px-4 py-1.5 text-[12px] text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
              >
                {chip}
              </button>
            ))}
          </div>
        </Container>
      </Section>

      {/* =========================== TAB STRIP =========================== */}
      <div className="border-b border-hairline bg-surface">
        <Container size="xl">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <nav
              aria-label="Bộ lọc danh mục"
              className="-mx-1 flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 overflow-x-auto px-1 text-[14px] font-medium"
            >
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTabId(tab.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "whitespace-nowrap border-b-2 pb-1 transition-colors",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-primary",
                    )}
                  >
                  {tab.name}
                  {tab.id === DEFAULT_TAB_ID && effectiveTotal > 0
                    ? ` (${effectiveTotal})`
                    : null}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <SelectSort value={sort} onChange={setSort} />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Xem dạng lưới"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-md transition-colors",
                    view === "grid"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Xem dạng danh sách"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-md transition-colors",
                    view === "list"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  <ListIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* =========================== SIDEBAR + GRID =========================== */}
      <Section tone="default" spacing="md" containerSize="xl">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar (filters) — sticky on desktop */}
          <aside className="w-full shrink-0 space-y-6 rounded-xl border border-hairline bg-card p-6 lg:sticky lg:top-24 lg:w-[240px]">
            <div>
              <Headline as="h2" level="md" className="text-foreground">
                Lọc theo
              </Headline>
            </div>

            <FilterGroup
              title="Kích thước"
              options={[
                { id: "50-52", label: "Ni 50-52 (Nhỏ)" },
                { id: "54-56", label: "Ni 54-56 (Trung bình)" },
                { id: "58+", label: "Ni 58+ (Lớn)" },
              ]}
              selected={sizeFilter}
              onToggle={(value) =>
                setSizeFilter((prev) => (prev === value ? "all" : (value as typeof sizeFilter)))
              }
            />

            <FilterGroup
              title="Loại đá"
              options={[
                { id: "jadeite", label: "Jadeite thiên nhiên" },
                { id: "landscape", label: "Cẩm thạch sơn thủy" },
              ]}
              selected={stoneFilter}
              onToggle={(value) =>
                setStoneFilter((prev) => (prev === value ? "all" : (value as typeof stoneFilter)))
              }
            />

            <div className="flex gap-3 pt-2">
              <Button className="flex-1">Áp dụng</Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSizeFilter("all");
                  setStoneFilter("all");
                }}
              >
                Đặt lại
              </Button>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {productsQuery.isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : productsQuery.isError ? (
              <ErrorState
                error={productsQuery.error}
                onRetry={() => productsQuery.refetch()}
              />
            ) : effectiveProducts.length === 0 ? (
              <div className="space-y-4 rounded-xl border border-hairline bg-card p-8 text-center">
                <h3 className="font-headline text-xl italic text-foreground">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-[14px] text-muted-foreground">
                  {committedSearch
                    ? `Không có kết quả nào cho "${committedSearch}". Thử đổi từ khóa hoặc bỏ bớt bộ lọc.`
                    : "Hiện chưa có sản phẩm nào phù hợp với bộ lọc đã chọn."}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchInput("");
                    setCommittedSearch("");
                    setActiveTabId(DEFAULT_TAB_ID);
                    setSizeFilter("all");
                    setStoneFilter("all");
                  }}
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-4 md:gap-6",
                  view === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1",
                )}
              >
                {effectiveProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {effectivePagination && effectivePagination.total_pages > 1 && (
              <div className="mt-8">
                <PaginationControl
                  pagination={effectivePagination}
                  onPageChange={(next) => {
                    setPage(next);
                    if (typeof window !== "undefined") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* =========================== EDITORIAL =========================== */}
      <Section tone="muted" spacing="lg" containerSize="xl">
        <Headline as="h2" level="md" className="mb-8 text-center italic">
          Bạn có thể quan tâm
        </Headline>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {EDITORIAL_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative h-64 overflow-hidden rounded-xl"
            >
              <Image
                src={resolveImageUrl(card.image)}
                alt={card.title}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-serif text-2xl font-semibold">{card.title}</h3>
                <p className="mt-1 flex items-center gap-1 text-[14px] text-white/80">
                  {card.cta}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ========================================================================== *
 * Local helpers — small enough to keep co-located; not exported.
 * ========================================================================== */

const SORT_OPTIONS = [
  { value: "default" as const, label: "Mặc định" },
  { value: "price-asc" as const, label: "Giá: Thấp đến Cao" },
  { value: "price-desc" as const, label: "Giá: Cao đến Thấp" },
  { value: "newest" as const, label: "Mới nhất" },
];

function SelectSort({
  value,
  onChange,
}: {
  value: "default" | "price-asc" | "price-desc" | "newest";
  onChange: (next: "default" | "price-asc" | "price-desc" | "newest") => void;
}) {
  return (
    <SortDropdown
      value={value}
      onChange={onChange}
      options={SORT_OPTIONS}
      placeholder="Sắp xếp"
      hideLabel
    />
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { id: string; label: string }[];
  selected: string;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="border-b border-hairline pb-6 last:border-0">
      <h3 className="mb-3 flex items-center justify-between text-[14px] font-medium text-foreground">
        {title}
        <ChevronRight
          className="h-4 w-4 -rotate-90 text-muted-foreground"
          aria-hidden="true"
        />
      </h3>
      <ul className="space-y-2">
        {options.map((option) => {
          const checked = selected === option.id;
          return (
            <li key={option.id}>
              <label className="flex cursor-pointer items-center gap-2 text-[14px] text-muted-foreground">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggle(option.id)}
                />
                <span>{option.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Editorial cards. Image URLs and copy come from the canonical Stitch
 * design source `b6a2c4eb244a4c5299f0ae01f9e5621a` so this block stays
 * pixel-faithful until the marketing team wires a content slot here.
 */
const EDITORIAL_CARDS = [
  {
    title: "Cách chọn Ni vòng",
    cta: "Xem hướng dẫn",
    href: "/about",
    image:
      "https://i.pinimg.com/736x/7a/49/64/7a49649d4653b7328cd4cdfe27690675.jpg",
  },
  {
    title: "Dior Addict Lip Glow",
    cta: "Khám phá",
    href: "/products",
    image:
      "https://i.pinimg.com/736x/73/a6/5e/73a65e9332cc0ef0e5dcdeb156188332.jpg",
  },
  {
    title: "Quà Tặng Cho Nàng",
    cta: "Xem bộ sưu tập",
    href: "/products",
    image:
      "https://i.pinimg.com/736x/86/86/cf/8686cff7abc525c02cfc60333b851a54.jpg",
  },
] as const;
