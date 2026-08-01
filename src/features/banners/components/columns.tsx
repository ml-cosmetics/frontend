"use client";

import * as React from "react";
import { Pencil, Eye, EyeOff, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  EntityActionMenu,
  DateRangeText,
} from "@/components/common/crud";
import type { Banner } from "@/types";
import { BannerImagePreview } from "./banner-image-preview";

export type { Banner };

export interface BannerActionsArgs {
  onEdit: (row: Banner) => void;
  onDelete: (row: Banner) => void;
  onToggle: (row: Banner) => void;
}

/**
 * Build memoized column definitions for the banner list table.
 * Columns: Preview Image | Title | Position | Display Period | Status | Actions
 */
export function buildBannerColumns(
  args: BannerActionsArgs,
): ColumnDef<Banner>[] {
  return [
    {
      id: "preview",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <BannerImagePreview
          imageUrl={row.original.image_url}
          alt={row.original.title}
          width={80}
        />
      ),
      size: 80,
    },
    {
      id: "title",
      header: "Tiêu đề",
      accessorKey: "title",
      cell: ({ row }) => (
        <div className="min-w-0 space-y-0.5">
          <p className="line-clamp-1 text-[14px] font-medium text-foreground">
            {row.original.title}
          </p>
          {row.original.subtitle && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {row.original.subtitle}
            </p>
          )}
        </div>
      ),
      size: 280,
    },
    {
      id: "position",
      header: "Vị trí",
      accessorKey: "position",
      cell: ({ row }) => (
        <span className="text-[14px] tabular-nums text-muted-foreground">
          {row.original.position}
        </span>
      ),
      size: 80,
    },
    {
      id: "period",
      header: "Thời gian hiển thị",
      cell: ({ row }) => (
        <DateRangeText
          starts_at={row.original.starts_at}
          ends_at={row.original.ends_at}
          className="text-[14px] text-muted-foreground"
        />
      ),
      size: 180,
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => <ActiveBadge isActive={row.original.is_active} />,
      size: 120,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <EntityActionMenu
          row={row}
          triggerLabel="Mở menu hành động banner"
          actions={[
            {
              label: "Chỉnh sửa",
              icon: Pencil,
              onSelect: args.onEdit,
            },
            {
              label: row.original.is_active ? "Vô hiệu hoá" : "Kích hoạt",
              icon: row.original.is_active ? EyeOff : Eye,
              onSelect: args.onToggle,
            },
            {
              label: "Xoá",
              icon: Trash2,
              onSelect: args.onDelete,
              variant: "destructive",
            },
          ]}
        />
      ),
      size: 56,
    },
  ];
}

/* ------------------------------------------------------------------ *
 * Cells
 * ------------------------------------------------------------------ */

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "primary" : "muted"}>
      {isActive ? "Đang hoạt động" : "Đã vô hiệu"}
    </Badge>
  );
}
