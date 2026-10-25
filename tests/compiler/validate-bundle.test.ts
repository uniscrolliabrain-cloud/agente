// VALIDATE_BUNDLE_TEST_V1 - 3 casos. ROJO A PROPOSITO: el stub devuelve ok:true.
// TODO(cline): implementar validateBundle hasta que estos 3 pasen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateBundle } from "../../apps/server/src/engine/compiler/validate-bundle.ts";
import type { TenantBundle } from "../../packages/domain/src/tenant-bundle.ts";

const base: TenantBundle = {
  version: "1.0.0",
  tenantId: "mi-agencia",
  company: { name: "Mi Agencia", sector: "agencia-ia", description: "", services: [], timezone: "Europe/Madrid", language: "es" },
  channels: { chat: { enabled: true, config: {} } },
  agents: [{ id: "atencion", name: "Ana", tone: "warm", avatar: "sky", objetivo: "Atender", sops: [], memories: [] }],
  processes: [],
  capabilities: { enabled: [], disabled: [] },
  config: { fast: { provider: "google", model: "gemini-2.0-flash" }, slow: { provider: "google", model: "gemini-2.0-flash" }, maxSteps: 6, quota: { tokensPerDay: 1000000, costEurPerDay: 20, fastCallsPerHour: 1000, slowCallsPerHour: 500 } },
};

test("bundle valido pasa validateBundle", async () => {
  const result = await validateBundle(base);
  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
});

test("bundle con agente sin tools falla", async () => {
  const broken = { ...base, agents: [{ ...base.agents[0], allowedTools: ["lead.create"] }] };
  const result = await validateBundle(broken);
  assert.equal(result.ok, false);
});

test("bundle con SOP inexistente falla", async () => {
  const broken = { ...base, processes: [{ id: "p1", name: "P1", sopFile: "sops/inexistente.json", triggers: [] }] };
  const result = await validateBundle(broken);
  assert.equal(result.ok, false);
});