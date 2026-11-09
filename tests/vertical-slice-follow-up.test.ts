// VERTICAL_SLICE_FOLLOW_UP_TEST_V1 - seguimiento elegible y cancelacion durable (campana 19).
//
// Cierre de campana:
//   - el paso se guarda por lead e hilo, deduplica y respeta los limites;
//   - una respuesta o una baja detectada por hilo e identidad cierra el paso;
//   - responder durante la aprobacion o darse de baja durante la espera impide
//     el envio;
//   - una respuesta termina en cita solo con el recibo del proveedor.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { SOPTriggerEvaluator } from "../apps/server/src/engine/sop-triggers.ts";
import { leadRef, LeadsService } from "../apps/server/src/engine/leads.ts";
import { prepareFollowUpDraft } from "../apps/server/src/engine/worker.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import type { GoogleMapsClient } from "../packages/integrations/src/google-maps.ts";
import type { ActionProposal } from "../packages/domain/src/index.ts";
import { testConfig } from "./helpers/config.ts";

const OWNER = "local-user";
const TENANT = "default";
const SCOPE = { tenantId: TENANT, actorId: OWNER };
const CONTACT = "marta@cafenorte.example";
const THREAD = "thread-cafe";

const NO_PLACES = {
  searchLeads: async () => {
    throw new Error("el seguimiento no busca en Places");
  },
} as unknown as GoogleMapsClient;

type Server = Awaited<ReturnType<typeof createApp>>;

async function harness(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "agente-follow-up-"));
  const db: Store = await createStore({ dataDir: join(directory, "db") });
  const server = await createApp(db, testConfig({ dataDir: directory }));
  t.after(async () => {
    await server.agent.stop();
    await db.close();
    await rm(directory, { recursive: true, force: true });
  });
  const leads = new LeadsService(new TenantScopedStore(db, async () => TENANT), NO_PLACES);
  return { db, server, leads };
}

const future = (offsetMs = 3_600_000) => new Date(Date.now() + offsetMs).toISOString();

async function acceptFicha(db: Store) {
  const placeId = "place-cafe";
  const ref = leadRef(TENANT, placeId);
  const now = new Date().toISOString();
  await db.put(`${TENANT}:pipeline`, "leads", {
    id: ref,
    ref,
    placeId,
    tenantId: TENANT,
    owner: OWNER,
    acceptedBy: [OWNER],
    name: "Cafe Norte",
    address: "Calle 1, 3",
    phone: "+34600000000",
    website: "https://cafenorte.example",
    domain: "cafenorte.example",
    rating: 4.6,
    reviews: 140,
    businessStatus: "OPERATIONAL",
    notes: "cafeterias del centro",
    status: "accepted",
    source: { provider: "google_places", placeId, query: "cafeterias", discoveredAt: now },
    acceptedAt: now,
    updatedAt: now,
  });
  return { ref };
}

function stepInput(ref: string, overrides: Record<string, unknown> = {}) {
  return {
    ref,
    step: 1,
    threadId: THREAD,
    replyToMessageId: "mail-out-1",
    to: CONTACT,
    subject: "Seguimiento: Cafe Norte",
    scheduledFor: future(),
    ...overrides,
  };
}

async function seedThread(db: Store) {
  await db.put(`${TENANT}:${OWNER}`, "mail", {
    id: "mail-out-1",
    threadId: THREAD,
    sender: "You",
    from: "alex@example.com",
    to: [CONTACT],
    subject: "Hola",
    body: "Primer contacto",
    date: new Date(Date.now() - 86_400_000).toISOString(),
    unread: false,
    label: "Sent",
    attachments: [],
  });
}

async function addMail(
  db: Store,
  input: { id: string; threadId?: string; from: string; body: string; date: string },
) {
  await db.put(`${TENANT}:${OWNER}`, "mail", {
    id: input.id,
    threadId: input.threadId ?? THREAD,
    sender: input.from,
    from: input.from,
    to: ["alex@example.com"],
    subject: "Re: Seguimiento",
    body: input.body,
    date: input.date,
    unread: true,
    label: "Inbox",
    attachments: [],
  });
}

