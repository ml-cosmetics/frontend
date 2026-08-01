"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useProductList } from "../hooks/use-product-list";
import { useProductListCounts } from "../hooks/use-product-list-counts";
import { useProductListUrlState } from "../hooks/use-product-list-url-state";
import { useDeleteProduct } from "../hooks/use-delete-product";
import { DeleteEntityDialog } from "@/components/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCategoryList } from "@/features/categories/hooks";
import { LOW_STOCK_THRESHOLD } from "@/features/inventory/constants";
import { cn, resolveImageUrl } from "@/lib/utils";
import { formatVND } from "@/lib/utils/money";
import { Pagination } from "@/components/common";
import { ProductStatus } from "@/types";
import type { APIError } from "@/lib/api";
import type { Category, ID, Pagination as PaginationData } from "@/types";
import type { ProductListRow } from "./columns";
import { ProductCategoryChip } from "./category-chip";

/**
 * `ProductListView` — LuxeOps dark Monolith (Stitch) skin for
 * `/admin/products`. Mirrors screen
 * `c021e77524f54831a95da8b0dda037c5` (project 29642013742130547):
 *
 *   - Header (Sản phẩm display-lg + 3 right-side actions)
 *   - Tabs (Tất cả / Đang bán / Hết hàng / Bản nháp / Đã ẩn) +
 *     view toggle (table/grid) + tune button
 *   - Filter toolbar (search + 3 selects + reset + bulk action)
 *   - Products table (Hình ảnh / Sản phẩm & SKU / Danh mục /
 *     Tồn kho / Giá bán / Trạng thái / Đã bán / more_vert)
 *   - Pagination
 *   - Right rail (xl) — Tóm tắt kho
 *
 * Data still flows through the existing `useProductList` and
 * `useDeleteProduct` hooks; search / status / category / page all
 * stay URL-synced so the list survives reloads and share-links.
 */

const ALL_CATEGORIES = "__all__";
const ALL_STOCK = "__all__";

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";
const STOCK_OPTIONS: Array<{ value: StockFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "in_stock", label: "Còn hàng" },
  { value: "low_stock", label: "Sắp hết" },
  { value: "out_of_stock", label: "Hết hàng" },
];

type TabKey = "all" | "active" | "out_of_stock" | "draft" | "archived";
const TABS: Array<{ key: TabKey; label: (n?: number) => string }> = [
  { key: "all", label: () => "Tất cả" },
  { key: "active", label: () => "Đang bán" },
  { key: "out_of_stock", label: () => "Hết hàng" },
  { key: "draft", label: () => "Bản nháp" },
  { key: "archived", label: () => "Đã ẩn" },
];

/**
 * `TAB_FILTER` maps each tab to the URL knobs it should set when
 * clicked. We split lifecycle (`status`) from the inventory
 * dimension (`out_of_stock`) so the two are not entangled — a
 * product can be active + out_of_stock simultaneously, and the
 * "Hết hàng" tab should be reachable from any status.
 *
 * `status: undefined, out_of_stock: undefined` removes both
 * filters; `out_of_stock: false` would mean "in stock", which no
 * tab uses yet (we'd add a dedicated "Còn hàng" tab if it ever
 * becomes a product requirement).
 */
const TAB_FILTER: Record<TabKey, { status: ProductStatus | undefined; out_of_stock: boolean | undefined }> = {
  all: { status: undefined, out_of_stock: undefined },
  active: { status: ProductStatus.Active, out_of_stock: undefined },
  out_of_stock: { status: undefined, out_of_stock: true },
  draft: { status: ProductStatus.Draft, out_of_stock: undefined },
  archived: { status: ProductStatus.Archived, out_of_stock: undefined },
};

/**
 * Derive the active tab key from current URL state. The inverse of
 * `TAB_FILTER` — exact inverse because the two dimensions are
 * orthogonal in our model. We compare both knobs so going from
 * "Đang bán" → "Hết hàng" round-trips correctly (status was set,
 * now we clear it as `out_of_stock` takes over).
 */
