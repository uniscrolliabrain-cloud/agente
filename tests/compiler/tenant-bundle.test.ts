// TENANT_BUNDLE_TEST_V1 - 3 casos: valido, roto, incompleto.
import { test } from "node:test";
import assert from "node:assert/strict";
import { tenantBundleSchema } from "../../packages/domain/src/tenant-bundle.ts";

const valid = {
  tenantId: "mi-agencia",
  company: { name: "Mi Agencia", sector: "agencia-ia", description: "Agencia de IA" },
  channels: { chat: { enabled: true } },
  agents: [{ id: "atencion", name: "Ana", tone: "warm", objetivo: "Atender leads" }],
  processes: [],
  capabilities: { enabled: [], disabled: [] },
  config: { fast: { provider: "google", model: "gemini-2.0-flash" }, slow: { provider: "google", model: "gemini-2.0-flash" } },
};

test("bundle valido pasa el schema", () => {
  const parsed = tenantBundleSchema.parse(valid);
  assert.equal(parsed.tenantId, "mi-agencia");
  assert.equal(parsed.agents.length, 1);
});

test("bundle sin agentes falla", () => {
  assert.throws(() => tenantBundleSchema.parse({ ...valid, agents: [] }));
});

test("bundle sin company falla", () => {
  const { company: _omit, ...rest } = valid;
  assert.throws(() => tenantBundleSchema.parse(rest));
});