"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { LoadingOverlay } from "@/components/common/loading-overlay";
import type { ContentSection, UpdateContentInput } from "@/types";

const contentFormSchema = z.object({
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

export interface ContentEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: ContentSection | null;
  onSave: (key: string, input: UpdateContentInput) => Promise<unknown>;
  isSaving: boolean;
}

export function ContentEditorDialog({
  open,
  onOpenChange,
  section,
  onSave,
  isSaving,
}: ContentEditorDialogProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: section?.title ?? null,
      content: section?.content ?? null,
    },
  });

  const { reset, handleSubmit, formState } = form;
  const isDirty = formState.isDirty;

  // Reset form when section changes.
  useEffect(() => {
    if (open) {
      reset({
        title: section?.title ?? null,
        content: section?.content ?? null,
      });
    }
  }, [open, section, reset]);

  // Keyboard shortcuts: Ctrl/Cmd+S to submit, Escape to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange, form]);

  const handleFormSubmit = handleSubmit(async (values) => {
    if (!section) return;
    await onSave(section.key, {
      title: values.title ?? null,
      content: values.content ?? null,
    });
    onOpenChange(false);
  });

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?",
      );
      if (!confirmed) return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onPointerDownOutside={isDirty ? (e) => { e.preventDefault(); handleCancel(); } : undefined}>
        <LoadingOverlay open={isSaving} />
        <form ref={formRef} onSubmit={handleFormSubmit} id="content-editor-form">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold leading-[1.3]">
              Chỉnh sửa nội dung
              {section?.title && (
                <span className="ml-2 font-normal text-muted-foreground">
                  — {section.title}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4">
        <div className="space-y-2">
          <Label htmlFor="section-title">Tiêu đề</Label>
          <Input
            id="section-title"
            autoComplete="off"
            {...form.register("title")}
            disabled={isSaving}
            placeholder="Tiêu đề mục nội dung"
            className="text-[14px] leading-[1.6]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="section-content">Nội dung</Label>
          <Textarea
            id="section-content"
            rows={12}
            placeholder="Nhập nội dung…"
            {...form.register("content")}
            disabled={isSaving}
            className="text-[14px] leading-[1.6]"
          />
        </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-hairline pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-[14px] leading-[1.6]"
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="text-[14px] leading-[1.6]"
            >
              {isSaving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
