import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import {
  installLongitudinal,
  LongitudinalMemory,
} from "../apps/server/src/engine/cognition/v2/longitudinal/memory.ts";

const A = { tenantId: "tenant-a", actorId: "alice", owner: "alice" };
const B = { tenantId: "tenant-b", actorId: "bob", owner: "bob" };

const TEXT =
  "El cliente pidio no prometer plazos. " +
  "Contexto operativo extenso para partir en segmentos. ".repeat(240) +
  "Cierre: revisar factura pendiente.";

test("retencion y borrado por tenant: acotado a la identidad, con criterio obligatorio", async () => {
  const db = await createStore();
  await installLongitudinal(db);
  const memory = new LongitudinalMemory(db);

  const a1 = await memory.ingest(A, { sourceEventId: "evt-a-1", text: TEXT });
  const a2 = await memory.ingest(A, { sourceEventId: "evt-a-2", text: TEXT });
  // Mismo id de evento en otro tenant: es otra fila, no se toca desde A.
  const b1 = await memory.ingest(B, { sourceEventId: "evt-a-1", text: TEXT });
  assert.ok(a1.segments >= 2 && a2.segments >= 2 && b1.segments >= 2);

  // Sin criterio, con dos criterios o con dias invalidos: se rechaza sin borrar nada.
  await assert.rejects(() => memory.purge(A, {}), /LONGITUDINAL_PURGE_INVALID/);
  await assert.rejects(
    () => memory.purge(A, { everything: true, sourceEventId: "evt-a-1" }),
    /LONGITUDINAL_PURGE_INVALID/,
  );
  await assert.rejects(() => memory.purge(A, { olderThanDays: 0 }), /LONGITUDINAL_PURGE_INVALID/);
  await assert.rejects(() => memory.purge(A, { olderThanDays: 1.5 }), /LONGITUDINAL_PURGE_INVALID/);
  // Sin identidad valida no hay borrado posible.
  await assert.rejects(
    () => memory.purge({ ...A, tenantId: "" }, { everything: true }),
    /LONGITUDINAL_IDENTITY_REQUIRED/,
  );
  assert.equal((await memory.segments(A, { limit: 1000 })).length, a1.segments + a2.segments);

  // Supresion por evento: solo ese evento, y solo del tenant que lo pide.
  const byEvent = await memory.purge(A, { sourceEventId: "evt-a-1" });
  assert.equal(byEvent.scope, "source_event");
  assert.equal(byEvent.deleted, a1.segments);
  const remaining = await memory.segments(A, { limit: 1000 });
  assert.equal(remaining.length, a2.segments);
  assert.ok(remaining.every((item) => item.ref.id.startsWith("evt-a-2#")));
  // B conserva su copia del mismo id de evento.
  assert.equal((await memory.segments(B, { limit: 1000 })).length, b1.segments);

  // Retencion por antiguedad: se envejece un evento y se purga lo anterior al corte.
  await db.rawQuery(
    "UPDATE cognition_v2_longitudinal_segments SET created_at = now() - interval '400 days' WHERE tenant=$1 AND source_event_id=$2",
    [A.tenantId, "evt-a-2"],
  );
  const older = await memory.purge(A, { olderThanDays: 365 });
  assert.equal(older.scope, "older_than");
  assert.equal(older.deleted, a2.segments);
  assert.match(older.cutoff ?? "", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  assert.equal((await memory.segments(A, { limit: 1000 })).length, 0);
  // Un corte de 365 dias no toca lo reciente de B.
  assert.equal((await memory.segments(B, { limit: 1000 })).length, b1.segments);

  // Supresion total: solo el tenant que la pide.
  const all = await memory.purge(B, { everything: true });
  assert.equal(all.scope, "tenant");
  assert.equal(all.deleted, b1.segments);
  assert.equal((await memory.segments(B, { limit: 1000 })).length, 0);

  // Y la memoria queda usable tras el borrado.
  const after = await memory.ingest(A, { sourceEventId: "evt-a-3", text: "Nueva memoria tras la supresion." });
  assert.equal(after.created, after.segments);
  assert.ok((await memory.context(A, { budget: 9_000 })).items.length >= 1);
});
