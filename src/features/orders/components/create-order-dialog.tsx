"use client";

import * as React from "react";
import { Check, ChevronDown, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerList } from "@/features/customers/hooks";
import { customersApi } from "@/features/customers/api";
import { useProductList } from "@/features/products/hooks";
import { useCreateOrder } from "../hooks";
import { cn } from "@/lib/utils/cn";
import { formatVND, formatVNDNumber } from "@/lib/utils/money";
import { queryKeys } from "@/lib/query";
import type { CreateOrderInput, Customer, ID, ProductListItem } from "@/types";

interface DraftItem {
  key: string;
  product_id: ID;
  name: string;
  unit_price: number;
  quantity: number;
}

const SEARCH_DEBOUNCE_MS = 250;

/**
 * `CreateOrderDialog` — admin-side composer for new orders.
 *
 * Flow:
 *   1. Pick a customer (server-side search via `useCustomerList`).
 *   2. Add one or more line items (server-side search via
 *      `useProductList`, restricted to `status: "active"`).
 *   3. Optional note.
 *   4. Submit → `useCreateOrder` → `POST /v1/admin/orders`.
 *
 * The customer + product pickers are rendered INLINE inside the dialog
 * body (not as floating popovers). A floating popover inside a
 * fixed-centered dialog clips at the dialog's rounded border and
 * stacks awkwardly over the footer; an inline expand keeps the visual
 * inside the modal's content area, scrolls with the rest of the form,
 * and never collides with the action footer.
 *
 * Disabled until the backend-side validation can pass (non-empty
 * customer + at least one item with quantity ≥ 1). No optimistic
 * mutation — the backend is the source of truth, the list page
 * invalidates its query on success.
 */
export interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (orderId: ID) => void;
}

