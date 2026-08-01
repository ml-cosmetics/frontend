"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Package, ShoppingCart, Users, Layers } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { productsApi } from "@/features/products";
import { ordersApi } from "@/features/orders";
import { customersApi } from "@/features/customers";
import { categoriesApi } from "@/lib/api/categories";
import type { Category, Customer, Order, ProductListItem } from "@/types";

interface SearchResult {
  id: string;
  type: "product" | "order" | "customer" | "category";
  label: string;
  sublabel?: string;
  href: string;
}

function useDebounce<T extends (...args: Parameters<T>) => void>(callback: T, delay: number): T {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  return React.useCallback(
    ((...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay],
  );
}

export function GlobalSearchDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Ctrl+K / Cmd+K to open
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when dialog opens
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const doSearch = React.useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const settled = await Promise.allSettled([
        productsApi.list({ search: q, page: 1, per_page: 5 }),
        ordersApi.list({ search: q, page: 1, per_page: 5 }),
        customersApi.list({ search: q, page: 1, per_page: 5 }),
        categoriesApi.list({ search: q, page: 1, per_page: 5 }),
      ]);

      const items: SearchResult[] = [];

      if (settled[0]?.status === "fulfilled") {
        const { items: prods } = settled[0].value as { items: ProductListItem[] };
        items.push(
          ...prods.map((p) => ({
            id: p.id,
            type: "product" as const,
            label: p.name,
            sublabel: `/${p.slug}`,
            href: `/admin/products/${p.id}/edit`,
          })),
        );
      }

      if (settled[1]?.status === "fulfilled") {
        const { items: ords } = settled[1].value as { items: Order[] };
        items.push(
          ...ords.map((o) => ({
            id: o.id,
            type: "order" as const,
            label: `#${o.id}`,
            sublabel: o.total != null ? `${o.total}₫` : undefined,
            href: `/admin/orders/${o.id}`,
          })),
        );
      }

      if (settled[2]?.status === "fulfilled") {
        const { items: custs } = settled[2].value as { items: Customer[] };
        items.push(
          ...custs.map((c) => ({
            id: c.id,
            type: "customer" as const,
            label: c.full_name,
            sublabel: c.email ?? c.phone,
            href: `/admin/customers/${c.id}/edit`,
          })),
        );
      }

      if (settled[3]?.status === "fulfilled") {
        const { items: cats } = settled[3].value as { items: Category[] };
        items.push(
          ...cats.map((c) => ({
            id: c.id,
            type: "category" as const,
            label: c.name,
            sublabel: c.description || undefined,
            href: `/admin/categories/${c.id}/edit`,
          })),
        );
      }

      setResults(items);
      setActiveIndex(0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useDebounce(doSearch, 300);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setLoading(true);
    debouncedSearch(val);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      navigateTo(results[activeIndex]!);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function navigateTo(result: SearchResult) {
    setOpen(false);
    router.push(result.href);
  }

  const TYPE_ICONS = {
    product: Package,
    order: ShoppingCart,
    customer: Users,
    category: Layers,
  };

  const TYPE_LABELS = {
    product: "Sản phẩm",
    order: "Đơn hàng",
    customer: "Khách hàng",
    category: "Danh mục",
  };

  // Group results by type, preserving insertion order (products → orders → customers → categories)
  const grouped = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const r of results) {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type]!.push(r);
    }
    return groups;
  }, [results]);

  let flatIndex = -1;

  return (
    <>
      {/* Mobile trigger — shown via topbar */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="flex md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Tìm kiếm"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-lg p-0"
          onKeyDown={handleKeyDown}
          aria-label="Tìm kiếm toàn cục"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Input
              ref={inputRef}
              value={query}
              onChange={handleQueryChange}
              placeholder="Tìm sản phẩm, đơn hàng, khách hàng, danh mục…"
              className="h-8 border-0 bg-transparent p-0 text-[14px] leading-[1.6] shadow-none focus-visible:ring-0"
              aria-label="Tìm kiếm"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-autocomplete="list"
              aria-controls="search-results"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />}
            <kbd className="hidden rounded-lg border border-hairline bg-surface-container px-1.5 py-0.5 text-[12px] font-medium leading-[1.4] text-muted-foreground md:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div
            className="max-h-80 overflow-y-auto p-2"
            id="search-results"
            role="listbox"
            aria-label="Kết quả tìm kiếm"
          >
            {!query && (
              <p className="p-4 text-center text-[14px] leading-[1.6] text-muted-foreground">
                Nhấn{" "}
                <kbd className="rounded-lg border border-hairline bg-surface-container px-1.5 py-0.5 text-[12px] font-medium leading-[1.4]">Ctrl+K</kbd> hoặc{" "}
                <kbd className="rounded-lg border border-hairline bg-surface-container px-1.5 py-0.5 text-[12px] font-medium leading-[1.4]">⌘K</kbd> để tìm kiếm
              </p>
            )}

            {query && !loading && results.length === 0 && (
              <p className="p-4 text-center text-[14px] leading-[1.6] text-muted-foreground">
                Không tìm thấy kết quả nào cho &ldquo;{query}&rdquo;
              </p>
            )}

            {(Object.entries(grouped) as [SearchResult["type"], SearchResult[]][]).map(([type, items]) => {
              const Icon = TYPE_ICONS[type];
              return (
                <div key={type} className="mb-2">
                  <p className="mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Icon className="mr-1 inline h-3 w-3" aria-hidden="true" />
                    {TYPE_LABELS[type]}
                  </p>
                  <ul className="space-y-0.5">
                    {items.map((item) => {
                      flatIndex++;
                      const idx = flatIndex;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={idx === activeIndex}
                            onClick={() => navigateTo(item)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[14px] leading-[1.6] transition-colors",
                              idx === activeIndex
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent hover:text-accent-foreground",
                            )}
                          >
                    <span className="flex-1 truncate text-[14px] leading-[1.6] font-medium">{item.label}</span>
                    {item.sublabel && (
                      <span className="truncate text-[12px] font-medium leading-[1.4] text-muted-foreground">{item.sublabel}</span>
                    )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="flex items-center gap-4 border-t border-hairline px-4 py-2 text-[12px] font-medium leading-[1.4] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded-lg border border-hairline bg-surface-container px-1.5 py-0.5">↑</kbd>
                <kbd className="rounded-lg border border-hairline bg-surface-container px-1.5 py-0.5">↓</kbd>
                Điều hướng
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded-lg border border-hairline bg-surface-container px-1.5 py-0.5">Enter</kbd>
                Chọn
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded-lg border border-hairline bg-surface-container px-1.5 py-0.5">Esc</kbd>
                Đóng
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
