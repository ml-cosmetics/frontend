"use client";

import * as React from "react";
import Link from "next/link";
import { useOrder } from "../hooks";
import { OrderStatusBadge } from "./order-status-badge";
import { StatusUpdateDialog, CancelOrderDialog } from "./status-update-dialog";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { formatVND } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/date";
import type { Order, OrderItem, OrderStatus } from "@/types";

/**
 * `OrderDetailView` — LuxeOps dark Monolith (Stitch) skin for the
 * `/admin/orders/:id` page. Mirrors screen
 * `934b7661fd874caf9140630c5b31cd43` (project 29642013742130547):
 *
 *   - Topbar (Đơn hàng / #ML-XXXX breadcrumb + In đơn / Sao chép /
 *     Hủy đơn / Cập nhật đơn actions)
 *   - Two-column layout (8 / 4)
 *     - Left: 5-stage status stepper (Tạo đơn / Xác nhận / Đang đóng
 *       gói / Giao hàng / Hoàn thành) + products table
 *     - Right: financial summary + customer card
 *
 * Note: the current FSM exposes only 3 stages (created → shipping →
 * done + cancel). The 5-step visual is rendered by mapping the first
 * two extras (Xác nhận, Đang đóng gói) as implicit pass-through the
 * moment an order leaves `created`. This preserves the existing API
 * while keeping the visual in sync with Stitch.
 */

interface StepDef {
  key: "created" | "confirmed" | "packing" | "shipping" | "done";
  label: string;
  iconName: string;
}

const STEP_DEFS: StepDef[] = [
  { key: "created", label: "Tạo đơn", iconName: "check" },
  { key: "confirmed", label: "Xác nhận", iconName: "check" },
  { key: "packing", label: "Đang đóng gói", iconName: "inventory_2" },
  { key: "shipping", label: "Giao hàng", iconName: "local_shipping" },
  { key: "done", label: "Hoàn thành", iconName: "flag" },
];

function mapStatusToStepIndex(status: OrderStatus): number {
  switch (status) {
    case "created":
      return 0;
    case "shipping":
      return 3;
    case "done":
      return 4;
    case "cancelled":
      return -1;
  }
}

