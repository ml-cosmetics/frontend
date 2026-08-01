import { Container } from "@/components/layout/container";

export default function TermsLoading() {
  return (
    <Container size="xl" className="py-10 md:py-16">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-32 animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-10 w-2/3 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="h-4 w-1/2 animate-pulse rounded-xl bg-surface-container-high" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="h-64 animate-pulse rounded-xl bg-surface-container-low" />
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-xl bg-surface-container-low" />
          <div className="h-48 animate-pulse rounded-xl bg-surface-container-low" />
        </div>
      </div>
    </Container>
  );
}