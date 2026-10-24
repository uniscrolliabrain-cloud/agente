import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import type { AgentNotification, AgentTask, Idea, Monitor } from "../packages/domain/src/agent.ts";
import type { ActionProposal } from "../packages/domain/src/index.ts";

let db: Store, tdb: TenantScopedStore, server: Awaited<ReturnType<typeof createApp>>, directory: string;
const owner = "workflow-user";
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-workflows-"));
  db = await createStore({ dataDir: join(directory, "db") });
  // TEST_TENANT_SCOPE_V1 - mismo store que usa AgentService: TenantScopedStore
  // con tenantId "default". El test escribe y lee con la misma clave compuesta.
  tdb = new TenantScopedStore(db, async () => "default");
  server = await createApp(db, {
    mode: "sample",
    port: 8787,
    host: "127.0.0.1",
    publicUrl: "http://localhost:8787",
    dataDir: directory,
    agentBackend: "sample",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  });
  await server.workspace.ensureSample(owner, server.actions);
});
after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

async function documentTask() {
  const w = await server.workspace.snapshot(owner);
  const mail = w.mail.find((m) => m.attachments.length);
  assert.ok(mail);
  const task = await server.agent.createTask(owner, {
    title: "Return school form",
    prompt: "Fill the school form and prepare a reply",
    kind: "document",
    input: { messageId: mail.id },
  });
  // El handler document puede necesitar varios ticks hasta llegar a waiting_input.
  let waiting = await server.agent.getTask(owner, task.id);
  for (let k = 0; k < 6; k++) {
    await server.agent.worker.tick();
    waiting = await server.agent.getTask(owner, task.id);
    if (waiting.status === "waiting_input" || waiting.status === "waiting_approval") break;
  }
  assert.equal(waiting.status, "waiting_input", `documentTask after ticks: ${waiting.status} (${waiting.error ?? "no error"})`);
  assert.ok(Array.isArray(waiting.state.missingFields));
  await server.agent.answer(owner, task.id, "Use these fictional test values", {
    participant_name: "Test Student",
    guardian_name: "Test Guardian",
    permission_granted: true,
  });
  await server.agent.worker.tick();
  const reviewed = await server.agent.detail(owner, task.id);
  assert.equal(reviewed.task.status, "waiting_approval");
  assert.equal(reviewed.files.length, 1);
  assert.ok(reviewed.files[0].url);
  assert.ok(reviewed.task.actionId);
  const action = await tdb.get<ActionProposal>(owner, "actions", reviewed.task.actionId);
  assert.ok(action);
  assert.equal(action.taskId, task.id);
  return { task: reviewed.task, action, originalId: mail.attachments[0] };
}

test("document job runs without a client, waits for review, and resumes from its receipt", async () => {
  const initialIdeas = await server.agent.refreshIdeas(owner);
  const originalIdea = initialIdeas.find((idea) => idea.kind === "document");
  assert.ok(originalIdea);
  const { task, action, originalId } = await documentTask();
  assert.equal((await server.files.get(owner, originalId)).parentId, undefined);
  assert.equal(
    (await server.workspace.snapshot(owner)).mail.filter((m) => m.subject.startsWith("Re:")).length,
    0,
  );
  await server.agent.control(owner, task.id, "pause");
  await assert.rejects(
    server.actions.decide(owner, action.id, action.hash, "approve"),
    /Resume the task/,
  );
  await server.agent.control(owner, task.id, "resume");
  const receipt = await server.actions.decide(owner, action.id, action.hash, "approve");
  assert.equal(receipt.status, "succeeded");
  await server.agent.worker.tick();
  assert.equal((await server.agent.getTask(owner, task.id)).status, "succeeded");
  const notices = await tdb.list<AgentNotification>(owner, "notifications");
  assert.equal(notices.filter((n) => n.taskId === task.id && n.title === task.title).length, 1);
  await server.agent.worker.tick();
  assert.equal(
    (await tdb.list<ActionProposal>(owner, "actions")).filter((a) => a.taskId === task.id).length,
    1,
  );
  const refreshedIdeas = await server.agent.refreshIdeas(owner);
  assert.equal(refreshedIdeas.find((idea) => idea.id === originalIdea.id)?.status, "dismissed");
  assert.equal(
    refreshedIdeas.filter((idea) => idea.kind === "document" && idea.status === "new").length,
    0,
  );
});

test("ideas ignore sent replies while retaining unfinished incoming requests", async () => {
  const ideaOwner = "sent-reply-ideas";
  await server.workspace.ensureSample(ideaOwner, server.actions);
  const workspace = await server.workspace.snapshot(ideaOwner);
  const incoming = workspace.mail.find((mail) => mail.attachments.length);
  assert.ok(incoming);
  await server.workspace.execute(ideaOwner, {
    kind: "email.send",
    data: {
      to: [incoming.from],
      cc: [],
      bcc: [],
      subject: "Re: Complete the form and schedule a meeting",
      body: "Here is the completed permission form. Let's meet for coffee.",
      attachmentIds: incoming.attachments,
    },
  });
  const ideas = await server.agent.refreshIdeas(ideaOwner);
  const sent = (await server.workspace.snapshot(ideaOwner)).mail.find(
    (mail) => mail.sender === "You",
  );
  assert.ok(sent);
  assert.ok(ideas.some((idea) => idea.input.messageId === incoming.id));
  assert.ok(!ideas.some((idea) => idea.input.messageId === sent.id));
});

