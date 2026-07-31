"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { ActiveBadge, type CategoryListRow } from "./active-badge";

/**
 * Build the memoized column definitions for the categories table.
 * Columns: Name | Slug | Active | Created | Actions.
 */
export interface BuildCategoryColumnsArgs {
  onEdit: (row: CategoryListRow) => void;
  onDelete: (row: CategoryListRow) => void;
}

function ActionsCell({
  row,
  onEdit,
  onDelete,
}: {
  row: Row<CategoryListRow>;
  onEdit: (row: CategoryListRow) => void;
  onDelete: (row: CategoryListRow) => void;
}) {
  const category = row.original;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Mở menu hành động"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => onEdit(category)}>
          <Pencil className="h-4 w-4" />
          <span>Chỉnh sửa</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => onDelete(category)}
        >
          <span>Xoá</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function buildCategoryColumns(
  args: BuildCategoryColumnsArgs,
): ColumnDef<CategoryListRow>[] {
  return [
    {
      id: "name",
      header: "Tên danh mục",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="min-w-0 space-y-0.5">
          <p className="text-[14px] font-medium text-foreground">
            {row.original.name}
          </p>
          <p className="text-xs text-muted-foreground">
            /{row.original.slug}
          </p>
        </div>
      ),
      size: 280,
    },
    {
      id: "slug",
      header: "Slug",
      accessorKey: "slug",
      cell: ({ row }) => (
        <span className="text-[14px] text-muted-foreground">
          /{row.original.slug}
        </span>
      ),
      size: 200,
    },
    {
      id: "is_active",
      header: "Trạng thái",
      accessorKey: "is_active",
      cell: ({ row }) => (
        <ActiveBadge isActive={row.original.is_active} />
      ),
      size: 120,
    },
    {
      id: "created_at",
      header: "Ngày tạo",
      accessorKey: "created_at",
      cell: ({ row }) => (
        <span className="text-[14px] text-muted-foreground">
          {formatDate(row.original.created_at)}
        </span>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <ActionsCell row={row} onEdit={args.onEdit} onDelete={args.onDelete} />
      ),
      size: 56,
    },
  ];
}

export type { CategoryListRow };
