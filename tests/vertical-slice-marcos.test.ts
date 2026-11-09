// VERTICAL_SLICE_MARCOS_TEST_V1 - delegacion tipada y cualificacion (campana 18).
//
// Cierre de campana:
//   - un rol deshabilitado, desconocido o sin el trabajo autorizado no encola;
//   - la ficha resultante conserva solicitante y agente y declara la fuente de
//     cada campo;
//   - Places no trae contacto: el resultado lo declara ausente, no lo inventa;
//   - sin fichas aceptadas el trabajo espera en vez de fabricar una ficha.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { leadRef } from "../apps/server/src/engine/leads.ts";
import {
  LEAD_INVESTIGATION_SOP,
  LEAD_INVESTIGATION_VERSION,
  leadInvestigationOutputSchema,
} from "../apps/server/src/engine/worker.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import type { AgentArtifact, AgentRole, AgentTask } from "../packages/domain/src/agent.ts";
import { testConfig } from "./helpers/config.ts";

const OWNER = "local-user";
const TENANT = "default";
const AGENT = "marcos";

type Server = Awaited<ReturnType<typeof createApp>>;

async function harness(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "openmuse-marcos-"));
  const db: Store = await createStore({ dataDir: join(directory, "db") });
  const server = await createApp(db, testConfig({ dataDir: directory }));
  t.after(async () => {
    await server.agent.stop();
    await db.close();
    await rm(directory, { recursive: true, force: true });
  });
  return { db, server };
}

function marcos(active: boolean, sops: string[] = [LEAD_INVESTIGATION_SOP]): AgentRole {
  return {
    id: AGENT,
    name: "Marcos",
    tone: "thoughtful",
    avatar: "sky",
    objetivo: "Prospeccion comercial",
    sops,
    active,
    memories: [],
  };
}

async function seedRole(server: Server, role: AgentRole) {
  await server.agent.db.put(OWNER, "agent-roles", role);
}

function delegate(
  server: Server,
  input: Record<string, unknown>,
  roleId: string = AGENT,
): Promise<AgentTask> {
  return runInTenantScope({ tenantId: TENANT, actorId: OWNER }, () =>
    server.agent.createTask(OWNER, {
      prompt: "Cualifica las fichas aceptadas",
      kind: "sop",
      roleId,
      input: { sopId: LEAD_INVESTIGATION_SOP, ...input },
    }),
  );
}

/** Ficha aceptada del pipeline, escrita como la deja la campana 17. */
async function acceptFicha(
  db: Store,
  overrides: Record<string, unknown> = {},
): Promise<{ ref: string; placeId: string }> {
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
    mapsUrl: "https://maps.google.com/?cid=1",
    businessStatus: "OPERATIONAL",
    notes: "cafeterias del centro, pidieron propuesta",
    status: "accepted",
    source: { provider: "google_places", placeId, query: "cafeterias", discoveredAt: now },
    acceptedAt: now,
    updatedAt: now,
    ...overrides,
  });
  return { ref, placeId };
}

async function taskRows(db: Store): Promise<AgentTask[]> {
  return db.list<AgentTask>(`${TENANT}:${OWNER}`, "tasks");
}

test("un rol deshabilitado, desconocido o sin el trabajo no encola", async (t) => {
  const { db, server } = await harness(t);

  await seedRole(server, marcos(false));
  await assert.rejects(
    () => delegate(server, { criteria: { sector: "cafeterias" } }),
    /deshabilitado/,
    "Marcos apagado no puede recibir el trabajo",
  );
  assert.equal((await taskRows(db)).length, 0, "no queda tarea encolada");

  await seedRole(server, marcos(true, []));
  await assert.rejects(
    () => delegate(server, {}),
    /no tiene autorizado el trabajo investigar-leads/,
    "un rol activo sin el SOP no esta autorizado",
  );

  await assert.rejects(
    () => delegate(server, {}, "persona-fantasma"),
    /no esta autorizado en esta empresa/,
    "un agente que no existe en la empresa no ejecuta",
  );
  assert.equal((await taskRows(db)).length, 0);
});

test("la entrada invalida se rechaza antes de encolar", async (t) => {
  const { db, server } = await harness(t);
  await seedRole(server, marcos(true));

  await assert.rejects(
    () => delegate(server, { criteria: { minRating: 9 } }),
    /investigar-leads/,
    "un criterio fuera de rango no crea tarea",
  );
  assert.equal((await taskRows(db)).length, 0);
});

