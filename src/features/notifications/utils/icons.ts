import {
  Bell,
  Package,
  ShoppingBag,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Notification } from "@/types";

/**
 * Map a notification category to the Lucide icon shown in the feed
 * bubble. The icon is rendered inside a small circular badge whose
 * colour matches the category's semantic state.
 */
export function getNotificationIcon(category: Notification["category"]): LucideIcon {
  switch (category) {
    case "order":
      return ShoppingBag;
    case "inventory":
      return Package;
    case "customer":
      return Users;
    case "shipping":
      return Truck;
    case "cost":
      return Wallet;
    case "system":
    default:
      return Bell;
  }
}

/**
 * Vietnamese label for each notification category. Used for the
 * small chip at the bottom of each row in the feed.
 */
export function getNotificationCategoryLabel(
  category: Notification["category"],
): string {
  switch (category) {
    case "order":
      return "Đơn hàng";
    case "inventory":
      return "Tồn kho";
    case "customer":
      return "Khách hàng";
    case "shipping":
      return "Vận chuyển";
    case "cost":
      return "Chi phí";
    case "system":
    default:
      return "Hệ thống";
  }
}