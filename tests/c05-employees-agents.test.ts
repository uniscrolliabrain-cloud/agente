// C05_EMPLOYEES_AGENTS_V1 — campaña C05 (PS14/PS15), subgate local.
//
// Cubre lo que el runtime permite hoy sin proveedores ni IdP externo:
//   - 3 empresas con owner + 2 empleados cada una, identidades y correos
//     distintos, membership de tenant con rol (owner/admin/member);
//   - cada identidad solo resuelve su propia empresa (x-tenant-id ajeno 403);
//   - matriz de permisos de empresa leída de la membership durable;
//   - memoria privada por actor (ni compañero ni otra empresa);
//   - 3 agentes por empresa con ids colisionados, agente deshabilitado y
//     agente sin el SOP denegados antes de encolar;
//   - provenance: assignedBy (caller) distinto de assignedTo (agente).
//
// No cubre: IdP externo, records compartidos por empresa (el BusinessGraph
// sigue scoped por owner), tool-calls reales de LLM ni worker multi-proceso.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import type { AgentRole } from "../packages/domain/src/agent.ts";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { AgentGovernance } from "../apps/server/src/engine/agents/governance.ts";
import { MemoryService } from "../apps/server/src/engine/memory.ts";
import { RagService } from "../apps/server/src/engine/rag.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { tenantAccess } from "../apps/server/src/engine/authz/tenant-permissions.ts";
import { syntheticHumanActor } from "../apps/server/src/tenant-principal.ts";
import { UserService } from "../apps/server/src/users.ts";
import { testConfig } from "./helpers/config.ts";

const TENANTS = ["c05-a", "c05-b", "c05-c"] as const;
type TenantId = (typeof TENANTS)[number];
type TenantRole = "owner" | "admin" | "member";

interface Person {
  email: string;
  password: string;
  name: string;
  tenantId: TenantId;
  tenantRole: TenantRole;
}

const PEOPLE: Person[] = TENANTS.flatMap((tenantId, tenantIndex) => [
  {
    email: `owner@${tenantId}.local`,
    password: `contrasena-owner-${tenantIndex}-larga`,
    name: `Owner ${tenantId}`,
    tenantId,
    tenantRole: "owner",
  },
  {
    email: `ops@${tenantId}.local`,
    password: `contrasena-admin-${tenantIndex}-larga`,
    name: `Ops ${tenantId}`,
    tenantId,
    tenantRole: "admin",
  },
  {
    email: `comercial@${tenantId}.local`,
    password: `contrasena-member-${tenantIndex}-larga`,
    name: `Comercial ${tenantId}`,
    tenantId,
    tenantRole: "member",
  },
]);

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let tenants: TenantService;
let directory: string;
const tokens = new Map<string, string>();
const userIds = new Map<string, string>();

const keyOf = (person: Person) => `${person.tenantId}:${person.tenantRole}`;
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

function agentRole(
  owner: string,
  id: string,
  sops: string[],
  active = true,
): AgentRole {
  return {
    id,
    name: `${id} ${owner}`,
    tone: "warm",
    avatar: "sky",
    objetivo: "fixture local",
    sops,
    active,
    memories: [],
  };
}

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-c05-"));
  db = await createStore({ dataDir: join(directory, "db") });
  server = await createApp(db, testConfig({ dataDir: directory }));
  tenants = new TenantService(db, server.agent.config as never);
  const users = new UserService(db);
  for (const person of PEOPLE) {
    const user = await users.create({
      email: person.email,
      password: person.password,
      name: person.name,
      role: "user",
    });
    userIds.set(keyOf(person), user.id);
    await tenants.setMembership(user.id, person.tenantId);
    await tenants.addMembership(user.id, person.tenantId, person.tenantRole);
    const login = await server.app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: person.email, password: person.password }),
    });
    assert.equal(login.status, 200);
    tokens.set(keyOf(person), ((await login.json()) as { token: string }).token);
  }

  // Tres agentes por empresa, mismos ids en las tres: el scope debe separarlos.
  // El engine escribe por TenantScopedStore (clave `tenant:owner`); sembrar con
  // el Store crudo dejaria los roles fuera de la zona que lee la ruta.
  const scoped = server.agent.db;
  for (const tenantId of TENANTS) {
    const owner = userIds.get(`${tenantId}:owner`)!;
    await scoped.put(owner, "agent-roles", agentRole(owner, "laia", ["resumen"]));
    await scoped.put(owner, "agent-roles", agentRole(owner, "comercial", ["seguimiento"]));
    const marcosSops = tenantId === "c05-b" ? ["seguimiento"] : ["investigar-leads"];
    await scoped.put(
      owner,
      "agent-roles",
      agentRole(owner, "marcos", marcosSops, tenantId !== "c05-c"),
    );
  }
});

