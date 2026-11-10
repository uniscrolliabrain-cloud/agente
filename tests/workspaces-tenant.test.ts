// E17 - las rutas de workspace ya no caen al owner como tenant (H11).
//
// El middleware de app.ts deja `ctx.tenantId` resuelto para toda /api/*; aquí
// se monta el mismo contrato. Sin tenant resuelto la ruta responde 403
// TENANT_REQUIRED en vez de fabricar un envelope con el uuid del usuario.
import assert from "node:assert/strict";
import { test } from "node:test";
import { Hono } from "hono";
import { ALL_WORKSPACES } from "../packages/workspaces/src/index.ts";
import { WorkspaceModuleRegistry } from "../apps/server/src/engine/workspaces/registry.ts";
import { WorkspaceDispatcher } from "../apps/server/src/engine/workspaces/dispatcher.ts";
import { workspacesRoutes } from "../apps/server/src/routes/workspaces.ts";

type Variables = { owner: string; tenantId?: string; ctx?: { tenantId?: string } };

const store = {
  get: async () => null,
  put: async <T extends { id: string }>(_owner: string, _kind: string, value: T) => value,
  list: async () => [],
  insertIfAbsent: async () => null,
  remove: async () => {},
};

function montar(setup: (c: { set: (key: keyof Variables, value: unknown) => void }) => void) {
  const registry = new WorkspaceModuleRegistry();
  registry.registerAll(ALL_WORKSPACES);
  const dispatcher = new WorkspaceDispatcher({ db: store as never });
  const app = new Hono<{ Variables: Variables }>();
  app.use("*", async (c, next) => {
    c.set("owner", "acme-carlos");
    setup(c as unknown as { set: (key: keyof Variables, value: unknown) => void });
    await next();
  });
  app.route("/api/workspaces", workspacesRoutes(registry, dispatcher));
  return app;
}

const view = (app: Hono<{ Variables: Variables }>, body: unknown) =>
  app.request("/api/workspaces/acme-obras/view", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

test("la vista usa el tenant del contexto, no el owner", async () => {
  const response = await view(montar((c) => c.set("ctx", { tenantId: "acme" })), { viewId: "tablero" });
  assert.equal(response.status, 200);
  const { view: envelope } = (await response.json()) as {
    view: {
      tenantId: string;
      id: string;
      freshness: { generatedAt: string };
      provenance: Array<{ source: string; ref: string }>;
      spec: { kind: string };
    };
  };
  assert.equal(envelope.tenantId, "acme");
  assert.notEqual(envelope.tenantId, "acme-carlos");
  assert.equal(envelope.id, "acme-obras:tablero");
  assert.equal(envelope.spec.kind, "board");
  assert.match(envelope.freshness.generatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/);
  assert.equal(envelope.provenance[0]?.source, "workspace");
  assert.equal(envelope.provenance[0]?.ref, "acme-obras/obras.tablero");
});

test("sin tenant resuelto responde 403 TENANT_REQUIRED y no un envelope con el owner", async () => {
  const response = await view(montar(() => {}), { viewId: "tablero" });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    error: "Sesion sin empresa resuelta",
    code: "TENANT_REQUIRED",
  });
});

test("si la ruta resolvio su propio tenantId (leads, voz) ese manda", async () => {
  const response = await view(
    montar((c) => {
      c.set("tenantId", "acme");
      c.set("ctx", { tenantId: "otra-empresa" });
    }),
    { viewId: "resumen" },
  );
  assert.equal(response.status, 200);
  const { view: envelope } = (await response.json()) as { view: { tenantId: string } };
  assert.equal(envelope.tenantId, "acme");
});

test("las rutas de query y command tambien exigen tenant", async () => {
  const app = montar(() => {});
  const query = await app.request("/api/workspaces/acme-obras/query", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: "q1", query: "obras.tablero" }),
  });
  assert.equal(query.status, 403);
  const command = await app.request("/api/workspaces/acme-obras/command", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: "c1", command: "obras.crear" }),
  });
  assert.equal(command.status, 403);
});

test("una vista inexistente sigue siendo 404 con tenant resuelto", async () => {
  const response = await view(montar((c) => c.set("ctx", { tenantId: "acme" })), { viewId: "no-existe" });
  assert.equal(response.status, 404);
});
