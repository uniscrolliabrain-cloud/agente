// VIEWS_ROUTE_V2 - un unico endpoint devuelve ViewEnvelope.
// - con workspaceId: ejecuta la query real del modulo y adapta el resultado.
// - sin workspaceId: mantiene el resolver legacy como fallback explicito.
// No hay builders por defecto: un intent sin vista devuelve null y el
// frontend conserva la vista actual en vez de borrarla.
import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type {
  WorkspaceContext,
  WorkspaceQueryEnvelope,
  WorkspaceViewDeclaration,
} from "@agente/workspaces";
import type { RuntimeViewSpec } from "../../../../packages/domain/src/views.ts";
import type { ViewEnvelope } from "../../../../packages/domain/src/view-envelope.ts";
import { adaptWorkspaceView } from "../engine/views/workspace-adapter.ts";
import { resolveView } from "../engine/views/resolver.ts";
import type { WorkspaceModuleRegistry } from "../engine/workspaces/registry.ts";
import type { WorkspaceDispatcher } from "../engine/workspaces/dispatcher.ts";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findDeclaration(
  views: readonly WorkspaceViewDeclaration[],
  intent: string | undefined,
): WorkspaceViewDeclaration | undefined {
  if (!intent) return views[0];
  const needle = normalize(intent);
  return (
    views.find((view) => {
      const haystack = normalize(`${view.id} ${view.title} ${view.intent}`);
      return haystack.includes(needle) || needle.includes(normalize(view.title));
    }) ?? views[0]
  );
}

function legacyView(tenantId: string, spec: RuntimeViewSpec): ViewEnvelope {
  const generatedAt = new Date().toISOString();
  return {
    id: `legacy:${randomUUID()}`,
    tenantId,
    spec,
    provenance: [{ source: "legacy-resolver", label: spec.title, asOf: generatedAt }],
    freshness: { generatedAt, stale: true },
    permissions: { canView: true, canAct: [] },
    source: { provider: "legacy" },
    generatedAt,
  };
}

export function viewsRoutes(registry: WorkspaceModuleRegistry, dispatcher: WorkspaceDispatcher) {
  const app = new Hono<{
    Variables: { owner: string; ctx: { tenantId: string } };
  }>();

  app.post("/resolve", async (c) => {
    const body = z
      .object({
        intent: z.string().max(1000).optional(),
        workspaceId: z.string().min(1).max(100).optional(),
        viewId: z.string().min(1).max(200).optional(),
        entityId: z.string().max(200).optional(),
        messageId: z.string().max(200).optional(),
        threadId: z.string().max(200).optional(),
      })
      .refine((value) => Boolean(value.intent || value.workspaceId), {
        message: "intent o workspaceId es obligatorio",
      })
      .parse(await c.req.json());

    if (body.viewId && !body.workspaceId) {
      return c.json({ error: "viewId requiere workspaceId" }, 422);
    }

    const owner = c.get("owner");
    const tenantId = c.get("ctx")?.tenantId ?? owner;

    if (body.workspaceId) {
      const module = registry.get(body.workspaceId);
      if (!module) return c.json({ error: "workspace not found" }, 404);
      const declaration = body.viewId
        ? module.views.find((view) => view.id === body.viewId)
        : findDeclaration(module.views, body.intent);
      if (!declaration) return c.json({ error: "view not found" }, 404);

      const context: WorkspaceContext = {
        workspaceId: module.manifest.id,
        tenantId,
        owner,
        actorId: owner,
        actorKind: "user",
        permissions: [],
        correlationId: body.messageId ?? randomUUID(),
      };
      const envelope: WorkspaceQueryEnvelope = {
        id: randomUUID(),
        workspaceId: module.manifest.id,
        query: declaration.query,
        version: 1,
        parameters: body.entityId ? { entityId: body.entityId } : {},
        limit: 50,
      };
      const result = await dispatcher.dispatchQuery(module, context, envelope);
      if (result.status === "forbidden") {
        return c.json({ error: "No tienes permiso para ver esta vista" }, 403);
      }
      const view = adaptWorkspaceView({
        tenantId,
        workspaceId: module.manifest.id,
        declaration,
        result,
        ...(body.entityId ? { entityId: body.entityId } : {}),
      });
      if (!view) return c.json({ error: "La vista no se pudo normalizar" }, 422);
      return c.json({ view });
    }

    const spec = body.intent ? await resolveView(owner, body.intent) : null;
    return c.json({ view: spec ? legacyView(tenantId, spec) : null });
  });

  return app;
}
