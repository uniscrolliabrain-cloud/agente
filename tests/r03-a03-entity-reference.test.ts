import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveEntityReference } from "../apps/server/src/engine/context/entity-reference.ts";
import type { BusinessEntity } from "../packages/domain/src/business.ts";

function campaign(id: string, name: string): BusinessEntity {
  return {
    id, name, type: "campaign", properties: {}, schemaVersion: "1.0", version: 1,
    provenance: { source: "test", actor: "test", updatedAt: "2026-01-01T00:00:00Z" },
  };
}

const local = [campaign("campaña-a", "Norte"), campaign("b", "Norte"), campaign("c", "Sur")];
const foreign = campaign("otra-empresa", "Norte");
const graph = {
  async getEntity(owner: string, id: string) {
    const visible = owner === "owner" ? local : [foreign];
    return visible.find((entity) => entity.id === id) ?? null;
  },
  async listEntities(owner: string, type?: string) {
    const visible = owner === "owner" ? local : [foreign];
    return visible.filter((entity) => entity.type === type);
  },
};
const resolve = (reference: string) => resolveEntityReference(graph, "owner", {
  reference, type: "campaign", publicUrl: "https://panel.example.test",
});

test("un enlace interno identifica la campaña incluso con nombres repetidos", async () => {
  assert.deepEqual(await resolve("https://panel.example.test/api/business/entities/campa%C3%B1a-a"), {
    kind: "resolved", entityId: "campaña-a",
  });
  assert.deepEqual(await resolve("/api/business/entities/otra-empresa"), { kind: "missing" });
  assert.deepEqual(await resolve("https://external.example.test/api/business/entities/b"), { kind: "missing" });
});

test("un nombre ambiguo pide enlace y un nombre único se resuelve", async () => {
  const ambiguous = await resolve(" Norte ");
  assert.equal(ambiguous.kind, "clarify");
  assert.match(ambiguous.question, /enlace/);
  assert.deepEqual(await resolve("SUR"), { kind: "resolved", entityId: "c" });
});
