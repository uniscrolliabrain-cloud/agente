// TRANS01_A02_EFFECT_BOUNDARY_V1 - la conexion revisada se revalida justo
// antes del efecto; una rotacion entre claim y despacho no llega al proveedor.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ActionService } from "../apps/server/src/actions.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import type { ActionProposal } from "../packages/domain/src/index.ts";

let db: Store;
before(async () => {
  db = await createStore();
});
after(async () => {
  await db.close();
});

const email = {
  kind: "email.send" as const,
  data: {
    to: ["sam@example.com"],
    subject: "Visit",
    body: "See attached.",
    cc: [],
    bcc: [],
    attachmentIds: [],
  },
};

test("una conexion rotada tras el claim no llega al proveedor", async () => {
  let reads = 0;
  let calls = 0;
  const service = new ActionService(db, {
    connected: async () => true,
    // 1: propose, 2: decide; a partir de ahi la credencial rota.
    connection: async () => {
      reads += 1;
      return reads <= 2
        ? { id: "conn-a", account: "a@example.com", generation: "g1" }
        : { id: "conn-a", account: "a@example.com", generation: "g2" };
    },
    execute: async () => {
      calls++;
      return "sent";
    },
  });
  const proposal = await service.propose("boundary-user", email);
  const result = await service.decide("boundary-user", proposal.id, proposal.hash, "approve");
  assert.equal(calls, 0, "el ejecutor no puede invocarse con una generacion distinta");
  assert.equal(result.status, "failed");
  assert.match(String(result.error), /rotated|connection changed/i);
  const saved = await db.get<ActionProposal>("boundary-user", "actions", proposal.id);
  assert.equal(saved?.status, "failed");
  assert.notEqual(saved?.status, "succeeded");
});

test("una cuenta cambiada tras el claim tampoco ejecuta", async () => {
  let reads = 0;
  let calls = 0;
  const service = new ActionService(db, {
    connected: async () => true,
    connection: async () => {
      reads += 1;
      return reads <= 2
        ? { id: "conn-a", account: "a@example.com", generation: "g1" }
        : { id: "conn-b", account: "b@example.com", generation: "g1" };
    },
    execute: async () => {
      calls++;
      return "sent";
    },
  });
  const proposal = await service.propose("boundary-account", email);
  const result = await service.decide("boundary-account", proposal.id, proposal.hash, "approve");
  assert.equal(calls, 0);
  assert.equal(result.status, "failed");
  assert.match(String(result.error), /connection changed/i);
});
