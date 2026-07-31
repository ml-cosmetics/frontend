"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  ExternalLink,
  ImageOff,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Banner } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDate, resolveImageUrl } from "@/lib/utils";
import { DateRangeText } from "@/components/common/crud/date-range-text";
import {
  getBannerStatus,
  type BannerLifecycle,
} from "../utils/banner-status";

/**
 * Single banner card used by the grid view in `/admin/banners`.
 *
 * Layout (top → bottom):
 *   1. 16:9 hero preview — the actual banner artwork, mirroring the
 *      storefront ratio so the operator sees the asset exactly as
 *      shoppers will.
 *   2. Meta footer — title + subtitle + position + status badge +
 *      quick actions (active switch, more-menu).
 *
 * The card itself is *not* a link — the hero is a link to the
 * edit page so the artwork is the primary affordance, but the
 * switch and dropdown must still be independently clickable.
 */

const STATUS_BADGE_VARIANT: Record<BannerLifecycle, React.ComponentProps<typeof Badge>["variant"]> = {
  active: "success",
  scheduled: "info",
  expired: "muted",
  inactive: "warning",
};

export interface BannerCardProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onToggleActive: (banner: Banner, nextActive: boolean) => void;
  /** Disable interactions while a mutation is in flight. */
  pending?: boolean;
}

export function BannerCard({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
  pending = false,
}: BannerCardProps) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const status = getBannerStatus(banner);
  const canToggle =
    status.lifecycle !== "expired" && status.lifecycle !== "scheduled";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-hairline bg-card text-card-foreground",
        "transition-shadow hover:aura-shadow-sm",
      )}
    >
      <BannerHero
        banner={banner}
        imageFailed={imageFailed}
        onImageError={() => setImageFailed(true)}
        lifecycle={status.lifecycle}
        statusLabel={status.label}
      />

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-foreground">
              {banner.title}
            </h3>
            {banner.subtitle ? (
              <p className="mt-0.5 line-clamp-1 text-[13px] leading-snug text-muted-foreground">
                {banner.subtitle}
              </p>
            ) : null}
          </div>
          <BannerActionsMenu
            banner={banner}
            pending={pending}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Badge variant={STATUS_BADGE_VARIANT[status.lifecycle]}>
            {status.label}
          </Badge>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground/70">
              #{banner.position}
            </span>
            {banner.link ? (
              <Link
                href={banner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 truncate text-primary hover:underline"
                title={banner.link}
              >
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                <span className="truncate">Mở link</span>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-hairline pt-3">
          <div className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            <DateRangeText
              starts_at={banner.starts_at}
              ends_at={banner.ends_at}
            />
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="text-[12px] font-medium text-muted-foreground">
              {banner.is_active ? "Đang bật" : "Đang tắt"}
            </span>
            <Switch
              checked={banner.is_active}
              disabled={pending || !canToggle}
              onCheckedChange={(next) => onToggleActive(banner, next)}
              aria-label={`Bật/tắt banner ${banner.title}`}
            />
          </div>
        </div>

        {status.lifecycle === "scheduled" && banner.starts_at ? (
          <p className="text-[12px] leading-snug text-muted-foreground">
            Sẽ bật tự động vào {formatDate(banner.starts_at)}.
          </p>
        ) : null}
        {status.lifecycle === "expired" && banner.ends_at ? (
          <p className="text-[12px] leading-snug text-muted-foreground">
            Đã tắt từ {formatDate(banner.ends_at)}.
          </p>
        ) : null}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

interface BannerHeroProps {
  banner: Banner;
  imageFailed: boolean;
  onImageError: () => void;
  lifecycle: BannerLifecycle;
  statusLabel: string;
}

function BannerHero({
  banner,
  imageFailed,
  onImageError,
  lifecycle,
  statusLabel,
}: BannerHeroProps) {
  const src =
    banner.image_url && !imageFailed ? resolveImageUrl(banner.image_url) : null;
  const overlay =
    lifecycle === "expired" || lifecycle === "inactive";

  return (
    <Link
      href={`/admin/banners/${banner.id}/edit`}
      aria-label={`Chỉnh sửa banner ${banner.title}`}
      className="relative block aspect-video w-full overflow-hidden bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {src ? (
        <Image
          src={src}
          alt={banner.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className={cn(
            "object-cover transition-opacity duration-200",
            overlay ? "opacity-60" : "group-hover:scale-[1.02]",
          )}
          unoptimized
          onError={onImageError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
            <span className="text-[12px]">Không có hình ảnh</span>
          </div>
        </div>
      )}

      <span
        className={cn(
          "pointer-events-none absolute left-3 top-3 inline-flex items-center rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur",
          overlay && "opacity-90",
        )}
      >
        #{banner.position} · {statusLabel}
      </span>

      {overlay ? (
        <span className="pointer-events-none absolute inset-0 bg-foreground/10" aria-hidden="true" />
      ) : null}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * Action menu
 * ------------------------------------------------------------------ */

interface BannerActionsMenuProps {
  banner: Banner;
  pending: boolean;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
}

function BannerActionsMenu({ banner, pending, onEdit, onDelete }: BannerActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`Mở menu hành động cho banner ${banner.title}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onEdit(banner);
          }}
          disabled={pending}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          <span>Chỉnh sửa</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onDelete(banner);
          }}
          disabled={pending}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span>Xoá</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
