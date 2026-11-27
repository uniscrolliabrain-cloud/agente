// CAPABILITY_RUNNER_V2 - ejecuta capabilities por id.
//
// KERNEL_AUTHORITY_V1 - la autoridad no depende de la personalidad ni del
// perfil de montaje para las operaciones privilegiadas. Toda capability con
// efecto externo o que exige aprobacion necesita principal resuelto, rol
// vigente, PDP y store de claims, en cualquier perfil. `governed_v2` extiende
// esa exigencia a las capabilities de lectura; `legacy_v1` conserva la ruta
// historica solo para lo que no produce efecto ni requiere aprobacion.

import { randomUUID } from "node:crypto";
import type { ExecutionContext, PlanStep } from "../../../../../packages/domain/src/index.ts";
import type { CapabilityRegistry } from "../capabilities/registry.ts";
import type { StepRunner } from "./executor.ts";
import type { ToolExecutor } from "./tool-executors.ts";
import { agentActor } from "../../../../../packages/domain/src/actor.ts";
import { classifyAdapterFailure, classifyAdapterResult } from "./outcome.ts";
import { observeKernel } from "../observability/hooks.ts";

/**
 * CAPABILITY_RUNNER_GOVERNED_PROFILE_V1 - perfil explicito de montaje.
 * `legacy_v1` conserva el comportamiento historico (V1) para las capabilities
 * que no producen efecto; `governed_v2` exige principal resuelto, PDP y store
 * de claims tambien para lecturas. El perfil NO se deduce de la presencia de
 * dependencias: un montaje incompleto no puede degradarse en silencio.
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
  acceptedAt?: string;
  doneAt?: string;
  result?: unknown;
  error?: string | null;
  fence?: number;
  attemptId?: string;
  retrySafe?: boolean;
  outcome?: string;
  bindingDigest?: string;
  keyVersion?: number;
}

/**
 * APPROVAL_BINDING_FIELDS_V1 - vista minima del registro `actions` que el
 * kernel necesita para decidir si una aprobacion autoriza ESTE paso.
 */
