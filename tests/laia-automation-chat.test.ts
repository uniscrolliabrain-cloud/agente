import assert from "node:assert/strict";
import { test } from "node:test";
import { Hono } from "hono";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { PersonaRegistry } from "../apps/server/src/engine/agents/personas/registry.ts";
import { personasRoutes } from "../apps/server/src/engine/agents/personas/routes.ts";
import {
  AUTOMATION_THREADS,
  AutomationThreads,
} from "../apps/server/src/engine/automation-thread.ts";
import { readExecutionFacts } from "../apps/server/src/engine/events/operational-facts.ts";
import { currentTenantScope, runInTenantScope } from "../apps/server/src/tenant-scope.ts";

const TENANT_A = "tenant-a";
const ALICE = "alice";
const KEY = `${TENANT_A}:${ALICE}`;
const URL_CHAT = "/laia/automations/automation-a/chat";

function appFor(db: Store, registry: PersonaRegistry) {
  const app = new Hono<{ Variables: { owner: string; ctx: { tenantId: string } } }>();
  app.use("*", async (c, next) => {
    c.set("owner", ALICE);
    c.set("ctx", { tenantId: c.req.header("test-tenant") ?? "tenant-b" });
    await next();
  });
  app.route("/", personasRoutes({ db, registry }));
  return app;
}

function registryWithLaia() {
  const registry = new PersonaRegistry();
  registry.has = (tenant, persona) => tenant === TENANT_A && persona === "laia";
  return registry;
}

async function seedAutomation(db: Store) {
  await db.put(KEY, "sops", { id: "automation-a", name: "Reactivacion" });
}

function request(body: unknown, tenant = TENANT_A) {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json", "test-tenant": tenant },
    body: JSON.stringify(body),
  };
}

function execution(id: string, entityId: string, sopId = "automation-a") {
  const now = new Date().toISOString();
  return {
    id,
    tenantId: TENANT_A,
    title: `Ejecucion ${id}`,
    prompt: "reactivar",
    kind: "sop",
    status: "waiting_input",
    assignedTo: "marta",
    plan: [],
    evidence: [],
    input: {},
    state: { entityId, sopId },
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
}

test("Laia automation launch requires a session and denies foreign automations", async () => {
  const db = await createStore();
  try {
    const registry = registryWithLaia();
    const route = personasRoutes({ db, registry });
    const launch = () => ({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: "thread-1" }),
    });
    assert.equal((await route.request(URL_CHAT, launch())).status, 401);

    const app = appFor(db, registry);
    assert.equal((await app.request(URL_CHAT, launch())).status, 403);

    await seedAutomation(db);
    const allowed = await app.request(URL_CHAT, request({ threadId: "thread-1" }));
    assert.equal(allowed.status, 200);
    const body = (await allowed.json()) as {
      automationId: string;
      threadId: string;
      personaId: string;
      executionId: string | null;
      entityId: string | null;
      references: { executions: unknown[]; nextResponsible: unknown };
    };
    assert.equal(body.automationId, "automation-a");
    assert.equal(body.threadId, "thread-1");
    assert.equal(body.personaId, "laia");
    assert.equal(body.executionId, null);
    assert.equal(body.entityId, null);
    assert.deepEqual(body.references.executions, []);
    assert.deepEqual(body.references.nextResponsible, { kind: "persona", id: "laia" });

    // AUTOMATION_THREAD_RESUME_V2 - reanudar el hilo conserva el vinculo.
    const resumed = (await (
      await app.request(URL_CHAT, request({ threadId: "thread-1" }))
    ).json()) as { threadId: string };
    assert.equal(resumed.threadId, "thread-1");
  } finally {
    await db.close();
  }
});

test("un hilo vinculado en otra empresa se rechaza", async () => {
  const db = await createStore();
  try {
    await seedAutomation(db);
    const now = new Date().toISOString();
    await db.put(KEY, AUTOMATION_THREADS, {
      id: "thread-ajeno",
      tenantId: "tenant-b",
      actorId: "bob",
      personaId: "laia",
      automationId: "automation-a",
      createdAt: now,
      updatedAt: now,
    });
    const res = await appFor(db, registryWithLaia()).request(
      URL_CHAT,
      request({ threadId: "thread-ajeno" }),
    );
    assert.equal(res.status, 403);
    assert.match(((await res.json()) as { error: string }).error, /another session/i);
  } finally {
    await db.close();
  }
});