test("cancelling a task denies its pending action", async () => {
  const { task, action } = await documentTask();
  await server.agent.control(owner, task.id, "cancel");
  assert.equal(
    (await server.actions.decide(owner, action.id, action.hash, "approve")).status,
    "denied",
  );
  await server.agent.worker.tick();
  assert.equal((await server.agent.getTask(owner, task.id)).status, "cancelled");
});

test("failed page checks back off, expose the error, and pause after repeated failures", async () => {
  const monitor = await server.agent.createMonitor(owner, {
    title: "Public availability",
    url: "sample://availability", // MONITOR_TEST_V1 - sample para no depender del browser worker
  });
  // El monitor se siembra con sample://availability. En modo sample,
  // la primera observation ya marca un baseline y no falla. Para provocar
  // fallo, sembramos una pagina que no existe.
  await tdb.put(owner, "sample-pages", { id: "availability", text: "initial" });
  for (let i = 1; i <= 5; i++) {
    // MONITOR_TEST_V2 - leer el task INMEDIATAMENTE despues de que cambie de
    // estado, no en un loop que haga ticks extra. Un tick extra "observa" con
    // exito (lastHash ya esta actualizado) y borra el error anterior.
    let task = await server.agent.getTask(owner, monitor.taskId);
    const targetStatus = i < 5 ? "scheduled" : "paused";
    for (let j = 0; j < 12; j++) {
      const before = task.status;
      await server.agent.worker.tick();
      task = await server.agent.getTask(owner, monitor.taskId);
      // Salir cuando llegue al target O cuando haya cambiado de estado con error.
      if (task.status === targetStatus || (task.status !== before && task.error)) break;
    }
    assert.equal(task.status, targetStatus, `iteration ${i}: got ${task.status}`);
    assert.ok(task.error, `iteration ${i}: expected error, got ${task.error}`);
    assert.equal(task.state.failures, i);
    if (i < 5)
      await tdb.compareAndSwap(
        owner,
        "tasks",
        task.id,
        { status: "scheduled" },
        { nextRunAt: "2020-01-01T00:00:00Z" },
      );
  }
  assert.equal((await db.get<Monitor>(owner, "monitors", monitor.id))?.status, "paused");
});

test("dismissal racing acceptance never creates work for a dismissed idea", async () => {
  // Determinista: 4 iteraciones. En cada una, decidimos primero y luego intentamos
  // el opuesto. El segundo decideIdea debe ser no-op o devolver el estado ya fijado.
  for (let i = 0; i < 4; i++) {
    const idea: Idea = {
      id: `race-${i}`,
      title: `Plan a walk ${i}`,
      reason: "User context",
      prompt: "Plan a walk",
      kind: "plan",
      input: {},
      evidence: [],
      status: "new",
      createdAt: new Date().toISOString(),
    };
    await tdb.put(owner, "ideas", idea);

    if (i % 2 === 0) {
      // i par: accept gana
      const accepted = await server.agent.decideIdea(owner, idea.id, "accept");
      assert.equal(accepted?.status, "accepted", `iter ${i} accept`);
      assert.ok(accepted?.taskId, `iter ${i} taskId presente tras accept`);
      const tasksAfterAccept = await tdb.list<AgentTask>(owner, "tasks");
      assert.ok(
        tasksAfterAccept.some((t) => t.id === accepted.taskId),
        `iter ${i}: task real existe`,
      );
      // Dismiss despues: no-op (devuelve la idea accepted)
      const afterDismiss = await server.agent.decideIdea(owner, idea.id, "dismiss");
      assert.equal(afterDismiss?.status, "accepted", `iter ${i} dismiss tras accept`);
      // La tarea sigue existiendo
      const tasksFinal = await tdb.list<AgentTask>(owner, "tasks");
      assert.ok(tasksFinal.some((t) => t.id === accepted.taskId));
    } else {
      // i impar: dismiss gana
      const dismissed = await server.agent.decideIdea(owner, idea.id, "dismiss");
      assert.equal(dismissed?.status, "dismissed", `iter ${i} dismiss`);
      const tasksAfterDismiss = await tdb.list<AgentTask>(owner, "tasks");
      assert.equal(
        tasksAfterDismiss.filter((t) => t.title === idea.title).length,
        0,
        `iter ${i}: no task para idea dismissed`,
      );
      // Accept despues: no-op
      const afterAccept = await server.agent.decideIdea(owner, idea.id, "accept");
      assert.equal(afterAccept?.status, "dismissed", `iter ${i} accept tras dismiss`);
    }
  }
});

