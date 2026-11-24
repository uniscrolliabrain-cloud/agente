// TRANS01_A01_APPROVAL_HASH_V1 - la decision queda atada a la revision reclamada.
// Evidencia M1/A01: claim con hash esperado, carrera edicion->claim y rollback.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ActionService } from "../apps/server/src/actions.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import type { ActionProposal } from "../packages/domain/src/index.ts";

function deferred<T>() {
  let resolve: (value: T) => void = () => {
    throw new Error("Promise was not initialized");
  };
  const promise = new Promise<T>((fulfill) => {
    resolve = fulfill;
  });
  return { promise, resolve };
}

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

test("una edicion entre la lectura y el claim no aprueba la revision nueva", async (t) => {
  let calls = 0;
  const service = new ActionService(db, {
    execute: async () => {
      calls++;
      return "sent";
    },
    connected: async () => true,
  });
  const proposal = await service.propose("hash-race", email);
  const read = deferred<void>();
  const resume = deferred<void>();
  const originalGet = db.get.bind(db);
  let intercept = true;
  t.mock.method(db, "get", async (...args: Parameters<Store["get"]>) => {
    const result = await originalGet(...args);
    if (intercept && args[0] === "hash-race" && args[1] === "actions") {
      intercept = false;
      read.resolve();
      await resume.promise;
    }
    return result;
  });
  const pending = service.decide("hash-race", proposal.id, proposal.hash, "approve");
  await read.promise;
  // Otro escritor edita la revision mientras la decision esta en vuelo.
  const edited = await db.compareAndSwap<ActionProposal>(
    "hash-race",
    "actions",
    proposal.id,
    { status: "awaiting_review", hash: proposal.hash },
    { hash: "hash-revisado-despues", data: { ...proposal.data, subject: "Otro asunto" } },
  );
  assert.ok(edited, "la edicion concurrente debe ganar antes del claim");
  resume.resolve();
  await assert.rejects(pending, /changed/i);
  assert.equal(calls, 0, "no se puede ejecutar una revision que el usuario no reviso");
  assert.equal(await db.get("hash-race", "approval-requests", proposal.id), null);
  const saved = await db.get<ActionProposal>("hash-race", "actions", proposal.id);
  assert.equal(saved?.status, "awaiting_review");
});

test("deny con revision vieja no deniega la revision nueva", async (t) => {
  const service = new ActionService(db, {
    execute: async () => "sent",
    connected: async () => true,
  });
  const proposal = await service.propose("hash-race-deny", email);
  const read = deferred<void>();
  const resume = deferred<void>();
  const originalGet = db.get.bind(db);
  let intercept = true;
  t.mock.method(db, "get", async (...args: Parameters<Store["get"]>) => {
    const result = await originalGet(...args);
    if (intercept && args[0] === "hash-race-deny" && args[1] === "actions") {
      intercept = false;
      read.resolve();
      await resume.promise;
    }
    return result;
  });
  const pending = service.decide("hash-race-deny", proposal.id, proposal.hash, "deny");
  await read.promise;
  await db.compareAndSwap(
    "hash-race-deny",
    "actions",
    proposal.id,
    { status: "awaiting_review", hash: proposal.hash },
    { hash: "hash-revisado-despues", data: { ...proposal.data, subject: "Otro asunto" } },
  );
  resume.resolve();
  await assert.rejects(pending, /changed/i);
  const saved = await db.get<ActionProposal>("hash-race-deny", "actions", proposal.id);
  assert.equal(saved?.status, "awaiting_review", "deny tampoco puede decidir sobre otra revision");
});

test("el claim del store exige el hash revisado", async () => {
  const service = new ActionService(db, {
    execute: async () => "sent",
    connected: async () => true,
  });
  const proposal = await service.propose("claim-hash", email);
  const now = new Date().toISOString();
  assert.equal(await db.claim("claim-hash", proposal.id, "executing", now, "otro-hash"), null);
  const untouched = await db.get<ActionProposal>("claim-hash", "actions", proposal.id);
  assert.equal(untouched?.status, "awaiting_review");
  const claimed = await db.claim<ActionProposal>("claim-hash", proposal.id, "executing", now, proposal.hash);
  assert.equal(claimed?.status, "executing");
  // Sin quinto argumento se conserva el contrato legacy inventariado.
  const second = await service.propose("claim-hash-legacy", email);
  assert.ok(await db.claim("claim-hash-legacy", second.id, "denied", now));
});

test("un fallo al persistir la aprobacion revierte el claim", async (t) => {
  let calls = 0;
  const service = new ActionService(db, {
    execute: async () => {
      calls++;
      return "sent";
    },
    connected: async () => true,
  });
  const proposal = await service.propose("rollback-user", email);
  const originalPut = db.put.bind(db);
  t.mock.method(db, "put", async (...args: Parameters<Store["put"]>) => {
    if (args[1] === "approval-requests") throw new Error("approval write failed");
    return originalPut(...args);
  });
  await assert.rejects(
    service.decide("rollback-user", proposal.id, proposal.hash, "approve"),
    /approval write failed/,
  );
  const saved = await db.get<ActionProposal>("rollback-user", "actions", proposal.id);
  assert.equal(saved?.status, "awaiting_review", "el claim debe revertirse con la transaccion");
  assert.equal(await db.get("rollback-user", "approval-requests", proposal.id), null);
  assert.equal(calls, 0);
});
