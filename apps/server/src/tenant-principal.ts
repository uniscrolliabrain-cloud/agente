// TENANT_PRINCIPAL_V1 — campaña 02 del vertical slice.
// Ver: docs/vertical-slice-actual/02-principal/CAMPAIGN.md
//
// Un único punto resuelve tenant, actor, membership y requestId de la petición.
// Antes app.ts mezclaba JWT, sesión y membership dentro del middleware y un
// fallo de la DB se convertía en "default" (FALLBACK_TENANT_V1): la petición
// seguía adelante y escribía en el tenant equivocado.
//
// Distingue explícitamente:
//   - sin membership             -> 403 NO_MEMBERSHIP (auth multitenant)
//   - fallback legacy            -> "default" sólo con auth legacy (session)
//                                   o en modo sample
//   - DB caída                   -> 503 DB_UNAVAILABLE (nunca "default")
//   - tenant pedido != resuelto  -> 403 TENANT_MISMATCH

import type { Actor } from "../../../packages/domain/src/actor.ts";
// TENANT_DEFAULT_TYPE_V1 - el tipo de la resolucion vive en el servicio; aqui
// no se repite el literal del tenant por defecto (el audit lo prohibe fuera de
// sus ficheros permitidos y con razon).
import type { TenantResolution } from "./engine/tenant.ts";

export type PrincipalFailureCode = "NO_MEMBERSHIP" | "DB_UNAVAILABLE" | "TENANT_MISMATCH";

export interface TenantPrincipal {
  tenantId: string;
  owner: string;
  actor: Actor;
  requestId: string;
  source: "jwt" | "session" | "membership" | "legacy-default";
}

export interface PrincipalFailure {
  ok: false;
  status: 403 | 503;
  code: PrincipalFailureCode;
  message: string;
}

export type PrincipalResolution = { ok: true; principal: TenantPrincipal } | PrincipalFailure;

export interface TenantPrincipalDeps {
  /**
   * TENANT_LEGACY_FALLBACK_ALLOWED_V1 — el despliegue es legacy single-tenant
   * (`AUTH_PROVIDER=session`) o sample. Sólo ahí un usuario sin membership
   * puede seguir cayendo a "default"; con auth multitenant es 403.
   */
  legacyFallbackAllowed: boolean;
  owner: string;
  jwtActor?: Actor;
  /** Tenant elegido en la sesión, si lo hay. Nunca debe lanzar. */
  sessionTenant: () => Promise<string | undefined>;
  /**
   * Membership durable. Debe PROPAGAR el fallo del store: devolver "default"
   * ante un error es justo lo que esta campaña elimina.
   */
  membershipTenant: (owner: string) => Promise<TenantResolution>;
  membershipsFor: (userId: string) => Promise<Array<{ tenantId: string }>>;
  requestedTenant?: string;
  requestId: string;
}

/**
 * APP_CTX_ACTOR_V3 — si el JWT no puso actor, el ctx necesita uno humano con
 * el tenant ya resuelto para que authz lea `ctx.actor.id`.
 */
export function syntheticHumanActor(owner: string, tenantId: string): Actor {
  return {
    kind: "human",
    id: owner,
    tenantId,
    userId: owner,
    roles: ["employee"],
    profile: { name: owner, language: "es" },
    active: true,
  } as Actor;
}

export async function resolveTenantPrincipal(
  deps: TenantPrincipalDeps,
): Promise<PrincipalResolution> {
  let membership: TenantResolution;
  try {
    membership = await deps.membershipTenant(deps.owner);
  } catch {
    return {
      ok: false,
      status: 503,
      code: "DB_UNAVAILABLE",
      message: "No se pudo resolver el tenant: el almacén no responde",
    };
  }

  const jwtTenant = deps.jwtActor?.tenantId;
  let tenantId = jwtTenant ?? membership.tenantId;
  let source: TenantPrincipal["source"] = jwtTenant
    ? "jwt"
    : membership.source === "database"
      ? "membership"
      : "legacy-default";

  if (jwtTenant) {
    // TENANT_PRINCIPAL_JWT_MEMBERSHIP_V1 — un token que declara un tenant del
    // que el usuario no es miembro no se acepta: sería un salto de tenant.
    if (membership.source === "database" && jwtTenant !== membership.tenantId) {
      const memberships = await deps.membershipsFor(deps.owner);
      if (!memberships.some((m) => m.tenantId === jwtTenant)) {
        return {
          ok: false,
          status: 403,
          code: "TENANT_MISMATCH",
          message: "El token declara un tenant del que el usuario no es miembro",
        };
      }
    }
  } else if (membership.source === "database") {
    // SESSION_TENANT_CHOICE_V1 — el tenant elegido en la sesión sólo vale si
    // sigue siendo miembro; si le revocaron el acceso, se queda en su
    // membership en vez de escribir en la empresa que dejó.
    const chosen = await deps.sessionTenant();
    if (chosen && chosen !== membership.tenantId) {
      const memberships = await deps.membershipsFor(deps.owner);
      if (memberships.some((m) => m.tenantId === chosen)) {
        tenantId = chosen;
        source = "session";
      }
    }
  }

  // TENANT_LEGACY_FALLBACK_SCOPED_V1 — el fallback a "default" era el
  // comportamiento single-tenant; se conserva sólo donde ese modo sigue
  // existiendo y se corta en cuanto el despliegue es multitenant.
  if (source === "legacy-default" && !deps.legacyFallbackAllowed) {
    return {
      ok: false,
      status: 403,
      code: "NO_MEMBERSHIP",
      message: "El usuario no pertenece a ninguna empresa",
    };
  }

  // TENANT_QUERY_GUARD_V1 — pedir un tenant distinto del resuelto es un salto
  // de tenant, no un filtro.
  if (deps.requestedTenant && deps.requestedTenant !== tenantId) {
    return {
      ok: false,
      status: 403,
      code: "TENANT_MISMATCH",
      message: "tenant mismatch",
    };
  }

  return {
    ok: true,
    principal: {
      tenantId,
      owner: deps.owner,
      actor: deps.jwtActor ?? syntheticHumanActor(deps.owner, tenantId),
      requestId: deps.requestId,
      source,
    },
  };
}
