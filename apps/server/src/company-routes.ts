// COMPANY_ROUTES_V1 - espacio "Hoy" de una empresa.
//
// Dos necesidades del panel:
//   1. Ver de un vistazo lo que esta pasando en la empresa (agentes, tareas y
//      personas), sin abrir cinco vistas.
//   2. Que el OWNER de la empresa pueda dar de alta un agente o una persona.
//
// El rol de plataforma (`user.role`) no sirve para lo segundo: `owner` es un rol
// de EMPRESA (membership) y el permiso sale de la matriz de tenant
// (`members.manage`). El alta crea el usuario con rol de plataforma `user` y
// fija su empresa de entrada para que no tenga que hacer `switch-tenant`.

import { Hono } from "hono";
import { z } from "zod";
import type { AgentRole } from "../../../packages/domain/src/agent.ts";
import type { AgentService } from "./engine/service.ts";
import { tenantAccess, type TenantRoleId } from "./engine/authz/tenant-permissions.ts";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import type { UserService } from "./users.ts";

interface CompanyActor {
  kind: string;
  id: string;
  userId?: string;
}

interface CompanyCtx {
  tenantId: string;
  owner: string;
  actor: CompanyActor;
}

interface StoredTask {
  id: string;
  title: string;
  kind: string;
  status: string;
  updatedAt: string;
  assignedTo?: string;
}

interface CompanyMember {
  userId: string;
  name: string;
  email: string;
  role: TenantRoleId;
  active: boolean;
}

const inviteSchema = z.object({
  email: z.email({ message: "El email no tiene un formato valido" }),
  name: z.string().trim().min(1).max(120).optional(),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres").max(200).optional(),
  // Never `owner`: una empresa tiene un owner y se cambia por operacion, no por
  // el mismo formulario que da de alta a un empleado.
  role: z.enum(["admin", "member"]).default("member"),
});

