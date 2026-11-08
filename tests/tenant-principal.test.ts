// TENANT_PRINCIPAL_TEST_V1 — campaña 02 del vertical slice.
// Cubre la aserción de cierre: tenant ajeno, scope alterado y DB caída fallan
// sin caer a "default". No necesita HTTP ni proveedores.

import assert from "node:assert/strict";
import { test } from "node:test";
import type { Actor } from "../packages/domain/src/actor.ts";
import type { Store } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import {
  resolveTenantPrincipal,
  type TenantPrincipalDeps,
} from "../apps/server/src/tenant-principal.ts";
import { testConfig } from "./helpers/config.ts";

function deps(over: Partial<TenantPrincipalDeps> = {}): TenantPrincipalDeps {
  return {
    legacyFallbackAllowed: false,
    owner: "user-1",
    sessionTenant: async () => undefined,
    membershipTenant: async () => ({ tenantId: "tenant-a", source: "database" }),
    membershipsFor: async () => [{ tenantId: "tenant-a" }],
    requestId: "req-1",
    ...over,
  };
}

function ok(resolution: Awaited<ReturnType<typeof resolveTenantPrincipal>>) {
  assert.equal(resolution.ok, true, resolution.ok ? "" : `${resolution.code}: ${resolution.message}`);
  if (!resolution.ok) throw new Error("se esperaba un principal");
  return resolution.principal;
}

function fail(resolution: Awaited<ReturnType<typeof resolveTenantPrincipal>>) {
  assert.equal(resolution.ok, false);
  if (resolution.ok) throw new Error("se esperaba un fallo");
  return resolution;
}

test("la membership resuelve el tenant y sintetiza el actor", async () => {
  const principal = ok(await resolveTenantPrincipal(deps()));
  assert.equal(principal.tenantId, "tenant-a");
  assert.equal(principal.source, "membership");
  assert.equal(principal.actor.id, "user-1");
  assert.equal(principal.actor.tenantId, "tenant-a");
  assert.equal(principal.requestId, "req-1");
});

test("el tenant del JWT manda y conserva su actor", async () => {
  const actor = { kind: "human", id: "user-1", tenantId: "tenant-b", userId: "user-1", roles: ["owner"] } as Actor;
  const principal = ok(
    await resolveTenantPrincipal(
      deps({ jwtActor: actor, membershipsFor: async () => [{ tenantId: "tenant-a" }, { tenantId: "tenant-b" }] }),
    ),
  );
  assert.equal(principal.tenantId, "tenant-b");
  assert.equal(principal.source, "jwt");
  assert.equal(principal.actor.roles[0], "owner");
});

test("un JWT con tenant ajeno no entra y no cae a default", async () => {
  const actor = { kind: "human", id: "user-1", tenantId: "tenant-b", userId: "user-1", roles: ["owner"] } as Actor;
  const resolution = fail(await resolveTenantPrincipal(deps({ jwtActor: actor })));
  assert.equal(resolution.code, "TENANT_MISMATCH");
  assert.equal(resolution.status, 403);
});

test("el tenant elegido en la sesión se usa si sigue siendo miembro", async () => {
  const principal = ok(
    await resolveTenantPrincipal(
      deps({
        sessionTenant: async () => "tenant-c",
        membershipsFor: async () => [{ tenantId: "tenant-a" }, { tenantId: "tenant-c" }],
      }),
    ),
  );
  assert.equal(principal.tenantId, "tenant-c");
  assert.equal(principal.source, "session");
});

test("el tenant elegido en la sesión se ignora si le revocaron el acceso", async () => {
  const principal = ok(await resolveTenantPrincipal(deps({ sessionTenant: async () => "tenant-c" })));
  assert.equal(principal.tenantId, "tenant-a");
  assert.equal(principal.source, "membership");
});

test("sin membership con auth multitenant devuelve 403 y no escribe en default", async () => {
  const resolution = fail(
    await resolveTenantPrincipal(
      deps({ membershipTenant: async () => ({ tenantId: "default", source: "default" }) }),
    ),
  );
  assert.equal(resolution.code, "NO_MEMBERSHIP");
  assert.equal(resolution.status, 403);
});

test("sin membership en modo legacy (session) conserva el fallback", async () => {
  const principal = ok(
    await resolveTenantPrincipal(
      deps({
        legacyFallbackAllowed: true,
        membershipTenant: async () => ({ tenantId: "default", source: "default" }),
      }),
    ),
  );
  assert.equal(principal.tenantId, "default");
  assert.equal(principal.source, "legacy-default");
});

test("una DB caída devuelve 503 y nunca default", async () => {
  const resolution = fail(
    await resolveTenantPrincipal(
      deps({
        membershipTenant: async () => {
          throw new Error("connect ECONNREFUSED");
        },
      }),
    ),
  );
  assert.equal(resolution.code, "DB_UNAVAILABLE");
  assert.equal(resolution.status, 503);
});

test("TenantService.resolveStrict propaga la caída y el principal responde 503", async () => {
  // Store que falla como una DB caída: `resolve()` devolvería "default",
  // `resolveStrict()` tiene que propagar y el principal traducirlo a 503.
  const caido = {
    get: async () => {
      throw new Error("connect ECONNREFUSED");
    },
    list: async () => [],
  } as unknown as Store;
  const tenants = new TenantService(caido, testConfig());
  const resolution = fail(
    await resolveTenantPrincipal(deps({ membershipTenant: (owner) => tenants.resolveStrict(owner) })),
  );
  assert.equal(resolution.code, "DB_UNAVAILABLE");
  assert.equal(resolution.status, 503);
});

test("pedir otro tenant en la petición es 403", async () => {
  const resolution = fail(await resolveTenantPrincipal(deps({ requestedTenant: "tenant-b" })));
  assert.equal(resolution.code, "TENANT_MISMATCH");
  assert.equal(resolution.status, 403);
});

test("pedir el tenant propio no rompe la lectura", async () => {
  const principal = ok(await resolveTenantPrincipal(deps({ requestedTenant: "tenant-a" })));
  assert.equal(principal.tenantId, "tenant-a");
});
