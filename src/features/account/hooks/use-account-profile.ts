"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { accountApi } from "../api";
import type { AccountActivityItem, AccountProfile } from "@/types";

/**
 * Read the operator's own profile (id, name, contact, prefs).
 */
export function useAccountProfile() {
  return useQuery<AccountProfile>({
    queryKey: queryKeys.account.profile(),
    queryFn: () => accountApi.profile(),
  });
}

/**
 * Read the recent activity feed used by the profile sidebar.
 */
export function useAccountActivity() {
  return useQuery<AccountActivityItem[]>({
    queryKey: queryKeys.account.activity(),
    queryFn: () => accountApi.recentActivity().then((r) => r.items),
  });
}
