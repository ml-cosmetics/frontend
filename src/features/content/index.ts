/**
 * Content Management Feature.
 *
 * Provides editable content cards for website content management.
 *
 * Backend APIs (see `lib/api/content.ts`):
 *   GET /content              (list all sections)
 *   GET /content/:key         (single section)
 *   PUT /admin/content/:key  (update)
 *
 * Pages:
 *   /admin/content            — card grid with inline edit dialog
 */
export * from "./api";
export * from "./hooks";
export { ContentPage } from "./components/content-page";
