"use client";

import * as React from "react";
import {
  ChevronRight,
  Copy,
  Group,
  Key,
  Loader2,
  MoreHorizontal,
  Plus,
  Shield,
  Verified,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import {
  useCreateRole,
  useDeleteRole,
  usePermissionMatrix,
  usePermissionStats,
  useRoleList,
  useUpdateMatrix,
  useUpdateRole,
} from "../hooks";
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  getActionLabel,
  getModuleLabel,
} from "../utils/labels";
import type {
  PermissionAction,
  PermissionCell,
  PermissionModule,
  Role,
} from "@/types";

/**
 * Phân quyền — LuxeOps RBAC surface.
 *
 * Composition:
 *   - Header (title + 2 buttons: Tạo bản sao, Thêm vai trò)
 *   - 4-card KPI strip
 *   - Two-column layout:
 *     - Left (40%): list of roles
 *     - Right (60%): permission matrix for the active role
 *
 * The matrix is module × action. Each cell is a checkbox bound to
 * the cell's `granted` flag. Edits are kept in local state and
 * flushed to the backend via `useUpdateMatrix` when the user clicks
 * "Lưu thay đổi".
 */
export function PermissionsView() {
  const rolesQuery = useRoleList();
  const statsQuery = usePermissionStats();
  const roles = React.useMemo(
    () => rolesQuery.data ?? [],
    [rolesQuery.data],
  );

  const [activeRoleId, setActiveRoleId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (activeRoleId === null && roles.length > 0) {
      setActiveRoleId(roles[0]?.id ?? null);
    }
  }, [activeRoleId, roles]);

  const matrixQuery = usePermissionMatrix(activeRoleId);
  const updateMatrix = useUpdateMatrix(activeRoleId ?? "");

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [createName, setCreateName] = React.useState("");
  const [createDescription, setCreateDescription] = React.useState("");

  const [pendingDelete, setPendingDelete] = React.useState<Role | null>(null);

  const handleSubmitCreate = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!createName.trim()) return;
      try {
        const role = await createRole.mutateAsync({
          name: createName.trim(),
          description: createDescription.trim(),
        });
        setCreateOpen(false);
        setCreateName("");
        setCreateDescription("");
        setActiveRoleId(role.id);
      } catch {
        // toast handled by hook
      }
    },
    [createName, createDescription, createRole],
  );

  const handleCopyRole = React.useCallback(async () => {
    if (!activeRoleId) return;
    const source = roles.find((r) => r.id === activeRoleId);
    if (!source) return;
    try {
      const role = await createRole.mutateAsync({
        name: `${source.name} (bản sao)`,
        description: source.description,
      });
      setActiveRoleId(role.id);
    } catch {
      // toast handled by hook
    }
  }, [activeRoleId, roles, createRole]);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deleteRole.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
      if (activeRoleId === pendingDelete.id) {
        setActiveRoleId(null);
      }
    } catch {
      // toast handled by hook
    }
  }, [pendingDelete, deleteRole, activeRoleId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.02em] text-foreground">
            Phân quyền
          </h1>
          <p className="mt-1 text-[14px] leading-[20px] text-muted-foreground">
            Quản lý vai trò và quyền truy cập cho nhân viên
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyRole}
            disabled={!activeRoleId || createRole.isPending}
            aria-label="Tạo bản sao vai trò hiện tại"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            <span>Tạo bản sao</span>
          </Button>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            aria-label="Thêm vai trò mới"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Thêm vai trò</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          icon={<Shield className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
          label="Vai trò"
          value={statsQuery.data?.roles}
          loading={statsQuery.isLoading}
        />
        <KpiCard
          icon={<Group className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
          label="Thành viên"
          value={statsQuery.data?.members}
          loading={statsQuery.isLoading}
        />
        <KpiCard
          icon={<Key className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
          label="Quyền hệ thống"
          value={statsQuery.data?.permissions}
          loading={statsQuery.isLoading}
        />
        <KpiCard
          icon={<Verified className="h-4 w-4 text-[#e11d74]" aria-hidden="true" />}
          label="Tài khoản Owner"
          value={statsQuery.data?.owner_count}
          loading={statsQuery.isLoading}
          accent
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-4">
          <RoleListPanel
            roles={roles}
            isLoading={rolesQuery.isLoading}
            isError={rolesQuery.isError}
            activeRoleId={activeRoleId}
            onSelect={setActiveRoleId}
            onDelete={setPendingDelete}
          />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-8">
          <MatrixPanel
            matrixQuery={matrixQuery}
            roleId={activeRoleId}
            roleName={
              roles.find((r) => r.id === activeRoleId)?.name ?? "—"
            }
            onSave={(cells) => updateMatrix.mutate({ cells })}
            isSaving={updateMatrix.isPending}
            onRename={async (name) => {
              if (!activeRoleId) return;
              await updateRole.mutateAsync({ id: activeRoleId, input: { name } });
            }}
          />
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm vai trò mới</DialogTitle>
            <DialogDescription>
              Tạo vai trò mới cho nhân viên. Bạn có thể cấu hình ma trận quyền
              sau khi tạo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Tên vai trò</Label>
              <Input
                id="role-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="VD: Nhân viên kho"
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Mô tả</Label>
              <Input
                id="role-description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Mô tả ngắn về vai trò"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={createRole.isPending}>
                {createRole.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden="true" />
                )}
                Tạo vai trò
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xoá vai trò?</DialogTitle>
            <DialogDescription>
              Vai trò &quot;{pendingDelete?.name}&quot; sẽ bị xoá. Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                void handleConfirmDelete();
              }}
              disabled={deleteRole.isPending}
            >
              {deleteRole.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <X className="h-4 w-4" aria-hidden="true" />
              )}
              Xoá vai trò
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * KPI
 * ------------------------------------------------------------------ */

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  loading?: boolean;
  accent?: boolean;
}

