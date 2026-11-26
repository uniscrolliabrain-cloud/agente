// TRANS01_K05B_REPLAY_COMMIT_ORDER_V1 - el cursor de replay no puede depender
// de `updated_at`: `now()` es la hora de INICIO de la transaccion, asi que una
// transaccion que empieza antes y commitea despues deja una fila con posicion
// menor que otra ya visible, y el cursor que avanzo la pierde. Estas pruebas
// usan Postgres real con transacciones concurrentes (TEST_DATABASE_URL).
//
// Sin TEST_DATABASE_URL se saltan: PGlite usa una sola conexion y no puede
// reproducir concurrencia real. El resto de la garantia (posicion por tenant,
// cursor ordenado, backfill) se prueba en trans01-replay-durable.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";
import type { SystemEvent } from "../apps/server/src/engine/events/types.ts";

const databaseUrl = process.env.TEST_DATABASE_URL;
const skip = databaseUrl ? false : "TEST_DATABASE_URL no configurado";
const owner = "owner-concurrency";

let db: Store;
let bus: EventBus;
before(async () => {
  if (!databaseUrl) return;
  db = await createStore({ databaseUrl });
  bus = new EventBus(db);
});
after(async () => {
  if (db) await db.close();
});

function emit(tenantId: string, title: string) {
  return bus.emit(
    owner,
    "task.created",
    { kind: "task", id: title },
    { title, kind: "agent" },
    { tenantId },
  );
}

async function page(tenantId: string, filter: { limit?: number; sinceId?: string }) {
  const seen: SystemEvent[] = [];
  await bus.replayTenant(tenantId, filter, (event) => {
    seen.push(event);
  });
  return seen;
}

async function updatedAt(ids: string[]) {
  const rows = await db.select<{ id: string; updated_at: Date | string }>(
    "SELECT id, updated_at FROM records WHERE kind='system-events' AND id = ANY($1::text[])",
    [ids],
  );
  const byId = new Map(rows.map((row) => [row.id, new Date(row.updated_at).getTime()]));
  return ids.map((id) => byId.get(id) ?? Number.NaN);
}

test(
  "una transaccion que empieza antes y commitea despues no se pierde",
  { skip },
  async () => {
    const tenant = `tenant-order-${Date.now()}`;
    let releaseT1!: () => void;
    const gate = new Promise<void>((resolve) => {
      releaseT1 = resolve;
    });
    let startedT1!: () => void;
    const started = new Promise<void>((resolve) => {
      startedT1 = resolve;
    });

    // T1 empieza primero (now() queda fijado) pero no escribe hasta despues.
    const t1 = db.transaction(async () => {
      startedT1();
      await gate;
      await emit(tenant, "A");
    });
    await started;

    // T2 empieza despues y commitea antes: con `updated_at`, A quedaria con una
    // posicion anterior a B y el cursor que avanzo a B la perderia.
    const b = await emit(tenant, "B");
    releaseT1();
    await t1;

    const events = await page(tenant, { limit: 10 });
    const byTitle = new Map(events.map((event) => [String(event.payload.title), event]));
    const a = byTitle.get("A")!;
    const bEvent = byTitle.get("B")!;
    // A empezo antes pero commiteo despues: su posicion es MAYOR.
    assert.equal(bEvent.seq, 1, "la posicion la decide el commit, no el inicio");
    assert.equal(a.seq, 2);
    assert.equal(events.map((event) => event.payload.title).join(","), "B,A");

    const [aUpdated, bUpdated] = await updatedAt([a.id, bEvent.id]);
    assert.ok(
      aUpdated < bUpdated,
      "el escenario reproduce la inversion: A empezo antes (updated_at menor) pero commiteo despues",
    );

    // El cursor por posicion no pierde A aunque se haya paginado B primero.
    const first = await page(tenant, { limit: 1 });
    assert.equal(first[0].payload.title, "B");
    const next = await page(tenant, { limit: 10, sinceId: first[0].id });
    assert.deepEqual(
      next.map((event) => event.payload.title),
      ["A"],
      "ninguna transaccion visible despues del cursor queda fuera del replay",
    );
  },
);

test(
  "un append no puede adelantar el commit de otro del mismo tenant",
  { skip },
  async () => {
    const tenant = `tenant-block-${Date.now()}`;
    let releaseT1!: () => void;
    const gate = new Promise<void>((resolve) => {
      releaseT1 = resolve;
    });
    let inserted!: () => void;
    const insertedPromise = new Promise<void>((resolve) => {
      inserted = resolve;
    });

    // T1 escribe A y retiene el commit: el contador por tenant queda bloqueado
    // hasta que commitee.
    const t1 = db.transaction(async () => {
      await emit(tenant, "A");
      inserted();
      await gate;
    });
    await insertedPromise;

    let t2Done = false;
    const t2 = emit(tenant, "B").then(() => {
      t2Done = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
    assert.equal(t2Done, false, "B no puede committear una posicion mayor antes que A");

    releaseT1();
    await Promise.all([t1, t2]);

    const events = await page(tenant, { limit: 10 });
    assert.deepEqual(
      events.map((event) => event.payload.title),
      ["A", "B"],
      "el orden de lectura es el orden de commit",
    );
    assert.deepEqual(
      events.map((event) => event.seq),
      [1, 2],
    );
  },
);
