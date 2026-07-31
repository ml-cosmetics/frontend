"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useBreadcrumbOverride } from "@/components/common/breadcrumb-overrides";
import { useFeaturedCollection } from "../hooks/use-featured-collection";

/**
 * Client-side bridge that resolves a featured-collection ID to its
 * `title` and pushes the friendly label into the breadcrumb store.
 *
 * Why client-side? The admin-only `GET /v1/admin/featured-collections/:id`
 * requires a JWT that lives in `localStorage`; the SSR fetch pipeline
 * never sees it, so a server-side lookup would always 401. The edit
 * page already runs the same query for the form — we just hook the
 * result into the breadcrumb once it lands.
 *
 * Renders nothing — it's a side-effect-only component.
 */
export function FeaturedCollectionBreadcrumbSync({
  collectionId,
}: {
  collectionId: string;
}) {
  const pathname = usePathname();
  const query = useFeaturedCollection(collectionId);
  const title = query.data?.title;

  useBreadcrumbOverride(
    pathname,
    React.useMemo(
      () => (title ? { [collectionId]: title } : null),
      [collectionId, title],
    ),
  );

  return null;
}

FeaturedCollectionBreadcrumbSync.displayName = "FeaturedCollectionBreadcrumbSync";