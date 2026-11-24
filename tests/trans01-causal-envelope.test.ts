// TRANS01_E01_CAUSAL_ENVELOPE_V1 - perfil causal-1 sobre SystemEvent 1.0:
// actor autenticado (nunca persona), raiz/derivado explicito y antecedente
// durable del mismo tenant y correlacion. Los eventos legacy siguen legibles.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";
import type { SystemEvent } from "../apps/server/src/engine/events/types.ts";

let db: Store;
let bus: EventBus;
before(async () => {
  db = await createStore();
  bus = new EventBus(db);
});
after(async () => {
  await db.close();
});

const taskCreated = { title: "T", kind: "agent" as const };

async function stored(owner: string, id: string): Promise<SystemEvent | null> {
  return db.get<SystemEvent>(owner, "system-events", id);
}

test("una raiz explicita registra actor y causalKind", async () => {
  const result = await bus.emit("owner-a", "task.created", { kind: "task", id: "t-root" }, taskCreated, {
    tenantId: "tenant-a",
    actorId: "user-1",
    correlationId: "corr-root",
    causal: { kind: "root" },
  });
  const event = await stored("owner-a", result.id);
  assert.equal(event?.actorId, "user-1");
  assert.equal(event?.causalKind, "root");
  assert.equal(event?.correlationId, "corr-root");
  assert.equal(event?.causationId, undefined);
});

test("un derivado exige antecedente del mismo tenant y correlacion", async () => {
  const root = await bus.emit("owner-a", "task.created", { kind: "task", id: "t-2" }, taskCreated, {
    tenantId: "tenant-a",
    actorId: "user-1",
    correlationId: "corr-chain",
    causal: { kind: "root" },
  });
  const derived = await bus.emit(
    "owner-a",
    "action.proposed",
    { kind: "action", id: "a-1" },
    { title: "T", kind: "email.send" },
    {
      tenantId: "tenant-a",
      actorId: "user-1",
      correlationId: "corr-chain",
      causal: { kind: "derived", causationId: root.id },
    },
  );
  const event = await stored("owner-a", derived.id);
  assert.equal(event?.causalKind, "derived");
  assert.equal(event?.causationId, root.id);
});

test("un derivado sin antecedente se deniega", async () => {
  // `emit` conserva su contrato de no lanzar: el rechazo se observa como
  // evento no persistido con el motivo, no como excepcion al llamador.
  const result = await bus.emit(
    "owner-a",
    "task.created",
    { kind: "task", id: "t-3" },
    taskCreated,
    {
      tenantId: "tenant-a",
      actorId: "user-1",
      correlationId: "corr-missing",
      causal: { kind: "derived", causationId: "evento-inexistente" },
    },
  );
  assert.equal(result.persisted, false);
  assert.equal(result.id, "");
  assert.match(String(result.error), /CAUSAL_ANTECEDENT_NOT_FOUND/);
  assert.equal(await stored("owner-a", "evento-inexistente"), null);
});

test("un antecedente de otro tenant se deniega", async () => {
  const root = await bus.emit("owner-shared", "task.created", { kind: "task", id: "t-b" }, taskCreated, {
    tenantId: "tenant-b",
    actorId: "user-b",
    correlationId: "corr-cross",
    causal: { kind: "root" },
  });
  const result = await bus.emit(
    "owner-shared",
    "task.created",
    { kind: "task", id: "t-a" },
    taskCreated,
    {
      tenantId: "tenant-a",
      actorId: "user-a",
      correlationId: "corr-cross",
      causal: { kind: "derived", causationId: root.id },
    },
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /CAUSAL_ANTECEDENT_TENANT_MISMATCH/);
});

test("un antecedente con otra correlacion se deniega", async () => {
  const root = await bus.emit("owner-c", "task.created", { kind: "task", id: "t-c" }, taskCreated, {
    tenantId: "tenant-c",
    actorId: "user-1",
    correlationId: "corr-1",
    causal: { kind: "root" },
  });
  const result = await bus.emit(
    "owner-c",
    "task.created",
    { kind: "task", id: "t-c2" },
    taskCreated,
    {
      tenantId: "tenant-c",
      actorId: "user-1",
      correlationId: "corr-2",
      causal: { kind: "derived", causationId: root.id },
    },
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /CAUSAL_ANTECEDENT_CORRELATION_MISMATCH/);
});

test("el perfil gobernado exige actor, tenant y correlacion explicitos", async () => {
  const base = {
    tenantId: "tenant-d" as string | undefined,
    actorId: "user-1" as string | undefined,
    correlationId: "corr-d" as string | undefined,
    causal: { kind: "root" as const },
  };
  const cases: { options: typeof base; error: RegExp }[] = [
    { options: { ...base, actorId: undefined }, error: /CAUSAL_ACTOR_REQUIRED/ },
    { options: { ...base, tenantId: undefined }, error: /CAUSAL_TENANT_REQUIRED/ },
    { options: { ...base, correlationId: undefined }, error: /CAUSAL_CORRELATION_REQUIRED/ },
  ];
  for (const entry of cases) {
    const result = await bus.emit(
      "owner-d",
      "task.created",
      { kind: "task", id: "t-d" },
      taskCreated,
      entry.options,
    );
    assert.equal(result.persisted, false, `no debe persistirse: ${entry.error}`);
    assert.match(String(result.error), entry.error);
  }
});

test("la persona de presentacion no se convierte en actor", async () => {
  const result = await bus.emit(
    "owner-e",
    "task.created",
    { kind: "persona", id: "p-1", personaId: "persona-visible" },
    taskCreated,
    {
      tenantId: "tenant-e",
      actorId: "user-real",
      correlationId: "corr-e",
      causal: { kind: "root" },
    },
  );
  const event = await stored("owner-e", result.id);
  assert.equal(event?.actorId, "user-real");
  assert.equal(event?.source.personaId, "persona-visible");
  assert.notEqual(event?.actorId, event?.source.personaId);
});

test("un evento legacy sigue siendo legible sin campos causales", async () => {
  const result = await bus.emit("owner-f", "task.created", { kind: "task", id: "t-f" }, taskCreated, {
    tenantId: "tenant-f",
  });
  const event = await stored("owner-f", result.id);
  assert.equal(event?.actorId, undefined);
  assert.equal(event?.causalKind, undefined);
  assert.equal(event?.schemaVersion, "1.0");
});
