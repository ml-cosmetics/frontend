"use client";

import * as React from "react";
import {
  CheckSquare,
  CloudUpload,
  Copy,
  FolderPlus,
  Delete as DeleteIcon,
  ExternalLink,
  Eye,
  Folder,
  Grid2X2,
  List as ListIcon,
  Loader2,
  Search,
  Tag as TagIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/date";
import { useDebouncedValue } from "@/components/common";
import {
  useDeleteMedia,
  useMediaFolders,
  useMediaList,
  useMediaStats,
  useUpdateMedia,
} from "../hooks";
import { formatBytes, getKindChipClass, getKindLabel } from "../utils/labels";
import type { ID, MediaAsset, MediaKind } from "@/types";

type KindFilter = MediaKind | "all";
type ViewMode = "grid" | "list";
type SortKey = "newest" | "oldest" | "name";

/**
 * Thư viện Media — the LuxeOps media library surface.
 *
 * Composition:
 *   - Page header (title + storage usage + Tạo thư mục / Upload)
 *   - Filter bar (search + type select + sort + view toggle)
 *   - Two-pane body:
 *       Left  — folder tree + shortcuts
 *       Center — contextual action bar (when items are selected) +
 *                asset grid
 *       Right — detail panel for the focused asset
 */
export function MediaView() {
  const foldersQuery = useMediaFolders();
  const listQuery = useMediaList();
  const statsQuery = useMediaStats();

  const updateMedia = useUpdateMedia();
  const deleteMedia = useDeleteMedia();

  const [activeFolder, setActiveFolder] = React.useState<string>("all");
  const [kindFilter, setKindFilter] = React.useState<KindFilter>("all");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [view, setView] = React.useState<ViewMode>("grid");
  const [selected, setSelected] = React.useState<Set<ID>>(new Set());
  const [focused, setFocused] = React.useState<ID | null>(null);
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

  const PAGE_SIZE = 12;

  const allAssets = React.useMemo(
    () => listQuery.data?.items ?? [],
    [listQuery.data],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allAssets.filter((a) => {
      const matchSearch =
        !q ||
        a.filename.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q));
      const matchKind = kindFilter === "all" ? true : a.kind === kindFilter;
      const matchFolder =
        activeFolder === "all"
          ? true
          : activeFolder === "root"
            ? !a.folder_id
            : a.folder_id === activeFolder;
      return matchSearch && matchKind && matchFolder;
    });
  }, [allAssets, search, kindFilter, activeFolder]);

  const sorted = React.useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "name":
        list.sort((a, b) => a.filename.localeCompare(b.filename));
        break;
      case "oldest":
        list.sort((a, b) => +new Date(a.uploaded_at) - +new Date(b.uploaded_at));
        break;
      case "newest":
      default:
        list.sort((a, b) => +new Date(b.uploaded_at) - +new Date(a.uploaded_at));
        break;
    }
    return list;
  }, [filtered, sort]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  React.useEffect(() => {
    setPage(1);
  }, [search, kindFilter, activeFolder]);

  // Auto-focus the first asset if nothing is focused yet
  React.useEffect(() => {
    if (focused === null && paginated[0]) {
      setFocused(paginated[0].id);
    }
  }, [focused, paginated]);

  const focusedAsset = sorted.find((a) => a.id === focused) ?? null;
  const selectedCount = selected.size;

  const toggleSelect = React.useCallback((id: ID) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => setSelected(new Set()), []);

  const handleDeleteFocused = React.useCallback(() => {
    if (!focusedAsset) return;
    deleteMedia.mutate(focusedAsset.id);
  }, [deleteMedia, focusedAsset]);

  const handleAltTextSave = React.useCallback(
    (value: string) => {
      if (!focusedAsset) return;
      updateMedia.mutate({ id: focusedAsset.id, input: { alt_text: value } });
    },
    [updateMedia, focusedAsset],
  );

  return (
    <div className="-mx-6 flex h-[calc(100vh-160px)] flex-col">
      <PageHeaderInline
        stats={statsQuery.data}
        loading={statsQuery.isLoading}
      />

      <FilterBar
        searchInput={searchInput}
        onSearchInput={setSearchInput}
        kindFilter={kindFilter}
        onKindFilter={setKindFilter}
        sort={sort}
        onSort={setSort}
        view={view}
        onView={setView}
      />

      <div className="flex flex-1 overflow-hidden">
        <FolderTree
          folders={foldersQuery.data}
          loading={foldersQuery.isLoading}
          active={activeFolder}
          onSelect={setActiveFolder}
        />

        <section className="relative flex flex-1 flex-col overflow-hidden">
          {selectedCount > 0 ? (
            <ContextActionBar
              count={selectedCount}
              onClear={clearSelection}
              onDelete={() => {
                for (const id of selected) deleteMedia.mutate(id);
                clearSelection();
              }}
            />
          ) : null}

          <div
            className={cn(
              "flex-1 overflow-y-auto p-6",
              selectedCount > 0 && "pt-[80px]",
            )}
          >
            {listQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">
                Không có tệp nào phù hợp.
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {paginated.map((a) => (
                  <AssetCard
                    key={a.id}
                    asset={a}
                    selected={selected.has(a.id)}
                    focused={focused === a.id}
                    onSelect={() => toggleSelect(a.id)}
                    onFocus={() => setFocused(a.id)}
                  />
                ))}
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {paginated.map((a) => (
                  <AssetListRow
                    key={a.id}
                    asset={a}
                    selected={selected.has(a.id)}
                    focused={focused === a.id}
                    onSelect={() => toggleSelect(a.id)}
                    onFocus={() => setFocused(a.id)}
                  />
                ))}
              </ul>
            )}

            {total > PAGE_SIZE && (
              <div className="mt-6 flex items-center justify-end gap-2 text-[12px] text-muted-foreground">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                >
                  Trang trước
                </Button>
                <span className="font-mono">
                  Trang {safePage} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                >
                  Trang sau
                </Button>
              </div>
            )}
          </div>
        </section>

        <DetailPanel
          asset={focusedAsset}
          onDelete={handleDeleteFocused}
          onAltTextSave={handleAltTextSave}
          deleting={deleteMedia.isPending}
          savingAltText={updateMedia.isPending}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Page header inline (storage stats)
 * ------------------------------------------------------------------ */

