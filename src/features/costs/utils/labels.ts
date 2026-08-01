import type { ExpenseCategory, ExpenseStatus } from "@/types";

/**
 * Vietnamese label for each cost category. Used in the chip column
 * of the costs table and inside filter dropdowns.
 */
export function getCategoryLabel(category: ExpenseCategory): string {
  switch (category) {
    case "cogs":
      return "Nhập hàng";
    case "shipping":
      return "Vận chuyển";
    case "marketing":
      return "Marketing";
    case "salary":
      return "Lương";
    case "overhead":
      return "Vận hành";
    case "tax":
      return "Thuế";
    case "other":
    default:
      return "Khác";
  }
}

/**
 * Tailwind classes for the category chip background / text colour.
 * Returns a stable combination that maps each cost category to a
 * distinct hue.
 */
export function getCategoryChipClass(category: ExpenseCategory): string {
  switch (category) {
    case "cogs":
      return "border-blue-900/50 bg-blue-900/30 text-blue-300";
    case "shipping":
      return "border-orange-900/50 bg-orange-900/30 text-orange-300";
    case "marketing":
      return "border-pink-900/50 bg-pink-900/30 text-pink-300";
    case "salary":
      return "border-emerald-900/50 bg-emerald-900/30 text-emerald-300";
    case "overhead":
      return "border-rose-900/50 bg-rose-900/30 text-rose-300";
    case "tax":
      return "border-red-900/50 bg-red-900/30 text-red-300";
    case "other":
    default:
      return "border-[#27272a] bg-[#27272a] text-[#fafafa]";
  }
}

export function getStatusLabel(status: ExpenseStatus): string {
  switch (status) {
    case "pending":
      return "Chờ thanh toán";
    case "paid":
      return "Đã thanh toán";
    case "void":
      return "Đã huỷ";
    default:
      return status;
  }
}

/**
 * Status chip styling.
 */
export function getStatusChipClass(status: ExpenseStatus): string {
  switch (status) {
    case "paid":
      return "border-emerald-900/50 bg-emerald-900/30 text-emerald-300";
    case "pending":
      return "border-amber-900/50 bg-amber-900/30 text-amber-300";
    case "void":
      return "border-red-900/50 bg-red-900/30 text-red-300";
    default:
      return "border-[#27272a] bg-[#27272a] text-[#fafafa]";
  }
}