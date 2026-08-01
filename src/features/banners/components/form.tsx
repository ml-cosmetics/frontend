"use client";

import * as React from "react";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CrudForm, CrudField } from "@/components/common/crud";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { ID } from "@/types";
import type { BannerFormValues } from "../schema";
import {
  bannerFormSchema,
  bannerToFormDefaults,
  formToCreateInput,
  formToUpdateInput,
} from "../schema";
import { useBanner } from "../hooks/use-banner";
import { useCreateBanner } from "../hooks/use-create-banner";
import { useUpdateBanner } from "../hooks/use-update-banner";
import { BannerImageUpload } from "./banner-image-upload";

export interface BannerFormProps {
  bannerId?: ID;
  initialValues?: Partial<BannerFormValues>;
}

export function BannerForm({ bannerId, initialValues }: BannerFormProps) {
  const isEdit = Boolean(bannerId);
  const bannerQuery = useBanner(bannerId);
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();

  const defaults = React.useMemo<BannerFormValues>(() => {
    if (initialValues) {
      return {
        title: initialValues.title ?? "",
        subtitle: initialValues.subtitle ?? null,
        image_key: initialValues.image_key ?? "",
        image_url: initialValues.image_url ?? "",
        link: initialValues.link ?? "",
        position: initialValues.position ?? 0,
        is_active: initialValues.is_active ?? true,
        starts_at: initialValues.starts_at ?? null,
        ends_at: initialValues.ends_at ?? null,
      };
    }
    if (bannerQuery.data) {
      return bannerToFormDefaults(bannerQuery.data);
    }
    return {
      title: "",
      subtitle: null,
      image_key: "",
      image_url: "",
      link: "",
      position: 0,
      is_active: true,
      starts_at: null,
      ends_at: null,
    };
  }, [initialValues, bannerQuery.data]);

  const typedSchema = bannerFormSchema as unknown as z.ZodType<
    BannerFormValues,
    z.ZodTypeDef,
    BannerFormValues
  >;

  return (
    <CrudForm<BannerFormValues>
      schema={typedSchema}
      defaultValues={defaults}
      mode={isEdit ? "edit" : "create"}
      title={isEdit ? "Chỉnh sửa banner" : "Tạo banner mới"}
      description="Thông tin banner hiển thị trên trang chủ."
      redirectTo="/admin/banners"
      cancelTo="/admin/banners"
      submitLabel={isEdit ? "Lưu thay đổi" : "Tạo banner"}
      onSubmit={async (values) => {
        if (isEdit && bannerId) {
          return updateBanner.mutateAsync({
            id: bannerId,
            input: formToUpdateInput(values),
          });
        }
        return createBanner.mutateAsync(formToCreateInput(values));
      }}
      renderFields={({ methods, submitting }) => (
        <BannerFormFields methods={methods} submitting={submitting} bannerData={bannerQuery.data} />
      )}
    />
  );
}

function BannerFormFields({
  methods,
  submitting,
  bannerData,
}: {
  methods: UseFormReturn<BannerFormValues>;
  submitting: boolean;
  bannerData: ReturnType<typeof useBanner>["data"];
}) {
  const { reset } = methods;

  // Reset form fields once the banner query resolves.
  useEffect(() => {
    if (!bannerData) return;
    reset(bannerToFormDefaults(bannerData));
  }, [bannerData, reset]);

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
        <BannerImageUpload
          imageUrl={imageUrl}
          onChange={(key, url) => {
            setValue("image_key", key, { shouldDirty: true });
            setValue("image_url", url, { shouldDirty: true });
          }}
          onClear={() => {
            setValue("image_key", "", { shouldDirty: true });
            setValue("image_url", "", { shouldDirty: true });
          }}
          disabled={submitting}
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

      <CrudField id="link" label="URL Đích" hint={errors.link?.message}>
        <Input
          id="link"
          type="url"
          placeholder="https://ml-cosmetics.store/..."
          autoComplete="off"
          {...register("link")}
          disabled={submitting}
          aria-invalid={Boolean(errors.link) || undefined}
        />
      </CrudField>

      <div className="grid gap-5 md:grid-cols-3">
        <CrudField id="position" label="Vị trí" required hint={errors.position?.message}>
          <Input
            id="position"
            type="number"
            min={0}
            step={1}
            {...register("position")}
            disabled={submitting}
            aria-invalid={Boolean(errors.position) || undefined}
          />
        </CrudField>

        <CrudField id="starts_at" label="Ngày bắt đầu" hint={errors.starts_at?.message}>
          <Input
            id="starts_at"
            type="date"
            {...register("starts_at")}
            disabled={submitting}
            aria-invalid={Boolean(errors.starts_at) || undefined}
          />
        </CrudField>

        <CrudField id="ends_at" label="Ngày kết thúc" hint={errors.ends_at?.message}>
          <Input
            id="ends_at"
            type="date"
            {...register("ends_at")}
            disabled={submitting}
            aria-invalid={Boolean(errors.ends_at) || undefined}
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
                aria-label="Kích hoạt banner"
              />
            )}
          />
          <Label htmlFor="is_active" className="text-[14px] font-normal cursor-pointer">
            Banner sẽ hiển thị khi đang hoạt động
          </Label>
        </div>
      </CrudField>
    </div>
  );
}