interface ApprovalRecord {
  id: string;
  status?: string;
  kind?: string;
  taskId?: string;
  tenantId?: string;
  hash?: string;
  revision?: string;
  principal?: string;
  expiresAt?: string;
  data?: unknown;
  connectionId?: string;
  connectionGeneration?: string;
  capabilityId?: string;
  approvedBy?: string;
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
    // KERNEL_CONNECTION_VERIFIER_V1 - resuelve la generacion VIGENTE de la
    // conexion aprobada. Sin verificador, un efecto externo no se autoriza:
    // que la aprobacion nombre una generacion no prueba que siga siendo la
    // activa (la credencial pudo rotar entre la revision y el efecto).
    private readonly connections?: {
      generationFor: (
        ctx: ExecutionContext,
        approval: { id: string; connectionId: string },
      ) => Promise<string | null>;
    },
  ) {}

  async run(ctx: ExecutionContext, step: PlanStep): Promise<void> {
    ctx = { ...ctx };
    step = { ...step, inputs: structuredClone(step.inputs) };
    const startedAt = Date.now();
    if (!step.capabilityId) throw new Error(`Step ${step.id} has no capabilityId`);
    const capability = structuredClone(await this.registry.get(step.capabilityId));
    if (!capability) throw new Error(`Capability ${step.capabilityId} not found`);
    const isExternalWrite = capability.sideEffects.some((s) => s.kind === "external_write");
    // KERNEL_AUTHORITY_MATRIX_V1 - una operacion con efecto o con aprobacion
    // obligatoria siempre atraviesa la frontera de autoridad, sea cual sea el
    // perfil. La ausencia de rol, PDP o store no equivale a autorizacion.
    const privileged = isExternalWrite || capability.requiresApproval === true;
    // KERNEL_CLAIM_REQUIREMENT_V1 - `idempotency: "idempotent"` es una etiqueta
    // declarativa, no evidencia de que repetir sea inocuo. Toda capability que
    // declare CUALQUIER efecto (write, external_write, notification) exige
    // claim durable, no solo las de efecto externo. Solo una lectura pura (sin
    // efectos declarados) puede ejecutarse sin claim.
    const producesEffect = capability.sideEffects.some((s) => s.kind !== "read");
    const needsClaim = producesEffect || privileged;
    const governed = this.profile === "governed_v2";
    // La autoridad sigue al efecto, no al perfil: un efecto en `legacy_v1`
    // tambien exige principal, rol vigente y PDP.
    const requiresAuthority = governed || needsClaim;
    if (requiresAuthority) {
      if (!this.governance || !this.getAgentRole || !ctx.actorId || !ctx.roleId) {
        observeKernel({
          stage: "kernel.denial",
          status: "denied",
          durationMs: Date.now() - startedAt,
          capabilityId: capability.id,
          errorClass: "principal_missing",
        });
        throw new Error("GOVERNED_PRINCIPAL_REQUIRED");
      }
    }
    if (needsClaim && !this.db) throw new Error("GOVERNED_CLAIM_STORE_REQUIRED");
    // KERNEL_CAS_REQUIRED_V1 - el claim solo protege si su transicion es CAS.
    // Un store sin `compareAndSwap` no puede dar exclusion concurrente, asi que
    // la ruta gobernada deniega en vez de escribir a ciegas.
    if (needsClaim && typeof this.db?.compareAndSwap !== "function")
      throw new Error("GOVERNED_CAS_REQUIRED");
    if (requiresAuthority) await this.authorize(ctx, capability, startedAt);

    // CAPABILITY_RUNNER_IDEMPOTENCY_V1 - si el contrato no es idempotente,
    // generar key y pasarla. KERNEL_APPROVAL_CONSUMPTION_V1 - una capability
    // con aprobacion tambien necesita clave: es la prueba de que la aprobacion
    // se consumio para ESTE paso y no para otro.
    let idempotencyKey: import("../idempotency.ts").IdempotencyKey | undefined;
    let operationBindingDigest: string | undefined;
    if (capability.idempotency !== "idempotent" || needsClaim) {
      const { makeIdempotencyKey, legacyIdempotencyLookupKey } = await import("../idempotency.ts");
      const legacy = { key: legacyIdempotencyLookupKey("computer", {
        tenantId: ctx.tenantId, stepId: step.id, capabilityId: capability.id, inputs: step.inputs,
      }) };
      // A task/turn survives worker reassignment. Bare requests also bind their actor.
      const operation = ctx.taskId ? { kind: "task", id: ctx.taskId }
        : ctx.turnId ? { kind: "turn", id: ctx.turnId }
        : { kind: "request", id: ctx.requestId, actorId: ctx.actorId };
      idempotencyKey = makeIdempotencyKey("computer", {
        keyVersion: 2, tenantId: ctx.tenantId, owner: ctx.owner, operation,
        stepId: step.id, capabilityId: capability.id,
      });
      operationBindingDigest = makeIdempotencyKey("computer", {
        capabilityVersion: capability.version ?? "1.0.0", inputs: step.inputs,
      }).key;
      if (needsClaim && this.db) {
        const historical = await this.db.get(ctx.tenantId, "idempotency-claims", legacy.key) as ClaimRecord | null;
        // Never turn a key migration into permission to repeat a historical effect.
        if (historical) {
          if (historical.status === "claimed" && Date.now() - Date.parse(historical.claimedAt ?? "1970-01-01") >= 5 * 60 * 1000) {
            await this.transition(ctx.tenantId, legacy.key,
              { status: "claimed", fence: historical.fence, attemptId: historical.attemptId },
              { status: "outcome_unknown", error: "stale claim" });
            throw new Error(`idempotent: stale claim, reconcile first ${legacy.key}`);
          }
          if (historical.status === "outcome_unknown") throw new Error(`idempotent: outcome_unknown, reconcile first ${legacy.key}`);
          if (historical.status === "failed") throw new Error(`idempotent: failed claim requires reconciliation ${legacy.key}`);
          throw new Error("LEGACY_CLAIM_RECONCILIATION_REQUIRED");
        }
      }
    }

    // CAPABILITY_RUNNER_APPROVAL_REAL_V1 - la aprobacion autoriza un contenido,
    // una tarea, un tenant, un principal y una conexion concretos.
    if (capability.requiresApproval) {
      await this.assertApprovalBinding(ctx, step, capability, isExternalWrite, idempotencyKey?.key);
    }

    const exec = this.executors.get(capability.id);
    if (!exec) throw new Error(`No executor for capability ${capability.id}`);

    // CAPABILITY_RUNNER_B10_V1 - claim con status + recuperacion de resultado.
    if (idempotencyKey && needsClaim && this.db) {
      const claimId = idempotencyKey.key;
      const claimedAt = new Date().toISOString();
      const attemptId = randomUUID();
      // B10.2 - si ya existe claim, decidir segun su estado.
      const existing = (await this.db.get(ctx.tenantId, "idempotency-claims", claimId)) as ClaimRecord | null;
      let activeFence = 1;
      if (existing) {
        if (existing.keyVersion !== 2 || existing.bindingDigest !== operationBindingDigest)
          throw new Error("CLAIM_BINDING_CHANGED_RECONCILE");
        const previousFence = typeof existing.fence === "number" ? existing.fence : 0;
        if (existing.status === "done") {
          // B10.2 - devuelve el resultado cacheado, no re-ejecuta.
          return;
        }
        if (existing.status === "outcome_unknown") {
          throw new Error(`idempotent: outcome_unknown, reconcile first ${claimId}`);
        }
        if (existing.status === "accepted") {
          // EXECUTION_OUTCOME_ACCEPTED_V1 - aceptado no es confirmado. Un nuevo
          // envio duplicaria un efecto que el proveedor ya acepto.
          throw new Error(`idempotent: accepted awaiting confirmation, reconcile first ${claimId}`);
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
          observeKernel({
            stage: "runtime.reconciliation",
            status: "unknown",
            durationMs: Date.now() - startedAt,
            capabilityId: capability.id,
            errorClass: "stale_claim",
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
          keyVersion: 2,
          bindingDigest: operationBindingDigest,
          fence: 1,
          attemptId,
          claimedAt,
        });
        if (!claimed) throw new Error(`idempotent: raced claim ${claimId}`);
      }
      // KERNEL_EFFECT_BOUNDARY_REAUTH_V1 - la autoridad se revalida en el
      // limite del efecto: una revocacion entre el claim y el despacho no
      // ejecuta. No promete atomicidad con el proveedor remoto.
      if (requiresAuthority) await this.authorize(ctx, capability, startedAt);
      if (capability.requiresApproval) {
        await this.assertApprovalBinding(ctx, step, capability, isExternalWrite, claimId);
      }
      let result: unknown;
      try {
        result = await exec.run(ctx, capability.id, step.inputs, idempotencyKey);
      } catch (error) {
        // CAPABILITY_RUNNER_ERROR_KIND_V1 - solo una declaracion positiva de
        // ausencia de efecto permite reintentar. Un error generico posterior
        // al despacho se conserva como resultado desconocido.
        const failure = classifyAdapterFailure(error);
        const message = error instanceof Error ? error.message.slice(0, 2000) : "unknown";
        try {
          await this.transition(
            ctx.tenantId,
            claimId,
            { status: "claimed", fence: activeFence, attemptId },
            failure.retrySafe
              ? {
                  status: "failed",
                  fence: activeFence,
                  attemptId,
                  retrySafe: true,
                  outcome: failure.outcome,
                  error: message,
                  failedAt: new Date().toISOString(),
                }
              : failure.outcome === "accepted"
                ? {
                    status: "accepted",
                    fence: activeFence,
                    attemptId,
                    retrySafe: false,
                    outcome: failure.outcome,
                    error: message,
                    acceptedAt: new Date().toISOString(),
                  }
                : {
                    status: "outcome_unknown",
                    fence: activeFence,
                    attemptId,
                    retrySafe: false,
                    outcome: failure.outcome,
                    error: message,
                    claimedAt,
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
        observeKernel({
          stage: "runtime.result",
          status: failure.retrySafe ? "failed" : "unknown",
          durationMs: Date.now() - startedAt,
          capabilityId: capability.id,
          errorClass: failure.outcome,
        });
        throw error;
      }
      const outcomeClass = classifyAdapterResult(result);
      // EXECUTION_OUTCOME_RESULT_EXPLICIT_V1 - solo `confirmed` cierra el paso
      // como `done`. `accepted` espera confirmacion y `unknown` (incluido un
      // valor sin discriminante) exige conciliacion: ninguno declara exito.
      const settledStatus =
        outcomeClass === "confirmed"
          ? "done"
          : outcomeClass === "accepted"
            ? "accepted"
            : "outcome_unknown";
      // CAPABILITY_RUNNER_CLAIM_FENCE_V1 - la finalizacion solo la escribe el
      // intento que sigue poseyendo el claim; un worker tardio no pisa `done`.
      const settled = await this.transition(
        ctx.tenantId,
        claimId,
        { status: "claimed", fence: activeFence, attemptId },
        {
          status: settledStatus,
          fence: activeFence,
          attemptId,
          outcome: outcomeClass,
          result: typeof result === "string" ? result.slice(0, 2000) : JSON.stringify(result ?? null).slice(0, 2000),
          ...(settledStatus === "done"
            ? { doneAt: new Date().toISOString() }
            : settledStatus === "accepted"
              ? { acceptedAt: new Date().toISOString() }
              : { claimedAt }),
        },
      );
      if (!settled) throw new Error(`CLAIM_FENCE_LOST ${claimId}`);
      observeKernel({
        stage: "runtime.result",
        status: outcomeClass === "confirmed" ? "ok" : "unknown",
        durationMs: Date.now() - startedAt,
        capabilityId: capability.id,
        errorClass: outcomeClass === "confirmed" ? undefined : outcomeClass,
      });
      if (outcomeClass === "accepted") {
        // Un resultado aceptado no es un hecho confirmado: se detiene el paso
        // para conciliacion en vez de declarar exito operativo.
        throw Object.assign(
          new Error(`OUTCOME_ACCEPTED_RECONCILE ${claimId}`),
          { outcomeUnknown: true, code: "outcome_accepted" },
        );
      }
      if (outcomeClass === "unknown") {
        throw Object.assign(
          new Error(`OUTCOME_UNCLASSIFIED_RECONCILE ${claimId}`),
          { outcomeUnknown: true, code: "outcome_unknown" },
        );
      }
      return;
    }

    // Ruta sin claim (lectura pura: sin efectos declarados ni aprobacion).
    if (requiresAuthority) await this.authorize(ctx, capability, startedAt);
    await exec.run(ctx, capability.id, step.inputs, idempotencyKey);
    observeKernel({
      stage: "runtime.result",
      status: "ok",
      durationMs: Date.now() - startedAt,
      capabilityId: capability.id,
    });
  }

  /**
   * KERNEL_AUTHORIZE_V1 - unica decision de autoridad del runner. Reutiliza el
   * PDP existente; no crea un segundo motor de permisos.
   */
  private async authorize(
    ctx: ExecutionContext,
    capability: { id: string; actionType?: string },
    startedAt: number,
  ): Promise<void> {
    if (!this.governance || !this.getAgentRole) throw new Error("GOVERNED_PRINCIPAL_REQUIRED");
    if (!ctx.actorId || !ctx.roleId) throw new Error("GOVERNED_PRINCIPAL_REQUIRED");
    const role = await this.getAgentRole(ctx.tenantId, ctx.roleId);
    if (!role) throw new Error(`AgentRole ${ctx.roleId} not found for authz`);
    if ((role as { active?: boolean }).active === false)
      throw new Error(`AgentRole ${ctx.roleId} is inactive`);
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
    if (!decision.allowed) {
      observeKernel({
        stage: "kernel.denial",
        status: "denied",
        durationMs: Date.now() - startedAt,
        capabilityId: capability.id,
        errorClass: "pdp_denied",
      });
      throw new Error(`authz denied: ${decision.reason ?? capability.id}`);
    }
    observeKernel({
      stage: "kernel.decision",
      status: "ok",
      durationMs: Date.now() - startedAt,
      capabilityId: capability.id,
    });
  }

  /**
   * APPROVAL_BINDING_V1 - una aprobacion autoriza un contenido exacto, en una
   * tarea y tenant concretos, para un principal y una generacion de conexion
   * concretos, y se consume una sola vez por paso.
   */
  private async assertApprovalBinding(
    ctx: ExecutionContext,
    step: PlanStep,
    capability: { id: string; actionType?: string },
    isExternalWrite: boolean,
    claimId?: string,
  ): Promise<void> {
    // KERNEL_APPROVAL_ID_REQUIRED_V1 - una sesion no es una aprobacion. Antes
    // se aceptaba `ctx.sessionId` como fallback, de modo que un id de
    // conversacion hacia de autorizacion. Solo `approvalId` nombra la decision
    // que autoriza este paso.
    const approvalId = ctx.approvalId;
    if (!approvalId) throw new Error(`requires approval: ${capability.id}`);
    if (!this.db) throw new Error("APPROVAL_STORE_REQUIRED");
    // CAPABILITY_RUNNER_APPROVAL_OWNER_V1 - el store compone la clave como
    // `${tenant}:${owner}`; la accion se guarda con el owner real.
    const approval = (await this.db.get(ctx.owner, "actions", approvalId)) as ApprovalRecord | null;
    if (!approval) throw new Error(`approval not found: ${approvalId}`);
    if (!approval.status || !["executing", "succeeded"].includes(approval.status)) {
      throw new Error(`approval not valid: ${approvalId} status=${approval.status ?? "unknown"}`);
    }
    // APPROVAL_ONE_EFFECT_V1 - una aprobacion ya consumida solo puede
    // reutilizarse para el MISMO paso (claim `done`). Cualquier otro paso es
    // una operacion distinta y no hereda la autorizacion.
    if (approval.status === "succeeded") {
      if (!claimId) throw new Error(`approval already consumed: ${approvalId}`);
      const claim = (await this.db.get(ctx.tenantId, "idempotency-claims", claimId)) as ClaimRecord | null;
      if (!claim || claim.status !== "done")
        throw new Error(`approval already consumed: ${approvalId}`);
    }
    if (!approval.tenantId || approval.tenantId !== ctx.tenantId)
      throw new Error(`approval tenant mismatch: ${approvalId}`);
    if (ctx.taskId) {
      if (approval.taskId !== ctx.taskId) throw new Error(`approval task mismatch: ${approvalId}`);
    } else if (approval.taskId) {
      throw new Error(`approval is bound to task ${approval.taskId}`);
    }
    if (!approval.hash || !approval.revision)
      throw new Error(`approval is not bound to a reviewed revision: ${approvalId}`);
    if (!approval.expiresAt || Date.parse(approval.expiresAt) <= Date.now())
      throw new Error(`approval expired: ${approvalId}`);
    if (!approval.principal || ![ctx.actorId, ctx.owner].includes(approval.principal))
      throw new Error(`approval principal mismatch: ${approvalId}`);
    // APPROVAL_COMPLETE_BINDING_V1 - en una ruta gobernada la ausencia de un
    // campo obligatorio deniega; antes las comprobaciones se omitian cuando
    // faltaba informacion (`if (approval.capabilityId && ...)`), asi que una
    // aprobacion sin vinculo pasaba. El vinculo es completo: capability,
    // operacion (kind), payload, tenant, tarea, principal, revision y conexion.
    if (!approval.capabilityId)
      throw new Error(`approval has no bound capability: ${approvalId}`);
    if (approval.capabilityId !== capability.id)
      throw new Error(`approval capability mismatch: ${approval.capabilityId} != ${capability.id}`);
    if (!approval.kind) throw new Error(`approval has no bound operation: ${approvalId}`);
    const inputs = (step.inputs ?? {}) as Record<string, unknown>;
    const inputKind = typeof inputs.kind === "string" ? inputs.kind : undefined;
    if (!inputKind) throw new Error(`step has no bound operation: ${step.id}`);
    if (inputKind !== approval.kind)
      throw new Error(`approval kind mismatch: ${approval.kind} != ${inputKind}`);
    if (approval.data === undefined)
      throw new Error(`approval has no bound payload: ${approvalId}`);
    if (inputs.data === undefined) throw new Error(`step has no bound payload: ${step.id}`);
    if (stableStringify(inputs.data) !== stableStringify(approval.data))
      throw new Error(`approval content mismatch: ${approvalId}`);

    // APPROVAL_CONNECTION_GENERATION_V1 - un efecto externo exige conexion y
    // generacion aprobadas, y ademas que esa generacion sea la VIGENTE. Nombrar
    // una generacion no prueba que siga activa: la credencial pudo rotar entre
    // la revision y el efecto.
    if (isExternalWrite) {
      if (!approval.connectionId)
        throw new Error(`approval has no bound connection: ${approvalId}`);
      if (!approval.connectionGeneration)
        throw new Error(`approval has no bound connection generation: ${approvalId}`);
      if (!this.connections) throw new Error("CONNECTION_VERIFIER_REQUIRED");
      const generation = await this.connections.generationFor(ctx, {
        id: approval.id,
        connectionId: approval.connectionId,
      });
      if (!generation) throw new Error(`approval connection is not available: ${approvalId}`);
      if (generation !== approval.connectionGeneration)
        throw new Error(
          `approval connection rotated: ${approvalId} ${approval.connectionGeneration} != ${generation}`,
        );
    }
  }

  /**
   * CAPABILITY_RUNNER_CLAIM_CAS_V1 - transicion con expectativa.
   *
   * KERNEL_CAS_REQUIRED_V1 - sin CAS no hay expectativa atomica: el `put`
   * historico pisa el claim de otro intento y convierte el fencing en una
   * convencion. En la ruta gobernada el CAS es una dependencia obligatoria; si
   * el store no lo expone, la operacion se deniega.
   */
  private async transition(
    tenantId: string,
    claimId: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<boolean> {
    if (!this.db) throw new Error("GOVERNED_CLAIM_STORE_REQUIRED");
    if (typeof this.db.compareAndSwap !== "function")
      throw new Error("GOVERNED_CAS_REQUIRED");
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
}

/** Orden estable para comparar contenido aprobado con contenido a ejecutar. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(",")}}`;
}
