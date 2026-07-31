"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import type { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * `EntityAction` — description of one item inside the action menu.
 */
export interface EntityAction<T> {
  label: string;
  /** Lucide-style icon component (receives `className`). */
  icon?: React.ComponentType<{ className?: string }>;
  /** Called with the row's original data when the item is selected. */
  onSelect: (row: T) => void;
  /** "destructive" applies red text. Defaults to "default". */
  variant?: "default" | "destructive";
  disabled?: boolean;
}

/**
 * `EntityActionMenuProps` — the generic right-side action menu for any
 * list row. Replaces the inline `ActionsCell` previously defined inside
 * the Product and Category column builders. Lives in the shared CRUD
 * layer so any future entity can use it without duplicating the
 * DropdownMenu chrome.
 */
export interface EntityActionMenuProps<T> {
  row: Row<T>;
  actions: EntityAction<T>[];
  triggerLabel?: string;
  className?: string;
}

export function EntityActionMenu<T>({
  row,
  actions,
  triggerLabel = "Mở menu hành động",
}: EntityActionMenuProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={triggerLabel}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {actions.map((action, i) => (
          <DropdownMenuItem
            key={i}
            onSelect={() => action.onSelect(row.original)}
            disabled={action.disabled}
            className={
              action.variant === "destructive"
                ? "text-destructive focus:text-destructive"
                : undefined
            }
          >
            {action.icon && (
              <action.icon className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
