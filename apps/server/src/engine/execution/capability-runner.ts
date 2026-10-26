// CAPABILITY_RUNNER_V2 - ejecuta capabilities por id.

import type { ExecutionContext, PlanStep } from "../../../../../packages/domain/src/index.ts";
import type { CapabilityRegistry } from "../capabilities/registry.ts";
import type { StepRunner } from "./executor.ts";
import type { ToolExecutor } from "./tool-executors.ts";
import { agentActor } from "../../../../../packages/domain/src/actor.ts";

export class CapabilityRunner implements StepRunner {
  constructor(
    private readonly registry: CapabilityRegistry,
    private readonly executors: Map<string, ToolExecutor>,
    // CAPABILITY_RUNNER_GOVERNANCE_V1 - authz en el limite del efecto.
    private readonly governance?: { canExecuteTool: (actor: import("../../../../../packages/domain/src/actor.ts").Actor, owner: string, role: import("../../../../../packages/domain/src/agent.ts").AgentRole, tool: string) => Promise<{ allowed: boolean; reason?: string }>; canExecuteAction: (actor: import("../../../../../packages/domain/src/actor.ts").Actor, owner: string, role: import("../../../../../packages/domain/src/agent.ts").AgentRole, action: string, policyAction: import("../policy/engine.ts").PolicyAction) => Promise<{ allowed: boolean; reason?: string }> },
    private readonly getAgentRole?: (tenantId: string, roleId: string) => Promise<import("../../../../../packages/domain/src/agent.ts").AgentRole | null>,
    // CAPABILITY_RUNNER_DB_V1 - db para idempotency claims.
    private readonly db?: { insertIfAbsent: (tenantId: string, kind: string, value: { id: string } & Record<string, unknown>) => Promise<unknown>; put: (tenantId: string, kind: string, value: { id: string } & Record<string, unknown>) => Promise<unknown>; get: (tenantId: string, kind: string, id: string) => Promise<unknown> },
  ) {}

