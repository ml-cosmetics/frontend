"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Table as TanStackTable } from "@tanstack/react-table";
import { Boxes, Loader2, RefreshCw } from "lucide-react";
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
  EmptyState,
  Pagination,
  useDebouncedValue,
} from "@/components/common";
import { buildInventoryColumns, type InventoryRow } from "./columns";
import {
  useInventoryUrlState,
} from "../hooks/use-inventory-url-state";
import { useInventoryList } from "../hooks/use-inventory-list";
import type { InventoryStockFilter } from "../types/inventory-row";

/** Public props for the lazy-loaded AdjustmentDialog. */
interface AdjustmentDialogPublicProps {
  row: InventoryRow;
  onClose: () => void;
}

const PAGE_SIZE = 20;

/**
 * `InventoryListTable` — full list view for inventory management.
 *
 * All filter and pagination work is now delegated to the backend
 * (search / stock / sort / page / per_page), so the hook returns
 * exactly one server-sized page. URL state is the source of truth
 * for the request — debounced search input commits back to the URL
 * once per debounce window.
 */
export function InventoryListTable() {
  const { state, update } = useInventoryUrlState();

  const listQuery = useInventoryList(
    {
      page: state.page,
      per_page: PAGE_SIZE,
      search: state.search,
      sort: state.sort,
    },
    state.stock,
  );

  // Search input — local mirror; commits to URL on debounce so the
  // network only fires when the user actually pauses.
  const [searchInput, setSearchInput] = useDebouncedValue<string>({
    defaultValue: state.search,
    delay: 350,
    onCommit: (next) => {
      if (next !== state.search) {
        update({ search: next, page: 1 });
      }
    },
  });

  const [pendingAdjust, setPendingAdjust] = React.useState<InventoryRow | null>(null);

  const columns = React.useMemo(
    () =>
      buildInventoryColumns({
        onAdjust: (row) => setPendingAdjust(row),
      }),
    [],
  );

  const items = listQuery.data?.items ?? [];
  const table: TanStackTable<InventoryRow> = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getRowId: (row) => row.id,
  });

  const rows = table.getRowModel().rows;
  const serverPagination = listQuery.data?.pagination;

  return (
    <div className="flex flex-col gap-4">
      <CrudFilterBar
        filters={
          <>
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên hoặc SKU…"
              className="max-w-xs"
              aria-label="Tìm sản phẩm trong kho"
            />
            <CrudStatusFilter<InventoryStockFilter>
              value={state.stock}
              onChange={(next) => {
                update({ stock: next, page: 1 });
              }}
              options={[
                { value: undefined, label: "Tất cả" },
                { value: "in_stock", label: "Còn hàng" },
                { value: "low_stock", label: "Sắp hết" },
                { value: "out_of_stock", label: "Hết hàng" },
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
      />

      <CrudListShell
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        error={listQuery.error}
        onRetry={() => listQuery.refetch()}
        emptyState={
          rows.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="Chưa có dữ liệu tồn kho"
              description={
                state.search || state.stock
                  ? "Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại."
                  : "Tồn kho sẽ xuất hiện sau khi sản phẩm được nhập kho."
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
              {rows.length === 0 && !listQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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

      {serverPagination && (
        <Pagination
          pagination={serverPagination}
          onPageChange={(next) => update({ page: next })}
        />
      )}

      {pendingAdjust && (
        <AdjustmentDialogWrapper
          row={pendingAdjust}
          onClose={() => setPendingAdjust(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Lazy wrapper — imported in Phase 5 when the dialog is built.
 * ------------------------------------------------------------------ */

function AdjustmentDialogWrapper({
  row,
  onClose,
}: AdjustmentDialogPublicProps) {
  const [Dialog, setDialog] = React.useState<null | React.ComponentType<AdjustmentDialogPublicProps>>(null);
  React.useEffect(() => {
    let alive = true;
    import("./adjustment-dialog").then((m) => {
      if (alive) setDialog(() => m.AdjustmentDialog);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!Dialog) return null;
  return <Dialog row={row} onClose={onClose} />;
}
