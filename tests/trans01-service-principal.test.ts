// TRANS01_K04B_SERVICE_PRINCIPAL_V1 - un prefijo `service:` no autentica nada.
// La identidad de servicio solo existe dentro del scope que abre el kernel con
// un principal registrado; el bus contrasta la identidad declarada con la
// identidad ambiente y nunca la crea a partir de campos del llamador.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import {
  EventBus,
  runAsServicePrincipal,
} from "../apps/server/src/engine/events/index.ts";
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

const maintenance = { tasks: 0, monitors: 0 };

function emitService(tenantId: string, options: Record<string, unknown> = {}) {
  return bus.emit(
    "owner-service",
    "system.maintenance",
    { kind: "system", id: "worker" },
    maintenance,
    {
      tenantId,
      correlationId: `corr-${tenantId}`,
      causal: { kind: "root" },
      ...options,
    } as never,
  );
}

test("declararse servicio sin scope autenticado se deniega", async () => {
  const result = await emitService("tenant-svc-1", {
    actorId: "service:cognition-worker",
    actorKind: "service",
  });
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /ACTOR_NOT_AUTHENTICATED/);
});

test("un principal registrado emite con su identidad, no con la declarada", async () => {
  const result = await runAsServicePrincipal("service:cognition-worker", () =>
    emitService("tenant-svc-2", { actorKind: "service" }),
  );
  assert.equal(result.persisted, true);
  const event = await db.get<SystemEvent>("owner-service", "system-events", result.id);
  assert.equal(event?.actorId, "service:cognition-worker");
  assert.equal(event?.actorKind, "service");
});

test("un principal no puede emitir con otra identidad de servicio", async () => {
  const result = await runAsServicePrincipal("service:cognition-worker", () =>
    emitService("tenant-svc-3", { actorId: "service:monitor", actorKind: "service" }),
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /ACTOR_NOT_AUTHENTICATED/);
});

test("un principal no puede emitir con una fuente que no le corresponde", async () => {
  const result = await runAsServicePrincipal("service:cognition-worker", () =>
    bus.emit(
      "owner-service",
      "task.created",
      { kind: "task", id: "t-svc" },
      { title: "T", kind: "agent" },
      {
        tenantId: "tenant-svc-4",
        actorKind: "service",
        correlationId: "corr-svc-4",
        causal: { kind: "root" },
      },
    ),
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /SERVICE_ACTOR_SOURCE_INVALID/);
});

test("un principal no puede presentarse como humano", async () => {
  const result = await runAsServicePrincipal("service:cognition-worker", () =>
    emitService("tenant-svc-5", { actorKind: "human" }),
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /ACTOR_KIND_MISMATCH/);
});

test("un scope de peticion con actor no convive con un principal de servicio", async () => {
  const result = await runAsServicePrincipal("service:cognition-worker", () =>
    runInTenantScope({ tenantId: "tenant-svc-6", actorId: "user-real" }, () =>
      emitService("tenant-svc-6", { actorKind: "service" }),
    ),
  );
  assert.equal(result.persisted, false);
  assert.match(String(result.error), /SERVICE_SCOPE_CONFLICT/);
});

test("un principal no registrado no puede abrir scope", async () => {
  await assert.rejects(
    runAsServicePrincipal("service:inventado", async () => undefined),
    /SERVICE_PRINCIPAL_UNKNOWN/,
  );
});

test("el camino humano sigue tomando el actor del contexto autorizado", async () => {
  const result = await runInTenantScope(
    { tenantId: "tenant-svc-7", actorId: "user-real" },
    () => emitService("tenant-svc-7"),
  );
  const event = await db.get<SystemEvent>("owner-service", "system-events", result.id);
  assert.equal(event?.actorId, "user-real");
  assert.equal(event?.actorKind, "human");
});
