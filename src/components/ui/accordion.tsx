"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus Accordion — a single-source (or multi-source) disclosure
 * built without Radix to avoid pulling a new dependency.
 *
 * Mirrors the API surface of `@radix-ui/react-accordion` so call sites
 * can be migrated later without a refactor:
 *
 *   <Accordion type="single" collapsible defaultValue="a">
 *     <AccordionItem value="a">
 *       <AccordionTrigger>Title</AccordionTrigger>
 *       <AccordionContent>Body</AccordionContent>
 *     </AccordionItem>
 *   </Accordion>
 *
 * Visual spec:
 *   - Trigger: 16 px row padding, 1 px hairline divider.
 *   - Chevron: rotates 180° on open.
 *   - Content: smooth `max-height` transition.
 */
type AccordionContextValue = {
  type: "single" | "multiple";
  value: string | string[] | undefined;
  onItemToggle: (itemValue: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordion(component: string): AccordionContextValue {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <Accordion>.`);
  }
  return ctx;
}

const ItemContext = React.createContext<string | null>(null);

function useItemValue(component: string): string {
  const value = React.useContext(ItemContext);
  if (!value) {
    throw new Error(`<${component}> must be rendered inside <AccordionItem value="...">.`);
  }
  return value;
}

export interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  className?: string;
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function Accordion({
  type = "single",
  collapsible = false,
  defaultValue,
  value: controlled,
  onValueChange,
  children,
  className,
}: AccordionProps) {
  const [uncontrolled, setUncontrolled] = React.useState<string | string[] | undefined>(
    defaultValue,
  );
  const value = controlled !== undefined ? controlled : uncontrolled;

  const onItemToggle = React.useCallback(
    (itemValue: string) => {
      let next: string | string[];
      if (type === "single") {
        const current = Array.isArray(value) ? value[0] : value;
        const toggled = collapsible && current === itemValue ? undefined : itemValue;
        next = toggled ?? "";
      } else {
        const arr = toArray(value);
        const idx = arr.indexOf(itemValue);
        const newArr = idx === -1 ? [...arr, itemValue] : arr.filter((v) => v !== itemValue);
        next = newArr;
      }
      if (controlled === undefined) {
        setUncontrolled(next);
      }
      onValueChange?.(next as string | string[]);
    },
    [collapsible, controlled, onValueChange, type, value],
  );

  return (
    <AccordionContext.Provider value={{ type, value, onItemToggle }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, ...props }, ref) => (
    <ItemContext.Provider value={value}>
      <div
        ref={ref}
        className={cn("border-b border-hairline", className)}
        data-accordion-item={value}
        {...props}
      />
    </ItemContext.Provider>
  ),
);
AccordionItem.displayName = "AccordionItem";

function isItemOpen(ctx: AccordionContextValue, itemValue: string): boolean {
  if (ctx.type === "single") {
    const current = Array.isArray(ctx.value) ? ctx.value[0] : ctx.value;
    return current === itemValue;
  }
  return Array.isArray(ctx.value) && ctx.value.includes(itemValue);
}

export interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Hide the chevron icon when a custom affordance is needed. */
  hideChevron?: boolean;
}

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, hideChevron, ...props }, ref) => {
    const ctx = useAccordion("AccordionTrigger");
    const itemValue = useItemValue("AccordionTrigger");
    const open = isItemOpen(ctx, itemValue);

    return (
      <button
        ref={ref}
        type="button"
        id={`accordion-trigger-${itemValue}`}
        aria-expanded={open}
        aria-controls={`accordion-panel-${itemValue}`}
        onClick={() => ctx.onItemToggle(itemValue)}
        className={cn(
          "flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open && "text-primary",
          className,
        )}
        {...props}
      >
        <span className="flex-1">{children}</span>
        {!hideChevron && (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180 text-primary",
            )}
            aria-hidden="true"
          />
        )}
      </button>
    );
  },
);
AccordionTrigger.displayName = "AccordionTrigger";

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Force mount the content even when closed (useful for animations). */
  forceMount?: boolean;
}

export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, forceMount, ...props }, ref) => {
    const ctx = useAccordion("AccordionContent");
    const itemValue = useItemValue("AccordionContent");
    const open = isItemOpen(ctx, itemValue);
    const innerRef = React.useRef<HTMLDivElement | null>(null);
    const [maxHeight, setMaxHeight] = React.useState<string>("0px");

    React.useLayoutEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      const target = open ? `${el.scrollHeight}px` : "0px";
      setMaxHeight(target);
    }, [open]);

    if (!open && !forceMount) return null;

    return (
      <div
        ref={ref}
        id={`accordion-panel-${itemValue}`}
        role="region"
        aria-labelledby={`accordion-trigger-${itemValue}`}
        aria-hidden={!open}
        className="overflow-hidden transition-[max-height] duration-200 ease-out"
        style={{ maxHeight }}
        {...props}
      >
        <div ref={innerRef} className={cn("pb-4 pt-0", className)}>
          {children}
        </div>
      </div>
    );
  },
);
AccordionContent.displayName = "AccordionContent";