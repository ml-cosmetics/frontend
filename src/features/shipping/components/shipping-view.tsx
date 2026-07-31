"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Table as TanStackTable } from "@tanstack/react-table";
import {
  Calendar,
  Check,
  Filter,
  Loader2,
  Package,
  Wallet,
  Printer,
  RefreshCw,
  Settings,
  Undo2,
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
  CrudFilterBar,
  CrudListShell,
  DeleteEntityDialog,
  EmptyState,
  Pagination,
  useDebouncedValue,
} from "@/components/common";
import type { APIError } from "@/lib/api";
import {
  buildShipmentColumns,
  type Shipment,
} from "./columns";
import {
  useDeleteShipment,
  useShipmentList,
  useShippingStats,
  useUpdateShipment,
} from "../hooks";
import { formatVND } from "@/lib/utils/money";
import type { Carrier, ShipmentStatus } from "@/types";

const PAGE_SIZE = 20;

type StatusFilter = ShipmentStatus | "all";

/**
 * Quản lý Vận chuyển — the LuxeOps shipping surface.
 *
 * Composition:
 *   - Header (title + 2 buttons: Tạo vận đơn, Cài đặt VC)
 *   - 4-card KPI strip
 *   - Tabs by shipment status (Tất cả / Chờ lấy / Đang giao / Hoàn thành / Đã hủy)
 *   - Filters (carrier select + date range select)
 *   - Data table with hover-revealed actions
 */
export function ShippingView() {
  const router = useRouter();

  const listQuery = useShipmentList();
  const statsQuery = useShippingStats();

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [carrier, setCarrier] = React.useState<Carrier | "all">("all");
  const [page, setPage] = React.useState(1);

  const updateShipment = useUpdateShipment();
  const deleteShipment = useDeleteShipment();

  const [pendingDelete, setPendingDelete] = React.useState<Shipment | null>(null);
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

  const shipments = React.useMemo(
    () => listQuery.data ?? [],
    [listQuery.data],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return shipments.filter((s) => {
      const matchSearch =
        !q ||
        s.tracking_code.toLowerCase().includes(q) ||
        s.order_code.toLowerCase().includes(q) ||
        s.customer_name.toLowerCase().includes(q);
      const matchStatus = status === "all" ? true : s.status === status;
      const matchCarrier = carrier === "all" ? true : s.carrier === carrier;
      return matchSearch && matchStatus && matchCarrier;
    });
  }, [shipments, search, status, carrier]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  React.useEffect(() => {
    setPage(1);
  }, [search, status, carrier]);

  const handleView = React.useCallback(
    (row: Shipment) => {
      // The Stitch design only shows the action buttons; we route to
      // the related order detail page so the operator can audit the
      // order end-to-end.
      router.push(`/admin/orders/${row.order_id}`);
    },
    [router],
  );

  const handleMarkDelivered = React.useCallback(
    (row: Shipment) => {
      void updateShipment.mutateAsync({
        id: row.id,
        input: { status: "delivered" },
      });
    },
    [updateShipment],
  );

  const handleCancel = React.useCallback(
    (row: Shipment) => {
      void updateShipment.mutateAsync({
        id: row.id,
        input: { status: "returned" },
      });
    },
    [updateShipment],
  );

  const handleDelete = React.useCallback((row: Shipment) => {
    setPendingDelete(row);
    setDeleteError(null);
  }, []);

  const columns = React.useMemo(
    () =>
      buildShipmentColumns({
        onView: handleView,
        onPrint: () => undefined,
        onMarkDelivered: handleMarkDelivered,
        onCancel: handleCancel,
        onDelete: handleDelete,
      }),
    [handleView, handleMarkDelivered, handleCancel, handleDelete],
  );

  const table: TanStackTable<Shipment> = useReactTable({
    data: paginated,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getRowId: (row) => row.id,
  });

  const confirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deleteShipment.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
      setDeleteError(null);
    } catch (err) {
      setDeleteError(err as APIError);
    }
  }, [pendingDelete, deleteShipment]);

  const rows = table.getRowModel().rows;

  const statusCounts = React.useMemo(() => {
    const base: Record<StatusFilter, number> = {
      all: shipments.length,
      pending: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      exception: 0,
      returned: 0,
    };
    for (const s of shipments) base[s.status] += 1;
    return base;
  }, [shipments]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.02em] text-foreground">
            Vận chuyển
          </h1>
          <p className="mt-1 text-[13px] leading-[18px] text-muted-foreground">
            Quản lý đơn vị vận chuyển, theo dõi giao hàng và in ấn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            aria-label="Tạo vận đơn"
            onClick={() => undefined}
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>Tạo vận đơn</span>
          </Button>
          <Button asChild aria-label="Cài đặt vận chuyển">
            <Link href="/admin/settings">
              <Settings className="h-4 w-4" aria-hidden="true" />
              <span>Cài đặt VC</span>
            </Link>
          </Button>
        </div>
      </div>

      <KpiStrip stats={statsQuery.data} loading={statsQuery.isLoading} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 border-b border-rose-100 pb-3 sm:flex-row sm:items-end">
          <nav
            role="tablist"
            aria-label="Lọc vận đơn theo trạng thái"
            className="flex items-center gap-6 overflow-x-auto"
          >
            {(
              [
                { value: "all", label: "Tất cả" },
                { value: "pending", label: "Chờ lấy" },
                { value: "in_transit", label: "Đang giao" },
                { value: "delivered", label: "Hoàn thành" },
                { value: "returned", label: "Đã hủy" },
              ] as const
            ).map((t) => {
              const active = status === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setStatus(t.value);
                    setPage(1);
                  }}
                  className={
                    active
                      ? "border-b-2 border-[#e11d74] pb-3 text-[12px] font-medium uppercase tracking-[0.05em] text-[#e11d74]"
                      : "pb-3 text-[12px] font-medium uppercase tracking-[0.05em] text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {t.label}
                  <span className="ml-1 text-[11px] text-muted-foreground">
                    {statusCounts[t.value]}
                  </span>
                </button>
              );
            })}
          </nav>
          <CrudFilterBar
            className="border-0 bg-transparent p-0"
            filters={
              <>
                <CarrierSelect value={carrier} onChange={setCarrier} />
                <DateSelect />
              </>
            }
            actions={null}
          />
        </div>

        <CrudFilterBar
          filters={
            <>
              <Input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm mã vận đơn, mã đơn, khách hàng…"
                className="max-w-xs"
                aria-label="Tìm vận đơn"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => listQuery.refetch()}
                disabled={listQuery.isFetching}
                aria-label="Tải lại"
              >
                {listQuery.isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </>
          }
          actions={null}
        />

        <CrudListShell
          isLoading={listQuery.isLoading}
          isError={listQuery.isError}
          error={listQuery.error}
          onRetry={() => listQuery.refetch()}
          emptyState={
            rows.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Chưa có vận đơn nào"
                description={
                  search || status !== "all" || carrier !== "all"
                    ? "Không tìm thấy vận đơn phù hợp với bộ lọc hiện tại."
                    : "Tạo vận đơn đầu tiên để theo dõi giao hàng."
                }
              />
            ) : undefined
          }
        >
          <div className="overflow-x-auto rounded-lg border border-rose-100 bg-surface-container-low">
            <UITable>
              <TableHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id} className="border-b border-rose-100">
                    {group.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() || undefined }}
                        className="text-[12px] font-medium uppercase tracking-[0.05em] text-muted-foreground"
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
          title="Xoá vận đơn này?"
          entityName={pendingDelete?.tracking_code}
          submitting={deleteShipment.isPending}
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
        in_transit: number;
        in_transit_value: number;
        delivered_today: number;
        delivered_rate: number;
        returning: number;
        returning_delta: number;
        monthly_fee: number;
        projected_fee: number;
      }
    | undefined;
  loading?: boolean;
}

