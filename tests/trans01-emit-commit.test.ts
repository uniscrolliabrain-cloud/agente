// TRANS01_E03_AFTER_COMMIT_V1 - el bus conserva la semantica de afterCommit:
// dentro de una transaccion el evento queda pendiente y solo se publica al
// confirmar; un rollback no deja evento ni notificacion. No se sustituye el
// outbox/inbox durable existente (DurableProjector) por publicacion inmediata.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";

let db: Store;
let bus: EventBus;
before(async () => {
  db = await createStore();
  bus = new EventBus(db);
});
after(async () => {
  await db.close();
});

test("emit dentro de una transaccion queda pendiente hasta el commit", async () => {
  let pending: boolean | undefined;
  let persistedInside: boolean | undefined;
  let insideId = "";
  await db.transaction(async () => {
    const result = await bus.emit(
      "owner-tx",
      "task.created",
      { kind: "task", id: "t-tx" },
      { title: "T", kind: "agent" },
      { tenantId: "tenant-tx" },
    );
    insideId = result.id;
    pending = result.pendingCommit;
    persistedInside = result.persisted;
    const stored = await db.get("owner-tx", "system-events", result.id);
    assert.ok(stored, "la escritura pertenece a la misma transaccion");
  });
  assert.equal(pending, true);
  assert.equal(persistedInside, false);
  const stored = await db.get("owner-tx", "system-events", insideId);
  assert.ok(stored, "tras el commit el evento persiste");
});

test("un rollback no publica el evento", async () => {
  let result: { id: string; persisted: boolean; error?: string } | undefined;
  await assert.rejects(
    db.transaction(async () => {
      const emitted = await bus.emit(
        "owner-tx-rollback",
        "task.created",
        { kind: "task", id: "t-tx-rb" },
        { title: "T", kind: "agent" },
        { tenantId: "tenant-tx-rollback" },
      );
      result = emitted;
      throw new Error("rollback solicitado");
    }),
    /rollback solicitado/,
  );
  assert.ok(result);
  assert.equal(result?.persisted, false);
  assert.match(String(result?.error), /ROLLED_BACK/);
  assert.equal(await db.get("owner-tx-rollback", "system-events", result!.id), null);
});
