"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { get } from "@/lib/api/client";
import { adminApiClient } from "@/lib/api/axios";
import { toQueryString } from "@/lib/utils/pagination";

export interface InventoryTrendPoint {
  date: string;
  delta: number;
  changes: number;
}

export interface InventoryTrend {
  days: number;
  points: InventoryTrendPoint[];
}

/**
 * `useInventoryTrend` — fetches `GET /admin/reports/inventory-trend?days=N`.
 *
 * Returns the bucketed audit log of stock-in / stock-out activity
 * for the last `days` days. Used by the inventory page to render
 * a sparkline chart of recent activity (P2-5).
 */
export function useInventoryTrend(days: number = 7) {
  return useQuery<InventoryTrend>({
    queryKey: ["reports", "inventory-trend", days] as const,
    queryFn: () =>
      get<InventoryTrend>(
        adminApiClient,
        `/admin/reports/inventory-trend${toQueryString({ days })}`,
      ),
    staleTime: 60_000,
  });
}

/**
 * `InventoryTrendChart` — compact SVG sparkline rendered from the
 * real backend data. Positive deltas render above the baseline in
 * green, negative below in red; zero baselines are dashed.
 */
export function InventoryTrendChart({ days = 7 }: { days?: number }) {
  const query = useInventoryTrend(days);
  const points = query.data?.points ?? [];

  if (query.isLoading) {
    return (
      <div
        role="status"
        aria-label="Đang tải biểu đồ tồn kho"
        className="flex h-[80px] items-center justify-center text-muted-foreground"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      </div>
    );
  }
  if (query.isError || points.length === 0) {
    return (
      <div className="flex h-[80px] items-center justify-center text-xs text-muted-foreground">
        Chưa có hoạt động kho trong {days} ngày gần nhất.
      </div>
    );
  }

  const width = 280;
  const height = 60;
  const maxAbs = Math.max(
    1,
    ...points.map((p) => Math.abs(p.delta)),
  );
  const stepX = points.length > 1 ? width / (points.length - 1) : width;
  const midY = height / 2;

  const path = points
    .map((p, idx) => {
      const x = idx * stepX;
      const y = midY - (p.delta / maxAbs) * (height / 2 - 4);
      return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      role="img"
      aria-label={`Biểu đồ tồn kho ${days} ngày gần nhất`}
      viewBox={`0 0 ${width} ${height}`}
      className="h-[60px] w-full"
      preserveAspectRatio="none"
    >
      <line
        x1={0}
        y1={midY}
        x2={width}
        y2={midY}
        stroke="currentColor"
        strokeDasharray="2 4"
        className="text-hairline"
        strokeWidth={1}
      />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        className="text-primary"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
