// TESTS_CRASH_RECOVERY_V1 — el proceso muere a mitad de tarea.
// El roadmap 01 lo pide: "test que mate el proceso a mitad de tarea
// y verifique la recuperación".
// Ver: docs/audits/01-tests/roadmap.md §8.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createStore, type Store } from "../apps/server/src/db.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(here, "..");

let directory: string;
let db: Store;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-crash-"));
  db = await createStore({ dataDir: join(directory, "db") });
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

const CRASH_TASK_ID = "crash-test-task";

test("el proceso worker muere a mitad de tarea y la tarea queda running con lease", async () => {
  // 1. Creamos una tarea que el worker procesará y colgará a propósito.
  const task: AgentTask = {
    id: CRASH_TASK_ID,
    tenantId: "default",
    title: "Crash test",
    prompt: "Duerme y no termines nunca",
    kind: "agent",
    status: "queued",
    plan: [{ id: "0", title: "Dormir", status: "pending" }],
    evidence: [],
    input: {},
    state: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
  await db.put("crash-owner", "tasks", task);
  await db.close();

  // 2. Lanzamos un subproceso que hace el tick del worker con una tarea
  //    que duerme indefinidamente (para forzar el kill).
  const workerScript = join(here, "helpers", "crash-worker.ts");
  const child = spawn("pnpm", ["exec", "tsx", workerScript], {
    cwd: repoRoot,
    stdio: "pipe",
    env: { ...process.env, DATA_DIR: join(directory, "db") },
  });

  // 3. Esperamos a que la tarea pase a "running" (worker la ha tomado).
  const deadline = Date.now() + 15000;
  let running = false;
  const probe = await createStore({ dataDir: join(directory, "db") });
  while (Date.now() < deadline) {
    const t = await probe.get<AgentTask>("crash-owner", "tasks", CRASH_TASK_ID);
    if (t?.status === "running" && t.leaseId) { running = true; break; }
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(running, "la tarea debe estar running antes del kill");

  // 4. Matamos el proceso con SIGKILL. Sin cleanup.
  child.kill("SIGKILL");
  await new Promise((r) => setTimeout(r, 500));

  // 5. Verificamos que la tarea sigue en running con lease (no se ha limpiado).
  const afterKill = await probe.get<AgentTask>("crash-owner", "tasks", CRASH_TASK_ID);
  assert.equal(afterKill?.status, "running");
  assert.ok(afterKill?.leaseId);

  // 6. "Reiniciamos": recoverInterruptedTasks debe devolverla a queued.
  const { createApp } = await import("../apps/server/src/app.ts");
  const app = await createApp(probe, {
    mode: "sample",
    port: 8787,
    host: "127.0.0.1",
    publicUrl: "http://localhost:8787",
    dataDir: directory,
    agentBackend: "sample",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  });
  // Forzamos que el lease esté expirado para que recoverInterruptedTasks lo recoja.
  await probe.compareAndSwap<AgentTask>(
    "crash-owner", "tasks", CRASH_TASK_ID,
    { status: "running" },
    { leaseUntil: new Date(Date.now() - 1000).toISOString() },
  );
  const recovered = await app.agent.recoverInterruptedTasks();
  assert.ok(recovered >= 1, "al menos esta tarea debe recuperarse");

  const final = await probe.get<AgentTask>("crash-owner", "tasks", CRASH_TASK_ID);
  assert.equal(final?.status, "queued", "la tarea vuelve a queued sin duplicar");
  assert.equal(final?.attempts, 1, "los intentos no se duplican");

  await app.agent.stop();
  await probe.close();
});
