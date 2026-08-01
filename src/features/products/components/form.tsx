"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CrudField, CrudForm, generateSlug } from "@/components/common/crud";
import { ProductStatus } from "@/types";
import type { ID } from "@/types";
import {
  formToCreateInput,
  formToUpdateInput,
  productFormSchema,
  productImagesToKeys,
  productToFormDefaults,
  type ProductFormValues,
} from "../schema";
import type { z } from "zod";
import type { UseFormReturn } from "react-hook-form";
import { StatusBadge } from "./status-badge";
import { ProductImageGallery } from "./gallery";
import { useCreateProduct } from "../hooks/use-create-product";
import { useUpdateProduct } from "../hooks/use-update-product";
import { useProduct } from "../hooks/use-product";
import { useProductImages } from "../hooks/use-product-images";

/**
 * `ProductForm` — create / edit form for products.
 *
 * Reuses `CrudForm` + `CrudField` for the shared dirty-state guard,
 * keyboard shortcuts, and LoadingOverlay. The submit handler is
 * wired to the create / update mutations; on success the form
 * redirects to the edit page (create) or back to the list (update).
 *
 * Image management:
 *   - The gallery lives in the left panel and is fully controlled by
 *     `orderKeys` state here. Pending uploads surface immediately as
 *     `pending:<id>` placeholders.
 *   - On save we send `image_keys` along with the form values when the
 *     order has changed since the last server fetch.
 *   - When no reordering / no uploads happened, we omit `image_keys`
 *     so the PUT is a no-op for the image list.
 */
export interface ProductFormProps {
  productId?: ID;
  initialValues?: Partial<ProductFormValues>;
}