function PageHeaderInline({
  stats,
  loading,
}: {
  stats: { total_files: number; storage_used_bytes: number; storage_quota_bytes: number } | undefined;
  loading?: boolean;
}) {
  const used = stats?.storage_used_bytes ?? 0;
  const quota = stats?.storage_quota_bytes ?? 1;
  const ratio = quota > 0 ? Math.min(1, used / quota) : 0;
  return (
    <div className="flex flex-col gap-1 border-b border-rose-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-[24px] font-bold leading-[32px] text-foreground">
          Thư viện Media
        </h1>
        {loading || !stats ? (
          <Skeleton className="mt-2 h-3 w-48" />
        ) : (
          <p className="mt-1 flex items-center gap-2 text-[13px] leading-[18px] text-muted-foreground">
            <span>{stats.total_files.toLocaleString("vi-VN")} tệp</span>
            <span className="h-1 w-1 rounded-full bg-[#494552]" aria-hidden="true" />
            <span>{formatBytes(used)}</span>
            <span className="h-1 w-1 rounded-full bg-[#494552]" aria-hidden="true" />
            <span className="text-[#e11d74]">
              Đã dùng {Math.round(ratio * 100)}% dung lượng
            </span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => undefined}
          aria-label="Tạo thư mục mới"
        >
          <FolderPlus className="h-4 w-4" aria-hidden="true" />
          <span>Tạo thư mục</span>
        </Button>
        <Button
          type="button"
          onClick={() => undefined}
          aria-label="Upload tệp mới"
        >
          <CloudUpload className="h-4 w-4" aria-hidden="true" />
          <span>Upload</span>
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Filter bar
 * ------------------------------------------------------------------ */

interface FilterBarProps {
  searchInput: string;
  onSearchInput: (v: string) => void;
  kindFilter: KindFilter;
  onKindFilter: (v: KindFilter) => void;
  sort: SortKey;
  onSort: (v: SortKey) => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
}

function FilterBar({
  searchInput,
  onSearchInput,
  kindFilter,
  onKindFilter,
  sort,
  onSort,
  view,
  onView,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-rose-100 bg-surface px-6 py-3">
      <div className="relative min-w-[200px] max-w-md flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchInput}
          onChange={(e) => onSearchInput(e.target.value)}
          placeholder="Tìm theo tên, tag..."
          className="h-8 pl-9"
          aria-label="Tìm kiếm media"
        />
      </div>
      <select
        aria-label="Loại tệp"
        value={kindFilter}
        onChange={(e) => onKindFilter(e.target.value as KindFilter)}
        className="h-8 rounded border border-rose-100 bg-white px-3 text-[13px] text-foreground focus:border-[#e11d74] focus:outline-none focus:ring-0"
      >
        <option value="all">Tất cả</option>
        <option value="image">Ảnh</option>
        <option value="video">Video</option>
        <option value="document">Tài liệu</option>
        <option value="other">Khác</option>
      </select>
      <div className="ml-auto flex items-center gap-2">
        <SortControl value={sort} onChange={onSort} />
        <ViewToggle value={view} onChange={onView} />
      </div>
    </div>
  );
}

function SortControl({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  return (
    <select
      aria-label="Sắp xếp"
      value={value}
      onChange={(e) => onChange(e.target.value as SortKey)}
      className="h-8 rounded border border-rose-100 bg-white px-3 text-[13px] text-foreground focus:border-[#e11d74] focus:outline-none focus:ring-0"
    >
      <option value="newest">Mới nhất</option>
      <option value="oldest">Cũ nhất</option>
      <option value="name">Tên A–Z</option>
    </select>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded border border-rose-100">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "flex h-8 w-8 items-center justify-center",
          value === "grid"
            ? "bg-surface-container-high text-foreground"
            : "bg-white text-muted-foreground hover:text-foreground",
        )}
        aria-label="Xem dạng lưới"
        aria-pressed={value === "grid"}
      >
        <Grid2X2 className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "flex h-8 w-8 items-center justify-center",
          value === "list"
            ? "bg-surface-container-high text-foreground"
            : "bg-white text-muted-foreground hover:text-foreground",
        )}
        aria-label="Xem dạng danh sách"
        aria-pressed={value === "list"}
      >
        <ListIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Folder tree (left rail)
 * ------------------------------------------------------------------ */

function FolderTree({
  folders,
  loading,
  active,
  onSelect,
}: {
  folders: ReturnType<typeof useMediaFolders>["data"];
  loading?: boolean;
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside
      className="hidden w-[220px] shrink-0 flex-col overflow-y-auto border-r border-rose-100 bg-white py-4 lg:flex"
      aria-label="Cây thư mục media"
    >
      <h2 className="mb-2 px-3 text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        Thư mục
      </h2>
      <ul className="space-y-1 px-2">
        <li>
          <FolderButton
            label="Tất cả media"
            count={folders?.reduce((acc, f) => acc + f.asset_count, 0) ?? 0}
            active={active === "all"}
            onClick={() => onSelect("all")}
            isPrimary
          />
        </li>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="px-3 py-2">
              <Skeleton className="h-4 w-full" />
            </li>
          ))
        ) : (
          folders?.map((f) => (
            <li key={f.id}>
              <FolderButton
                label={f.name}
                count={f.asset_count}
                active={active === f.id}
                onClick={() => onSelect(f.id)}
              />
            </li>
          ))
        )}
      </ul>
      <h2 className="mb-2 mt-6 px-3 text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        Lối tắt
      </h2>
      <ul className="space-y-1 px-2">
        <li>
          <ShortcutButton label="Đã dùng gần đây" onClick={() => onSelect("recent")} />
        </li>
        <li>
          <ShortcutButton label="Yêu thích" onClick={() => onSelect("favorites")} />
        </li>
        <li>
          <ShortcutButton label="Thùng rác" onClick={() => onSelect("trash")} />
        </li>
      </ul>
    </aside>
  );
}

