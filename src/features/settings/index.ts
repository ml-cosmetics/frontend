/**
 * Settings Feature.
 *
 * Singleton settings management for the website:
 *   GET /settings                — read settings
 *   PUT /admin/settings          — update all settings
 *   POST /admin/settings/logo    — upload logo
 *   POST /admin/settings/favicon — upload favicon
 *
 * Image workflow:
 *   1. User selects file
 *   2. Upload immediately (POST /admin/settings/logo or favicon)
 *   3. Receive { key, url }
 *   4. Store key in local state, show url preview
 *   5. On form submit, include logo_key/favicon_key in PUT payload
 */
export * from "./api";
export * from "./hooks";
export { SettingsForm } from "./components/form";
