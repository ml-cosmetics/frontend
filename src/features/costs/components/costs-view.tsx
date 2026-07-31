"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Table as TanStackTable } from "@tanstack/react-table";
import {
  ArrowUpRight,
  Calendar,
  Filter,
  Loader2,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CrudListShell,
  DeleteEntityDialog,
  EmptyState,
  Pagination,
  useDebouncedValue,
} from "@/components/common";
import type { APIError } from "@/lib/api";
import { formatVND } from "@/lib/utils/money";
import {
  buildCostColumns,
  type Cost,
} from "./columns";
import {
  useCostList,
  useCostStats,
  useDeleteCost,
} from "../hooks";
import type { ExpenseCategory } from "@/types";

const PAGE_SIZE = 20;
type CategoryFilter = ExpenseCategory | "all";

/**
 * Quản lý Chi phí — the LuxeOps cost management surface.
 *
 * Composition:
 *   - Header (title + 2 buttons: Nhập từ Excel, Thêm chi phí)
 *   - 4-card KPI strip (Tổng chi phí tháng / Trung bình/đơn / So với tháng trước / Top khoản chi)
 *   - Tabs by category (Tất cả / Nhập hàng / Vận chuyển / Đóng gói / Kho bãi / Xăng)
 *   - Filters (search + month + supplier)
 *   - Data table with hover-revealed actions
 */