export function ProductForm({ productId, initialValues }: ProductFormProps) {
  const isEdit = Boolean(productId);
  const productQuery = useProduct(productId);
  const imagesQuery = useProductImages(productId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const defaults = React.useMemo<ProductFormValues>(() => {
    if (initialValues) {
      return {
        name: initialValues.name ?? "",
        slug: initialValues.slug ?? "",
        description: initialValues.description ?? "",
        price: initialValues.price ?? 0,
        compare_at: initialValues.compare_at ?? null,
        cost: initialValues.cost ?? null,
        status: initialValues.status ?? ProductStatus.Active,
        initial_quantity: undefined,
      };
    }
    if (productQuery.data) {
      return productToFormDefaults(productQuery.data);
    }
    return {
      name: "",
      slug: "",
      description: "",
      price: 0,
      compare_at: null,
      cost: null,
      status: ProductStatus.Active,
      initial_quantity: undefined,
    };
  }, [initialValues, productQuery.data]);

  /* ---- controlled image order ----
   *
   * `orderKeys` is the source of truth for the visible gallery. It's
   * seeded from the server image list the first time that resolves,
   * and updates whenever the user uploads / reorders / deletes. We
   * track the "last server order" separately so the submit handler
   * can decide whether to ship `image_keys` in the PUT body.
   */
  const [orderKeys, setOrderKeys] = React.useState<string[] | null>(null);
  const [serverOrderKeys, setServerOrderKeys] = React.useState<string[] | null>(null);

  /**
   * Server keys the user has clicked "delete" on but the form
   * hasn't saved yet. The tile stays visible with a "Đã xoá"
   * badge + undo button so accidental deletes are recoverable.
   * On save we filter these out of `input.image_keys`; the
   * backend's `replaceImages` will then drop the corresponding
   * server rows.
   */
  const [stagedForDeletion, setStagedForDeletion] = React.useState<
    Set<string>
  >(() => new Set());

  React.useEffect(() => {
    const data = imagesQuery.data;
    if (!data) return;
    const keys = productImagesToKeys(data);
    setServerOrderKeys(keys);
    // Only seed orderKeys once (the user may have re-ordered since).
    setOrderKeys((current) => current ?? keys);
    // Drop any staged-deletion entries that no longer correspond to
    // a real server key (e.g. after a refetch). Without this the
    // staged set would accumulate stale keys across refreshes.
    setStagedForDeletion((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set<string>();
      for (const k of prev) if (keys.includes(k)) next.add(k);
      return next;
    });
  }, [imagesQuery.data]);

  const orderIsDirty =
    orderKeys !== null &&
    serverOrderKeys !== null &&
    (orderKeys.length !== serverOrderKeys.length ||
      orderKeys.some((k, i) => k !== serverOrderKeys[i]));

  // React Hook Form tracks dirty for fields only — not for the
  // gallery on the left. We mirror RHF's flag via `onDirtyChange`
  // and OR it with `orderIsDirty` plus the staged-deletion flag
  // so the submit button enables when *any* of them change.
  const [rhfIsDirty, setRhfIsDirty] = React.useState(false);
  const handleRhfDirtyChange = React.useCallback((dirty: boolean) => {
    setRhfIsDirty(dirty);
  }, []);
  const stagedIsDirty = stagedForDeletion.size > 0;
  const effectiveIsDirty = rhfIsDirty || orderIsDirty || stagedIsDirty;

  const slugEditedRef = useRef(false);

  const typedSchema = productFormSchema as unknown as z.ZodType<
    ProductFormValues,
    z.ZodTypeDef,
    ProductFormValues
  >;

  return (
    <CrudForm<ProductFormValues>
      schema={typedSchema}
      defaultValues={defaults}
      mode={isEdit ? "edit" : "create"}
      title={isEdit ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
      description="Thông tin sản phẩm hiển thị trên cửa hàng và dashboard."
      redirectTo={isEdit ? "/admin/products" : "/admin/products"}
      cancelTo="/admin/products"
      submitLabel={isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
      isDirty={effectiveIsDirty}
      onDirtyChange={handleRhfDirtyChange}
      onSubmit={async (values) => {
        if (isEdit && productId) {
          const input = formToUpdateInput(values);
          // Build the desired final image list:
          //   - drop `pending:` placeholders (still uploading)
          //   - drop server keys the user marked for deletion
          // The backend's `replaceImages` is destructive — any
          // server key not in this list is removed. That covers
          // both the staged-deletion case (key in
          // `stagedForDeletion`) and the "user uploaded without
          // reordering" case (new key appended to orderKeys).
          if (orderKeys) {
            input.image_keys = orderKeys.filter(
              (k) => !k.startsWith("pending:") && !stagedForDeletion.has(k),
            );
          }
          const result = await updateProduct.mutateAsync({
            id: productId,
            input,
          });
          // Drop staged-deletion entries from `orderKeys` so the
          // tile builder doesn't keep rendering them as ghosts and
          // `orderIsDirty` clears after save. Clearing
          // `stagedForDeletion` here also signals "save complete;
          // undo no longer possible".
          setOrderKeys((current) =>
            current
              ? current.filter((k) => !stagedForDeletion.has(k))
              : current,
          );
          setStagedForDeletion(new Set());
          return result;
        }
        return createProduct.mutateAsync(formToCreateInput(values));
      }}
      leftPanel={
        isEdit && productId && orderKeys ? (
          <ProductImageGallery
            productId={productId}
            orderKeys={orderKeys}
            onOrderChange={setOrderKeys}
            stagedForDeletion={stagedForDeletion}
            onStagedDeletionChange={setStagedForDeletion}
          />
        ) : null
      }
      sidePanelWidth="minmax(0,520px)"
      renderFields={({ methods, submitting }) => (
        <ProductFormFields
          methods={methods}
          submitting={submitting}
          isEdit={isEdit}
          slugEditedRef={slugEditedRef}
          productData={productQuery.data}
        />
      )}
    />
  );
}

/**
 * `ProductFormFields` — field markup. Lives in its own component so
 * that all `watch` / `useEffect` calls happen at the top level of a
 * React function component (no hook-inside-render-callback).
 */
function ProductFormFields({
  methods,
  submitting,
  isEdit,
  slugEditedRef,
  productData,
}: {
  methods: UseFormReturn<ProductFormValues>;
  submitting: boolean;
  isEdit: boolean;
  slugEditedRef: React.MutableRefObject<boolean>;
  productData: ReturnType<typeof useProduct>["data"];
}) {
  const { reset } = methods;

  // Reset form fields once the product query resolves.
  useEffect(() => {
    if (!productData) return;
    reset(productToFormDefaults(productData));
  }, [productData, reset]);

  const {
    register,
    control,
    formState,
    watch,
    setValue,
  } = methods;
  const errors = formState.errors;

  // Auto-slug from name until the user edits the field.
  const name = watch("name");
  const slugValue = watch("slug");
  useEffect(() => {
    if (isEdit || slugEditedRef.current) return;
    const next = generateSlug(name);
    if (next && next !== slugValue) {
      setValue("slug", next, { shouldDirty: false, shouldTouch: false });
    }
    // `isEdit` is intentionally omitted — it never changes after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, slugValue, setValue]);

  return (
          <div className="mx-w-3xl space-y-5 text-[14px] leading-[1.6]">
            <CrudField
              id="name"
              label="Tên sản phẩm"
              required
              hint={errors.name?.message}
            >
              <Input
                id="name"
                autoComplete="off"
                {...register("name")}
                disabled={submitting}
                aria-invalid={Boolean(errors.name) || undefined}
                className="text-[14px] leading-[1.6]"
              />
            </CrudField>

            <CrudField
              id="slug"
              label="Slug (URL)"
              required
              hint={errors.slug?.message}
              right={
                !isEdit && !slugEditedRef.current ? (
                  <Badge variant="secondary" className="rounded-full text-[12px] font-semibold uppercase tracking-[0.05em]">
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
                    className="text-[14px] leading-[1.6]"
                  />
                )}
              />
            </CrudField>

            <CrudField
              id="description"
              label="Mô tả"
              hint={errors.description?.message}
            >
              <Textarea
                id="description"
                rows={6}
                placeholder="Mô tả sản phẩm — định dạng, hướng dẫn bảo quản…"
                {...register("description")}
                disabled={submitting}
                className="text-[14px] leading-[1.6]"
              />
            </CrudField>

            <div className="grid gap-5 md:grid-cols-3">
              <CrudField
                id="price"
                label="Giá bán (₫)"
                required
                hint={errors.price?.message}
              >
                <Input
                  id="price"
                  type="number"
                  min={1}
                  step={1000}
                  {...register("price")}
                  disabled={submitting}
                  aria-invalid={Boolean(errors.price) || undefined}
                  className="text-[14px] leading-[1.6]"
                />
              </CrudField>

              <CrudField
                id="compare_at"
                label="Giá so sánh (₫)"
                hint={errors.compare_at?.message}
              >
                <Input
                  id="compare_at"
                  type="number"
                  min={0}
                  step={1000}
                  {...register("compare_at")}
                  disabled={submitting}
                  className="text-[14px] leading-[1.6]"
                />
              </CrudField>

              <CrudField
                id="cost"
                label="Giá vốn (₫)"
                hint={errors.cost?.message}
              >
                <Input
                  id="cost"
                  type="number"
                  min={0}
                  step={1000}
                  {...register("cost")}
                  disabled={submitting}
                  className="text-[14px] leading-[1.6]"
                />
              </CrudField>
            </div>

            {!isEdit && (
              <CrudField
                id="initial_quantity"
                label="Số lượng tồn kho ban đầu"
                hint={
                  errors.initial_quantity?.message ??
                  "Để trống nếu chưa nhập kho — bạn có thể cập nhật sau trong /admin/inventory."
                }
              >
                <Input
                  id="initial_quantity"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  {...register("initial_quantity", { valueAsNumber: true })}
                  disabled={submitting}
                  className="text-[14px] leading-[1.6]"
                />
              </CrudField>
            )}

            <CrudField
              id="status"
              label="Trạng thái"
              hint={errors.status?.message}
            >
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as ProductStatus)
                    }
                  >
                    <SelectTrigger id="status" disabled={submitting} className="text-[14px] leading-[1.6]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductStatus.Active}>
                        <span className="inline-flex items-center gap-2">
                          <StatusBadge status={ProductStatus.Active} />
                          Đang bán
                        </span>
                      </SelectItem>
                      <SelectItem value={ProductStatus.Draft}>
                        <span className="inline-flex items-center gap-2">
                          <StatusBadge status={ProductStatus.Draft} />
                          Bản nháp
                        </span>
                      </SelectItem>
                      <SelectItem value={ProductStatus.Archived}>
                        <span className="inline-flex items-center gap-2">
                          <StatusBadge status={ProductStatus.Archived} />
                          Đã ẩn
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </CrudField>
          </div>
  );
}