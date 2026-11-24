// TRANS01_E01_K04_CAUSAL_ENVELOPE_V1 - perfil causal-1 sobre SystemEvent 1.0:
// el actor sale del contexto autorizado (nunca de la personalidad ni de un
// payload no confiable), raiz/derivado es explicito y el antecedente debe ser
// durable, del mismo tenant y de la misma correlacion. Los eventos legacy
// siguen legibles y no reciben garantias retroactivas.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";
import type { SystemEvent } from "../apps/server/src/engine/events/types.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";

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

function emitAs(
  scope: { tenantId: string; actorId: string },
  owner: string,
  options: Record<string, unknown>,
) {
  return runInTenantScope(scope, () =>
    bus.emit(
      owner,
      "task.created",
      { kind: "task", id: "t-1" },
      taskCreated,
      { tenantId: scope.tenantId, ...options } as never,
    ),
  );
}

test("una raiz toma el actor del contexto autorizado", async () => {
  const result = await emitAs(
    { tenantId: "tenant-a", actorId: "user-1" },
    "owner-a",
    { correlationId: "corr-root", causal: { kind: "root" } },
  );
  const event = await stored("owner-a", result.id);
  assert.equal(event?.actorId, "user-1");
  assert.equal(event?.actorKind, "human");
  assert.equal(event?.causalKind, "root");
  assert.equal(event?.correlationId, "corr-root");
  assert.equal(event?.causationId, undefined);
});

test("un derivado exige antecedente del mismo tenant y correlacion", async () => {
  const root = await emitAs(
    { tenantId: "tenant-a", actorId: "user-1" },
    "owner-a",
    { correlationId: "corr-chain", causal: { kind: "root" } },
  );
  const derived = await emitAs(
    { tenantId: "tenant-a", actorId: "user-1" },
    "owner-a",
    { correlationId: "corr-chain", causal: { kind: "derived", causationId: root.id } },
  );
  const event = await stored("owner-a", derived.id);
  assert.equal(event?.causalKind, "derived");
  assert.equal(event?.causationId, root.id);
});

test("un derivado sin antecedente se deniega", async () => {
  // `emit` conserva su contrato de no lanzar: el rechazo se observa como
  // evento no persistido con el motivo, no como excepcion al llamador.
  const result = await emitAs(
    { tenantId: "tenant-a", actorId: "user-1" },
    "owner-a",
    { correlationId: "corr-missing", causal: { kind: "derived", causationId: "evento-inexistente" } },
  );
  assert.equal(result.persisted, false);
  assert.equal(result.id, "");
  assert.match(String(result.error), /CAUSAL_ANTECEDENT_NOT_FOUND/);
  assert.equal(await stored("owner-a", "evento-inexistente"), null);
});

test("un antecedente de otro tenant se deniega", async () => {
  const root = await emitAs(
    { tenantId: "tenant-b", actorId: "user-b" },
    "owner-shared",
    { correlationId: "corr-cross", causal: { kind: "root" } },
  );
  const result = await emitAs(
    { tenantId: "tenant-a", actorId: "user-a" },
    "owner-shared",
    { correlationId: "corr-cross", causal: { kind: "derived", causationId: root.id } },
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /CAUSAL_ANTECEDENT_TENANT_MISMATCH/);
});

test("un antecedente con otra correlacion se deniega", async () => {
  const root = await emitAs(
    { tenantId: "tenant-c", actorId: "user-1" },
    "owner-c",
    { correlationId: "corr-1", causal: { kind: "root" } },
  );
  const result = await emitAs(
    { tenantId: "tenant-c", actorId: "user-1" },
    "owner-c",
    { correlationId: "corr-2", causal: { kind: "derived", causationId: root.id } },
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /CAUSAL_ANTECEDENT_CORRELATION_MISMATCH/);
});