export function CreateOrderDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateOrderDialogProps) {
  const [customerId, setCustomerId] = React.useState<ID | null>(null);
  const [items, setItems] = React.useState<DraftItem[]>([]);
  const [note, setNote] = React.useState("");
  const [customerPickerOpen, setCustomerPickerOpen] = React.useState(false);
  const [productPickerOpen, setProductPickerOpen] = React.useState(false);

  // Reset every time the dialog (re-)opens so a cancelled attempt
  // doesn't leak the previous customer's items into a new session.
  React.useEffect(() => {
    if (open) {
      setCustomerId(null);
      setItems([]);
      setNote("");
      setCustomerPickerOpen(false);
      setProductPickerOpen(false);
    }
  }, [open]);

  const mutation = useCreateOrder();

  function handleSubmit() {
    if (!customerId || items.length === 0) return;
    const payload: CreateOrderInput = {
      customer_id: customerId,
      note: note.trim() || undefined,
      items: items.map<CreateOrderInput["items"][number]>((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        unit_price: it.unit_price,
      })),
    };
    mutation.mutate(payload, {
      onSuccess: (order) => {
        onOpenChange(false);
        onCreated?.(order.id);
      },
    });
  }

  const subtotal = items.reduce((sum, it) => sum + it.unit_price * it.quantity, 0);
  const canSubmit =
    Boolean(customerId) &&
    items.length > 0 &&
    items.every((it) => it.quantity > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-hairline px-6 pb-4 pt-6">
          <DialogTitle>Tạo đơn hàng</DialogTitle>
          <DialogDescription>
            Chọn khách hàng, thêm sản phẩm và xác nhận. Đơn mới sẽ ở trạng thái
            &ldquo;Chờ xử lý&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <CustomerPicker
            value={customerId}
            onChange={setCustomerId}
            expanded={customerPickerOpen}
            onExpandedChange={setCustomerPickerOpen}
            onPickComplete={() => setCustomerPickerOpen(false)}
          />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Sản phẩm</Label>
              <span className="text-[12px] text-muted-foreground">
                {items.length} món
              </span>
            </div>
            <ProductPicker
              expanded={productPickerOpen}
              onExpandedChange={setProductPickerOpen}
              onPick={(p) => {
                if (items.some((it) => it.product_id === p.id)) return;
                setItems((curr) => [
                  ...curr,
                  {
                    key: p.id,
                    product_id: p.id,
                    name: p.name,
                    unit_price: p.price,
                    quantity: 1,
                  },
                ]);
              }}
              disabledKeys={items.map((it) => it.key)}
            />
            <ItemsTable items={items} onChange={setItems} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="order-note">Ghi chú (tuỳ chọn)</Label>
            <Textarea
              id="order-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: giao giờ hành chính, đóng gói quà tặng…"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between border-t border-hairline pt-4 text-[14px] leading-[1.6]">
            <span className="text-muted-foreground">Tạm tính</span>
            <span className="font-mono text-[18px] font-semibold text-foreground">
              {formatVND(subtotal)}
            </span>
          </div>
        </div>

        <DialogFooter className="border-t border-hairline bg-card px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Huỷ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Đang tạo…
              </>
            ) : (
              "Tạo đơn hàng"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ *
 * Customer picker — inline expand.
 * Collapsed = "Đã chọn: ..." card hoặc ghost button "Chọn khách hàng".
 * Expanded  = bordered panel with search input + list.
 * ------------------------------------------------------------------ */
function CustomerPicker({
  value,
  onChange,
  expanded,
  onExpandedChange,
  onPickComplete,
}: {
  value: ID | null;
  onChange: (id: ID) => void;
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
  onPickComplete: () => void;
}) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    if (!expanded) return;
    const t = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [search, expanded]);

  // Reset the search field when the picker collapses so a re-open
  // starts from a clean state.
  React.useEffect(() => {
    if (!expanded) {
      setSearch("");
      setDebouncedSearch("");
    }
  }, [expanded]);

  const { data, isLoading } = useCustomerList({
    search: debouncedSearch || undefined,
    per_page: 10,
    page: 1,
  });
  const customers = data?.items ?? [];

  return (
    <div className="flex flex-col gap-2">
      <Label>Khách hàng</Label>

      {expanded ? (
        <InlinePickerPanel
          search={search}
          onSearchChange={setSearch}
          onClose={() => onExpandedChange(false)}
          searchPlaceholder="Tìm theo tên hoặc SĐT…"
          loading={isLoading}
          items={customers}
          emptyText="Không tìm thấy khách hàng phù hợp."
          renderItem={(c) => (
            <SelectableRow
              key={c.id}
              selected={c.id === value}
              onSelect={() => {
                onChange(c.id);
                onPickComplete();
              }}
              primary={c.full_name}
              secondary={c.phone}
            />
          )}
        />
      ) : value ? (
        <SelectedCustomerCard
          customerId={value}
          onChange={() => onExpandedChange(true)}
        />
      ) : (
        <button
          type="button"
          onClick={() => onExpandedChange(true)}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-lg border border-dashed border-hairline bg-card px-3 text-left text-[14px] text-muted-foreground",
            "transition-colors hover:border-rose-300 hover:bg-rose-50/40 hover:text-foreground",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" aria-hidden />
            Tìm và chọn khách hàng…
          </span>
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

/**
 * Card shown after a customer is picked. Resolves the customer record
 * via a `get(id)` lookup so we always render an up-to-date name/phone,
 * even when the row was picked from a search that's since been typed
 * over.
 */
function SelectedCustomerCard({
  customerId,
  onChange,
}: {
  customerId: ID;
  onChange: () => void;
}) {
  const { data: customer } = useQuery({
    queryKey: queryKeys.customers.detail(customerId),
    queryFn: () => customersApi.get(customerId),
  });

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-hairline bg-rose-50/40 px-3 py-2 text-[14px]",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {customer?.full_name ?? <span className="text-muted-foreground">Đang tải…</span>}
          </p>
          <p className="truncate font-mono text-[12px] text-muted-foreground">
            {customer?.phone ?? customerId.slice(0, 8)}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onChange}
        className="shrink-0"
      >
        Đổi
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Reusable inline picker panel — shared between CustomerPicker and
 * ProductPicker so both follow the same visual + a11y conventions.
 * ------------------------------------------------------------------ */
function InlinePickerPanel<T>({
  search,
  onSearchChange,
  onClose,
  searchPlaceholder,
  loading,
  items,
  emptyText,
  renderItem,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onClose: () => void;
  searchPlaceholder: string;
  loading: boolean;
  items: T[];
  emptyText: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  // Focus search on open.
  React.useEffect(() => {
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // ESC closes the panel (doesn't submit the dialog).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-hairline bg-card p-2",
        "shadow-[0_0_0_3px_rgba(225,29,116,0.06)]",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-8"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Đóng"
          className="h-9 w-9"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div
        role="listbox"
        className="max-h-56 overflow-y-auto rounded-md border border-hairline bg-surface-container-low"
      >
        {loading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          <div className="flex flex-col">{items.map((item) => renderItem(item))}</div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Items table
 * ------------------------------------------------------------------ */
function ItemsTable({
  items,
  onChange,
}: {
  items: DraftItem[];
  onChange: (next: DraftItem[]) => void;
}) {
  function updateQuantity(key: string, quantity: number) {
    onChange(
      items.map((it) =>
        it.key === key ? { ...it, quantity: Math.max(1, quantity) } : it,
      ),
    );
  }

  function updateUnitPrice(key: string, unitPrice: number) {
    onChange(
      items.map((it) =>
        it.key === key
          ? { ...it, unit_price: Math.max(0, Math.round(unitPrice)) }
          : it,
      ),
    );
  }

  function remove(key: string) {
    onChange(items.filter((it) => it.key !== key));
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-hairline bg-card px-4 py-6 text-center text-[13px] text-muted-foreground">
        Chưa có sản phẩm nào. Tìm và thêm phía trên.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <table className="w-full text-[13px]">
        <thead className="bg-surface-container-low text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">Sản phẩm</th>
            <th className="px-3 py-2 text-center" style={{ width: 70 }}>
              SL
            </th>
            <th className="px-3 py-2 text-right" style={{ width: 130 }}>
              Đơn giá
            </th>
            <th className="px-3 py-2 text-right" style={{ width: 130 }}>
              Thành tiền
            </th>
            <th style={{ width: 40 }} aria-label="Xoá" />
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline bg-card">
          {items.map((it) => {
            const lineTotal = it.unit_price * it.quantity;
            return (
              <tr key={it.key}>
                <td className="px-3 py-2 align-middle">
                  <span className="line-clamp-1 font-medium text-foreground">
                    {it.name}
                  </span>
                </td>
                <td className="px-3 py-2 text-center align-middle">
                  <Input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        it.key,
                        Number.parseInt(e.target.value, 10) || 1,
                      )
                    }
                    className="h-8 w-16 text-center"
                    aria-label={`Số lượng ${it.name}`}
                  />
                </td>
                <td className="px-3 py-2 text-right align-middle">
                  <Input
                    type="number"
                    min={0}
                    value={it.unit_price}
                    onChange={(e) =>
                      updateUnitPrice(
                        it.key,
                        Number.parseInt(e.target.value, 10) || 0,
                      )
                    }
                    className="h-8 w-28 text-right font-mono"
                    aria-label={`Đơn giá ${it.name}`}
                  />
                </td>
                <td className="px-3 py-2 text-right font-mono text-foreground">
                  {formatVNDNumber(lineTotal)}
                </td>
                <td className="px-2 py-2 text-right align-middle">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(it.key)}
                    aria-label={`Xoá ${it.name}`}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Product picker — inline expand.
 * Unlike the customer picker, the panel stays open after a pick so the
 * user can add several products in one pass; the panel only collapses
 * when the user clicks the close button or hits Escape. Already-added
 * products stay visible but are disabled, so the merchant can see
 * what's already on the order.
 * ------------------------------------------------------------------ */
function ProductPicker({
  expanded,
  onExpandedChange,
  onPick,
  disabledKeys,
}: {
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
  onPick: (product: ProductListItem) => void;
  disabledKeys: string[];
}) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    if (!expanded) return;
    const t = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [search, expanded]);

  React.useEffect(() => {
    if (!expanded) {
      setSearch("");
      setDebouncedSearch("");
    }
  }, [expanded]);

  const { data, isLoading } = useProductList({
    search: debouncedSearch || undefined,
    status: "active",
    per_page: 10,
    page: 1,
  });
  const products = data?.items ?? [];

  return (
    <div className="flex flex-col gap-2">
      {!expanded && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onExpandedChange(true)}
          className="self-start"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Thêm sản phẩm
        </Button>
      )}

      {expanded && (
        <InlinePickerPanel
          search={search}
          onSearchChange={setSearch}
          onClose={() => onExpandedChange(false)}
          searchPlaceholder="Tìm sản phẩm theo tên…"
          loading={isLoading}
          items={products}
          emptyText="Không tìm thấy sản phẩm."
          renderItem={(p) => {
            const alreadyAdded = disabledKeys.includes(p.id);
            return (
              <SelectableRow
                key={p.id}
                selected={alreadyAdded}
                disabled={alreadyAdded}
                onSelect={() => {
                  if (alreadyAdded) return;
                  onPick(p);
                  // Stay open so the merchant can keep adding; clear
                  // the search so the next product starts fresh.
                  setSearch("");
                  setDebouncedSearch("");
                }}
                primary={p.name}
                secondary={formatVND(p.price)}
              />
            );
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Listbox row used inside every inline picker.
 * ------------------------------------------------------------------ */
function SelectableRow({
  selected,
  disabled = false,
  onSelect,
  primary,
  secondary,
}: {
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  primary: string;
  secondary?: string;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={Boolean(selected)}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[14px]",
        "transition-colors hover:bg-rose-50",
        selected && "bg-rose-50/60 text-primary",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
    >
      <span className="min-w-0 truncate font-medium">{primary}</span>
      {secondary ? (
        <span className="font-mono text-[12px] text-muted-foreground">
          {secondary}
        </span>
      ) : null}
    </button>
  );
}
