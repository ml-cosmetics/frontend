"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * `useUnsavedChangesGuard` — fires `confirm()` when the user attempts
 * to navigate away with `dirty === true`. Used by every CRUD form to
 * honour the brief's "warn before leaving if modified" rule.
 *
 *  - `beforeunload` listener installed while `dirty === true`.
 *  - `promptIfDirty()` lets callers gate programmatic navigation
 *    (e.g. clicking a "Huỷ" button) behind the same confirmation.
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const [, setPending] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const promptIfDirty = useCallback(
    (message = "Bạn có thay đổi chưa lưu. Rời khỏi trang mà không lưu?"): boolean => {
      if (!dirtyRef.current) return true;
      if (typeof window === "undefined") return true;
      const ok = window.confirm(message);
      setPending((n) => n + 1);
      return ok;
    },
    [],
  );

  return { promptIfDirty };
}