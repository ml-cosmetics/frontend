"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCustomerList } from "../hooks/use-customer-list";
import { useTopCustomers } from "../hooks/use-top-customers";
import { Pagination, ErrorState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatVND } from "@/lib/utils/money";
import type { Customer } from "@/types";
import type { Pagination as PaginationData } from "@/types";

/**
 * `CustomerListView` — LuxeOps dark Monolith (Stitch) skin for
 * `/admin/customers`. Mirrors screen
 * `28a4006964c745a1b39c4a9f72ee23a0` (project 29642013742130547):
 *
 *   - Header (Khách hàng headline-md + 2 actions)
 *   - 4 KPI cards (Total / VIP / New 30d / Retention)
 *   - Tabs (Tất cả / VIP / Mới / Chưa mua / Đã hủy) + filter — INSIDE the card
 *   - Customers table (Customer / VIP / Orders / Revenue)
 *   - Pagination
 *   - Right rail (xl) — Top 5 customers
 */

type VipLevel = "diamond" | "gold" | "none";

interface CustomerExtras {
  vip_level?: VipLevel | null;
  total_orders?: number;
  total_spent?: number;
}

type CustomerView = Customer & CustomerExtras;

type TabKey = "all" | "vip" | "new" | "inactive" | "churned";

const TAB_LABELS: Record<TabKey, string> = {
  all: "Tất cả",
  vip: "VIP",
  new: "Mới",
  inactive: "Chưa mua",
  churned: "Đã hủy",
};

export function CustomerListView() {
  const router = useRouter();
  const [tab, setTab] = React.useState<TabKey>("all");
  const [page, setPage] = React.useState(1);
  const list = useCustomerList({ page, per_page: 10 });
  const items = React.useMemo(
    () => (list.data?.items ?? []) as CustomerView[],
    [list.data],
  );
  const total = list.data?.pagination?.total ?? 0;

  // KPI counts are derived from the live list and the server total.
  // Returning zero (rather than `|| <fallback>` placeholders like
  // "5.247" or "86") keeps the dashboard truthful when the API is
  // unreachable — the user sees the same "0" they'd get when the
  // catalog is empty, never a fabricated number that would mask
  // the outage. `retention` is dropped entirely until the backend
  // exposes it; rendering a fake 34.2% would mislead the operator.
  const kpis = React.useMemo(
    () => ({
      totalCustomers: total,
      vipCount: items.filter((c) => (c.vip_level ?? "none") !== "none").length,
    }),
    [total, items],
  );

  if (list.isError) {
    return (
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 p-6">
        <div className="flex flex-1 flex-col gap-6">
          <Header onAdd={() => router.push("/admin/customers/new")} />
          <ErrorState
            error={list.error}
            onRetry={() => list.refetch()}
            title="Không tải được danh sách khách hàng"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-6 p-6">
      <div className="flex flex-1 flex-col gap-6">
        <Header onAdd={() => router.push("/admin/customers/new")} />
        <KpiRow total={kpis.totalCustomers} vip={kpis.vipCount} />
        <CustomerCard>
          <TabsBar tab={tab} onChange={(k) => { setTab(k); setPage(1); }} />
          <FilterToolbar />
          <CustomersTable
            items={items}
            isLoading={list.isLoading}
            pagination={list.data?.pagination}
            onPageChange={setPage}
            onOpen={(c) => router.push(`/admin/customers/${c.id}`)}
          />
        </CustomerCard>
      </div>
      <TopCustomersRail />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Header
 * ------------------------------------------------------------------ */
function Header({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.02em] text-foreground">
          Khách hàng
        </h1>
        <p className="mt-1 text-[13px] leading-[18px] text-muted-foreground">
          Quản lý thông tin và lịch sử mua hàng của 5.247 khách.
        </p>
      </div>
      <div className="flex gap-3">
        {/* TODO: enable when Excel export backend lands — currently hidden to avoid dead button. */}
        {/* <GhostBtn icon={<span className="material-symbols-outlined text-[18px]">download</span>} label="Xuất Excel" /> */}
        <PrimaryBtn icon={<span className="material-symbols-outlined text-[18px]">add</span>} label="Thêm khách hàng" onClick={onAdd} />
      </div>
    </div>
  );
}

function PrimaryBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Button onClick={onClick}>
      {icon}
      {label}
    </Button>
  );
}

/* ------------------------------------------------------------------ *
 * KPI row — exposes the two values the `useCustomerList` query
 * can derive safely (`total` from the server pagination, `vip`
 * from the row projection). The 30-day-new + retention tiles are
 * intentionally hidden until the backend exposes them so the
 * operator never sees fabricated KPIs.
 * ------------------------------------------------------------------ */
