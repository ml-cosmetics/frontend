"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus Select — single source of truth for every dropdown in
 * the storefront + admin shells.
 *
 * Visual contract:
 *   - Trigger: pill-shaped hairline border, soft pink focus ring,
 *     icon rotates 180° when open. Two height variants via
 *     `size="sm" | "md"` — `sm` for compact toolbar filters, `md`
 *     (default) for form fields.
 *   - Panel: 16 px radius, white surface, subtle pink shadow, scrolls
 *     gracefully when content overflows.
 *   - Items: 8 px radius, rose tint on hover/focus, check icon
 *     slides in for the active value.
 *
 * Caller usage mirrors native `<select>`:
 *
 *   <Select value={value} onValueChange={setValue}>
 *     <SelectTrigger size="sm" className="rounded-full">
 *       <SelectValue />
 *     </SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="x">Label</SelectItem>
 *     </SelectContent>
 *   </Select>
 */

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const triggerSizeClass: Record<NonNullable<SelectTriggerProps["size"]>, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-3 py-2 text-[14px] gap-2",
};

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: "sm" | "md";
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, size = "md", ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "group/trigger inline-flex items-center justify-between whitespace-nowrap rounded-xl border border-rose-100 bg-white/90 leading-none text-foreground",
      "shadow-[0_1px_2px_rgba(225,29,116,0.04)] transition-all duration-200",
      "data-[placeholder]:text-muted-foreground",
      "hover:border-primary/40 hover:bg-gradient-to-br hover:from-[#FFF1F7] hover:to-[#FCE7F3] hover:shadow-[0_8px_20px_-8px_rgba(225,29,116,0.30)]",
      "focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(225,29,116,0.15)]",
      "data-[state=open]:border-primary data-[state=open]:bg-gradient-to-br data-[state=open]:from-[#FFF1F7] data-[state=open]:to-[#FCE7F3] data-[state=open]:shadow-[0_8px_20px_-8px_rgba(225,29,116,0.30)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "[&>span]:line-clamp-1",
      triggerSizeClass[size],
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown
        className="h-4 w-4 shrink-0 text-zinc-400 transition-all duration-200 group-data-[state=open]/trigger:rotate-180 group-data-[state=open]/trigger:text-primary"
        aria-hidden
      />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-2xl border border-rose-100 bg-white/95 p-1 text-popover-foreground backdrop-blur",
        "shadow-[0_18px_40px_-12px_rgba(225,29,116,0.25),0_4px_12px_-4px_rgba(0,0,0,0.08)]",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1 text-muted-foreground">
        <ChevronUp className="h-4 w-4" />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport
        className={cn(
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1 text-muted-foreground">
        <ChevronDown className="h-4 w-4" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-9 pr-3 text-[14px] outline-none",
      "text-zinc-700 transition-colors",
      "focus:bg-gradient-to-r focus:from-[#FFF1F7] focus:to-[#FCE7F3] focus:text-primary",
      "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFF1F7] data-[state=checked]:to-[#FCE7F3] data-[state=checked]:text-primary data-[state=checked]:font-medium",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center text-primary">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("mx-1 my-1 h-px bg-rose-100/80", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
