"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Table as TanStackTable } from "@tanstack/react-table";
import { Loader2, Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CrudFilterBar,
  CrudListShell,
  CrudStatusFilter,
  DeleteEntityDialog,
  EmptyState,
  Pagination,
  useDebouncedValue,
} from "@/components/common";
import type { APIError } from "@/lib/api";
import { ProductStatus } from "@/types";
import {
  buildProductColumns,
  type ProductListRow,
} from "./columns";
import { StatusBadge } from "./status-badge";
import { useProductListUrlState } from "../hooks/use-product-list-url-state";
import { useDeleteProduct } from "../hooks/use-delete-product";
import { useProductList } from "../hooks/use-product-list";

/**
 * `ProductListTable` — list view + filters + delete dialog.
 *
 * Refactored to consume the shared CRUD primitives (`CrudFilterBar`,
 * `CrudListShell`, `CrudStatusFilter`, `DeleteEntityDialog`,
 * `useDebouncedValue`, `EntityActionMenu` via columns).
 */
export interface ProductListTableProps {
  newHref?: string;
}

export function ProductListTable({
  newHref = "/admin/products/new",
}: ProductListTableProps) {
  const router = useRouter();
  const { state, update, queryParams } = useProductListUrlState();
  const page = state.page;
  const status = state.status;

  const listQuery = useProductList(queryParams);

  const [searchInput, setSearchInput] = useDebouncedValue<string>({
    defaultValue: state.search,
    delay: 350,
    onCommit: (next) => {
      if (next !== state.search) {
        update({ search: next, page: 1 });
      }
    },
  });

  const columns = React.useMemo(
    () =>
      buildProductColumns({
        onEdit: (row) => router.push(`/admin/products/${row.id}/edit`),
        onDelete: (row) => setPendingDelete(row),
      }),
    [router],
  );

  const table: TanStackTable<ProductListRow> = useReactTable({
    data: listQuery.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    pageCount: listQuery.data?.pagination.total_pages ?? 0,
    state: {
      pagination: { pageIndex: page - 1, pageSize: state.per_page },
    },
  });

  const deleteProduct = useDeleteProduct();
  const [pendingDelete, setPendingDelete] = React.useState<ProductListRow | null>(null);
  const [deleteError, setDeleteError] = React.useState<APIError | null>(null);

  const confirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deleteProduct.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
      setDeleteError(null);
      const currentPageItems = listQuery.data?.items.length ?? 0;
      if (currentPageItems <= 1 && page > 1) {
        update({ page: page - 1 });
      }
    } catch (error) {
      setDeleteError(error as APIError);
      toast.error("Không thể xoá sản phẩm", {
        description: (error as APIError).message,
      });
    }
  }, [
    pendingDelete,
    deleteProduct,
    listQuery.data?.items.length,
    page,
    update,
  ]);

  const rows = table.getRowModel().rows;
  const pagination = listQuery.data?.pagination;

  return (
    <div className="text-foreground flex flex-col gap-4 text-[14px] leading-[1.6]">
      <CrudFilterBar
        filters={
          <>
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo tên hoặc slug…"
              className="max-w-xs text-[14px] leading-[1.6]"
              aria-label="Tìm sản phẩm"
            />
            <CrudStatusFilter<ProductStatus>
              value={status}
              onChange={(next) => update({ status: next, page: 1 })}
              options={[
                { value: undefined, label: "Tất cả trạng thái" },
                {
                  value: ProductStatus.Active,
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <StatusBadge status={ProductStatus.Active} />
                      Đang bán
                    </span>
                  ),
                },
                {
                  value: ProductStatus.Draft,
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <StatusBadge status={ProductStatus.Draft} />
                      Bản nháp
                    </span>
                  ),
                },
                {
                  value: ProductStatus.Archived,
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <StatusBadge status={ProductStatus.Archived} />
                      Đã ẩn
                    </span>
                  ),
                },
              ]}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => listQuery.refetch()}
              disabled={listQuery.isFetching}
              aria-label="Tải lại"
            >
              {listQuery.isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                "Tải lại"
              )}
            </Button>
          </>
        }
        actions={
          <Button asChild>
            <a href={newHref}>
              <Plus className="h-4 w-4" />
              <span>Thêm sản phẩm</span>
            </a>
          </Button>
        }
      />

      <CrudListShell
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        error={listQuery.error}
        onRetry={() => listQuery.refetch()}
        emptyState={
          rows.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Chưa có sản phẩm nào"
              description={
                state.search || status
                  ? "Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại."
                  : "Tạo sản phẩm đầu tiên để hiển thị trong cửa hàng."
              }
              action={
                <Button asChild>
                  <a href={newHref}>
                    <Plus className="h-4 w-4" />
                    <span>Thêm sản phẩm</span>
                  </a>
                </Button>
              }
            />
          ) : undefined
        }
      >
        <div className="overflow-x-auto rounded-xl border border-hairline bg-card">
          <UITable className="text-[14px] leading-[1.6]" aria-label="Danh sách sản phẩm">
            <TableHeader className="border-hairline bg-surface-container-low">
              {table.getHeaderGroups().map((group) => (
                <TableRow className="border-hairline" key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      scope="col"
                      className="text-[12px] font-semibold uppercase leading-[1.4] tracking-[0.05em] text-muted-foreground"
                      style={{ width: header.getSize() || undefined }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length === 0 && !listQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-[14px] leading-[1.6] text-muted-foreground"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    className="border-hairline"
                    key={row.original.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-4 text-[14px] leading-[1.6] text-foreground"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </UITable>
        </div>
      </CrudListShell>

      {pagination && (
        <Pagination
          variant="admin"
          pagination={pagination}
          onPageChange={(next) => update({ page: next })}
        />
      )}

      <DeleteEntityDialog
        open={pendingDelete !== null}
        title="Xoá sản phẩm này?"
        entityName={pendingDelete?.name}
        submitting={deleteProduct.isPending}
        error={deleteError}
        onCancel={() => {
          setPendingDelete(null);
          setDeleteError(null);
        }}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </div>
  );
}

// `ProductListRow` lives in `./columns`; re-exported here so other
// Product consumers (forms, galleries) can import it from this file.
export type { ProductListRow };
