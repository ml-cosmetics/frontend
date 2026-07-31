import { Container } from "@/components/layout/container";

export default function PromotionsLoading() {
  return (
    <Container size="xl" className="py-10 md:py-16">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-32 animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-10 w-2/3 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="h-4 w-1/2 animate-pulse rounded-xl bg-surface-container-high" />
      </div>
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="h-56 animate-pulse rounded-xl bg-surface-container-low" />
        <div className="h-56 animate-pulse rounded-xl bg-surface-container-low" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-44 animate-pulse rounded-xl bg-surface-container-low"
          />
        ))}
      </div>
    </Container>
  );
}