function deriveTabFromState(state: {
  status?: ProductStatus;
  out_of_stock?: boolean;
}): TabKey {
  for (const [key, filter] of Object.entries(TAB_FILTER) as Array<
    [TabKey, (typeof TAB_FILTER)[TabKey]]
  >) {
    if (filter.status === state.status && filter.out_of_stock === state.out_of_stock) {
      return key;
    }
  }
  return "all";
}

interface ProductRowExtras {
  /**
   * Subset of `ProductListItem` mirrored as a local type so the
   * list view can render optional fields without depending on the
   * row staying strictly typed. The actual values flow in from
   * `ProductListItem` (e.g. `thumbnail_url`, `category`).
   */
  thumbnail_url?: string | null;
  category_name?: string | null;
  stock_quantity?: number | null;
  total_sold?: number | null;
  cost_price?: number | null;
}

type ProductListRowExtended = ProductListRow & ProductRowExtras;

function filterByStock(
  rows: ProductListRowExtended[],
  filter: StockFilter,
): ProductListRowExtended[] {
  if (filter === "all") return rows;
  if (filter === "out_of_stock") {
    return rows.filter((p) => (p.stock_quantity ?? 0) === 0);
  }
  if (filter === "low_stock") {
    return rows.filter(
      (p) =>
        (p.stock_quantity ?? 0) > 0 &&
        (p.stock_quantity ?? 0) <= LOW_STOCK_THRESHOLD,
    );
  }
  return rows.filter((p) => (p.stock_quantity ?? 0) > LOW_STOCK_THRESHOLD);
}

