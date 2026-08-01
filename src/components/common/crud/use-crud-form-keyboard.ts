"use client";

import { useEffect, useRef } from "react";

/**
 * Global keyboard shortcuts for CRUD forms.
 *
 *   Ctrl/Cmd + S  → submit (`onSubmit`)
 *   Escape        → cancel (`onCancel`, when provided)
 *
 * Suppressed while `submitting === true` so a stale double-press
 * doesn't fire twice.
 */
export interface CrudFormKeyboardOptions {
  onSubmit: () => void;
  onCancel?: () => void;
  dirty: boolean;
  submitting: boolean;
}

export function useCrudFormKeyboard(options: CrudFormKeyboardOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKeyDown = (event: KeyboardEvent) => {
      const opts = optionsRef.current;
      if (opts.submitting) return;
      const isSave =
        (event.ctrlKey || event.metaKey) && (event.key === "s" || event.key === "S");
      if (isSave) {
        event.preventDefault();
        opts.onSubmit();
        return;
      }
      if (event.key === "Escape" && opts.onCancel) {
        event.preventDefault();
        opts.onCancel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}