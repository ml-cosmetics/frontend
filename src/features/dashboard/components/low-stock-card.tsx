"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { StockBadge, EmptyState, ErrorState } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useLowStock } from "../hooks";

export function LowStockCard() {
  const query = useLowStock();
  const { data, isLoading, isError } = query;
  const items = data?.items ?? [];

  return (
    <section
      className="rounded-xl border border-hairline bg-card p-6"
      aria-labelledby="low-stock-title"
    >
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" aria-hidden="true" />
        <h3 id="low-stock-title" className="text-[18px] font-semibold leading-[1.3] text-foreground">
          Sản phẩm sắp hết hàng
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-3" role="status" aria-label="Đang tải dữ liệu tồn kho">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          error={undefined}
          title="Không thể tải cảnh báo tồn kho"
          onRetry={() => query.refetch?.()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Không có cảnh báo"
          description="Tất cả sản phẩm đều có đủ hàng."
        />
      ) : (
        <ul className="space-y-3" aria-label="Danh sách sản phẩm sắp hết hàng">
          {items.map((item) => (
            <li
              key={item.product_id}
              className="flex items-center justify-between gap-3"
            >
              <p className="truncate text-[14px] font-medium text-foreground">
                {item.name}
              </p>
              <StockBadge quantity={item.quantity} showQuantity />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
