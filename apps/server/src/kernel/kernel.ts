// KERNEL_V2 — orquestador del grafo cognitivo, adaptado a TurnStore V2.
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

export interface KernelDeps {
  store: TurnStore;
  tenants: TenantResolver;
  audit: AuditStore;
  config: TenantConfigResolver;
}

export class Kernel {
  constructor(private readonly deps: KernelDeps) {}

  async openTurn(ctx: KernelContext, trigger: string): Promise<Turn> {
    const tenantId = await this.deps.tenants.resolve(ctx.owner);
    const turn = await this.deps.store.openTurn(tenantId, ctx.owner, trigger);
    await this.deps.audit.append({
      tenantId,
      owner: ctx.owner,
      action: "turn.opened",
      actor: { kind: ctx.role, id: ctx.owner },
      payload: { turnId: turn.id, trigger, requestId: ctx.requestId },
    });
    return turn;
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
    const tenantId = await this.deps.tenants.resolve(ctx.owner);
    const thought = thoughtSchema.parse({
      ...input,
      id: randomUUID(),
      tenantId,
      turnId: input.turnId,
      owner: ctx.owner,
      provenance: {
        source: input.provenance?.source ?? ctx.role,
        timestamp: input.provenance?.timestamp ?? new Date().toISOString(),
        ...(input.provenance?.parentId !== undefined
          ? { parentId: input.provenance.parentId }
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
}