import type { Carrier, ShipmentStatus } from "@/types";

/**
 * Vietnamese label for each shipping carrier — used in the chip
 * column of the shipments table and inside filter dropdowns.
 */
export function getCarrierLabel(carrier: Carrier): string {
  switch (carrier) {
    case "ghn":
      return "GHN";
    case "ghtk":
      return "GHTK";
    case "viettel_post":
      return "Viettel Post";
    case "vnpost":
      return "VNPost";
    case "manual":
      return "Thủ công";
    case "other":
    default:
      return "Khác";
  }
}

/**
 * Tailwind classes for the carrier chip background / text colour.
 * Returns a stable combination that matches the existing admin
 * palette: emerald for GHTK, orange for GHN, red for Viettel /
 * J&T, neutral otherwise.
 */
export function getCarrierChipClass(carrier: Carrier): string {
  switch (carrier) {
    case "ghtk":
      return "border-emerald-900/50 bg-emerald-900/30 text-emerald-400";
    case "ghn":
      return "border-orange-900/50 bg-orange-900/30 text-orange-400";
    case "viettel_post":
    case "vnpost":
      return "border-red-900/50 bg-red-900/30 text-red-400";
    case "manual":
    case "other":
    default:
      return "border-[#27272a] bg-[#27272a] text-[#fafafa]";
  }
}

export function getShipmentStatusLabel(status: ShipmentStatus): string {
  switch (status) {
    case "pending":
      return "Chờ lấy";
    case "in_transit":
      return "Đang giao";
    case "out_for_delivery":
      return "Đang giao tới";
    case "delivered":
      return "Thành công";
    case "exception":
      return "Lỗi";
    case "returned":
      return "Đã hủy";
    default:
      return status;
  }
}

/**
 * Tailwind classes + small bullet indicator for the status column.
 * Each status maps to one of the established admin palette tokens.
 */
export function getShipmentStatusStyle(status: ShipmentStatus): {
  dot: string;
  text: string;
  icon?: "pending" | "check" | "close" | "pulse";
} {
  switch (status) {
    case "in_transit":
    case "out_for_delivery":
      return {
        dot: "bg-[#e11d74] animate-pulse",
        text: "text-[#e11d74]",
        icon: "pulse",
      };
    case "delivered":
      return { dot: "bg-[#dbc839]", text: "text-[#dbc839]", icon: "check" };
    case "pending":
      return { dot: "bg-[#a1a1aa]", text: "text-[#a1a1aa]", icon: "pending" };
    case "returned":
    case "exception":
      return { dot: "bg-[#ffb4ab]", text: "text-[#ffb4ab]", icon: "close" };
    default:
      return { dot: "bg-[#a1a1aa]", text: "text-[#a1a1aa]" };
  }
}