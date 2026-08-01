"use client";

import * as React from "react";
import { FormProvider, useForm, type DefaultValues, type FieldValues, type Resolver, type UseFormReturn, type UseFormReset } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { LoadingOverlay } from "../loading-overlay";
import type { APIError } from "@/lib/api";
import { cn } from "@/lib/utils/cn";
import { useCrudFormKeyboard } from "./use-crud-form-keyboard";
import { useUnsavedChangesGuard } from "./use-unsaved-changes-guard";

export interface CrudFormRenderProps<T extends FieldValues> {
  methods: UseFormReturn<T>;
  submitting: boolean;
  error: APIError | null;
  reset: UseFormReset<T>;
}

export interface CrudFormProps<T extends FieldValues> {
  schema: z.ZodType<T, z.ZodTypeDef, T>;
  defaultValues: T;
  mode?: "create" | "edit";
  title: string;
  description?: string;
  redirectTo?: string;
  cancelTo?: string;
  submitLabel?: string;
  onSubmit: (values: T) => Promise<unknown>;
  headerRight?: React.ReactNode;
  renderFields: (props: CrudFormRenderProps<T>) => React.ReactNode;
  /** Content rendered in the left panel (e.g. image gallery). */
  leftPanel?: React.ReactNode;
  /** Content rendered in the right panel (default: sidebar). */
  sidePanel?: React.ReactNode;
  /** Tailwind max-width class for the side panel column.
   *  Defaults to `minmax(0,400px)` (400 px max). */
  sidePanelWidth?: string;
  /**
   * Override the dirty flag used for the submit button + the
   * unsaved-changes guard. Useful when the form owns a controlled
   * child panel (image gallery, tag picker, ...) whose changes
   * should enable submit but don't go through React Hook Form.
   *
   * Defaults to `formState.isDirty` so existing forms keep their
   * behavior.
   */
  isDirty?: boolean;
  /**
   * Notifies the parent whenever React Hook Form's internal dirty
   * flag changes. Lets parents combine `formState.isDirty` with
   * their own controlled-panel dirty flags (gallery, tags, ...) and
   * feed the combined value back via `isDirty`.
   */
  onDirtyChange?: (dirty: boolean) => void;
}