export interface OrderDetailViewProps {
  orderId: string;
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const { data: order, isLoading, isError, error, refetch } = useOrder(orderId);
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  if (isLoading) return <OrderDetailSkeleton />;

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        title="Không thể tải chi tiết đơn hàng"
      />
    );
  }

  if (!order) {
    return (
      <div className="rounded-[4px] border border-rose-100 bg-white p-12 text-center text-[13px] text-muted-foreground">
        Đơn hàng không tồn tại hoặc đã bị xoá.
      </div>
    );
  }

  const itemsSubtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = itemsSubtotal > 0 ? 35_000 : 0;
  const discount = Math.max(0, itemsSubtotal + shipping - order.total);
  const code = `#ML-${order.id.slice(0, 4).toUpperCase()}`;
  const stepIdx = mapStatusToStepIndex(order.status);
  const canCancel = order.status !== "cancelled" && order.status !== "done";

  return (
    <>
      <Topbar
        code={code}
        onUpdate={() => setStatusDialogOpen(true)}
        onCancel={() => setCancelDialogOpen(true)}
        canCancel={canCancel}
      />
      <main className="grid grid-cols-12 gap-6 p-6">
        <section className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          <StatusStepper stepIdx={stepIdx} status={order.status} />
          <ProductsCard items={order.items} />
        </section>
        <aside className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          <CustomerCard order={order} />
          <PaymentCard
            subtotal={itemsSubtotal}
            shipping={shipping}
            discount={discount}
            total={order.total}
          />
        </aside>
      </main>
      <StatusUpdateDialog
        orderId={order.id}
        currentStatus={order.status}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onSuccess={refetch}
      />
      <CancelOrderDialog
        orderId={order.id}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onSuccess={refetch}
      />
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Topbar
 * ------------------------------------------------------------------ */
function Topbar({
  code,
  onUpdate,
  onCancel,
  canCancel,
}: {
  code: string;
  onUpdate: () => void;
  onCancel: () => void;
  canCancel: boolean;
}) {
  return (
    <header className="sticky top-16 z-30 flex h-16 w-full items-center justify-between border-b border-rose-100 bg-surface px-6">
      <div className="flex items-center gap-2 text-[13px] leading-[20px]">
        <Link
          href="/admin/orders"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Đơn hàng
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-bold text-primary">{code}</span>
      </div>
      <div className="flex items-center gap-2 text-[13px] leading-[20px]">
        <TopbarBtn
          icon={<span className="material-symbols-outlined text-[16px]">print</span>}
          label="In đơn"
        />
        <TopbarBtn
          icon={<span className="material-symbols-outlined text-[16px]">content_copy</span>}
          label="Sao chép"
        />
        <TopbarBtn
          icon={<span className="material-symbols-outlined text-[16px]">cancel</span>}
          label="Hủy đơn"
          tone="danger"
          onClick={canCancel ? onCancel : undefined}
          disabled={!canCancel}
        />
        <button
          type="button"
          onClick={onUpdate}
          className="flex items-center gap-1 rounded-[2px] bg-primary px-4 py-1.5 text-[12px] font-semibold uppercase leading-[16px] tracking-[0.05em] text-primary-foreground transition-opacity hover:opacity-90"
          style={{ boxShadow: "0 0 10px rgba(225,29,116,0.2)" }}
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">update</span>
          Cập nhật đơn
        </button>
      </div>
    </header>
  );
}

function TopbarBtn({
  icon,
  label,
  tone = "ghost",
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1 rounded-[2px] px-2 py-1 text-[13px] leading-[20px] transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        tone === "danger"
          ? "border border-[#7f1d1d] text-[#f87171] hover:bg-[#7f1d1d] hover:text-foreground"
          : "border border-rose-100 text-muted-foreground hover:bg-surface-container hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Status stepper
 * ------------------------------------------------------------------ */
function StatusStepper({ stepIdx, status }: { stepIdx: number; status: OrderStatus }) {
  const isCancelled = status === "cancelled";
  return (
    <div className="rounded-[4px] border border-rose-100 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold leading-[28px] text-foreground">
          Trạng thái đơn hàng
        </h2>
        <OrderStatusBadge status={status} />
      </div>
      <div className="relative flex items-center justify-between pt-4 pb-2">
        <div className="absolute left-8 right-8 top-7 z-0 h-px bg-[#494552]" />
        {stepIdx > 0 && (
          <div
            className="absolute left-8 top-7 z-0 h-px bg-primary"
            style={{
              width: `calc((100% - 4rem) * ${Math.min(stepIdx, STEP_DEFS.length - 1) / (STEP_DEFS.length - 1)})`,
            }}
          />
        )}
        {STEP_DEFS.map((step, i) => {
          const done = i < stepIdx;
          const current = i === stepIdx;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={cn(
                  "relative flex h-6 w-6 items-center justify-center rounded-full",
                  done && "bg-primary text-primary-foreground",
                  current && "border-2 border-primary bg-white text-primary",
                  !done && !current && "border border-rose-100 bg-white text-muted-foreground",
                )}
                style={
                  current
                    ? { boxShadow: "0 0 0 4px rgba(225,29,116,0.15)" }
                    : undefined
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px", fontVariationSettings: current ? "'FILL' 1" : "'FILL' 0" }}
                  aria-hidden="true"
                >
                  {step.iconName}
                </span>
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "text-[13px] leading-[18px]",
                    current
                      ? "font-medium text-primary"
                      : done
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {isCancelled && (
        <div className="mt-4 rounded border border-red-900 bg-red-950/40 px-3 py-2 text-[13px] text-red-300">
          Đơn hàng này đã bị huỷ.
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Products card
 * ------------------------------------------------------------------ */
function ProductsCard({ items }: { items: OrderItem[] }) {
  return (
    <div className="rounded-[4px] border border-rose-100 bg-white">
      <div className="flex items-center justify-between border-b border-rose-100 p-4">
        <h2 className="flex items-center gap-2 text-[18px] font-semibold leading-[28px] text-foreground">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            shopping_bag
          </span>
          Sản phẩm
        </h2>
        <span className="text-[12px] font-medium leading-[16px] text-muted-foreground">
          {items.length} món
        </span>
      </div>
      <table className="w-full text-left text-[13px] text-foreground">
        <thead className="border-b border-rose-100 bg-white text-[12px] font-medium uppercase leading-[16px] tracking-[0.05em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Sản phẩm</th>
            <th className="px-4 py-3 text-center font-medium">SL</th>
            <th className="px-4 py-3 text-right font-medium">Đơn giá</th>
            <th className="px-4 py-3 text-right font-medium">Thành tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rose-100">
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                Đơn hàng này không có sản phẩm.
              </td>
            </tr>
          ) : (
            items.map((it) => (
              <tr key={it.id} className="transition-colors hover:bg-surface-container">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {it.product?.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.product.thumbnail_url}
                        alt={it.product.name}
                        className="h-10 w-10 shrink-0 rounded border border-rose-100 bg-white object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-rose-100 bg-surface-container text-muted-foreground"
                      >
                        <span className="material-symbols-outlined text-[18px]">image</span>
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium leading-[20px] text-foreground">
                        {it.product?.name ?? `Sản phẩm #${it.product_id.slice(0, 8)}`}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[11px] leading-[16px] text-muted-foreground">
                        {it.product?.slug
                          ? `/${it.product.slug}`
                          : `ID: ${it.product_id.slice(0, 8)}`}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-mono text-[13px] leading-[20px]">
                  {it.quantity}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[13px] leading-[20px]">
                  {formatVND(it.unit_price)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[13px] font-medium leading-[20px] text-foreground">
                  {formatVND(it.subtotal)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Customer card
 * ------------------------------------------------------------------ */
function CustomerCard({ order }: { order: Order }) {
  const customerName = order.customer?.full_name || `Khách #${order.customer_id.slice(0, 6)}`;
  const customerPhone = order.customer?.phone;
  const customerEmail = order.customer?.email;
  const initials = customerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "KH";

  return (
    <div className="rounded-[4px] border border-rose-100 bg-white p-4">
      <h2 className="mb-4 flex items-center gap-2 text-[18px] font-semibold leading-[28px] text-foreground">
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">person</span>
        Khách hàng
      </h2>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-high text-[14px] font-bold text-muted-foreground">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium leading-[20px] text-foreground">{customerName}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] leading-[16px] text-muted-foreground">
            #{order.customer_id.slice(0, 8)}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-rose-100 pt-4 text-[13px] leading-[20px]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-muted-foreground" aria-hidden="true">
            call
          </span>
          <span className="font-mono text-foreground">
            {customerPhone || "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-muted-foreground" aria-hidden="true">
            mail
          </span>
          <span className="truncate text-foreground">{customerEmail || "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-muted-foreground" aria-hidden="true">
            schedule
          </span>
          <span className="text-muted-foreground">
            Đặt lúc {formatDateTime(order.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Payment card
 * ------------------------------------------------------------------ */
function PaymentCard({
  subtotal,
  shipping,
  discount,
  total,
}: {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}) {
  return (
    <div className="rounded-[4px] border border-rose-100 bg-white p-4">
      <h2 className="mb-4 text-[18px] font-semibold leading-[28px] text-foreground">Thanh toán</h2>
      <div className="mb-4 flex flex-col gap-2 border-b border-rose-100 pb-4 font-mono text-[13px] leading-[20px] text-muted-foreground">
        <div className="flex justify-between">
          <p className="text-[13px]">Tạm tính</p>
          <span>{formatVND(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <p className="text-[13px]">Phí vận chuyển</p>
          <span>{formatVND(shipping)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-foreground">
            <p className="text-[13px]">Giảm giá</p>
            <span>-{formatVND(discount)}</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-[13px] font-medium leading-[20px] text-foreground">Tổng khách trả</p>
        <p className="font-mono text-[20px] font-bold leading-[28px] text-primary">{formatVND(total)}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Skeleton
 * ------------------------------------------------------------------ */
function OrderDetailSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      <section className="col-span-12 flex flex-col gap-6 lg:col-span-8">
        <Skeleton className="h-48 rounded-[4px] bg-surface-container-high" />
        <Skeleton className="h-64 rounded-[4px] bg-surface-container-high" />
      </section>
      <aside className="col-span-12 flex flex-col gap-6 lg:col-span-4">
        <Skeleton className="h-48 rounded-[4px] bg-surface-container-high" />
        <Skeleton className="h-40 rounded-[4px] bg-surface-container-high" />
      </aside>
    </div>
  );
}
