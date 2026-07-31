"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "../hooks";
import { useOrderStatusCounts } from "../hooks/use-order-status-counts";
import { OrderStatusBadge } from "./order-status-badge";
import { CreateOrderDialog } from "./create-order-dialog";
import { Pagination } from "@/components/common";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatVND } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/date";
import type { ID, Order } from "@/types";

/**
 * `OrderListView` — LuxeOps dark Monolith (Stitch) skin for the
 * order management page. Mirrors screen
 * `97ddac13b5cc45cf957f6d264c6341e4` (project 29642013742130547):
 *
 *   - Page header (title + subtitle + right-side actions)
 *   - Pipeline summary (5 stage KPI cards)
 *   - Data section (tabs + toolbar + table + pagination)
 *
 * The numeric payloads come from the existing `useOrders` hook so
 * the page remains data-driven. Each row pulls the customer name
 * and product thumbnail off the order wire (the backend preloads
 * Customer + Items.Product so the admin UI doesn't need a second
 * round-trip).
 */

type TabKey = "all" | "created" | "shipping" | "done" | "cancelled";

const TAB_DEFS: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "created", label: "Chờ xử lý" },
  { key: "shipping", label: "Đang giao" },
  { key: "done", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

export function OrderListView() {
  const router = useRouter();
  const [tab, setTab] = React.useState<TabKey>("all");
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);

  // The active table slice — driven by the currently selected tab. Each
  // tab click issues a fresh request; we keep the previous slice visible
  // while the new one is in flight so the table doesn't snap to empty.
  const params: { page: number; per_page: number; status?: string } = {
    page,
    per_page: 10,
  };
  if (tab !== "all") params.status = tab;

  const { data, isLoading } = useOrders(params);
  const items = React.useMemo(() => data?.items ?? [], [data?.items]);

  // Live count-per-tab so the tab labels never go to 0 just because the
  // table is loading a different filter. The hook fans out 5 parallel
  // `per_page=1` requests and returns the server-side total for each
  // status, with `placeholderData: keepPreviousData` so the labels stay
  // pinned while a refetch is in flight.
  const { counts: tabCounts } = useOrderStatusCounts();

  // Pipeline summary keeps its monetary totals off the **active** page
  // slice — the counts in the cards above the table are independent of
  // the active filter so they don't drop to 0 between tab switches.
  const stageTotals = React.useMemo(
    () => countByStatusWithAmounts(items),
    [items],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 p-6">
      <Header onCreate={() => setCreateOpen(true)} />
      <PipelineSummary
        pending={{
          count: tabCounts.created,
          total: stageTotals.created,
        }}
        shipping={{
          count: tabCounts.shipping,
          total: stageTotals.shipping,
        }}
        done={{
          count: tabCounts.done,
          total: stageTotals.done,
        }}
        cancelled={{
          count: tabCounts.cancelled,
          total: stageTotals.cancelled,
        }}
      />

      <div className="flex flex-col rounded-[4px] border border-rose-100 bg-white">
        <Tabs
          tabs={TAB_DEFS.map((t) => ({
            key: t.key,
            label: `${t.label} (${tabCounts[t.key] ?? 0})`,
            active: tab === t.key,
          }))}
          onChange={(k) => {
            setTab(k);
            setPage(1);
          }}
        />

        <Toolbar />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px] text-foreground">
            <thead>
              <tr className="border-b border-rose-100 bg-surface-container-low">
                <Th className="w-12"><input className="rounded border-rose-100 bg-surface text-primary focus:ring-primary" type="checkbox" /></Th>
                <Th>Mã đơn</Th>
                <Th>Khách hàng</Th>
                <Th>Trạng thái</Th>
                <Th>Tổng tiền</Th>
                <Th>Ngày tạo</Th>
                <Th className="text-right">Thao tác</Th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : items.length === 0
                ? <EmptyRow />
                : items.map((o) => (
                    <OrderRow
                      key={o.id}
                      order={o}
                      onOpen={() => router.push(`/admin/orders/${o.id}`)}
                    />
                  ))}
            </tbody>
          </table>
        </div>

        {data?.pagination && data.pagination.total_pages > 1 && (
          <Pagination
            pagination={data.pagination}
            onPageChange={setPage}
          />
        )}
      </div>

      <CreateOrderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(orderId: ID) => router.push(`/admin/orders/${orderId}`)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Header
 * ------------------------------------------------------------------ */
