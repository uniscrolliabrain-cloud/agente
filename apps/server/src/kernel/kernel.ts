// KERNEL_CONSOLIDATE_ON_CLOSE_V1 - consolidate se ejecuta al cerrar turno.
// KERNEL_V2 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â orquestador del grafo cognitivo, adaptado a TurnStore V2.
//
// Cambios respecto a V1:
//   - openTurn ahora lee el tenant y lo pasa explicitamente al store.
//   - openChildTurn: si el slow sigue tras cerrar el padre, abre hijo.
//   - closeTurn recibe closedBy ademas de reason.
//   - thoughtsOf pasa tenantId.

import { randomUUID } from "node:crypto";
import type { AuditStore } from "./audit/store.ts";
import type { KernelContext } from "./context/kernel-context.ts";
import type { TenantConfigResolver } from "./config/tenant-config.ts";
import { thoughtSchema, type Thought } from "./graph/thought.ts";
import type { TurnStore } from "./graph/store.ts";
import type { Turn, TurnCloseReason, TurnClosedBy } from "./graph/turn.ts";
import type { TenantResolver } from "./tenancy/resolver.ts";
import { globalMetrics } from "../metrics/registry.ts";

export interface KernelDeps {
  store: TurnStore;
  tenants: TenantResolver;
  audit: AuditStore;
  config: TenantConfigResolver;
  // VIEWS_BUSINESS_GRAPH_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â businessGraph opcional para Views.
  // Ver: auditorÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a profunda 09 (computeView devuelve placeholder).
  businessGraph?: {
    entities?: (tenantId: string, params: Record<string, unknown>) => Promise<unknown>;
    neighborhood?: (tenantId: string, params: Record<string, unknown>) => Promise<unknown>;
    timeline?: (tenantId: string, params: Record<string, unknown>) => Promise<unknown>;
  };
}

// KERNEL_METRICS_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â contadores del kernel para /metrics.
// Ver: auditorÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a profunda 09.
globalMetrics.counter(
  "openmuse_kernel_turns_opened_total",
  "Turnos abiertos por el kernel",
);
globalMetrics.counter(
  "openmuse_kernel_turns_closed_total",
  "Turnos cerrados",
);
globalMetrics.counter(
  "openmuse_kernel_thoughts_appended_total",
  "Thoughts aÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±adidos al grafo",
);

export class Kernel {
  // KERNEL_DEPS_PUBLIC_V1 - deps publico para que kernel-routes, views y
  // debug endpoints puedan leer store, tenants y audit sin cast.
  constructor(readonly deps: KernelDeps) {}

  async openTurn(ctx: KernelContext, trigger: string): Promise<Turn> {
    // KERNEL_CTX_TENANT_V1 - si el ctx trae tenantId ya resuelto, se usa.
    const tenantId = ctx.tenantId ?? (await this.deps.tenants.resolve(ctx.owner));
    // KERNEL_OPEN_TURN_PERSONA_V1 - propaga el personaId del contexto al store.
    const turn = await this.deps.store.openTurn(tenantId, ctx.owner, trigger, ctx.personaId);
    globalMetrics.inc("openmuse_kernel_turns_opened_total", {});
    await this.deps.audit.append({
      tenantId,
      owner: ctx.owner,
      action: "turn.opened",
      actor: { kind: ctx.role, id: ctx.owner },
      payload: { turnId: turn.id, trigger, requestId: ctx.requestId },
    });
    return turn;
  }

