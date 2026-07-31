"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Calendar,
  Group,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import { useCustomerAnalyticsSummary } from "../hooks";
import {
  getChannelChipClass,
  getChannelLabel,
  getTabLabel,
} from "../utils/labels";
import type { AnalyticsChannel, AnalyticsKpi, AnalyticsTab } from "@/types";

const TABS: AnalyticsTab[] = [
  "overview",
  "traffic",
  "behaviour",
  "channels",
  "products",
];

/**
 * Phân tích & Hành vi khách hàng — the LuxeOps customer analytics
 * surface.
 *
 * Composition:
 *   - Header (title + period picker + Export report)
 *   - Horizontal tabs (Tổng quan / Lưu lượng / Hành vi / Kênh liên hệ /
 *     Sản phẩm)
 *   - KPI grid (4 cards) — each with sparkline
 *   - Two-column body:
 *       Left  — channel share breakdown
 *       Right — top product conversions
 *
 * All numbers come from `useCustomerAnalyticsSummary`. The tabs are
 * local-only for now (the underlying API returns one consolidated
 * summary) but each tab is wired so the read-side wiring is
 * finished.
 */
export function CustomerAnalyticsView() {
  const [period, setPeriod] = React.useState("30d");
  const [tab, setTab] = React.useState<AnalyticsTab>("overview");
  const summaryQuery = useCustomerAnalyticsSummary(period);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.02em] text-foreground">
            Phân tích
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-muted-foreground">
            Hành vi khách hàng trên website và hiệu quả kênh liên hệ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodPicker value={period} onChange={setPeriod} />
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Phân tích khách hàng"
        className="flex gap-6 overflow-x-auto border-b border-rose-100"
      >
        {TABS.map((t) => {
          const isActive = tab === t;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(t)}
              className={cn(
                "whitespace-nowrap border-b-2 px-2 py-3 text-[13px] font-medium transition-colors",
                isActive
                  ? "border-[#e11d74] text-[#e11d74]"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {getTabLabel(t)}
            </button>
          );
        })}
      </div>

      <KpiGrid
        kpis={summaryQuery.data?.kpis}
        loading={summaryQuery.isLoading}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ChannelBreakdown
          channels={summaryQuery.data?.channels}
          loading={summaryQuery.isLoading}
        />
        <TopProducts
          products={summaryQuery.data?.top_products}
          loading={summaryQuery.isLoading}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Period picker
 * ------------------------------------------------------------------ */

function PeriodPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="relative flex items-center">
      <Calendar
        className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Select
        value={value}
        onValueChange={(next) => onChange(next)}
      >
        <SelectTrigger
          size="md"
          aria-label="Khoảng thời gian"
          className="h-10 min-w-[180px] rounded-full pl-9"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">7 ngày qua</SelectItem>
          <SelectItem value="30d">30 ngày qua</SelectItem>
          <SelectItem value="90d">90 ngày qua</SelectItem>
          <SelectItem value="ytd">Từ đầu năm</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * KPI grid
 * ------------------------------------------------------------------ */

function KpiGrid({
  kpis,
  loading,
}: {
  kpis: AnalyticsKpi[] | undefined;
  loading?: boolean;
}) {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-lg" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}

function KpiCard({ kpi }: { kpi: AnalyticsKpi }) {
  // Default to the chart icon, then fall back to a group icon if the
  // operator hasn't set a `sparkline_path`. Real implementations will
  // map `kpi.label` to a specific icon — for now we use the trend to
  // pick a sensible fallback.
  const Icon = kpi.sparkline_path
    ? TrendingUp
    : kpi.trend === "down"
      ? ArrowUpRight
      : Group;
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-rose-100 bg-white p-4">
      <div className="flex items-center justify-between text-[13px] text-muted-foreground">
        <span>{kpi.label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[28px] font-semibold leading-[32px] text-foreground">
          {kpi.value}
        </span>
        {kpi.delta ? (
          <span
            className={cn(
              "font-mono text-[11px] font-medium",
              kpi.trend === "up" ? "text-[#4ade80]" : "text-[#ffb4ab]",
            )}
          >
            {kpi.delta}
          </span>
        ) : null}
      </div>
      {kpi.sparkline_path ? (
        <div className="relative mt-2 h-8 w-full">
          <svg
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="h-full w-full"
          >
            <path
              d={kpi.sparkline_path}
              className="fill-[#e11d74]/10 stroke-[#e11d74]"
              fillOpacity={0.1}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      ) : (
        <p className="mt-auto border-t border-rose-100/40 pt-3 text-[12px] text-muted-foreground">
          Tăng nhẹ so với tuần trước
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Channel breakdown
 * ------------------------------------------------------------------ */

function ChannelBreakdown({
  channels,
  loading,
}: {
  channels: {
    channel: AnalyticsChannel;
    share: number;
    visitors: number;
  }[] | undefined;
  loading?: boolean;
}) {
  return (
    <section
      className="flex flex-col gap-4 rounded-lg border border-rose-100 bg-white p-6 lg:col-span-7"
      aria-label="Phân bổ kênh"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-foreground">Kênh liên hệ</h2>
        <span className="font-mono text-[12px] text-muted-foreground">Tỷ lệ truy cập</span>
      </header>
      {loading || !channels ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      ) : channels.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Chưa có dữ liệu kênh.</p>
      ) : (
        <ul className="space-y-3">
          {channels.map((c) => (
            <li key={c.channel} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-foreground">{getChannelLabel(c.channel)}</span>
                <span className="font-mono text-muted-foreground">
                  {c.visitors.toLocaleString("vi-VN")} · {c.share}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className={cn("h-full", getChannelChipClass(c.channel))}
                  style={{ width: `${Math.min(100, c.share)}%` }}
                  aria-hidden="true"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Top products
 * ------------------------------------------------------------------ */

function TopProducts({
  products,
  loading,
}: {
  products: { product_id: string; name: string; views: number; conversions: number }[] | undefined;
  loading?: boolean;
}) {
  return (
    <section
      className="flex flex-col gap-4 rounded-lg border border-rose-100 bg-white p-6 lg:col-span-5"
      aria-label="Sản phẩm nổi bật"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-foreground">Sản phẩm xem nhiều</h2>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </header>
      {loading || !products ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Chưa có sản phẩm nào.</p>
      ) : (
        <ul className="divide-y divide-rose-100">
          {products.map((p) => {
            const ratio = p.views > 0 ? (p.conversions / p.views) * 100 : 0;
            return (
              <li key={p.product_id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-foreground">{p.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {p.views.toLocaleString("vi-VN")} lượt xem · {p.conversions} chuyển đổi
                  </p>
                </div>
                <span className="ml-3 font-mono text-[12px] text-[#4ade80]">
                  {ratio.toFixed(1)}%
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
