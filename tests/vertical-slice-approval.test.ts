// VERTICAL_SLICE_APPROVAL_TEST_V1 (campana 14) - aprobacion exacta y evidencia del proveedor.
//
// Cierre de campana:
//   - una llamada en doble aprobacion: dos aprobaciones, un solo despacho;
//   - un timeout ambiguo queda conciliable y no habilita reenvio automatico;
//   - rotar la conexion entre revisar y aprobar no llega al proveedor;
//   - el despacho programado se reserva una sola vez.

import assert from "node:assert/strict";
import { test } from "node:test";
import { ActionService } from "../apps/server/src/actions.ts";
import { createStore } from "../apps/server/src/db.ts";
import type { ActionProposal } from "../packages/domain/src/index.ts";

const email = {
  kind: "email.send" as const,
  data: {
    to: ["sam@example.com"],
    subject: "Visita",
    body: "Adjunto la propuesta.",
    cc: [],
    bcc: [],
    attachmentIds: [],
  },
};

type StoredProposal = ActionProposal & {
  provider?: string;
  providerResult?: string;
  connectionGeneration?: string;
  reconciliationRequired?: boolean;
  settledAt?: string;
  principal?: string;
  revision?: string;
  approvedBy?: string;
};

test("una doble aprobacion produce una sola llamada al proveedor", async () => {
  const db = await createStore();
  try {
    let calls = 0;
    const service = new ActionService(db, {
      connected: async () => true,
      execute: async () => {
        calls += 1;
        return "Gmail sent message · msg-1";
      },
    });
    const proposal = await service.propose("owner-a", email);
    assert.equal((proposal as StoredProposal).principal, "owner-a");
    assert.equal((proposal as StoredProposal).provider, "google");
    assert.ok((proposal as StoredProposal).revision, "la revision del payload queda registrada");

    const first = await service.decide("owner-a", proposal.id, proposal.hash, "approve", "marta");
    const second = await service.decide("owner-a", proposal.id, proposal.hash, "approve", "marta");
    assert.equal(calls, 1, "la segunda aprobacion no vuelve a llamar al proveedor");
    assert.equal(first.status, "succeeded");
    assert.equal(second.status, "succeeded");

    const saved = await db.get<StoredProposal>("owner-a", "actions", proposal.id);
    assert.equal(saved?.provider, "google");
    assert.equal(saved?.providerResult, "Gmail sent message · msg-1");
    assert.equal(saved?.approvedBy, "marta");
    assert.ok(saved?.settledAt);
  } finally {
    await db.close();
  }
});

test("un timeout ambiguo no habilita reenvio automatico", async () => {
  const db = await createStore();
  try {
    let calls = 0;
    const service = new ActionService(db, {
      connected: async () => true,
      execute: async () => {
        calls += 1;
        throw Object.assign(
          new Error("The provider did not confirm the write; its outcome is uncertain."),
          { outcomeUnknown: true, code: "outcome_unknown" },
        );
      },
    });
    const proposal = await service.propose("owner-a", email);
    const result = await service.decide("owner-a", proposal.id, proposal.hash, "approve", "marta");
    assert.equal(result.status, "outcome_unknown");
    assert.equal((result as StoredProposal).reconciliationRequired, true);
    assert.equal((result as StoredProposal).provider, "google");

    await assert.rejects(service.retry("owner-a", proposal.id), /Reconcile/i);
    const again = await service.decide("owner-a", proposal.id, proposal.hash, "approve", "marta");
    assert.equal(again.status, "outcome_unknown");
    const dispatch = await service.dispatchScheduled("owner-a", proposal.id);
    assert.equal(dispatch.executed, false);
    assert.equal(calls, 1, "sin conciliar no se vuelve a llamar al proveedor");
  } finally {
    await db.close();
  }
});

test("rotar la conexion entre revisar y aprobar no llega al proveedor", async () => {
  const db = await createStore();
  try {
    let calls = 0;
    let connection = { id: "conn-1", account: "a@example.com", generation: "gen-1" };
    const service = new ActionService(db, {
      connected: async () => true,
      connection: async () => connection,
      execute: async () => {
        calls += 1;
        return "sent";
      },
    });
    const proposal = await service.propose("owner-a", email);
    assert.equal((proposal as StoredProposal).connectionGeneration, "gen-1");

    connection = { id: "conn-1", account: "a@example.com", generation: "gen-2" };
    await assert.rejects(
      service.decide("owner-a", proposal.id, proposal.hash, "approve", "marta"),
      /rotated/i,
    );
    assert.equal(calls, 0);
    const saved = await db.get<ActionProposal>("owner-a", "actions", proposal.id);
    assert.equal(saved?.status, "awaiting_review", "la revision sigue pendiente, no consumida");
  } finally {
    await db.close();
  }
});

test("el despacho programado se reserva una sola vez y falla cerrado si la conexion cambio", async () => {
  const db = await createStore();
  try {
    let calls = 0;
    let connection = { id: "conn-1", account: "a@example.com", generation: "gen-1" };
    const service = new ActionService(db, {
      connected: async () => true,
      connection: async () => connection,
      execute: async () => {
        calls += 1;
        return "sent";
      },
    });
    const first = await service.propose("owner-a", email);
    await db.put("owner-a", "actions", {
      ...first,
      status: "scheduled",
      executeAt: new Date().toISOString(),
    });
    const results = await Promise.all([
      service.dispatchScheduled("owner-a", first.id),
      service.dispatchScheduled("owner-a", first.id),
    ]);
    assert.equal(calls, 1, "el CAS reserva el despacho una sola vez");
    assert.deepEqual(results.map((r) => r.executed).sort(), [false, true]);

    const second = await service.propose("owner-a", email);
    await db.put("owner-a", "actions", {
      ...second,
      status: "scheduled",
      executeAt: new Date().toISOString(),
    });
    connection = { id: "conn-1", account: "a@example.com", generation: "gen-2" };
    const refused = await service.dispatchScheduled("owner-a", second.id);
    assert.equal(refused.executed, false);
    assert.equal(refused.reason, "connection_changed");
    assert.equal(calls, 1);
    const failed = await db.get<ActionProposal>("owner-a", "actions", second.id);
    assert.equal(failed?.status, "failed");
  } finally {
    await db.close();
  }
});
