"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils/number";
import { useTopProducts } from "../hooks";

export function TopProductsCard() {
  const query = useTopProducts();
  const { data, isLoading, isError } = query;
  const items = data?.items ?? [];

  return (
    <section
      className="rounded-xl border border-hairline bg-card p-6"
      aria-labelledby="top-products-title"
    >
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 id="top-products-title" className="text-[18px] font-semibold leading-[1.3] text-foreground">
          Sản phẩm bán chạy
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-3" role="status" aria-label="Đang tải sản phẩm bán chạy">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          error={undefined}
          title="Không thể tải sản phẩm bán chạy"
          onRetry={() => query.refetch?.()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Không có dữ liệu"
          description="Chưa có sản phẩm nào được bán."
        />
      ) : (
        <ul className="space-y-3" aria-label="Danh sách sản phẩm bán chạy">
          {items.map((item, index) => (
            <li key={item.product_id} className="flex items-center gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[12px] font-semibold text-primary"
                aria-label={`Hạng ${index + 1}`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-foreground">
                  {item.name}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {formatNumber(item.quantity_sold)} đã bán
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