  /**
   * KERNEL_OPEN_TURN_IDEMPOTENT_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â abre turno reusando el existente si
   * ya hay uno abierto con la misma correlationId o trigger.
   * Ver: auditorÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a profunda 09 (openTurn no deduplica en model.ts ni sop-executor.ts).
   */
  async openTurnIdempotent(ctx: KernelContext, trigger: string): Promise<Turn> {
    const tenantId = ctx.tenantId ?? (await this.deps.tenants.resolve(ctx.owner));
    const store = this.deps.store as TurnStore & {
      listOpenTurnsForThread?: (tenantId: string, owner: string) => Promise<Turn[]>;
    };
    if (typeof store.listOpenTurnsForThread === "function") {
      const open = await store.listOpenTurnsForThread(tenantId, ctx.owner);
      // KERNEL_OPEN_TURN_IDEMPOTENT_PERSONA_V1 - si el ctx trae personaId, filtra por el.
      const matching = open.find(
        (turn) =>
          turn.triggers.includes(trigger) &&
          (!ctx.personaId || turn.personaId === ctx.personaId),
      );
      if (matching) {
        await this.deps.audit.append({
          tenantId,
          owner: ctx.owner,
          action: "turn.opened",
          actor: { kind: ctx.role, id: ctx.owner },
          payload: {
            turnId: matching.id,
            trigger,
            requestId: ctx.requestId,
            reused: true,
          },
        });
        return matching;
      }
    }
    return this.openTurn(ctx, trigger);
  }

  async openChildTurn(ctx: KernelContext, parentTurnId: string, trigger: string): Promise<Turn> {
    const tenantId = await this.deps.tenants.resolve(ctx.owner);
    const turn = await this.deps.store.openChildTurn(tenantId, ctx.owner, parentTurnId, trigger);
    await this.deps.audit.append({
      tenantId,
      owner: ctx.owner,
      action: "turn.opened",
      actor: { kind: ctx.role, id: ctx.owner },
      payload: {
        turnId: turn.id,
        parentTurnId,
        trigger,
        requestId: ctx.requestId,
        child: true,
      },
    });
    return turn;
  }

  async appendThought(
    ctx: KernelContext,
    input: Omit<Thought, "id" | "tenantId" | "turnId" | "owner" | "provenance"> & {
      turnId: string;
      provenance?: Partial<Thought["provenance"]>;
    },
  ): Promise<Thought> {
    // KERNEL_CTX_TENANT_RESPECT_FIX_V1 - antes siempre resolviamos el tenant
    // desde ctx.owner, ignorando ctx.tenantId si venia. Si el resolver cambia
    // de tenant (por TTL de cache) entre openTurn y appendThought, el thought
    // apunta a otro tenant y el append falla con Tenant mismatch. Ahora
    // respetamos ctx.tenantId cuando viene.
    const tenantId = ctx.tenantId ?? (await this.deps.tenants.resolve(ctx.owner));
    // KERNEL_APPEND_THOUGHT_PERSONA_V1 - si el ctx trae personaId, se persiste en el actor.
    const baseActor = { ...(input as { actor?: Record<string, unknown> }).actor } as Record<string, unknown>;
    const enrichedActor = ctx.personaId
      ? { ...baseActor, personaId: ctx.personaId }
      : baseActor;
    const thought = thoughtSchema.parse({
      ...input,
      id: randomUUID(),
      tenantId,
      turnId: input.turnId,
      owner: ctx.owner,
      ...(ctx.personaId ? { actor: enrichedActor } : {}),
      provenance: {
        source: input.provenance?.source ?? ctx.role,
        timestamp: input.provenance?.timestamp ?? new Date().toISOString(),
        ...(input.provenance?.parentId !== undefined
          ? { parentId: input.provenance.parentId }
          : {}),
        // KERNEL_CORRELATION_PROPAGATE_V1 - correlationId del request al Thought.
        ...(input.provenance?.correlationId !== undefined
          ? { correlationId: input.provenance.correlationId }
          : ctx.correlationId !== undefined
            ? { correlationId: ctx.correlationId }
            : {}),
      },
    });
    const saved = await this.deps.store.append(thought);
    await this.deps.audit.append({
      tenantId,
      owner: ctx.owner,
      action: "thought.appended",
      actor: { kind: saved.actor.kind, id: saved.actor.id },
      payload: {
        thoughtId: saved.id,
        turnId: saved.turnId,
        role: saved.role,
        requestId: ctx.requestId,
      },
    });
    return saved;
  }

