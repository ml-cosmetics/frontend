"use client";

import * as React from "react";
import { FileText, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
} from "@/components/common";
import { ContentEditorDialog } from "@/components/common";
import { useContentList, useUpdateContent } from "../hooks";
import type { ContentSection, UpdateContentInput } from "@/types";

/**
 * Human-readable labels for known content keys.
 * Unknown keys fall back to a formatted version of the raw key.
 */
const CONTENT_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "Giới thiệu",
  contact: "Liên hệ",
  faq: "Câu hỏi thường gặp",
  shipping: "Chính sách vận chuyển",
  policy: "Chính sách",
  footer: "Chân trang",
};

function getLabel(key: string): string {
  return CONTENT_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function truncate(text: string | null | undefined, max = 120): string {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

/**
 * `ContentPage` — editable content cards for website content management.
 *
 * Each backend key renders as one card. Clicking Edit opens the
 * `ContentEditorDialog`. The dialog is imported directly so the initial
 * page bundle does not include the edit form.
 */
export function ContentPage() {
  const listQuery = useContentList();
  const updateContent = useUpdateContent();

  const [editing, setEditing] = React.useState<ContentSection | null>(null);

  const handleSave = React.useCallback(
    async (key: string, input: UpdateContentInput) => {
      await updateContent.mutateAsync({ key, input });
    },
    [updateContent],
  );

  const sections = listQuery.data ?? [];

  return (
    <>
      {listQuery.isLoading ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Đang tải nội dung"
          className="grid place-items-center rounded-xl border border-hairline bg-card py-16"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Không có nội dung"
              description="Không tìm thấy mục nội dung nào."
            />
          ) : (
            sections.map((section) => (
              <ContentCard
                key={section.key}
                section={section}
                onEdit={() => setEditing(section)}
              />
            ))
          )}
        </div>
      )}

      {editing && (
        <ContentEditorDialog
          open={true}
          onOpenChange={(open) => { if (!open) setEditing(null); }}
          section={editing}
          onSave={handleSave}
          isSaving={updateContent.isPending}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* ContentCard                                                        */
/* ------------------------------------------------------------------ */

interface ContentCardProps {
  section: ContentSection;
  onEdit: () => void;
}

function ContentCard({ section, onEdit }: ContentCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-semibold leading-[1.3] text-foreground">
            {getLabel(section.key)}
          </p>
          <p className="mt-0.5 text-[14px] leading-[1.6] text-muted-foreground">
            Key:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
              {section.key}
            </code>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          aria-label={`Chỉnh sửa ${getLabel(section.key)}`}
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Sửa</span>
        </Button>
      </div>

      <div className="space-y-1">
        {section.title && (
          <p className="text-[14px] font-medium leading-[1.6] text-foreground">{section.title}</p>
        )}
        <p className="line-clamp-3 text-[14px] leading-[1.6] text-muted-foreground">
          {truncate(section.content)}
        </p>
      </div>
    </div>
  );
}
