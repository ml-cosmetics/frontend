import { Container } from "@/components/layout/container";

export default function WishlistLoading() {
  return (
    <Container size="xl" className="py-10 md:py-16">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-32 animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-12 w-2/3 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="h-4 w-1/2 animate-pulse rounded-xl bg-surface-container-high" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="aspect-[4/5] animate-pulse rounded-xl bg-surface-container-low"
          />
        ))}
      </div>
    </Container>
  );
}