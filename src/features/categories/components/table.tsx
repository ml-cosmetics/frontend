"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Table as TanStackTable } from "@tanstack/react-table";
import { FolderTree, Plus } from "lucide-react";
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
import { buildCategoryColumns, type CategoryListRow } from "./columns";
import { useCategoryListUrlState } from "../hooks/use-category-list-url-state";
import { useDeleteCategory } from "../hooks/use-delete-category";
import { useCategoryList } from "../hooks/use-category-list";

/**
 * `CategoryListTable` — full list view for category management.
 * Uses the shared CRUD primitives (`CrudFilterBar`, `CrudListShell`,
 * `DeleteEntityDialog`, `useDebouncedValue`).
 */
export interface CategoryListTableProps {
  newHref?: string;
}

export function CategoryListTable({
  newHref = "/admin/categories/new",
}: CategoryListTableProps) {
  const router = useRouter();
  const { state, update, queryParams } = useCategoryListUrlState();
  const page = state.page;

  const listQuery = useCategoryList(queryParams);

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
      buildCategoryColumns({
        onEdit: (row) => router.push(`/admin/categories/${row.id}/edit`),
        onDelete: (row) => setPendingDelete(row),
      }),
    [router],
  );

  const table: TanStackTable<CategoryListRow> = useReactTable({
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

  const deleteCategory = useDeleteCategory();
  const [pendingDelete, setPendingDelete] = React.useState<CategoryListRow | null>(null);
  const [deleteError, setDeleteError] = React.useState<APIError | null>(null);

  const confirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deleteCategory.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
      setDeleteError(null);
      const currentPageItems = listQuery.data?.items.length ?? 0;
      if (currentPageItems <= 1 && page > 1) {
        update({ page: page - 1 });
      }
    } catch (error) {
      setDeleteError(error as APIError);
    }
  }, [
    pendingDelete,
    deleteCategory,
    listQuery.data?.items.length,
    page,
    update,
  ]);

  const rows = table.getRowModel().rows;
  const pagination = listQuery.data?.pagination;

  return (
    <div className="flex flex-col gap-4">
      <CrudFilterBar
        filters={
          <>
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo tên…"
              className="max-w-xs"
              aria-label="Tìm danh mục"
            />
            <CrudStatusFilter<boolean>
              value={state.active}
              onChange={(next) => update({ active: next, page: 1 })}
              options={[
                { value: undefined, label: "Tất cả" },
                { value: true, label: "Hiển thị" },
                { value: false, label: "Ẩn" },
              ]}
            />
          </>
        }
        actions={
          <Button asChild>
            <a href={newHref}>
              <Plus className="h-4 w-4" />
              <span>Thêm danh mục</span>
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
              icon={FolderTree}
              title="Chưa có danh mục nào"
              description={
                state.search || state.active !== undefined
                  ? "Không tìm thấy danh mục phù hợp với bộ lọc hiện tại."
                  : "Tạo danh mục đầu tiên để sắp xếp sản phẩm."
              }
              action={
                <Button asChild>
                  <a href={newHref}>
                    <Plus className="h-4 w-4" />
                    <span>Thêm danh mục</span>
                  </a>
                </Button>
              }
            />
          ) : undefined
        }
      >
        <div className="overflow-x-auto rounded-xl border border-hairline bg-card">
          <UITable>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
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
              {rows.map((row) => (
                <TableRow
                  key={row.original.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </UITable>
        </div>
      </CrudListShell>

      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={(next) => update({ page: next })}
        />
      )}

      <DeleteEntityDialog
        open={pendingDelete !== null}
        title="Xoá danh mục này?"
        entityName={pendingDelete?.name}
        submitting={deleteCategory.isPending}
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

export type { CategoryListRow } from "./active-badge";
