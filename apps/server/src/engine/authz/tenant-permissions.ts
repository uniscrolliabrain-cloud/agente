// TENANT_PERMISSIONS_V1 - permisos por actor dentro de una empresa.
//
// Por que existe: el rol del usuario (`user.role`: admin | user) es un rol de
// PLATAFORMA — dice si alguien administra el despliegue entero. El rol de la
// membership (`owner` | `admin` | `member`) es un rol de EMPRESA y no debe
// confundirse con el anterior: un owner de una empresa no puede tocar otra ni
// el panel global.
//
// La matriz es deliberadamente pequeña y en positivo: no hay comodines, y todo
// lo que no está concedido se deniega (fail-closed). `approve` queda fuera del
// rol `member` a propósito: preparar una acción no es aprobarla.

import { AppError } from "../../errors.ts";
import type { TenantMembership } from "../tenant.ts";

export const TENANT_ROLES = ["owner", "admin", "member"] as const;
export type TenantRoleId = (typeof TENANT_ROLES)[number];

export const TENANT_PERMISSIONS = [
  /** Administrar la empresa: miembros, estado, ajustes. */
  "tenant.admin",
  /** Dar de alta, cambiar rol o revocar miembros. */
  "members.manage",
  /** Leer registros de la empresa. */
  "records.read",
  /** Preparar una acción que otro aprobará. */
  "actions.prepare",
  /** Aprobar el despacho de una acción preparada. */
  "actions.approve",
] as const;

export type TenantPermission = (typeof TENANT_PERMISSIONS)[number];

// TENANT_PERMISSION_MATRIX_V1 - owner administra; admin (Operaciones) lee,
// prepara y aprueba; member (Comercial) lee y prepara, pero no aprueba.
const MATRIX: Record<TenantRoleId, readonly TenantPermission[]> = {
  owner: ["tenant.admin", "members.manage", "records.read", "actions.prepare", "actions.approve"],
  admin: ["records.read", "actions.prepare", "actions.approve"],
  member: ["records.read", "actions.prepare"],
};

export function isTenantRole(value: string): value is TenantRoleId {
  return (TENANT_ROLES as readonly string[]).includes(value);
}

export function permissionsFor(role: TenantRoleId): readonly TenantPermission[] {
  return MATRIX[role] ?? [];
}

export function can(role: TenantRoleId, permission: TenantPermission): boolean {
  return permissionsFor(role).includes(permission);
}

/**
 * TENANT_PERMISSION_ENFORCE_V1 - denegación auditable. El `code` es estable
 * para que la UI y los tests distingan "no tienes permiso" de "no eres de esta
 * empresa" (`TENANT_MISMATCH`) y de "la empresa está suspendida".
 */
export function assertPermission(role: TenantRoleId, permission: TenantPermission): void {
  if (!can(role, permission)) {
    throw new AppError(`Permiso ${permission} requerido`, 403, {
      code: "PERMISSION_DENIED",
      permission,
      role,
    });
  }
}

export interface TenantState {
  suspended: boolean;
  reason?: string;
  at?: string;
}

/** TENANT_SUSPENSION_GUARD_V1 - una empresa suspendida no opera, ni para el owner. */
export function assertTenantActive(state: TenantState | null | undefined): void {
  if (state?.suspended) {
    throw new AppError("Empresa suspendida", 403, {
      code: "TENANT_SUSPENDED",
      ...(state.reason ? { reason: state.reason } : {}),
    });
  }
}

/**
 * TENANT_ACCESS_V1 - decisión completa para una operación sensible: vigencia de
 * la membership (revocación en caliente), estado de la empresa y permiso. La
 * membership se pasa ya releída del store: el caché del servicio no vale para
 * decidir, sólo para enrutar.
 */
export function tenantAccess(input: {
  membership: TenantMembership | null | undefined;
  state: TenantState | null | undefined;
  permission?: TenantPermission;
}): { ok: true; role: TenantRoleId; permissions: readonly TenantPermission[] } | { ok: false; error: AppError } {
  if (!input.membership) {
    return {
      ok: false,
      error: new AppError("No eres miembro de esta empresa", 403, {
        code: "NO_MEMBERSHIP",
      }),
    };
  }
  try {
    assertTenantActive(input.state);
    if (input.permission) assertPermission(input.membership.role, input.permission);
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error };
    throw error;
  }
  return {
    ok: true,
    role: input.membership.role,
    permissions: permissionsFor(input.membership.role),
  };
}
