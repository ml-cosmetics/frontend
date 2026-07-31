"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { EntityActionMenu } from "@/components/common/crud";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/date";
import { formatVND } from "@/lib/utils/money";
import {
  getCategoryChipClass,
  getCategoryLabel,
  getStatusChipClass,
  getStatusLabel,
} from "../utils/labels";
import type { Cost } from "@/types";

export type { Cost };

export interface CostActionsArgs {
  onEdit: (row: Cost) => void;
  onDelete: (row: Cost) => void;
}

/**
 * Column definitions for the costs table.
 *
 *   ID | Ngày | Danh mục | Mô tả | Nhà cung cấp | Số tiền | Trạng thái | Actions
 */
export function buildCostColumns(
  args: CostActionsArgs,
): ColumnDef<Cost>[] {
  return [
    {
      id: "code",
      header: "ID",
      accessorKey: "code",
      cell: ({ row }) => (
        <span className="font-mono text-[13px] tabular-nums text-muted-foreground">
          {row.original.code}
        </span>
      ),
      size: 120,
    },
    {
      id: "date",
      header: "Ngày",
      accessorKey: "occurred_on",
      cell: ({ row }) => (
        <span className="text-[13px] text-foreground">
          {formatDate(row.original.occurred_on)}
        </span>
      ),
      size: 110,
    },
    {
      id: "category",
      header: "Danh mục",
      accessorKey: "category",
      cell: ({ row }) => (
        <span
          className={cn(
            "rounded border px-2 py-0.5 text-[11px] font-medium",
            getCategoryChipClass(row.original.category),
          )}
        >
          {getCategoryLabel(row.original.category)}
        </span>
      ),
      size: 130,
    },
    {
      id: "description",
      header: "Mô tả",
      accessorKey: "description",
      cell: ({ row }) => (
        <span
          className="line-clamp-1 max-w-[260px] text-[13px] text-foreground"
          title={row.original.description}
        >
          {row.original.description}
        </span>
      ),
      size: 260,
    },
    {
      id: "vendor",
      header: "Nhà cung cấp",
      accessorKey: "vendor",
      cell: ({ row }) => (
        <span className="text-[13px] text-foreground">
          {row.original.vendor}
        </span>
      ),
      size: 160,
    },
    {
      id: "amount",
      header: "Số tiền",
      cell: ({ row }) => (
        <span className="block text-right font-mono text-[13px] tabular-nums text-foreground">
          {formatVND(row.original.amount)}
        </span>
      ),
      size: 130,
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] font-medium",
            getStatusChipClass(row.original.status),
          )}
        >
          {getStatusLabel(row.original.status)}
        </span>
      ),
      size: 130,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <EntityActionMenu<Cost>
            row={{ original: row.original, id: row.id } as never}
            triggerLabel="Mở menu hành động chi phí"
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
        </div>
      ),
      size: 56,
    },
  ];
}