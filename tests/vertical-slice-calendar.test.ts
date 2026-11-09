// VERTICAL_SLICE_CALENDAR_TEST_V1 - disponibilidad, reserva y recibo Calendar (campana 16).
//
// Cierre de campana:
//   - la disponibilidad respeta ventana, duracion, zona IANA y el cambio de hora;
//   - preparar exige un calendario autorizado y un hueco libre, con aprobacion;
//   - aprobar escribe una sola vez y persiste evento y enlace;
//   - dos aprobaciones simultaneas del mismo hueco no crean dos eventos;
//   - un timeout no duplica la escritura y se concilia leyendo el evento;
//   - A y B ven solo su propio calendario.

import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test, type TestContext } from "node:test";
import { ActionService } from "../apps/server/src/actions.ts";
import type { Auth } from "../apps/server/src/auth.ts";
import type { Config } from "../apps/server/src/config.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { RagService } from "../apps/server/src/engine/rag.ts";
import { Files } from "../apps/server/src/files.ts";
import { GoogleAuth } from "../apps/server/src/google-auth.ts";
import { currentTenantScope, runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { WorkspaceService } from "../apps/server/src/workspace.ts";
import { encryptSecret } from "../packages/integrations/src/vault.ts";
import { testConfig } from "./helpers/config.ts";

const A = { tenantId: "agencia-a", actorId: "fundador-a" };
const B = { tenantId: "agencia-b", actorId: "fundador-b" };
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
];

interface EventResource {
  id: string;
  etag?: string;
  summary: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
  attendees?: { email: string }[];
  htmlLink?: string;
}

function busy(id: string, start: string, end: string, summary = "Busy"): EventResource {
  return {
    id,
    etag: `etag-${id}`,
    summary,
    start: { dateTime: start, timeZone: "America/Los_Angeles" },
    end: { dateTime: end },
  };
}

async function harness(t: TestContext) {
  const db: Store = await createStore();
  t.after(() => db.close());
  const config: Config = testConfig({
    mode: "live",
    agentBackend: "model",
    googleClientId: "synthetic-client",
    googleClientSecret: "synthetic-secret",
    encryptionKey: randomBytes(32).toString("base64"),
  });
  const tdb = new TenantScopedStore(db, async () => currentTenantScope()?.tenantId ?? "default");
  const auth = new GoogleAuth(tdb, config, db);
  const rag = new RagService(tdb);
  const files = new Files(tdb, config, {
    sign: (_owner: string, path: string) => path,
  } as unknown as Auth);
  const workspace = new WorkspaceService(tdb, config, files, auth, rag);
  const actions = new ActionService(tdb, {
    connected: (owner) => workspace.connected(owner),
    connection: (owner) => workspace.connection(owner),
    prepare: (owner, input, connectionId) => workspace.prepare(owner, input, connectionId),
    execute: (owner, input, connectionId, targetVersion) =>
      workspace.execute(owner, input, connectionId, targetVersion),
  });
  return { db, config, tdb, auth, workspace, actions };
}

async function seedConnection(
  tdb: TenantScopedStore,
  config: Config,
  scope: typeof A,
  connectionId: string,
) {
  const key = config.encryptionKey;
  assert.ok(key);
  const tokens = {
    connectionId,
    accessToken: `access-${connectionId}`,
    refreshToken: `refresh-${connectionId}`,
    expiresAt: Date.now() + 3600_000,
    scopes: SCOPES,
    account: `${scope.actorId}@agencia-a.test`,
    tenantId: scope.tenantId,
    authorizer: scope.actorId,
    provider: "google" as const,
    connectedAt: new Date().toISOString(),
  };
  await runInTenantScope(scope, () =>
    tdb.put(scope.actorId, "credentials", {
      id: "google",
      connectionId,
      generation: `generation-${connectionId}`,
      tenantId: scope.tenantId,
      provider: "google",
      secret: encryptSecret(JSON.stringify(tokens), key),
    }),
  );
}

interface MockState {
  creates: number;
  events: EventResource[];
  failCreate: boolean;
  createId: string;
}

