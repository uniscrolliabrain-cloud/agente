import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { CognitiveProjectionStore } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { ContextServingFacade } from "../apps/server/src/engine/cognition/v2/context.ts";
import {
  installLongitudinal,
  LongitudinalMemory,
} from "../apps/server/src/engine/cognition/v2/longitudinal/memory.ts";

const A = { tenantId: "tenant-a", actorId: "alice", owner: "alice" };
const B = { tenantId: "tenant-b", actorId: "bob", owner: "bob" };
const identityA = { tenantId: "tenant-a", actorId: "alice", owner: "alice", policyRevision: "1", purpose: "chat" as const };

const TEXT_A =
  "El cliente pidio no prometer plazos. " + "Contexto operativo extenso. ".repeat(240) + "Cierre: revisar factura pendiente.";

test("recorrido montado: evento, segmentos, persistencia idempotente, seleccion y contexto con dos tenants", async () => {
  const db = await createStore();
  await installLongitudinal(db);
  const memory = new LongitudinalMemory(db);

  // 1. un evento entra al extractor
  const first = await memory.ingest(A, { sourceEventId: "evt-a-1", text: TEXT_A, sourceDigest: undefined });
  assert.ok(first.segments >= 2, "el texto se parte en segmentos con procedencia");
  assert.equal(first.created, first.segments);
  assert.match(first.sourceDigest, /^[a-f0-9]{64}$/);

  // 2. reprocesar no duplica
  const again = await memory.ingest(A, { sourceEventId: "evt-a-1", text: TEXT_A });
  assert.equal(again.created, 0);
  assert.equal(again.segments, first.segments);

  // 3. el mismo id de evento con otro contenido es conflicto, no sobrescritura
  await assert.rejects(
    () => memory.ingest(A, { sourceEventId: "evt-a-1", text: TEXT_A + " alterado" }),
    /LONGITUDINAL_SEGMENT_CONFLICT|LONGITUDINAL_SOURCE_CHANGED/,
  );
  // 4. un digest declarado que no coincide se rechaza antes de escribir
  await assert.rejects(
    () => memory.ingest(A, { sourceEventId: "evt-a-2", text: TEXT_A, sourceDigest: "0".repeat(64) }),
    /LONGITUDINAL_SOURCE_CHANGED/,
  );

  // 5. otro tenant con el mismo id de evento no colisiona
  const other = await memory.ingest(B, { sourceEventId: "evt-a-1", text: "Memoria de B sobre su propia factura." });
  assert.equal(other.created, 1);

  // 6. aislamiento: cada tenant solo ve lo suyo
  const aItems = await memory.segments(A, { limit: 200 });
  const bItems = await memory.segments(B, { limit: 200 });
  assert.ok(aItems.length >= first.segments);
  assert.ok(aItems.every((item) => item.ref.tenantId === "tenant-a"));
  assert.ok(bItems.every((item) => item.ref.tenantId === "tenant-b"));
  assert.ok(!bItems.some((item) => item.text.includes("no prometer plazos")));

  // 7. seleccion por consulta
  const filtered = await memory.segments(A, { query: "factura" });
  assert.ok(filtered.length >= 1);
  assert.ok(filtered.every((item) => item.text.toLocaleLowerCase().includes("factura")));

  // 8. pack con presupuesto real
  const pack = await memory.context(A, { limit: 200, budget: 9_000 });
  assert.ok(pack.bytes <= 9_000);
  assert.ok(pack.items.length >= 1, "el pack entrega al menos un segmento autorizado");
  assert.equal(pack.serialized, JSON.stringify(pack.items));
  assert.ok(pack.items.every((item) => item.ref.tenantId === "tenant-a" && item.group === "narrative"));

  // 9. la atencion de V2 lo consume como contexto, con autorizacion
  const facade = new ContextServingFacade(
    new CognitiveProjectionStore(db),
    { authorize: async () => true },
    undefined,
    undefined,
    memory,
  );
  const fromAttention = await facade.longitudinalContext(identityA, { query: "factura", budget: 9_000 });
  assert.ok(fromAttention.items.length >= 1);
  assert.ok(fromAttention.items.every((item) => item.ref.tenantId === "tenant-a"));
  assert.ok(fromAttention.bytes <= 9_000);

  // 10. sin permiso no hay pack, y sin memoria montada se falla cerrado
  const denied = new ContextServingFacade(
    new CognitiveProjectionStore(db),
    { authorize: async () => false },
    undefined,
    undefined,
    memory,
  );
  await assert.rejects(() => denied.longitudinalContext(identityA), /DENIED/);
  const unmounted = new ContextServingFacade(new CognitiveProjectionStore(db), { authorize: async () => true });
  await assert.rejects(() => unmounted.longitudinalContext(identityA), /LONGITUDINAL_MEMORY_NOT_MOUNTED/);
});
