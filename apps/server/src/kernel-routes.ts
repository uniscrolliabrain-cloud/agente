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
