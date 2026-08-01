"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus Popover — 16 px radius, 1 px hairline border, ambient
 * shadow. Implemented as a controlled overlay (no Radix dependency).
 * Supports click-outside and ESC to close out of the box. Visually
 * matches the Aura Vénus design MD exactly.
 */

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be rendered inside <Popover>");
  return ctx;
}

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({ open: controlled, defaultOpen, onOpenChange, children }: PopoverProps) {
  const [internal, setInternal] = React.useState(Boolean(defaultOpen));
  const open = controlled ?? internal;
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlled === undefined) setInternal(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const value = React.useMemo(
    () => ({ open, setOpen, triggerRef }),
    [open, setOpen],
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

export interface PopoverTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, children, asChild, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopoverContext();
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setOpen(!open);
      props.onClick?.(e);
    };

    // Compose the consumer-provided `ref` (via React.forwardRef) with the
    // context-owned `triggerRef` so external parents can still grab the
    // underlying button node while the popover keeps a handle for click-
    // outside detection.
    const setRefs = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [ref, triggerRef],
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        onClick?: React.MouseEventHandler;
        ref?: React.Ref<HTMLElement>;
      }>;
      const mergedRef = (node: HTMLElement | null) => {
        setRefs(node as HTMLButtonElement | null);
      };
      return React.cloneElement(child, {
        ref: mergedRef,
        onClick: (e: React.MouseEvent) => {
          child.props.onClick?.(e);
          handleClick(e as React.MouseEvent<HTMLButtonElement>);
        },
      });
    }

    return (
      <button
        ref={setRefs}
        type="button"
        aria-expanded={open}
        onClick={handleClick}
        className={cn("focus:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
  sideOffset?: number;
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, children, align = "center", side = "bottom", sideOffset = 6, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopoverContext();
    const panelRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      const onClick = (e: MouseEvent) => {
        if (
          panelRef.current &&
          !panelRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      };
      window.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onClick);
      return () => {
        window.removeEventListener("keydown", onKey);
        document.removeEventListener("mousedown", onClick);
      };
    }, [open, setOpen, triggerRef]);

    if (!open) return null;

    const alignClass =
      align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";
    const sideClass =
      side === "top"
        ? "bottom-full mb-[var(--popover-side-offset,6px)]"
        : "top-full mt-[var(--popover-side-offset,6px)]";

    return (
      <div
        ref={(node) => {
          panelRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        role="dialog"
        style={{ ["--popover-side-offset" as string]: `${sideOffset}px` }}
        className={cn(
          "absolute z-50 w-72 overflow-hidden rounded-xl border border-hairline bg-popover p-4 text-popover-foreground aura-shadow-sm",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          sideClass,
          alignClass,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
PopoverContent.displayName = "PopoverContent";
