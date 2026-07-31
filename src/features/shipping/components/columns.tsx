"use client";

import * as React from "react";
import { Check, Eye, Printer, Truck, X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  getCarrierChipClass,
  getCarrierLabel,
  getShipmentStatusLabel,
  getShipmentStatusStyle,
} from "../utils/labels";
import { cn } from "@/lib/utils/cn";
import { formatVND } from "@/lib/utils/money";
import type { Shipment } from "@/types";

export type { Shipment };

export interface ShipmentActionsArgs {
  onView: (row: Shipment) => void;
  onPrint: (row: Shipment) => void;
  onMarkDelivered: (row: Shipment) => void;
  onCancel: (row: Shipment) => void;
  onDelete: (row: Shipment) => void;
}

/**
 * Column definitions for the shipments table. Matches the Stitch
 * reference's column order:
 *   Mã VĐ | Đơn LK | Khách hàng | Đơn vị VC | Phí | Trạng thái | Actions
 */
export function buildShipmentColumns(
  args: ShipmentActionsArgs,
): ColumnDef<Shipment>[] {
  return [
    {
      id: "tracking",
      header: "Mã VĐ",
      accessorKey: "tracking_code",
      cell: ({ row }) => (
        <span className="font-mono text-[13px] tabular-nums text-foreground">
          {row.original.tracking_code}
        </span>
      ),
      size: 120,
    },
    {
      id: "order",
      header: "Đơn LK",
      accessorKey: "order_code",
      cell: ({ row }) => (
        <span className="font-mono text-[13px] tabular-nums text-muted-foreground">
          {row.original.order_code}
        </span>
      ),
      size: 110,
    },
    {
      id: "customer",
      header: "Khách hàng",
      accessorKey: "customer_name",
      cell: ({ row }) => (
        <span className="text-[14px] text-foreground">
          {row.original.customer_name}
        </span>
      ),
      size: 160,
    },
    {
      id: "carrier",
      header: "Đơn vị VC",
      accessorKey: "carrier",
      cell: ({ row }) => (
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.05em]",
            getCarrierChipClass(row.original.carrier),
          )}
        >
          {getCarrierLabel(row.original.carrier)}
        </span>
      ),
      size: 110,
    },
    {
      id: "fee",
      header: "Phí",
      cell: ({ row }) => (
        <span className="block text-right font-mono text-[13px] tabular-nums text-foreground">
          {formatVND(row.original.shipping_fee)}
        </span>
      ),
      size: 110,
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => <StatusCell shipment={row.original} />,
      size: 140,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => <ActionsCell shipment={row.original} args={args} />,
      size: 56,
    },
  ];
}

function StatusCell({ shipment }: { shipment: Shipment }) {
  const style = getShipmentStatusStyle(shipment.status);
  const icon =
    style.icon === "check" ? (
      <Check className="h-3.5 w-3.5" aria-hidden="true" />
    ) : style.icon === "close" ? (
      <X className="h-3.5 w-3.5" aria-hidden="true" />
    ) : style.icon === "pending" ? (
      <Truck className="h-3.5 w-3.5" aria-hidden="true" />
    ) : null;
  return (
    <div className={cn("flex items-center gap-1.5", style.text)}>
      {style.icon === "pulse" ? (
        <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      ) : (
        icon
      )}
      <span>{getShipmentStatusLabel(shipment.status)}</span>
    </div>
  );
}

function ActionsCell({
  shipment,
  args,
}: {
  shipment: Shipment;
  args: ShipmentActionsArgs;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 text-right transition-opacity",
        hovered ? "opacity-100" : "opacity-0 group-hover:opacity-100",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-muted-foreground hover:text-[#e11d74]"
        aria-label={`Xem vận đơn ${shipment.tracking_code}`}
        onClick={() => args.onView(shipment)}
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-muted-foreground hover:text-[#e11d74]"
        aria-label={`In vận đơn ${shipment.tracking_code}`}
        onClick={() => args.onPrint(shipment)}
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
      </Button>
      {shipment.status !== "delivered" && shipment.status !== "returned" && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-[#dbc839]"
            aria-label={`Đánh dấu ${shipment.tracking_code} là đã giao`}
            onClick={() => args.onMarkDelivered(shipment)}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-[#ffb4ab]"
            aria-label={`Huỷ vận đơn ${shipment.tracking_code}`}
            onClick={() => args.onCancel(shipment)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </>
      )}
    </div>
  );
}