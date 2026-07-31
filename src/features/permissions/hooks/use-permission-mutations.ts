"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { permissionsApi } from "../api";
import type {
  CreateRoleInput,
  ID,
  PermissionMatrix,
  Role,
  UpdatePermissionMatrixInput,
  UpdateRoleInput,
} from "@/types";

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation<Role, Error, CreateRoleInput>({
    mutationFn: (input) => permissionsApi.createRole(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() });
      toast.success("Đã tạo vai trò");
    },
    onError: (error) => {
      toast.error("Không thể tạo vai trò", { description: error.message });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation<Role, Error, { id: ID; input: UpdateRoleInput }>({
    mutationFn: ({ id, input }) => permissionsApi.updateRole(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() });
    },
    onError: (error) => {
      toast.error("Không thể cập nhật vai trò", { description: error.message });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ID>({
    mutationFn: (id) => permissionsApi.deleteRole(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() });
      toast.success("Đã xoá vai trò");
    },
    onError: (error) => {
      toast.error("Không thể xoá vai trò", { description: error.message });
    },
  });
}

export function useUpdateMatrix(roleId: ID) {
  const queryClient = useQueryClient();
  return useMutation<
    PermissionMatrix,
    Error,
    UpdatePermissionMatrixInput
  >({
    mutationFn: (input) => permissionsApi.updateMatrix(roleId, input),
    onSuccess: (next) => {
      queryClient.setQueryData(queryKeys.permissions.role(roleId), next);
      toast.success("Đã lưu ma trận quyền");
    },
    onError: (error) => {
      toast.error("Không thể lưu ma trận quyền", {
        description: error.message,
      });
    },
  });
}