async function prepareAndPropose(server: Server, ref: string) {
  const prepared = await runInTenantScope(SCOPE, () =>
    prepareFollowUpDraft(server.agent, OWNER, stepInput(ref)),
  );
  const action = await runInTenantScope(SCOPE, () =>
    server.actions.propose(OWNER, prepared.draft, prepared.idempotencyKey),
  );
  return { prepared, action };
}

test("el seguimiento durable deduplica, limita pasos y respeta la oposicion", async (t) => {
  const { db, leads } = await harness(t);
  const { ref } = await acceptFicha(db);

  // Sin contacto valido no hay seguimiento, aunque el resto del paso este bien.
  await assert.rejects(
    () => leads.scheduleFollowUp(TENANT, stepInput(ref, { to: "sin-correo" })),
    /contacto/,
  );

  const first = await leads.scheduleFollowUp(TENANT, stepInput(ref));
  assert.equal(first.created, true);
  assert.equal(first.followUp.status, "scheduled");
  assert.equal(first.followUp.id, `${ref}:1`);

  // La misma preparacion vuelve al mismo paso: ni duplica ni reinicia la cuenta.
  const again = await leads.scheduleFollowUp(TENANT, stepInput(ref));
  assert.equal(again.created, false);
  assert.equal(again.followUp.id, first.followUp.id);
  assert.equal((await leads.followUps(TENANT, ref)).length, 1);

  await assert.rejects(
    () => leads.scheduleFollowUp(TENANT, stepInput(ref, { step: 4 })),
    /paso fuera de rango/,
  );
  await assert.rejects(
    () => leads.scheduleFollowUp(TENANT, stepInput(ref, { step: 2, to: CONTACT })),
    /seguimiento abierto|paso anterior/,
  );
  // La baja es una lista de oposicion: cierra el paso abierto y bloquea el alta.
  const opposed = await leads.oppose(TENANT, ref, { reason: "baja", source: "mail:baja-1" });
  assert.equal(opposed.cancelled.length, 1);
  assert.equal(opposed.cancelled[0].status, "opted_out");
  assert.equal(opposed.cancelled[0].cancelledReason, "baja");
  assert.ok(await leads.opposition(TENANT, ref));
  await assert.rejects(
    () => leads.scheduleFollowUp(TENANT, stepInput(ref, { step: 2, scheduledFor: future() })),
    /baja/,
  );
});

test("la respuesta se detecta por hilo e identidad, y la baja cierra el seguimiento", async (t) => {
  const { db, server, leads } = await harness(t);
  const { ref } = await acceptFicha(db);
  await leads.scheduleFollowUp(TENANT, stepInput(ref));
  const evaluator = new SOPTriggerEvaluator(server.agent);

  // Otro remitente en el mismo hilo no responde por el contacto.
  await addMail(db, {
    id: "mail-otro",
    from: "otro@example.com",
    body: "BAJA",
    date: future(1_000),
  });
  assert.equal(await runInTenantScope(SCOPE, () => evaluator.sweepFollowUps(OWNER)), 0);
  assert.equal((await leads.followUps(TENANT, ref))[0].status, "scheduled");

  // El contacto, en su hilo y despues del envio, pide la baja.
  await addMail(db, {
    id: "mail-baja",
    from: `Marta <${CONTACT}>`,
    body: "Gracias, pero no me escribas mas. BAJA",
    date: future(2_000),
  });
  assert.equal(await runInTenantScope(SCOPE, () => evaluator.sweepFollowUps(OWNER)), 1);
  const closed = (await leads.followUps(TENANT, ref))[0];
  assert.equal(closed.status, "opted_out");
  assert.equal(closed.cancelledReason, "baja");
  assert.ok(await leads.opposition(TENANT, ref));
});

