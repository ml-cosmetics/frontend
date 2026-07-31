import { Container } from "@/components/layout/container";
import { ProductGridSkeleton } from "@/components/storefront/storefront-skeletons";

export default function ProductsLoading() {
  return (
    <Container size="xl" className="py-10 md:py-12">
      <div className="space-y-3">
        <div className="h-3 w-32 animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-10 w-1/3 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="h-4 w-1/2 animate-pulse rounded-xl bg-surface-container-high" />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="h-3 w-20 animate-pulse rounded-full bg-surface-container-high" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-surface-container-high" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 animate-pulse rounded-full bg-surface-container-high" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-surface-container-high" />
        </div>
      </div>
      <div className="mt-8">
        <ProductGridSkeleton count={12} />
      </div>
    </Container>
  );
}