after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("nueve identidades distintas: owner + dos empleados por empresa", async () => {
  const ids = new Set(userIds.values());
  const emails = new Set(PEOPLE.map((person) => person.email));
  assert.equal(PEOPLE.length, 9);
  assert.equal(ids.size, 9);
  assert.equal(emails.size, 9);
  for (const person of PEOPLE) {
    const userId = userIds.get(keyOf(person))!;
    const memberships = await tenants.membershipsFor(userId);
    assert.equal(memberships.length, 1);
    assert.equal(memberships[0].tenantId, person.tenantId);
    assert.equal(memberships[0].role, person.tenantRole);
  }
});

test("cada identidad solo opera en su empresa; x-tenant-id ajeno es 403", async () => {
  for (const person of PEOPLE) {
    const token = tokens.get(keyOf(person))!;
    const own = await server.app.request("/api/agent", {
      headers: { ...bearer(token), "x-tenant-id": person.tenantId },
    });
    assert.equal(own.status, 200, `${person.email} deberia entrar en ${person.tenantId}`);
    for (const foreign of TENANTS.filter((tenantId) => tenantId !== person.tenantId)) {
      const denied = await server.app.request("/api/agent", {
        headers: { ...bearer(token), "x-tenant-id": foreign },
      });
      assert.equal(denied.status, 403, `${person.email} no deberia entrar en ${foreign}`);
    }
  }
});

test("la matriz de permisos se lee de la membership durable", async () => {
  for (const tenantId of TENANTS) {
    const owner = userIds.get(`${tenantId}:owner`)!;
    const admin = userIds.get(`${tenantId}:admin`)!;
    const member = userIds.get(`${tenantId}:member`)!;
    const state = await tenants.tenantState(tenantId);

    const ownerAccess = tenantAccess({
      membership: await tenants.findMembership(owner, tenantId),
      state,
    });
    assert.equal(ownerAccess.ok, true);
    assert.equal(ownerAccess.ok && ownerAccess.role, "owner");

    const adminApprove = tenantAccess({
      membership: await tenants.findMembership(admin, tenantId),
      state,
      permission: "actions.approve",
    });
    assert.equal(adminApprove.ok, true);
    const adminTenantAdmin = tenantAccess({
      membership: await tenants.findMembership(admin, tenantId),
      state,
      permission: "tenant.admin",
    });
    assert.equal(adminTenantAdmin.ok, false);

    const memberApprove = tenantAccess({
      membership: await tenants.findMembership(member, tenantId),
      state,
      permission: "actions.approve",
    });
    assert.equal(memberApprove.ok, false);
    assert.equal(memberApprove.ok === false && memberApprove.error.status, 403);

    // Un empleado no puede aprobar/administrar otra empresa: no hay membership.
    const foreign = TENANTS.find((candidate) => candidate !== tenantId)!;
    const crossed = tenantAccess({
      membership: await tenants.findMembership(member, foreign),
      state,
    });
    assert.equal(crossed.ok, false);
    assert.equal(crossed.ok === false && crossed.error.fields?.code, "NO_MEMBERSHIP");
  }
});

test("la memoria privada no la ve el companero ni otra empresa", async () => {
  const memory = new MemoryService(db, new RagService(db));
  const adminA = userIds.get("c05-a:admin")!;
  const memberA = userIds.get("c05-a:member")!;
  const ownerB = userIds.get("c05-b:owner")!;
  await memory.rememberPrivate(adminA, "preferencia privada del admin de A");
  assert.equal((await memory.privateMemories(adminA)).length, 1);
  assert.equal((await memory.privateMemories(memberA)).length, 0);
  assert.equal((await memory.privateMemories(ownerB)).length, 0);
});

test("tres agentes por empresa con ids colisionados y listado scoped", async () => {
  for (const tenantId of TENANTS) {
    const owner = userIds.get(`${tenantId}:owner`)!;
    const token = tokens.get(`${tenantId}:owner`)!;
    const response = await server.app.request("/api/agent/roles", {
      headers: { ...bearer(token), "x-tenant-id": tenantId },
    });
    const text = await response.text();
    assert.equal(response.status, 200, text);
    const roles = JSON.parse(text) as AgentRole[];
    assert.deepEqual(roles.map((role) => role.id).sort(), ["comercial", "laia", "marcos"]);
    const marcos = roles.find((role) => role.id === "marcos");
    assert.ok(marcos);
    assert.equal(marcos.active, tenantId !== "c05-c");
    // El owner de otra empresa no comparte el rol aunque el id coincida.
    const other = TENANTS.find((candidate) => candidate !== tenantId)!;
    const otherOwner = userIds.get(`${other}:owner`)!;
    assert.notEqual(owner, otherOwner);
  }
});

