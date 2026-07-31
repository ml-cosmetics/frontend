import type {
  PermissionAction,
  PermissionModule,
} from "@/types";

/**
 * Vietnamese label for each permission module. Used as the row
 * label in the permission matrix.
 */
export function getModuleLabel(module: PermissionModule): string {
  switch (module) {
    case "products":
      return "Sản phẩm";
    case "categories":
      return "Danh mục";
    case "inventory":
      return "Tồn kho";
    case "orders":
      return "Đơn hàng";
    case "customers":
      return "Khách hàng";
    case "shipping":
      return "Vận chuyển";
    case "content":
      return "Nội dung";
    case "banners":
      return "Banner";
    case "media":
      return "Media";
    case "settings":
      return "Cài đặt";
    case "permissions":
      return "Phân quyền";
    case "costs":
      return "Chi phí";
    case "notifications":
      return "Thông báo";
    default:
      return module;
  }
}

/**
 * Vietnamese label for each permission action column header.
 */
export function getActionLabel(action: PermissionAction): string {
  switch (action) {
    case "view":
      return "Xem";
    case "create":
      return "Tạo";
    case "update":
      return "Sửa";
    case "delete":
      return "Xóa";
    case "approve":
      return "Duyệt";
    default:
      return action;
  }
}

/**
 * Canonical ordering of actions in the matrix.
 */
export const PERMISSION_ACTIONS: PermissionAction[] = [
  "view",
  "create",
  "update",
  "delete",
  "approve",
];

/**
 * Canonical ordering of modules in the matrix.
 */
export const PERMISSION_MODULES: PermissionModule[] = [
  "products",
  "categories",
  "inventory",
  "orders",
  "customers",
  "shipping",
  "content",
  "banners",
  "media",
  "settings",
  "permissions",
  "costs",
  "notifications",
];