test("responder durante la aprobacion impide el envio", async (t) => {
  const { db, server, leads } = await harness(t);
  const { ref } = await acceptFicha(db);
  await seedThread(db);
  const { action } = await prepareAndPropose(server, ref);

  assert.equal(action.status, "awaiting_review");
  const prepared = (await leads.followUps(TENANT, ref))[0];
  assert.equal(prepared.status, "awaiting_approval");
  assert.equal(prepared.actionId, action.id);

  await addMail(db, {
    id: "mail-reply",
    from: CONTACT,
    body: "Me interesa, llamame por la tarde",
    date: future(2_000),
  });

  await assert.rejects(
    () =>
      runInTenantScope(SCOPE, () =>
        server.actions.decide(OWNER, action.id, action.hash, "approve"),
      ),
    /respondio/,
    "la respuesta del contacto cancela la aprobacion",
  );
  const stored = await db.get<ActionProposal>(`${TENANT}:${OWNER}`, "actions", action.id);
  assert.equal(stored?.status, "denied");
  const mail = await db.list<{ from: string }>(`${TENANT}:${OWNER}`, "mail");
  assert.equal(mail.filter((message) => message.from === "alex@example.com").length, 1, "solo el correo de salida inicial");
  assert.equal((await leads.followUps(TENANT, ref))[0].status, "replied");
});

test("la baja durante la espera cancela el despacho programado", async (t) => {
  const { db, server, leads } = await harness(t);
  const { ref } = await acceptFicha(db);
  await seedThread(db);
  const { action } = await prepareAndPropose(server, ref);

  // Ventana de undo: la accion espera programada, como en la campana 06.
  const scheduled = await db.compareAndSwap<ActionProposal>(
    `${TENANT}:${OWNER}`,
    "actions",
    action.id,
    { status: "awaiting_review" },
    { status: "scheduled", executeAt: future() },
  );
  assert.ok(scheduled, "la propuesta queda programada");

  await addMail(db, {
    id: "mail-baja",
    from: CONTACT,
    body: "Date de baja, no me escribas mas",
    date: future(2_000),
  });

  const dispatch = await runInTenantScope(SCOPE, () =>
    server.actions.dispatchScheduled(OWNER, action.id),
  );
  assert.equal(dispatch.executed, false);
  assert.match(dispatch.reason ?? "", /baja/);
  const stored = await db.get<ActionProposal>(`${TENANT}:${OWNER}`, "actions", action.id);
  assert.equal(stored?.status, "denied");
  const mail = await db.list<{ from: string }>(`${TENANT}:${OWNER}`, "mail");
  assert.equal(mail.filter((message) => message.from === "alex@example.com").length, 1, "no se envia nada");
  assert.equal((await leads.followUps(TENANT, ref))[0].status, "opted_out");
});

test("una respuesta termina en cita solo con el recibo del envio", async (t) => {
  const { db, leads } = await harness(t);
  const { ref } = await acceptFicha(db);
  await leads.scheduleFollowUp(TENANT, stepInput(ref));

  const replied = await leads.recordInbound(TENANT, ref, {
    messageId: "mail-reply",
    from: CONTACT,
    at: future(1_000),
    optOut: false,
  });
  assert.equal(replied?.status, "replied");

  await assert.rejects(
    () => leads.bookAppointment(TENANT, ref, { receiptId: "", eventId: "evt-1", startsAt: future(7_200_000) }),
    /recibo/,
  );
  const booked = await leads.bookAppointment(TENANT, ref, {
    receiptId: "Gmail sent message · msg-9",
    eventId: "evt-1",
    startsAt: future(7_200_000),
  });
  assert.equal(booked.status, "booked");
  assert.equal(booked.appointment?.receiptId, "Gmail sent message · msg-9");
  assert.equal(booked.appointment?.eventId, "evt-1");
  assert.equal(booked.appointment?.threadId, THREAD);
  await assert.rejects(
    () => leads.bookAppointment(TENANT, ref, { receiptId: "x", eventId: "evt-2", startsAt: future(9_000_000) }),
    /despues de una respuesta/,
  );
});
