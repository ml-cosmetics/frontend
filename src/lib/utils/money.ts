import type { VND } from "@/types";

/**
 * Format a VND amount (stored as a BIGINT, no decimals) into a
 * localised Vietnamese-Dong string. We use the `vi-VN` locale so the
 * numeric grouping follows the dot-separator convention (`1.990.000 ₫`).
 *
 * Examples:
 *   formatVND(0)         -> "0 ₫"
 *   formatVND(199000)    -> "199.000 ₫"
 *   formatVND(5000000)   -> "5.000.000 ₫"
 */
export function formatVND(amount: VND | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback for environments where Intl is unavailable.
    return `${amount.toLocaleString("vi-VN")} ₫`;
  }
}

/**
 * Format a VND amount without the currency symbol. Useful for table
 * cells where the column header already says "VND".
 */
export function formatVNDNumber(amount: VND | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  try {
    return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amount);
  } catch {
    return amount.toString();
  }
}
