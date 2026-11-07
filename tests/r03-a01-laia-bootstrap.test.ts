import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { bootstrapPersonas } from "../apps/server/src/engine/agents/personas/bootstrap.ts";
import { PersonaRegistry } from "../apps/server/src/engine/agents/personas/registry.ts";

test("bootstrap provisions Laia once and only for the Agntia tenant", async () => {
  const registry = new PersonaRegistry();
  const clientsDir = fileURLToPath(new URL("../clientes/", import.meta.url));

  const first = await bootstrapPersonas(registry, "agntia", clientsDir);
  const original = registry.get("agntia", "laia");
  assert.ok(original);
  assert.equal(original.persona.capabilities.crossTenant, false);
  assert.equal(first.failed, 0);

  const second = await bootstrapPersonas(registry, "agntia", clientsDir);
  assert.deepEqual(second, first);
  assert.deepEqual(registry.get("agntia", "laia"), original);
  assert.equal(registry.list("agntia").filter(({ persona }) => persona.id === "laia").length, 1);
  assert.equal(registry.get("default", "laia"), undefined);
});
