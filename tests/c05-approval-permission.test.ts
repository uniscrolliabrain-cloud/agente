// C05_APPROVAL_PERMISSION_V1 — campaña C05 (PS14), subgate local.
//
// Cierra el hallazgo de RUN-2026-11-17-10: `/api/actions/:id/decide` aprobaba
// solo por owner y la matriz de empresa (`tenantAccess`) no se consultaba en la
// ruta real. Aquí se prueba por HTTP:
//   - `member` prepara su propuesta pero recibe 403 PERMISSION_DENIED al
//     aprobarla, y la propuesta sigue `awaiting_review` (sin efecto);
//   - el mismo `member` sí puede denegarla: retirar no despacha nada;
//   - `admin` y `owner` aprueban su propia propuesta;
//   - la matriz se aplica por empresa (el member de B tampoco aprueba en B) y
//     la propuesta de A no es visible para B (404, sigue owner-scoped);
//   - una cuenta legacy con membership única pero sin alta de rol conserva el
//     comportamiento anterior (compatibilidad single-tenant).
//
// No cubre: IdP externo, aprobación cross-actor (la propuesta sigue siendo del
// owner que la creó), doble firma, ni revocación en caliente del rol dentro del
// mismo tenant (ver límites en BITACORA).

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { UserService } from "../apps/server/src/users.ts";
import type { ActionProposal } from "../packages/domain/src/index.ts";
import { testConfig } from "./helpers/config.ts";

type TenantRole = "owner" | "admin" | "member";

interface Person {
  key: string;
  tenantId: string;
  tenantRole: TenantRole | null;
  email: string;
  password: string;
}

const PEOPLE: Person[] = [
  {
    key: "a-owner",
    tenantId: "appr-a",
    tenantRole: "owner",
    email: "owner@appr-a.local",
    password: "contrasena-owner-a-larga",
  },
  {
    key: "a-admin",
    tenantId: "appr-a",
    tenantRole: "admin",
    email: "ops@appr-a.local",
    password: "contrasena-admin-a-larga",
  },
  {
    key: "a-member",
    tenantId: "appr-a",
    tenantRole: "member",
    email: "comercial@appr-a.local",
    password: "contrasena-member-a-larga",
  },
  {
    key: "b-member",
    tenantId: "appr-b",
    tenantRole: "member",
    email: "comercial@appr-b.local",
    password: "contrasena-member-b-larga",
  },
  // Sin fila en `user-tenants`: cuenta del modo single-tenant (solo membership
  // única). Es el caso que la ruta debe seguir aceptando.
  {
    key: "legacy",
    tenantId: "appr-legacy",
    tenantRole: null,
    email: "owner@appr-legacy.local",
    password: "contrasena-legacy-larga",
  },
];

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let tenants: TenantService;
let directory: string;
const tokens = new Map<string, string>();
const userIds = new Map<string, string>();

const bearer = (key: string) => ({ Authorization: `Bearer ${tokens.get(key)!}` });
const jsonHeaders = (key: string) => ({ ...bearer(key), "Content-Type": "application/json" });

async function propose(key: string, tenantId: string, subject: string): Promise<ActionProposal> {
  const response = await server.app.request("/api/actions", {
    method: "POST",
    headers: { ...jsonHeaders(key), "x-tenant-id": tenantId },
    body: JSON.stringify({
      kind: "email.send",
      data: { to: ["sample@example.com"], subject, body: "fixture local sin proveedor" },
    }),
  });
  const text = await response.text();
  assert.equal(response.status, 201, text);
  return JSON.parse(text) as ActionProposal;
}