function Header({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="mb-2 text-[36px] font-semibold leading-[44px] tracking-[-0.04em] text-foreground">
          Đơn hàng
        </h1>
        <p className="text-[14px] leading-[20px] text-muted-foreground">
          Quản lý tất cả đơn hàng từ Messenger, Zalo, Instagram và đơn tạo thủ công.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* TODO: enable when bulk import lands — currently hidden to avoid dead button. */}
        {/* <GhostButton label="Nhập đơn" /> */}
        {/* TODO: enable when Excel export backend lands — currently hidden to avoid dead button. */}
        {/* <GhostButton label="Xuất Excel" /> */}
        <PrimaryButton
          icon={<span className="material-symbols-outlined text-[18px]">add</span>}
          label="Tạo đơn hàng"
          onClick={onCreate}
        />
      </div>
    </section>
  );
}

function PrimaryButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick}>
      {icon}
      {label}
    </Button>
  );
}

/* ------------------------------------------------------------------ *
 * Pipeline summary — 4 stage cards aligned with the visible tab
 * strip (the older 5-card design folded in `confirmed` and `packing`
 * as pass-through stages between `created` and `shipping`; with no
 * tabs for those stages the extra cards weren't pulling their weight
 * and the count drift between pipeline + tabs looked wrong).
 * ------------------------------------------------------------------ */
interface Stage { count: number; total: number }

function PipelineSummary({
  pending,
  shipping,
  done,
  cancelled,
}: {
  pending: Stage;
  shipping: Stage;
  done: Stage;
  cancelled: Stage;
}) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <StageCard
        icon={<span className="material-symbols-outlined text-[20px]">schedule</span>}
        iconColorClass="text-[#dbc839]"
        label="Chờ xử lý"
        count={pending.count}
        total={pending.total}
      />
      <StageCard
        icon={<span className="material-symbols-outlined text-[20px]">local_shipping</span>}
        iconColorClass="text-[#60a5fa]"
        label="Đang giao"
        count={shipping.count}
        total={shipping.total}
      />
      <StageCard
        icon={<span className="material-symbols-outlined text-[20px]">check_circle</span>}
        iconColorClass="text-[#34d399]"
        label="Hoàn thành"
        count={done.count}
        total={done.total}
      />
      <StageCard
        icon={<span className="material-symbols-outlined text-[20px]">cancel</span>}
        iconColorClass="text-[#f87171]"
        label="Đã hủy"
        count={cancelled.count}
        total={cancelled.total}
      />
    </section>
  );
}

