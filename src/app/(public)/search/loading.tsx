import { Container } from "@/components/layout/container";
import { ProductGridSkeleton } from "@/components/storefront/storefront-skeletons";

/**
 * Streaming skeleton for `/search`. Mirrors the public storefront
 * layout so the route yields the same first-paint shape whether
 * the page streams in or hydrates from a server-rendered tree.
 */
export default function SearchLoading() {
  return (
    <Container size="xl" className="py-10 md:py-16">
      <div className="mx-auto mb-10 max-w-xl space-y-3 text-center">
        <div className="mx-auto h-3 w-32 animate-pulse rounded-full bg-surface-container-high" />
        <div className="mx-auto h-12 w-2/3 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="mx-auto h-4 w-1/2 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="mx-auto h-12 w-full animate-pulse rounded-full bg-surface-container-high" />
      </div>
      <ProductGridSkeleton count={12} />
    </Container>
  );
}
