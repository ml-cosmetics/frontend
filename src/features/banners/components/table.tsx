"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Table as TanStackTable } from "@tanstack/react-table";
import { ImageIcon, Loader2, Plus, RefreshCw } from "lucide-react";
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
  buildBannerColumns,
  type Banner,
} from "./columns";
import {
  useBannerList,
  useDeleteBanner,
  useToggleBannerStatus,
} from "../hooks";

const PAGE_SIZE = 20;
type BannerStatusFilter = boolean | undefined;

export function BannerListTable() {
  const router = useRouter();

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<BannerStatusFilter>(undefined);
  const [page, setPage] = React.useState(1);

  const listQuery = useBannerList();
  const deleteBanner = useDeleteBanner();
  const toggleStatus = useToggleBannerStatus();

  const [pendingDelete, setPendingDelete] = React.useState<Banner | null>(null);
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

  const filtered = React.useMemo(() => {
    const items = listQuery.data ?? [];
    const q = search.trim().toLowerCase();
    return items.filter((b) => {
      const matchSearch = !q || b.title.toLowerCase().includes(q);
      const matchStatus = status === undefined || b.is_active === status;
      return matchSearch && matchStatus;
    });
  }, [listQuery.data, search, status]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => { setPage(1); }, [search, status]);

  const handleEdit = React.useCallback(
    (row: Banner) => { router.push("/admin/banners/" + row.id + "/edit"); },
    [router],
  );
  const handleDelete = React.useCallback((row: Banner) => {
    setPendingDelete(row);
    setDeleteError(null);
  }, []);
  const handleToggle = React.useCallback(async (row: Banner) => {
    try {
      await toggleStatus.mutateAsync({ id: row.id, activate: !row.is_active });
    } catch {
      // toast handled by hook
    }
  }, [toggleStatus]);

  const columns = React.useMemo(
    () => buildBannerColumns({ onEdit: handleEdit, onDelete: handleDelete, onToggle: handleToggle }),
    [handleEdit, handleDelete, handleToggle],
  );

  const table: TanStackTable<Banner> = useReactTable({
    data: paginated,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getRowId: (row) => row.id,
  });

  const confirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deleteBanner.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
      setDeleteError(null);
    } catch (err) {
      setDeleteError(err as APIError);
      toast.error("Không thể xoá banner", {
        description: (err as APIError).message,
      });
    }
  }, [pendingDelete, deleteBanner]);

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
              placeholder="Tìm theo tiêu đề…"
              className="max-w-xs"
              aria-label="Tìm banner"
            />
            <CrudStatusFilter<BannerStatusFilter>
              value={status}
              onChange={(next) => { setStatus(next); setPage(1); }}
              options={[
                { value: undefined, label: "Tất cả" },
                { value: true, label: "Đang hoạt động" },
                { value: false, label: "Đã vô hiệu" },
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
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </>
        }
        actions={
          <Button asChild>
            <a href="/admin/banners/new">
              <Plus className="h-4 w-4" />
              <span>Thêm banner</span>
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
              icon={ImageIcon}
              title="Chưa có banner nào"
              description={
                search || status !== undefined
                  ? "Không tìm thấy banner phù hợp với bộ lọc hiện tại."
                  : "Tạo banner đầu tiên để hiển thị trên trang chủ."
              }
              action={
                <Button asChild>
                  <a href="/admin/banners/new">
                    <Plus className="h-4 w-4" />
                    <span>Thêm banner</span>
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
        title="Xoá banner này?"
        entityName={pendingDelete?.title}
        submitting={deleteBanner.isPending}
        error={deleteError}
        onCancel={() => { setPendingDelete(null); setDeleteError(null); }}
        onConfirm={() => { void confirmDelete(); }}
      />
    </div>
  );
}
