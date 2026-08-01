"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus DatePicker — 12 px radius trigger, primary purple on
 * selected day, 16 px radius popover.
 */
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: Date;
  max?: Date;
  className?: string;
  locale?: string;
}

const MONTH_NAMES_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const WEEKDAYS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function isSameDay(a?: Date | null, b?: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(d?: Date | null) {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value: controlled,
  defaultValue,
  onChange,
  placeholder = "Chọn ngày",
  disabled,
  min,
  max,
  className,
}) => {
  const [internal, setInternal] = React.useState<Date | null>(defaultValue ?? null);
  const value = controlled ?? internal;
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<Date>(startOfMonth(value ?? new Date()));

  const handleSelect = (d: Date) => {
    if (min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return;
    if (max && d > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return;
    if (controlled === undefined) setInternal(d);
    onChange?.(d);
    setOpen(false);
  };

  const monthLabel = `${MONTH_NAMES_VI[view.getMonth()]} ${view.getFullYear()}`;
  const firstWeekday = view.getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-hairline bg-background px-3 py-2 text-[14px] transition-colors",
            "hover:border-primary/40 focus:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_2px_rgba(225,29,116,0.15)]",
            disabled && "cursor-not-allowed opacity-50",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span>{value ? formatDate(value) : placeholder}</span>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-[280px] p-3">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
            }
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tháng trước"
          >
            ‹
          </button>
          <div className="text-[14px] font-medium text-foreground">{monthLabel}</div>
          <button
            type="button"
            onClick={() =>
              setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
            }
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tháng sau"
          >
            ›
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[12px] font-medium text-muted-foreground">
          {WEEKDAYS_VI.map((w) => (
            <div key={w} className="h-7 leading-7">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(view.getFullYear(), view.getMonth(), day);
            const isSelected = isSameDay(date, value);
            const isToday = isSameDay(date, new Date());
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleSelect(date)}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg text-[14px] transition-colors",
                  "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isToday && !isSelected && "border border-primary/40 text-primary",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
                aria-label={formatDate(date)}
                aria-pressed={isSelected}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
          <button
            type="button"
            onClick={() => {
              if (controlled === undefined) setInternal(null);
              onChange?.(null);
            }}
            className="text-[12px] text-muted-foreground hover:text-foreground"
          >
            Xóa
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setView(startOfMonth(now));
              handleSelect(now);
            }}
            className="text-[12px] font-medium text-primary hover:underline"
          >
            Hôm nay
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
DatePicker.displayName = "DatePicker";
