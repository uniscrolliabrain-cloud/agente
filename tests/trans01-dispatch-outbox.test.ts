// TRANS01_K06_DISPATCH_OUTBOX_V1 - la decision y su intencion de despacho se
// confirman en la misma transaccion. Si el proceso cae antes del receipt, la
// recuperacion marca `outcome_unknown` y nunca reenvia el efecto.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ActionService, type ActionDispatchIntent } from "../apps/server/src/actions.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import type { ActionProposal } from "../packages/domain/src/index.ts";

let db: Store;
before(async () => {
  db = await createStore();
});
after(async () => {
  await db.close();
});

const email = {
  kind: "email.send" as const,
  data: {
    to: ["sam@example.com"],
    subject: "Discovery",
    body: "Hueco el martes.",
    cc: [],
    bcc: [],
    attachmentIds: [],
  },
};

test("aprobar escribe auditoria, actividad e intencion en la misma transaccion", async () => {
  const owner = "dispatch-ok";
  const service = new ActionService(db, {
    connected: async () => true,
    execute: async () => "provider-receipt",
  });
  const proposal = await service.propose(owner, email);
  const decided = await service.decide(owner, proposal.id, proposal.hash, "approve");
  assert.equal(decided.status, "succeeded");
  const intents = await db.list<ActionDispatchIntent>(owner, "action-dispatch");
  assert.equal(intents.length, 1);
  assert.equal(intents[0].status, "settled");
  assert.equal(intents[0].actionStatus, "succeeded");
  const audit = await db.list<{ kind?: string }>(owner, "action-audit");
  assert.ok(audit.some((entry) => entry.kind === "approve"));
  const activity = await db.list(owner, "activity");
  assert.ok(activity.length >= 2, "propose y decide registran actividad");
});

test("si la transaccion falla no queda decision, auditoria ni intencion", async () => {
  const owner = "dispatch-rollback";
  let effects = 0;
  const failing = Object.create(db) as Store;
  failing.transaction = (async (fn: never) =>
    db.transaction(async (tx) => {
      const proxy = {
        claim: tx.claim.bind(tx),
        put: async (o: string, kind: string, value: { id: string }) => {
          if (kind === "action-dispatch") throw new Error("commit rejected");
          return tx.put(o, kind, value);
        },
      };
      return (fn as unknown as (value: unknown) => Promise<unknown>)(proxy);
    })) as never;
  const service = new ActionService(failing, {
    connected: async () => true,
    execute: async () => {
      effects += 1;
      return "sent";
    },
  });
  const proposal = await service.propose(owner, email);
  await assert.rejects(service.decide(owner, proposal.id, proposal.hash, "approve"), /commit rejected/);
  assert.equal(effects, 0, "sin commit no hay despacho");
  const saved = await db.get<ActionProposal>(owner, "actions", proposal.id);
  assert.equal(saved?.status, "awaiting_review", "el claim se revierte con la transaccion");
  assert.equal((await db.list(owner, "action-dispatch")).length, 0);
  assert.ok(!(await db.list<{ kind?: string }>(owner, "action-audit")).some((entry) => entry.kind === "approve"));
});

test("una caida tras el commit deja intencion pendiente y se concilia sin reenviar", async () => {
  const owner = "dispatch-crash";
  const service = new ActionService(db, {
    connected: async () => true,
    execute: async () => "sent",
  });
  // Se simula la ventana de fallo: accion `executing` + intencion pendiente
  // antigua, sin receipt. Es el estado que deja una caida entre commit y run.
  await db.put(owner, "actions", {
    id: "crash-1",
    title: "Send",
    kind: "email.send",
    data: email.data,
    status: "executing",
    hash: "h-1",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  } as unknown as ActionProposal & { id: string });
  await db.put(owner, "action-dispatch", {
    id: "crash-1",
    actionId: "crash-1",
    status: "pending",
    hash: "h-1",
    decidedBy: owner,
    decidedAt: new Date(Date.now() - 3600000).toISOString(),
  } as ActionDispatchIntent & { id: string });

  const reconciled = await service.reconcileDispatchIntents();
  assert.equal(reconciled, 1);
  const action = await db.get<ActionProposal>(owner, "actions", "crash-1");
  assert.equal(action?.status, "outcome_unknown");
  assert.equal((action as { reconciliationRequired?: boolean } | null)?.reconciliationRequired, true);
  const intent = await db.get<ActionDispatchIntent>(owner, "action-dispatch", "crash-1");
  assert.equal(intent?.status, "reconciled");
});

test("una intencion cuya accion ya termino se cierra sin tocarla", async () => {
  const owner = "dispatch-terminal";
  const service = new ActionService(db, {
    connected: async () => true,
    execute: async () => "sent",
  });
  await db.put(owner, "actions", {
    id: "done-1",
    title: "Send",
    kind: "email.send",
    data: email.data,
    status: "succeeded",
    hash: "h-2",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  } as unknown as ActionProposal & { id: string });
  await db.put(owner, "action-dispatch", {
    id: "done-1",
    actionId: "done-1",
    status: "pending",
    decidedAt: new Date(Date.now() - 3600000).toISOString(),
  } as ActionDispatchIntent & { id: string });
  await service.reconcileDispatchIntents();
  const action = await db.get<ActionProposal>(owner, "actions", "done-1");
  assert.equal(action?.status, "succeeded");
  const intent = await db.get<ActionDispatchIntent>(owner, "action-dispatch", "done-1");
  assert.equal(intent?.status, "settled");
});

test("un error generico del proveedor deja la accion ambigua, no fallida", async () => {
  const owner = "dispatch-ambiguous";
  const service = new ActionService(db, {
    connected: async () => true,
    execute: async () => {
      throw new Error("socket hang up");
    },
  });
  const proposal = await service.propose(owner, email);
  const decided = await service.decide(owner, proposal.id, proposal.hash, "approve");
  assert.equal(decided.status, "outcome_unknown");
  const retry = await service.retry(owner, proposal.id).catch((error: Error) => error);
  assert.match(String(retry), /uncertain outcome|reconcile/i);
});

test("un rechazo confirmado antes del despacho deja la accion fallida y reintentable", async () => {
  const owner = "dispatch-rejected";
  let calls = 0;
  const service = new ActionService(db, {
    connected: async () => true,
    execute: async () => {
      calls += 1;
      if (calls === 1)
        throw Object.assign(new Error("invalid recipient"), { outcome: "rejected_before_dispatch" });
      return "sent";
    },
  });
  const proposal = await service.propose(owner, email);
  const decided = await service.decide(owner, proposal.id, proposal.hash, "approve");
  assert.equal(decided.status, "failed");
  const retried = await service.retry(owner, proposal.id);
  assert.equal(retried.status, "awaiting_review");
});
