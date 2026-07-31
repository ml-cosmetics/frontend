"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";

/**
 * Aura Vénus Sheet — sliding drawer for create/edit forms.
 *
 * Backdrop uses the glass wash from the design MD (rgba(255,255,255,0.8)
 * + 12 px blur). Default panel width is 32 rem (matches the design
 * MD's 512 px drawer). The panel itself is a flat surface with a
 * 1 px hairline border on the leading edge.
 */

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);
function useSheetContext() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("Sheet components must be rendered inside <Sheet>");
  return ctx;
}

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({
  open: controlled,
  defaultOpen,
  onOpenChange,
  children,
}: SheetProps) {
  const [internal, setInternal] = React.useState(Boolean(defaultOpen));
  const open = controlled ?? internal;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlled === undefined) setInternal(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );
  return (
    <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>
  );
}

export const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { setOpen } = useSheetContext();
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        setOpen(true);
        onClick?.(e);
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});
SheetTrigger.displayName = "SheetTrigger";

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "right" | "left";
  width?: string;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  (
    {
      className,
      children,
      side = "right",
      width = "32rem",
      closeOnEscape = true,
      closeOnOutsideClick = true,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen } = useSheetContext();

    React.useEffect(() => {
      if (!open || !closeOnEscape) return;
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, setOpen, closeOnEscape]);

    React.useEffect(() => {
      if (open) {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = original;
        };
      }
    }, [open]);

    if (!open) return null;

    const slideClass =
      side === "right"
        ? "right-0 translate-x-0 data-[state=closed]:translate-x-full"
        : "left-0 translate-x-0 data-[state=closed]:-translate-x-full";

    return (
      <div className="fixed inset-0 z-50 flex">
        <button
          type="button"
          aria-label="Đóng"
          onClick={() => closeOnOutsideClick && setOpen(false)}
          className="fixed inset-0 aura-glass cursor-default"
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          data-state={open ? "open" : "closed"}
          style={{ width, maxWidth: "90vw" }}
          className={cn(
            "fixed top-0 h-full overflow-y-auto border-l border-hairline bg-card aura-shadow-sm",
            "transition-transform duration-200",
            slideClass,
            side === "left" && "border-l-0 border-r",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);
SheetContent.displayName = "SheetContent";

export const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { setOpen } = useSheetContext();
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        setOpen(false);
        onClick?.(e);
      }}
      className={cn(
        "absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children ?? <X className="h-4 w-4" />}
      <span className="sr-only">Đóng</span>
    </button>
  );
});
SheetClose.displayName = "SheetClose";

export function SheetHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-6 text-left", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-[18px] font-semibold leading-[1.3] text-foreground",
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[14px] leading-[1.6] text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export function SheetFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-hairline p-6 sm:flex-row sm:justify-end sm:gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