function KpiStrip({ stats, loading }: KpiStripProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-lg" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <KpiTile
        icon={<Package className="h-5 w-5 text-[#e11d74]" aria-hidden="true" />}
        label="Đang giao"
        value={`${stats.in_transit} đơn`}
        hint={formatVND(stats.in_transit_value)}
      />
      <KpiTile
        icon={<Check className="h-5 w-5 text-[#dbc839]" aria-hidden="true" />}
        label="Giao thành công hôm nay"
        value={`${stats.delivered_today}`}
        hint={`${stats.delivered_rate}% tỷ lệ`}
        hintTone="success"
      />
      <KpiTile
        icon={<Undo2 className="h-5 w-5 text-[#ffb4ab]" aria-hidden="true" />}
        label="Đang trở về"
        value={`${stats.returning}`}
        hint={`+${stats.returning_delta} tuần này`}
        hintTone="danger"
      />
      <KpiTile
        icon={<Wallet className="h-5 w-5 text-[#c8c5ca]" aria-hidden="true" />}
        label="Phí VC tháng này"
        value={formatVND(stats.monthly_fee)}
        hint={`Dự kiến: ${formatVND(stats.projected_fee)}`}
      />
    </div>
  );
}

interface KpiTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  hintTone?: "default" | "success" | "danger";
}

function KpiTile({ icon, label, value, hint, hintTone = "default" }: KpiTileProps) {
  const hintClass =
    hintTone === "success"
      ? "text-[#dbc839]"
      : hintTone === "danger"
        ? "text-[#ffb4ab]"
        : "text-muted-foreground";
  return (
    <div className="group relative flex h-[100px] flex-col gap-2 overflow-hidden rounded-lg border border-rose-100 bg-white p-4 transition-colors hover:border-rose-100">
      <div className="flex items-start justify-between">
        <span className="text-[13px] leading-[18px] text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[18px] font-semibold leading-[28px] text-foreground">
          {value}
        </span>
      </div>
      <span className={`text-[11px] font-medium uppercase tracking-[0.05em] ${hintClass}`}>
        {hint}
      </span>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#e11d74] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Filter dropdowns
 * ------------------------------------------------------------------ */

function CarrierSelect({
  value,
  onChange,
}: {
  value: Carrier | "all";
  onChange: (next: Carrier | "all") => void;
}) {
  return (
    <div className="relative">
      <Filter
        className="pointer-events-none absolute left-2 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Select
        value={value}
        onValueChange={(next) => onChange(next as Carrier | "all")}
      >
        <SelectTrigger
          size="sm"
          aria-label="Đơn vị vận chuyển"
          className="min-w-[160px] rounded-full pl-7"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Đơn vị VC</SelectItem>
          <SelectItem value="ghn">GHN</SelectItem>
          <SelectItem value="ghtk">GHTK</SelectItem>
          <SelectItem value="viettel_post">Viettel Post</SelectItem>
          <SelectItem value="vnpost">VNPost</SelectItem>
          <SelectItem value="manual">Thủ công</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function DateSelect() {
  return (
    <div className="relative">
      <Calendar
        className="pointer-events-none absolute left-2 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Select defaultValue="today">
        <SelectTrigger
          size="sm"
          aria-label="Khoảng ngày"
          className="min-w-[160px] rounded-full pl-7"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hôm nay</SelectItem>
          <SelectItem value="7d">7 ngày qua</SelectItem>
          <SelectItem value="30d">30 ngày qua</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}