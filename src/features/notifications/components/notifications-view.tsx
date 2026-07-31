"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCheck, Loader2, Settings, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import {
  getNotificationCategoryLabel,
  getNotificationIcon,
} from "../utils/icons";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotificationList,
  useNotificationPreferences,
  useNotificationStats,
  useUpdateNotificationPreferences,
} from "../hooks";
import type { Notification, NotificationCategory } from "@/types";

/**
 * Trung tâm Thông báo — the LuxeOps admin notification surface.
 *
 * Composition:
 *   - KPI strip (4 metrics)
 *   - Left column: category filter pills + feed of notifications
 *   - Right column: notification preferences (sticky)
 *
 * The notifications themselves are clickable: a click marks the
 * item read. There is no in-page detail view — the design's intent
 * is "scan, dismiss, configure".
 */
export function NotificationsView() {
  const listQuery = useNotificationList();
  const statsQuery = useNotificationStats();

  const [activeCategory, setActiveCategory] = React.useState<
    NotificationCategory | "all"
  >("all");

  const notifications = React.useMemo(
    () => listQuery.data ?? [],
    [listQuery.data],
  );

  const counts = React.useMemo(() => {
    const out: Record<NotificationCategory | "all", number> = {
      all: notifications.length,
      order: 0,
      inventory: 0,
      customer: 0,
      shipping: 0,
      cost: 0,
      system: 0,
    };
    for (const n of notifications) out[n.category] += 1;
    return out;
  }, [notifications]);

  const filtered = React.useMemo(() => {
    if (activeCategory === "all") return notifications;
    return notifications.filter((n) => n.category === activeCategory);
  }, [notifications, activeCategory]);

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const handleMarkRead = React.useCallback(
    (n: Notification) => {
      if (n.is_read) return;
      void markRead.mutate(n.id);
    },
    [markRead],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[36px] font-semibold leading-[44px] tracking-[-0.04em] text-foreground">
            Thông báo
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-muted-foreground">
            Trung tâm thông báo hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending || (statsQuery.data?.unread ?? 0) === 0}
            aria-label="Đánh dấu tất cả là đã đọc"
          >
            {markAllRead.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
            )}
            <span>Đánh dấu đã đọc</span>
          </Button>
          <Button asChild variant="ghost" aria-label="Mở cài đặt thông báo">
            <Link href="/admin/settings">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span>Cài đặt</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Chưa đọc" value={statsQuery.data?.unread} accent="primary" loading={statsQuery.isLoading} />
        <KpiCard label="Hôm nay" value={statsQuery.data?.today} loading={statsQuery.isLoading} />
        <KpiCard label="Tuần này" value={statsQuery.data?.this_week} loading={statsQuery.isLoading} />
        <KpiCard label="Tổng" value={statsQuery.data?.total} loading={statsQuery.isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-8">
          <CategoryFilters
            active={activeCategory}
            onChange={setActiveCategory}
            counts={counts}
          />

          <div className="flex flex-col gap-3">
            {listQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[88px] w-full rounded-lg" />
              ))
            ) : listQuery.isError ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-[14px] text-destructive"
              >
                Không thể tải thông báo. Vui lòng thử lại sau.
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-rose-100 bg-white p-10 text-center text-[14px] text-muted-foreground">
                Không có thông báo nào trong danh mục này.
              </div>
            ) : (
              filtered.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onSelect={handleMarkRead}
                />
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <PreferencesPanel />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * KPI
 * ------------------------------------------------------------------ */

interface KpiCardProps {
  label: string;
  value: number | undefined;
  loading?: boolean;
  accent?: "default" | "primary";
}

function KpiCard({ label, value, loading, accent = "default" }: KpiCardProps) {
  return (
    <div className="flex h-[100px] flex-col justify-between rounded-lg border border-rose-100 bg-white p-4">
      <span className="text-[12px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <span
            className={cn(
              "text-[32px] font-bold leading-none",
              accent === "primary" ? "text-[#e11d74]" : "text-foreground",
            )}
          >
            {value ?? 0}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Category filter chips
 * ------------------------------------------------------------------ */

const CATEGORIES: Array<{ value: NotificationCategory | "all"; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "order", label: "Đơn hàng" },
  { value: "inventory", label: "Tồn kho" },
  { value: "customer", label: "Khách hàng" },
  { value: "shipping", label: "Vận chuyển" },
  { value: "cost", label: "Chi phí" },
  { value: "system", label: "Hệ thống" },
];

function CategoryFilters({
  active,
  onChange,
  counts,
}: {
  active: NotificationCategory | "all";
  onChange: (next: NotificationCategory | "all") => void;
  counts: Record<NotificationCategory | "all", number>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Lọc thông báo theo danh mục"
      className="mb-4 flex items-center gap-2 overflow-x-auto pb-2"
    >
      {CATEGORIES.map((c) => {
        const isActive = active === c.value;
        return (
          <button
            key={c.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(c.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
              isActive
                ? "bg-[#e11d74] text-[#09090b]"
                : "border border-rose-100 bg-white text-foreground hover:bg-surface-container",
            )}
          >
            {c.label}
            <span className="ml-2 text-[11px] text-muted-foreground">
              {counts[c.value] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Notification row
 * ------------------------------------------------------------------ */

function NotificationRow({
  notification,
  onSelect,
}: {
  notification: Notification;
  onSelect: (n: Notification) => void;
}) {
  const Icon = getNotificationIcon(notification.category);
  const tint = severityTint(notification.severity);
  const unread = !notification.is_read;

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      aria-label={`${unread ? "Chưa đọc: " : ""}${notification.title}`}
      className={cn(
        "group relative flex w-full gap-4 overflow-hidden rounded-lg border border-rose-100 bg-white p-4 text-left transition-colors hover:bg-surface-container",
        unread && "border-l-2 border-l-[#e11d74]",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          tint.bg,
          tint.fg,
        )}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[14px] font-medium leading-tight text-foreground">
            {notification.title}
          </h4>
          <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
            <RelativeTime iso={notification.created_at} />
          </span>
        </div>
        <p className="mt-1 line-clamp-1 text-[13px] leading-[18px] text-muted-foreground">
          {notification.body}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              "rounded border border-rose-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.05em]",
              tint.chip,
            )}
          >
            {getNotificationCategoryLabel(notification.category)}
          </span>
          {unread && (
            <span
              className="ml-auto h-2 w-2 rounded-full bg-[#e11d74]"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Preferences sidebar
 * ------------------------------------------------------------------ */

function PreferencesPanel() {
  const preferences = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const items = React.useMemo(
    () =>
      [
        {
          key: "new_order",
          label: "Đơn hàng mới",
          hint: "Email, Web, Mobile",
        },
        {
          key: "low_stock",
          label: "Cảnh báo tồn kho thấp",
          hint: "Web, Mobile",
        },
        {
          key: "new_customer",
          label: "Khách hàng mới",
          hint: "Email, Web",
        },
        {
          key: "shipping_updates",
          label: "Cập nhật vận chuyển",
          hint: "Email, Mobile",
        },
        {
          key: "system_alerts",
          label: "Cảnh báo hệ thống",
          hint: "Web, Email",
        },
      ] as const,
    [],
  );

  const pending = updatePreferences.variables ?? {};

  return (
    <aside className="sticky top-0 rounded-xl border border-rose-100 bg-white p-6">
      <h3 className="mb-6 flex items-center gap-2 text-[18px] font-semibold leading-[28px] text-foreground">
        <Settings className="h-4 w-4 text-[#e11d74]" aria-hidden="true" />
        Tùy chọn thông báo
      </h3>
      <div className="space-y-6">
        {items.map((item) => {
          const value = preferences.data?.[item.key] ?? false;
          const isPending = updatePreferences.isPending;
          return (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <Label
                  htmlFor={`pref-${item.key}`}
                  className="text-[14px] font-medium text-foreground"
                >
                  {item.label}
                </Label>
                <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                  {item.hint}
                </p>
              </div>
              <Switch
                id={`pref-${item.key}`}
                checked={value}
                disabled={preferences.isLoading || isPending}
                onCheckedChange={(next) => {
                  updatePreferences.mutate({ ...pending, [item.key]: next });
                }}
                aria-label={`Bật/tắt ${item.label}`}
              />
            </div>
          );
        })}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function severityTint(severity: Notification["severity"]) {
  switch (severity) {
    case "warning":
      return {
        bg: "bg-[rgba(248,113,113,0.1)]",
        fg: "text-[#f87171]",
        chip: "bg-[rgba(248,113,113,0.1)] text-[#f87171]",
      };
    case "critical":
      return {
        bg: "bg-[rgba(248,113,113,0.15)]",
        fg: "text-[#f87171]",
        chip: "bg-[rgba(248,113,113,0.15)] text-[#f87171]",
      };
    case "success":
      return {
        bg: "bg-[rgba(74,222,128,0.1)]",
        fg: "text-[#4ade80]",
        chip: "bg-[rgba(74,222,128,0.1)] text-[#4ade80]",
      };
    case "info":
    default:
      return {
        bg: "bg-[rgba(225,29,116,0.1)]",
        fg: "text-[#e11d74]",
        chip: "bg-[rgba(225,29,116,0.1)] text-[#e11d74]",
      };
  }
}

function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = React.useState(() => initialLabel(iso));
  React.useEffect(() => {
    setLabel(initialLabel(iso));
    const id = window.setInterval(() => setLabel(initialLabel(iso)), 60_000);
    return () => window.clearInterval(id);
  }, [iso]);
  return <span suppressHydrationWarning>{label}</span>;
}

function initialLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return d.toLocaleDateString("vi-VN");
}