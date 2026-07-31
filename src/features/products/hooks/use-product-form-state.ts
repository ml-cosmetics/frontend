/**
 * Re-export of the shared CRUD form-keyboard shortcuts hook. The
 * original implementation lived in `features/products`; it has been
 * lifted into `components/common/crud` so other features can reuse
 * it. This shim keeps the historical import path working.
 */
export {
  useCrudFormKeyboard as useProductFormState,
  type CrudFormKeyboardOptions as ProductFormKeyboardOptions,
} from "@/components/common/crud/use-crud-form-keyboard";