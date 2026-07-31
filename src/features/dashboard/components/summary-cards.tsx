"use client";

import * as React from "react";
import { ShoppingBag, Layers, Users, ShoppingCart, AlertTriangle, XCircle } from "lucide-react";
import { StatCard } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils/number";
import { useDashboard } from "../hooks";

export function SummaryCards() {
  const { data, isLoading, isError } = useDashboard();

  if (isError) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const m = data!;

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      role="list"
      aria-label="Tổng quan số liệu"
    >
      <StatCard
        label="Sản phẩm"
        value={isLoading ? undefined : formatNumber(m.products.total)}
        hint={m ? `${formatNumber(m.products.active)} đang hoạt động` : undefined}
        icon={ShoppingBag}
        loading={isLoading}
        aria-label="Tổng số sản phẩm"
      />
      <StatCard
        label="Danh mục"
        value={isLoading ? undefined : formatNumber(m.categories.total)}
        hint={m ? `${formatNumber(m.categories.active)} đang hoạt động` : undefined}
        icon={Layers}
        loading={isLoading}
        aria-label="Tổng số danh mục"
      />
      <StatCard
        label="Khách hàng"
        value={isLoading ? undefined : formatNumber(m.customers.total)}
        icon={Users}
        loading={isLoading}
        aria-label="Tổng số khách hàng"
      />
      <StatCard
        label="Đơn hàng"
        value={isLoading ? undefined : formatNumber(m.orders.total)}
        icon={ShoppingCart}
        loading={isLoading}
        aria-label="Tổng số đơn hàng"
      />
      <StatCard
        label="Sắp hết hàng"
        value={isLoading ? undefined : formatNumber(m.inventory.low_stock)}
        icon={AlertTriangle}
        iconClassName="bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
        loading={isLoading}
        aria-label="Số sản phẩm sắp hết hàng"
      />
      <StatCard
        label="Hết hàng"
        value={isLoading ? undefined : formatNumber(m.inventory.out_of_stock)}
        icon={XCircle}
        iconClassName="bg-destructive/10 text-destructive"
        loading={isLoading}
        aria-label="Số sản phẩm hết hàng"
      />
    </div>
  );
}
