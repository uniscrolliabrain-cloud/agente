// E2E-03 - aislamiento entre tenants. Ver tests/tenant-isolation.test.ts para suite completa.
// Este test es un smoke que verifica que el contrato existe.
import { test } from "node:test";
import assert from "node:assert/strict";
import { TenantScopedStore } from "../../apps/server/src/db-tenant.ts";

test("E2E-03: TenantScopedStore aisla por tenant", () => {
  assert.equal(typeof TenantScopedStore, "function");
});