function StageCard({
  icon,
  iconColorClass,
  label,
  count,
  total,
}: {
  icon: React.ReactNode;
  iconColorClass: string;
  label: string;
  count: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[4px] border border-rose-100 bg-white p-4 transition-colors hover:border-rose-100 hover:bg-surface-container">
      <div className={`flex items-center gap-2 ${iconColorClass}`}>
        {icon}
        <span className="text-[12px] font-semibold uppercase leading-[16px] tracking-[0.05em]">{label}</span>
      </div>
      <div>
        <div className="text-[18px] font-semibold leading-[28px] text-foreground">{count} đơn</div>
        <div className="mt-1 font-mono text-[13px] leading-[20px] text-muted-foreground">{formatVND(total)}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Tabs
 * ------------------------------------------------------------------ */
function Tabs({
  tabs,
  onChange,
}: {
  tabs: Array<{ key: TabKey; label: string; active: boolean }>;
  onChange: (k: TabKey) => void;
}) {
  return (
    <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-rose-100 px-4">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={t.active}
          onClick={() => onChange(t.key)}
          className={cn(
            "whitespace-nowrap py-3 text-[13px] leading-[20px] transition-colors",
            t.active
              ? "border-b-2 border-primary font-semibold text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Toolbar
 * ------------------------------------------------------------------ */
function Toolbar() {
  return (
    <div className="flex flex-col gap-4 border-b border-rose-100 p-4 md:flex-row">
      <div className="flex flex-1 gap-2">
        <div className="relative max-w-md flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground" aria-hidden="true">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách, SĐT..."
            className="w-full rounded-[2px] border border-rose-100 bg-surface py-1.5 pl-9 pr-3 text-[13px] leading-[20px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary"
          />
        </div>
        <select className="max-w-[120px] rounded-[2px] border border-rose-100 bg-surface px-3 py-1.5 text-[13px] leading-[20px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary">
          <option>Kênh</option>
          <option>Messenger</option>
          <option>Zalo</option>
          <option>Instagram</option>
        </select>
        <select className="max-w-[140px] rounded-[2px] border border-rose-100 bg-surface px-3 py-1.5 text-[13px] leading-[20px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary">
          <option>Thanh toán</option>
          <option>COD</option>
          <option>Chuyển khoản</option>
        </select>
        <button
          type="button"
          aria-label="Bộ lọc"
          className="flex items-center rounded-[2px] border border-rose-100 bg-transparent px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">filter_alt</span>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex cursor-pointer items-center rounded-[2px] border border-rose-100 bg-surface px-3 py-1.5">
          <span className="material-symbols-outlined mr-2 text-[18px] text-muted-foreground" aria-hidden="true">
            calendar_today
          </span>
          <span className="text-[13px] leading-[20px] text-foreground">Tháng này</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Table helpers
 * ------------------------------------------------------------------ */
function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-[12px] font-semibold uppercase leading-[16px] tracking-[0.05em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-rose-100">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-24 animate-pulse rounded bg-surface-container-high" />
        </td>
      ))}
    </tr>
  );
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-muted-foreground">
        Chưa có đơn hàng nào
      </td>
    </tr>
  );
}

function OrderRow({ order, onOpen }: { order: Order; onOpen: () => void }) {
  const code = `#ML-${order.id.slice(0, 4).toUpperCase()}`;
  const customerName = order.customer?.full_name || `Khách #${order.customer_id.slice(0, 6)}`;
  const customerPhone = order.customer?.phone ?? "";
  const firstItem = order.items[0];
  const extraItems = Math.max(0, order.items.length - 1);
  return (
    <tr className="group border-b border-rose-100 transition-colors hover:bg-surface-container">
      <td className="px-4 py-3">
        <input className="rounded border-rose-100 bg-surface text-primary focus:ring-primary" type="checkbox" />
      </td>
      <td className="px-4 py-3 font-mono text-[13px] leading-[20px] text-primary">
        <button type="button" onClick={onOpen} className="hover:underline">
          {code}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={customerName} />
          <div>
            <div className="font-medium leading-[20px] text-foreground">{customerName}</div>
            {customerPhone ? (
              <div className="mt-0.5 font-mono text-[11px] font-medium leading-[16px] text-muted-foreground">
                {customerPhone}
              </div>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3">
        <div className="font-mono text-[13px] leading-[20px] text-foreground">{formatVND(order.total)}</div>
        {firstItem ? (
          <div className="mt-0.5 truncate text-[11px] font-medium leading-[16px] text-muted-foreground">
            {firstItem.product?.name ?? firstItem.product_id.slice(0, 8)}
            {extraItems > 0 ? ` +${extraItems} sp` : ""}
          </div>
        ) : null}
      </td>
      <td className="px-4 py-3 font-mono text-[12px] leading-[20px] text-muted-foreground">
        {formatDateTime(order.created_at)}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          aria-label="Mở chi tiết đơn hàng"
          onClick={onOpen}
          className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            chevron_right
          </span>
        </button>
      </td>
    </tr>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "KH";
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-high text-[11px] font-bold text-muted-foreground">
      {initials}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

// Sums the order totals per pipeline stage so the KPI cards reflect
// the same data slice the table renders (only the active page slice —
// the per-tab counts above the table come from a dedicated parallel
// `useOrderStatusCounts` query).
function countByStatusWithAmounts(items: Order[]): Record<TabKey, number> {
  const out: Record<TabKey, number> = {
    all: 0,
    created: 0,
    shipping: 0,
    done: 0,
    cancelled: 0,
  };
  for (const o of items) {
    if (o.status === "cancelled") continue;
    out[o.status] = (out[o.status] ?? 0) + o.total;
  }
  return out;
}