export function CrudForm<T extends FieldValues>({
  schema,
  defaultValues,
  mode = "create",
  title,
  description,
  redirectTo,
  cancelTo = "/admin",
  submitLabel,
  onSubmit,
  headerRight,
  renderFields,
  leftPanel,
  sidePanel,
  sidePanelWidth = "minmax(0,400px)",
  isDirty: isDirtyProp,
  onDirtyChange,
}: CrudFormProps<T>) {
  const router = useRouter();
  const [apiError, setApiError] = React.useState<APIError | null>(null);
  const submittingRef = useRef(false);

  const methods = useForm<T, unknown, T>({
    resolver: zodResolver(schema) as Resolver<T>,
    values: defaultValues as T,
    resetOptions: { keepDefaultValues: true },
    mode: "onSubmit",
  });

  const { handleSubmit, reset, formState } = methods;
  const rhfIsDirty = formState.isDirty;
  const isDirty = isDirtyProp ?? rhfIsDirty;

  // Bubble RHF's dirty flag up so parents can combine it with their
  // own controlled-panel dirty flags and feed the combined value
  // back via the `isDirty` prop.
  React.useEffect(() => {
    onDirtyChange?.(rhfIsDirty);
  }, [rhfIsDirty, onDirtyChange]);

  const handleCancel = React.useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        "Bạn có thay đổi chưa lưu. Rời khỏi trang mà không lưu?",
      );
      if (!confirmed) return;
    }
    router.push(cancelTo);
  }, [router, cancelTo, isDirty]);

  const submit = handleSubmit(async (values) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setApiError(null);
    try {
      const result = await onSubmit(values);
      reset(defaultValues, { keepValues: true });
      // In edit mode we stay on the page after a successful save —
      // the user expects "Lưu thay đổi" to persist their edits
      // without bouncing them back to the list view. Only `create`
      // mode redirects: it jumps to the new entity's edit page so
      // the creator can keep configuring it (e.g. upload images).
      if (mode === "create" && redirectTo) {
        const id = (result as { id?: string } | undefined)?.id;
        router.push(id ? `${redirectTo}/${id}/edit` : redirectTo);
      }
    } catch (error) {
      setApiError(error as APIError);
    } finally {
      submittingRef.current = false;
    }
  });

  useUnsavedChangesGuard(isDirty);

  useCrudFormKeyboard({
    onSubmit: () => {
      void submit();
    },
    onCancel: handleCancel,
    dirty: isDirty,
    submitting: submittingRef.current,
  });

  const finalSubmitLabel =
    submitLabel ?? (mode === "edit" ? "Lưu thay đổi" : "Tạo mới");

  return (
    <FormProvider {...methods}>
      <form
        noValidate
        onSubmit={(event) => {
          void submit(event);
        }}
        className="grid gap-6 text-[14px] leading-[1.6] text-foreground"
        aria-labelledby="crud-form-title"
      >
        <LoadingOverlay
          open={submittingRef.current}
          label={mode === "edit" ? "Đang lưu…" : "Đang tạo…"}
        />

        <div
          className={
            leftPanel && sidePanel
              ? `grid gap-6 lg:grid-cols-[${sidePanelWidth}_1fr]`
              : leftPanel
                ? `grid gap-6 lg:grid-cols-[${sidePanelWidth}_1fr]`
                : sidePanel
                  ? `grid gap-6 lg:grid-cols-[1fr_${sidePanelWidth}]`
                  : "grid gap-6"
          }
        >
          {leftPanel && <aside aria-label="Hình ảnh sản phẩm">{leftPanel}</aside>}

          <section
            aria-labelledby="crud-form-title"
            className="space-y-6 rounded-xl border border-hairline bg-card p-6"
          >
            <header className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2
                  id="crud-form-title"
                  className="text-[18px] font-semibold leading-[1.3] text-foreground"
                >
                  {title}
                </h2>
                {description && (
                  <p className="text-[14px] leading-[1.6] text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              {headerRight}
            </header>

            {apiError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[14px] text-destructive"
              >
                {apiError.message}
              </div>
            )}

            {renderFields({
              methods,
              submitting: submittingRef.current,
              error: apiError,
              reset,
            })}

            <div className="flex items-center justify-between border-t border-hairline pt-4">
              <p className="text-[12px] leading-[1.6] text-muted-foreground">
                Phím tắt: <kbd>Ctrl+S</kbd> lưu, <kbd>Esc</kbd> huỷ
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={submittingRef.current}
                >
                  Huỷ
                </Button>
                <Button
                  type="submit"
                  disabled={submittingRef.current || (mode === "edit" && !isDirty)}
                  aria-busy={submittingRef.current || undefined}
                >
                  {submittingRef.current ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {finalSubmitLabel}
                </Button>
              </div>
            </div>
          </section>

          {sidePanel && <aside aria-label="Dashboard">{sidePanel}</aside>}
        </div>
      </form>
    </FormProvider>
  );
}

export interface CrudFieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CrudField({
  id,
  label,
  required,
  hint,
  right,
  children,
  className,
}: CrudFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const childWithDescribedBy = React.isValidElement(children)
    ? React.cloneElement(
        children as React.ReactElement<{ "aria-describedby"?: string }>,
        { "aria-describedby": hintId },
      )
    : children;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-destructive">
              *
            </span>
          )}
        </Label>
        {right}
      </div>
      {childWithDescribedBy}
      {hint && (
      <p
        className="mt-2 text-[14px] leading-[1.6] text-destructive"
        role={required ? "alert" : undefined}
      >
        {hint}
      </p>
      )}
    </div>
  );
}

export function generateSlug(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