  async run(ctx: ExecutionContext, step: PlanStep): Promise<void> {
    if (!step.capabilityId) throw new Error(`Step ${step.id} has no capabilityId`);
    const capability = await this.registry.get(step.capabilityId);
    if (!capability) throw new Error(`Capability ${step.capabilityId} not found`);
    // CAPABILITY_RUNNER_GOVERNANCE_V1 - authz antes de exec.run.
    if (this.governance && this.getAgentRole && ctx.roleId && ctx.actorId) {
      const role = await this.getAgentRole(ctx.tenantId, ctx.roleId);
      if (!role) throw new Error(`AgentRole ${ctx.roleId} not found for authz`);
      // ACTOR_AGENT_FACTORY_V1 - usa el constructor unico del dominio.
      const actor = agentActor({
        tenantId: ctx.tenantId,
        actorId: ctx.actorId,
        roleId: ctx.roleId,
        ...(role.name ? { name: role.name } : {}),
        ...(ctx.runtimeId ? { runtimeId: ctx.runtimeId } : {}),
      });
      const decision = capability.actionType
        ? await this.governance.canExecuteAction(actor, ctx.owner, role, capability.id, "execute")
        : await this.governance.canExecuteTool(actor, ctx.owner, role, capability.id);
      if (!decision.allowed) throw new Error(`authz denied: ${decision.reason ?? capability.id}`);
    }
    // CAPABILITY_RUNNER_APPROVAL_REAL_V1 - valida approvalId contra tenant + accion.
    // CAPABILITY_RUNNER_B10_V1 - solo executing/succeeded autorizan. awaiting_review NO autoriza.
    if (capability.requiresApproval) {
      const approvalId = ctx.sessionId;
      if (!approvalId) throw new Error(`requires approval: ${capability.id}`);
      if (this.db) {
        const approval = await this.db.get(ctx.tenantId, "actions", approvalId);
        if (!approval) throw new Error(`approval not found: ${approvalId}`);
        const a = approval as { status?: string; kind?: string; taskId?: string };
        const validStatuses = ["executing", "succeeded"];
        if (!a.status || !validStatuses.includes(a.status)) {
          throw new Error(`approval not valid: ${approvalId} status=${a.status ?? "unknown"}`);
        }
        if (a.kind && capability.actionType && a.kind !== capability.actionType) {
          throw new Error(`approval kind mismatch: ${a.kind} != ${capability.actionType}`);
        }
      }
    }
    const exec = this.executors.get(capability.id);
    if (!exec) throw new Error(`No executor for capability ${capability.id}`);
    // CAPABILITY_RUNNER_IDEMPOTENCY_V1 - si el contrato no es idempotente, generar key y pasarla.
    let idempotencyKey: import("../idempotency.ts").IdempotencyKey | undefined;
    if (capability.idempotency !== "idempotent") {
      const scope: import("../idempotency.ts").IdempotencyScope = capability.sideEffects[0]?.kind === "external_write" ? "computer" : "computer";
      idempotencyKey = (await import("../idempotency.ts")).makeIdempotencyKey(scope, {
        tenantId: ctx.tenantId,
        stepId: step.id,
        capabilityId: capability.id,
        inputs: step.inputs,
      });
    }
    // CAPABILITY_RUNNER_B10_V1 - claim con status + recuperacion de resultado.
    const isExternalWrite = capability.sideEffects.some((s) => s.kind === "external_write");
    if (idempotencyKey && isExternalWrite && this.db) {
      const claimId = idempotencyKey.key;
      // B10.2 - si ya existe claim, decidir segun su estado.
      const existing = await this.db.get(ctx.tenantId, "idempotency-claims", claimId) as { status?: string; result?: unknown; claimedAt?: string; failedAt?: string; doneAt?: string } | null;
      if (existing) {
        if (existing.status === "done") {
          // B10.2 - devuelve el resultado cacheado, no re-ejecuta.
          return;
        }
        if (existing.status === "failed") {
          // B10.2 - permite reintento: actualiza a claimed y ejecuta.
          await this.db.put(ctx.tenantId, "idempotency-claims", {
            id: claimId, tenantId: ctx.tenantId, stepId: step.id, capabilityId: capability.id,
            status: "claimed", claimedAt: new Date().toISOString(),
          });
        } else if (existing.status === "outcome_unknown") {
          throw new Error(`idempotent: outcome_unknown, reconcile first ${claimId}`);
        } else if (existing.status === "claimed") {
          // B10.2 - si es reciente, in progress; si es viejo, marcar outcome_unknown.
          const ageMs = Date.now() - Date.parse(existing.claimedAt ?? "1970-01-01");
          if (ageMs < 5 * 60 * 1000) {
            throw new Error(`idempotent: in progress ${claimId}`);
          }
          await this.db.put(ctx.tenantId, "idempotency-claims", {
            id: claimId, tenantId: ctx.tenantId, stepId: step.id, capabilityId: capability.id,
            status: "outcome_unknown", error: "stale claim", claimedAt: existing.claimedAt,
          });
          throw new Error(`idempotent: stale claim, reconcile first ${claimId}`);
        } else {
          throw new Error(`idempotent: unknown status ${existing.status} for ${claimId}`);
        }
      } else {
        const claimed = await this.db.insertIfAbsent(ctx.tenantId, "idempotency-claims", {
          id: claimId,
          tenantId: ctx.tenantId,
          stepId: step.id,
          capabilityId: capability.id,
          status: "claimed",
          claimedAt: new Date().toISOString(),
        });
        if (!claimed) throw new Error(`idempotent: raced claim ${claimId}`);
      }
      try {
        const result = await exec.run(ctx, capability.id, step.inputs, idempotencyKey);
        await this.db.put(ctx.tenantId, "idempotency-claims", {
          id: claimId,
          tenantId: ctx.tenantId,
          stepId: step.id,
          capabilityId: capability.id,
          status: "done",
          result: typeof result === "string" ? result.slice(0, 2000) : JSON.stringify(result ?? null).slice(0, 2000),
          doneAt: new Date().toISOString(),
        });
      } catch (error) {
        await this.db.put(ctx.tenantId, "idempotency-claims", {
          id: claimId,
          tenantId: ctx.tenantId,
          stepId: step.id,
          capabilityId: capability.id,
          status: "failed",
          error: error instanceof Error ? error.message.slice(0, 2000) : "unknown",
          failedAt: new Date().toISOString(),
        }).catch(() => {});
        throw error;
      }
      return;
    }
    await exec.run(ctx, capability.id, step.inputs, idempotencyKey);
  }
}