"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { Table as TanStackTable } from "@tanstack/react-table";
import { Loader2, Plus, Users } from "lucide-react";
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
  DeleteEntityDialog,
  useDebouncedValue,
} from "@/components/common/crud";
import { EmptyState, Pagination } from "@/components/common";
import type { APIError } from "@/lib/api";
import { buildCustomerColumns, type CustomerListRow } from "./columns";
import { useCustomerListUrlState } from "../hooks/use-customer-list-url-state";
import { useDeleteCustomer } from "../hooks/use-delete-customer";
import { useCustomerList } from "../hooks/use-customer-list";

/**
 * `CustomerListTable` — list view + filters + delete dialog.
 *
 * Refactored to consume the shared CRUD primitives (`CrudFilterBar`,
 * `CrudListShell`, `DeleteEntityDialog`, `useDebouncedValue`,
 * `EntityActionMenu` via columns).
 */
export function CustomerListTable() {
  const router = useRouter();
  const { state, update, queryParams } = useCustomerListUrlState();

  const listQuery = useCustomerList(queryParams);

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
      buildCustomerColumns({
        onEdit: (row) => router.push(`/admin/customers/${row.id}/edit`),
        onDelete: (row) => setPendingDelete(row),
      }),
    [router],
  );

  const table: TanStackTable<CustomerListRow> = useReactTable({
    data: listQuery.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    pageCount: listQuery.data?.pagination.total_pages ?? 0,
    state: {
      pagination: { pageIndex: state.page - 1, pageSize: state.per_page },
    },
  });

  const deleteCustomer = useDeleteCustomer();
  const [pendingDelete, setPendingDelete] = React.useState<CustomerListRow | null>(null);
  const [deleteError, setDeleteError] = React.useState<APIError | null>(null);

  const confirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deleteCustomer.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
      setDeleteError(null);
      const currentPageItems = listQuery.data?.items.length ?? 0;
      if (currentPageItems <= 1 && state.page > 1) {
        update({ page: state.page - 1 });
      }
    } catch (error) {
      setDeleteError(error as APIError);
      toast.error("Không thể xoá khách hàng", {
        description: (error as APIError).message,
      });
    }
  }, [pendingDelete, deleteCustomer, listQuery.data?.items.length, state.page, update]);

  const rows = table.getRowModel().rows;
  const pagination = listQuery.data?.pagination;

  return (
    <div className="text-foreground flex flex-col gap-4 text-[14px] leading-[1.6]">
      <CrudFilterBar
        className="border-hairline bg-card rounded-xl p-4"
        filters={
          <>
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo tên, email…"
              className="border-hairline bg-card text-foreground placeholder:text-muted-foreground max-w-xs rounded-lg text-[14px] leading-[1.6]"
              aria-label="Tìm khách hàng"
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
            <Link href="/admin/customers/new">
              <Plus className="h-4 w-4" />
              <span>Thêm khách hàng</span>
            </Link>
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
              className="rounded-xl border-hairline border-dashed bg-card py-16"
              icon={Users}
              title="Chưa có khách hàng nào"
              description={
                state.search ? "Không tìm thấy khách hàng phù hợp." : "Thêm khách hàng đầu tiên."
              }
              action={
                <Button asChild>
                  <Link href="/admin/customers/new">
                    <Plus className="h-4 w-4" />
                    <span>Thêm khách hàng</span>
                  </Link>
                </Button>
              }
            />
          ) : undefined
        }
      >
        <div className="border-hairline bg-card overflow-x-auto rounded-xl border-[1px]">
          <UITable className="text-foreground text-[14px]" aria-label="Danh sách khách hàng">
            <TableHeader className="border-hairline bg-surface-container-low">
              {table.getHeaderGroups().map((group) => (
                <TableRow className="border-hairline" key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead
                      className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
                      key={header.id}
                      scope="col"
                      style={{ width: header.getSize() || undefined }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  className="border-hairline"
                  key={row.original.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="py-4 text-[14px] leading-[1.6] text-foreground"
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
          className="border-hairline bg-surface-container text-foreground [&_button]:border-hairline rounded-xl border-[1px] text-[14px] [&_button]:rounded-lg [&_p]:text-[14px] [&_span]:text-[14px]"
          pagination={pagination}
          onPageChange={(next: number) => update({ page: next })}
        />
      )}

      <DeleteEntityDialog
        open={pendingDelete !== null}
        title="Xoá khách hàng này?"
        entityName={pendingDelete?.full_name}
        submitting={deleteCustomer.isPending}
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
