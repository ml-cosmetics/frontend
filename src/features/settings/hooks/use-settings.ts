"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { settingsApi } from "../api";
import type { Settings } from "@/types";

/**
 * `useSettings` — fetches the singleton settings record.
 */
export function useSettings() {
  return useQuery<Settings>({
    queryKey: queryKeys.settings.singleton(),
    queryFn: () => settingsApi.get(),
  });
}