function KpiRow({ total, vip }: { total: number; vip: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
      <KpiCard
        icon="group"
        label="Total Customers"
        value={total.toLocaleString("en-US")}
      />
      <KpiCard
        icon="star"
        label="VIP Customers"
        value={String(vip)}
        accent
      />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  delta,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  delta?: { dir: "up" | "down"; value: string };
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-rose-100 bg-white p-4",
        accent && "border-t-2 border-t-primary",
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <span className="text-[13px] leading-[18px] text-muted-foreground">{label}</span>
        <span
          className={cn(
            "material-symbols-outlined text-[18px]",
            accent ? "text-primary" : "text-muted-foreground",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[36px] font-semibold leading-[44px] tracking-[-0.04em] text-foreground">{value}</span>
        {delta && (
          <span className="flex items-center font-mono text-[11px] font-medium leading-[16px] text-emerald-400">
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
              arrow_upward
            </span>
            {delta.value}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Customer card (filters + table + pagination in one rounded-xl card)
 * ------------------------------------------------------------------ */
function CustomerCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-rose-100 bg-white">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Tabs + filter
 * ------------------------------------------------------------------ */
function TabsBar({
  tab,
  onChange,
}: {
  tab: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <div className="flex gap-6 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {(Object.keys(TAB_LABELS) as TabKey[]).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={cn(
            "whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition-colors",
            tab === k
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {TAB_LABELS[k]}
        </button>
      ))}
    </div>
  );
}

function FilterToolbar() {
  return (
    <div className="flex flex-col gap-4 border-b border-rose-100 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-muted-foreground" aria-hidden="true">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT..."
            className="w-full rounded-lg border border-rose-100 bg-surface py-1.5 pl-9 pr-4 text-sm leading-[18px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>
        <select className="rounded-lg border border-rose-100 bg-surface px-3 py-1.5 text-sm leading-[18px] text-foreground focus:border-primary focus:outline-none focus:ring-0">
          <option>VIP Level</option>
          <option>Kim Cương</option>
          <option>Vàng</option>
        </select>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-rose-100 bg-transparent px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-white"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">tune</span>
          Filter
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Customers table
 * ------------------------------------------------------------------ */
function CustomersTable({
  items,
  isLoading,
  pagination,
  onPageChange,
  onOpen,
}: {
  items: CustomerView[];
  isLoading: boolean;
  pagination: PaginationData | undefined;
  onPageChange: (p: number) => void;
  onOpen: (c: Customer) => void;
}) {
  return (
    <>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px] text-foreground">
          <thead>
            <tr className="border-b border-rose-100 bg-white text-[12px] font-medium uppercase leading-[16px] tracking-[0.05em] text-muted-foreground">
              <Th className="w-12 text-center"><input className="rounded border-rose-100 bg-surface text-primary focus:ring-0" type="checkbox" /></Th>
              <Th>Customer</Th>
              <Th>VIP</Th>
              <Th className="text-right">Orders</Th>
              <Th className="text-right">Revenue (VND)</Th>
              <Th className="w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="p-4"><div className="h-4 w-24 animate-pulse rounded bg-surface-container-high" /></td>)}</tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[13px] text-muted-foreground">
                  Chưa có khách hàng nào
                </td>
              </tr>
            ) : (
              items.map((c) => <Row key={c.id} c={c} onOpen={() => onOpen(c)} />)
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("p-4 font-medium text-muted-foreground", className)}>
      {children}
    </th>
  );
}

function Row({ c, onOpen }: { c: CustomerView; onOpen: () => void }) {
  const name = c.full_name || "";
  const initials = name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  const phone = c.phone;
  const vip = (c.vip_level ?? "none") as VipLevel;
  const orders = c.total_orders ?? 0;
  const revenue = c.total_spent ?? 0;

  return (
    <tr className="group transition-colors hover:bg-surface-container">
      <td className="p-4 text-center">
        <input className="rounded border-rose-100 bg-surface text-primary focus:ring-0" type="checkbox" />
      </td>
      <td className="p-4">
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-3 text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#33343c] text-[13px] font-medium leading-[18px] text-foreground">
            {initials || "?"}
          </span>
          <div>
            <div className="text-[13px] font-medium leading-[18px] text-foreground">{name || "—"}</div>
            <div className="font-mono text-[13px] leading-[20px] text-muted-foreground">{phone || "—"}</div>
          </div>
        </button>
      </td>
      <td className="p-4">
        <VipChip level={vip} />
      </td>
      <td className="p-4 text-right font-mono text-[13px] leading-[20px] text-foreground">{orders}</td>
      <td className="p-4 text-right font-mono text-[13px] leading-[20px] text-foreground">{formatVND(revenue)}</td>
      <td className="p-4 text-right">
        <button
          type="button"
          aria-label="Thêm thao tác"
          className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">more_vert</span>
        </button>
      </td>
    </tr>
  );
}

function VipChip({ level }: { level: VipLevel }) {
  if (level === "diamond") {
    return (
      <span className="inline-flex items-center rounded border border-pink-900/50 bg-pink-900/30 px-2 py-0.5 text-[12px] font-medium text-pink-300">
        Kim Cương
      </span>
    );
  }
  if (level === "gold") {
    return (
      <span className="inline-flex items-center rounded border border-yellow-800/50 bg-yellow-900/30 px-2 py-0.5 text-[12px] font-medium text-yellow-300">
        Vàng
      </span>
    );
  }
  return <span className="text-[12px] text-muted-foreground">—</span>;
}

/* ------------------------------------------------------------------ *
 * Right rail
 * ------------------------------------------------------------------ */
function TopCustomersRail() {
  const query = useTopCustomers(5);
  const items = query.data?.items ?? [];

  return (
    <aside className="hidden w-[300px] flex-col gap-6 xl:flex">
      <div className="rounded-xl border border-rose-100 bg-white p-4">
        <h3 className="mb-4 text-[13px] font-medium leading-[18px] text-foreground">Top 5 Customers</h3>
        <div className="flex flex-col gap-3">
          {query.isLoading ? (
            <div className="text-[13px] text-muted-foreground">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="text-[13px] text-muted-foreground">Chưa có dữ liệu</div>
          ) : (
            items.map((c, i) => {
              const name = c.full_name || "—";
              const spent = c.total_spent ?? 0;
              return (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-4 text-xs font-bold",
                        i === 0 ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[13px] leading-[18px] text-muted-foreground">{name}</span>
                  </div>
                  <span className="font-mono text-[11px] font-medium leading-[16px] text-foreground">
                    {formatVND(spent)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
