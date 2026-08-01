/**
 * Settings Feature.
 *
 * Singleton settings management for the website:
 *   GET  /v1/settings          — read settings (public)
 *   PUT  /v1/admin/settings    — update all settings (admin)
 *   POST /v1/admin/upload      — upload logo / favicon (admin, generic upload)
 *
 * Image workflow:
 *   1. User selects file
 *   2. Upload via POST /admin/upload → { object_key, url }
 *   3. Map object_key → key; show url as preview
 *   4. On form submit, include logo_key/favicon_key in PUT payload
 */
export * from "./api";
export * from "./hooks";
export { SettingsForm } from "./components/form";