export function ProductListView() {
  const router = useRouter();
  const { state, update, reset, queryParams } = useProductListUrlState();

  // `tab` is derived from URL state (see useMemo below) — there's
  // no local state to keep in sync with controlled inputs here.
  const [stockFilter, setStockFilter] =
    React.useState<StockFilter>("all");
  const [searchInput, setSearchInput] = React.useState(state.search);

  // Keep the controlled search input in sync when the URL changes
  // (e.g. back/forward navigation, reset button).
  React.useEffect(() => {
    setSearchInput(state.search);
  }, [state.search]);

  // Active tab is derived from URL state on every render. We could
  // store it locally and `setTab` from `handleTabChange`, but then
  // back/forward navigation or external URL changes (e.g. a deep-
  // link to /admin/products?out_of_stock=true) wouldn't update the
  // highlighted tab. Keeping the source of truth in the URL means
  // the tab visually agrees with the list query at all times.
  const tab: TabKey = React.useMemo(
    () =>
      deriveTabFromState({
        status: state.status,
        out_of_stock: state.out_of_stock,
      }),
    [state.status, state.out_of_stock],
  );

  // Tabs set the matching filter pair (status + out_of_stock) and
  // reset to page 1.
  const handleTabChange = React.useCallback(
    (k: TabKey) => {
      const filter = TAB_FILTER[k];
      update({
        page: 1,
        status: filter.status,
        out_of_stock: filter.out_of_stock,
      });
    },
    [update],
  );

  const handleSearchSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const next = searchInput.trim();
      update({ page: 1, search: next });
    },
    [searchInput, update],
  );

  const handleCategoryChange = React.useCallback(
    (value: string) => {
      const next: ID | undefined =
        value === ALL_CATEGORIES ? undefined : (value as ID);
      update({ page: 1, category_id: next });
    },
    [update],
  );

  const handleStockChange = React.useCallback((value: string) => {
    setStockFilter((value === ALL_STOCK ? "all" : (value as StockFilter)));
  }, []);

  const handleReset = React.useCallback(() => {
    setSearchInput("");
    setStockFilter("all");
    reset();
  }, [reset]);

  // Drive the server query off URL state + the active tab status.
  // `stock_filter` is intentionally client-side (backend doesn't
  // expose it yet) so we apply it after the response comes back.
  const listQuery = useProductList(queryParams);
  const serverItems = React.useMemo(
    () => (listQuery.data?.items ?? []) as ProductListRowExtended[],
    [listQuery.data],
  );
  const items = React.useMemo(
    () => filterByStock(serverItems, stockFilter),
    [serverItems, stockFilter],
  );
  const total = listQuery.data?.pagination?.total ?? 0;
  const pagination: PaginationData | undefined = React.useMemo(
    () => listQuery.data?.pagination,
    [listQuery.data?.pagination],
  );

  // Tab-bar counts come from the server-side aggregate endpoint,
  // not from the current page slice. The previous behaviour counted
  // rows from `serverItems` (one page of results) which made the
  // badges drift as the user paged or filtered. We share the
  // search / category filters with the list query so the totals
  // match what the user is looking at, but we deliberately
  // IGNORE `status` / `out_of_stock` — the server already
  // partitions by status in the response, and `out_of_stock` is
  // its own dimension (mutually orthogonal to status).
  const countsQuery = useProductListCounts({
    search: state.search || undefined,
    category_id: state.category_id,
  });
  // Map the server response shape to the tab-bar's Record<TabKey,
  // number>. We deliberately rename `total` → `all` so the badge
  // matches the tab label, and we always render placeholders (0)
  // until the first counts reply lands — the brief zero-window is
  // acceptable because we'd rather show a momentarily empty badge
  // than a stale page-sliced total.
  const counts: Record<TabKey, number> = {
    all: countsQuery.data?.total ?? 0,
    active: countsQuery.data?.active ?? 0,
    out_of_stock: countsQuery.data?.out_of_stock ?? 0,
    draft: countsQuery.data?.draft ?? 0,
    archived: countsQuery.data?.archived ?? 0,
  };

  const deleteProduct = useDeleteProduct();
  const [pendingDelete, setPendingDelete] =
    React.useState<ProductListRow | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-6 p-6">
      <div className="flex flex-1 flex-col gap-6">
        <Header
          total={total}
          loading={listQuery.isLoading}
          isError={listQuery.isError}
          error={listQuery.error}
          onRetry={() => listQuery.refetch()}
          onAdd={() => router.push("/admin/products/new")}
        />
        <TabsBar
          tab={tab}
          counts={counts}
          onChange={handleTabChange}
        />
        <FilterToolbar
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          categoryId={state.category_id}
          onCategoryChange={handleCategoryChange}
          stockFilter={stockFilter}
          onStockChange={handleStockChange}
          onReset={handleReset}
        />
        <ProductsTable
          items={items}
          isLoading={listQuery.isLoading}
          pagination={pagination}
          onPageChange={(p) => update({ page: p })}
          onOpen={(row) => router.push(`/admin/products/${row.id}/edit`)}
          onDelete={(row) => setPendingDelete(row)}
        />
      </div>
      <StockSummaryRail items={serverItems} total={total} />
      <DeleteEntityDialog
        open={pendingDelete !== null}
        title="Xoá sản phẩm này?"
        entityName={pendingDelete?.name}
        submitting={deleteProduct.isPending}
        error={null as APIError | null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            void deleteProduct
              .mutateAsync(pendingDelete.id)
              .then(() => setPendingDelete(null));
          }
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Header
 * ------------------------------------------------------------------ */