test("agente deshabilitado o sin SOP no encola el trabajo; el habilitado si", async () => {
  const leadInput = {
    sopId: "investigar-leads",
    leadRefs: [],
    criteria: { sector: "clinicas", city: "Valencia", keywords: [], minRating: 4, minReviews: 10 },
  };
  const createLeadTask = (person: Person, roleId: string) =>
    server.app.request("/api/agent/tasks", {
      method: "POST",
      headers: {
        ...bearer(tokens.get(keyOf(person))!),
        "x-tenant-id": person.tenantId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: "sop",
        title: "investigar leads",
        prompt: "fixture local sin proveedor",
        roleId,
        input: leadInput,
      }),
    });

  const ownerA = PEOPLE.find((person) => person.tenantId === "c05-a" && person.tenantRole === "owner")!;
  const ownerB = PEOPLE.find((person) => person.tenantId === "c05-b" && person.tenantRole === "owner")!;
  const ownerC = PEOPLE.find((person) => person.tenantId === "c05-c" && person.tenantRole === "owner")!;

  const created = await createLeadTask(ownerA, "marcos");
  const createdText = await created.text();
  assert.equal(created.status, 201, createdText);
  const task = JSON.parse(createdText) as {
    id: string;
    assignedTo: string;
    assignedBy: string;
    tenantId: string;
  };
  assert.equal(task.assignedTo, "marcos");
  assert.equal(task.assignedBy, userIds.get("c05-a:owner"));
  assert.equal(task.tenantId, "c05-a");

  const withoutSop = await createLeadTask(ownerB, "marcos");
  assert.equal(withoutSop.status, 422);

  const disabled = await createLeadTask(ownerC, "marcos");
  assert.equal(disabled.status, 409);

  // Un id que no existe bajo este owner no se autoriza: el lookup es por
  // owner, no por un registro global de agentes.
  const crossTenantRole = await createLeadTask(ownerA, "marcos-b");
  assert.equal(crossTenantRole.status, 422);
});

test("encolar para un agente deshabilitado se rechaza en cualquier tipo de tarea", async () => {
  const create = (person: Person, roleId: string) =>
    server.app.request("/api/agent/tasks", {
      method: "POST",
      headers: {
        ...bearer(tokens.get(keyOf(person))!),
        "x-tenant-id": person.tenantId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: "agent",
        title: "revision de cartera",
        prompt: "fixture local sin proveedor",
        roleId,
      }),
    });
  const ownerA = PEOPLE.find((person) => person.tenantId === "c05-a" && person.tenantRole === "owner")!;
  const ownerC = PEOPLE.find((person) => person.tenantId === "c05-c" && person.tenantRole === "owner")!;

  // `marcos` esta deshabilitado en C: la tarea no se encola aunque no sea el
  // SOP tipado, para no dejar en cola trabajo que el worker va a retener.
  const disabled = await create(ownerC, "marcos");
  assert.equal(disabled.status, 409);
  const disabledBody = (await disabled.json()) as { error?: string };
  assert.match(disabledBody.error ?? "", /deshabilitado/);

  const allowed = await create(ownerA, "marcos");
  const allowedText = await allowed.text();
  assert.equal(allowed.status, 201, allowedText);
  assert.equal((JSON.parse(allowedText) as { status: string }).status, "queued");
});

test("governance deniega una tool fuera de allowedTools sin consultar policy", async () => {
  let consulted = 0;
  const governance = new AgentGovernance({
    can: async () => {
      consulted += 1;
      return { allowed: true };
    },
  } as never);
  const actor = syntheticHumanActor("c05-a:actor", "c05-a");
  const restricted = {
    ...agentRole("c05-a", "marcos", ["investigar-leads"]),
    allowedTools: ["crm.read"],
  };
  const denied = await governance.canExecuteTool(actor, "c05-a", restricted, "email.send");
  assert.equal(denied.allowed, false);
  assert.equal(consulted, 0);
  const allowed = await governance.canExecuteTool(actor, "c05-a", restricted, "crm.read");
  assert.equal(allowed.allowed, true);
  assert.equal(consulted, 1);
});

test("suspender una empresa corta su siguiente peticion y no toca a las otras", async () => {
  await db.put("system", "tenant-state", {
    id: "c05-c",
    suspended: true,
    suspendedReason: "fixture local",
  });
  try {
    const suspended = await server.app.request("/api/agent", {
      headers: {
        ...bearer(tokens.get("c05-c:owner")!),
        "x-tenant-id": "c05-c",
      },
    });
    assert.equal(suspended.status, 403);
    const body = (await suspended.json()) as { code?: string };
    assert.equal(body.code, "TENANT_SUSPENDED");
    for (const tenantId of ["c05-a", "c05-b"] as const) {
      const alive = await server.app.request("/api/agent", {
        headers: {
          ...bearer(tokens.get(`${tenantId}:owner`)!),
          "x-tenant-id": tenantId,
        },
      });
      assert.equal(alive.status, 200);
    }
  } finally {
    await db.put("system", "tenant-state", { id: "c05-c", suspended: false });
  }
});
