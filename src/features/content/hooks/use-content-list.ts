"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { contentApi } from "../api";
import type { ContentSection } from "@/types";

export function useContentList() {
  return useQuery<ContentSection[]>({
    queryKey: queryKeys.content.list(),
    queryFn: () => contentApi.list().then((r) => r.items),
  });
}