function KpiCard({ icon, label, value, loading, accent }: KpiCardProps) {
  return (
    <div className="relative flex flex-col gap-2 overflow-hidden rounded border border-rose-100 bg-white p-4">
      <div className="z-10 flex items-center justify-between">
        <span className="text-[13px] leading-[18px] text-muted-foreground">
          {label}
        </span>
        {icon}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <span className="z-10 font-mono text-[36px] font-semibold leading-[44px] tracking-[-0.04em] text-foreground">
          {value ?? 0}
        </span>
      )}
      {accent && (
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            background:
              "radial-gradient(circle at top right, #A78BFA, transparent 70%)",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Role list
 * ------------------------------------------------------------------ */

interface RoleListPanelProps {
  roles: Role[];
  isLoading: boolean;
  isError: boolean;
  activeRoleId: string | null;
  onSelect: (id: string) => void;
  onDelete: (role: Role) => void;
}

function RoleListPanel({
  roles,
  isLoading,
  isError,
  activeRoleId,
  onSelect,
  onDelete,
}: RoleListPanelProps) {
  return (
    <div className="overflow-hidden rounded border border-rose-100">
      <div className="flex items-center justify-between border-b border-rose-100 bg-surface-container-low px-4 py-3">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.05em] text-foreground">
          DANH SÁCH VAI TRÒ
        </h2>
      </div>
      <div className="flex flex-col">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="m-3 h-12 rounded" />
          ))
        ) : isError ? (
          <div className="p-4 text-[13px] text-destructive">
            Không thể tải danh sách vai trò.
          </div>
        ) : roles.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-muted-foreground">
            Chưa có vai trò nào.
          </div>
        ) : (
          roles.map((role) => (
            <RoleItem
              key={role.id}
              role={role}
              active={role.id === activeRoleId}
              onSelect={() => onSelect(role.id)}
              onDelete={() => onDelete(role)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function RoleItem({
  role,
  active,
  onSelect,
  onDelete,
}: {
  role: Role;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative cursor-pointer border-b border-rose-100 px-4 py-3 transition-colors last:border-b-0",
        active
          ? "border-l-[3px] border-l-[#e11d74] bg-surface-container"
          : "border-l-[3px] border-l-transparent hover:bg-surface-container",
      )}
      aria-pressed={active}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-medium text-foreground">
            {role.name}
          </h3>
          <p className="mt-1 text-[12px] leading-[16px] text-muted-foreground">
            {role.description || "—"}
          </p>
        </div>
        <span className="ml-2 shrink-0 rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.05em] text-foreground">
          {role.member_count} người
        </span>
      </div>
      {!role.is_system && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Xoá vai trò ${role.name}`}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Matrix panel
 * ------------------------------------------------------------------ */

interface MatrixPanelProps {
  matrixQuery: ReturnType<typeof usePermissionMatrix>;
  roleId: string | null;
  roleName: string;
  onSave: (cells: PermissionCell[]) => void;
  isSaving: boolean;
  onRename: (name: string) => Promise<void>;
}

function MatrixPanel({
  matrixQuery,
  roleId,
  roleName,
  onSave,
  isSaving,
  onRename,
}: MatrixPanelProps) {
  const matrix = matrixQuery.data;
  const [draft, setDraft] = React.useState<Record<string, boolean>>({});
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (!matrix) {
      setDraft({});
      setDirty(false);
      return;
    }
    const initial: Record<string, boolean> = {};
    for (const cell of matrix.cells) {
      initial[`${cell.module}:${cell.action}`] = cell.granted;
    }
    setDraft(initial);
    setDirty(false);
  }, [matrix]);

  const handleToggle = React.useCallback(
    (module: PermissionModule, action: PermissionAction) => {
      setDraft((prev) => {
        const key = `${module}:${action}`;
        const next = { ...prev, [key]: !prev[key] };
        return next;
      });
      setDirty(true);
    },
    [],
  );

  const cells = React.useMemo<PermissionCell[]>(() => {
    const out: PermissionCell[] = [];
    for (const moduleKey of PERMISSION_MODULES) {
      for (const actionKey of PERMISSION_ACTIONS) {
        out.push({
          module: moduleKey,
          action: actionKey,
          granted: draft[`${moduleKey}:${actionKey}`] ?? false,
        });
      }
    }
    return out;
  }, [draft]);

  const handleSave = React.useCallback(() => {
    onSave(cells);
    setDirty(false);
  }, [cells, onSave]);

  return (
    <div className="overflow-hidden rounded border border-rose-100">
      <div className="flex items-center justify-between border-b border-rose-100 bg-surface-container-low px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.05em] text-foreground">
            MA TRẬN QUYỀN
          </h2>
          <ChevronRight
            className="h-3 w-3 text-muted-foreground"
            aria-hidden="true"
          />
          <RoleNameEditor
            roleId={roleId}
            initialName={roleName}
            onCommit={onRename}
          />
        </div>
        <button
          type="button"
          disabled={!dirty || isSaving || !roleId}
          onClick={handleSave}
          className={cn(
            "text-[12px] font-medium uppercase tracking-[0.05em] transition-colors",
            dirty && !isSaving
              ? "text-[#e11d74] hover:text-[#db2777]"
              : "cursor-not-allowed text-muted-foreground",
          )}
        >
          {isSaving ? (
            <Loader2 className="inline h-3 w-3 animate-spin" aria-hidden="true" />
          ) : null}
          {" "}
          Lưu thay đổi
        </button>
      </div>

      {matrixQuery.isLoading || !matrix ? (
        <div className="p-4">
          <Skeleton className="h-64 w-full rounded" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-rose-100 bg-white">
                <th className="w-1/3 px-4 py-3 text-[13px] font-medium text-foreground">
                  Module
                </th>
                {PERMISSION_ACTIONS.map((action) => (
                  <th
                    key={action}
                    className="px-2 py-3 text-center text-[12px] font-medium uppercase tracking-[0.05em] text-muted-foreground"
                  >
                    {getActionLabel(action)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MODULES.map((module, idx) => (
                <tr
                  key={module}
                  className={cn(
                    "border-b border-rose-100 transition-colors hover:bg-surface-container",
                    idx === PERMISSION_MODULES.length - 1 && "border-b-0",
                  )}
                >
                  <td className="px-4 py-3 text-[13px] text-foreground">
                    {getModuleLabel(module)}
                  </td>
                  {PERMISSION_ACTIONS.map((action) => {
                    const key = `${module}:${action}`;
                    const granted = draft[key] ?? false;
                    return (
                      <td key={action} className="px-2 py-3 text-center">
                        <Checkbox
                          checked={granted}
                          onCheckedChange={() => handleToggle(module, action)}
                          aria-label={`${getModuleLabel(module)} · ${getActionLabel(action)}`}
                          className="mx-auto border-rose-100 bg-surface data-[state=checked]:border-[#e11d74] data-[state=checked]:bg-[#e11d74] data-[state=checked]:text-[#09090b]"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RoleNameEditor({
  roleId,
  initialName,
  onCommit,
}: {
  roleId: string | null;
  initialName: string;
  onCommit: (name: string) => Promise<void>;
}) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(initialName);

  React.useEffect(() => {
    setValue(initialName);
  }, [initialName]);

  if (!roleId) {
    return <span className="text-[14px] text-[#e11d74]">—</span>;
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-[14px] font-medium text-[#e11d74] transition-colors hover:text-[#db2777]"
      >
        {initialName}
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (value.trim() && value !== initialName) {
          await onCommit(value.trim());
        }
        setEditing(false);
      }}
    >
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setEditing(false)}
        className="h-7 w-48 text-[13px]"
        aria-label="Tên vai trò"
      />
    </form>
  );
}