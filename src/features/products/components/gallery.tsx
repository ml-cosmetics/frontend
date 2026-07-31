"use client";

import * as React from "react";
import Image from "next/image";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import { Loader2, Trash2, Upload, X, GripVertical, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn, resolveImageUrl } from "@/lib/utils";
import type { APIError } from "@/lib/api";
import type { ID, ProductImage } from "@/types";
import { useProductImages } from "../hooks/use-product-images";
import {
  useUploadProductImage,
  type UploadedImage,
} from "../hooks/use-upload-product-image";

/**
 * `ProductImageGallery` — product image management block for the edit page.
 *
 * Layout:
 *   - Left  (basis-[45%]) — large hero image (the first image in the
 *     current order), square aspect ratio.
 *   - Right (flex-1)      — compact upload button + sortable 4-column
 *     thumbnail grid. Server keys are draggable; pending tiles are
 *     pinned at the start and non-draggable.
 *
 * Controlled component:
 *   - `orderKeys` drives the visible order (server keys + pending keys
 *     prefixed with `pending:`).
 *   - `onOrderChange` fires on drop / delete / upload — the parent form
 *     decides when to PUT to the backend (typically on "Lưu thay đổi").
 *
 * The 30 MB ceiling matches the backend's `maxUploadBytes` on the
 * generic `/v1/admin/upload` handler (20 MB) plus headroom for
 * multipart overhead and large hero shots.
 */
export interface ProductImageGalleryProps {
  productId: ID;
  /** Current image order. Pending tiles are prefixed with `pending:`. */
  orderKeys: string[];
  /** Fired when the user reorders, uploads, or undoes a deletion. */
  onOrderChange: (next: string[]) => void;
  /**
   * Server keys staged for deletion. The gallery renders these
   * tiles with a "Đã xoá" badge + undo button; they are NOT
   * removed from `orderKeys` so the tile lookup keeps working.
   * The parent form is expected to exclude these keys from the
   * PUT `image_keys` payload on save.
   */
  stagedForDeletion: Set<string>;
  /** Fired when the user stages or undoes a deletion. */
  onStagedDeletionChange: (next: Set<string>) => void;
  disabled?: boolean;
}

const MAX_FILE_BYTES = 30 * 1024 * 1024;
const PENDING_PREFIX = "pending:";

/** Internal tile shape used by the grid. */
type ServerTile = {
  _tag: "server";
  /** Stable id (object_key from server, server-id from API). */
  id: string;
  /** URL used for <Image>. */
  image_url: string;
};
type PendingTile = {
  _tag: "pending";
  /** Composite id with `pending:` prefix. */
  id: string;
  image_url: string;
  previewUrl: string;
  status: "uploading" | "failed";
  errorMessage?: string;
  /** Raw key produced by the upload (MinIO object_key). */
  uploadedKey: string | null;
};
type Tile = ServerTile | PendingTile;

interface PendingUpload {
  id: string;
  file: File;
  previewUrl: string;
  status: "uploading" | "failed";
  errorMessage?: string;
  uploadedKey: string | null;
}

/**
 * Map of object_key → uploaded.url. Populated when the upload
 * resolves successfully and the gallery promotes the pending tile
 * to a "server" tile without waiting for the form save. The server
 * only associates the key with the product on PUT /products/:id, so
 * `useProductImages` won't return it until then — we use the local
 * map as the source of truth for tiles that haven't been saved yet.
 */
type UploadedUrlMap = Map<string, string>;

