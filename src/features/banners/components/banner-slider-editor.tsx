"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn, formatDate, resolveImageUrl } from "@/lib/utils";
import { DateRangeText } from "@/components/common/crud/date-range-text";
import { EmptyState } from "@/components/common/empty-state";
import type { APIError } from "@/lib/api";
import type { Banner, UpdateBannerInput } from "@/types";
import {
  BANNER_STATUS_FILTERS,
  getBannerStatus,
  type BannerStatusFilter,
} from "../utils/banner-status";
import {
  useBannerList,
  useDeleteBanner,
  useReorderBanners,
  useToggleBannerStatus,
  useUpdateBanner,
} from "../hooks";
import { BannerImageUpload } from "./banner-image-upload";

/**
 * `BannerSliderEditor` — the new admin banner page.
 *
 * Replaces the previous grid view (`BannerListView`). The page is
 * modelled after a slider editor:
 *
 *   ┌─ Toolbar (search + status tabs + actions) ──────────────┐
 *   ├─ Hero preview (the selected banner, 16:9) ──────────────┤
 *   │                                                          │
 *   │   <Chevron>  [16:9 banner artwork]  <Chevron>           │
 *   │                                                          │
 *   ├─ Info panel (link, image replace, switch, status) ──────┤
 *   ├─ Sortable thumbnail strip (drag-to-reorder + delete) ───┤
 *   └──────────────────────────────────────────────────────────┘
 *
 * Drag-and-drop ordering is held in local state and persisted on
 * demand through `useReorderBanners` (loops PUT /admin/banners/:id
 * with the new `position`). The hero preview links directly to the
 * store-facing slider so the operator can see the asset in context
 * without leaving the editor.
 */
