"use client";

import * as React from "react";
import { Eye, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrders } from "../hooks";
import { OrderStatusBadge } from "./order-status-badge";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatVND } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/date";
import type { Order } from "@/types";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "created", label: "Chờ xử lý" },
  { value: "shipping", label: "Đang giao" },
  { value: "done", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã huỷ" },
];

export function OrderListTable() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState("");
  const [customerId, setCustomerId] = React.useState("");

  const params = {
    page,
    per_page: 20,
    ...(status ? { status } : {}),
    ...(customerId ? { customer_id: customerId } : {}),
  };

  const { data, isLoading, isError, error, refetch } = useOrders(params);

  const handleViewDetail = React.useCallback(
    (order: Order) => {
      router.push(`/admin/orders/${order.id}`);
    },
    [router],
  );

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        title="Không thể tải danh sách đơn hàng"
      />
    );
  }

  return (
    <div className="text-foreground flex flex-col gap-4 text-[14px] leading-[1.6]">
      <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-card p-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Tìm theo ID khách hàng…"
          value={customerId}
          onChange={(e) => {
            setCustomerId(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-hairline bg-card">
        <Table aria-label="Danh sách đơn hàng">
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Order ID</TableHead>
              <TableHead scope="col">Khách hàng</TableHead>
              <TableHead scope="col">Trạng thái</TableHead>
              <TableHead scope="col" className="text-right">Tổng cộng</TableHead>
              <TableHead scope="col">Ngày tạo</TableHead>
              <TableHead scope="col" className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-[14px] text-muted-foreground">
                  <EmptyState
                    icon={Package}
                    title="Chưa có đơn hàng nào"
                    description="Danh sách đơn hàng sẽ xuất hiện khi có khách đặt hàng."
                  />
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-[12px] text-foreground">
                    #{order.id.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="font-mono text-[12px] text-muted-foreground">
                    {order.customer_id.slice(0, 8)}…
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {formatVND(order.total)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetail(order)}
                      aria-label={`Xem chi tiết đơn hàng ${order.id.slice(0, 8)}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.pagination && (
        <Pagination
          variant="admin"
          pagination={data.pagination}
          onPageChange={setPage}
          hideCaption={false}
        />
      )}
    </div>
  );
}
