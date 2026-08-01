"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUpdateOrderStatus } from "../hooks";
import type { OrderStatus } from "@/types/domain";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "created", label: "Chờ xử lý" },
  { value: "shipping", label: "Đang giao" },
  { value: "done", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã huỷ" },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Chờ xử lý",
  shipping: "Đang giao",
  done: "Hoàn thành",
  cancelled: "Đã huỷ",
};

export interface StatusUpdateDialogProps {
  orderId: string;
  currentStatus: OrderStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StatusUpdateDialog({
  orderId,
  currentStatus,
  open,
  onOpenChange,
  onSuccess,
}: StatusUpdateDialogProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<OrderStatus>(currentStatus);

  React.useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
    }
  }, [open, currentStatus]);

  const mutation = useUpdateOrderStatus();

  function handleConfirm() {
    if (selectedStatus === currentStatus) {
      onOpenChange(false);
      return;
    }
    mutation.mutate(
      { id: orderId, status: selectedStatus },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
          <DialogDescription>
            Chọn trạng thái mới cho đơn hàng #{orderId.slice(0, 8)}…
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Trạng thái hiện tại</Label>
            <div className="rounded-lg border border-hairline px-3 py-2 text-[14px] leading-[1.6] text-foreground">
              {STATUS_LABELS[currentStatus]}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-status">Trạng thái mới</Label>
            <Select
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
            >
              <SelectTrigger id="new-status">
                <SelectValue />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Huỷ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mutation.isPending || selectedStatus === currentStatus}
          >
            {mutation.isPending ? "Đang cập nhật…" : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface CancelOrderDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * `CancelOrderDialog` — confirmation before flipping an order to
 * `cancelled`. Reuses `useUpdateOrderStatus` so the same invalidation
 * + toast flow applies.
 */
export function CancelOrderDialog({
  orderId,
  open,
  onOpenChange,
  onSuccess,
}: CancelOrderDialogProps) {
  const mutation = useUpdateOrderStatus();

  function handleConfirm() {
    mutation.mutate(
      { id: orderId, status: "cancelled" satisfies OrderStatus },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Huỷ đơn hàng #{orderId.slice(0, 8)}…</DialogTitle>
          <DialogDescription>
            Hành động này sẽ chuyển đơn sang trạng thái &ldquo;Đã huỷ&rdquo;. Khách hàng sẽ không
            nhận thêm thông báo vận chuyển cho đơn này nữa.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Đóng
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Đang huỷ…" : "Xác nhận huỷ đơn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
