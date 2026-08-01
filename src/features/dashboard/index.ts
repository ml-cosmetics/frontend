/**
 * Dashboard Feature.
 *
 * Admin overview page backed by four endpoints:
 *   GET /admin/dashboard               — KPI summary
 *   GET /admin/reports/top-products    (used by Top Products widget)
 *   GET /admin/reports/low-stock       (used by Low Stock widget)
 *   GET /admin/reports/recent-orders   (used by Recent Orders widget)
 *
 * The `/admin/reports` page itself has been removed; the underlying
 * report endpoints remain so the dashboard widgets keep working.
 */
export * from "./api";
export * from "./hooks";
export { DashboardPage } from "./components/dashboard-page";
