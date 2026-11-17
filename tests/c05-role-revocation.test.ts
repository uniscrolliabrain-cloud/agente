// C05_REVOCATION_STRICT_V1 — campaña C05 (PS14), subgate local.
//
// Cierra el hueco anotado en RUN-2026-11-17-12: en una instalación `session`,
// revocar el rol de un actor lo devolvía al camino de compatibilidad
// single-tenant y seguía aprobando. Ahora el camino legacy solo vale en una
// empresa sin matriz de roles:
//   - un admin con rol durable aprueba su propuesta;
//   - al revocar su membership, la aprobación siguiente responde 403
//     NO_MEMBERSHIP y la propuesta no se despacha;
//   - su bandeja de la empresa también se cierra;
//   - un owner de la misma empresa sí puede aprobarla (cross-actor);
//   - una cuenta legacy en una empresa SIN memberships durables conserva el
//     comportamiento anterior.
//
// No cubre: IdP externo, proveedor real, doble firma por actores distintos,
// worker multi-proceso ni revocación con una tool ya en vuelo.

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
    key: "owner",
    tenantId: "rev-a",
    tenantRole: "owner",
    email: "owner@rev-a.local",
    password: "contrasena-owner-rev-a",
  },
  {
    key: "admin",
    tenantId: "rev-a",
    tenantRole: "admin",
    email: "ops@rev-a.local",
    password: "contrasena-admin-rev-a",
  },
  // Empresa sin ninguna membership durable: solo la membership única.
  {
    key: "legacy",
    tenantId: "rev-legacy",
    tenantRole: null,
    email: "owner@rev-legacy.local",
    password: "contrasena-legacy-rev",
  },
];

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let tenants: TenantService;
let directory: string;
const tokens = new Map<string, string>();
const userIds = new Map<string, string>();

const jsonHeaders = (key: string) => ({
  Authorization: `Bearer ${tokens.get(key)!}`,
  "Content-Type": "application/json",
});

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

const pending = (key: string, tenantId: string) =>
  server.app.request("/api/actions/pending", {
    method: "GET",
    headers: { Authorization: `Bearer ${tokens.get(key)!}`, "x-tenant-id": tenantId },
  });

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-revocation-"));
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

test("revocar el rol corta la aprobación y la bandeja de la empresa en la petición siguiente", async () => {
  const adminId = userIds.get("admin")!;
  const ownerId = userIds.get("owner")!;

  // Con rol: aprueba lo suyo.
  const before = await propose("admin", "rev-a", "Antes de la revocacion");
  const approvedBefore = await decide("admin", "rev-a", before, "approve");
  const beforeText = await approvedBefore.text();
  assert.equal(approvedBefore.status, 200, beforeText);
  assert.equal((JSON.parse(beforeText) as ActionProposal).status, "succeeded");

  // Propuesta pendiente del admin y revocación de su membership.
  const visible = await propose("admin", "rev-a", "Visible al revocar");
  assert.equal((await pending("admin", "rev-a")).status, 200);
  assert.equal(await tenants.removeMembership(adminId, "rev-a"), true);
  assert.equal(await tenants.findMembership(adminId, "rev-a"), null);

  // El camino de compatibilidad ya no aplica: la empresa tiene matriz de roles.
  const revoked = await decide("admin", "rev-a", visible, "approve");
  const revokedText = await revoked.text();
  assert.equal(revoked.status, 403, revokedText);
  assert.equal(
    (JSON.parse(revokedText) as { fields?: Record<string, string> }).fields?.code,
    "NO_MEMBERSHIP",
  );
  const stored = await server.actions.getApproval(adminId, visible.id);
  assert.equal((stored as { status?: string } | null)?.status, "awaiting_review");
  assert.equal((await pending("admin", "rev-a")).status, 403);

  // Otro actor con rol de la misma empresa sí puede aprobarla.
  const ownerApproval = await decide("owner", "rev-a", visible, "approve");
  const ownerText = await ownerApproval.text();
  assert.equal(ownerApproval.status, 200, ownerText);
  assert.equal((JSON.parse(ownerText) as ActionProposal).status, "succeeded");
  const settled = await server.actions.getApproval(adminId, visible.id);
  assert.equal((settled as { approvedBy?: string } | null)?.approvedBy, ownerId);
});

test("la cuenta legacy en una empresa sin roles conserva la aprobación single-tenant", async () => {
  const proposal = await propose("legacy", "rev-legacy", "Cuenta legacy");
  const approved = await decide("legacy", "rev-legacy", proposal, "approve");
  const text = await approved.text();
  assert.equal(approved.status, 200, text);
  assert.equal((JSON.parse(text) as ActionProposal).status, "succeeded");
});
