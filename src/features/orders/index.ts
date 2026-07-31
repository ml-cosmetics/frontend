/**
 * `features/orders` — Order Management feature barrel.
 *
 * Exports:
 *   - `ordersApi` from `./api`
 *   - `useOrders`, `useOrder`, `useUpdateOrderStatus`, `useCreateOrder` from `./hooks`
 *   - `OrderStatusBadge`, `OrderListTable`, `OrderDetailView`, `StatusUpdateDialog`,
 *     `CreateOrderDialog` from `./components`
 */
export { ordersApi } from "./api";
export { useOrders, useOrder, useUpdateOrderStatus, useCreateOrder } from "./hooks";

export { OrderStatusBadge } from "./components/order-status-badge";
export { OrderListTable } from "./components/order-list-table";
export { OrderDetailView } from "./components/order-detail-view";
export { StatusUpdateDialog, CancelOrderDialog } from "./components/status-update-dialog";
export { CreateOrderDialog } from "./components/create-order-dialog";