function FolderButton({
  label,
  count,
  active,
  onClick,
  isPrimary,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  isPrimary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded border px-3 py-1.5 text-left text-[13px] transition-colors",
        active
          ? "border-rose-100 bg-surface-container-high text-foreground"
          : "border-transparent text-muted-foreground hover:bg-surface-container hover:text-foreground",
      )}
    >
      <span className="flex items-center gap-2">
        <Folder
          className={cn(
            "h-4 w-4",
            isPrimary ? "text-[#e11d74]" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        <span className="truncate">{label}</span>
      </span>
      <span className="font-mono text-[11px] text-muted-foreground">
        {count.toLocaleString("vi-VN")}
      </span>
    </button>
  );
}

function ShortcutButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded border border-transparent px-3 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground"
    >
      <span className="truncate">{label}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Contextual action bar (bulk)
 * ------------------------------------------------------------------ */

function ContextActionBar({
  count,
  onClear,
  onDelete,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between border-b border-[#e11d74]/30 bg-white px-6 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-3">
        <CheckSquare className="h-4 w-4 text-[#e11d74]" aria-hidden="true" />
        <span className="text-[13px] font-medium text-foreground">
          Đã chọn {count} tệp
        </span>
      </div>
      <div className="flex items-center gap-2">
        <IconButton label="Sao chép URL" icon={Copy} />
        <IconButton label="Gắn thẻ" icon={TagIcon} />
        <IconButton label="Di chuyển" icon={FolderPlus} />
        <div className="mx-1 h-5 w-px bg-surface-container-high" aria-hidden="true" />
        <IconButton
          label="Xóa"
          icon={DeleteIcon}
          danger
          onClick={onDelete}
        />
        <button
          type="button"
          onClick={onClear}
          className="ml-2 rounded p-1.5 text-muted-foreground hover:bg-surface-container-high hover:text-foreground"
          aria-label="Bỏ chọn"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
  danger,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "rounded p-1.5 transition-colors",
        danger
          ? "text-[#ffb4ab] hover:bg-[#ffb4ab]/10"
          : "text-muted-foreground hover:bg-surface-container-high hover:text-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Asset card / row
 * ------------------------------------------------------------------ */

function AssetCard({
  asset,
  selected,
  focused,
  onSelect,
  onFocus,
}: {
  asset: MediaAsset;
  selected: boolean;
  focused: boolean;
  onSelect: () => void;
  onFocus: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect();
        onFocus();
      }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-white text-left transition-colors",
        selected
          ? "border-2 border-[#e11d74] shadow-[0_0_0_2px_rgba(225,29,116,0.15)]"
          : "border border-rose-100 hover:border-rose-100",
        focused && !selected && "ring-2 ring-[#e11d74]/40",
      )}
    >
      <div className="absolute left-2 top-2 z-10">
        <CheckSquare
          className={cn(
            "h-4 w-4 rounded bg-white",
            selected ? "text-[#e11d74]" : "text-muted-foreground opacity-0 group-hover:opacity-100",
          )}
          aria-hidden="true"
        />
      </div>
      <div className="absolute right-2 top-2 z-10 rounded border border-rose-100 bg-surface px-1.5 py-0.5 font-mono text-[10px] text-foreground backdrop-blur">
        {(asset.mime.split("/")[1] ?? "FILE").toUpperCase()}
      </div>
      <div className="relative aspect-square bg-surface">
        {asset.thumbnail_url || asset.url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={asset.thumbnail_url ?? asset.url}
            alt={asset.alt_text ?? asset.filename}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#494552]">
            <Folder className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="border-t border-rose-100 p-2">
        <p
          className={cn(
            "truncate text-[13px]",
            selected ? "font-semibold text-foreground" : "text-foreground",
          )}
          title={asset.filename}
        >
          {asset.filename}
        </p>
        <p className="mt-0.5 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>{formatBytes(asset.size_bytes)}</span>
          {asset.width && asset.height ? (
            <span>
              {asset.width}×{asset.height}
            </span>
          ) : null}
        </p>
      </div>
    </button>
  );
}

function AssetListRow({
  asset,
  selected,
  focused,
  onSelect,
  onFocus,
}: {
  asset: MediaAsset;
  selected: boolean;
  focused: boolean;
  onSelect: () => void;
  onFocus: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => {
          onSelect();
          onFocus();
        }}
        className={cn(
          "flex w-full items-center gap-3 rounded border px-3 py-2 text-left transition-colors",
          selected
            ? "border-[#e11d74] bg-surface-container"
            : "border-transparent hover:bg-surface-container",
          focused && !selected && "bg-white",
        )}
      >
        <CheckSquare
          className={cn(
            "h-4 w-4",
            selected ? "text-[#e11d74]" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        <span className="flex-1 truncate text-[13px] text-foreground">
          {asset.filename}
        </span>
        <span
          className={cn(
            "rounded border px-2 py-0.5 text-[11px] font-medium",
            getKindChipClass(asset.kind),
          )}
        >
          {getKindLabel(asset.kind)}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatBytes(asset.size_bytes)}
        </span>
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * Detail panel
 * ------------------------------------------------------------------ */

interface DetailPanelProps {
  asset: MediaAsset | null;
  onDelete: () => void;
  onAltTextSave: (value: string) => void;
  deleting: boolean;
  savingAltText: boolean;
}

function DetailPanel({ asset, onDelete, onAltTextSave, deleting, savingAltText }: DetailPanelProps) {
  return (
    <aside
      className="hidden w-[320px] shrink-0 flex-col overflow-y-auto border-l border-rose-100 bg-white xl:flex"
      aria-label="Chi tiết tệp media"
    >
      {!asset ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-[13px] text-muted-foreground">
          Chọn một tệp để xem chi tiết.
        </div>
      ) : (
        <>
          <div className="border-b border-rose-100 p-6 pb-4">
            <div className="mb-4 aspect-square overflow-hidden rounded-lg border border-rose-100 bg-surface">
              {asset.thumbnail_url || asset.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={asset.thumbnail_url ?? asset.url}
                  alt={asset.alt_text ?? asset.filename}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#494552]">
                  <Folder className="h-12 w-12" aria-hidden="true" />
                </div>
              )}
            </div>
            <h3 className="break-words text-[14px] font-medium text-foreground">
              {asset.filename}
            </h3>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
              Đã tải lên {formatDate(asset.uploaded_at)}
            </p>
          </div>

          <div className="space-y-3 border-b border-rose-100 p-6 py-4 text-[13px]">
            <DetailRow label="Kích thước" value={asset.width && asset.height ? `${asset.width} × ${asset.height} px` : "—"} />
            <DetailRow label="Dung lượng" value={formatBytes(asset.size_bytes)} />
            <DetailRow label="Định dạng" value={asset.mime} />
            <DetailRow label="Người tải lên" value={asset.uploaded_by} />
          </div>

          <div className="space-y-4 border-b border-rose-100 p-6 py-4">
            <h4 className="text-[13px] font-medium text-foreground">
              Văn bản thay thế
            </h4>
            <AltTextEditor
              value={asset.alt_text ?? ""}
              onSave={onAltTextSave}
              saving={savingAltText}
            />
          </div>

          {asset.usage.length > 0 && (
            <div className="flex-1 space-y-2 border-b border-rose-100 p-6 py-4">
              <h4 className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                <Eye className="h-4 w-4" aria-hidden="true" />
                Được sử dụng tại
              </h4>
              <ul className="space-y-2">
                {asset.usage.map((u, idx) => (
                  <li key={`${u.label}-${idx}`}>
                    <a
                      href={u.href ?? "#"}
                      className="flex items-center justify-between rounded border border-rose-100 bg-surface-container-high p-2 text-[13px] text-foreground transition-colors hover:bg-surface-container-high"
                    >
                      <span>{u.label}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto p-6 py-4">
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => undefined}
                className="w-full"
              >
                Thay thế tệp
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onDelete}
                disabled={deleting}
                className="w-full border-[#ffb4ab]/50 text-[#ffb4ab] hover:bg-[#ffb4ab]/10 hover:border-[#ffb4ab]"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                <DeleteIcon className="h-4 w-4" aria-hidden="true" />
                <span>Xóa</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 gap-y-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-mono text-foreground">{value}</span>
    </div>
  );
}

function AltTextEditor({
  value,
  onSave,
  saving,
}: {
  value: string;
  onSave: (next: string) => void;
  saving: boolean;
}) {
  const [local, setLocal] = React.useState(value);
  React.useEffect(() => setLocal(value), [value]);
  return (
    <div className="flex flex-col gap-2">
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onSave(local);
        }}
        placeholder="Văn bản thay thế (alt text)..."
        aria-label="Văn bản thay thế"
        className="bg-surface"
      />
      {saving && (
        <span className="font-mono text-[11px] text-muted-foreground">Đang lưu…</span>
      )}
    </div>
  );
}
