// BOOTSTRAP_TENANT_TEST_V1 - 3 casos. ROJO A PROPOSITO: el stub devuelve registered: 0.
// TODO(cline): implementar bootstrapTenant hasta que estos 3 pasen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { bootstrapTenant } from "../../apps/server/src/engine/compiler/bootstrap-tenant.ts";
import type { TenantBundle } from "../../packages/domain/src/tenant-bundle.ts";

const base: TenantBundle = {
  version: "1.0.0",
  tenantId: "mi-agencia",
  company: { name: "Mi Agencia", sector: "agencia-ia", description: "", services: [], timezone: "Europe/Madrid", language: "es" },
  channels: { chat: { enabled: true, config: {} } },
  agents: [{ id: "atencion", name: "Ana", tone: "warm", avatar: "sky", objetivo: "Atender", sops: [], memories: [] }],
  processes: [],
  capabilities: { enabled: ["lead.create", "lead.search"], disabled: [] },
  config: { fast: { provider: "google", model: "gemini-2.0-flash" }, slow: { provider: "google", model: "gemini-2.0-flash" }, maxSteps: 6, quota: { tokensPerDay: 1000000, costEurPerDay: 20, fastCallsPerHour: 1000, slowCallsPerHour: 500 } },
};

function makeDeps() {
  const caps: unknown[] = [];
  const personas: unknown[] = [];
  const sops: unknown[] = [];
  return {
    caps, personas, sops,
    deps: {
      capabilities: { register: (c: unknown) => caps.push(c), list: async () => caps },
      personas: { register: (_t: string, p: unknown) => personas.push(p), list: () => personas },
      sops: { register: (_t: string, s: unknown) => sops.push(s), list: () => sops },
    },
  };
}

test("bootstrap registra las capabilities del bundle", async () => {
  const d = makeDeps();
  const result = await bootstrapTenant(base, d.deps);
  assert.equal(result.registered.capabilities, 2);
  assert.equal(d.caps.length, 2);
});

test("bootstrap registra los agentes del bundle", async () => {
  const d = makeDeps();
  const result = await bootstrapTenant(base, d.deps);
  assert.equal(result.registered.agents, 1);
  assert.equal(d.personas.length, 1);
});

test("bootstrap registra los canales del bundle", async () => {
  const d = makeDeps();
  const result = await bootstrapTenant(base, d.deps);
  assert.equal(result.registered.channels, 1);
});