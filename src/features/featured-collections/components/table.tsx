"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Table as TanStackTable } from "@tanstack/react-table";
import { Sparkles, Loader2, Plus, RefreshCw } from "lucide-react";
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
import {
  buildFeaturedCollectionColumns,
  type FeaturedCollection,
} from "./columns";
import {
  useFeaturedCollectionsAdminList,
  featuredCollectionListToRows,
  useDeleteFeaturedCollection,
} from "../hooks";

const PAGE_SIZE = 20;
type StatusFilter = boolean | undefined;

export function FeaturedCollectionListTable() {
  const router = useRouter();

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>(undefined);
  const [page, setPage] = React.useState(1);

  const listQuery = useFeaturedCollectionsAdminList({
    page,
    per_page: 100, // Fetch enough to filter client-side. Backend paginates server-side too.
  });
  const deleteCollection = useDeleteFeaturedCollection();

  const [pendingDelete, setPendingDelete] = React.useState<FeaturedCollection | null>(null);
  const [deleteError, setDeleteError] = React.useState<APIError | null>(null);

  const [searchInput, setSearchInput] = useDebouncedValue<string>({
    defaultValue: search,
    delay: 350,
    onCommit: (next) => {
      if (next !== search) {
        setSearch(next);
        setPage(1);
      }
    },
  });

  const allItems = React.useMemo(
    () => featuredCollectionListToRows(listQuery.data),
    [listQuery.data],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems.filter((c) => {
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.subtitle ?? "").toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q);
      const matchStatus = status === undefined || c.is_active === status;
      return matchSearch && matchStatus;
    });
  }, [allItems, search, status]);

  React.useEffect(() => {
    setPage(1);
  }, [search, status]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleEdit = React.useCallback(
    (row: FeaturedCollection) => {
      router.push(`/admin/featured-collections/${row.id}/edit`);
    },
    [router],
  );

  const handleDelete = React.useCallback((row: FeaturedCollection) => {
    setPendingDelete(row);
    setDeleteError(null);
  }, []);

  const columns = React.useMemo(
    () =>
      buildFeaturedCollectionColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete],
  );

  const table: TanStackTable<FeaturedCollection> = useReactTable({
    data: paginated,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getRowId: (row) => row.id,
  });

  const confirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deleteCollection.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
      setDeleteError(null);
    } catch (err) {
      setDeleteError(err as APIError);
      toast.error("Không thể xoá bộ sưu tập", {
        description: (err as APIError).message,
      });
    }
  }, [pendingDelete, deleteCollection]);

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-4">
      <CrudFilterBar
        filters={
          <>
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tiêu đề, slug…"
              className="h-11 max-w-xs text-[15px]"
              aria-label="Tìm bộ sưu tập"
            />
            <CrudStatusFilter<StatusFilter>
              value={status}
              onChange={(next) => {
                setStatus(next);
                setPage(1);
              }}
              options={[
                { value: undefined, label: "Tất cả" },
                { value: true, label: "Đang hiển thị" },
                { value: false, label: "Đã ẩn" },
              ]}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              onClick={() => listQuery.refetch()}
              disabled={listQuery.isFetching}
              aria-label="Tải lại"
            >
              {listQuery.isFetching ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
            </Button>
          </>
        }
        actions={
          <Button asChild size="lg" className="h-11 px-5 text-[15px]">
            <a href="/admin/featured-collections/new">
              <Plus className="h-5 w-5" />
              <span>Thêm bộ sưu tập</span>
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
              icon={Sparkles}
              title="Chưa có bộ sưu tập nào"
              description={
                search || status !== undefined
                  ? "Không tìm thấy bộ sưu tập phù hợp với bộ lọc hiện tại."
                  : "Tạo bộ sưu tập đầu tiên để hiển thị trên trang chủ."
              }
              action={
                <Button asChild>
                  <a href="/admin/featured-collections/new">
                    <Plus className="h-4 w-4" />
                    <span>Thêm bộ sưu tập</span>
                  </a>
                </Button>
              }
            />
          ) : undefined
        }
      >
        <div className="overflow-x-auto rounded-xl border border-hairline bg-card shadow-sm">
          <UITable className="text-[15px] leading-[1.55]">
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() || undefined }}
                      className="h-12 px-5 text-[12px]"
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
                    className="h-32 text-center text-[14px] text-muted-foreground"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Chỉnh sửa bộ sưu tập ${row.original.title}`}
                    className="group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                    onClick={() => handleEdit(row.original)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleEdit(row.original);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-5 py-5 text-[15px] leading-[1.55]"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </UITable>
        </div>
      </CrudListShell>

      {total > PAGE_SIZE && (
        <Pagination
          pagination={{
            limit: PAGE_SIZE,
            offset: (safePage - 1) * PAGE_SIZE,
            page: safePage,
            total,
            total_pages: totalPages,
            has_next: safePage < totalPages,
            has_previous: safePage > 1,
          }}
          onPageChange={(p) => setPage(p)}
        />
      )}

      <DeleteEntityDialog
        open={pendingDelete !== null}
        title="Xoá bộ sưu tập này?"
        entityName={pendingDelete?.title}
        submitting={deleteCollection.isPending}
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