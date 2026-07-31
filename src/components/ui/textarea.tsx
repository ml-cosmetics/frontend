import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus Textarea — same input styling as the Input primitive
 * with a 96 px minimum height.
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[96px] w-full rounded-lg border border-hairline bg-background px-3 py-2 text-[14px] leading-[1.6] text-foreground",
      "placeholder:text-muted-foreground",
      "transition-colors hover:border-primary/40",
      "focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_2px_rgba(225,29,116,0.15)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
