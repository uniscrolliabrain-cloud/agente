// ASSIGNMENT_ROUTES_V1 - 8 handlers. Cada uno carga, verifica tenant, autoriza, escribe.
import { Hono } from "hono";
import { AppError } from "../../errors.ts";
import type { AssignmentService } from "./service.ts";
import type { AssignmentKind } from "../../../../../../packages/domain/src/assignment.ts";

export interface AssignmentRoutesDeps {
  service: AssignmentService;
}

const KINDS: AssignmentKind[] = ["task", "goal", "monitor", "approval", "sop"];

function parseKind(raw: string): AssignmentKind {
  if (!KINDS.includes(raw as AssignmentKind)) throw new AppError("Invalid kind: " + raw, 422);
  return raw as AssignmentKind;
}

export function assignmentsRoutes(deps: AssignmentRoutesDeps) {
  const app = new Hono();
  app.post("/:kind/:id/accept", async (c) => {
    const kind = parseKind(c.req.param("kind"));
    const ctx = c.get("ctx");
    return c.json(await deps.service.accept(ctx, kind, c.req.param("id")));
  });
  app.post("/:kind/:id/reject", async (c) => {
    const kind = parseKind(c.req.param("kind"));
    const ctx = c.get("ctx");
    return c.json(await deps.service.reject(ctx, kind, c.req.param("id")));
  });
  app.post("/:kind/:id/approve", async (c) => {
    const kind = parseKind(c.req.param("kind"));
    const ctx = c.get("ctx");
    return c.json(await deps.service.approve(ctx, kind, c.req.param("id")));
  });
  app.post("/:kind/:id/complete", async (c) => {
    const kind = parseKind(c.req.param("kind"));
    const ctx = c.get("ctx");
    return c.json(await deps.service.complete(ctx, kind, c.req.param("id")));
  });
  app.post("/:kind/:id/escalate", async (c) => {
    const kind = parseKind(c.req.param("kind"));
    const ctx = c.get("ctx");
    const body = await c.req.json();
    const toActorId = String(body.toActorId ?? "");
    const reason = String(body.reason ?? "");
    return c.json(await deps.service.escalate(ctx, kind, c.req.param("id"), toActorId, reason));
  });
  app.post("/:kind/:id/reassign", async (c) => {
    const kind = parseKind(c.req.param("kind"));
    const ctx = c.get("ctx");
    const body = await c.req.json();
    const assignedTo = body.assignedTo === null ? null : String(body.assignedTo ?? "");
    return c.json(await deps.service.reassign(ctx, kind, c.req.param("id"), assignedTo));
  });
  app.post("/:kind/:id/assign", async (c) => {
    const kind = parseKind(c.req.param("kind"));
    const ctx = c.get("ctx");
    const body = await c.req.json();
    const assignedTo = body.assignedTo === null ? null : String(body.assignedTo ?? "");
    return c.json(await deps.service.assign(ctx, kind, c.req.param("id"), assignedTo, ctx.actor.id));
  });
  return app;
}
