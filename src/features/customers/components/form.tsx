"use client";

import * as React from "react";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CrudField, CrudForm } from "@/components/common/crud";
import type { ID } from "@/types";
import type { z } from "zod";
import type { UseFormReturn } from "react-hook-form";
import {
  customerFormSchema,
  customerToFormDefaults,
  formToCreateInput,
  formToUpdateInput,
  type CustomerFormValues,
} from "../schema";
import { useCreateCustomer } from "../hooks/use-create-customer";
import { useUpdateCustomer } from "../hooks/use-update-customer";
import { useCustomer } from "../hooks/use-customer";

/**
 * `CustomerForm` — create / edit form for customers.
 *
 * Reuses `CrudForm` + `CrudField` for the shared dirty-state guard,
 * keyboard shortcuts, and LoadingOverlay. The submit handler is
 * wired to the create / update mutations; on success the form
 * redirects to the list page.
 */
export interface CustomerFormProps {
  customerId?: ID;
  initialValues?: Partial<CustomerFormValues>;
}

export function CustomerForm({ customerId, initialValues }: CustomerFormProps) {
  const isEdit = Boolean(customerId);
  const customerQuery = useCustomer(customerId);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const defaults = React.useMemo<CustomerFormValues>(() => {
    if (initialValues) {
      return {
        name: initialValues.name ?? "",
        email: initialValues.email ?? "",
        phone: initialValues.phone ?? "",
        facebook: initialValues.facebook ?? "",
        address: initialValues.address ?? "",
        note: initialValues.note ?? "",
      };
    }
    if (customerQuery.data) {
      return customerToFormDefaults(customerQuery.data);
    }
    return {
      name: "",
      email: "",
      phone: "",
      facebook: "",
      address: "",
      note: "",
    };
  }, [initialValues, customerQuery.data]);

  const typedSchema = customerFormSchema as unknown as z.ZodType<
    CustomerFormValues,
    z.ZodTypeDef,
    CustomerFormValues
  >;

  return (
    <div className="text-foreground [&_section]:border-hairline [&_section]:bg-card text-[14px] leading-[1.6] [&_section]:rounded-xl [&_section>header_h2]:text-[18px] [&_section>header_h2]:leading-[1.3] [&_section>header_h2]:font-semibold">
      <CrudForm<CustomerFormValues>
        schema={typedSchema}
        defaultValues={defaults}
        mode={isEdit ? "edit" : "create"}
        title={isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
        description="Thông tin khách hàng."
        redirectTo="/admin/customers"
        cancelTo="/admin/customers"
        submitLabel={isEdit ? "Lưu thay đổi" : "Tạo khách hàng"}
        onSubmit={async (values) => {
          if (isEdit && customerId) {
            return updateCustomer.mutateAsync({
              id: customerId,
              input: formToUpdateInput(values),
            });
          }
          return createCustomer.mutateAsync(formToCreateInput(values));
        }}
        renderFields={({ methods, submitting }) => (
          <CustomerFormFields methods={methods} submitting={submitting} customerData={customerQuery.data} />
        )}
      />
    </div>
  );
}

/**
 * `CustomerFormFields` — field markup. Lives in its own component so
 * that all `register` calls happen at the top level of a React
 * function component (no hook-inside-render-callback).
 */
function CustomerFormFields({
  methods,
  submitting,
  customerData,
}: {
  methods: UseFormReturn<CustomerFormValues>;
  submitting: boolean;
  customerData: ReturnType<typeof useCustomer>["data"];
}) {
  const { reset } = methods;

  // Reset form fields once the customer query resolves.
  useEffect(() => {
    if (!customerData) return;
    reset(customerToFormDefaults(customerData));
  }, [customerData, reset]);

  const { register, formState } = methods;
  const errors = formState.errors;

  return (
    <div className="text-foreground grid gap-4 text-[14px] leading-[1.6]">
      <CrudField id="name" label="Tên khách hàng" required hint={errors.name?.message}>
        <Input
          id="name"
          autoComplete="off"
          {...register("name")}
          disabled={submitting}
          aria-invalid={Boolean(errors.name) || undefined}
        />
      </CrudField>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudField id="email" label="Email" hint={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="off"
            {...register("email")}
            disabled={submitting}
            aria-invalid={Boolean(errors.email) || undefined}
          />
        </CrudField>

        <CrudField id="phone" label="Số điện thoại" hint={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            autoComplete="off"
            {...register("phone")}
            disabled={submitting}
          />
        </CrudField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudField id="facebook" label="Facebook" hint={errors.facebook?.message}>
          <Input
            id="facebook"
            autoComplete="off"
            placeholder="Facebook"
            {...register("facebook")}
            disabled={submitting}
          />
        </CrudField>
      </div>

      <CrudField id="address" label="Địa chỉ" hint={errors.address?.message}>
        <Textarea
          id="address"
          rows={3}
          placeholder="Địa chỉ giao hàng"
          {...register("address")}
          disabled={submitting}
        />
      </CrudField>

      <CrudField id="note" label="Ghi chú" hint={errors.note?.message}>
        <Textarea
          id="note"
          rows={3}
          placeholder="Ghi chú về khách hàng"
          {...register("note")}
          disabled={submitting}
        />
      </CrudField>
    </div>
  );
}
