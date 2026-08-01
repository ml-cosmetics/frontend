"use client";

import * as React from "react";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CrudForm, CrudField } from "@/components/common/crud";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { ID } from "@/types";
import type { FeaturedCollectionFormValues } from "../schema";
import {
  featuredCollectionFormSchema,
  featuredCollectionToFormDefaults,
  formToCreateInput,
  formToUpdateInput,
} from "../schema";
import { useFeaturedCollection } from "../hooks/use-featured-collection";
import { useCreateFeaturedCollection } from "../hooks/use-create-featured-collection";
import { useUpdateFeaturedCollection } from "../hooks/use-update-featured-collection";
import { useSetFeaturedCollectionItems } from "../hooks/use-set-featured-collection-items";
import { useUploadFeaturedCollectionImage } from "../hooks/use-upload-featured-collection-image";
import { FeaturedCollectionImageUpload } from "./featured-collection-image-upload";
import {
  ProductPicker,
  SelectedProductList,
} from "./product-picker";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

export interface FeaturedCollectionFormProps {
  collectionId?: ID;
}

export function FeaturedCollectionForm({ collectionId }: FeaturedCollectionFormProps) {
  const isEdit = Boolean(collectionId);
  const collectionQuery = useFeaturedCollection(collectionId);
  const createCollection = useCreateFeaturedCollection();
  const updateCollection = useUpdateFeaturedCollection();
  const upload = useUploadFeaturedCollectionImage();

  // --- Product picker state (edit mode only — create mode is empty) ---
  const [productIds, setProductIds] = React.useState<ID[]>([]);
  const [itemsLoaded, setItemsLoaded] = React.useState(false);
  const setItemsMutation = useSetFeaturedCollectionItems();

  // Hydrate the product list from the server response on edit.
  React.useEffect(() => {
    if (!collectionQuery.data) return;
    setProductIds(collectionQuery.data.items.map((it) => it.product.id));
    setItemsLoaded(true);
  }, [collectionQuery.data]);

  const defaults = React.useMemo<FeaturedCollectionFormValues>(() => {
    if (collectionQuery.data) {
      return featuredCollectionToFormDefaults(collectionQuery.data);
    }
    return {
      slug: "",
      title: "",
      subtitle: null,
      image_key: "",
      image_url: "",
      layout: "bento",
      is_active: true,
      sort_order: 0,
    };
  }, [collectionQuery.data]);

  const typedSchema = featuredCollectionFormSchema as unknown as z.ZodType<
    FeaturedCollectionFormValues,
    z.ZodTypeDef,
    FeaturedCollectionFormValues
  >;

  const handleProductIdsChange = React.useCallback(
    (nextIds: ID[]) => {
      if (!collectionId) {
        // Create mode: keep state local until first save.
        setProductIds(nextIds);
        return;
      }
      setProductIds(nextIds);
      setItemsMutation.mutate({
        id: collectionId,
        input: { product_ids: nextIds },
      });
    },
    [collectionId, setItemsMutation],
  );

  return (
    <CrudForm<FeaturedCollectionFormValues>
      schema={typedSchema}
      defaultValues={defaults}
      mode={isEdit ? "edit" : "create"}
      title={isEdit ? "Chỉnh sửa bộ sưu tập" : "Tạo bộ sưu tập"}
      description="Bộ sưu tập nổi bật sẽ hiển thị ở trang chủ trong phần 'Bộ sưu tập nổi bật'."
      redirectTo="/admin/featured-collections"
      cancelTo="/admin/featured-collections"
      submitLabel={isEdit ? "Lưu thay đổi" : "Tạo bộ sưu tập"}
      onSubmit={async (values) => {
        if (isEdit && collectionId) {
          await updateCollection.mutateAsync({
            id: collectionId,
            input: formToUpdateInput(values),
          });
          return { id: collectionId };
        }
        const created = await createCollection.mutateAsync(
          formToCreateInput(values),
        );
        // After a successful create we land in edit mode with the
        // freshly-created id so the admin can immediately pick
        // products. Pre-seed the picker so the change is reflected
        // when the page swaps.
        if (created?.id) {
          setProductIds([]);
        }
        return created;
      }}
      sidePanel={
        <ProductPickerSidePanel
          collectionId={collectionId}
          productIds={productIds}
          onProductIdsChange={handleProductIdsChange}
          itemsLoaded={itemsLoaded}
          savingItems={setItemsMutation.isPending}
        />
      }
      renderFields={({ methods, submitting }) => (
        <FeaturedCollectionFormFields
          methods={methods}
          submitting={submitting}
          uploadFn={async (file) => {
            if (file.size > MAX_FILE_SIZE) {
              throw new Error("Kích thước ảnh tối đa là 30 MB");
            }
            const result = await upload.mutateAsync(file);
            return { image_key: result.object_key, image_url: result.url };
          }}
          uploading={upload.isPending}
          collectionData={collectionQuery.data}
        />
      )}
    />
  );
}

