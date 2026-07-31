"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/utils";
import { EntityActionMenu } from "@/components/common/crud";
import type { Customer } from "@/types";

export type CustomerListRow = Customer;

export interface CustomerRowActionsArgs {
  onEdit: (row: CustomerListRow) => void;
  onDelete: (row: CustomerListRow) => void;
}

export type BuildCustomerColumnsArgs = CustomerRowActionsArgs;

/**
 * Build the memoized column definitions for the customers table.
 * Columns: name | phone | order_count | total_spent | last_order_at | created_at | actions
 */
export function buildCustomerColumns(
  args: BuildCustomerColumnsArgs,
): ColumnDef<CustomerListRow>[] {
  return [
    {
      id: "name",
      header: "Tên",
      accessorKey: "full_name",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-[14px] leading-[1.6] font-medium text-foreground">{row.original.full_name}</p>
          {row.original.email && (
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          )}
        </div>
      ),
      size: 240,
    },
    {
      id: "phone",
      header: "Số điện thoại",
      accessorKey: "phone",
      cell: ({ row }) => (
        <span className="text-[14px] leading-[1.6] text-foreground">{row.original.phone || "—"}</span>
      ),
      size: 140,
    },
    {
      id: "created_at",
      header: "Ngày tạo",
      accessorKey: "created_at",
      cell: ({ row }) => (
        <span className="text-[14px] leading-[1.6] text-muted-foreground">
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
        <EntityActionMenu
          row={row}
          triggerLabel="Mở menu hành động khách hàng"
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
      size: 56,
    },
  ];
}