function mockCalendars(t: TestContext, seed: Record<string, EventResource[]> = {}) {
  const states = new Map<string, MockState>();
  for (const [connectionId, events] of Object.entries(seed))
    states.set(connectionId, { creates: 0, events: [...events], failCreate: false, createId: "evt-created" });
  t.mock.method(
    globalThis,
    "fetch",
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      const authorization = new Headers(init?.headers).get("authorization") ?? "";
      const connectionId = authorization.replace(/^Bearer access-/, "");
      if (url.hostname === "oauth2.googleapis.com")
        return Response.json({ access_token: `access-${connectionId}`, expires_in: 3600 });
      // Cada empresa solo ve su propia credencial: A tiene conn-a y B conn-b.
      const state = states.get(connectionId);
      if (!state) return new Response("not found", { status: 404 });

      const path = url.pathname;
      if (path.endsWith("/users/me/calendarList"))
        return Response.json({
          items: [
            {
              id: "primary",
              summary: "Personal",
              timeZone: "America/Los_Angeles",
              accessRole: "owner",
            },
          ],
        });
      if (path.endsWith("/calendars/primary/events") && init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}")) as {
          summary: string;
          start: { dateTime?: string; date?: string; timeZone?: string };
          end: { dateTime?: string; date?: string };
          location?: string;
          description?: string;
          attendees?: { email: string }[];
        };
        const id = state.createId;
        const created: EventResource = {
          id,
          etag: `etag-${id}`,
          summary: body.summary,
          start: { dateTime: body.start.dateTime, timeZone: body.start.timeZone },
          end: { dateTime: body.end.dateTime },
          location: body.location ?? "",
          description: body.description ?? "",
          attendees: body.attendees ?? [],
          htmlLink: `https://www.google.com/calendar/event?eid=${id}`,
        };
        state.creates += 1;
        state.events = [...state.events, created];
        // El proveedor puede haber creado el evento aunque la respuesta se pierda.
        if (state.failCreate) throw new TypeError("fetch failed");
        return Response.json(created);
      }
      if (path.endsWith("/calendars/primary/events"))
        return Response.json({ items: state.events, timeZone: "America/Los_Angeles" });
      const single = /\/calendars\/primary\/events\/([^/]+)$/.exec(path);
      if (single) {
        const event = state.events.find((item) => item.id === single[1]);
        return event ? Response.json(event) : new Response("not found", { status: 404 });
      }
      return new Response("not found", { status: 404 });
    },
  );
  return states;
}

function mockCalendar(t: TestContext, connectionId: string, seed: EventResource[] = []) {
  return mockCalendars(t, { [connectionId]: seed }).get(connectionId) as MockState;
}

function eventData(overrides: Record<string, unknown> = {}) {
  return {
    calendarId: "primary",
    title: "Cafe con Marta",
    start: "2026-09-14T15:00:00-07:00",
    end: "2026-09-14T16:00:00-07:00",
    allDay: false,
    timeZone: "America/Los_Angeles",
    location: "Bluebird",
    description: "Presupuesto Q4",
    attendees: ["marta@agencia-a.test"],
    ...overrides,
  };
}

test("la disponibilidad respeta ventana, duracion, zona y el cambio de hora", async (t) => {
  const { tdb, config, workspace } = await harness(t);
  mockCalendar(t, "conn-a", [
    busy("evt-busy", "2026-03-08T01:00:00-08:00", "2026-03-08T01:30:00-08:00"),
  ]);
  await seedConnection(tdb, config, A, "conn-a");

  const result = await runInTenantScope(A, () =>
    workspace.availability(A.actorId, {
      calendarId: "primary",
      timeMin: "2026-03-08T00:00:00-08:00",
      timeMax: "2026-03-08T06:00:00-07:00",
      durationMinutes: 60,
    }),
  );
  assert.equal(result.timeZone, "America/Los_Angeles");
  assert.equal(result.durationMinutes, 60);
  assert.equal(result.timeMax, "2026-03-08T06:00:00-07:00");
  assert.deepEqual(result.slots[0], {
    start: "2026-03-08T00:00:00-08:00",
    end: "2026-03-08T01:00:00-08:00",
  });
  // A las 02:00 locales se adelanta el reloj: el hueco siguiente empieza a las
  // 01:30 con offset -08:00 y termina ya en -07:00.
  assert.deepEqual(
    result.slots.find((slot) => slot.end === "2026-03-08T03:30:00-07:00"),
    { start: "2026-03-08T01:30:00-08:00", end: "2026-03-08T03:30:00-07:00" },
  );
  assert.ok(result.slots.every((slot) => !slot.start.includes("T02:")));
  for (const slot of result.slots)
    assert.equal(Date.parse(slot.end) - Date.parse(slot.start), 3600_000);
});

test("preparar exige calendario autorizado y un hueco libre, con aprobacion", async (t) => {
  const { tdb, config, actions } = await harness(t);
  const calendar = mockCalendar(t, "conn-a", [
    busy("evt-busy", "2026-09-14T15:00:00-07:00", "2026-09-14T16:00:00-07:00", "Cafe con Marta"),
  ]);
  await seedConnection(tdb, config, A, "conn-a");

  await assert.rejects(
    runInTenantScope(A, () =>
      actions.propose(A.actorId, { kind: "calendar.create", data: eventData() }),
    ),
    /busy/i,
  );
  assert.equal(calendar.creates, 0);

  calendar.events = [];
  const proposal = await runInTenantScope(A, () =>
    actions.propose(A.actorId, { kind: "calendar.create", data: eventData() }),
  );
  assert.equal(proposal.status, "awaiting_review");
  assert.equal(proposal.connectionId, "conn-a");
  assert.equal(proposal.account, "fundador-a@agencia-a.test");
  const data = proposal.data as Record<string, unknown>;
  assert.equal(data.calendarId, "primary");
  assert.deepEqual(data.attendees, ["marta@agencia-a.test"]);
  assert.equal(calendar.creates, 0, "preparar nunca escribe");
});

