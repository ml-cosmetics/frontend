"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Loader2, Plus, RefreshCw, Table2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  DeleteEntityDialog,
  Pagination,
  useDebouncedValue,
} from "@/components/common";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { APIError } from "@/lib/api";
import type { Banner } from "@/types";
import { BannerCard } from "./banner-card";
import {
  BANNER_STATUS_FILTERS,
  getBannerStatus,
  type BannerStatusFilter,
} from "../utils/banner-status";
import {
  useBannerList,
  useDeleteBanner,
  useToggleBannerStatus,
} from "../hooks";

const PAGE_SIZE = 12;

type ViewMode = "grid" | "table";

/**
 * `BannerListView` — `/admin/banners` main view.
 *
 * Replaces the legacy row-based `BannerListTable` so the operator
 * sees each banner at its real storefront ratio (16:9) instead of a
 * 80×45 thumbnail. Filter is driven by tabs (Tất cả / Đang hiển thị
 * / Đã lên lịch / Đã hết hạn / Đã tắt) — each tab counts the items
 * in that bucket so the operator can gauge state at a glance.
 *
 * The toggle row keeps the previous table rendering as an opt-in
 * "Bảng" view, matching the products admin which exposes both
 * representations.
 */
export function BannerListView() {
  const router = useRouter();
  const [view, setView] = React.useState<ViewMode>("grid");

  const [statusFilter, setStatusFilter] = React.useState<BannerStatusFilter>("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const listQuery = useBannerList();
  const deleteBanner = useDeleteBanner();
  const toggleStatus = useToggleBannerStatus();

  const [pendingDelete, setPendingDelete] = React.useState<Banner | null>(null);
  const [deleteError, setDeleteError] = React.useState<APIError | null>(null);
  const [pendingToggleId, setPendingToggleId] = React.useState<string | null>(null);

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

  // Bucketise once — both the tab counts and the filtered list need
  // this so a banner only ends up in one bucket at a time.
  const items = listQuery.data ?? [];
  const decorated = React.useMemo(
    () => items.map((banner) => ({ banner, status: getBannerStatus(banner) })),
    [items],
  );

  const counts = React.useMemo(() => {
    const next: Record<BannerStatusFilter, number> = {
      all: items.length,
      active: 0,
      scheduled: 0,
      expired: 0,
      inactive: 0,
    };
    for (const { status } of decorated) {
      next[status.lifecycle] += 1;
    }
    return next;
  }, [decorated, items.length]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return decorated.filter(({ banner, status }) => {
      const matchStatus = statusFilter === "all" || status.lifecycle === statusFilter;
      const matchSearch = !q || banner.title.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [decorated, search, statusFilter]);

  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleEdit = React.useCallback(
    (banner: Banner) => router.push(`/admin/banners/${banner.id}/edit`),
    [router],
  );
  const handleDelete = React.useCallback((banner: Banner) => {
    setPendingDelete(banner);
    setDeleteError(null);
  }, []);
  const handleToggleActive = React.useCallback(
    async (banner: Banner, nextActive: boolean) => {
      if (nextActive === banner.is_active) return;
      setPendingToggleId(banner.id);
      try {
        await toggleStatus.mutateAsync({
          id: banner.id,
          activate: nextActive,
        });
      } catch {
        // toast handled by hook
      } finally {
        setPendingToggleId(null);
      }
    },
    [toggleStatus],
  );

  const confirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deleteBanner.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
      setDeleteError(null);
    } catch (err) {
      const apiErr = err as APIError;
      setDeleteError(apiErr);
      toast.error("Không thể xoá banner", { description: apiErr.message });
    }
  }, [pendingDelete, deleteBanner]);

  const showEmpty = !listQuery.isLoading && paginated.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <ViewToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        view={view}
        onViewChange={setView}
        onRefresh={() => listQuery.refetch()}
        isFetching={listQuery.isFetching}
        isLoading={listQuery.isLoading}
      />

      <Tabs
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as BannerStatusFilter)}
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {BANNER_STATUS_FILTERS.map((opt) => (
            <TabsTrigger
              key={opt.value}
              value={opt.value}
              className="gap-1.5"
            >
              <span>{opt.label}</span>
              <span className="text-[12px] tabular-nums text-muted-foreground">
                ({counts[opt.value]})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ViewBody
        view={view}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        error={listQuery.error}
        banners={paginated.map((entry) => entry.banner)}
        showEmpty={showEmpty}
        hasActiveFilters={Boolean(search) || statusFilter !== "all"}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        pendingToggleId={pendingToggleId}
        onRetry={() => listQuery.refetch()}
      />

      {total > PAGE_SIZE ? (
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
          onPageChange={(p) => setPage(p)}
        />
      ) : null}

      <DeleteEntityDialog
        open={pendingDelete !== null}
        title="Xoá banner này?"
        entityName={pendingDelete?.title}
        submitting={deleteBanner.isPending}
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
  );
}

/* ------------------------------------------------------------------ *
 * Toolbar
 * ------------------------------------------------------------------ */

interface ViewToolbarProps {
  search: string;
  onSearchChange: (next: string) => void;
  view: ViewMode;
  onViewChange: (next: ViewMode) => void;
  onRefresh: () => void;
  isFetching: boolean;
  isLoading: boolean;
}

function ViewToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
  onRefresh,
  isFetching,
  isLoading,
}: ViewToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Tìm theo tiêu đề…"
        className="max-w-xs"
        aria-label="Tìm banner"
      />

      <div className="flex items-center gap-2">
        <ViewSwitcher value={view} onChange={onViewChange} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isFetching || isLoading}
          aria-label="Tải lại danh sách"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
        <Button asChild>
          <a href="/admin/banners/new">
            <Plus className="h-4 w-4" />
            <span>Thêm banner</span>
          </a>
        </Button>
      </div>
    </div>
  );
}

