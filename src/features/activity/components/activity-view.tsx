"use client";

import * as React from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter as FilterIcon,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { useDebouncedValue } from "@/components/common";
import { useActivityList, useActivityStats } from "../hooks";
import { getActionLabel, getLevelChipClass, getLevelLabel } from "../utils/labels";
import type { ActivityAction, ActivityLevel, ActivityLog } from "@/types";

const PAGE_SIZE = 8;

type LevelFilter = ActivityLevel | "all";
type ActionFilter = ActivityAction | "all";

/**
 * Nhật ký hoạt động — the LuxeOps audit log surface.
 *
 * Composition:
 *   - Header (title + Export CSV / Bộ lọc)
 *   - 4-card KPI strip (Today / This week / Logins / Alerts)
 *   - Filters bar (date range chip + user / action / level selects + search)
 *   - Two-column body:
 *       Left  — 24h activity histogram + top users
 *       Right — Log table with pagination footer
 *
 * All numbers come from the canonical `useActivityStats` and
 * `useActivityList` hooks. Filters are wired to local state so the
 * list view updates without a server round-trip (the backend can be
 * wired once it exposes the query params).
 */
export function ActivityView() {
  const listQuery = useActivityList();
  const statsQuery = useActivityStats();

  const [userFilter, setUserFilter] = React.useState("all");
  const [actionFilter, setActionFilter] = React.useState<ActionFilter>("all");
  const [levelFilter, setLevelFilter] = React.useState<LevelFilter>("all");
  const [page, setPage] = React.useState(1);

  const [searchInput, setSearchInput] = useDebouncedValue<string>({
    defaultValue: "",
    delay: 300,
    onCommit: (next) => {
      if (next !== search) {
        setSearch(next);
        setPage(1);
      }
    },
  });
  const [search, setSearch] = React.useState("");

  const allLogs = React.useMemo(
    () => listQuery.data?.items ?? [],
    [listQuery.data],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allLogs.filter((row) => {
      const matchSearch =
        !q ||
        row.target.toLowerCase().includes(q) ||
        row.actor_name.toLowerCase().includes(q);
      const matchLevel = levelFilter === "all" ? true : row.level === levelFilter;
      const matchAction =
        actionFilter === "all" ? true : row.action === actionFilter;
      const matchUser = userFilter === "all" ? true : row.actor_name === userFilter;
      return matchSearch && matchLevel && matchAction && matchUser;
    });
  }, [allLogs, search, levelFilter, actionFilter, userFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end = Math.min(safePage * PAGE_SIZE, total);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  React.useEffect(() => {
    setPage(1);
  }, [search, levelFilter, actionFilter, userFilter]);

  const actorOptions = React.useMemo(() => {
    const out = new Set<string>();
    for (const row of allLogs) out.add(row.actor_name);
    return Array.from(out).sort();
  }, [allLogs]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.02em] text-foreground">
            Nhật ký hoạt động
          </h1>
          <p className="mt-1 text-[13px] leading-[18px] text-muted-foreground">
            Theo dõi toàn bộ thay đổi trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => undefined}
            aria-label="Xuất CSV"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Xuất CSV</span>
          </Button>
          <Button
            type="button"
            onClick={() => undefined}
            aria-label="Bộ lọc nâng cao"
          >
            <FilterIcon className="h-4 w-4" aria-hidden="true" />
            <span>Bộ lọc</span>
          </Button>
        </div>
      </div>

      <KpiStrip stats={statsQuery.data} loading={statsQuery.isLoading} />

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-rose-100 bg-white p-2">
        <div className="flex items-center gap-2 rounded border border-rose-100 bg-surface px-3 py-1.5 text-[13px] text-foreground">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-mono whitespace-nowrap">01/07 — 19/07/2026</span>
        </div>
        <select
          aria-label="Người dùng"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="h-[34px] rounded border border-rose-100 bg-surface px-3 py-1.5 text-[13px] text-foreground focus:border-[#e11d74] focus:outline-none focus:ring-0"
        >
          <option value="all">Người dùng (Tất cả)</option>
          {actorOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label="Loại hành động"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
          className="h-[34px] rounded border border-rose-100 bg-surface px-3 py-1.5 text-[13px] text-foreground focus:border-[#e11d74] focus:outline-none focus:ring-0"
        >
          <option value="all">Loại hành động (Tất cả)</option>
          {(
            [
              ["create", "Tạo"],
              ["update", "Cập nhật"],
              ["delete", "Xóa"],
              ["login", "Đăng nhập"],
              ["payment", "Thanh toán"],
              ["settings", "Cài đặt"],
              ["alert", "Cảnh báo"],
              ["shipment", "Vận chuyển"],
              ["backup", "Sao lưu"],
            ] as const
          ).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Mức độ"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
          className="h-[34px] rounded border border-rose-100 bg-surface px-3 py-1.5 text-[13px] text-foreground focus:border-[#e11d74] focus:outline-none focus:ring-0"
        >
          <option value="all">Mức độ (Tất cả)</option>
          <option value="info">Thông tin</option>
          <option value="warning">Cảnh báo</option>
          <option value="critical">Nghiêm trọng</option>
        </select>
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm nhật ký..."
            className="h-[34px] pl-9"
            aria-label="Tìm kiếm nhật ký"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="flex w-full flex-col gap-4 rounded-lg border border-rose-100 bg-white p-4 lg:w-1/3 xl:w-1/4">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Hoạt động 24h qua
          </h2>
          <Timeline24h buckets={statsQuery.data?.timeline} loading={statsQuery.isLoading} />
          <div className="mt-2 space-y-3 border-t border-rose-100 pt-4">
            <h3 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              Người dùng tích cực
            </h3>
            {statsQuery.isLoading || !statsQuery.data ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : statsQuery.data.top_users.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">Chưa có dữ liệu.</p>
            ) : (
              <ul className="space-y-2">
                {statsQuery.data.top_users.map((u) => (
                  <li
                    key={u.name}
                    className="flex items-center justify-between text-[13px]"
                  >
                    <span className="truncate text-foreground">{u.name}</span>
                    <span className="ml-2 shrink-0 font-mono text-muted-foreground">
                      {u.count} hành động
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className="flex w-full flex-col overflow-hidden rounded-lg border border-rose-100 bg-white lg:w-2/3 xl:w-3/4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-rose-100 bg-surface">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Người dùng
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Hành động
                  </th>
                  <th className="w-full px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Đối tượng
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Mức độ
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100 font-mono text-[13px]">
                {listQuery.isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-[13px] text-muted-foreground"
                    >
                      Không có nhật ký phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  paginated.map((row) => <LogRow key={row.id} row={row} />)
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-rose-100 bg-surface p-4">
            <span className="font-mono text-[12px] text-muted-foreground">
              {listQuery.isLoading ? (
                <Loader2
                  className="inline h-3 w-3 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                `Hiển thị ${start}-${end} / ${total}`
              )}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                aria-label="Trang trước"
                className="h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span className="px-2 font-mono text-[12px] text-foreground">
                Trang {safePage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                aria-label="Trang sau"
                className="h-7 w-7"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Row
 * ------------------------------------------------------------------ */

function LogRow({ row }: { row: ActivityLog }) {
  const isWarning = row.level === "warning" || row.level === "critical";
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-surface-container",
        isWarning && "bg-[rgba(248,113,113,0.05)]",
      )}
    >
      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
        {formatTimeOnly(row.occurred_at)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-foreground">
        {row.actor_name}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-foreground">
        {getActionLabel(row.action)}
      </td>
      <td className="max-w-[260px] truncate px-4 py-3 text-muted-foreground" title={row.target}>
        {row.target}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium",
            getLevelChipClass(row.level),
          )}
        >
          {getLevelLabel(row.level)}
        </span>
      </td>
      <td
        className={cn(
          "whitespace-nowrap px-4 py-3 text-muted-foreground",
          row.actor_kind === "system" && "italic",
        )}
      >
        {row.ip_address}
      </td>
    </tr>
  );
}

function formatTimeOnly(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

/* ------------------------------------------------------------------ *
 * KPI
 * ------------------------------------------------------------------ */

interface KpiStripProps {
  stats: { today: number; this_week: number; logins: number; alerts: number } | undefined;
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
      <KpiCard label="Sự kiện hôm nay" value={stats.today} />
      <KpiCard label="Tuần này" value={stats.this_week} />
      <KpiCard label="Đăng nhập" value={stats.logins} />
      <KpiCard
        label="Cảnh báo"
        value={stats.alerts}
        accent={stats.alerts > 0 ? "danger" : undefined}
      />
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  accent?: "danger";
}

function KpiCard({ label, value, accent }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-rose-100 bg-white p-4">
      <span className="text-[13px] leading-[18px] text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono text-2xl font-semibold",
          accent === "danger" ? "text-[#ffb4ab]" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 24h timeline
 * ------------------------------------------------------------------ */

function Timeline24h({
  buckets,
  loading,
}: {
  buckets: Array<{ hour: number; count: number }> | undefined;
  loading?: boolean;
}) {
  if (loading || !buckets) {
    return (
      <div className="flex h-48 items-end gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-full flex-1" />
        ))}
      </div>
    );
  }
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="flex h-48 items-end gap-1 border-b border-rose-100 pb-1">
      {buckets.map((b) => {
        const ratio = (b.count / max) * 100;
        return (
          <div
            key={b.hour}
            className="group flex h-full flex-1 items-end"
            aria-label={`${formatHour(b.hour)}: ${b.count} sự kiện`}
            role="img"
          >
            <div
              className="w-full rounded-t-sm bg-[#e11d74]/50 transition-opacity group-hover:opacity-100"
              style={{ height: `${Math.max(ratio, 2)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}
