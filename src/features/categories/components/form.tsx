"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CrudField, CrudForm, generateSlug } from "@/components/common/crud";
import type { z } from "zod";
import {
  categoryFormSchema,
  categoryToFormDefaults,
  formToCreateInput,
  formToUpdateInput,
  type CategoryFormValues,
} from "../schema";
import { useCreateCategory } from "../hooks/use-create-category";
import { useUpdateCategory } from "../hooks/use-update-category";
import { useCategory } from "../hooks/use-category";

export interface CategoryFormProps {
  categoryId?: string;
  initialValues?: Partial<CategoryFormValues>;
}

export function CategoryForm({ categoryId, initialValues }: CategoryFormProps) {
  const isEdit = Boolean(categoryId);
  const categoryQuery = useCategory(categoryId);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const slugEditedRef = useRef(false);

  const defaults = React.useMemo<CategoryFormValues>(() => {
    if (initialValues) {
      return {
        name: initialValues.name ?? "",
        slug: initialValues.slug ?? "",
        description: initialValues.description ?? "",
        is_active: initialValues.is_active ?? true,
      };
    }
    if (categoryQuery.data) {
      return categoryToFormDefaults(categoryQuery.data);
    }
    return { name: "", slug: "", description: "", is_active: true };
  }, [initialValues, categoryQuery.data]);

  const typedSchema = categoryFormSchema as unknown as z.ZodType<
    CategoryFormValues,
    z.ZodTypeDef,
    CategoryFormValues
  >;

  return (
    <CrudForm<CategoryFormValues>
      schema={typedSchema}
      defaultValues={defaults}
      mode={isEdit ? "edit" : "create"}
      title={isEdit ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
      description="Thông tin danh mục dùng để phân loại sản phẩm."
      redirectTo="/admin/categories"
      cancelTo="/admin/categories"
      submitLabel={isEdit ? "Lưu thay đổi" : "Tạo danh mục"}
      onSubmit={async (values) => {
        if (isEdit && categoryId) {
          return updateCategory.mutateAsync({
            id: categoryId,
            input: formToUpdateInput(values),
          });
        }
        return createCategory.mutateAsync(formToCreateInput(values));
      }}
      renderFields={({ methods, submitting }) => {
        return (
          <CategoryFormFields
            methods={methods}
            submitting={submitting}
            isEdit={isEdit}
            slugEditedRef={slugEditedRef}
            categoryData={categoryQuery.data}
          />
        );
      }}
    />
  );
}

function CategoryFormFields({
  methods,
  submitting,
  isEdit,
  slugEditedRef,
  categoryData,
}: {
  methods: UseFormReturn<CategoryFormValues>;
  submitting: boolean;
  isEdit: boolean;
  slugEditedRef: React.MutableRefObject<boolean>;
  categoryData: ReturnType<typeof useCategory>["data"];
}) {
  const { reset } = methods;

  // Reset form fields once the category query resolves.
  useEffect(() => {
    if (!categoryData) return;
    reset(categoryToFormDefaults(categoryData));
  }, [categoryData, reset]);

  const { register, control, formState, watch, setValue } = methods;
  const errors = formState.errors;

  const name = watch("name");
  const slugValue = watch("slug");

  useEffect(() => {
    if (isEdit || slugEditedRef.current) return;
    const next = generateSlug(name);
    if (next && next !== slugValue) {
      setValue("slug", next, { shouldDirty: false, shouldTouch: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, slugValue, setValue]);

  return (
    <div className="grid gap-5">
      <CrudField id="name" label="Tên danh mục" required hint={errors.name?.message}>
        <Input
          id="name"
          autoComplete="off"
          {...register("name")}
          disabled={submitting}
          aria-invalid={Boolean(errors.name) || undefined}
        />
      </CrudField>

      <CrudField
        id="slug"
        label="Slug (URL)"
        required
        hint={errors.slug?.message}
        right={
          !isEdit && !slugEditedRef.current ? (
            <Badge variant="secondary" className="rounded-full">
              Tự sinh
            </Badge>
          ) : null
        }
      >
        <Controller
          control={control}
          name="slug"
          render={({ field }) => (
            <Input
              id="slug"
              autoComplete="off"
              value={field.value ?? ""}
              onChange={(event) => {
                slugEditedRef.current = true;
                field.onChange(event);
              }}
              onBlur={field.onBlur}
              disabled={submitting || isEdit}
              aria-invalid={Boolean(errors.slug) || undefined}
            />
          )}
        />
      </CrudField>

      <CrudField id="description" label="Mô tả" hint={errors.description?.message}>
        <Textarea
          id="description"
          rows={4}
          placeholder="Mô tả danh mục…"
          {...register("description")}
          disabled={submitting}
        />
      </CrudField>

      <CrudField
        id="is_active"
        label="Hiển thị trên cửa hàng"
        hint={errors.is_active?.message}
        right={
          <span className="text-[14px] text-muted-foreground">
            {watch("is_active") ? "Hiển thị" : "Ẩn"}
          </span>
        }
      >
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
              disabled={submitting}
              aria-label="Hiển thị danh mục"
            />
          )}
        />
      </CrudField>
    </div>
  );
}
