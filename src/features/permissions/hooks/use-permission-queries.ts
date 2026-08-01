"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { permissionsApi } from "../api";
import type {
  PermissionMatrix,
  PermissionStats,
  Role,
} from "@/types";

export function useRoleList() {
  return useQuery<Role[]>({
    queryKey: queryKeys.permissions.roles(),
    queryFn: () => permissionsApi.listRoles().then((r) => r.items),
  });
}

export function usePermissionStats() {
  return useQuery<PermissionStats>({
    queryKey: queryKeys.permissions.matrix(),
    queryFn: () => permissionsApi.stats(),
  });
}

export function usePermissionMatrix(roleId: string | null) {
  return useQuery<PermissionMatrix>({
    queryKey: roleId
      ? queryKeys.permissions.role(roleId)
      : queryKeys.permissions.matrix(),
    queryFn: () => permissionsApi.getMatrix(roleId as string),
    enabled: Boolean(roleId),
  });
}