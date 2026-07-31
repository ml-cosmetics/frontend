import { del, get, patch, post } from "./client";
import { adminApiClient } from "./axios";
import type {
  CreateRoleInput,
  ID,
  PermissionMatrix,
  PermissionStats,
  Role,
  UpdatePermissionMatrixInput,
  UpdateRoleInput,
} from "@/types";

/**
 * Permissions / RBAC API — admin surface. The backend splits role
 * metadata (`/admin/permissions/roles`) from the per-role matrix
 * (`/admin/permissions/roles/:id/matrix`). Creating a role returns
 * the new entity so the caller can navigate into the editor.
 */
export const permissionsApi = {
  listRoles(): Promise<{ items: Role[] }> {
    return get<{ items: Role[] }>(adminApiClient, "/admin/permissions/roles");
  },

  getRole(id: ID): Promise<Role> {
    return get<Role>(adminApiClient, `/admin/permissions/roles/${id}`);
  },

  createRole(input: CreateRoleInput): Promise<Role> {
    return post<Role, CreateRoleInput>(adminApiClient, "/admin/permissions/roles", input);
  },

  updateRole(id: ID, input: UpdateRoleInput): Promise<Role> {
    return patch<Role, UpdateRoleInput>(
      adminApiClient,
      `/admin/permissions/roles/${id}`,
      input,
    );
  },

  deleteRole(id: ID): Promise<void> {
    return del<void>(adminApiClient, `/admin/permissions/roles/${id}`);
  },

  getMatrix(id: ID): Promise<PermissionMatrix> {
    return get<PermissionMatrix>(adminApiClient, `/admin/permissions/roles/${id}/matrix`);
  },

  updateMatrix(
    id: ID,
    input: UpdatePermissionMatrixInput,
  ): Promise<PermissionMatrix> {
    return patch<PermissionMatrix, UpdatePermissionMatrixInput>(
      adminApiClient,
      `/admin/permissions/roles/${id}/matrix`,
      input,
    );
  },

  stats(): Promise<PermissionStats> {
    return get<PermissionStats>(adminApiClient, "/admin/permissions/stats");
  },
};