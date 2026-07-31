/**
 * Feature: customers
 * ----------------------------------------------------------------------
 * The customers feature owns the typed HTTP module, React Query hooks,
 * schema, and the three admin pages (list / new / edit).
 *
 * Module layout:
 *   ./api/             — typed HTTP client
 *   ./hooks/           — React Query hooks
 *   ./components/      — UI building blocks (table, form)
 *   ./schema.ts        — shared zod schema
 */

export { customersApi } from "./api";
export type { ListCustomersParams } from "./api";

export {
  useCustomerList,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useCustomerListUrlState,
} from "./hooks";
export type { CustomerListUrlState } from "./hooks";

export {
  buildCustomerColumns,
  type CustomerListRow,
  type BuildCustomerColumnsArgs,
} from "./components/columns";

export { CustomerListTable } from "./components/table";
export { CustomerDetailView } from "./components/customer-detail-view";

export { CustomerForm } from "./components/form";
export type { CustomerFormProps } from "./components/form";

export {
  customerFormSchema,
  customerToFormDefaults,
  formToCreateInput,
  formToUpdateInput,
  type CustomerFormValues,
} from "./schema";