function FeaturedCollectionFormFields({
  methods,
  submitting,
  uploadFn,
  uploading,
  collectionData,
}: {
  methods: UseFormReturn<FeaturedCollectionFormValues>;
  submitting: boolean;
  uploadFn: (file: File) => Promise<{ image_key: string; image_url: string }>;
  uploading: boolean;
  collectionData: ReturnType<typeof useFeaturedCollection>["data"];
}) {
  const { reset } = methods;

  // Reset form fields once the collection query resolves.
  useEffect(() => {
    if (!collectionData) return;
    reset(featuredCollectionToFormDefaults(collectionData));
  }, [collectionData, reset]);

  const {
    register,
    control,
    formState,
    watch,
    setValue,
  } = methods;
  const errors = formState.errors;

  const imageUrl = watch("image_url");

  return (
    <div className="grid gap-5">
      <CrudField id="image_key" label="Hình ảnh" required hint={errors.image_key?.message}>
        <FeaturedCollectionImageUpload
          imageUrl={imageUrl}
          onChange={(key, url) => {
            setValue("image_key", key, { shouldDirty: true });
            setValue("image_url", url, { shouldDirty: true });
          }}
          onClear={() => {
            setValue("image_key", "", { shouldDirty: true });
            setValue("image_url", "", { shouldDirty: true });
          }}
          disabled={submitting || uploading}
          upload={uploadFn}
          error={errors.image_key?.message}
        />
      </CrudField>

      <CrudField id="title" label="Tiêu đề" required hint={errors.title?.message}>
        <Input
          id="title"
          autoComplete="off"
          {...register("title")}
          disabled={submitting}
          aria-invalid={Boolean(errors.title) || undefined}
        />
      </CrudField>

      <CrudField id="subtitle" label="Phụ đề" hint={errors.subtitle?.message}>
        <Input
          id="subtitle"
          autoComplete="off"
          {...register("subtitle")}
          disabled={submitting}
          aria-invalid={Boolean(errors.subtitle) || undefined}
        />
      </CrudField>

      <CrudField id="slug" label="Slug (URL)" hint={errors.slug?.message ?? "Để trống để tự sinh từ tiêu đề."}>
        <Input
          id="slug"
          autoComplete="off"
          {...register("slug")}
          disabled={submitting}
          aria-invalid={Boolean(errors.slug) || undefined}
          placeholder="vi-du: bo-suu-tap-jadeite"
        />
      </CrudField>

      <CrudField id="layout" label="Bố cục" hint={errors.layout?.message}>
        <Controller
          control={control}
          name="layout"
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LayoutOption
                value="bento"
                label="Bento"
                description="1 sản phẩm lớn + 2 sản phẩm nhỏ xếp dọc (2–3 sản phẩm)"
                selected={field.value === "bento"}
                onSelect={() => field.onChange("bento")}
                disabled={submitting}
              />
              <LayoutOption
                value="grid"
                label="Lưới"
                description="Lưới responsive, tự co nhỏ khi có nhiều sản phẩm (4+ sản phẩm)"
                selected={field.value === "grid"}
                onSelect={() => field.onChange("grid")}
                disabled={submitting}
              />
            </div>
          )}
        />
      </CrudField>

      <div className="grid gap-5 md:grid-cols-2">
        <CrudField id="sort_order" label="Thứ tự" hint={errors.sort_order?.message}>
          <Input
            id="sort_order"
            type="number"
            min={0}
            step={1}
            {...register("sort_order")}
            disabled={submitting}
            aria-invalid={Boolean(errors.sort_order) || undefined}
          />
        </CrudField>
      </div>

      <CrudField id="is_active" label="Kích hoạt" hint={errors.is_active?.message}>
        <div className="flex items-center gap-3">
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={submitting}
                aria-label="Kích hoạt bộ sưu tập"
              />
            )}
          />
          <Label htmlFor="is_active" className="text-[14px] font-normal cursor-pointer">
            Bộ sưu tập sẽ hiển thị trên trang chủ khi đang kích hoạt
          </Label>
        </div>
      </CrudField>
    </div>
  );
}

function LayoutOption({
  value,
  label,
  description,
  selected,
  onSelect,
  disabled,
}: {
  value: "bento" | "grid";
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      data-layout={value}
      className={[
        "rounded-xl border px-4 py-3 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-hairline hover:border-primary/40",
        disabled && "cursor-not-allowed opacity-60",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-[14px] font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </button>
  );
}

function ProductPickerSidePanel({
  collectionId,
  productIds,
  onProductIdsChange,
  itemsLoaded,
  savingItems,
}: {
  collectionId?: ID;
  productIds: ID[];
  onProductIdsChange: (ids: ID[]) => void;
  itemsLoaded: boolean;
  savingItems: boolean;
}) {
  const heading = collectionId ? "Sản phẩm trong bộ sưu tập" : "Sản phẩm (sau khi tạo)";
  return (
    <aside
      aria-label="Dashboard products"
      className="space-y-5 rounded-2xl border border-hairline bg-card p-6 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold text-foreground">
            {heading}
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {collectionId
              ? "Mỗi thay đổi được lưu tự động vào bộ sưu tập."
              : "Lưu bộ sưu tập trước, sau đó quay lại để chọn sản phẩm."}
          </p>
        </div>
        {savingItems && (
          <span
            className="flex items-center gap-1 text-[12px] text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            Đang lưu…
          </span>
        )}
      </header>

      {collectionId ? (
        <>
          <SelectedProductList
            ids={productIds}
            onChange={onProductIdsChange}
            disabled={savingItems}
          />
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-muted-foreground">
              {itemsLoaded
                ? `${productIds.length} sản phẩm`
                : "Đang tải sản phẩm…"}
            </p>
            <ProductPicker
              selectedIds={productIds}
              onChange={onProductIdsChange}
              disabled={savingItems}
            />
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-hairline bg-surface-container-low/40 px-4 py-8 text-center text-[13px] text-muted-foreground">
          Bấm <strong>Tạo bộ sưu tập</strong> trước để có thể chọn sản phẩm.
        </div>
      )}
    </aside>
  );
}