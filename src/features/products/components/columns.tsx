"use client";

import * as React from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate, formatVND, resolveImageUrl } from "@/lib/utils";
import { EntityActionMenu } from "@/components/common/crud";
import type { ProductListItem } from "@/types";
import { StatusBadge } from "./status-badge";
import { ProductCategoryChip } from "./category-chip";

/**
 * Row shape exposed to the table. We keep the underlying
 * `ProductListItem` so rows stay strictly typed end-to-end.
 */
export type ProductListRow = ProductListItem;

export interface ProductRowActionsArgs {
  onEdit: (row: ProductListRow) => void;
  onDelete: (row: ProductListRow) => void;
}

export type BuildProductColumnsArgs = ProductRowActionsArgs;

/**
 * Build the memoized column definitions for the products table.
 * Columns: thumbnail | name | category | price | compare_at | status | created_at | actions
 */
export function buildProductColumns(
  args: BuildProductColumnsArgs,
): ColumnDef<ProductListRow>[] {
  return [
    {
      id: "thumbnail",
      header: "Hình ảnh",
      enableSorting: false,
      cell: ({ row }) => <ThumbnailCell product={row.original} />,
      size: 80,
    },
    {
      id: "name",
      header: "Sản phẩm",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="min-w-0 space-y-1">
          <p className="line-clamp-1 text-[14px] font-medium leading-[1.6] text-foreground">
            {row.original.name}
          </p>
          <p className="line-clamp-1 text-[12px] font-medium leading-[1.4] text-muted-foreground">
            /{row.original.slug}
          </p>
        </div>
      ),
      size: 280,
    },
    {
      id: "category",
      header: "Danh mục",
      accessorFn: (row) => row.category?.name ?? "",
      cell: ({ row }) => (
        <ProductCategoryChip name={row.original.category?.name} />
      ),
      size: 160,
    },
    {
      id: "price",
      header: "Giá bán",
      accessorKey: "price",
      cell: ({ row }) => (
        <span className="text-[14px] font-semibold leading-[1.6] text-primary">
          {formatVND(row.original.price)}
        </span>
      ),
      size: 140,
    },
    {
      id: "compare_at",
      header: "Giá so sánh",
      accessorKey: "compare_at",
      cell: ({ row }) => {
        const compare = row.original.compare_at;
        if (compare === null || compare === undefined || compare <= 0) {
          return <span className="text-[14px] leading-[1.6] text-muted-foreground">—</span>;
        }
        return (
          <span className="text-[14px] leading-[1.6] text-muted-foreground line-through">
            {formatVND(compare)}
          </span>
        );
      },
      size: 140,
    },
    {
      id: "status",
      header: "Trạng thái",
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 120,
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
          triggerLabel="Mở menu hành động sản phẩm"
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

/* ------------------------------------------------------------------ *
 * Cells
 * ------------------------------------------------------------------ */

function ThumbnailCell({ product }: { product: ProductListRow }) {
  const [failed, setFailed] = React.useState(false);
  const showImage = Boolean(product.thumbnail_url) && !failed;
  return (
      <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-hairline bg-surface-container-low">
      {showImage ? (
        <Image
          src={resolveImageUrl(product.thumbnail_url!)}
          alt={product.name}
          fill
          sizes="48px"
          className="object-cover"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">
          Không có ảnh
        </span>
      )}
    </div>
  );
}
