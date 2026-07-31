/**
 * Thin re-export of the low-level dashboard + reports APIs so hooks
 * can import from a consistent feature-internal path. The reports
 * API itself is still mounted at `@/lib/api/reports` for the dashboard
 * widgets, but there is no longer a standalone `/admin/reports` page.
 */
export { dashboardApi } from "@/lib/api/dashboard";
export { reportsApi } from "@/lib/api/reports";
