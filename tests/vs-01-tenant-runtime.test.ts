// VS01_TENANT_RUNTIME_TEST_V1 - pruebas dirigidas de la fase VS-01.
//
// Los cuatro casos decisivos de docs/operacion/CAMPANA-VERTICAL-AGNTIA.md §VS-01:
//   1. un usuario en dos empresas, con las dos tareas a la vez;
//   2. reinicio entre recepcion y ejecucion;
//   3. reanudacion de una aprobacion pendiente;
//   4. rechazo de una conexion ajena.
// Mas la politica explicita para registros anteriores sin contexto.
//
// Son pruebas del cambio, no la verificacion central: esa corresponde a Copilot
// sobre el SHA de la PR. Aqui no hay red ni proveedores reales.

import assert from "node:assert/strict";
import { test } from "node:test";

import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore, tenantIdFromKey } from "../apps/server/src/db-tenant.ts";
import { TaskWorker, resolveTaskTenant } from "../apps/server/src/engine/worker.ts";
import { currentTenantScope, runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { GoogleAuth } from "../apps/server/src/google-auth.ts";
import { encryptSecret } from "../packages/integrations/src/vault.ts";
import type { Config } from "../apps/server/src/config.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

function task(
  id: string,
  tenantId: string,
  status: AgentTask["status"] = "queued",
): AgentTask {
  const now = new Date().toISOString();
  return {
    id,
    tenantId,
    title: id,
    prompt: id,
    kind: "agent",
    status,
    plan: [],
    evidence: [],
    input: {},
    state: {},
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
}

test("VS-01: un usuario en dos empresas ejecuta cada tarea en la suya", async () => {
  const db = await createStore();
  try {
    // Membership primaria = empresa-a para las dos tareas. Es el escenario que
    // rompia: el worker resolvia la clave con la primaria y no encontraba la de B.
    const tdb = new TenantScopedStore(db, async () => "empresa-a");
    await runInTenantScope({ tenantId: "empresa-a", actorId: "u1" }, () =>
      tdb.insertIfAbsent("u1", "tasks", task("t-a", "empresa-a")),
    );
    await runInTenantScope({ tenantId: "empresa-b", actorId: "u1" }, () =>
      tdb.insertIfAbsent("u1", "tasks", task("t-b", "empresa-b")),
    );

    const seen: { id: string; tenantId: string | undefined; owner: string }[] = [];
    const worker = new TaskWorker(tdb, async (owner, current) => {
      seen.push({ id: current.id, tenantId: currentTenantScope()?.tenantId, owner });
      return { status: "succeeded" };
    });
    await worker.tick();

    const ranA = seen.find((entry) => entry.id === "t-a");
    const ranB = seen.find((entry) => entry.id === "t-b");
    assert.ok(ranA, "la tarea de la empresa A se ejecuta");
    assert.ok(ranB, "la tarea de la empresa B se ejecuta aunque la membership sea A");
    assert.equal(ranA?.tenantId, "empresa-a");
    assert.equal(ranB?.tenantId, "empresa-b");

    // Los efectos quedan en la empresa correcta.
    const savedA = await db.get<AgentTask>("empresa-a:u1", "tasks", "t-a");
    const savedB = await db.get<AgentTask>("empresa-b:u1", "tasks", "t-b");
    assert.equal(savedA?.status, "succeeded");
    assert.equal(savedB?.status, "succeeded");
    // Y no se escribe una copia en la primaria.
    assert.equal(await db.get<AgentTask>("empresa-a:u1", "tasks", "t-b"), null);
  } finally {
    await db.close();
  }
});

test("VS-01: tras reiniciar, la tarea encolada en B se ejecuta sin trafico de B", async () => {
  const db = await createStore();
  try {
    const before = new TenantScopedStore(db, async () => "empresa-a");
    await runInTenantScope({ tenantId: "empresa-b", actorId: "u1" }, () =>
      before.insertIfAbsent("u1", "tasks", task("t-b2", "empresa-b")),
    );

    // "Reinicio": store nuevo (sin prefijos de tenant vistos) y worker nuevo.
    const after = new TenantScopedStore(db, async () => "empresa-a");
    // Primer trafico de la empresa A: con el criterio anterior, esto fijaba el
    // unico prefijo que el scan iba a visitar y ocultaba la tarea de B.
    await after.get("u1", "settings", "google");

    const executed: string[] = [];
    const worker = new TaskWorker(after, async (_owner, current) => {
      executed.push(current.id);
      return { status: "succeeded" };
    });
    await worker.tick();

    assert.deepEqual(executed, ["t-b2"]);
    const saved = await db.get<AgentTask>("empresa-b:u1", "tasks", "t-b2");
    assert.equal(saved?.status, "succeeded");
  } finally {
    await db.close();
  }
});

test("VS-01: una aprobacion pendiente en B se reanuda desde el worker", async () => {
  const db = await createStore();
  try {
    const tdb = new TenantScopedStore(db, async () => "empresa-a");
    await runInTenantScope({ tenantId: "empresa-b", actorId: "u1" }, async () => {
      await tdb.insertIfAbsent("u1", "actions", {
        id: "a1",
        status: "awaiting_review",
        expiresAt: new Date(Date.now() - 60_000).toISOString(),
      });
      await tdb.insertIfAbsent("u1", "tasks", {
        ...task("t-app", "empresa-b", "waiting_approval"),
        actionId: "a1",
      });
    });

    const executed: string[] = [];
    const worker = new TaskWorker(tdb, async (_owner, current) => {
      executed.push(current.id);
      return { status: "succeeded" };
    });
    await worker.tick();

    const action = await db.get<{ status: string }>("empresa-b:u1", "actions", "a1");
    assert.equal(action?.status, "expired", "la aprobacion se lee en el tenant de la tarea");
    assert.deepEqual(executed, ["t-app"], "la tarea se reanuda y llega a ejecutarse");
  } finally {
    await db.close();
  }
});

test("VS-01: politica explicita para tareas sin contexto de tenant", async () => {
  // La clave fisica es prueba; el campo persistido es contexto; si no hay
  // ninguno de los dos, o se contradicen, la tarea no se ejecuta.
  assert.equal(tenantIdFromKey("empresa-a:u1"), "empresa-a");
  assert.equal(tenantIdFromKey("u1"), "");

  assert.deepEqual(resolveTaskTenant("empresa-a", { tenantId: "empresa-a" }), {
    kind: "resolved",
    tenantId: "empresa-a",
    source: "key+field",
  });
  assert.deepEqual(resolveTaskTenant("empresa-b", { tenantId: "" }), {
    kind: "resolved",
    tenantId: "empresa-b",
    source: "key",
  });
  assert.deepEqual(resolveTaskTenant("", { tenantId: "default" }), {
    kind: "resolved",
    tenantId: "default",
    source: "field",
  });
  assert.deepEqual(resolveTaskTenant("", { tenantId: "" }), {
    kind: "quarantine",
    reason: "no-context",
  });
  assert.deepEqual(resolveTaskTenant("empresa-a", { tenantId: "empresa-b" }), {
    kind: "quarantine",
    reason: "tenant-mismatch",
  });

  // Integracion: una fila sin prefijo (anterior al scoping) no se ejecuta y
  // permanece intacta, en vez de caer al tenant de la membership.
  const db = await createStore();
  try {
    const tdb = new TenantScopedStore(db, async () => "empresa-a");
    await db.put("u1", "tasks", task("legacy", "", "queued"));
    const executed: string[] = [];
    const worker = new TaskWorker(tdb, async (_owner, current) => {
      executed.push(current.id);
      return { status: "succeeded" };
    });
    await worker.tick();
    assert.deepEqual(executed, []);
    const untouched = await db.get<AgentTask>("u1", "tasks", "legacy");
    assert.equal(untouched?.status, "queued");
  } finally {
    await db.close();
  }
});

test("VS-01: una conexion de otra empresa se rechaza", async () => {
  const db = await createStore();
  try {
    const encryptionKey = Buffer.alloc(32, 7).toString("base64");
    const config = {
      encryptionKey,
      googleClientId: "client-id",
      googleClientSecret: "client-secret",
      googleRedirectUri: "http://localhost/api/google/callback",
      mode: "live",
    } as unknown as Config;
    // Membership primaria: empresa-a. Es el unico caso en el que una credencial
    // legacy (sin tenantId) puede seguir usandose.
    const auth = new GoogleAuth(db, config, {
      primaryTenantFor: async () => "empresa-a",
    });
    const credential = (tenantId?: string): string =>
      encryptSecret(
        JSON.stringify({
          connectionId: "c1",
          accessToken: "at",
          expiresAt: Date.now() + 3_600_000,
          scopes: [],
          account: "cuenta@ejemplo.test",
          ...(tenantId ? { tenantId } : {}),
        }),
        encryptionKey,
      );
    const store = (secret: string) =>
      db.put("u1", "credentials", {
        id: "google",
        generation: "g1",
        connectionId: "c1",
        secret,
      });

    // Credencial sellada con la empresa A.
    await store(credential("empresa-a"));
    await assert.rejects(
      () => runInTenantScope({ tenantId: "empresa-b", actorId: "u1" }, () => auth.tokens("u1")),
      /another company/,
      "B no puede usar el token de A",
    );
    const a = await runInTenantScope({ tenantId: "empresa-a", actorId: "u1" }, () =>
      auth.tokens("u1"),
    );
    assert.equal(a?.tenantId, "empresa-a");

    // Credencial legacy (sin sello): solo vale para la membership primaria.
    await store(credential());
    await assert.rejects(
      () => runInTenantScope({ tenantId: "empresa-b", actorId: "u1" }, () => auth.tokens("u1")),
      /another company/,
      "una credencial sin sello no se adopta desde una empresa secundaria",
    );
    const legacy = await runInTenantScope({ tenantId: "empresa-a", actorId: "u1" }, () =>
      auth.tokens("u1"),
    );
    assert.equal(legacy?.connectionId, "c1");
  } finally {
    await db.close();
  }
});
