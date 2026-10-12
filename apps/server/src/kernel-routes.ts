// KERNEL_ROUTES_V3 - rutas HTTP de debug del kernel.
//
// V3 respecto a V2:
//   - GET /api/kernel/turns                 -> lista turnos del owner
//   - GET /api/kernel/turns/:turnId         -> thoughts del turno
//   - GET /api/kernel/turns/:turnId/present -> presentacion actual
//   - GET /api/kernel/audit                 -> audit trail (limit)
//   - GET /api/kernel/audit/verify          -> verifica hash chain
//
// Todas leen del kernel. Ninguna escribe. El owner viene del middleware
// de auth de app.ts (c.set("owner", ...)).

import { Hono } from "hono";
import { z } from "zod";
import type { Kernel } from "./kernel/index.ts";
import { kernelContextSchema } from "./kernel/index.ts";
import { AppError } from "./errors.ts";
import { UserService } from "./users.ts";

const limitSchema = z.coerce.number().int().min(1).max(200).optional();

export function kernelRoutes(kernel: Kernel, userService?: UserService) {
  const app = new Hono<{ Variables: { owner: string } }>();
  // KERNEL_ROUTES_ADMIN_V1 — valida admin antes de exponer el kernel.
  // Ver: docs/audits/09-kernel-cognitivo/miniaudit.md.
  const requireAdmin = async (owner: string) => {
    if (!userService) return; // Retrocompatible si no se inyecta.
    const user = await userService.getById(owner);
    if (!user || user.role !== "admin") {
      throw new AppError("Solo admin puede consultar el kernel", 403);
    }
  };

  /** Helper: construye el KernelContext del owner autenticado. */
  const ctxFor = (owner: string, requestId: string) =>
    kernelContextSchema.parse({
      tenantId: "default",
      owner,
      role: "admin",
      requestId,
    });

  // GET /api/kernel/turns?limit=50
  app.get("/turns", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const limit = limitSchema.parse(c.req.query("limit")) ?? 50;
    const ctx = ctxFor(owner, `kernel-routes:turns:${Date.now()}`);
    try {
      const turns = await kernel.listTurns(ctx, limit);
      return c.json({
        turns: turns.map((turn) => ({
          id: turn.id,
          status: turn.status,
          startedAt: turn.startedAt,
          closedAt: turn.closedAt,
          closeReason: turn.closeReason,
          closedBy: turn.closedBy,
          parentTurnId: turn.parentTurnId,
          childTurnIds: turn.childTurnIds,
          thoughtCount: turn.thoughtIds.length,
          triggers: turn.triggers,
        })),
      });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : "Kernel listTurns failed",
        500,
      );
    }
  });

  // GET /api/kernel/turns/:turnId
  app.get("/turns/:turnId", async (c) => {
    const owner = c.get("owner");
    const turnId = c.req.param("turnId");
    const ctx = ctxFor(owner, `kernel-routes:turn:${turnId}`);
    try {
      const thoughts = await kernel.thoughtsOf(ctx, turnId);
      return c.json({
        turnId,
        total: thoughts.length,
        thoughts: thoughts.map((t) => ({
          id: t.id,
          role: t.role,
          actor: t.actor,
          contentPreview:
            typeof t.content === "string"
              ? t.content.slice(0, 500)
              : JSON.stringify(t.content).slice(0, 500),
          provenance: t.provenance,
          edgesCount: t.edges.length,
        })),
      });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : "Kernel thoughtsOf failed",
        500,
      );
    }
  });

  // GET /api/kernel/turns/:turnId/present
  app.get("/turns/:turnId/present", async (c) => {
    const owner = c.get("owner");
    const turnId = c.req.param("turnId");
    const ctx = ctxFor(owner, `kernel-routes:present:${turnId}`);
    try {
      const { Presenter } = await import("./kernel/index.ts");
      const presenter = new Presenter({ kernel });
      const result = await presenter.presentTurn(ctx, turnId);
      if (!result) return c.json({ turnId, present: null });
      return c.json({
        turnId,
        totalThoughts: result.totalThoughts,
        turnClosedAt: result.turnClosedAt ?? null,
        closeReason: result.closeReason ?? null,
        presentation: {
          thoughtId: result.presentation.thoughtId,
          role: result.presentation.role,
          reason: result.presentation.reason,
          content: result.presentation.content,
          actor: result.presentation.actor,
        },
      });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : "Kernel present failed",
        500,
      );
    }
  });

  // KERNEL_ROUTES_TURN_INDEX_V1
  app.get("/turns-index/recent", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const limit = limitSchema.parse(c.req.query("limit")) ?? 50;
    const { KernelTurnIndex } = await import("./kernel/subscribers/turn-index-query.ts");
    const deps = (kernel as unknown as { deps: { store: unknown; tenants: { resolve: (o: string) => Promise<string> } } }).deps;
    const db = deps.store as unknown as import("./db.ts").Store;
    const tenantId = await deps.tenants.resolve(owner);
    const index = new KernelTurnIndex(db);
    return c.json({ turns: await index.recent(tenantId, limit) });
  });

  // KERNEL_ROUTES_METRICS_V1
  app.get("/metrics-summary", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const { globalMetrics } = await import("./metrics/registry.ts");
    const p99 = globalMetrics.quantile("openmuse_http_request_duration_ms", 0.99) ?? 0;
    return c.json({ httpLatencyP99Ms: p99, generatedAt: new Date().toISOString() });
  });

  // KERNEL_ROUTES_SUBSCRIBER_STATUS_V1
  app.get("/subscribers/status", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const { kernelSubscriberStatus } = await import("./kernel/subscribers/status.ts");
    return c.json(await kernelSubscriberStatus(kernel.deps.store as unknown as import("./db.ts").Store));
  });

  // KERNEL_ROUTES_META_HINTS_V1
  app.get("/meta-hints/pending", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const { MetaHintsStore } = await import("./engine/feedback/meta-hints-store.ts");
    const db = (kernel as unknown as { deps: { store: import("./db.ts").Store } }).deps.store;
    const tenantId = await (kernel as unknown as { deps: { tenants: { resolve: (o: string) => Promise<string> } } }).deps.tenants.resolve(owner);
    const store = new MetaHintsStore(db);
    return c.json({ hints: await store.pendingForOwner(tenantId, owner) });
  });

  // KERNEL_ENGINE_GETSTORE_USED_V1
  // KERNEL_ROUTES_META_HINTS_BY_TURN_V1
  app.get("/meta-hints/by-turn/:turnId", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const turnId = c.req.param("turnId");
    const { MetaHintsStore } = await import("./engine/feedback/meta-hints-store.ts");
    const db = (kernel as unknown as { deps: { store: import("./db.ts").Store } }).deps.store;
    const tenantId = await (kernel as unknown as { deps: { tenants: { resolve: (o: string) => Promise<string> } } }).deps.tenants.resolve(owner);
    const store = new MetaHintsStore(db);
    return c.json({ turnId, hints: await store.byTurn(tenantId, turnId) });
  });

  // KERNEL_META_HINTS_CONSUME_API_V1
  app.post("/meta-hints/:id/consume", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const id = c.req.param("id");
    const { MetaHintsStore } = await import("./engine/feedback/meta-hints-store.ts");
    const db = (kernel as unknown as { deps: { store: import("./db.ts").Store } }).deps.store;
    const tenantId = await (kernel as unknown as { deps: { tenants: { resolve: (o: string) => Promise<string> } } }).deps.tenants.resolve(owner);
    const store = new MetaHintsStore(db);
    await store.consume(tenantId, id);
    return c.json({ ok: true, id });
  });

  // KERNEL_ROUTES_PURGE_V1
  app.post("/indexes/purge", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const { purgeKernelRetention } = await import("./engine/events/retention-purge.ts");
    const db = (kernel as unknown as { deps: { store: import("./db.ts").Store } }).deps.store;
    const report = await purgeKernelRetention(db, {
      "kernel-thought-index": 180,
      "kernel-turn-index": 180,
      "kernel-audit-index": 365,
      "meta-hints": 30,
    });
    return c.json(report);
  });

  // KERNEL_ROUTES_STATE_LOG_V1
  app.get("/state-transitions/recent", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const limit = limitSchema.parse(c.req.query("limit")) ?? 50;
    const db = (kernel as unknown as { deps: { store: import("./db.ts").Store } }).deps.store;
    const all = await db.list<Record<string, unknown>>("system", "state-transition-log", { limit: limit * 4 }).catch(() => []);
    return c.json({ transitions: all.slice(0, limit) });
  });

  // KERNEL_ROUTES_SNAPSHOT_TENANT_V1
  app.get("/snapshot-by-tenant/:tenantId", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const { exportKernelSnapshot } = await import("./kernel/snapshot.ts");
    const snap = await exportKernelSnapshot(kernel, tenantId);
    return c.json(snap);
  });

  // KERNEL_ROUTES_AUDIT_BY_ACTION_V1
  app.get("/audit/by-action/:action", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const action = c.req.param("action");
    const limit = limitSchema.parse(c.req.query("limit")) ?? 100;
    const deps = (kernel as unknown as {
      deps: {
        audit: { listByAction?: (tenantId: string, action: string, limit: number) => Promise<unknown[]>; list: (tenantId: string, limit: number) => Promise<unknown[]> };
        tenants: { resolve: (o: string) => Promise<string> };
      };
    }).deps;
    const tenantId = await deps.tenants.resolve(owner);
    const entries = deps.audit.listByAction
      ? await deps.audit.listByAction(tenantId, action, limit)
      : (await deps.audit.list(tenantId, limit * 10)).filter((e) => (e as { action?: string }).action === action).slice(-limit);
    return c.json({ tenantId, action, entries });
  });

  // KERNEL_ROUTES_INDEXES_LIST_V1
  app.get("/indexes/summary", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const db = (kernel as unknown as { deps: { store: import("./db.ts").Store } }).deps.store;
    const [thoughts, turns, audits, transitions, metaHints] = await Promise.all([
      db.list("system", "kernel-thought-index", { limit: 1 }).catch(() => []),
      db.list("system", "kernel-turn-index", { limit: 1 }).catch(() => []),
      db.list("system", "kernel-audit-index", { limit: 1 }).catch(() => []),
      db.list("system", "state-transition-log", { limit: 1 }).catch(() => []),
      db.list("system", "meta-hints", { limit: 1 }).catch(() => []),
    ]);
    return c.json({
      indexes: {
        thoughts: thoughts.length,
        turns: turns.length,
        audits: audits.length,
        transitions: transitions.length,
        metaHints: metaHints.length,
      },
      generatedAt: new Date().toISOString(),
    });
  });

  // KERNEL_ROUTES_META_HINTS_LIST_V1
  app.get("/meta-hints", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const limit = limitSchema.parse(c.req.query("limit")) ?? 50;
    const { MetaHintsStore } = await import("./engine/feedback/meta-hints-store.ts");
    const db = (kernel as unknown as { deps: { store: import("./db.ts").Store } }).deps.store;
    const tenantId = await (kernel as unknown as { deps: { tenants: { resolve: (o: string) => Promise<string> } } }).deps.tenants.resolve(owner);
    const store = new MetaHintsStore(db);
    return c.json({ hints: await store.pendingForOwner(tenantId, owner, limit) });
  });

  // KERNEL_ROUTES_PERSONAS_COUNT_V1
  app.get("/personas/count", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const { UserService } = await import("./users.ts");
    void UserService;
    const db = (kernel as unknown as { deps: { store: import("./db.ts").Store } }).deps.store;
    const [roles, memories, tasks] = await Promise.all([
      db.list("system", "agent-roles", { limit: 200 }).catch(() => []),
      db.list("system", "memories", { limit: 200 }).catch(() => []),
      db.list("system", "tasks", { limit: 200 }).catch(() => []),
    ]);
    return c.json({
      agentRoles: roles.length,
      memories: memories.length,
      tasks: tasks.length,
      generatedAt: new Date().toISOString(),
    });
  });

  // KERNEL_ROUTES_PERSONAS_LIST_V1
  app.get("/personas", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const limit = limitSchema.parse(c.req.query("limit")) ?? 50;
    const db = (kernel as unknown as { deps: { store: import("./db.ts").Store } }).deps.store;
    const tenantId = await (kernel as unknown as { deps: { tenants: { resolve: (o: string) => Promise<string> } } }).deps.tenants.resolve(owner);
    const thoughts = await db.list<{ role?: string; owner?: string }>("system", "kernel-thought-index", { limit }).catch(() => []);
    const turns = await db.list<{ owner?: string }>("system", "kernel-turn-index", { limit }).catch(() => []);
    return c.json({
      tenantId,
      thoughtsIndexed: thoughts.length,
      turnsIndexed: turns.length,
      sampleRoles: Array.from(new Set(thoughts.map((t) => t.role ?? "").filter(Boolean))).slice(0, 10),
    });
  });

  // KERNEL_ROUTES_TURNS_PERSONA_FILTER_V1
  app.get("/turns/by-persona/:personaId", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const personaId = c.req.param("personaId");
    const limit = limitSchema.parse(c.req.query("limit")) ?? 50;
    const ctx = ctxFor(owner, `kernel-routes:by-persona:${personaId}:${Date.now()}`);
    const all = await kernel.listTurns(ctx, limit * 4).catch(() => []);
    const filtered = all.filter((t) => t.personaId === personaId).slice(0, limit);
    return c.json({ personaId, total: filtered.length, turns: filtered });
  });

  // GET /api/kernel/audit?limit=100
  app.get("/audit", async (c) => {
    const owner = c.get("owner");
    const limit = limitSchema.parse(c.req.query("limit")) ?? 100;
    const ctx = ctxFor(owner, `kernel-routes:audit:${Date.now()}`);
    try {
      const deps = (kernel as unknown as {
        deps: {
          audit: { list: (tenantId: string, limit: number) => Promise<unknown[]> };
          tenants: { resolve: (owner: string) => Promise<string> };
        };
      }).deps;
      const tenantId = await deps.tenants.resolve(owner);
      const entries = await deps.audit.list(tenantId, limit);
      return c.json({ tenantId, entries });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : "Kernel audit list failed",
        500,
      );
    }
  });

  // KERNEL_SNAPSHOT_ROUTES_V1 - export e import de snapshots (admin).
  // GET /api/kernel/snapshot/export
  app.get("/snapshot/export", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const ctx = ctxFor(owner, `kernel-routes:snapshot-export:${Date.now()}`);
    try {
      const { exportKernelSnapshot } = await import("./kernel/snapshot.ts");
      const tenantId = await (kernel as unknown as { deps: { tenants: { resolve: (o: string) => Promise<string> } } }).deps.tenants.resolve(owner);
      const snap = await exportKernelSnapshot(kernel, tenantId);
      return c.json(snap);
    } catch (error) {
      throw new AppError(error instanceof Error ? error.message : "snapshot export failed", 500);
    }
  });
  // POST /api/kernel/snapshot/import
  app.post("/snapshot/import", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    try {
      const body = await c.req.json();
      const { importKernelSnapshot } = await import("./kernel/snapshot.ts");
      const result = await importKernelSnapshot(kernel, body);
      return c.json(result);
    } catch (error) {
      throw new AppError(error instanceof Error ? error.message : "snapshot import failed", 500);
    }
  });
  // GET /api/kernel/audit/verify
  app.get("/audit/verify", async (c) => {
    const owner = c.get("owner");
    const ctx = ctxFor(owner, `kernel-routes:verify:${Date.now()}`);
    try {
      const deps = (kernel as unknown as {
        deps: {
          audit: { verify: (tenantId: string) => Promise<boolean> };
          tenants: { resolve: (owner: string) => Promise<string> };
        };
      }).deps;
      const tenantId = await deps.tenants.resolve(owner);
      const valid = await deps.audit.verify(tenantId);
      return c.json({ tenantId, valid });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : "Kernel audit verify failed",
        500,
      );
    }
  });

  return app;
}
