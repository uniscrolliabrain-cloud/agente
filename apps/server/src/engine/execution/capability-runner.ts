// CAPABILITY_RUNNER_V2 - ejecuta capabilities por id.

import { randomUUID } from "node:crypto";
import type { ExecutionContext, PlanStep } from "../../../../../packages/domain/src/index.ts";
import type { CapabilityRegistry } from "../capabilities/registry.ts";
import type { StepRunner } from "./executor.ts";
import type { ToolExecutor } from "./tool-executors.ts";
import { agentActor } from "../../../../../packages/domain/src/actor.ts";

/**
 * CAPABILITY_RUNNER_GOVERNED_PROFILE_V1 - perfil explicito de montaje.
 * `legacy_v1` conserva el comportamiento historico (V1) hasta inventariar
 * callers; `governed_v2` exige principal resuelto, PDP y store de claims.
 * El perfil NO se deduce de la presencia de dependencias: un montaje
 * incompleto no puede degradarse en silencio a la ruta sin autorizacion.
 */
export type CapabilityRunnerProfile = "legacy_v1" | "governed_v2";

// CAPABILITY_RUNNER_CLAIM_FIELDS_V1 - campos aditivos del claim durable.
// `fence` monotono y `attemptId` identifican el intento que posee el claim.
interface ClaimRecord {
  id: string;
  tenantId: string;
  stepId: string;
  capabilityId: string;
  status?: string;
  claimedAt?: string;
  failedAt?: string;
  doneAt?: string;
  result?: unknown;
  error?: string | null;
  fence?: number;
  attemptId?: string;
  retrySafe?: boolean;
}

export class CapabilityRunner implements StepRunner {
  constructor(
    private readonly registry: CapabilityRegistry,
    private readonly executors: Map<string, ToolExecutor>,
    // CAPABILITY_RUNNER_GOVERNANCE_V1 - authz en el limite del efecto.
    private readonly governance?: { canExecuteTool: (actor: import("../../../../../packages/domain/src/actor.ts").Actor, owner: string, role: import("../../../../../packages/domain/src/agent.ts").AgentRole, tool: string) => Promise<{ allowed: boolean; reason?: string }>; canExecuteAction: (actor: import("../../../../../packages/domain/src/actor.ts").Actor, owner: string, role: import("../../../../../packages/domain/src/agent.ts").AgentRole, action: string, policyAction: import("../policy/engine.ts").PolicyAction) => Promise<{ allowed: boolean; reason?: string }> },
    private readonly getAgentRole?: (tenantId: string, roleId: string) => Promise<import("../../../../../packages/domain/src/agent.ts").AgentRole | null>,
    // CAPABILITY_RUNNER_DB_V1 - db para idempotency claims.
    // CAPABILITY_RUNNER_CLAIM_CAS_V1 - compareAndSwap opcional: si el store lo
    // expone, las transiciones del claim son CAS y nunca pisan otro intento.
    private readonly db?: { insertIfAbsent: (tenantId: string, kind: string, value: { id: string } & Record<string, unknown>) => Promise<unknown>; put: (tenantId: string, kind: string, value: { id: string } & Record<string, unknown>) => Promise<unknown>; get: (tenantId: string, kind: string, id: string) => Promise<unknown>; compareAndSwap?: (tenantId: string, kind: string, id: string, expected: Record<string, unknown>, patch: Record<string, unknown>) => Promise<unknown> },
    private readonly profile: CapabilityRunnerProfile = "legacy_v1",
  ) {}

