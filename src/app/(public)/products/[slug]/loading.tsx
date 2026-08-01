import { Container } from "@/components/layout/container";

/**
 * Loading UI for the product detail route. Mirrors the two-column
 * layout (gallery left, info right) so the layout doesn't jump when
 * the detail payload arrives.
 */
export default function ProductDetailLoading() {
  return (
    <Container size="xl" className="py-10 md:py-12">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
        <div className="space-y-3 md:grid md:grid-cols-[80px_1fr] md:gap-4 md:space-y-0">
          <div className="flex gap-2 overflow-x-auto md:flex-col md:gap-3 md:pr-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                aria-hidden
                className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-surface-container-high"
              />
            ))}
          </div>
          <div
            aria-hidden
            className="order-first aspect-[4/5] w-full animate-pulse rounded-xl bg-surface-container-high md:order-2"
          />
        </div>
        <div className="space-y-4" aria-hidden>
          <div className="h-6 w-24 animate-pulse rounded-full bg-surface-container-high" />
          <div className="h-10 w-3/4 animate-pulse rounded-xl bg-surface-container-high" />
          <div className="h-8 w-1/3 animate-pulse rounded-xl bg-surface-container-high" />
          <div className="space-y-2 pt-4">
            <div className="h-4 w-32 animate-pulse rounded-xl bg-surface-container-high" />
            <div className="h-4 w-full animate-pulse rounded-xl bg-surface-container-high" />
            <div className="h-4 w-full animate-pulse rounded-xl bg-surface-container-high" />
            <div className="h-4 w-5/6 animate-pulse rounded-xl bg-surface-container-high" />
          </div>
        </div>
      </div>
    </Container>
  );
}
