"use client";

import * as React from "react";
import { PageHeader } from "@/components/common";
import { SummaryCards } from "./summary-cards";
import { TopProductsCard } from "./top-products-card";
import { LowStockCard } from "./low-stock-card";
import { RecentOrdersCard } from "./recent-orders-card";

/**
 * `DashboardPage` — admin overview, Aura Vénus skin.
 *
 * Each child card owns its own loading / empty / error state and reads
 * from the typed dashboard + reports APIs. Nothing here fakes numbers,
 * draws placeholder SVG, or substitutes hard-coded rows when the API
 * returns an empty array — empty arrays render through the standard
 * `EmptyState` so the operator only ever sees real data.
 */
export function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 p-6">
      <PageHeader
        eyebrow="Tổng quan"
        title="Vận hành ML Cosmetics"
        description="Theo dõi số liệu bán hàng, tồn kho và đơn hàng mới nhất."
      />

      <SummaryCards />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TopProductsCard />
        <LowStockCard />
        <RecentOrdersCard />
      </div>
    </div>
  );
}