function ViewSwitcher({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Chọn kiểu hiển thị"
      className="inline-flex h-9 items-center gap-1 rounded-lg border border-hairline bg-surface-container-low p-1"
    >
      <ViewSwitcherButton
        active={value === "grid"}
        onClick={() => onChange("grid")}
        icon={LayoutGrid}
        label="Lưới"
      />
      <ViewSwitcherButton
        active={value === "table"}
        onClick={() => onChange("table")}
        icon={Table2}
        label="Bảng"
      />
    </div>
  );
}

function ViewSwitcherButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium transition-colors " +
        (active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Body
 * ------------------------------------------------------------------ */

interface ViewBodyProps {
  view: ViewMode;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  banners: Banner[];
  showEmpty: boolean;
  hasActiveFilters: boolean;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onToggleActive: (banner: Banner, nextActive: boolean) => void;
  pendingToggleId: string | null;
  onRetry: () => void;
}

function ViewBody({
  view,
  isLoading,
  isError,
  error,
  banners,
  showEmpty,
  hasActiveFilters,
  onEdit,
  onDelete,
  onToggleActive,
  pendingToggleId,
  onRetry,
}: ViewBodyProps) {
  if (isLoading) return <GridSkeleton />;

  if (isError) {
    return (
      <div className="rounded-xl border border-hairline bg-card p-6 text-[14px] text-destructive">
        <p className="font-medium">Không thể tải danh sách banner.</p>
        <p className="mt-1 text-muted-foreground">
          {(error as APIError | null)?.message ?? "Đã xảy ra lỗi không xác định."}
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (showEmpty) {
    return (
      <EmptyState
        title={hasActiveFilters ? "Không tìm thấy banner phù hợp" : "Chưa có banner nào"}
        description={
          hasActiveFilters
            ? "Thử đổi bộ lọc hoặc từ khoá tìm kiếm."
            : "Tạo banner đầu tiên để hiển thị trên trang chủ."
        }
        action={
          <Button asChild>
            <a href="/admin/banners/new">
              <Plus className="h-4 w-4" />
              <span>Thêm banner</span>
            </a>
          </Button>
        }
        className="rounded-xl border border-hairline bg-card"
      />
    );
  }

  if (view === "grid") {
    return (
      <div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        role="list"
        aria-label="Danh sách banner"
      >
        {banners.map((banner) => (
          <div key={banner.id} role="listitem">
            <BannerCard
              banner={banner}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              pending={pendingToggleId === banner.id}
            />
          </div>
        ))}
      </div>
    );
  }

  // Table view — placeholder grid of compact rows. Kept simple so
  // the toggle isn't a stub; full TanStack columns aren't worth
  // bringing back just for this fallback.
  return <TableFallback banners={banners} onEdit={onEdit} />;
}

function TableFallback({
  banners,
  onEdit,
}: {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-hairline bg-card">
      <table className="w-full text-left text-[14px]">
        <thead className="border-b border-hairline text-[12px] uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Vị trí</th>
            <th className="px-4 py-3 font-medium">Tiêu đề</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => {
            const status = getBannerStatus(banner);
            return (
              <tr
                key={banner.id}
                className="cursor-pointer border-b border-hairline last:border-b-0 hover:bg-rose-50/40"
                onClick={() => onEdit(banner)}
              >
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  #{banner.position}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{banner.title}</p>
                  {banner.subtitle ? (
                    <p className="text-[12px] text-muted-foreground">{banner.subtitle}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{status.label}</td>
                <td className="px-4 py-3 text-right text-[12px] text-primary">Chỉnh sửa →</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Skeleton
 * ------------------------------------------------------------------ */

function GridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Đang tải danh sách banner"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-hairline bg-card"
        >
          <div className="aspect-video w-full animate-pulse bg-surface-container-high" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-container-high" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-container-high" />
            <div className="mt-2 h-6 w-1/3 animate-pulse rounded bg-surface-container-high" />
          </div>
        </div>
      ))}
    </div>
  );
}