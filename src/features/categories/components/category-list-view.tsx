"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCategoryList } from "../hooks/use-category-list";
import { Pagination, ErrorState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/types";
import type { Pagination as PaginationData } from "@/types";

/**
 * `CategoryListView` — LuxeOps dark Monolith (Stitch) skin for
 * `/admin/categories`. Mirrors screen
 * `8bd341856e1b4e0889665948e6dd84cc` (project 29642013742130547).
 */

interface CategoryExtras {
  product_count?: number;
  sort_order?: number;
  image_url?: string | null;
  created_at?: string;
}

type CategoryView = Category & CategoryExtras;

export function CategoryListView() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const list = useCategoryList({ page, per_page: 10 });
  const items = React.useMemo(
    () => (list.data?.items ?? []) as CategoryView[],
    [list.data],
  );
  const total = list.data?.pagination?.total ?? 0;

  // Counts are derived only from the live list. Returning 0 when we
  // don't yet have data preserves the truth value (no fake
  // placeholder numbers like "8/7/1/47" so the badge can never lie
  // about the catalog state).
  const counts = React.useMemo(() => {
    const activeCount = items.filter((c) => c.is_active).length;
    const hiddenCount = items.length - activeCount;
    const productTotal = items.reduce(
      (s, c) => s + ((c.product_count ?? 0) as number),
      0,
    );
    return {
      total,
      active: activeCount,
      hidden: hiddenCount,
      productTotal,
    };
  }, [items, total]);

  if (list.isError) {
    return (
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-6">
        <Header onAdd={() => router.push("/admin/categories/new")} />
        <ErrorState
          error={list.error}
          onRetry={() => list.refetch()}
          title="Không tải được danh mục"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-6">
      <Header onAdd={() => router.push("/admin/categories/new")} />

      <KpiRow
        total={counts.total}
        active={counts.active}
        hidden={counts.hidden}
        productTotal={counts.productTotal}
      />

      <TableCard
        items={items}
        isLoading={list.isLoading}
        pagination={list.data?.pagination}
        onPageChange={setPage}
        onOpen={(c) => router.push(`/admin/categories/${c.id}/edit`)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Header
 * ------------------------------------------------------------------ */
function Header({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="mb-lg flex items-end justify-between">
      <div>
        <h1 className="mb-1 text-[24px] font-semibold leading-[32px] tracking-[-0.02em] text-foreground">
          Danh mục sản phẩm
        </h1>
        <p className="text-[13px] leading-[18px] text-muted-foreground">
          Tổ chức cấu trúc sản phẩm theo nhóm
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded border border-rose-100 bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-white"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">filter_list</span>
          Lọc
        </button>
        <Button onClick={onAdd}>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
          Thêm danh mục
        </Button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ *
 * KPI row
 * ------------------------------------------------------------------ */
function KpiRow({ total, active, hidden, productTotal }: { total: number; active: number; hidden: number; productTotal: number }) {
  return (
    <div className="mb-lg grid grid-cols-4 gap-4">
      <KpiCard label="Tổng danh mục" value={String(total)} />
      <KpiCard label="Đang hiển thị" value={String(active)} />
      <KpiCard label="Ẩn" value={String(hidden)} />
      <KpiCard
        label="Sản phẩm phân bổ"
        value={
          <>
            {productTotal}{" "}
            <span className="text-[13px] font-normal leading-[18px] text-muted-foreground">SKU</span>
          </>
        }
      />
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border border-rose-100 bg-white p-4">
      <p className="mb-2 text-[11px] font-medium uppercase leading-[16px] tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-[36px] font-semibold leading-[44px] tracking-[-0.04em] text-foreground">
        {value}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Table card
 * ------------------------------------------------------------------ */
function TableCard({
  items,
  isLoading,
  pagination,
  onPageChange,
  onOpen,
}: {
  items: CategoryView[];
  isLoading: boolean;
  pagination: PaginationData | undefined;
  onPageChange: (p: number) => void;
  onOpen: (c: Category) => void;
}) {

  return (
    <div className="flex flex-col overflow-hidden rounded border border-rose-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px] text-foreground">
          <thead>
            <tr className="border-b border-rose-100">
              <Th className="w-12">#</Th>
              <Th>#</Th>
              <Th>Tên danh mục</Th>
              <Th>Slug</Th>
              <Th className="text-right">Số SP</Th>
              <Th>Thứ tự</Th>
              <Th>Trạng thái</Th>
              <Th>Ngày tạo</Th>
              <Th className="text-right">Thao tác</Th>
            </tr>
          </thead>
          <tbody className="text-[13px] leading-[18px]">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-surface-container-high" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-muted-foreground">
                  <span className="material-symbols-outlined mx-auto mb-2 block h-8 w-8 text-[#3f3f46]" aria-hidden="true">category</span>
                  Chưa có danh mục nào
                </td>
              </tr>
            ) : (
              items.map((c, idx) => (
                <Row
                  key={c.id}
                  c={c}
                  index={idx + (pagination?.offset ?? 0) + 1}
                  onOpen={() => onOpen(c)}
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
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-[12px] font-medium uppercase leading-[16px] tracking-[0.05em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function Row({ c, index, onOpen }: { c: CategoryView; index: number; onOpen: () => void }) {
  const slug = (c as unknown as { slug?: string }).slug ?? c.id.slice(0, 8);
  const productCount = c.product_count ?? 0;
  const sortOrder = c.sort_order ?? index;
  const image = c.image_url ?? null;
  const createdAt = c.created_at ? formatDate(c.created_at) : "—";
  const iconName = iconForCategory(c.name, index);

  return (
    <tr className="group border-b border-rose-100 transition-colors hover:bg-surface-container">
      <td className="px-4 py-3 font-mono text-[13px] leading-[20px] text-muted-foreground">{index}</td>
      <td className="px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded border border-rose-100 bg-surface">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" aria-hidden="true" className="h-full w-full rounded object-cover" />
          ) : (
            <span className={cn("material-symbols-outlined text-[20px]", index <= 7 ? "text-[#e11d74]" : "text-muted-foreground")} aria-hidden="true">
              {iconName}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={onOpen}
          className="text-left text-[13px] font-medium leading-[18px] text-foreground hover:text-[#e11d74]"
        >
          {c.name}
        </button>
      </td>
      <td className="px-4 py-3 font-mono text-[13px] leading-[20px] text-muted-foreground">{slug}</td>
      <td className="px-4 py-3 text-right font-mono text-[13px] leading-[20px] text-foreground">{productCount} SP</td>
      <td className="px-4 py-3 font-mono text-[13px] leading-[20px] text-muted-foreground">{sortOrder}</td>
      <td className="px-4 py-3">
        <StatusIndicator active={c.is_active} />
      </td>
      <td className="px-4 py-3 font-mono text-[13px] leading-[20px] text-muted-foreground">{createdAt}</td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          aria-label="Thêm thao tác"
          className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          onClick={onOpen}
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">more_horiz</span>
        </button>
      </td>
    </tr>
  );
}

function StatusIndicator({ active }: { active: boolean }) {
  if (active) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
        <span>Hiển thị</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
      <span className="text-muted-foreground">Ẩn</span>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function iconForCategory(_name: string, _index: number): string {
  // Stable set of Material icons for category thumbnails, no random
  // behaviour. Mirrors Stitch's pattern where most categories use
  // `radio_button_unchecked` and the last uses `redeem`.
  const pool = [
    "radio_button_unchecked",
    "redeem",
    "category",
    "diamond",
    "spa",
    "watch",
  ];
  const i = (Math.abs(hashString(_name ?? "") + _index) % pool.length + pool.length) % pool.length;
  return pool[i] ?? pool[0]!;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