test("aprobar escribe una vez, persiste evento y enlace y no cruza empresas", async (t) => {
  const { tdb, config, actions, workspace } = await harness(t);
  const calendars = mockCalendars(t, { "conn-a": [], "conn-b": [] });
  const calendarA = calendars.get("conn-a") as MockState;
  const calendarB = calendars.get("conn-b") as MockState;
  await seedConnection(tdb, config, A, "conn-a");
  await seedConnection(tdb, config, B, "conn-b");

  const proposal = await runInTenantScope(A, () =>
    actions.propose(A.actorId, { kind: "calendar.create", data: eventData() }),
  );
  const approved = await runInTenantScope(A, () =>
    actions.decide(A.actorId, proposal.id, proposal.hash, "approve", "fundador-a"),
  );
  assert.equal(approved.status, "succeeded");
  assert.match(
    approved.result ?? "",
    /Google Calendar event · evt-created · https:\/\/www\.google\.com\/calendar\/event\?eid=evt-created/,
  );
  assert.equal(calendarA.creates, 1);
  assert.equal(calendarB.creates, 0);

  const storedA = await runInTenantScope(A, () =>
    workspace.events(A.actorId, { calendarId: "primary" }),
  );
  assert.deepEqual(
    storedA.map((event) => event.id),
    ["evt-created"],
  );
  const storedB = await runInTenantScope(B, () =>
    workspace.events(B.actorId, { calendarId: "primary" }),
  );
  assert.deepEqual(storedB, []);

  const receipt = await runInTenantScope(A, () =>
    workspace.eventReceipt(A.actorId, "primary", "evt-created"),
  );
  assert.equal(receipt.id, "evt-created");
  assert.equal(receipt.start, "2026-09-14T15:00:00-07:00");
  assert.match(receipt.link ?? "", /eid=evt-created/);
});

test("dos aprobaciones simultaneas del mismo hueco no crean dos eventos", async (t) => {
  const { tdb, config, actions } = await harness(t);
  const calendar = mockCalendar(t, "conn-a");
  await seedConnection(tdb, config, A, "conn-a");

  const first = await runInTenantScope(A, () =>
    actions.propose(A.actorId, { kind: "calendar.create", data: eventData({ title: "Uno" }) }),
  );
  const second = await runInTenantScope(A, () =>
    actions.propose(A.actorId, { kind: "calendar.create", data: eventData({ title: "Dos" }) }),
  );
  const decisions = await Promise.allSettled([
    runInTenantScope(A, () =>
      actions.decide(A.actorId, first.id, first.hash, "approve", "fundador-a"),
    ),
    runInTenantScope(A, () =>
      actions.decide(A.actorId, second.id, second.hash, "approve", "fundador-a"),
    ),
  ]);
  assert.equal(calendar.creates, 1, "un solo evento real");
  const statuses = decisions
    .map((decision) => (decision.status === "fulfilled" ? decision.value.status : "rejected"))
    .sort();
  assert.deepEqual(statuses, ["failed", "succeeded"]);
});

test("un timeout no duplica la escritura y se concilia leyendo el evento", async (t) => {
  const { tdb, config, actions, workspace } = await harness(t);
  const calendar = mockCalendar(t, "conn-a");
  calendar.createId = "evt-timeout";
  calendar.failCreate = true;
  await seedConnection(tdb, config, A, "conn-a");

  const proposal = await runInTenantScope(A, () =>
    actions.propose(A.actorId, { kind: "calendar.create", data: eventData() }),
  );
  const ambiguous = await runInTenantScope(A, () =>
    actions.decide(A.actorId, proposal.id, proposal.hash, "approve", "fundador-a"),
  );
  assert.equal(ambiguous.status, "outcome_unknown");
  assert.equal(calendar.creates, 1, "un solo intento de escritura");

  // El evento existe en el proveedor aunque no llegara la respuesta: se
  // concilia leyendo su identificador, sin reenviar la escritura.
  const receipt = await runInTenantScope(A, () =>
    workspace.eventReceipt(A.actorId, "primary", "evt-timeout"),
  );
  assert.equal(receipt.id, "evt-timeout");

  const again = await runInTenantScope(A, () =>
    actions.decide(A.actorId, proposal.id, proposal.hash, "approve", "fundador-a"),
  );
  assert.equal(again.status, "outcome_unknown");
  assert.equal(calendar.creates, 1, "no se reintenta solo ni duplica");
});
