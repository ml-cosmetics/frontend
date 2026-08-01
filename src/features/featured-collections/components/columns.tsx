"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EntityActionMenu } from "@/components/common/crud";
import type { FeaturedCollection } from "@/types";
import { FeaturedCollectionImagePreview } from "./featured-collection-image-preview";

export type { FeaturedCollection };

export interface FeaturedCollectionActionsArgs {
  onEdit: (row: FeaturedCollection) => void;
  onDelete: (row: FeaturedCollection) => void;
}

/**
 * Column definitions for the admin featured-collection list.
 *
 * Columns: Preview | Title | Layout | Items | Sort order | Status | Actions.
 *
 * Status is driven by `is_active` — the admin flips it from the edit
 * form. The row action menu intentionally only exposes Edit + Delete
 * (matching the product admin UX) so we don't have to ship a separate
 * toggle mutation just for this entity.
 */
export function buildFeaturedCollectionColumns(
  args: FeaturedCollectionActionsArgs,
): ColumnDef<FeaturedCollection>[] {
  return [
    {
      id: "preview",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <FeaturedCollectionImagePreview
          imageUrl={row.original.image_url}
          alt={row.original.title}
        />
      ),
      size: 112,
    },
    {
      id: "title",
      header: "Tiêu đề",
      accessorKey: "title",
      cell: ({ row }) => (
        <div className="min-w-0 space-y-1">
          <p className="line-clamp-1 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary">
            {row.original.title}
          </p>
          {row.original.subtitle && (
            <p className="line-clamp-1 text-[13px] leading-snug text-muted-foreground">
              {row.original.subtitle}
            </p>
          )}
          <p className="text-[13px] leading-snug text-muted-foreground">
            /{row.original.slug}
          </p>
        </div>
      ),
      size: 320,
    },
    {
      id: "layout",
      header: "Bố cục",
      cell: ({ row }) => (
        <Badge variant="muted" className="px-3 py-1 text-[13px]">
          {row.original.layout === "bento" ? "Bento" : "Lưới"}
        </Badge>
      ),
      size: 110,
    },
    {
      id: "items",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <span className="text-[15px] font-medium tabular-nums text-foreground">
          {row.original.items.length}
        </span>
      ),
      size: 100,
    },
    {
      id: "sort",
      header: "Thứ tự",
      cell: ({ row }) => (
        <span className="text-[15px] font-medium tabular-nums text-foreground">
          {row.original.sort_order}
        </span>
      ),
      size: 90,
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => <ActiveBadge isActive={row.original.is_active} />,
      size: 160,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <EntityActionMenu
          row={row}
          triggerLabel="Mở menu hành động bộ sưu tập"
          actions={[
            {
              label: "Chỉnh sửa",
              icon: Pencil,
              onSelect: args.onEdit,
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
      size: 64,
    },
  ];
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant={isActive ? "primary" : "muted"}
      className="px-3 py-1 text-[13px]"
    >
      {isActive ? "Đang hiển thị" : "Đã ẩn"}
    </Badge>
  );
}