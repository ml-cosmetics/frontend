import { Container } from "@/components/layout/container";

export default function FaqLoading() {
  return (
    <Container size="xl" className="py-10 md:py-16">
      <div className="mx-auto mb-10 max-w-xl space-y-3 text-center">
        <div className="mx-auto h-3 w-32 animate-pulse rounded-full bg-surface-container-high" />
        <div className="mx-auto h-12 w-2/3 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="mx-auto h-4 w-1/2 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="mx-auto h-12 w-full animate-pulse rounded-full bg-surface-container-high" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="h-72 animate-pulse rounded-xl bg-surface-container-low" />
        <div className="h-72 animate-pulse rounded-xl bg-surface-container-low" />
      </div>
    </Container>
  );
}