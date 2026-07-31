import type { ActivityAction, ActivityLevel } from "@/types";

/**
 * Vietnamese label for each canonical activity level. Used in the
 * "Mức độ" chip column of the activity log table.
 */
export function getLevelLabel(level: ActivityLevel): string {
  switch (level) {
    case "info":
      return "Thông tin";
    case "warning":
      return "Cảnh báo";
    case "critical":
      return "Nghiêm trọng";
    default:
      return level;
  }
}

/**
 * Tailwind classes for the activity level chip. Matches the dark
 * LuxeOps palette: cool surface for info, amber for warning, red for
 * critical.
 */
export function getLevelChipClass(level: ActivityLevel): string {
  switch (level) {
    case "warning":
      return "border-amber-900/50 bg-amber-900/30 text-amber-300";
    case "critical":
      return "border-red-900/50 bg-red-900/30 text-red-300";
    case "info":
    default:
      return "border-[#3f3f46] bg-[#27272a] text-[#e4e4e7]";
  }
}

/**
 * Vietnamese label for each canonical activity action.
 */
export function getActionLabel(action: ActivityAction): string {
  switch (action) {
    case "create":
      return "Tạo";
    case "update":
      return "Cập nhật";
    case "delete":
      return "Xóa";
    case "login":
      return "Đăng nhập";
    case "logout":
      return "Đăng xuất";
    case "payment":
      return "Thanh toán";
    case "settings":
      return "Cài đặt";
    case "alert":
      return "Cảnh báo";
    case "backup":
      return "Sao lưu";
    case "shipment":
      return "Vận chuyển";
    case "other":
    default:
      return "Khác";
  }
}
