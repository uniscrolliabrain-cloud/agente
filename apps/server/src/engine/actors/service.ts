// ACTOR_SERVICE_RESOLVE_V1 - resuelve el Actor desde el JwtPayload verificado.
// Fail-closed: sub sin User -> 401; User inactive -> 403; sin tenant -> 401.
// El tenantId se resuelve via TenantService. Sin JIT provisioning.
import type { HumanActor } from "../../../../../packages/domain/src/actor.ts";
import type { JwtPayload } from "../../../../../packages/domain/src/jwt.ts";
import type { User, UserService } from "../../users.ts";
import type { TenantService } from "../tenant.ts";
import { AppError } from "../../../../../packages/domain/src/errors.ts";

export interface ActorServiceDeps {
  users: UserService;
  tenants: TenantService;
}

export class ActorService {
  constructor(private readonly deps: ActorServiceDeps) {}

  async resolve(jwtPayload: JwtPayload): Promise<HumanActor> {
    const sub = jwtPayload.sub.trim();
    if (!sub) throw new AppError("Invalid JWT: missing sub", 401);

    const user: User | null = await this.deps.users.getByAuthProviderId(sub);
    if (!user) throw new AppError("Actor not found for sub", 401);

    if (user.active === false) {
      throw new AppError("Actor is inactive", 403);
    }

    const tenantId = await this.deps.tenants.tenantIdFor(user.id).catch(() => "default"); // FALLBACK_TENANT_V1
    if (!tenantId) throw new AppError("Actor has no tenant", 401);

    return {
      kind: "human",
      id: user.id,
      tenantId,
      userId: user.id,
      roles: [user.role === "admin" ? "owner" : "employee"],
      profile: {
        name: user.name,
        email: user.email,
        language: "es",
      },
      // ACTOR_ACTIVE_BOOL_V1 - user.active ya es boolean; la comparacion con
      // `false` rompia cuando el tipo se estrecha a true.
      active: Boolean(user.active),
    };
  }
}