// TESTS_CRASH_RECOVERY_V1 â€” el proceso muere a mitad de tarea.
// El roadmap 01 lo pide: "test que mate el proceso a mitad de tarea
// y verifique la recuperaciÃ³n".
// Ver: docs/audits/01-tests/roadmap.md Â§8.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createStore, type Store } from "../apps/server/src/db.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";
import { testConfig } from "./helpers/config.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(here, "..");

let directory: string;
let db: Store;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-crash-"));
  db = await createStore({ dataDir: join(directory, "db") });
});

after(async () => {
  // El test cierra `db` antes de lanzar el hijo (PGlite es mono-proceso) y
  // Store.close no es idempotente: cerramos de nuevo sin romper el hook.
  await db.close().catch(() => {});
  await rm(directory, { recursive: true, force: true });
});

const CRASH_TASK_ID = "crash-test-task";
// CRASH_TASK_OWNER_V1 - el worker lee a traves de TenantScopedStore, que
// compone la clave como `${tenantId}:${owner}` (DEFAULT_TENANT_ID = "default").
// El seed y las probes van por el store crudo, asi que deben usar la misma
// clave compuesta: si no, el worker no encuentra la tarea y nunca la toma.
const CRASH_OWNER = "default:crash-owner";

test("el proceso worker muere a mitad de tarea y la tarea queda running con lease", async () => {
  // 1. Creamos una tarea que el worker procesarÃ¡ y colgarÃ¡ a propÃ³sito.
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
  await db.put(CRASH_OWNER, "tasks", task);
  await db.close();

  // 2. Lanzamos un subproceso que hace el tick del worker con una tarea
  //    que duerme indefinidamente (para forzar el kill).
  const workerScript = join(here, "helpers", "crash-worker.ts");
  // CRASH_RECOVERY_PORTABLE_SPAWN_V1 - usa el mismo Node del test.
  const child = spawn(process.execPath, ["--import", "tsx", workerScript], {
    cwd: repoRoot,
    stdio: "pipe",
    env: {
      ...process.env,
      DATA_DIR: join(directory, "db"),
      CRASH_TASK_ID,
      CRASH_TASK_OWNER: "crash-owner",
    },
  });

  // 3. Esperamos a que la tarea pase a "running" (worker la ha tomado).
  // CRASH_RECOVERY_CLAIMED_MARKER_V1 - PGlite es un unico proceso sobre
  // dataDir: mientras el hijo la tiene abierta, el sondeo del padre no ve
  // nada y el test se quedaba en rojo. El hijo avisa por stdout cuando ya
  // tomo la tarea con lease, y solo entonces leemos la DB.
  const claimed = await new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => resolve(false), 15000);
    child.stdout?.on("data", (chunk: Buffer) => {
      if (chunk.toString().includes("CRASH_WORKER_CLAIMED")) {
        clearTimeout(timer);
        resolve(true);
      }
    });
  });
  assert.ok(claimed, "la tarea debe estar running antes del kill");

  // 4. Matamos el proceso con SIGKILL. Sin cleanup.
  child.kill("SIGKILL");
  await new Promise((resolve) => child.once("exit", resolve));

  // 5. Verificamos que la tarea sigue en running con lease (no se ha limpiado).
  const probe = await createStore({ dataDir: join(directory, "db") });
  const afterKill = await probe.get<AgentTask>(CRASH_OWNER, "tasks", CRASH_TASK_ID);
  assert.equal(afterKill?.status, "running");
  assert.ok(afterKill?.leaseId);

  // 6. "Reiniciamos": recoverInterruptedTasks debe devolverla a queued.
  const { createApp } = await import("../apps/server/src/app.ts");
  const app = await createApp(probe, testConfig({ dataDir: directory }));
  // Forzamos que el lease estÃ© expirado para que recoverInterruptedTasks lo recoja.
  await probe.compareAndSwap<AgentTask>(
    CRASH_OWNER, "tasks", CRASH_TASK_ID,
    { status: "running" },
    { leaseUntil: new Date(Date.now() - 1000).toISOString() },
  );
  const recovered = await app.agent.recoverInterruptedTasks();
  assert.ok(recovered >= 1, "al menos esta tarea debe recuperarse");

  const final = await probe.get<AgentTask>(CRASH_OWNER, "tasks", CRASH_TASK_ID);
  assert.equal(final?.status, "queued", "la tarea vuelve a queued sin duplicar");
  assert.equal(final?.attempts, 1, "los intentos no se duplican");

  await app.agent.stop();
  await probe.close();
});
