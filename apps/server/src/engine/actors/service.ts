// ACTOR_SERVICE_RESOLVE_V2 - resuelve el Actor desde el JwtPayload VERIFICADO.
//
// Fail-closed: sub sin User -> 401; User inactive -> 403; JWT sin claim de
// tenant -> 401; claim de un tenant del que no es miembro -> 403.
//
// V1 resolvia el tenant con la membership unica del owner, asi que el claim del
// token se ignoraba: un usuario con acceso a dos empresas escribia siempre en la
// primera. Ahora el tenant sale del token y la membership (`user-tenants`) es la
// que autoriza. Primer login de un usuario sin ninguna fila: se materializa la
// membership del claim (lo firma el proveedor de auth, no el cliente).
import type { HumanActor } from "../../../../../packages/domain/src/actor.ts";
import { tenantClaimOf, type JwtPayload } from "../../../../../packages/domain/src/jwt.ts";
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

    const claimedTenant = tenantClaimOf(jwtPayload);
    if (!claimedTenant) {
      // ACTOR_REQUIRE_TENANT_CLAIM_V1 - sin claim no hay zona. Caer a "default"
      // es exactamente el fallback que mezcla empresas en produccion.
      throw new AppError("JWT without tenant claim", 401);
    }

    const memberships = await this.deps.tenants.membershipsFor(user.id);
    let membership = memberships.find((row) => row.tenantId === claimedTenant);
    if (!membership) {
      if (memberships.length > 0) {
        throw new AppError("Actor is not a member of the claimed tenant", 403);
      }
      // Primer acceso: el claim viene firmado por el proveedor de auth.
      membership = await this.deps.tenants.addMembership(
        user.id,
        claimedTenant,
        user.role === "admin" ? "owner" : "member",
      );
    }

    return {
      kind: "human",
      id: user.id,
      tenantId: membership.tenantId,
      userId: user.id,
      roles: [
        membership.role === "owner" || membership.role === "admin" || user.role === "admin"
          ? "owner"
          : "employee",
      ],
      profile: {
        name: user.name,
        email: user.email,
        language: "es",
      },
      active: Boolean(user.active),
    };
  }
}
