"use client";

import * as React from "react";
import {
  Loader2,
  Plus,
  Search,
  Check,
  X as XIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn, resolveImageUrl } from "@/lib/utils";
import { useProductList } from "@/features/products/hooks";
import { queryKeys } from "@/lib/query";
import { productsApi } from "@/features/products/api";
import type { Product, ProductListItem, ID } from "@/types";

/**
 * Props for the picker.
 *
 * `selectedIds` is the canonical ordered list of product IDs the
 * admin has picked for the current collection. `onChange` receives
 * the new ordered list whenever the admin confirms the dialog.
 * Existing order is preserved; newly-added IDs go to the end so the
 * admin can keep track of what they just added.
 */
export interface ProductPickerProps {
  selectedIds: ID[];
  onChange: (nextIds: ID[]) => void;
  disabled?: boolean;
  /** Maximum number of products the collection can hold. */
  maxItems?: number;
}

const PER_PAGE = 24;

/**
 * `ProductPicker` — admin-side control that lets the user
 * 1. search the product catalog (`useProductList`),
 * 2. tick the products they want in the featured collection,
 * 3. confirm and have them merged into the ordered `selectedIds`
 *    without disturbing existing items.
 */
export function ProductPicker({
  selectedIds,
  onChange,
  disabled,
  maxItems = 100,
}: ProductPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Local working set inside the dialog — accumulates between opens.
  const [pendingIds, setPendingIds] = React.useState<Set<ID>>(
    () => new Set(selectedIds),
  );

  // Reset the pending set whenever the dialog re-opens so the
  // checkboxes reflect the latest committed selection.
  React.useEffect(() => {
    if (open) {
      setPendingIds(new Set(selectedIds));
      setSearch("");
      setPage(1);
    }
  }, [open, selectedIds]);

  const list = useProductList({ search, page, per_page: PER_PAGE });

  const isAtCap = selectedIds.length >= maxItems;

  const handleAdd = React.useCallback(() => {
    const seen = new Set(selectedIds);
    const merged: ID[] = [...selectedIds];
    for (const id of pendingIds) {
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(id);
      }
    }
    onChange(merged);
    setOpen(false);
  }, [pendingIds, selectedIds, onChange]);

  const togglePending = React.useCallback((id: ID) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isAtCap}
          aria-label="Mở hộp thoại chọn sản phẩm"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Thêm sản phẩm</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chọn sản phẩm cho bộ sưu tập</DialogTitle>
          <DialogDescription>
            Tick các sản phẩm muốn đưa vào bộ sưu tập. Đã chọn{" "}
            <strong>{pendingIds.size}</strong> / tối đa {maxItems}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Search
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên sản phẩm…"
            aria-label="Tìm sản phẩm"
            className="flex-1"
          />
        </div>

        <div
          role="region"
          aria-label="Danh sách sản phẩm"
          className="max-h-[420px] overflow-y-auto rounded-lg border border-hairline"
        >
          {list.isLoading ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Đang tải sản phẩm…
            </div>
          ) : list.isError ? (
            <div className="p-6 text-sm text-destructive">
              Không thể tải danh sách sản phẩm. Vui lòng thử lại.
            </div>
          ) : (list.data?.items ?? []).length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            <ul className="divide-y divide-hairline">
              {(list.data?.items ?? []).map((p) => {
                const checked = pendingIds.has(p.id);
                const disabledByCap =
                  !checked && pendingIds.size >= maxItems;
                return (
                  <li key={p.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-container-low",
                        disabledByCap && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {
                          if (disabledByCap) return;
                          togglePending(p.id);
                        }}
                        disabled={disabledByCap}
                        aria-label={`Chọn ${p.name}`}
                      />
                      <ProductThumb url={p.thumbnail_url} alt={p.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-foreground">
                          {p.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.category?.name ?? "Chưa phân loại"} ·{" "}
                          {formatPrice(p.price)}
                        </p>
                      </div>
                      {checked && (
                        <Check
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <PaginationBar list={list} page={page} setPage={setPage} />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Huỷ
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleAdd}>
            Thêm vào bộ sưu tập
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductThumb({
  url,
  alt,
  size = "md",
}: {
  url: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}) {
  const resolved = resolveImageUrl(url);
  const sizeClass =
    size === "lg"
      ? "h-16 w-16 sm:h-[68px] sm:w-[68px]"
      : size === "sm"
        ? "h-10 w-10"
        : "h-12 w-12 sm:h-14 sm:w-14";
  const placeholderText = size === "lg" ? "text-sm" : "text-[10px]";
  if (!resolved) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl border border-hairline bg-surface-container-low text-muted-foreground",
          sizeClass,
          placeholderText,
        )}
        aria-hidden="true"
      >
        ?
      </div>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={resolved}
      alt={alt}
      className={cn(
        "shrink-0 rounded-xl border border-hairline object-cover shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_8px_rgba(15,23,42,0.04)]",
        sizeClass,
      )}
      loading="lazy"
    />
  );
}

function PaginationBar({
  list,
  page,
  setPage,
}: {
  list: ReturnType<typeof useProductList>;
  page: number;
  setPage: (p: number) => void;
}) {
  const total = list.data?.pagination.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
  if (total <= PER_PAGE) return null;
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Trang {page} / {lastPage} · {total} sản phẩm
      </span>
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page <= 1 || list.isFetching}
          onClick={() => setPage(page - 1)}
          aria-label="Trang trước"
        >
          <ChevronUp className="h-3.5 w-3.5 -rotate-90" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page >= lastPage || list.isFetching}
          onClick={() => setPage(page + 1)}
          aria-label="Trang sau"
        >
          <ChevronDown className="h-3.5 w-3.5 -rotate-90" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function formatPrice(vnd: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(vnd);
}

/* ------------------------------------------------------------------ *
 * `SelectedProductList` — companion control that renders the current
 * ordered list inline, with reorder + remove affordances. Sits next to
 * the picker so the admin can see at a glance what's in the collection.
 * ------------------------------------------------------------------ */

export interface SelectedProductListProps {
  ids: ID[];
  onChange: (nextIds: ID[]) => void;
  disabled?: boolean;
}

export function SelectedProductList({
  ids,
  onChange,
  disabled,
}: SelectedProductListProps) {
  const lookup = useProductLookup(ids);

  const move = React.useCallback(
    (index: number, direction: -1 | 1) => {
      const target = index + direction;
      if (target < 0 || target >= ids.length) return;
      const next = ids.slice();
      const [item] = next.splice(index, 1);
      if (item === undefined) return;
      next.splice(target, 0, item);
      onChange(next);
    },
    [ids, onChange],
  );

  const remove = React.useCallback(
    (index: number) => {
      const next = ids.slice();
      next.splice(index, 1);
      onChange(next);
    },
    [ids, onChange],
  );

  if (ids.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-hairline bg-surface-container-low/40 px-4 py-8 text-center text-[13px] text-muted-foreground">
        Chưa chọn sản phẩm nào. Bấm <strong>Thêm sản phẩm</strong> bên dưới để
        bắt đầu.
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-3" aria-label="Sản phẩm đã chọn">
      {ids.map((id, idx) => {
        const product = lookup.get(id);
        const isFirst = idx === 0;
        const isLast = idx === ids.length - 1;
        return (
          <li
            key={id}
            className={cn(
              "group relative flex items-stretch gap-4 overflow-hidden rounded-2xl border border-hairline bg-card p-3 transition-colors",
              "hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-[0_4px_18px_-8px_rgba(15,23,42,0.12)]",
              disabled && "opacity-60",
            )}
          >
            <ProductThumb
              url={product?.thumbnail_url ?? ""}
              alt={product?.name ?? id}
              size="lg"
            />

            <div className="min-w-0 flex-1 py-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-[11px] font-semibold tracking-wide",
                    isFirst
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-surface-container-low text-muted-foreground",
                  )}
                  aria-label={`Vị trí ${idx + 1}`}
                >
                  #{idx + 1}
                </span>
                {product?.category?.name && (
                  <span className="truncate text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
                    {product.category.name}
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-[15px] font-medium leading-tight text-foreground">
                {product?.name ?? "Sản phẩm đã xoá khỏi hệ thống"}
              </p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {product ? formatPrice(product.price) : "—"}
              </p>
            </div>

            <div className="flex shrink-0 items-center self-center gap-0.5 rounded-lg border border-hairline bg-surface-container-low/50 p-0.5">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                disabled={disabled || isFirst}
                onClick={() => move(idx, -1)}
                aria-label="Di chuyển lên trên"
              >
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                disabled={disabled || isLast}
                onClick={() => move(idx, 1)}
                aria-label="Di chuyển xuống dưới"
              >
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
              <span className="mx-0.5 h-4 w-px bg-hairline" aria-hidden="true" />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                disabled={disabled}
                onClick={() => remove(idx)}
                aria-label="Xoá khỏi danh sách"
              >
                <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Resolve the ID list to `ProductListItem` entries:
 *   - pull a single product list page that should cover most IDs,
 *   - fill any remaining IDs by hitting `productsApi.get(id)` via
 *     `useQueries` (parallel, dynamic count).
 *
 * `useQueries` is the React Query recommended approach for dynamic
 * parallel queries — calling hooks in a loop is a React anti-pattern.
 */
function useProductLookup(ids: ID[]): Map<ID, ProductListItem> {
  const list = useProductList({ page: 1, per_page: Math.max(ids.length, PER_PAGE) });
  const firstPageMap = React.useMemo<Map<ID, ProductListItem>>(() => {
    const m = new Map<ID, ProductListItem>();
    for (const item of list.data?.items ?? []) m.set(item.id, item);
    return m;
  }, [list.data]);

  const missing = React.useMemo(
    () => ids.filter((id) => !firstPageMap.has(id)),
    [ids, firstPageMap],
  );

  const detailQueries = useQueries({
    queries: missing.map((id) => ({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => productsApi.get(id),
      enabled: Boolean(id),
      staleTime: 60_000,
    })),
  });

  const detailMap = React.useMemo<Map<ID, ProductListItem>>(() => {
    const m = new Map<ID, ProductListItem>();
    missing.forEach((id, idx) => {
      const data = detailQueries[idx]?.data;
      if (!data) return;
      m.set(id, projectProduct(data));
    });
    return m;
  }, [missing, detailQueries]);

  return React.useMemo(() => {
    const merged: Map<ID, ProductListItem> = new Map(firstPageMap);
    for (const [id, p] of detailMap) merged.set(id, p);
    return merged;
  }, [firstPageMap, detailMap]);
}

/**
 * `Product` (full detail) → `ProductListItem` shape used by the
 * picker previews. The list endpoint returns the slim shape
 * already, but the detail endpoint returns the full `Product`.
 */
function projectProduct(p: Product): ProductListItem {
  // Backend wire format for `ProductImage` is `{ id, url }` but the
  // shared `ProductImage` type in `domain.ts` still uses
  // `image_url`. We accept either to stay robust against the
  // existing type drift.
  const firstImage =
    p.images?.[0]?.image_url ?? (p.images?.[0] as unknown as { url?: string } | undefined)?.url ?? "";
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    status: p.status,
    price: p.price,
    compare_at: p.compare_at ?? null,
    cost: p.cost ?? null,
    thumbnail_url: firstImage,
    category: p.category
      ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
      : null,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}