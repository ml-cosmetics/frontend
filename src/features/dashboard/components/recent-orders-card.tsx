"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatVND } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/date";
import { useRecentOrders } from "../hooks";
import type { OrderStatus } from "@/types";
import { OrderStatus as OrderStatusEnum } from "@/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatusEnum.Created]: "Chờ xử lý",
  [OrderStatusEnum.Shipping]: "Đang giao",
  [OrderStatusEnum.Done]: "Hoàn thành",
  [OrderStatusEnum.Cancelled]: "Đã huỷ",
};

const STATUS_VARIANTS: Record<OrderStatus, "secondary" | "warning" | "success" | "destructive" | "primary" | "muted"> = {
  [OrderStatusEnum.Created]: "warning",
  [OrderStatusEnum.Shipping]: "primary",
  [OrderStatusEnum.Done]: "success",
  [OrderStatusEnum.Cancelled]: "destructive",
};

export function RecentOrdersCard() {
  const query = useRecentOrders();
  const { data, isLoading, isError } = query;
  const items = data?.items ?? [];

  return (
    <section
      className="rounded-xl border border-hairline bg-card p-6"
      aria-labelledby="recent-orders-title"
    >
      <div className="mb-4 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 id="recent-orders-title" className="text-[18px] font-semibold leading-[1.3] text-foreground">
          Đơn hàng gần đây
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-2" role="status" aria-label="Đang tải đơn hàng">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          error={undefined}
          title="Không thể tải đơn hàng"
          onRetry={() => query.refetch?.()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Không có đơn hàng"
          description="Chưa có đơn hàng nào."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]" aria-label="Đơn hàng gần đây">
            <thead className="border-b border-hairline bg-surface-container-low">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
                >
                  Mã đơn
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
                >
                  Khách hàng
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
                >
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
                >
                  Tổng tiền
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
                >
                  Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-[12px] text-foreground">
                    #{order.id}
                  </td>
                  <td className="px-4 py-3 text-[14px] text-foreground">{order.customer_name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[order.status]}>
                      {STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-[14px] font-medium text-foreground">
                    {formatVND(order.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-[14px] text-muted-foreground">
                    {formatDateTime(order.created_at, "dd/MM/yyyy HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