export function BannerSliderEditor() {
  const router = useRouter();

  const listQuery = useBannerList();
  const toggleStatus = useToggleBannerStatus();
  const deleteBanner = useDeleteBanner();
  const updateBanner = useUpdateBanner();
  const reorder = useReorderBanners();

  const [statusFilter, setStatusFilter] = React.useState<BannerStatusFilter>("all");
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Banner | null>(null);
  const [pendingToggleId, setPendingToggleId] = React.useState<string | null>(null);
  const [linkDraft, setLinkDraft] = React.useState<string>("");
  const [linkDirty, setLinkDirty] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState<string>("");
  const [titleDirty, setTitleDirty] = React.useState(false);
  const [subtitleDraft, setSubtitleDraft] = React.useState<string>("");
  const [subtitleDirty, setSubtitleDirty] = React.useState(false);

  // Local ordering — drag-and-drop mutates this; "Lưu tất cả"
  // commits it. Initialised from the server response.
  const [order, setOrder] = React.useState<string[]>([]);
  const lastServerOrderRef = React.useRef<string[]>([]);

  const items = React.useMemo(() => listQuery.data ?? [], [listQuery.data]);
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

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const byId = new Map(items.map((b) => [b.id, b]));
    // Respect the local sort order (if set), but fall back to the
    // server's natural ordering when no reorder has happened yet.
    const orderedIds =
      order.length > 0 ? order : items.map((b) => b.id);
    const ordered = orderedIds
      .map((id) => byId.get(id))
      .filter((b): b is Banner => Boolean(b));
    return ordered.filter((banner) => {
      const status = getBannerStatus(banner);
      const matchStatus =
        statusFilter === "all" || status.lifecycle === statusFilter;
      const matchSearch = !q || banner.title.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [items, order, search, statusFilter]);

  // Keep the editor's sort order in sync with the server response.
  // Only reset when the server returns an order we haven't seen —
  // i.e. after a refetch that picked up external changes.
  React.useEffect(() => {
    const serverOrder = items.map((b) => b.id);
    const sameSet =
      serverOrder.length === lastServerOrderRef.current.length &&
      serverOrder.every((id, i) => lastServerOrderRef.current[i] === id);
    if (!sameSet) {
      setOrder(serverOrder);
      lastServerOrderRef.current = serverOrder;
    }
  }, [items]);

  // Pick the first visible banner when nothing is selected yet, or
  // when the previous selection is filtered out.
  React.useEffect(() => {
    if (visible.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    const stillVisible = visible.some((b) => b.id === selectedId);
    if (!selectedId || !stillVisible) {
      setSelectedId(visible[0]?.id ?? null);
    }
  }, [visible, selectedId]);

  const selected = visible.find((b) => b.id === selectedId) ?? null;

  // Sync drafts whenever the selection changes — never persist an
  // uncommitted draft to a different banner.
  React.useEffect(() => {
    setTitleDraft(selected?.title ?? "");
    setTitleDirty(false);
    setSubtitleDraft(selected?.subtitle ?? "");
    setSubtitleDirty(false);
    setLinkDraft(selected?.link ?? "");
    setLinkDirty(false);
  }, [selectedId, selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const orderedDirty = React.useMemo(() => {
    const serverOrder = items.map((b) => b.id);
    if (serverOrder.length !== order.length) return false;
    return serverOrder.some((id, i) => order[i] !== id);
  }, [items, order]);

  const dirtyCount =
    (titleDirty ? 1 : 0) +
    (subtitleDirty ? 1 : 0) +
    (linkDirty ? 1 : 0) +
    (orderedDirty ? 1 : 0);

  const handleReorder = React.useCallback(
    (nextVisibleIds: string[]) => {
      // Merge the new visible order into the full server order,
      // keeping any banners hidden by the current filter where they
      // were. Visible items take their new relative positions; the
      // hidden tail preserves its original place at the end.
      setOrder((prev) => {
        if (prev.length === 0) return nextVisibleIds;
        const visibleSet = new Set(nextVisibleIds);
        const hidden = prev.filter((id) => !visibleSet.has(id));
        return [...nextVisibleIds, ...hidden];
      });
    },
    [],
  );

  const handleSelect = React.useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleDelete = React.useCallback((banner: Banner) => {
    setPendingDelete(banner);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deleteBanner.mutateAsync(pendingDelete.id);
      toast.success(`Đã xoá banner "${pendingDelete.title}"`);
      setPendingDelete(null);
    } catch (err) {
      toast.error("Không thể xoá banner", {
        description: (err as APIError).message,
      });
    }
  }, [pendingDelete, deleteBanner]);

  const handleToggleActive = React.useCallback(
    async (banner: Banner, next: boolean) => {
      if (next === banner.is_active) return;
      setPendingToggleId(banner.id);
      try {
        await toggleStatus.mutateAsync({
          id: banner.id,
          activate: next,
        });
      } catch {
        // toast handled in hook
      } finally {
        setPendingToggleId(null);
      }
    },
    [toggleStatus],
  );

  const handleSaveAll = React.useCallback(async () => {
    // Two distinct mutations may be queued: a content patch for the
    // currently selected banner (title / subtitle / link) and a
    // position reorder for the whole list. Run the content patch
    // first (single round-trip) and then the per-item position PUTs
    // in sequence — partial failures abort the rest so the operator
    // sees the problem before the list ends up in a weird state.
    const tasks: Array<{ id: string; input: UpdateBannerInput }> = [];
    if (selected) {
      const input: UpdateBannerInput = {};
      if (titleDirty) {
        const trimmed = titleDraft.trim();
        if (trimmed === "") {
          toast.error("Tiêu đề không được để trống");
          return;
        }
        input.title = trimmed;
      }
      if (subtitleDirty) {
        const trimmed = subtitleDraft.trim();
        input.subtitle = trimmed === "" ? null : trimmed;
      }
      if (linkDirty) {
        const trimmed = linkDraft.trim();
        // Block save when the link is non-empty but malformed —
        // surfaces the validation issue before committing instead
        // of wiping the URL on the backend with `null`.
        if (trimmed !== "" && !safeIsUrl(trimmed)) {
          toast.error("URL liên kết không hợp lệ");
          return;
        }
        input.link = trimmed === "" ? null : trimmed;
      }
      if (Object.keys(input).length > 0) {
        tasks.push({ id: selected.id, input });
      }
    }

    try {
      for (const task of tasks) {
        await updateBanner.mutateAsync(task);
      }
      if (orderedDirty) {
        const itemsPayload = order.map((id, index) => ({ id, position: index }));
        await reorder.mutateAsync({ items: itemsPayload });
        lastServerOrderRef.current = order;
      }
      // Clear every dirty flag only on a fully successful save so a
      // partial failure keeps the dirty state (the operator can fix
      // and retry without losing their typing).
      if (titleDirty) setTitleDirty(false);
      if (subtitleDirty) setSubtitleDirty(false);
      if (linkDirty) setLinkDirty(false);
      toast.success("Đã lưu thay đổi");
    } catch {
      // Individual hook handles its own toast (useUpdateBanner /
      // useReorderBanners). Leaving the dirty state intact so the
      // operator can retry.
    }
  }, [
    selected,
    titleDirty,
    titleDraft,
    subtitleDirty,
    subtitleDraft,
    linkDirty,
    linkDraft,
    orderedDirty,
    order,
    updateBanner,
    reorder,
  ]);

  const handleResetAll = React.useCallback(() => {
    // Drop every draft back to the server-side value. Cheap "discard
    // changes" path — no network call.
    if (selected) {
      setTitleDraft(selected.title);
      setTitleDirty(false);
      setSubtitleDraft(selected.subtitle ?? "");
      setSubtitleDirty(false);
      setLinkDraft(selected.link ?? "");
      setLinkDirty(false);
    }
    if (orderedDirty) {
      setOrder(lastServerOrderRef.current);
    }
  }, [selected, orderedDirty]);

  const handleImageUploaded = React.useCallback(
    async (objectKey: string, _url: string) => {
      // Image uploads commit immediately — they need their own
      // multipart round-trip and there's no good way to buffer the
      // new image_key locally. The sticky "Lưu tất cả" bar only
      // tracks text drafts and drag-reorders.
      //
      // The upload endpoint returns the storage key as `object_key`
      // (the generic /v1/admin/upload contract); we persist it on
      // the banner under its own field name `image_key`.
      if (!selected) return;
      try {
        await updateBanner.mutateAsync({
          id: selected.id,
          input: { image_key: objectKey },
        });
      } catch {
        // toast handled in hook
      }
    },
    [selected, updateBanner],
  );

  const handleAddNew = React.useCallback(() => {
    router.push("/admin/banners/new");
  }, [router]);

  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;

  if (isError) {
    return (
      <div className="rounded-xl border border-hairline bg-card p-6 text-[14px] text-destructive">
        <p className="font-medium">Không thể tải danh sách banner.</p>
        <p className="mt-1 text-muted-foreground">
          {(listQuery.error as APIError | null)?.message ??
            "Đã xảy ra lỗi không xác định."}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => listQuery.refetch()}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <EditorSkeleton />;
  }

  return (
    <div className="flex flex-col gap-5">
      <EditorToolbar
        search={search}
        onSearchChange={setSearch}
        onRefresh={() => listQuery.refetch()}
        isFetching={listQuery.isFetching}
      />

      <Tabs
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as BannerStatusFilter)}
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {BANNER_STATUS_FILTERS.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value} className="gap-1.5">
              <span>{opt.label}</span>
              <span className="text-[12px] tabular-nums text-muted-foreground">
                ({counts[opt.value]})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <EmptyState
          title={search || statusFilter !== "all"
            ? "Không có banner nào khớp bộ lọc"
            : "Chưa có banner nào"}
          description={
            search || statusFilter !== "all"
              ? "Thử đổi bộ lọc hoặc từ khoá tìm kiếm."
              : "Tạo banner đầu tiên để hiển thị trên trang chủ."
          }
          action={
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4" />
              <span>Thêm banner</span>
            </Button>
          }
          className="rounded-xl border border-hairline bg-card"
        />
      ) : (
        <>
          <HeroPreview
            banner={selected}
            pendingToggle={pendingToggleId === selected?.id}
            onToggleActive={(next) =>
              selected ? handleToggleActive(selected, next) : undefined
            }
            onSelectPrev={() => {
              const idx = visible.findIndex((b) => b.id === selected?.id);
              const prev = idx > 0 ? visible[idx - 1] : null;
              if (prev) setSelectedId(prev.id);
            }}
            onSelectNext={() => {
              const idx = visible.findIndex((b) => b.id === selected?.id);
              const next = idx >= 0 && idx < visible.length - 1 ? visible[idx + 1] : null;
              if (next) setSelectedId(next.id);
            }}
            onJumpTo={(idx) => {
              const target = visible[idx];
              if (target) setSelectedId(target.id);
            }}
            allBanners={visible}
            currentIndex={
              selected
                ? Math.max(
                    0,
                    visible.findIndex((b) => b.id === selected.id),
                  )
                : 0
            }
            canSelectPrev={
              !!selected &&
              visible.findIndex((b) => b.id === selected.id) > 0
            }
            canSelectNext={
              !!selected &&
              visible.findIndex((b) => b.id === selected.id) <
                visible.length - 1
            }
          />

          <InfoPanel
            banner={selected}
            titleDraft={titleDraft}
            onTitleDraftChange={(value) => {
              setTitleDraft(value);
              setTitleDirty(value !== (selected?.title ?? ""));
            }}
            subtitleDraft={subtitleDraft}
            onSubtitleDraftChange={(value) => {
              setSubtitleDraft(value);
              setSubtitleDirty(value !== (selected?.subtitle ?? ""));
            }}
            linkDraft={linkDraft}
            onLinkDraftChange={(value) => {
              setLinkDraft(value);
              setLinkDirty(value !== (selected?.link ?? ""));
            }}
            onImageUploaded={handleImageUploaded}
            onEdit={() =>
              selected ? router.push(`/admin/banners/${selected.id}/edit`) : undefined
            }
          />

          <ThumbStrip
            banners={visible}
            selectedId={selectedId}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onReorder={handleReorder}
            orderedDirty={orderedDirty}
          />
        </>
      )}

      <ConfirmDeleteDialog
        banner={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        submitting={deleteBanner.isPending}
      />

      <StickyActionBar
        dirtyCount={dirtyCount}
        saving={updateBanner.isPending || reorder.isPending}
        onReset={handleResetAll}
        onSave={handleSaveAll}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Toolbar
 * ------------------------------------------------------------------ */

interface EditorToolbarProps {
  search: string;
  onSearchChange: (next: string) => void;
  onRefresh: () => void;
  isFetching: boolean;
}

function EditorToolbar({
  search,
  onSearchChange,
  onRefresh,
  isFetching,
}: EditorToolbarProps) {
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

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isFetching}
          aria-label="Tải lại danh sách"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
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

/* ------------------------------------------------------------------ *
 * Hero preview
 * ------------------------------------------------------------------ */

interface HeroPreviewProps {
  banner: Banner | null;
  pendingToggle: boolean;
  onToggleActive: (next: boolean) => void;
  onSelectPrev: () => void;
  onSelectNext: () => void;
  canSelectPrev: boolean;
  canSelectNext: boolean;
  onJumpTo: (index: number) => void;
  allBanners: Banner[];
  currentIndex: number;
}

function HeroPreview({
  banner,
  pendingToggle,
  onToggleActive,
  onSelectPrev,
  onSelectNext,
  canSelectPrev,
  canSelectNext,
  onJumpTo,
  allBanners,
  currentIndex,
}: HeroPreviewProps) {
  const [imageFailed, setImageFailed] = React.useState(false);

  if (!banner) return null;
  const status = getBannerStatus(banner);
  const overlay = status.lifecycle === "expired" || status.lifecycle === "inactive";
  const src =
    banner.image_url && !imageFailed ? resolveImageUrl(banner.image_url) : null;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-hairline bg-card"
      aria-label="Xem trước slider"
    >
      <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-xl bg-surface-container-low">
        {src ? (
          <Image
            src={src}
            alt={banner.title}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
            unoptimized
            className={cn(
              "object-cover transition-opacity duration-200",
              overlay && "opacity-60",
            )}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Chưa có hình ảnh
          </div>
        )}

        {(banner.title || banner.subtitle) && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-black/15 to-transparent">
            <div className="w-full space-y-1 px-6 pb-8 md:px-12 md:pb-12">
              {banner.subtitle && (
                <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-white/85">
                  {banner.subtitle}
                </p>
              )}
              {banner.title && (
                <h2 className="max-w-3xl text-[28px] font-bold leading-[1.1] tracking-tight text-white md:text-[44px]">
                  {banner.title}
                </h2>
              )}
            </div>
          </div>
        )}

        <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center rounded-full bg-background/85 px-3 py-1 text-[12px] font-medium text-foreground shadow-sm backdrop-blur">
          #{banner.position} · {status.label}
        </span>

        <div
          className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 shadow-sm backdrop-blur"
          role="tablist"
          aria-label="Chuyển banner trong preview"
        >
          <button
            type="button"
            onClick={onSelectPrev}
            disabled={!canSelectPrev}
            className="pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Banner trước"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          {allBanners.map((b, i) => {
            const active = i === currentIndex;
            return (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Chuyển đến banner ${i + 1}: ${b.title}`}
                onClick={() => onJumpTo(i)}
                className={cn(
                  "pointer-events-auto h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                  active
                    ? "w-6 bg-white"
                    : "w-2 bg-white/55 hover:bg-white/80",
                )}
              />
            );
          })}
          <button
            type="button"
            onClick={onSelectNext}
            disabled={!canSelectNext}
            className="pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Banner sau"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Đang chọn
          </p>
          <p className="text-[15px] font-semibold leading-snug text-foreground">
            {banner.title}
          </p>
          {banner.subtitle && (
            <p className="text-[13px] text-muted-foreground">{banner.subtitle}</p>
          )}
        </div>
        <div className="inline-flex items-center gap-3">
          <span className="text-[12px] font-medium text-muted-foreground">
            {banner.is_active ? "Đang bật" : "Đang tắt"}
          </span>
          <Switch
            checked={banner.is_active}
            disabled={
              pendingToggle ||
              status.lifecycle === "expired" ||
              status.lifecycle === "scheduled"
            }
            onCheckedChange={onToggleActive}
            aria-label={`Bật/tắt banner ${banner.title}`}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Info panel
 * ------------------------------------------------------------------ */

interface InfoPanelProps {
  banner: Banner | null;
  titleDraft: string;
  onTitleDraftChange: (next: string) => void;
  subtitleDraft: string;
  onSubtitleDraftChange: (next: string) => void;
  linkDraft: string;
  onLinkDraftChange: (next: string) => void;
  onImageUploaded: (key: string, url: string) => void;
  onEdit: () => void;
}

function InfoPanel({
  banner,
  titleDraft,
  onTitleDraftChange,
  subtitleDraft,
  onSubtitleDraftChange,
  linkDraft,
  onLinkDraftChange,
  onImageUploaded,
  onEdit,
}: InfoPanelProps) {
  if (!banner) return null;
  const status = getBannerStatus(banner);
  const linkInvalid =
    linkDraft.length > 0 && !safeIsUrl(linkDraft);

  return (
    <section
      className="flex flex-col gap-4 rounded-2xl border border-hairline bg-card p-5"
      aria-label="Thông tin banner đang chọn"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Thông tin banner
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
        >
          Mở trang chỉnh sửa đầy đủ
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Title */}
        <DraftField
          id="banner-title"
          label="Tiêu đề"
          required
          value={titleDraft}
          onChange={onTitleDraftChange}
          placeholder="Tiêu đề banner"
        />

        {/* Subtitle */}
        <DraftField
          id="banner-subtitle"
          label="Phụ đề"
          value={subtitleDraft}
          onChange={onSubtitleDraftChange}
          placeholder="Mô tả ngắn (tuỳ chọn)"
        />

        {/* Link to */}
        <div className="space-y-2 lg:col-span-2">
          <label
            htmlFor="banner-link"
            className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
          >
            Link đích
          </label>
          <Input
            id="banner-link"
            type="url"
            placeholder="https://…"
            value={linkDraft}
            onChange={(e) => onLinkDraftChange(e.target.value)}
            aria-invalid={linkInvalid || undefined}
            aria-label="URL liên kết của banner"
          />
          {linkInvalid && (
            <p className="text-[12px] text-destructive" role="alert">
              URL không hợp lệ.
            </p>
          )}
          <p className="text-[12px] text-muted-foreground">
            Để trống nếu banner không cần liên kết.
          </p>
        </div>
      </div>

      {/* Replace image */}
      <div className="space-y-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Thay ảnh
        </p>
        <BannerImageUpload
          imageUrl={banner.image_url ?? null}
          onChange={onImageUploaded}
          onClear={() => {
            /* BannerImageUpload always re-uploads — clearing the
               image_key is not supported by the backend, so this
               handler is intentionally a no-op. */
          }}
        />
        <p className="text-[12px] text-muted-foreground">
          Kích thước đề xuất 1920×800 px để hiển thị đẹp trên slider.
        </p>
      </div>

      {/* Schedule */}
      <div className="space-y-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Lịch hiển thị
        </p>
        <div className="flex items-center gap-2 text-[14px] text-foreground">
          <DateRangeText
            starts_at={banner.starts_at}
            ends_at={banner.ends_at}
            className="text-[14px]"
          />
        </div>
        {status.lifecycle === "scheduled" && banner.starts_at ? (
          <p className="text-[12px] text-muted-foreground">
            Sẽ tự động bật vào {formatDate(banner.starts_at)}.
          </p>
        ) : null}
        {status.lifecycle === "expired" && banner.ends_at ? (
          <p className="text-[12px] text-muted-foreground">
            Đã tắt từ {formatDate(banner.ends_at)}.
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* Plain draft input used by the InfoPanel. All edits are buffered
 * locally and only committed when the operator clicks "Lưu tất cả"
 * at the bottom of the editor — see `handleSaveAll` in the parent. */
interface DraftFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  required?: boolean;
}

function DraftField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
}: DraftFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-destructive">
            *
          </span>
        ) : null}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-required={required || undefined}
      />
    </div>
  );
}

function safeIsUrl(input: string): boolean {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Sortable thumbnail strip
 * ------------------------------------------------------------------ */

interface ThumbStripProps {
  banners: Banner[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (banner: Banner) => void;
  onReorder: (orderedVisibleIds: string[]) => void;
  orderedDirty: boolean;
}

function ThumbStrip({
  banners,
  selectedId,
  onSelect,
  onDelete,
  onReorder,
  orderedDirty,
}: ThumbStripProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const visibleIds = banners.map((b) => b.id);
      const oldIndex = visibleIds.indexOf(String(active.id));
      const newIndex = visibleIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      onReorder(arrayMove(visibleIds, oldIndex, newIndex));
    },
    [banners, onReorder],
  );

  return (
    <section
      className="rounded-2xl border border-hairline bg-card p-4"
      aria-label="Danh sách banner — kéo để sắp xếp"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Danh sách banner
        </p>
        <p className="text-[12px] text-muted-foreground">
          Kéo thả để sắp xếp · nhấp để chọn
          {orderedDirty ? (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">
              Có thay đổi chưa lưu
            </span>
          ) : null}
        </p>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={banners.map((b) => b.id)}
          strategy={horizontalListSortingStrategy}
        >
          <ol className="flex gap-3 overflow-x-auto pb-2">
            {banners.map((banner, index) => (
              <SortableThumb
                key={banner.id}
                banner={banner}
                index={index}
                selected={selectedId === banner.id}
                onSelect={() => onSelect(banner.id)}
                onDelete={() => onDelete(banner)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </section>
  );
}

interface SortableThumbProps {
  banner: Banner;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableThumb({
  banner,
  index,
  selected,
  onSelect,
  onDelete,
}: SortableThumbProps) {
  const sortable = useSortable({ id: banner.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };
  const [failed, setFailed] = React.useState(false);
  const src =
    banner.image_url && !failed ? resolveImageUrl(banner.image_url) : null;
  const status = getBannerStatus(banner);

  return (
    <li
      ref={sortable.setNodeRef}
      style={style}
      className={cn(
        "group/thumb relative flex w-[180px] shrink-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground transition-shadow",
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-hairline hover:border-primary/40",
        sortable.isDragging && "z-10 opacity-80 shadow-lg",
      )}
      aria-current={selected ? "true" : undefined}
    >
      <button
        type="button"
        onClick={onSelect}
        className="relative aspect-square w-full overflow-hidden bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Chọn banner ${banner.title}`}
      >
        {src ? (
          <Image
            src={src}
            alt={banner.title}
            fill
            sizes="180px"
            className="object-cover"
            unoptimized
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-muted-foreground">
            Chưa có ảnh
          </div>
        )}
        <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
          #{index + 1}
        </span>
        <span
          className={cn(
            "pointer-events-none absolute right-2 top-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium shadow-sm",
            status.lifecycle === "active" && "bg-emerald-100 text-emerald-900",
            status.lifecycle === "scheduled" && "bg-sky-100 text-sky-900",
            status.lifecycle === "expired" && "bg-zinc-200 text-zinc-700",
            status.lifecycle === "inactive" && "bg-amber-100 text-amber-900",
          )}
        >
          {status.label}
        </span>
      </button>

      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
        <span
          {...sortable.attributes}
          {...sortable.listeners}
          className="inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-rose-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
          aria-label={`Kéo để sắp xếp banner ${banner.title}`}
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-rose-50 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Xoá banner ${banner.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * Confirm-delete dialog
 * ------------------------------------------------------------------ */

interface ConfirmDeleteDialogProps {
  banner: Banner | null;
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

function ConfirmDeleteDialog({
  banner,
  onCancel,
  onConfirm,
  submitting,
}: ConfirmDeleteDialogProps) {
  if (!banner) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xoá banner"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-card p-6 shadow-xl">
        <h3 className="text-[18px] font-semibold text-foreground">
          Xoá banner &quot;{banner.title}&quot;?
        </h3>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Banner sẽ bị xoá khỏi slider trang chủ. Hành động này không thể hoàn tác.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Huỷ
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            )}
            <span>Xoá</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Skeleton
 * ------------------------------------------------------------------ */

function EditorSkeleton() {
  return (
    <div
      className="flex flex-col gap-5"
      role="status"
      aria-busy="true"
      aria-label="Đang tải editor banner"
    >
      <div className="h-10 w-72 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="h-10 w-96 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="mx-auto aspect-[4/3] w-full max-w-3xl animate-pulse rounded-xl bg-surface-container-high" />
      <div className="h-40 w-full animate-pulse rounded-2xl bg-surface-container-high" />
      <div className="h-32 w-full animate-pulse rounded-2xl bg-surface-container-high" />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Sticky action bar
 * ------------------------------------------------------------------ */

/* Bottom-pinned bar that surfaces the cumulative dirty state for
 * the editor. Renders nothing while there are no pending changes so
 * the rest of the page breathes — appears the moment the operator
 * edits any field or reorders a thumbnail. */
interface StickyActionBarProps {
  dirtyCount: number;
  saving: boolean;
  onReset: () => void;
  onSave: () => void;
}

function StickyActionBar({
  dirtyCount,
  saving,
  onReset,
  onSave,
}: StickyActionBarProps) {
  if (dirtyCount === 0) return null;

  return (
    <div
      className="sticky bottom-4 z-30 mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-hairline bg-card/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80"
      role="region"
      aria-label="Thay đổi chưa lưu"
    >
      <div className="flex items-center gap-2 text-[14px] text-foreground">
        <span
          className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-[12px] font-semibold tabular-nums text-primary-foreground"
          aria-hidden="true"
        >
          {dirtyCount}
        </span>
        <span>
          {dirtyCount === 1
            ? "1 thay đổi chưa lưu"
            : `${dirtyCount} thay đổi chưa lưu`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={saving}
        >
          Hủy
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          <span>Lưu tất cả</span>
        </Button>
      </div>
    </div>
  );
}