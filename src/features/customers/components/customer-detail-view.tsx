"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Edit2, Loader2, Mail, MapPin, Phone, User as UserIcon } from "lucide-react";
import { useCustomer } from "../hooks/use-customer";
import { useOrders } from "@/features/orders/hooks/use-orders";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { ErrorState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/utils/money";
import { formatDate } from "@/lib/utils";

export function CustomerDetailView({ customerId }: { customerId: string }) {
  const customerQuery = useCustomer(customerId);
  const ordersQuery = useOrders({ customer_id: customerId, per_page: 50 });

  if (customerQuery.isError) {
    return (
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 p-6">
        <ErrorState
          title="Không tải được chi tiết khách hàng"
          error={customerQuery.error}
          onRetry={() => customerQuery.refetch()}
        />
      </div>
    );
  }

  if (customerQuery.isLoading) {
    return (
      <div className="grid h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  const customer = customerQuery.data;
  if (!customer) return null;

  const orders = ordersQuery.data?.items || [];
  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-6 p-6">
      <div className="flex flex-1 flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="mt-1 h-8 w-8 shrink-0 rounded-full"
            >
              <Link href="/admin/customers">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Quay lại danh sách</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.02em] text-foreground">
                {customer.full_name}
              </h1>
              <p className="mt-1 text-[13px] leading-[18px] text-muted-foreground">
                Khách hàng từ {formatDate(customer.created_at)}
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/admin/customers/${customer.id}/edit`}>
              <Edit2 className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Button>
        </div>

        {/* Content Section */}
        <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr] xl:grid-cols-[380px_1fr]">
          
          {/* Left Column (Info) */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-rose-100 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Thông tin liên lạc</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-[14px] w-[14px] text-muted-foreground" />
                  <span className="text-[13px] leading-[1.6] text-foreground">
                    {customer.phone || "—"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-[14px] w-[14px] text-muted-foreground" />
                  <span className="text-[13px] leading-[1.6] text-foreground break-all">
                    {customer.email || "—"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-[14px] w-[14px] text-muted-foreground" />
                  <span className="text-[13px] leading-[1.6] text-foreground">
                    {customer.address || "—"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <UserIcon className="mt-0.5 h-[14px] w-[14px] text-muted-foreground" />
                  <span className="text-[13px] leading-[1.6] text-foreground break-all">
                    {customer.facebook ? (
                      <a href={customer.facebook} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        Facebook Profile
                      </a>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
              </div>

              {customer.note && (
                <>
                  <hr className="my-6 border-rose-100" />
                  <h3 className="mb-2 text-sm font-semibold text-foreground">Ghi chú</h3>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                    {customer.note}
                  </p>
                </>
              )}
            </div>
            
            <div className="rounded-xl border border-rose-100 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Tổng quan mua hàng</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Tổng số đơn hàng</span>
                  <span className="font-mono text-[13px] font-medium text-foreground">{orders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Tổng chi tiêu</span>
                  <span className="font-mono text-[13px] font-medium text-primary">
                    {formatVND(totalSpent)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Orders) */}
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-xl border border-rose-100 bg-white">
              <div className="border-b border-rose-100 p-6 pb-4">
                <h3 className="text-sm font-semibold text-foreground">Lịch sử đơn hàng</h3>
              </div>
              
              <div className="w-full">
                {ordersQuery.isLoading ? (
                  <div className="grid h-[200px] place-items-center">
                     <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : ordersQuery.isError ? (
                  <div className="p-8 text-center">
                    <p className="text-[13px] text-rose-500">Lỗi tải danh sách đơn hàng.</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-[13px] text-muted-foreground">Khách hàng này chưa có đơn hàng nào.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-[13px] text-foreground">
                      <thead>
                        <tr className="border-b border-rose-100 bg-surface text-[12px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                          <th className="p-4">Mã đơn</th>
                          <th className="p-4">Ngày đặt</th>
                          <th className="p-4">Trạng thái</th>
                          <th className="p-4 text-right">Tổng tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100">
                        {orders.map((order) => (
                          <tr key={order.id} className="transition-colors hover:bg-surface-container">
                            <td className="p-4">
                              <Link href={`/admin/orders/${order.id}`} className="font-mono text-primary hover:underline">
                                #{order.id.slice(0, 8)}
                              </Link>
                            </td>
                            <td className="p-4 text-muted-foreground">{formatDate(order.created_at)}</td>
                            <td className="p-4">
                              <OrderStatusBadge status={order.status} />
                            </td>
                            <td className="p-4 text-right font-mono font-medium">{formatVND(order.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
