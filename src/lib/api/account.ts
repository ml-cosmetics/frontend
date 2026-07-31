import { get, patch } from "./client";
import { adminApiClient } from "./axios";
import type {
  AccountActivityItem,
  AccountProfile,
  UpdateAccountProfileInput,
} from "@/types";

/**
 * Account / profile API — admin surface under `/admin/account`. The
 * backend exposes the operator's own profile (read + update) and a
 * small recent-activity feed for the profile sidebar. All routes are
 * admin-only.
 */
export const accountApi = {
  profile(): Promise<AccountProfile> {
    return get<AccountProfile>(adminApiClient, "/admin/account/profile");
  },

  updateProfile(input: UpdateAccountProfileInput): Promise<AccountProfile> {
    return patch<AccountProfile, UpdateAccountProfileInput>(
      adminApiClient,
      "/admin/account/profile",
      input,
    );
  },

  recentActivity(): Promise<{ items: AccountActivityItem[] }> {
    return get<{ items: AccountActivityItem[] }>(adminApiClient, "/admin/account/activity");
  },
};