export function ProductImageGallery({
  productId,
  orderKeys,
  onOrderChange,
  stagedForDeletion,
  onStagedDeletionChange,
  disabled,
}: ProductImageGalleryProps) {
  const imagesQuery = useProductImages(productId);
  const upload = useUploadProductImage();

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const abortControllersRef = React.useRef<Map<string, AbortController>>(new Map());
  /**
   * Mirror of the latest `orderKeys` for use inside async callbacks
   * (upload `.then` / `.catch`). The callbacks close over the value
   * at the moment `handleFiles` was called, which is one render
   * stale by the time the upload resolves; reading the ref instead
   * lets us replace / remove the pending key without races.
   */
  const orderKeysRef = React.useRef<string[]>([]);
  React.useEffect(() => {
    orderKeysRef.current = orderKeys;
  }, [orderKeys]);

  const [pendingUploads, setPendingUploads] = React.useState<PendingUpload[]>([]);
  /**
   * Lookup of `object_key → uploaded.url` for keys that the user has
   * uploaded but the form hasn't saved yet. The server only
   * associates a key with the product when the form PUTs
   * `image_keys`, so `useProductImages` won't know about them in the
   * meantime — this map lets the gallery render the freshly uploaded
   * image immediately instead of leaving an empty slot.
   */
  const [uploadedUrls, setUploadedUrls] = React.useState<UploadedUrlMap>(new Map());

  // Revoke object URLs on unmount.
  React.useEffect(() => {
    return () => {
      for (const p of pendingUploads) URL.revokeObjectURL(p.previewUrl);
      for (const controller of abortControllersRef.current.values()) {
        controller.abort();
      }
      abortControllersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- build the visible tile list from controlled orderKeys ----
   *
   * `orderKeys` is the visible order INCLUDING server keys the
   * user has marked for deletion. The tile builder checks
   * `stagedForDeletion` to render those keys with a "Đã xoá"
   * badge + undo button instead of a live server row.
   */

  const tiles = React.useMemo<Tile[]>(() => {
    const serverByKey = new Map<string, ProductImage>();
    for (const img of imagesQuery.data ?? []) {
      if (img.object_key) serverByKey.set(img.object_key, img);
    }

    const result: Tile[] = [];
    for (const k of orderKeys) {
      if (k.startsWith(PENDING_PREFIX)) {
        const pending = pendingUploads.find((p) => `${PENDING_PREFIX}${p.id}` === k);
        if (!pending) continue; // dropped on cancel/dismiss
        result.push({
          _tag: "pending",
          id: k,
          image_url: pending.previewUrl,
          previewUrl: pending.previewUrl,
          status: pending.status,
          errorMessage: pending.errorMessage,
          uploadedKey: pending.uploadedKey,
        });
        continue;
      }
      const img = serverByKey.get(k);
      if (img) {
        result.push({
          _tag: "server",
          id: k,
          image_url: img.image_url,
        });
        continue;
      }
      // No server row yet — the user just uploaded this and the form
      // hasn't been saved. Fall back to the URL we captured at upload
      // time so the tile keeps a visible preview instead of vanishing.
      const uploadedUrl = uploadedUrls.get(k);
      if (uploadedUrl) {
        result.push({
          _tag: "server",
          id: k,
          image_url: uploadedUrl,
        });
        continue;
      }
      // No server row and no upload — most likely the key was
      // marked for deletion and the server has already been
      // reconciled via a refetch. Render a tombstone tile so the
      // user can still see (and undo) what they're about to drop
      // on save. Without this the gallery would silently
      // disappear keys the user just deleted, which is jarring.
      if (stagedForDeletion.has(k)) {
        result.push({
          _tag: "server",
          id: k,
          // No image to display; SortableThumbnail will dim it.
          image_url: "",
        });
      }
      // else: the key was never uploaded and isn't on the server
      // (defensive); drop it silently to avoid an empty tile.
    }
    return result;
  }, [imagesQuery.data, orderKeys, pendingUploads, uploadedUrls, stagedForDeletion]);

  const heroTile = tiles[0] ?? null;
  const sortableIds = tiles.filter((t) => t._tag === "server").map((t) => t.id);

  /* ---- drag-and-drop ---- */

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sortableIds.indexOf(String(active.id));
      const newIndex = sortableIds.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = arrayMove(sortableIds, oldIndex, newIndex);
      // Pending tiles always stay at the start; server tiles fill the rest.
      const pendingKeys = orderKeys.filter((k) => k.startsWith(PENDING_PREFIX));
      onOrderChange([...pendingKeys, ...reordered]);
    },
    [sortableIds, orderKeys, onOrderChange],
  );

  /* ---- upload ---- */

  const handlePick = React.useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleFiles = React.useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const accepted: File[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error("Chỉ hỗ trợ tệp hình ảnh", { description: file.name });
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          toast.error("Tệp vượt quá 30 MB", { description: file.name });
          continue;
        }
        accepted.push(file);
      }

      // Track each file's generated ids so the keys we register in
      // `pendingUploads` (line 262) and the keys we push into
      // `orderKeys` (line 317) use the SAME localId. Generating them
      // separately would produce a pending tile that's registered in
      // state but never found by the tile builder (and vice versa).
      const newPendingKeys: string[] = [];
      for (const file of accepted) {
        const localId = `${file.name}-${file.size}-${file.lastModified}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;
        newPendingKeys.push(`${PENDING_PREFIX}${localId}`);
        const previewUrl = URL.createObjectURL(file);
        const pendingIdFull = `${PENDING_PREFIX}${localId}`;
        const pending: PendingUpload = {
          id: localId,
          file,
          previewUrl,
          status: "uploading",
          uploadedKey: null,
        };
        setPendingUploads((prev) => [pending, ...prev]);

        const controller = new AbortController();
        abortControllersRef.current.set(localId, controller);

        upload
          .mutateAsync({ id: productId, file, signal: controller.signal })
          .then((uploaded: UploadedImage) => {
            // Mark pending tile with its real key so we can promote it
            // to a "server" tile without a refetch.
            URL.revokeObjectURL(previewUrl);
            setPendingUploads((prev) => prev.filter((p) => p.id !== localId));
            abortControllersRef.current.delete(localId);
            // Remember the freshly uploaded URL so the tile builder
            // can render it from `uploadedUrls` until the form save
            // lands the key in the server-side images list.
            setUploadedUrls((prev) => {
              const next = new Map(prev);
              next.set(uploaded.object_key, uploaded.url);
              return next;
            });
            // Replace the pending key with the real key in the order.
            // Read the latest orderKeys from the ref so the closure
            // value (taken when `handleFiles` was called) doesn't
            // miss the pending key we just pushed into orderKeys.
            onOrderChange(
              orderKeysRef.current.map((k) =>
                k === pendingIdFull ? uploaded.object_key : k,
              ),
            );
          })
          .catch((error: unknown) => {
            if (
              axios.isCancel(error) ||
              (error as { name?: string })?.name === "CanceledError"
            ) {
              URL.revokeObjectURL(previewUrl);
              setPendingUploads((prev) => prev.filter((p) => p.id !== localId));
              abortControllersRef.current.delete(localId);
              onOrderChange(orderKeysRef.current.filter((k) => k !== pendingIdFull));
              return;
            }
            setPendingUploads((prev) =>
              prev.map((p) =>
                p.id === localId
                  ? { ...p, status: "failed" as const, errorMessage: (error as APIError).message ?? "Tải ảnh thất bại." }
                  : p,
              ),
            );
            abortControllersRef.current.delete(localId);
          });
      }

      // Prepend new pending keys to the order so the user sees them at the top.
      onOrderChange([...newPendingKeys, ...orderKeys]);

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [productId, upload, orderKeys, onOrderChange],
  );

  const handleCancelPending = React.useCallback(
    (id: string) => {
      // id is the full composite id `pending:<localId>`.
      const localId = id.slice(PENDING_PREFIX.length);
      abortControllersRef.current.get(localId)?.abort();
    },
    [],
  );

  const handleDismissFailed = React.useCallback(
    (id: string) => {
      const localId = id.slice(PENDING_PREFIX.length);
      const pending = pendingUploads.find((p) => p.id === localId);
      if (pending) URL.revokeObjectURL(pending.previewUrl);
      setPendingUploads((prev) => prev.filter((p) => p.id !== localId));
      onOrderChange(orderKeys.filter((k) => k !== id));
    },
    [pendingUploads, orderKeys, onOrderChange],
  );

  /* ---- delete (server tile) ---- */
  //
  // Deletion is staged locally only — the actual DELETE /products/:id/images/:imageId
  // call (or the implicit drop via `replaceImages`) happens on the
  // form's "Lưu thay đổi" button. We keep the tile visible with an
  // "Đã xoá" badge + undo button so the user can recover from
  // accidental clicks before saving. The parent form is expected to
  // exclude `stagedForDeletion` keys from the PUT `image_keys`
  // payload on save.

  const handleDelete = React.useCallback(
    (serverKey: string) => {
      if (disabled) return;
      const confirmed = window.confirm("Xoá ảnh này?");
      if (!confirmed) return;
      const next = new Set(stagedForDeletion);
      next.add(serverKey);
      onStagedDeletionChange(next);
    },
    [disabled, stagedForDeletion, onStagedDeletionChange],
  );

  const handleUndoDelete = React.useCallback(
    (serverKey: string) => {
      if (!stagedForDeletion.has(serverKey)) return;
      const next = new Set(stagedForDeletion);
      next.delete(serverKey);
      onStagedDeletionChange(next);
    },
    [stagedForDeletion, onStagedDeletionChange],
  );

  /* ---- render ----------------------------------------------------- */

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        {/* Hero image */}
        <div className="relative w-full shrink-0 overflow-hidden rounded-xl bg-surface-container-low sm:basis-[45%] sm:aspect-square">
          {heroTile ? (
            <Image
              src={resolveImageUrl(heroTile.image_url)}
              alt="Ảnh đại diện sản phẩm"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[13px] text-muted-foreground">
              Chưa có ảnh
            </div>
          )}
        </div>

        {/* Strip + upload */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] leading-[1.5] text-muted-foreground">
              {tiles.length > 0
                ? `${tiles.length} ảnh · Kéo để sắp xếp · Ảnh đầu tiên là đại diện`
                : "Chưa có ảnh"}
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
              onChange={(event) => {
                handleFiles(event.target.files);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-[12px]"
              onClick={handlePick}
              disabled={disabled}
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              Tải ảnh
            </Button>
          </div>

          {imagesQuery.isLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : imagesQuery.isError ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive"
            >
              {(imagesQuery.error as APIError).message}
            </p>
          ) : tiles.length === 0 ? (
            <p className="rounded-lg border border-hairline border-dashed bg-surface-container-low px-3 py-6 text-center text-[13px] text-muted-foreground">
              Bấm &quot;Tải ảnh&quot; để thêm ảnh đầu tiên.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
                <div
                  className="grid grid-cols-4 gap-2 overflow-y-auto"
                  style={{ maxHeight: "320px" }}
                >
                  {tiles.map((tile, index) => (
                    <SortableThumbnail
                      key={tile.id}
                      tile={tile}
                      index={index}
                      disabled={disabled}
                      isStagedForDeletion={
                        tile._tag === "server" &&
                        stagedForDeletion.has(tile.id)
                      }
                      onDelete={() => {
                        if (tile._tag === "server") handleDelete(tile.id);
                      }}
                      onUndoDelete={() => {
                        if (tile._tag === "server") handleUndoDelete(tile.id);
                      }}
                      onCancelPending={() => handleCancelPending(tile.id)}
                      onDismissFailed={() => handleDismissFailed(tile.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * SortableThumbnail — a single tile. Server tiles are draggable,
 * pending tiles are pinned to the front and non-draggable.
 * ------------------------------------------------------------------ */
interface SortableThumbnailProps {
  tile: Tile;
  index: number;
  isStagedForDeletion?: boolean;
  disabled?: boolean;
  onDelete: () => void;
  onUndoDelete: () => void;
  onCancelPending: () => void;
  onDismissFailed: () => void;
}

function SortableThumbnail({
  tile,
  index,
  isStagedForDeletion = false,
  disabled,
  onDelete,
  onUndoDelete,
  onCancelPending,
  onDismissFailed,
}: SortableThumbnailProps) {
  const isServer = tile._tag === "server";
  const sortable = useSortable({
    id: tile.id,
    disabled: !isServer,
  });

  const style: React.CSSProperties = isServer
    ? {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }
    : {};

  const isPendingUpload = tile._tag === "pending" && tile.status === "uploading";
  const isFailed = tile._tag === "pending" && tile.status === "failed";

  return (
    <div
      ref={isServer ? sortable.setNodeRef : undefined}
      style={style}
      className={cn(
        "group/snap relative aspect-square overflow-hidden rounded-xl border-2 bg-surface-container-low transition-colors duration-150",
        isServer && sortable.isDragging
          ? "z-10 border-primary opacity-80 shadow-lg ring-2 ring-primary/30"
          : "border-transparent",
        isFailed && "border-destructive/50",
        isStagedForDeletion && "border-destructive/40",
      )}
    >
      {tile.image_url ? (
        <Image
          src={resolveImageUrl(tile.image_url)}
          alt={isServer ? `Ảnh ${index + 1}` : `Đang tải ${index + 1}`}
          fill
          sizes="100px"
          className={cn(
            "object-cover",
            (isPendingUpload || isStagedForDeletion) && "opacity-40",
            isServer && !isPendingUpload && !isStagedForDeletion && "cursor-grab active:cursor-grabbing",
          )}
          unoptimized
          draggable={false}
          {...(isServer ? sortable.attributes : {})}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-surface-container-low text-[10px] uppercase tracking-wide text-muted-foreground"
          aria-hidden="true"
        >
          Sẽ xoá
        </div>
      )}

      {/* Primary badge — auto from position 0 */}
      {isServer && index === 0 && !isStagedForDeletion && (
        <span className="absolute left-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.05em] text-primary-foreground">
          Chính
        </span>
      )}

      {/* Staged-for-deletion badge */}
      {isStagedForDeletion && (
        <span className="absolute left-1 top-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.05em] text-destructive-foreground">
          Đã xoá
        </span>
      )}

      {/* Drag handle (server tiles only, not when staged for deletion) */}
      {isServer && !isStagedForDeletion && (
        <div
          {...sortable.listeners}
          className="absolute left-1 bottom-1 flex h-5 w-5 cursor-grab items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity duration-150 group-hover/snap:opacity-100 active:cursor-grabbing"
          aria-label="Kéo để sắp xếp"
          title="Kéo để sắp xếp"
        >
          <GripVertical className="h-3 w-3" aria-hidden="true" />
        </div>
      )}

      {/* Upload spinner overlay */}
      {isPendingUpload && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden="true" />
        </div>
      )}

      {/* Failed overlay */}
      {isFailed && (
        <div
          className="absolute inset-x-0 bottom-0 bg-destructive/90 px-1 py-0.5 text-[9px] font-medium leading-[1.4] text-destructive-foreground"
          role="alert"
        >
          {tile.errorMessage}
        </div>
      )}

      {/* Action buttons — only when not uploading */}
      {!isPendingUpload && (
        <div className="absolute right-1 top-1 flex gap-1">
          {isServer ? (
            isStagedForDeletion ? (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-5 w-5"
                onClick={onUndoDelete}
                aria-label={`Hoàn tác xoá ảnh ${index + 1}`}
                title="Hoàn tác"
              >
                <Undo2 className="h-3 w-3" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-5 w-5 opacity-0 transition-opacity duration-150 group-hover/snap:opacity-100"
                onClick={onDelete}
                disabled={disabled}
                aria-label={`Xoá ảnh ${index + 1}`}
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              </Button>
            )
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-5 w-5"
              onClick={isFailed ? onDismissFailed : onCancelPending}
              aria-label={isFailed ? "Đóng" : "Huỷ tải"}
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}