test("la consulta cita su ejecucion y excluye otra de la misma empresa", async () => {
  const db = await createStore();
  try {
    await seedAutomation(db);
    await db.put(KEY, "tasks", execution("exec-1", "job-1"));
    await db.put(KEY, "tasks", execution("exec-2", "job-2"));
    const app = appFor(db, registryWithLaia());

    const first = (await (
      await app.request(URL_CHAT, request({ threadId: "thread-1", executionId: "exec-1" }))
    ).json()) as {
      executionId: string;
      entityId: string;
      references: {
        entityId: string;
        executions: Array<{ id: string; entityId: string; sopId: string; status: string }>;
        nextResponsible: unknown;
      };
    };
    assert.equal(first.executionId, "exec-1");
    assert.equal(first.entityId, "job-1");
    assert.equal(first.references.entityId, "job-1");
    assert.deepEqual(
      first.references.executions.map((e) => [e.id, e.entityId, e.sopId]),
      [["exec-1", "job-1", "automation-a"]],
    );
    // La otra ejecucion de la misma empresa no se cita en este hilo.
    assert.equal(
      first.references.executions.some((e) => e.id === "exec-2"),
      false,
    );
    // waiting_input: el siguiente responsable es el humano asignado.
    assert.deepEqual(first.references.nextResponsible, { kind: "human", id: "marta" });

    const second = (await (
      await app.request(URL_CHAT, request({ threadId: "thread-2", executionId: "exec-2" }))
    ).json()) as { references: { executions: Array<{ id: string }> } };
    assert.deepEqual(second.references.executions.map((e) => e.id), ["exec-2"]);
  } finally {
    await db.close();
  }
});

test("una ejecucion de otra empresa o de otro proceso se rechaza", async () => {
  const db = await createStore();
  try {
    await seedAutomation(db);
    await db.put(KEY, "tasks", {
      ...execution("exec-ajena", "job-9"),
      tenantId: "tenant-b",
    });
    await db.put(KEY, "tasks", execution("exec-otro-sop", "job-1", "automation-b"));
    const app = appFor(db, registryWithLaia());

    const foreign = await app.request(
      URL_CHAT,
      request({ threadId: "thread-3", executionId: "exec-ajena" }),
    );
    assert.equal(foreign.status, 403);

    const otherSop = await app.request(
      URL_CHAT,
      request({ threadId: "thread-3", executionId: "exec-otro-sop" }),
    );
    assert.equal(otherSop.status, 409);
    // El vinculo no se escribe si la ejecucion se rechaza.
    const links = await new AutomationThreads(db).get(
      { tenantId: TENANT_A, actorId: ALICE },
      "thread-3",
    );
    assert.equal(links, null);
  } finally {
    await db.close();
  }
});

test("los hechos de ejecucion citan solo la ejecucion consultada de la empresa", async () => {
  const db = await createStore();
  try {
    const tdb = new TenantScopedStore(
      db,
      async () => currentTenantScope()?.tenantId ?? "default",
    );
    const emittedAt = new Date().toISOString();
    const event = (id: string, taskId: string, sopId: string) => ({
      id,
      schemaVersion: "1.0",
      tenantId: TENANT_A,
      owner: KEY,
      type: "sop.step_started",
      emittedAt,
      source: { kind: "task", id: taskId },
      payload: { taskId, sopId, index: 0, title: "Paso" },
    });
    await db.put(KEY, "system-events", event("e1", "exec-1", "automation-a"));
    await db.put(KEY, "system-events", event("e2", "exec-2", "automation-a"));
    await db.put("tenant-b:bob", "system-events", event("e3", "exec-9", "automation-a"));

    const range = {
      from: new Date(Date.now() - 86_400_000),
      until: new Date(Date.now() + 86_400_000),
      timeZone: "Europe/Madrid",
    };
    const facts = await runInTenantScope({ tenantId: TENANT_A, actorId: ALICE }, () =>
      readExecutionFacts(tdb, range, { executionId: "exec-1" }),
    );
    assert.deepEqual(
      facts.executions.map((row) => [row.executionId, row.sopId]),
      [["exec-1", "automation-a"]],
    );
    assert.equal(facts.executions[0]!.count, 1);
    assert.equal(facts.executions[0]!.type, "sop.step_started");

    const all = await runInTenantScope({ tenantId: TENANT_A, actorId: ALICE }, () =>
      readExecutionFacts(tdb, range),
    );
    // La ejecucion de otra empresa nunca aparece en los hechos de A.
    assert.deepEqual(
      all.executions.map((row) => row.executionId).sort(),
      ["exec-1", "exec-2"],
    );
  } finally {
    await db.close();
  }
});
