// C05_SHARED_ACTIONS_V1 — campaña C05 (PS14), subgate local.
//
// Cierra otro hallazgo de RUN-2026-11-17-10/12: la propuesta de acción vivía
// solo en la zona del actor que la preparaba, así que un `admin` con
// `actions.approve` no podía aprobar lo que había preparado un `member` de su
// propia empresa. Aquí se prueba por HTTP:
//   - el admin ve la propuesta del member en `/api/actions/pending` (listado
//     mínimo, sin payload) y puede aprobarla; el despacho usa la revisión y la
//     conexión del autor, no una copia del aprobador;
//   - el member ve la propuesta del admin pero sigue sin poder aprobarla;
//   - la empresa B no ve ni aprueba la propuesta de A (404, sin efecto);
//   - denegar una propuesta ajena no está permitido: sigue siendo del autor.
//
// No cubre: IdP externo, proveedor real, doble firma por actores distintos,
// revocación del rol en caliente dentro de un tenant `session` (el fallback
// legacy sigue vigente, ver límites en BITACORA) ni delegación por agente.

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
  tenantRole: TenantRole;
  email: string;
  password: string;
}

const PEOPLE: Person[] = [
  {
    key: "a-owner",
    tenantId: "share-a",
    tenantRole: "owner",
    email: "owner@share-a.local",
    password: "contrasena-owner-share-a",
  },
  {
    key: "a-admin",
    tenantId: "share-a",
    tenantRole: "admin",
    email: "ops@share-a.local",
    password: "contrasena-admin-share-a",
  },
  {
    key: "a-member",
    tenantId: "share-a",
    tenantRole: "member",
    email: "comercial@share-a.local",
    password: "contrasena-member-share-a",
  },
  {
    key: "b-admin",
    tenantId: "share-b",
    tenantRole: "admin",
    email: "ops@share-b.local",
    password: "contrasena-admin-share-b",
  },
];

interface SharedReview {
  id: string;
  title: string;
  hash: string;
  status: string;
  requestedBy: string;
  expiresAt: string;
}

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
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

async function pending(key: string, tenantId: string): Promise<SharedReview[]> {
  const response = await server.app.request("/api/actions/pending", {
    method: "GET",
    headers: { Authorization: `Bearer ${tokens.get(key)!}`, "x-tenant-id": tenantId },
  });
  const text = await response.text();
  assert.equal(response.status, 200, text);
  return JSON.parse(text) as SharedReview[];
}

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-shared-actions-"));
  db = await createStore({ dataDir: join(directory, "db") });
  server = await createApp(db, testConfig({ dataDir: directory }));
  const tenants = new TenantService(db, server.agent.config as never);
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
    await tenants.addMembership(user.id, person.tenantId, person.tenantRole);
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

test("el admin de la empresa ve y aprueba la propuesta preparada por el member", async () => {
  const memberId = userIds.get("a-member")!;
  const adminId = userIds.get("a-admin")!;
  const proposal = await propose("a-member", "share-a", "Propuesta del comercial");

  // Visibilidad: la empresa ve la revisión pendiente sin el payload.
  const shared = await pending("a-admin", "share-a");
  const item = shared.find((entry) => entry.id === proposal.id);
  assert.ok(item, "la propuesta del member aparece en la bandeja del admin");
  assert.equal(item!.hash, proposal.hash);
  assert.equal(item!.status, "awaiting_review");
  assert.equal(item!.requestedBy, memberId);
  assert.equal((item as unknown as { data?: unknown }).data, undefined);

  // Aprobación cross-actor: despacha la revisión del autor.
  const approved = await decide("a-admin", "share-a", proposal, "approve");
  const text = await approved.text();
  assert.equal(approved.status, 200, text);
  assert.equal((JSON.parse(text) as ActionProposal).status, "succeeded", text);

  // El registro sigue viviendo bajo el owner del autor, con el aprobador real.
  const stored = await server.actions.getApproval(memberId, proposal.id);
  assert.equal((stored as { status?: string } | null)?.status, "succeeded");
  assert.equal((stored as { approvedBy?: string } | null)?.approvedBy, adminId);

  const afterApproval = await pending("a-admin", "share-a");
  assert.equal(
    afterApproval.some((entry) => entry.id === proposal.id),
    false,
    "una propuesta despachada sale de la bandeja",
  );
});

test("el member ve la propuesta del admin pero no puede aprobarla", async () => {
  const proposal = await propose("a-admin", "share-a", "Propuesta de operaciones");
  const visible = await pending("a-member", "share-a");
  assert.ok(
    visible.some((entry) => entry.id === proposal.id),
    "el member tiene records.read: ve la revisión, no la despacha",
  );

  const denied = await decide("a-member", "share-a", proposal, "approve");
  const text = await denied.text();
  assert.equal(denied.status, 403, text);
  assert.equal((JSON.parse(text) as { fields?: Record<string, string> }).fields?.code, "PERMISSION_DENIED");

  const stored = await server.actions.getApproval(userIds.get("a-admin")!, proposal.id);
  assert.equal((stored as { status?: string } | null)?.status, "awaiting_review");
});

test("la empresa B no ve ni aprueba la propuesta de A", async () => {
  const proposal = await propose("a-member", "share-a", "Solo para la empresa A");

  const bPending = await pending("b-admin", "share-b");
  assert.equal(
    bPending.some((entry) => entry.id === proposal.id),
    false,
    "el listado no cruza el tenant de la peticion",
  );

  const crossed = await decide("b-admin", "share-b", proposal, "approve");
  const text = await crossed.text();
  assert.equal(crossed.status, 404, text);

  const stored = await server.actions.getApproval(userIds.get("a-member")!, proposal.id);
  assert.equal((stored as { status?: string } | null)?.status, "awaiting_review");
});

test("denegar una propuesta ajena sigue sin efecto", async () => {
  const proposal = await propose("a-member", "share-a", "Retiro reservado al autor");
  const denied = await decide("a-admin", "share-a", proposal, "deny");
  assert.equal(denied.status, 404, await denied.text());

  const stored = await server.actions.getApproval(userIds.get("a-member")!, proposal.id);
  assert.equal((stored as { status?: string } | null)?.status, "awaiting_review");
});