export function CostsView() {
  const router = useRouter();

  const listQuery = useCostList();
  const statsQuery = useCostStats();

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<CategoryFilter>("all");
  const [page, setPage] = React.useState(1);

  const deleteCost = useDeleteCost();
  const [pendingDelete, setPendingDelete] = React.useState<Cost | null>(null);
  const [deleteError, setDeleteError] = React.useState<APIError | null>(null);

  const [searchInput, setSearchInput] = useDebouncedValue<string>({
    defaultValue: search,
    delay: 350,
    onCommit: (next) => {
      if (next !== search) {
        setSearch(next);
        setPage(1);
      }
    },
  });

  const costs = React.useMemo(
    () => listQuery.data ?? [],
    [listQuery.data],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return costs.filter((c) => {
      const matchSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.vendor.toLowerCase().includes(q);
      const matchCategory =
        category === "all" ? true : c.category === category;
      return matchSearch && matchCategory;
    });
  }, [costs, search, category]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  React.useEffect(() => {
    setPage(1);
  }, [search, category]);

  const handleEdit = React.useCallback(
    (row: Cost) => {
      // The Stitch design shows a row-level edit affordance; route
      // to the related order detail when there is one, otherwise
      // just stay on the page so the user can use the dropdown.
      router.push(`/admin/costs/${row.id}/edit`);
    },
    [router],
  );

  const handleDelete = React.useCallback((row: Cost) => {
    setPendingDelete(row);
    setDeleteError(null);
  }, []);

  const columns = React.useMemo(
    () => buildCostColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete],
  );

  const table: TanStackTable<Cost> = useReactTable({
    data: paginated,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getRowId: (row) => row.id,
  });

  const confirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deleteCost.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
      setDeleteError(null);
    } catch (err) {
      setDeleteError(err as APIError);
    }
  }, [pendingDelete, deleteCost]);

  const rows = table.getRowModel().rows;

  const categoryCounts = React.useMemo(() => {
    const base: Record<CategoryFilter, number> = {
      all: costs.length,
      cogs: 0,
      shipping: 0,
      marketing: 0,
      salary: 0,
      overhead: 0,
      tax: 0,
      other: 0,
    };
    for (const c of costs) base[c.category] += 1;
    return base;
  }, [costs]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.02em] text-foreground">
            Chi phí
          </h1>
          <p className="mt-1 text-[13px] leading-[18px] text-muted-foreground">
            Theo dõi chi phí kinh doanh · Chỉ tính chi phí liên quan đến vận hành
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            aria-label="Nhập từ Excel"
            onClick={() => undefined}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Nhập từ Excel</span>
          </Button>
          <Button
            type="button"
            aria-label="Thêm khoản chi phí mới"
            onClick={() => router.push("/admin/costs/new")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Thêm chi phí</span>
          </Button>
        </div>
      </div>

      <KpiStrip stats={statsQuery.data} loading={statsQuery.isLoading} />

      <div className="flex flex-col gap-3">
        <div className="border-b border-rose-100 px-4 pt-3">
          <nav
            role="tablist"
            aria-label="Lọc chi phí theo danh mục"
            className="flex gap-6 overflow-x-auto"
          >
            {(
              [
                { value: "all", label: "Tất cả" },
                { value: "cogs", label: "Nhập hàng" },
                { value: "shipping", label: "Vận chuyển" },
                { value: "marketing", label: "Marketing" },
                { value: "salary", label: "Lương" },
                { value: "overhead", label: "Vận hành" },
                { value: "tax", label: "Thuế" },
              ] as const
            ).map((t) => {
              const active = category === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setCategory(t.value);
                    setPage(1);
                  }}
                  className={
                    active
                      ? "-mb-[1px] border-b-2 border-[#e11d74] pb-3 text-[13px] font-bold text-[#e11d74]"
                      : "pb-3 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {t.label}
                  <span className="ml-1 text-[11px] text-muted-foreground">
                    {categoryCounts[t.value]}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-rose-100 bg-surface-container-low p-3">
          <div className="relative w-64">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm mã CP, mô tả…"
              className="h-8 pl-8"
              aria-label="Tìm chi phí"
            />
          </div>
          <PeriodSelect />
          <VendorSelect />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => listQuery.refetch()}
            disabled={listQuery.isFetching}
            className="ml-auto h-8"
            aria-label="Tải lại"
          >
            {listQuery.isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Lọc
          </Button>
        </div>

        <CrudListShell
          isLoading={listQuery.isLoading}
          isError={listQuery.isError}
          error={listQuery.error}
          onRetry={() => listQuery.refetch()}
          emptyState={
            rows.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="Chưa có khoản chi phí nào"
                description={
                  search || category !== "all"
                    ? "Không tìm thấy khoản chi phí phù hợp với bộ lọc hiện tại."
                    : "Thêm khoản chi phí đầu tiên để theo dõi."
                }
                action={
                  <Button
                    type="button"
                    onClick={() => router.push("/admin/costs/new")}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>Thêm chi phí</span>
                  </Button>
                }
              />
            ) : undefined
          }
        >
          <div className="overflow-x-auto rounded-lg border border-rose-100">
            <UITable>
              <TableHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id} className="bg-white">
                    {group.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() || undefined }}
                        className="border-b border-rose-100 text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="divide-y divide-rose-100">
                {rows.length === 0 && !listQuery.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center text-[13px] text-muted-foreground"
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="group transition-colors hover:bg-surface-container"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="text-[13px] leading-[20px]"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </UITable>
          </div>
        </CrudListShell>

        {total > PAGE_SIZE && (
          <Pagination
            pagination={{
              limit: PAGE_SIZE,
              offset: (safePage - 1) * PAGE_SIZE,
              page: safePage,
              total,
              total_pages: totalPages,
              has_next: safePage < totalPages,
              has_previous: safePage > 1,
            }}
            onPageChange={setPage}
          />
        )}

        <DeleteEntityDialog
          open={pendingDelete !== null}
          title="Xoá khoản chi phí này?"
          entityName={pendingDelete?.code}
          submitting={deleteCost.isPending}
          error={deleteError}
          onCancel={() => {
            setPendingDelete(null);
            setDeleteError(null);
          }}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * KPI strip
 * ------------------------------------------------------------------ */

interface KpiStripProps {
  stats:
    | {
        monthly_total: number;
        monthly_delta: number;
        average_per_order: number;
        top_category: { category: ExpenseCategory; amount: number; share: number };
      }
    | undefined;
  loading?: boolean;
}

function KpiStrip({ stats, loading }: KpiStripProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <KpiCard
        label="Tổng chi phí tháng này"
        value={formatVND(stats.monthly_total)}
        delta={
          stats.monthly_delta > 0
            ? { value: stats.monthly_delta, direction: "up" }
            : undefined
        }
      />
      <KpiCard
        label="Chi phí trung bình / đơn"
        value={formatVND(stats.average_per_order)}
      />
      <KpiCard
        label="So với tháng trước"
        value={`+${stats.monthly_delta}%`}
        accent="primary"
        spark
      />
      <KpiCard
        label="Top khoản chi"
        value={`${getCategoryLabelLocal(stats.top_category.category)} (${stats.top_category.share}%)`}
        share={stats.top_category.share}
      />
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  delta?: { value: number; direction: "up" | "down" };
  accent?: "default" | "primary";
  spark?: boolean;
  share?: number;
}

function KpiCard({ label, value, delta, accent = "default", spark, share }: KpiCardProps) {
  return (
    <div className="relative flex flex-col gap-1 overflow-hidden rounded-lg border border-rose-100 bg-white p-4">
      <p className="text-[13px] leading-[18px] text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-2">
        <span
          className={
            accent === "primary"
              ? "font-mono text-2xl font-semibold text-[#e11d74]"
              : "font-mono text-2xl font-semibold text-foreground"
          }
        >
          {value}
        </span>
        {delta && (
          <span className="flex items-center gap-1 rounded bg-[rgba(146,32,32,0.2)] px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.05em] text-[#ffb4ab]">
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            {delta.value}%
          </span>
        )}
        {spark && (
          <ArrowUpRight
            className="h-5 w-5 text-[#e11d74]"
            aria-hidden="true"
          />
        )}
      </div>
      {typeof share === "number" && (
        <>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-[#e11d74]"
              style={{ width: `${Math.min(100, Math.max(0, share))}%` }}
              aria-hidden="true"
            />
          </div>
          <Sparkline />
        </>
      )}
    </div>
  );
}

function Sparkline() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-12 w-full opacity-50"
      viewBox="0 0 100 30"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="costSparkGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,30 L0,20 Q10,25 20,15 T40,25 T60,10 T80,15 T100,5 L100,30 Z"
        fill="url(#costSparkGradient)"
      />
      <path
        d="M0,20 Q10,25 20,15 T40,25 T60,10 T80,15 T100,5"
        fill="none"
        stroke="#A78BFA"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Filter dropdowns
 * ------------------------------------------------------------------ */

function PeriodSelect() {
  return (
    <div className="relative">
      <Calendar
        className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Select defaultValue="this_month">
        <SelectTrigger
          size="sm"
          aria-label="Khoảng thời gian"
          className="h-8 min-w-[160px] rounded-full pl-7"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this_month">Tháng này</SelectItem>
          <SelectItem value="last_month">Tháng trước</SelectItem>
          <SelectItem value="custom">Tuỳ chỉnh…</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function VendorSelect() {
  return (
    <div className="relative">
      <Filter
        className="pointer-events-none absolute left-2 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Select defaultValue="all">
        <SelectTrigger
          size="sm"
          aria-label="Nhà cung cấp"
          className="h-8 min-w-[160px] rounded-full pl-7"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Mọi NCC</SelectItem>
          <SelectItem value="jade">Xưởng Ngọc Bích</SelectItem>
          <SelectItem value="ghn">GHN Express</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function getCategoryLabelLocal(category: ExpenseCategory): string {
  switch (category) {
    case "cogs":
      return "Hàng hóa nhập";
    case "shipping":
      return "Vận chuyển";
    case "marketing":
      return "Marketing";
    case "salary":
      return "Lương";
    case "overhead":
      return "Vận hành";
    case "tax":
      return "Thuế";
    case "other":
    default:
      return "Khác";
  }
}