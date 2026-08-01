import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading UI for any admin route while the underlying page chunk
 * is being fetched. Matches the chrome (sidebar + topbar) the user
 * already sees so the layout doesn't pop.
 */
export default function AdminLoading() {
  return (
    <div className="flex-1 px-6 py-8">
      <Skeleton className="h-9 w-1/3" />
      <Skeleton className="mt-3 h-4 w-1/2" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="mt-8 h-64" />
    </div>
  );
}