function decide(key: string, tenantId: string, proposal: ActionProposal, decision: "approve" | "deny") {
  return server.app.request(`/api/actions/${proposal.id}/decide`, {
    method: "POST",
    headers: { ...jsonHeaders(key), "x-tenant-id": tenantId },
    body: JSON.stringify({ hash: proposal.hash, decision }),
  });
}

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-appr-"));
  db = await createStore({ dataDir: join(directory, "db") });
  server = await createApp(db, testConfig({ dataDir: directory }));
  tenants = new TenantService(db, server.agent.config as never);
  const users = new UserService(db);
  for (const person of PEOPLE) {
    const user = await users.create({
      email: person.email,
      password: person.password,
      name: person.email,
      role: "user",
    });
    userIds.set(person.key, user.id);
    await tenants.setMembership(user.id, person.tenantId);
    if (person.tenantRole) {
      await tenants.addMembership(user.id, person.tenantId, person.tenantRole);
    }
    const login = await server.app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: person.email, password: person.password }),
    });
    assert.equal(login.status, 200);
    tokens.set(person.key, ((await login.json()) as { token: string }).token);
  }
});

after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("member prepara su propuesta pero no puede aprobarla; la propuesta no se despacha", async () => {
  const proposal = await propose("a-member", "appr-a", "Seguimiento comercial");
  assert.equal(proposal.status, "awaiting_review");

  const denied = await decide("a-member", "appr-a", proposal, "approve");
  const text = await denied.text();
  assert.equal(denied.status, 403, text);
  const body = JSON.parse(text) as { fields?: Record<string, string> };
  assert.equal(body.fields?.code, "PERMISSION_DENIED");
  assert.equal(body.fields?.permission, "actions.approve");
  assert.equal(body.fields?.role, "member");

  // Sin efecto: el estado durable no avanzo a executing/succeeded.
  const stored = await server.actions.getApproval(userIds.get("a-member")!, proposal.id);
  assert.equal(stored?.status, "awaiting_review");
});

test("el mismo member si puede denegar su propuesta", async () => {
  const proposal = await propose("a-member", "appr-a", "Borrador retirado");
  const denied = await decide("a-member", "appr-a", proposal, "deny");
  const text = await denied.text();
  assert.equal(denied.status, 200, text);
  assert.equal((JSON.parse(text) as ActionProposal).status, "denied");
});

test("admin y owner aprueban su propia propuesta", async () => {
  for (const key of ["a-admin", "a-owner"]) {
    const proposal = await propose(key, "appr-a", `Aprobacion de ${key}`);
    const approved = await decide(key, "appr-a", proposal, "approve");
    const text = await approved.text();
    assert.equal(approved.status, 200, text);
    const saved = JSON.parse(text) as ActionProposal;
    assert.equal(saved.status, "succeeded", text);
  }
});

test("la matriz se aplica por empresa y la propuesta ajena sigue invisible", async () => {
  // En B el member tampoco aprueba: no es un permiso global de la plataforma.
  const proposalB = await propose("b-member", "appr-b", "Seguimiento B");
  const deniedB = await decide("b-member", "appr-b", proposalB, "approve");
  assert.equal(deniedB.status, 403);

  // Contra otra empresa: aprobar se corta antes por la matriz (403) y denegar,
  // que no exige permiso, no encuentra la propuesta (404): sigue owner-scoped.
  const proposalA = await propose("a-member", "appr-a", "Propuesta de A");
  const crossedApprove = await server.app.request(`/api/actions/${proposalA.id}/decide`, {
    method: "POST",
    headers: jsonHeaders("b-member"),
    body: JSON.stringify({ hash: proposalA.hash, decision: "approve" }),
  });
  assert.equal(crossedApprove.status, 403);
  const crossedDeny = await decide("b-member", "appr-b", proposalA, "deny");
  assert.equal(crossedDeny.status, 404);
});

test("la cuenta legacy sin alta de rol conserva la aprobacion single-tenant", async () => {
  const proposal = await propose("legacy", "appr-legacy", "Cuenta legacy");
  const approved = await decide("legacy", "appr-legacy", proposal, "approve");
  const text = await approved.text();
  assert.equal(approved.status, 200, text);
  assert.equal((JSON.parse(text) as ActionProposal).status, "succeeded");
});