  async thoughtsOf(ctx: KernelContext, turnId: string): Promise<Thought[]> {
    const tenantId = await this.deps.tenants.resolve(ctx.owner);
    const turn = await this.deps.store.getTurn(tenantId, turnId);
    if (!turn) return [];
    return this.deps.store.thoughtsOf(tenantId, turnId);
  }

  async closeTurn(
    ctx: KernelContext,
    turnId: string,
    reason: TurnCloseReason,
    closedBy: TurnClosedBy,
  ): Promise<Turn> {
    const tenantId = await this.deps.tenants.resolve(ctx.owner);
    const turn = await this.deps.store.closeTurn(tenantId, turnId, reason, closedBy);
    // KERNEL_CLOSE_CHILDREN_V1 - si el store soporta cierre recursivo, lo usamos.
    // Cierra #198: los turnos hijos abiertos quedaban huerfanos.
    const store = this.deps.store as TurnStore & {
      closeTurnAndChildren?: (
        tenantId: string,
        turnId: string,
        reason: TurnCloseReason,
        closedBy: TurnClosedBy,
      ) => Promise<Turn[]>;
    };
    if (store.closeTurnAndChildren) {
      await store.closeTurnAndChildren(tenantId, turnId, reason, closedBy);
    }
    await this.deps.audit.append({
      tenantId,
      owner: ctx.owner,
      action: "turn.closed",
      actor: { kind: ctx.role, id: ctx.owner },
      payload: { turnId, reason, closedBy, requestId: ctx.requestId },
    });
    return turn;
  }

  async config(ctx: KernelContext) {
    const tenantId = await this.deps.tenants.resolve(ctx.owner);
    return this.deps.config.resolve(tenantId);
  }

  /**
   * KERNEL_LIST_TURNS_V1 - lista turnos del owner en su tenant.
   * Cierra #203: no habia forma de listar turnos para debug.
   */
  async listTurns(ctx: KernelContext, limit = 50): Promise<Turn[]> {
    const tenantId = await this.deps.tenants.resolve(ctx.owner);
    const store = this.deps.store as TurnStore & {
      listTurns?: (tenantId: string, limit: number) => Promise<Turn[]>;
    };
    if (!store.listTurns) return [];
    // KERNEL_LIST_TURNS_OWNER_FILTER_FIX_V1 - antes pediamos `limit` al store
    // (que no filtra por owner) y luego filtrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡bamos en memoria. Si el tenant
    // tenia 200 turnos de otros owners antes que los del nuestro, `limit=50`
    // devolvia 50 de otros y el filtro dejaba 0. Ahora pedimos un multiplo
    // (5x el limit, tope 200) y cortamos al limit real tras filtrar.
    const fetch = Math.min(limit * 5, 200);
    const all = await store.listTurns(tenantId, fetch);
    // KERNEL_LIST_TURNS_PERSONA_V1 - si el ctx trae personaId, filtra por el.
    return all
      .filter((turn) => turn.owner === ctx.owner)
      .filter((turn) => !ctx.personaId || turn.personaId === ctx.personaId)
      .slice(0, limit);
  }

  /**
   * KERNEL_FIND_OPEN_TURN_V1 - encuentra un turno abierto del thread actual.
   * Cierra #197: conversation.ts puede reusar el turno abierto en vez de crear
   * uno nuevo por cada mensaje del usuario.
   */
  async findOpenTurnForThread(ctx: KernelContext): Promise<Turn | undefined> {
    if (!ctx.threadId) return undefined;
    const tenantId = await this.deps.tenants.resolve(ctx.owner);
    const store = this.deps.store as TurnStore & {
      listOpenTurnsForThread?: (tenantId: string, owner: string) => Promise<Turn[]>;
    };
    if (!store.listOpenTurnsForThread) return undefined;
    const open = await store.listOpenTurnsForThread(tenantId, ctx.owner);
    // KERNEL_FIND_OPEN_TURN_PERSONA_V1 - si el ctx trae personaId, filtra por el.
    return open.find(
      (turn) =>
        turn.triggers.some((t) => t.includes(ctx.threadId as string)) &&
        (!ctx.personaId || turn.personaId === ctx.personaId),
    );
  }
}