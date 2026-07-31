/**
 * Shared CRUD building blocks.
 *
 * Originally lifted out of the Product feature so Category (and any
 * future entity) can reuse them without duplicating code. The
 * Product form / table still consumes these primitives, just via
 * the shared location.
 *
 * Exports:
 *   - CrudForm        – React Hook Form + zod wrapper with shared
 *                       dirty-state guard, keyboard shortcuts and
 *                       loading overlay
 *   - CrudField       – single labelled input row
 *   - generateSlug    – Vietnamese-safe slug generator
 *   - CrudFilterBar   – list-page toolbar (filters + actions)
 *   - CrudListShell   – loading / error / data wrapper
 *   - useDebouncedValue
 *   - DeleteEntityDialog
 *   - useUnsavedChangesGuard
 *   - useCrudFormKeyboard
 */
export {
  CrudForm,
  CrudField,
  generateSlug,
  type CrudFormProps,
  type CrudFormRenderProps,
  type CrudFieldProps,
} from "./crud-form";

export {
  CrudFilterBar,
  CrudListShell,
  useDebouncedValue,
  type CrudFilterBarProps,
  type CrudListShellProps,
  type UseDebouncedValueArgs,
} from "./crud-toolbar";

export { DeleteEntityDialog, type DeleteEntityDialogProps } from "./delete-entity-dialog";
export { useUnsavedChangesGuard } from "./use-unsaved-changes-guard";
export {
  useCrudFormKeyboard,
  type CrudFormKeyboardOptions,
} from "./use-crud-form-keyboard";

export { EntityActionMenu } from "./entity-action-menu";

export {
  CrudStatusFilter,
  type CrudStatusFilterProps,
  type CrudStatusFilterOption,
} from "./crud-status-filter";

export {
  StockBadge,
  getStockStatus,
  getStatusLabel,
  type StockBadgeProps,
  type StockStatus,
  type StockThresholdConfig,
} from "./stock-badge";

export {
  DateRangeText,
  type DateRangeTextProps,
  type DateRangeDisplay,
} from "./date-range-text";