"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { notificationsApi } from "../api";
import type {
  Notification,
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from "@/types";

/**
 * `useMarkNotificationRead` — POST /admin/notifications/:id/read.
 * Optimistically flips `is_read` in the cached list, then
 * reconciles against the response from the server.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation<Notification, Error, string>({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
    onError: (error) => {
      toast.error("Không thể cập nhật thông báo", {
        description: error.message,
      });
    },
  });
}

/**
 * `useMarkAllRead` — POST /admin/notifications/read-all. Invalidates
 * the entire notification cache so the feed + stats refresh.
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation<{ updated: number }, Error, void>({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      toast.success(`Đã đánh dấu ${data.updated} thông báo là đã đọc`);
    },
    onError: (error) => {
      toast.error("Không thể đánh dấu đã đọc", {
        description: error.message,
      });
    },
  });
}

/**
 * `useUpdateNotificationPreferences` — PATCH /admin/notifications/preferences.
 * Replaces the entire preferences record from the server.
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation<NotificationPreferences, Error, UpdateNotificationPreferencesInput>({
    mutationFn: (input) => notificationsApi.updatePreferences(input),
    onSuccess: (next) => {
      queryClient.setQueryData(
        queryKeys.notifications.list({ scope: "preferences" }),
        next,
      );
    },
    onError: (error) => {
      toast.error("Không thể lưu tùy chọn thông báo", {
        description: error.message,
      });
    },
  });
}