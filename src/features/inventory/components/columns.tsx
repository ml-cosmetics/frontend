"use client";

import * as React from "react";
import Image from "next/image";
import { Settings2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/utils";
import {
  EntityActionMenu,
  StockBadge,
} from "@/components/common/crud";
import type { InventoryRow } from "../types/inventory-row";

export type { InventoryRow };

export interface InventoryActionsArgs {
  onAdjust: (row: InventoryRow) => void;
}

/**
 * Build the memoized column definitions for the inventory table.
 *
 * The backend `GET /v1/inventories` returns each row with an enriched
 * `product` object containing name, thumbnail, price, and category,
 * so we access data via `row.original.product.*`.
 *
 * Each non-action cell renders an "open adjust" button inside its
 * container — clicking the product image, name, slug, category,
 * quantity, or status opens the same adjustment dialog that the
 * kebab menu opens. The kebab action button itself stops propagation
 * so it never double-fires.
 */
export function buildInventoryColumns(
  args: InventoryActionsArgs,
): ColumnDef<InventoryRow>[] {
  return [
    {
      id: "thumbnail",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <ClickableCell
          row={row.original}
          args={args}
          ariaLabel="Mở cập nhật số lượng tồn kho"
        >
          <ThumbnailCell
            name={row.original.product?.name}
            thumbnail={row.original.product?.thumbnail_url}
          />
        </ClickableCell>
      ),
      size: 72,
    },
    {
      id: "product",
      header: "Sản phẩm",
      accessorKey: "product.name",
      cell: ({ row }) => (
        <ClickableCell
          row={row.original}
          args={args}
          ariaLabel="Mở cập nhật số lượng tồn kho"
        >
          <div className="min-w-0 space-y-0.5">
            <p className="line-clamp-1 text-[14px] font-medium text-foreground">
              {row.original.product?.name ?? row.original.product_id}
            </p>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              /{row.original.product?.slug ?? "—"}
            </p>
          </div>
        </ClickableCell>
      ),
      size: 280,
    },
    {
      id: "category",
      header: "Danh mục",
      accessorKey: "product.category.name",
      cell: ({ row }) => (
        <ClickableCell
          row={row.original}
          args={args}
          ariaLabel="Mở cập nhật số lượng tồn kho"
        >
          <span className="text-[14px] text-muted-foreground">
            {row.original.product?.category?.name ?? "—"}
          </span>
        </ClickableCell>
      ),
      size: 140,
    },
    {
      id: "quantity",
      header: "Tồn hiện tại",
      accessorKey: "quantity",
      cell: ({ row }) => (
        <ClickableCell
          row={row.original}
          args={args}
          ariaLabel="Mở cập nhật số lượng tồn kho"
        >
          <span className="text-[14px] font-semibold tabular-nums">
            {row.original.quantity.toLocaleString("vi-VN")}
          </span>
        </ClickableCell>
      ),
      size: 120,
    },
    {
      id: "stock_status",
      header: "Trạng thái",
      accessorKey: "quantity",
      cell: ({ row }) => (
        <ClickableCell
          row={row.original}
          args={args}
          ariaLabel="Mở cập nhật số lượng tồn kho"
        >
          <StockBadge quantity={row.original.quantity} />
        </ClickableCell>
      ),
      size: 130,
    },
    {
      id: "updated_at",
      header: "Cập nhật lần cuối",
      accessorKey: "updated_at",
      cell: ({ row }) => (
        <ClickableCell
          row={row.original}
          args={args}
          ariaLabel="Mở cập nhật số lượng tồn kho"
        >
          <span className="text-[14px] text-muted-foreground">
            {formatDate(row.original.updated_at)}
          </span>
        </ClickableCell>
      ),
      size: 130,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <EntityActionMenu
          row={row}
          triggerLabel="Mở menu hành động tồn kho"
          actions={[
            {
              label: "Cập nhật số lượng",
              icon: Settings2,
              onSelect: args.onAdjust,
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

function ClickableCell({
  row,
  args,
  children,
  ariaLabel,
}: {
  row: InventoryRow;
  args: InventoryActionsArgs;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={() => args.onAdjust(row)}
      aria-label={ariaLabel}
      className="-mx-2 block w-[calc(100%+1rem)] cursor-pointer rounded-md px-2 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      {children}
    </button>
  );
}

function ThumbnailCell({
  name,
  thumbnail,
}: {
  name?: string;
  thumbnail?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const showImage = Boolean(thumbnail) && !failed;
  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-hairline bg-surface-container-low">
      {showImage ? (
        <Image
          src={thumbnail!}
          alt={name ?? "Sản phẩm"}
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