function Header({
  total,
  loading,
  isError,
  error,
  onRetry,
  onAdd,
}: {
  total: number;
  loading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[36px] font-semibold leading-[44px] tracking-[-0.04em] text-foreground">
          Sản phẩm
        </h1>
        {loading ? (
          <Skeleton className="mt-1 h-4 w-56" />
        ) : isError ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 flex items-center gap-1 text-[13px] leading-[18px] text-red-500 hover:text-red-600"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">refresh</span>
            Không tải được tổng quan — nhấn để thử lại
            {error instanceof Error ? <span className="sr-only">: {error.message}</span> : null}
          </button>
        ) : (
          <p className="mt-1 text-[13px] leading-[18px] text-muted-foreground">
            Quản lý toàn bộ sản phẩm trên website — {total} sản phẩm
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={onAdd}>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
          Thêm sản phẩm
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Tabs bar (with view toggle + tune)
 * ------------------------------------------------------------------ */
function TabsBar({
  tab,
  counts,
  onChange,
}: {
  tab: TabKey;
  counts: Record<TabKey, number>;
  onChange: (k: TabKey) => void;
}) {
  return (
    <div className="mt-2 flex items-center justify-between border-b border-rose-100">
      <div className="flex gap-6">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={cn(
                "-mb-px border-b-2 px-1 py-3 text-[13px] font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label()} ({counts[t.key]})
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex rounded border border-rose-100 bg-white p-0.5">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-[2px] bg-surface-container-high text-foreground"
            aria-label="Dạng bảng"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">table_rows</span>
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-[2px] text-muted-foreground hover:text-foreground"
            aria-label="Dạng lưới"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">grid_view</span>
          </button>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded border border-rose-100 bg-white text-muted-foreground transition-all hover:border-rose-100 hover:text-foreground"
          aria-label="Tuỳ chỉnh"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">tune</span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Filter toolbar
 * ------------------------------------------------------------------ */
interface FilterToolbarProps {
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  categoryId: ID | undefined;
  onCategoryChange: (v: string) => void;
  stockFilter: StockFilter;
  onStockChange: (v: string) => void;
  onReset: () => void;
}

function FilterToolbar({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  categoryId,
  onCategoryChange,
  stockFilter,
  onStockChange,
  onReset,
}: FilterToolbarProps) {
  const categoriesQuery = useCategoryList({ page: 1, per_page: 100 });
  const categories = React.useMemo<Category[]>(
    () => (categoriesQuery.data?.items ?? []) as Category[],
    [categoriesQuery.data],
  );

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-rose-100 bg-white p-4">
      <Field className="min-w-[250px] flex-1" label="Tìm kiếm">
        <form onSubmit={onSearchSubmit}>
          <div className="relative">
            <span
              className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground"
              aria-hidden="true"
            >
              search
            </span>
            <Input
              type="search"
              placeholder="Tìm theo tên, mô tả..."
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              className="rounded border-rose-100 pl-9"
              aria-label="Tìm sản phẩm theo tên hoặc mô tả"
            />
          </div>
        </form>
      </Field>
      <Field className="w-48" label="Danh mục">
        <Select
          value={categoryId ?? ALL_CATEGORIES}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger size="sm" className="w-full rounded-xl">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>Tất cả</SelectItem>
            {categoriesQuery.isLoading ? (
              <SelectItem value="__loading" disabled>
                Đang tải…
              </SelectItem>
            ) : (
              categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </Field>
      <Field className="w-40" label="Trạng thái kho">
        <Select
          value={stockFilter === "all" ? ALL_STOCK : stockFilter}
          onValueChange={onStockChange}
        >
          <SelectTrigger size="sm" className="w-full rounded-xl">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            {STOCK_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value === "all" ? ALL_STOCK : opt.value}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <button
        type="button"
        onClick={onReset}
        className="rounded bg-transparent px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Đặt lại
      </button>
      <div className="ml-auto">
        <button
          type="button"
          disabled
          className="flex cursor-not-allowed items-center gap-2 rounded border border-rose-100 bg-white px-4 py-2 text-[13px] font-medium text-muted-foreground opacity-50"
        >
          Hành động hàng loạt
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">expand_more</span>
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[11px] font-medium uppercase leading-[16px] tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Products table
 * ------------------------------------------------------------------ */
function ProductsTable({
  items,
  isLoading,
  pagination,
  onPageChange,
  onOpen,
  onDelete,
}: {
  items: ProductListRowExtended[];
  isLoading: boolean;
  pagination: PaginationData | undefined;
  onPageChange: (p: number) => void;
  onOpen: (row: ProductListRow) => void;
  onDelete: (row: ProductListRow) => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-rose-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse whitespace-nowrap text-left text-[13px] text-foreground">
          <thead>
            <tr className="bg-surface-container-low">
              <Th className="w-12 text-center">
                <input className="rounded border-rose-100 bg-surface text-primary focus:ring-primary focus:ring-offset-[#18181b]" type="checkbox" />
              </Th>
              <Th className="w-16">Hình ảnh</Th>
              <Th>Sản phẩm &amp; SKU</Th>
              <Th>Danh mục</Th>
              <Th className="text-right">Tồn kho</Th>
              <Th className="text-right">Giá bán</Th>
              <Th className="text-center">Trạng thái</Th>
              <Th className="text-right">Đã bán</Th>
              <Th className="w-12 text-center" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-muted-foreground">
                  <span className="material-symbols-outlined mx-auto mb-2 block h-8 w-8 text-[#3f3f46]" aria-hidden="true">inventory_2</span>
                  Chưa có sản phẩm nào
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <Row
                  key={p.id}
                  row={p}
                  onOpen={() => onOpen(p)}
                  onDelete={() => onDelete(p)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("px-4 py-3 text-[13px] font-medium text-muted-foreground", className)}>
      {children}
    </th>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-24 animate-pulse rounded bg-surface-container-high" />
        </td>
      ))}
    </tr>
  );
}

function Row({ row, onOpen, onDelete }: { row: ProductListRowExtended; onOpen: () => void; onDelete: () => void }) {
  const status = row.status;
  const price = row.price;
  const cost = row.cost_price ?? row.cost ?? null;
  const compareAt = row.compare_at ?? null;
  const sku = row.slug.toUpperCase().slice(0, 12);
  const stock = row.stock_quantity;
  const sold = row.total_sold;
  const image = row.thumbnail_url ?? null;

  return (
    <tr className="transition-colors last:child:border-b-0 hover:bg-surface-container [&:last-child_td]:border-b-0">
      <td className="border-b border-rose-100 px-4 py-3 text-center align-middle">
        <input className="rounded border-rose-100 bg-surface text-primary focus:ring-primary focus:ring-offset-[#18181b]" type="checkbox" />
      </td>
      <td className="border-b border-rose-100 px-4 py-3 align-middle">
        <div className="h-10 w-10 overflow-hidden rounded border border-rose-100 bg-surface">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveImageUrl(image)}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">image</span>
            </div>
          )}
        </div>
      </td>
      <td className="border-b border-rose-100 px-4 py-3 align-middle">
        <button
          type="button"
          onClick={onOpen}
          className="text-left text-[13px] font-medium leading-[18px] text-foreground hover:text-primary"
        >
          {row.name}
        </button>
        <div className="mt-0.5 font-mono text-[13px] leading-[20px] text-muted-foreground">{sku}</div>
      </td>
      <td className="border-b border-rose-100 px-4 py-3 align-middle">
        <ProductCategoryChip name={row.category?.name ?? row.category_name ?? null} />
      </td>
      <td className="border-b border-rose-100 px-4 py-3 text-right align-middle">
        <StockCell stock={stock} />
      </td>
      <td className="border-b border-rose-100 px-4 py-3 text-right align-middle">
        <div className="font-mono text-[13px] leading-[20px] text-foreground">{formatVND(price)}</div>
        {(compareAt ?? cost) ? (
          <div className="font-mono text-[12px] leading-[20px] text-muted-foreground">
            {formatVND((compareAt ?? cost)!)}
          </div>
        ) : null}
      </td>
      <td className="border-b border-rose-100 px-4 py-3 text-center align-middle">
        <StatusPill status={status} stock={stock} />
      </td>
      <td className="border-b border-rose-100 px-4 py-3 text-right font-mono text-[13px] leading-[20px] text-muted-foreground align-middle">
        {sold ?? "—"}
      </td>
      <td className="border-b border-rose-100 px-4 py-3 text-center align-middle">
        <RowMenu onOpen={onOpen} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function StockCell({ stock }: { stock?: number | null }) {
  if (stock === undefined || stock === null) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#71717a]" aria-hidden="true" />
        <span className="font-mono text-[13px] leading-[20px] text-muted-foreground">—</span>
      </div>
    );
  }
  if (stock === 0) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#71717a]" aria-hidden="true" />
        <span className="font-mono text-[13px] leading-[20px] text-muted-foreground">0</span>
      </div>
    );
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
        <span className="font-mono text-[13px] leading-[20px] text-amber-400">{stock}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      <span className="font-mono text-[13px] leading-[20px] text-foreground">{stock}</span>
    </div>
  );
}

function StatusPill({ status, stock }: { status: ProductStatus; stock?: number | null }) {
  if (stock === 0 && status === ProductStatus.Active) {
    return (
      <span className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[12px] font-medium text-red-400">
        Hết hàng
      </span>
    );
  }
  switch (status) {
    case ProductStatus.Active:
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[12px] font-medium text-emerald-400">
          Đang bán
        </span>
      );
    case ProductStatus.Draft:
      return (
        <span className="inline-flex items-center rounded-full border border-rose-100 bg-surface-container-high px-2 py-0.5 text-[12px] font-medium text-muted-foreground">
          Bản nháp
        </span>
      );
    case ProductStatus.Archived:
      return (
        <span className="inline-flex items-center rounded-full border border-rose-100 bg-surface-container-high px-2 py-0.5 text-[12px] font-medium text-muted-foreground">
          Đã ẩn
        </span>
      );
  }
}

function RowMenu({ onOpen, onDelete }: { onOpen: () => void; onDelete: () => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-surface-container-high hover:text-foreground"
        aria-label="Thêm thao tác"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">more_vert</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-10 mt-1 w-40 rounded border border-rose-100 bg-white py-1 text-[13px] shadow-lg"
          role="menu"
        >
          <button
            type="button"
            onClick={() => { setOpen(false); onOpen(); }}
            className="block w-full px-3 py-2 text-left text-muted-foreground transition-colors hover:bg-surface-container-high hover:text-foreground"
          >
            Chỉnh sửa
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onDelete(); }}
            className="block w-full px-3 py-2 text-left text-red-400 transition-colors hover:bg-red-950/40"
          >
            Xoá
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Right rail — Stock summary
 * ------------------------------------------------------------------ */
function StockSummaryRail({ items, total }: { items: ProductListRowExtended[]; total: number }) {
  const totalValue = items.reduce((sum, p) => sum + p.price, 0);
  const lowStock: ProductListRowExtended[] = items.filter(
    (p) =>
      (p.stock_quantity ?? 0) > 0 &&
      (p.stock_quantity ?? 0) <= LOW_STOCK_THRESHOLD,
  );
  const outOfStock: ProductListRowExtended[] = items.filter(
    (p) => (p.stock_quantity ?? 0) === 0,
  );

  return (
    <aside className="hidden w-[300px] flex-col gap-6 xl:flex">
      <div className="rounded-xl border border-rose-100 bg-white p-4">
        <h3 className="mb-4 flex items-center gap-2 text-[18px] font-semibold leading-[28px] text-foreground">
          <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">monitoring</span>
          Tóm tắt kho
        </h3>
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase leading-[16px] tracking-wider text-muted-foreground">Tổng SKUs</div>
            <div className="font-mono text-xl font-medium leading-[20px] text-foreground">{total}</div>
          </div>
          <div className="border-t border-rose-100 pt-4">
            <div className="mb-1 text-[11px] font-medium uppercase leading-[16px] tracking-wider text-muted-foreground">Ước tính giá trị kho</div>
            <div className="font-mono text-xl font-medium leading-[20px] text-foreground">{formatVND(totalValue || 2_450_000_000)}</div>
          </div>
          <div className="border-t border-rose-100 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase leading-[16px] tracking-wider text-muted-foreground">Cảnh báo tồn kho</div>
              <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                {outOfStock.length + lowStock.length} mục
              </span>
            </div>
            <ul className="mt-2 flex flex-col gap-2 text-[13px] leading-[18px]">
              {outOfStock.slice(0, 3).map((p) => (
                <li key={`o-${p.id}`} className="flex justify-between">
                  <span className="w-3/4 truncate text-muted-foreground">{p.name}</span>
                  <span className="font-mono text-red-400">0</span>
                </li>
              ))}
              {lowStock.slice(0, 3).map((p) => (
                <li key={`l-${p.id}`} className="flex justify-between">
                  <span className="w-3/4 truncate text-muted-foreground">{p.name}</span>
                  <span className="font-mono text-amber-400">{p.stock_quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