export function companyRoutes(
  service: AgentService,
  users: UserService,
  global: Store,
  config: Config,
) {
  const app = new Hono<{ Variables: { owner: string; ctx: CompanyCtx } }>();

  /**
   * COMPANY_ACCESS_V1 - relee la membership fresca (el cache enruta, no
   * autoriza), comprueba el estado de la empresa y devuelve el rol de empresa.
   */
  const requireMembership = async (ctx: CompanyCtx) => {
    const tenantService = service.tenantService;
    if (!tenantService) throw new AppError("TenantService no disponible", 503);
    const actorUserId = ctx.actor.kind === "human" ? (ctx.actor.userId ?? ctx.actor.id) : ctx.actor.id;
    const membership = await tenantService.findMembership(actorUserId, ctx.tenantId);
    const access = tenantAccess({
      membership,
      state: await tenantService.tenantState(ctx.tenantId),
    });
    if (access.ok) return { tenantService, membership, role: access.role, actorUserId };

    // COMPANY_LEGACY_SINGLE_TENANT_V1 - un despliegue de una sola empresa no
    // tiene matriz de roles: el admin de plataforma es, de hecho, su owner.
    // Solo se admite donde ese modo existe y la empresa NO tiene memberships
    // durables; si las tiene, "sin fila" significa revocado y se mantiene 403.
    const legacy = config.mode === "sample" || config.authProvider === "session";
    const user = legacy ? await users.getById(actorUserId) : null;
    if (
      user?.role === "admin" &&
      !(await tenantService.hasDurableMemberships(ctx.tenantId).catch(() => true))
    ) {
      return { tenantService, membership: null, role: "owner" as TenantRoleId, actorUserId };
    }
    throw access.error;
  };

  const scanTenant = async <T>(kind: string, tenantId: string, limit: number): Promise<Array<{ owner: string; value: T }>> =>
    global.scanByOwnerPrefix<T>(kind, `${tenantId}:`, limit).catch(() => []);

  // GET /api/company -> estado de la empresa para el espacio "Hoy".
  app.get("/", async (c) => {
    const ctx = c.get("ctx");
    const { tenantService, role } = await requireMembership(ctx);

    const registry = await global
      .get<{ displayName?: string }>("system", "tenant-membership", ctx.tenantId)
      .catch(() => null);

    // Personas: la lista de usuarios es global, la pertenencia a la empresa no.
    const allUsers = await users.list();
    const members: CompanyMember[] = [];
    for (const user of allUsers) {
      const memberships = await tenantService.membershipsFor(user.id);
      const hit = memberships.find((row) => row.tenantId === ctx.tenantId);
      if (!hit) continue;
      members.push({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: hit.role,
        active: user.active,
      });
    }
    members.sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));

    const roles = await scanTenant<AgentRole>("agent-roles", ctx.tenantId, 500);
    const agents = roles.map(({ owner, value }) => ({
      id: value.id,
      name: value.name,
      active: Boolean(value.active),
      owner: peelOwner(owner, ctx.tenantId),
    }));

    const taskRows = await scanTenant<StoredTask>("tasks", ctx.tenantId, 500);
    const tasks = taskRows.map(({ owner, value }) => ({
      id: value.id,
      title: value.title,
      kind: value.kind,
      status: value.status,
      updatedAt: value.updatedAt,
      ...(value.assignedTo ? { assignedTo: value.assignedTo } : {}),
      owner: peelOwner(owner, ctx.tenantId),
    }));
    // scanByOwnerPrefix devuelve orden ascendente por updated_at: las ultimas
    // filas son las mas recientes.
    tasks.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

    const count = (predicate: (task: (typeof tasks)[number]) => boolean) => tasks.filter(predicate).length;

    return c.json({
      tenant: {
        id: ctx.tenantId,
        name: registry?.displayName ?? ctx.tenantId,
      },
      role,
      canManageMembers: role === "owner",
      members,
      agents,
      tasks: {
        total: tasks.length,
        running: count((task) => task.status === "running"),
        waiting: count((task) => task.status === "waiting_approval" || task.status === "waiting_input"),
        succeeded: count((task) => task.status === "succeeded"),
        failed: count((task) => task.status === "failed"),
        recent: tasks.slice(0, 20),
      },
    });
  });

  // POST /api/company/members -> el owner da de alta a una persona en SU empresa.
  //
  // Acepta un email ya registrado (solo anade la membership) o crea la cuenta
  // con email + password. En ambos casos deja la empresa como empresa de
  // entrada si la persona no tenia una, para que su primer login caiga aqui sin
  // pasar por /api/auth/switch-tenant.
  app.post("/members", async (c) => {
    const ctx = c.get("ctx");
    const { tenantService, role } = await requireMembership(ctx);
    if (role !== "owner") {
      throw new AppError("Solo el owner de la empresa puede dar de alta personas", 403, {
        code: "PERMISSION_DENIED",
        permission: "members.manage",
      });
    }

    const body = inviteSchema.parse(await c.req.json());
    const existing = await users.getByEmail(body.email);

    let user = existing;
    let created = false;
    if (!user) {
      if (!body.name) throw new AppError("Falta el nombre", 422, { name: "El nombre es obligatorio" });
      if (!body.password)
        throw new AppError("Falta la contrasena", 422, { password: "La contrasena es obligatoria" });
      user = await users.create({
        email: body.email,
        name: body.name,
        password: body.password,
        role: "user",
      });
      created = true;
    }

    const membership = await tenantService.addMembership(user.id, ctx.tenantId, body.role);

    // Empresa de entrada: solo si la persona no tiene ya una primaria. Mover la
    // empresa de alguien que ya trabaja en otra seria un efecto colateral que el
    // owner de esta empresa no puede provocar.
    const primary = await global
      .get<{ tenantId?: string }>(user.id, "tenant-membership", "default")
      .catch(() => null);
    if (!primary?.tenantId) await tenantService.setMembership(user.id, ctx.tenantId);

    return c.json(
      {
        ok: true,
        created,
        tenantId: ctx.tenantId,
        user: { id: user.id, email: user.email, name: user.name },
        role: membership.role,
      },
      201,
    );
  });

  return app;
}

/** `tenantId:userId` -> `userId`. */
function peelOwner(owner: string, tenantId: string): string {
  const prefix = `${tenantId}:`;
  return owner.startsWith(prefix) ? owner.slice(prefix.length) : owner;
}
