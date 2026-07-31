"use client";

import * as React from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { CrudForm, CrudField } from "@/components/common/crud";
import type { UseFormReturn } from "react-hook-form";
import type { ZodType, ZodTypeDef } from "zod";
import type { SettingsFormValues } from "../schema";
import {
  settingsFormSchema,
  settingsToFormDefaults,
  formToUpdateInput,
} from "../schema";
import { useSettings } from "../hooks/use-settings";
import { useUpdateSettings } from "../hooks/use-update-settings";
import { useUploadLogo } from "../hooks/use-upload-logo";
import { useUploadFavicon } from "../hooks/use-upload-favicon";

/* ------------------------------------------------------------------ */
/* ImageUploadField                                                   */
/* ------------------------------------------------------------------ */

interface ImageUploadFieldProps {
  label: string;
  currentUrl?: string | null;
  uploadedUrl?: string | null;
  onUploaded: (key: string, url: string) => void;
  onClear: () => void;
  upload: ReturnType<typeof useUploadLogo>;
  disabled?: boolean;
  hint?: string;
}

function ImageUploadField({
  label,
  currentUrl,
  uploadedUrl,
  onUploaded,
  onClear,
  upload,
  disabled,
  hint,
}: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Show uploaded preview over current; fall back to current URL.
  const previewUrl = uploadedUrl ?? currentUrl;
  const hasImage = Boolean(previewUrl);

  const handleChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const result = await upload.mutateAsync(file);
        onUploaded(result.key, result.url);
      } catch {
        // toast handled by hook
      }
      e.target.value = "";
    },
    [upload, onUploaded],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[14px] font-medium leading-[1.6]">{label}</Label>
        {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={handleChange}
        disabled={disabled || upload.isPending}
        id={`upload-${label.toLowerCase().replace(/\s+/g, "-")}`}
      />

      {hasImage ? (
        <div className="relative overflow-hidden rounded-lg border border-hairline bg-surface-container-high" style={{ height: 80 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl!}
            alt={label}
            className="h-full w-auto object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              disabled={upload.isPending}
              onClick={() => inputRef.current?.click()}
              aria-label={`Thay đổi ${label}`}
            >
              {upload.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              onClick={onClear}
              disabled={disabled}
              aria-label={`Xoá ${label}`}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || upload.isPending}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-hairline bg-surface-container-high py-4 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-surface-container-high",
            disabled && "cursor-not-allowed opacity-50",
          )}
          aria-label={`Tải lên ${label}`}
        >
          {upload.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <UploadCloud className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="text-[14px] font-medium leading-[1.6]">Tải lên</span>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHeader                                                      */
/* ------------------------------------------------------------------ */

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[12px] font-semibold uppercase tracking-[0.05em] leading-[1.4] text-muted-foreground">
      {title}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/* FormFields (inner)                                                */
/* ------------------------------------------------------------------ */

function SettingsFormFields({
  methods,
  submitting,
  settings,
  uploadLogo,
  uploadFavicon,
  logoUrl,
  faviconUrl,
  onLogoUploaded,
  onFaviconUploaded,
  onLogoClear,
  onFaviconClear,
}: {
  methods: UseFormReturn<SettingsFormValues>;
  submitting: boolean;
  settings: ReturnType<typeof useSettings>["data"];
  uploadLogo: ReturnType<typeof useUploadLogo>;
  uploadFavicon: ReturnType<typeof useUploadFavicon>;
  logoUrl: string | null;
  faviconUrl: string | null;
  onLogoUploaded: (key: string, url: string) => void;
  onFaviconUploaded: (key: string, url: string) => void;
  onLogoClear: () => void;
  onFaviconClear: () => void;
}) {
  const { register, formState } = methods;
  const errors = formState.errors;

  return (
    <div className="space-y-8">
      {/* Company Info */}
      <section className="space-y-4">
        <SectionHeader title="Thông tin công ty" />
        <div className="grid gap-5 md:grid-cols-2">
          <CrudField
            id="company_name"
            label="Tên công ty"
            hint={errors.company_name?.message}
          >
            <Input
              id="company_name"
              autoComplete="organization"
              {...register("company_name")}
              disabled={submitting}
              aria-invalid={Boolean(errors.company_name) || undefined}
            />
          </CrudField>

          <CrudField
            id="working_hours"
            label="Giờ làm việc"
            hint={errors.working_hours?.message}
          >
            <Input
              id="working_hours"
              autoComplete="off"
              placeholder="T2-T6: 8h00-18h00"
              {...register("working_hours")}
              disabled={submitting}
              aria-invalid={Boolean(errors.working_hours) || undefined}
            />
          </CrudField>

          <CrudField
            id="address"
            label="Địa chỉ"
            className="md:col-span-2"
            hint={errors.address?.message}
          >
            <Input
              id="address"
              autoComplete="street-address"
              {...register("address")}
              disabled={submitting}
              aria-invalid={Boolean(errors.address) || undefined}
            />
          </CrudField>
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-4">
        <SectionHeader title="Liên hệ" />
        <div className="grid gap-5 md:grid-cols-2">
          <CrudField
            id="phone"
            label="Số điện thoại"
            hint={errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="0901 234 567"
              {...register("phone")}
              disabled={submitting}
              aria-invalid={Boolean(errors.phone) || undefined}
            />
          </CrudField>

          <CrudField
            id="email"
            label="Email"
            hint={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="contact@mlcosmetics.vn"
              {...register("email")}
              disabled={submitting}
              aria-invalid={Boolean(errors.email) || undefined}
            />
          </CrudField>
        </div>
      </section>

      {/* Social */}
      <section className="space-y-4">
        <SectionHeader title="Mạng xã hội" />
        <div className="grid gap-5 md:grid-cols-2">
          <CrudField
            id="facebook_url"
            label="Facebook"
            hint={errors.facebook_url?.message}
          >
            <Input
              id="facebook_url"
              type="url"
              autoComplete="off"
              placeholder="https://facebook.com/..."
              {...register("facebook_url")}
              disabled={submitting}
              aria-invalid={Boolean(errors.facebook_url) || undefined}
            />
          </CrudField>

          <CrudField
            id="instagram_url"
            label="Instagram"
            hint={errors.instagram_url?.message}
          >
            <Input
              id="instagram_url"
              type="url"
              autoComplete="off"
              placeholder="https://instagram.com/..."
              {...register("instagram_url")}
              disabled={submitting}
              aria-invalid={Boolean(errors.instagram_url) || undefined}
            />
          </CrudField>

          <CrudField
            id="zalo_url"
            label="Zalo"
            hint={errors.zalo_url?.message}
          >
            <Input
              id="zalo_url"
              type="url"
              autoComplete="off"
              placeholder="https://zalo.me/..."
              {...register("zalo_url")}
              disabled={submitting}
              aria-invalid={Boolean(errors.zalo_url) || undefined}
            />
          </CrudField>

          <CrudField
            id="messenger_url"
            label="Messenger"
            hint={errors.messenger_url?.message}
          >
            <Input
              id="messenger_url"
              type="url"
              autoComplete="off"
              placeholder="https://m.me/..."
              {...register("messenger_url")}
              disabled={submitting}
              aria-invalid={Boolean(errors.messenger_url) || undefined}
            />
          </CrudField>

          <CrudField
            id="tiktok_url"
            label="TikTok"
            hint={errors.tiktok_url?.message}
          >
            <Input
              id="tiktok_url"
              type="url"
              autoComplete="off"
              placeholder="https://tiktok.com/@..."
              {...register("tiktok_url")}
              disabled={submitting}
              aria-invalid={Boolean(errors.tiktok_url) || undefined}
            />
          </CrudField>

          <CrudField
            id="youtube_url"
            label="YouTube"
            hint={errors.youtube_url?.message}
          >
            <Input
              id="youtube_url"
              type="url"
              autoComplete="off"
              placeholder="https://youtube.com/@..."
              {...register("youtube_url")}
              disabled={submitting}
              aria-invalid={Boolean(errors.youtube_url) || undefined}
            />
          </CrudField>
        </div>
      </section>

      {/* Media */}
      <section className="space-y-4">
        <SectionHeader title="Hình ảnh" />
        <div className="grid gap-6 md:grid-cols-2">
          <ImageUploadField
            label="Logo"
            currentUrl={settings?.logo_url}
            uploadedUrl={logoUrl}
            onUploaded={onLogoUploaded}
            onClear={onLogoClear}
            upload={uploadLogo}
            disabled={submitting}
            hint="PNG, JPG, WEBP · Tối đa 5 MB"
          />
          <ImageUploadField
            label="Favicon"
            currentUrl={settings?.favicon_url}
            uploadedUrl={faviconUrl}
            onUploaded={onFaviconUploaded}
            onClear={onFaviconClear}
            upload={uploadFavicon}
            disabled={submitting}
            hint="PNG, ICO · Tối đa 1 MB"
          />
        </div>
      </section>

      {/* SEO */}
      <section className="space-y-4">
        <SectionHeader title="SEO" />
        <div className="space-y-5">
          <CrudField
            id="seo_title"
            label="SEO Title"
            hint={errors.seo_title?.message}
          >
            <Input
              id="seo_title"
              autoComplete="off"
              placeholder="ML Cosmetics — Mỹ phẩm cao cấp"
              {...register("seo_title")}
              disabled={submitting}
              aria-invalid={Boolean(errors.seo_title) || undefined}
            />
          </CrudField>

          <CrudField
            id="seo_description"
            label="SEO Description"
            hint={errors.seo_description?.message}
          >
            <Textarea
              id="seo_description"
              rows={3}
              placeholder="Mô tả trang web cho công cụ tìm kiếm…"
              {...register("seo_description")}
              disabled={submitting}
              aria-invalid={Boolean(errors.seo_description) || undefined}
            />
          </CrudField>

          <CrudField
            id="seo_keywords"
            label="SEO Keywords"
            hint={errors.seo_keywords?.message}
          >
            <Input
              id="seo_keywords"
              autoComplete="off"
              placeholder="mỹ phẩm, son môi, trang điểm"
              {...register("seo_keywords")}
              disabled={submitting}
              aria-invalid={Boolean(errors.seo_keywords) || undefined}
            />
          </CrudField>
        </div>
      </section>

      {/* Map */}
      <section className="space-y-4">
        <SectionHeader title="Bản đồ" />
        <CrudField
          id="google_map_embed"
          label="Google Maps Embed"
          hint={errors.google_map_embed?.message}
        >
          <Textarea
            id="google_map_embed"
            rows={4}
            placeholder="<iframe src=&quot;...&quot; ...></iframe>"
            {...register("google_map_embed")}
            disabled={submitting}
            aria-invalid={Boolean(errors.google_map_embed) || undefined}
          />
        </CrudField>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SettingsForm (exported)                                            */
/* ------------------------------------------------------------------ */

export function SettingsForm() {
  const settingsQuery = useSettings();
  const updateSettings = useUpdateSettings();
  const uploadLogo = useUploadLogo();
  const uploadFavicon = useUploadFavicon();

  // Uploaded image state — cleared when user saves or clears the field.
  const [logoKey, setLogoKey] = React.useState<string | null>(null);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [faviconKey, setFaviconKey] = React.useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = React.useState<string | null>(null);

  const defaults = React.useMemo<SettingsFormValues>(() => {
    if (settingsQuery.data) {
      return settingsToFormDefaults(settingsQuery.data);
    }
    return {
      company_name: null,
      phone: null,
      email: null,
      address: null,
      working_hours: null,
      facebook_url: null,
      instagram_url: null,
      zalo_url: null,
      messenger_url: null,
      tiktok_url: null,
      youtube_url: null,
      logo_key: null,
      favicon_key: null,
      seo_title: null,
      seo_description: null,
      seo_keywords: null,
      google_map_embed: null,
    };
  }, [settingsQuery.data]);

  const typedSchema = settingsFormSchema as unknown as ZodType<
    SettingsFormValues,
    ZodTypeDef,
    SettingsFormValues
  >;

  const handleLogoUploaded = React.useCallback((key: string, url: string) => {
    setLogoKey(key);
    setLogoUrl(url);
  }, []);

  const handleFaviconUploaded = React.useCallback((key: string, url: string) => {
    setFaviconKey(key);
    setFaviconUrl(url);
  }, []);

  const handleLogoClear = React.useCallback(() => {
    setLogoKey(null);
    setLogoUrl(null);
  }, []);

  const handleFaviconClear = React.useCallback(() => {
    setFaviconKey(null);
    setFaviconUrl(null);
  }, []);

  // Build submit values: merge current form values with uploaded keys.
  const handleSubmit = React.useCallback(
    async (values: SettingsFormValues) => {
      const merged: SettingsFormValues = {
        ...values,
        logo_key: logoKey,
        favicon_key: faviconKey,
      };
      await updateSettings.mutateAsync(formToUpdateInput(merged));
    },
    [updateSettings, logoKey, faviconKey],
  );

  return (
    <CrudForm<SettingsFormValues>
      schema={typedSchema}
      defaultValues={defaults}
      mode="edit"
      title="Cài đặt trang web"
      description="Cập nhật thông tin công ty, liên hệ, mạng xã hội và SEO."
      submitLabel="Lưu cài đặt"
      onSubmit={handleSubmit}
      renderFields={(props) => (
        <SettingsFormFields
          {...props}
          settings={settingsQuery.data}
          uploadLogo={uploadLogo}
          uploadFavicon={uploadFavicon}
          logoUrl={logoUrl}
          faviconUrl={faviconUrl}
          onLogoUploaded={handleLogoUploaded}
          onFaviconUploaded={handleFaviconUploaded}
          onLogoClear={handleLogoClear}
          onFaviconClear={handleFaviconClear}
        />
      )}
    />
  );
}