test("un actor declarado que no coincide con el contexto se rechaza", async () => {
  const result = await emitAs(
    { tenantId: "tenant-d", actorId: "user-real" },
    "owner-d",
    { actorId: "user-falsificado", correlationId: "corr-d", causal: { kind: "root" } },
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /ACTOR_NOT_AUTHENTICATED/);
});

test("sin contexto autorizado no se acepta un actor humano inventado", async () => {
  const result = await bus.emit(
    "owner-e",
    "task.created",
    { kind: "task", id: "t-e" },
    taskCreated,
    { tenantId: "tenant-e", actorId: "user-arbitrario", correlationId: "corr-e", causal: { kind: "root" } },
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /ACTOR_NOT_AUTHENTICATED/);
});

test("un principal de servicio legitimo emite con identidad de servicio", async () => {
  const result = await bus.emit(
    "owner-f",
    "system.maintenance",
    { kind: "system", id: "worker" },
    { tasks: 0, monitors: 0 },
    {
      tenantId: "tenant-f",
      actorId: "service:cognition-worker",
      actorKind: "service",
      correlationId: "corr-f",
      causal: { kind: "root" },
    },
  );
  const event = await stored("owner-f", result.id);
  assert.equal(event?.actorId, "service:cognition-worker");
  assert.equal(event?.actorKind, "service");
});

test("un servicio no puede usar un id de actor humano", async () => {
  const result = await bus.emit(
    "owner-g",
    "system.maintenance",
    { kind: "system", id: "worker" },
    { tasks: 0, monitors: 0 },
    {
      tenantId: "tenant-g",
      actorId: "user-disfrazado",
      actorKind: "service",
      correlationId: "corr-g",
      causal: { kind: "root" },
    },
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /SERVICE_ACTOR_ID_INVALID/);
});

test("un servicio no puede emitir como una tarea o una persona", async () => {
  const result = await runInTenantScope({ tenantId: "tenant-h", actorId: "service:fake" }, () =>
    bus.emit(
      "owner-h",
      "task.created",
      { kind: "task", id: "t-h" },
      taskCreated,
      {
        tenantId: "tenant-h",
        actorId: "service:fake",
        actorKind: "service",
        correlationId: "corr-h",
        causal: { kind: "root" },
      },
    ),
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /ACTOR_KIND_MISMATCH/);
});

test("la personalidad de presentacion no se convierte en actor", async () => {
  const result = await runInTenantScope({ tenantId: "tenant-i", actorId: "persona-visible" }, () =>
    bus.emit(
      "owner-i",
      "task.created",
      { kind: "persona", id: "p-1", personaId: "persona-visible" },
      taskCreated,
      { tenantId: "tenant-i", correlationId: "corr-i", causal: { kind: "root" } },
    ),
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /PERSONA_IS_NOT_AN_ACTOR/);
});

test("el perfil gobernado exige tenant y correlacion explicitos", async () => {
  const cases: { options: Record<string, unknown>; error: RegExp }[] = [
    { options: { tenantId: undefined, correlationId: "corr-j", causal: { kind: "root" } }, error: /CAUSAL_TENANT_REQUIRED/ },
    { options: { correlationId: undefined, causal: { kind: "root" } }, error: /CAUSAL_CORRELATION_REQUIRED/ },
  ];
  for (const entry of cases) {
    const result = await emitAs({ tenantId: "tenant-j", actorId: "user-1" }, "owner-j", entry.options);
    assert.equal(result.persisted, false, `no debe persistirse: ${entry.error}`);
    assert.match(String(result.error), entry.error);
  }
});

test("un evento legacy sigue siendo legible sin campos causales", async () => {
  const result = await bus.emit("owner-k", "task.created", { kind: "task", id: "t-k" }, taskCreated, {
    tenantId: "tenant-k",
  });
  const event = await stored("owner-k", result.id);
  assert.equal(event?.actorId, undefined);
  assert.equal(event?.actorKind, undefined);
  assert.equal(event?.causalKind, undefined);
  assert.equal(event?.schemaVersion, "1.0");
});