test("el trabajo cualifica la ficha y conserva solicitante y agente", async (t) => {
  const { db, server } = await harness(t);
  await seedRole(server, marcos(true));
  const { ref } = await acceptFicha(db);

  const created = await delegate(server, {
    criteria: { sector: "cafeterias", city: "Madrid", minRating: 4, minReviews: 100 },
  });
  assert.equal(created.status, "queued");
  assert.equal(created.assignedBy, OWNER, "la tarea conserva al solicitante");
  assert.equal(created.assignedTo, AGENT, "la tarea conserva al agente autorizado");
  assert.deepEqual(created.state.work, {
    id: LEAD_INVESTIGATION_SOP,
    version: LEAD_INVESTIGATION_VERSION,
  });

  await server.agent.worker.tick();

  const done = await db.get<AgentTask>(`${TENANT}:${OWNER}`, "tasks", created.id);
  assert.ok(done, "la tarea sigue en el store de la empresa");
  assert.equal(done.status, "succeeded");
  assert.equal(done.assignedBy, OWNER);
  assert.equal(done.assignedTo, AGENT);

  const output = leadInvestigationOutputSchema.parse(done.state.workOutput);
  assert.equal(output.requestedBy, OWNER, "el resultado conserva al solicitante");
  assert.equal(output.agent, AGENT, "el resultado conserva al agente");
  assert.equal(output.sop.version, LEAD_INVESTIGATION_VERSION);
  assert.equal(output.leads.length, 1);

  const lead = output.leads[0];
  assert.equal(lead.ref, ref);
  assert.equal(lead.name, "Cafe Norte");
  assert.equal(lead.fit, "alto");
  assert.ok(lead.score >= 70, `encaje alto con criterios cumplidos (${lead.score})`);
  assert.ok(lead.criteriaMatched.includes("rating>=4"));
  assert.ok(lead.criteriaMatched.includes("web"));
  assert.ok(lead.criteriaMatched.includes("telefono"));
  assert.ok(lead.criteriaMissed.includes("texto:madrid"));
  assert.equal(lead.source.provider, "google_places");
  assert.equal(lead.source.query, "cafeterias");

  // Verificacion por campo: solo lo acreditado viaja verificado.
  assert.deepEqual(lead.fields.website, {
    value: "https://cafenorte.example",
    verified: true,
    source: "google_places",
  });
  assert.deepEqual(lead.fields.domain, {
    value: "cafenorte.example",
    verified: true,
    source: "derived",
  });
  // Places no devuelve contacto: se declara ausente, no se inventa.
  assert.deepEqual(lead.fields.contactName, { value: null, verified: false, source: null });
  assert.deepEqual(lead.fields.contactEmail, { value: null, verified: false, source: null });
  assert.ok(lead.missing.includes("contacto"));
  assert.match(lead.nextStep, /contacto/i);
  assert.ok(!JSON.stringify(lead.fields.contactEmail).includes("@"));
  assert.deepEqual(output.missingContact, [ref]);

  assert.equal(done.artifactIds.length, 1);
  const artifact = await db.get<AgentArtifact>(
    `${TENANT}:${OWNER}`,
    "agent-artifacts",
    done.artifactIds[0],
  );
  assert.ok(artifact, "la ficha revisable se guarda como artefacto");
  assert.equal(artifact.taskId, `task:${created.id}`, "el artefacto correlaciona con la tarea");
  assert.equal(artifact.data.requestedBy, OWNER);
  assert.equal(artifact.data.agent, AGENT);
  assert.equal(done.evidence.length, 1);
  assert.equal(done.evidence[0].kind, "web");
  assert.equal(done.evidence[0].url, "https://cafenorte.example");
});

test("sin fichas aceptadas el trabajo espera y no inventa una ficha", async (t) => {
  const { db, server } = await harness(t);
  await seedRole(server, marcos(true));

  const created = await delegate(server, { criteria: { sector: "cafeterias" } });
  await server.agent.worker.tick();

  const done = await db.get<AgentTask>(`${TENANT}:${OWNER}`, "tasks", created.id);
  assert.ok(done);
  assert.equal(done.status, "waiting_input");
  assert.match(done.question ?? "", /Acepta una ficha/);
  assert.equal(done.state.workOutput, undefined);
  assert.deepEqual(done.artifactIds, []);
  assert.deepEqual(await db.list(`${TENANT}:${OWNER}`, "agent-artifacts"), []);
});
