import { z } from "zod";
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from "@/types";

export const customerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên khách hàng là bắt buộc.")
    .max(160),
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ.")
    .or(z.literal(""))
    .optional()
    .default(""),
  phone: z.string().trim().max(20).optional().default(""),
  facebook: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  address: z.string().trim().max(500).optional().or(z.literal("")).default(""),
  note: z.string().trim().max(1000).optional().or(z.literal("")).default(""),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export function customerToFormDefaults(customer: Customer): CustomerFormValues {
  return {
    name: customer.full_name ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    facebook: customer.facebook ?? "",
    address: customer.address ?? "",
    note: customer.note ?? "",
  };
}

export function formToCreateInput(values: CustomerFormValues): CreateCustomerInput {
  return {
    full_name: values.name.trim(),
    phone: values.phone?.trim() || "",
    email: values.email?.trim() || null,
    facebook: values.facebook?.trim() || null,
    address: values.address?.trim() || null,
    note: values.note?.trim() || null,
  };
}

export function formToUpdateInput(values: CustomerFormValues): UpdateCustomerInput {
  return {
    full_name: values.name.trim(),
    email: values.email?.trim() || null,
    facebook: values.facebook?.trim() || null,
    address: values.address?.trim() || null,
    note: values.note?.trim() || null,
  };
}