  async run(ctx: ExecutionContext, step: PlanStep): Promise<void> {
    if (!step.capabilityId) throw new Error(`Step ${step.id} has no capabilityId`);
    const capability = await this.registry.get(step.capabilityId);
    if (!capability) throw new Error(`Capability ${step.capabilityId} not found`);
    const isExternalWrite = capability.sideEffects.some((s) => s.kind === "external_write");
    // CAPABILITY_RUNNER_GOVERNED_PROFILE_V1 - fail-closed antes de cualquier
    // lectura de rol o de proveedor. El perfil legacy no cambia.
    if (this.profile === "governed_v2") {
      if (!this.governance || !this.getAgentRole || !ctx.actorId || !ctx.roleId)
        throw new Error("GOVERNED_PRINCIPAL_REQUIRED");
      if ((capability.requiresApproval || isExternalWrite) && !this.db)
        throw new Error("GOVERNED_CLAIM_STORE_REQUIRED");
    }
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
        // CAPABILITY_RUNNER_APPROVAL_OWNER_V1 - el store compone la clave como
        // `${tenant}:${owner}`; aqui se pasaba ctx.tenantId como owner, asi que
        // se buscaba `${tenant}:${tenant}` y NINGUNA aprobacion se encontraba.
        // La accion se guarda con el owner real (ActionService.propose(owner)).
        const approval = await this.db.get(ctx.owner, "actions", approvalId);
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
    if (idempotencyKey && isExternalWrite && this.db) {
      const claimId = idempotencyKey.key;
      const claimedAt = new Date().toISOString();
      const attemptId = randomUUID();
      // B10.2 - si ya existe claim, decidir segun su estado.
      const existing = (await this.db.get(ctx.tenantId, "idempotency-claims", claimId)) as ClaimRecord | null;
      let activeFence = 1;
      if (existing) {
        const previousFence = typeof existing.fence === "number" ? existing.fence : 0;
        if (existing.status === "done") {
          // B10.2 - devuelve el resultado cacheado, no re-ejecuta.
          return;
        }
        if (existing.status === "outcome_unknown") {
          throw new Error(`idempotent: outcome_unknown, reconcile first ${claimId}`);
        }
        if (existing.status === "failed") {
          // CAPABILITY_RUNNER_RETRY_EVIDENCE_V1 - reintentar un fallo solo con
          // evidencia declarada de que no hubo efecto (`retrySafe`) y fencing
          // presente. Claims antiguos sin fence quedan para conciliacion.
          if (existing.retrySafe !== true || typeof existing.fence !== "number")
            throw new Error(`idempotent: failed claim requires reconciliation ${claimId}`);
          const resumed = await this.transition(
            ctx.tenantId,
            claimId,
            { status: "failed", fence: previousFence, retrySafe: true, attemptId: existing.attemptId },
            {
              status: "claimed",
              fence: previousFence + 1,
              attemptId,
              claimedAt,
              retrySafe: false,
              error: null,
            },
          );
          if (!resumed) throw new Error(`idempotent: claim changed before retry ${claimId}`);
          activeFence = previousFence + 1;
        } else if (existing.status === "claimed") {
          // B10.2 - si es reciente, in progress; si es viejo, marcar outcome_unknown.
          const ageMs = Date.now() - Date.parse(existing.claimedAt ?? "1970-01-01");
          if (ageMs < 5 * 60 * 1000) {
            throw new Error(`idempotent: in progress ${claimId}`);
          }
          // CAPABILITY_RUNNER_STALE_CAS_V1 - solo el intento que posee el claim
          // puede declararlo ambiguo; nunca se pisa un done concurrente.
          const moved = await this.transition(
            ctx.tenantId,
            claimId,
            { status: "claimed", fence: previousFence, attemptId: existing.attemptId },
            {
              status: "outcome_unknown",
              fence: previousFence,
              attemptId: existing.attemptId,
              error: "stale claim",
              claimedAt: existing.claimedAt,
            },
          );
          if (!moved) throw new Error(`idempotent: claim changed during stale reconciliation ${claimId}`);
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
          fence: 1,
          attemptId,
          claimedAt,
        });
        if (!claimed) throw new Error(`idempotent: raced claim ${claimId}`);
      }
      let result: unknown;
      try {
        result = await exec.run(ctx, capability.id, step.inputs, idempotencyKey);
      } catch (error) {
        // CAPABILITY_RUNNER_ERROR_KIND_V1 - `outcome_unknown` declarado por el
        // adaptador conserva la ambiguedad; el resto se registra como fallo
        // reintentable. La clasificacion fina de proveedores es de Trans03:
        // hasta entonces, un error sin discriminante NO prueba ausencia de
        // efecto y se documenta como riesgo residual, no como exito.
        const unknown = isUnknownOutcome(error);
        const message = error instanceof Error ? error.message.slice(0, 2000) : "unknown";
        try {
          await this.transition(
            ctx.tenantId,
            claimId,
            { status: "claimed", fence: activeFence, attemptId },
            unknown
              ? {
                  status: "outcome_unknown",
                  fence: activeFence,
                  attemptId,
                  error: message,
                  claimedAt,
                }
              : {
                  status: "failed",
                  fence: activeFence,
                  attemptId,
                  retrySafe: true,
                  error: message,
                  failedAt: new Date().toISOString(),
                },
          );
        } catch (persistenceError) {
          // CAPABILITY_RUNNER_PERSISTENCE_V1 - un fallo al persistir el estado
          // no se confunde con un fallo del adaptador: el claim queda como
          // estaba (claimed) y envejece hacia conciliacion.
          throw new Error(
            `claim persistence failed after adapter error ${claimId}: ${
              persistenceError instanceof Error ? persistenceError.message : "unknown"
            }`,
          );
        }
        throw error;
      }
      // CAPABILITY_RUNNER_CLAIM_FENCE_V1 - la finalizacion solo la escribe el
      // intento que sigue poseyendo el claim; un worker tardio no pisa `done`.
      const settled = await this.transition(
        ctx.tenantId,
        claimId,
        { status: "claimed", fence: activeFence, attemptId },
        {
          status: "done",
          fence: activeFence,
          attemptId,
          result: typeof result === "string" ? result.slice(0, 2000) : JSON.stringify(result ?? null).slice(0, 2000),
          doneAt: new Date().toISOString(),
        },
      );
      if (!settled) throw new Error(`CLAIM_FENCE_LOST ${claimId}`);
      return;
    }
    await exec.run(ctx, capability.id, step.inputs, idempotencyKey);
  }

  /**
   * CAPABILITY_RUNNER_CLAIM_CAS_V1 - transicion con expectativa. Con CAS real
   * (Store.compareAndSwap) la escritura es atomica; sin CAS se conserva el
   * `put` historico para stores de test, sin prometer fencing.
   */
  private async transition(
    tenantId: string,
    claimId: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<boolean> {
    if (!this.db) return false;
    if (typeof this.db.compareAndSwap === "function") {
      // Un campo `undefined` no debe relajar la expectativa del CAS: el store
      // compara con `@>` y JSON descarta esas claves.
      const expectation = Object.fromEntries(
        Object.entries(expected).filter(([, value]) => value !== undefined),
      );
      const updated = await this.db.compareAndSwap(
        tenantId,
        "idempotency-claims",
        claimId,
        expectation,
        patch,
      );
      return Boolean(updated);
    }
    await this.db.put(tenantId, "idempotency-claims", { id: claimId, tenantId, ...patch });
    return true;
  }
}

// CAPABILITY_RUNNER_ERROR_KIND_V1 - unico discriminante acordado hoy con los
// ejecutores: el error declara explicitamente que el resultado es incierto.
function isUnknownOutcome(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if ("outcomeUnknown" in error && (error as { outcomeUnknown?: unknown }).outcomeUnknown === true) return true;
  return "code" in error && (error as { code?: unknown }).code === "outcome_unknown";
}
