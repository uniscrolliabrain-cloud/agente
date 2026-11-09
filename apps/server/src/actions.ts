// BUG05_ACTIONS_DEFERRED_V2 - integrar DeferredActions en decide().
// C3_ACTIONS_DEFERRED_V1 - integrar DeferredActions en decide() cuando este listo.
// EVENTBUS_ACTION_EMIT_V1
import { createHash, randomUUID } from "node:crypto";
import {
  type ActionProposal,
  type CalendarEvent,
  type ProposalInput,
  proposalSchema,
} from "../../../packages/domain/src/index.ts";
import type { Store } from "./db.ts";
import type { EventBus } from "./engine/events/index.ts";
import type { DeferredActions } from "./actions-deferred.ts";
import type { PolicyEngine } from "./engine/policy/engine.ts";
import type { AgentRole } from "../../../packages/domain/src/agent.ts";
import { AppError } from "./errors.ts";
import type {
  ApprovalRequest,
  ApprovalStatus,
} from "../../../packages/domain/src/messaging.ts";
import { currentTenantScope } from "./tenant-scope.ts";
import type { TenantScopedStore } from "./db-tenant.ts";
import {
  LeadsService,
  detectFollowUpReply,
  looksLikeOptOut,
  type InboundFollowUpMessage,
} from "./engine/leads.ts";
import type { GoogleMapsClient } from "../../../packages/integrations/src/google-maps.ts";

// ACTIONS_STORE_CONTRACT_V1 - ActionService solo usa estas cinco operaciones.
// Declararlas aparte (en vez de pedir el Store completo) permite inyectar el
// TenantScopedStore, que no implementa select/rawQuery/close. Y hace explicito
// el contrato que importa aqui: la accion se guarda con la misma clave de
// tenant que leen el worker y las rutas de aprobacion.
export interface ActionsStore {
  get<T = Record<string, unknown>>(owner: string, kind: string, id: string): Promise<T | null>;
  put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T>;
  insertIfAbsent<T extends { id: string }>(
    owner: string,
    kind: string,
    value: T,
  ): Promise<T | null>;
  compareAndSwap<T>(
    owner: string,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null>;
  claim<T>(owner: string, id: string, status: string, now: string): Promise<T | null>;
  // LEAD_FOLLOW_UP_V1 - la guarda del seguimiento necesita releer el hilo cuando
  // el store lo permite; el resto de acciones no depende de esta lectura.
  list?<T = Record<string, unknown>>(owner: string, kind: string): Promise<T[]>;
}

const NO_PLACES = {
  searchLeads: async () => {
    throw new Error("El seguimiento no busca en Places");
  },
} as unknown as GoogleMapsClient;

type FollowUpMeta = {
  ref: string;
  step: number;
  threadId: string;
  to: string;
  baseline: string;
};
type ActionWithFollowUp = ActionProposal & { followUp?: FollowUpMeta };

interface Options {
  // TYPE_FIX_DEFERRED_V1 - campo deferred.
  deferred?: import("./actions-deferred.ts").DeferredActions;
  execute: (
    owner: string,
    input: ProposalInput,
    connectionId?: string,
    targetVersion?: string,
  ) => Promise<string>;
  prepare?: (
    owner: string,
    input: ProposalInput,
    connectionId?: string,
  ) => Promise<{
    input: ProposalInput;
    target?: CalendarEvent;
    targetVersion?: string;
  }>;
  connected: (owner: string) => Promise<boolean>;
  // APPROVAL_CONNECTION_GENERATION_V1 (campana 14) - la generacion de la
  // credencial viaja con la propuesta: si rota, la revision vieja no despacha.
  connection?: (
    owner: string,
  ) => Promise<{ id: string; account: string; generation?: string } | null>;
  now?: () => number;
}
// APPROVAL_REQUEST_PRIMITIVE_V1 - la propuesta actual es un ApprovalRequest
// informal. En la proxima fase se envuelve como primitiva formal con
// runtimeId + capabilityId + risk, sin cambiar la firma.
export class ActionService {
  private readonly now: () => number;
  private readonly bus?: EventBus;
  private readonly policy?: PolicyEngine;
  constructor(
    private readonly db: ActionsStore,
    private readonly options: Options,
    bus?: EventBus,
    policy?: PolicyEngine,
    private readonly assignments?: import("./engine/assignments/service.ts").AssignmentService,
  ) {
    this.bus = bus;
    this.policy = policy;
    this.now = options.now ?? Date.now;
  }
  /**
   * ACTIONS_RETRY_V1 Ã¢â‚¬â€ reintenta una acciÃƒÂ³n que fallÃƒÂ³ con error determinista.
   * Solo permitido si el status es "failed" y el error no es outcome_unknown.
   * Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
   */
  // ACTION_EDIT_V1 - editar propuesta antes de aprobar. Cambia el hash.
  // ACTION_SERVICE_EDIT_HASH_V1
  async edit(
    owner: string,
    actionId: string,
    newData: Record<string, unknown>,
    expectedHash: string,
  ): Promise<ActionProposal> {
    // ACTION_SERVICE_EDIT_ENDPOINT_MARK_V1
    const action = await this.db.get<ActionProposal>(owner, "actions", actionId);
    if (!action) throw new AppError("Action not found", 404);
    if (action.status !== "awaiting_review") {
      throw new AppError("Only awaiting_review actions can be edited", 409);
    }
    if (action.hash !== expectedHash) {
      throw new AppError("Action changed. Reload and retry.", 409);
    }
    const nextHash = createHash("sha256")
      .update(JSON.stringify({ data: newData, connectionId: action.connectionId }))
      .digest("hex");
    const updated = await this.db.compareAndSwap<ActionProposal>(
      owner,
      "actions",
      actionId,
      { status: "awaiting_review", hash: action.hash },
      { data: newData as ActionProposal["data"], hash: nextHash },
    );
    if (!updated) throw new AppError("Action changed. Reload and retry.", 409);
    await this.audit(owner, updated, "edited", "Edited by user");
    return updated;
  }

  // ACTION_SERVICE_RETRY_GUARD_V1
  async retry(owner: string, actionId: string): Promise<ActionProposal> {
    const action = await this.db.get<ActionProposal>(owner, "actions", actionId);
    if (!action) throw new AppError("Action not found", 404);
    // APPROVAL_RETRY_AMBIGUOUS_V1 - un resultado incierto no se reintenta: se
    // concilia. Va antes del filtro de estados para no confundirlo con un fallo.
    if (
      action.status === "outcome_unknown" ||
      (action as { errorKind?: string }).errorKind === "outcome_unknown"
    ) {
      throw new AppError(
        "Cannot retry an action with uncertain outcome. Reconcile it first.",
        409,
      );
    }
    // RETRY_DENIED_V1 - permite reintentar failed y denied.
    if (action.status !== "failed" && action.status !== "denied") {
      throw new AppError(
        `Only failed or denied actions can be retried (current: ${action.status})`,
        409,
      );
    }
    // APPROVAL_RETRY_TEXT_V1 - el texto legacy sigue bloqueando el reintento.
    if (action.error && /outcome_unknown|uncertain/i.test(action.error)) {
      throw new AppError(
        "Cannot retry an action with uncertain outcome. Reconcile it first.",
        409,
      );
    }
    // Reset a awaiting_review para que el usuario vuelva a aprobar.
    const reset = await this.db.compareAndSwap<ActionProposal>(
      owner,
      "actions",
      actionId,
      { status: action.status },
      { status: "awaiting_review", error: null, result: null },
    );
    if (!reset) throw new AppError("Action changed; refresh and retry", 409);
    await this.audit(owner, reset, "retried", "Retried by user");
    return reset;
  }

  // ACTION_GET_APPROVAL_V1 - lectura de aprobacion para validacion real en CapabilityRunner.
  async getApproval(owner: string, actionId: string): Promise<ActionProposal | null> {
    return this.db.get<ActionProposal>(owner, "actions", actionId);
  }

  async propose(
    owner: string,
    raw: unknown,
    idempotencyKey?: string,
    taskId?: string,
    ctx?: import("./engine/authz/pdp.ts").PolicyContext,
  ): Promise<ActionProposal> {
    const id =
      idempotencyKey === undefined
        ? randomUUID()
        : createHash("sha256").update(idempotencyKey).digest("hex");
    if (idempotencyKey !== undefined) {
      const existing = await this.db.get<ActionProposal>(owner, "actions", id);
      if (existing) return existing;
    }
    const parsed = proposalSchema.parse(raw);
    const connection = await this.options.connection?.(owner);
    if (this.options.connection && !connection)
      throw new AppError("Connect Google before preparing an action", 409);
    const prepared = await this.options.prepare?.(owner, parsed, connection?.id);
    const input = proposalSchema.parse(prepared?.input ?? parsed);
    const title =
      input.kind === "email.send"
        ? `Send Ã¢â‚¬Å“${input.data.subject}Ã¢â‚¬Â`
        : input.kind === "calendar.delete"
          ? `Delete ${input.data.title}`
          : input.kind === "drive.trash"
            ? `Move Ã¢â‚¬Å“${input.data.name}Ã¢â‚¬Â to trash`
            : input.kind === "drive.rename"
              ? `Rename file to Ã¢â‚¬Å“${input.data.name}Ã¢â‚¬Â`
              : `${input.kind === "calendar.create" ? "Create" : "Update"} ${input.data.title}`;
    const createdAt = new Date(this.now()).toISOString();
    // APPROVAL_PRINCIPAL_REVISION_V1 (campana 14) - la propuesta queda atada al
    // principal que la pidio, al proveedor y a la revision exacta del payload
    // (sin la conexion, que tiene su propio campo) y a la generacion de la
    // credencial con la que se reviso.
    const revision = createHash("sha256")
      .update(JSON.stringify({ input, target: prepared?.target, targetVersion: prepared?.targetVersion }))
      .digest("hex");
    const proposal = {
      id,
      taskId,
      title,
      kind: input.kind,
      data: input.data,
      account: connection?.account,
      connectionId: connection?.id,
      target: prepared?.target,
      targetVersion: prepared?.targetVersion,
      status: "awaiting_review",
      hash: createHash("sha256")
        .update(
          JSON.stringify({
            input,
            connection,
            target: prepared?.target,
            targetVersion: prepared?.targetVersion,
          }),
        )
        .digest("hex"),
      createdAt,
      // ACTION_EXPIRES_V1 - configurable por env.
      expiresAt: new Date(
        this.now() + (Number(process.env.ACTION_EXPIRES_MS ?? "1800000") || 1800000),
      ).toISOString(),
      principal: ctx?.actor ?? owner,
      provider: "google" as const,
      revision,
      ...(connection?.generation ? { connectionGeneration: connection.generation } : {}),
    } as ActionProposal;
    // LEAD_FOLLOW_UP_V1 - la clave del seguimiento ata el borrador al paso y al
    // hilo; la aprobacion revalida ese vinculo antes de tocar el proveedor.
    const followUpMeta = await this.followUpMeta(owner, idempotencyKey, input, id);
    if (followUpMeta) (proposal as ActionWithFollowUp).followUp = followUpMeta;
    const saved =
      idempotencyKey === undefined
        ? await this.db.put(owner, "actions", proposal)
        : await this.db.insertIfAbsent(owner, "actions", proposal);
    if (!saved) {
      const existing = await this.db.get<ActionProposal>(owner, "actions", id);
      if (!existing) throw new AppError("Prepared action could not be loaded", 409);
      return existing;
    }
    await this.record(owner, saved, "Ready for your review");
    await this.audit(owner, saved, "proposed", `Ready for review: ${saved.title}`);
    // ACTION_SERVICE_PROPOSE_EMIT_V1
    await this.bus?.emit(owner, "action.proposed", { kind: "action", id: saved.id }, {
      actionId: saved.id,
      title: saved.title.slice(0, 300),
      kind: saved.kind,
    });
    return saved;
  }
  // USER_ID_REAL_V1 - userId opcional para doble firma real.
  async decide(
    owner: string,
    id: string,
    hash: string,
    decision: "approve" | "deny",
    userId?: string,
    ctx?: import("./engine/authz/pdp.ts").PolicyContext,
  ): Promise<ActionProposal> {
    // ACTION_SERVICE_DECIDE_USER_ID_V1
    const proposal = await this.db.get<ActionProposal>(owner, "actions", id);
    if (!proposal) throw new AppError("Action not found", 404);
    if (proposal.hash !== hash)
      throw new AppError("This proposal changed. Open its latest review before deciding.", 409);
    if (proposal.status !== "awaiting_review") return proposal;
    if (decision === "approve" && proposal.taskId) {
      const task = await this.db.get<{ status: string }>(owner, "tasks", proposal.taskId);
      if (!task || !["running", "waiting_approval"].includes(task.status))
        throw new AppError(
          "Resume the task before approving this action. Cancelled tasks cannot execute.",
          409,
        );
    }
    if (Date.parse(proposal.expiresAt) <= this.now()) {
      const expiredStatus: ApprovalStatus = "expired";
      const expired = await this.db.compareAndSwap<ActionProposal>(
        owner,
        "actions",
        id,
        { status: "awaiting_review", hash, expiresAt: proposal.expiresAt },
        { status: expiredStatus },
      );
      if (!expired) {
        const current = await this.db.get<ActionProposal>(owner, "actions", id);
        if (!current) throw new AppError("Action not found", 404);
        return current;
      }
      throw new AppError("This review expired. Create a fresh proposal.", 409);
    }
    if (decision === "approve" && !(await this.options.connected(owner)))
      throw new AppError("Google is disconnected. Reconnect before approving this action.", 409);
    if (decision === "approve" && this.options.connection) {
      const connection = await this.options.connection(owner);
      if (
        !connection ||
        connection.id !== proposal.connectionId ||
        connection.account !== proposal.account
      )
        throw new AppError(
          "Google account or connection changed. Prepare a new action for the connected account.",
          409,
        );
      // APPROVAL_GENERATION_CHECK_V1 - reconectar rota la generacion: la
      // revision anterior no puede ejecutarse contra la credencial nueva.
      const proposedGeneration =
        (proposal as { connectionGeneration?: string }).connectionGeneration ?? null;
      if ((connection.generation ?? null) !== proposedGeneration)
        throw new AppError(
          "Google connection rotated. Review a fresh proposal for the current connection.",
          409,
        );
    }
    // POLICY_GATE_V1 Ã¢â‚¬â€ si la accion esta vinculada a una tarea con rol activo,
    // consultamos PolicyEngine antes de aprobar. Deny es siempre libre.
    if (decision === "approve" && this.policy && proposal.taskId) {
      const task = await this.db.get<{ state?: { roleId?: string } }>(owner, "tasks", proposal.taskId);
      const roleId = typeof task?.state?.roleId === "string" ? task.state.roleId : undefined;
      if (roleId) {
        const role = await this.db.get<AgentRole>(owner, "agent-roles", roleId).catch(() => null);
        if (role) {
          const verdict = await this.policy.can(owner, role, `action:${proposal.kind}`, "approve");
          if (!verdict.allowed) throw new AppError(verdict.reason ?? "Action denied by policy", 403);
        }
      }
    }
    if (decision === "approve") {
      try {
        await this.assertFollowUpSendable(owner, proposal);
      } catch (error) {
        const reason = error instanceof Error ? error.message : "seguimiento cancelado";
        await this.denyFollowUpAction(owner, proposal, reason);
        throw error;
      }
    }
    // APPROVAL_PRIMITIVE_WIRE_V1 - la decision deja de ser informal: se
    // persiste el ApprovalRequest formal con su estado (approved/rejected).
    const approvalStatus: ApprovalStatus = decision === "deny" ? "rejected" : "approved";
    const approval: ApprovalRequest = {
      id: proposal.id,
      tenantId: owner,
      owner,
      ...(proposal.taskId ? { taskId: proposal.taskId } : {}),
      capabilityId: `action:${proposal.kind}`,
      reason: proposal.title.slice(0, 2000),
      risk: "medium",
      status: approvalStatus,
      payload: { data: proposal.data, hash: proposal.hash, decision },
      requestedAt: proposal.createdAt,
      expiresAt: proposal.expiresAt,
      decidedAt: new Date(this.now()).toISOString(),
      ...(userId ? { decidedBy: userId } : {}),
    };
    await this.db.put(owner, "approval-requests", approval);
    const claimed = await this.db.claim<ActionProposal>(
      owner,
      id,
      decision === "deny" ? "denied" : "executing",
      new Date(this.now()).toISOString(),
    );
    if (!claimed) {
      const current = await this.db.get<ActionProposal>(owner, "actions", id);
      if (!current) throw new AppError("Action not found", 404);
      return current;
    }
    await this.record(
      owner,
      claimed,
      decision === "deny" ? "Declined; no changes made" : "Approved; execution started",
    );
    await this.audit(
      owner,
      claimed,
      decision,
      decision === "deny" ? "Declined by user" : "Approved by user",
    );
    if (decision === "deny") {
      await this.bus?.emit(owner, "action.denied", { kind: "action", id: claimed.id }, {
        actionId: claimed.id,
        title: claimed.title.slice(0, 300),
      });
      return claimed;
    }
    await this.bus?.emit(owner, "action.approved", { kind: "action", id: claimed.id }, {
      actionId: claimed.id,
      title: claimed.title.slice(0, 300),
    });
    // ACTIONS_DEFERRED_WIRE_V1 Ã¢â‚¬â€ si hay deferred, aprobar no ejecuta ya.
    // Se programa para dentro de `windowMs` y el usuario puede deshacer.
    // Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
    if (this.options.deferred && decision === "approve") {
      const deferredRecord = await this.options.deferred.decide(
        owner,
        claimed.id,
        userId ?? owner,
        typeof claimed.data === "object" && claimed.data !== null && "amount" in claimed.data
          ? Number((claimed.data as { amount?: unknown }).amount) || undefined
          : undefined,
      );
      if (deferredRecord.status === "scheduled") {
        // Guardamos el estado scheduled en la ActionProposal.
        await this.db.put(owner, "actions", {
          ...claimed,
          status: "scheduled",
          signers: deferredRecord.signers,
          needed: deferredRecord.needed,
          executeAt: deferredRecord.executeAt
            ? new Date(deferredRecord.executeAt).toISOString()
            : null,
        });
        return (await this.db.get<ActionProposal>(owner, "actions", claimed.id)) ?? claimed;
      }
      // Si aÃƒÂºn no se alcanzÃƒÂ³ el nÃƒÂºmero de firmas, la propuesta vuelve a
      // awaiting_review con los signers acumulados.
      if (deferredRecord.status === "collecting") {
        await this.db.put(owner, "actions", {
          ...claimed,
          status: "awaiting_review",
          signers: deferredRecord.signers,
          needed: deferredRecord.needed,
          executeAt: null,
        });
        return (await this.db.get<ActionProposal>(owner, "actions", claimed.id)) ?? claimed;
      }
    }
    return this.run(owner, claimed, userId ?? owner);
  }

  /**
   * APPROVAL_RUN_V1 (campana 14) - la unica puerta al proveedor. Persiste el
   * proveedor, el recibo confirmado o la ambiguedad, y nunca reintenta solo.
   */
  private async run(
    owner: string,
    claimed: ActionProposal,
    decidedBy?: string,
  ): Promise<ActionProposal> {
    const executedAt = new Date(this.now()).toISOString();
    let finished: ActionProposal;
    try {
      const input = proposalSchema.parse({ kind: claimed.kind, data: claimed.data });
      const result = await this.options.execute(
        owner,
        input,
        claimed.connectionId,
        claimed.targetVersion,
      );
      finished = {
        ...claimed,
        status: "succeeded",
        result,
        provider: "google",
        providerResult: result,
        settledAt: new Date(this.now()).toISOString(),
        executedAt,
        ...(decidedBy ? { approvedBy: decidedBy } : {}),
      } as unknown as ActionProposal;
    } catch (error) {
      const unknown =
        error instanceof Error &&
        (("outcomeUnknown" in error && error.outcomeUnknown === true) ||
          ("code" in error && error.code === "outcome_unknown"));
      // ERROR_KIND_V1 - distingue negocio de infra.
      const message = error instanceof Error ? error.message : "Execution failed";
      const status = (error as { status?: number })?.status;
      const errorKind = unknown
        ? "outcome_unknown"
        : typeof status === "number" && status >= 400 && status < 500
          ? "business"
          : "infra";
      finished = {
        ...claimed,
        status: unknown ? "outcome_unknown" : "failed",
        error: message,
        provider: "google",
        executedAt,
        ...(decidedBy ? { approvedBy: decidedBy } : {}),
        // APPROVAL_AMBIGUOUS_V1 - un resultado incierto exige conciliacion
        // humana: no hay recibo y no se reenvia automaticamente.
        ...(unknown
          ? { reconciliationRequired: true, errorKind: "outcome_unknown" as const }
          : errorKind !== "outcome_unknown"
            ? { errorKind }
            : {}),
      } as unknown as ActionProposal;
    }
    await this.db.put(owner, "actions", finished);
    if (finished.status === "succeeded") await this.markFollowUpSent(owner, finished);
    // APPROVAL_SYNC_V2 - reflejar el estado final en approval-requests.
    const finalStatus =
      finished.status === "succeeded"
        ? "approved"
        : finished.status === "failed" || finished.status === "outcome_unknown"
          ? "rejected"
          : "pending";
    void this.db
      .put(owner, "approval-requests", {
        ...((await this.db.get<Record<string, unknown>>(owner, "approval-requests", finished.id)) ?? {}),
        id: finished.id,
        tenantId: owner,
        owner,
        status: finalStatus,
        decidedAt: new Date().toISOString(),
        decidedBy: owner,
        result: finished.result ?? finished.error ?? null,
      })
      .catch(() => {});
    const finishedTitle = finished.title.slice(0, 300);
    if (finished.status === "succeeded")
      await this.bus?.emit(owner, "action.executed", { kind: "action", id: finished.id }, {
        actionId: finished.id,
        title: finishedTitle,
        ...(finished.result ? { result: finished.result.slice(0, 2000) } : {}),
      });
    else if (finished.status === "outcome_unknown")
      await this.bus?.emit(owner, "action.outcome_unknown", { kind: "action", id: finished.id }, {
        actionId: finished.id,
        title: finishedTitle,
        ...(finished.error ? { error: finished.error.slice(0, 2000) } : {}),
      });
    else
      await this.bus?.emit(owner, "action.failed", { kind: "action", id: finished.id }, {
        actionId: finished.id,
        title: finishedTitle,
        ...(finished.error ? { error: finished.error.slice(0, 2000) } : {}),
      });
    await this.record(owner, finished, finished.result ?? finished.error ?? finished.status);
    return finished;
  }
  /**
   * ACTIONS_AUDIT_V1 Ã¢â‚¬â€ registra una entrada de auditorÃƒÂ­a estructurada
   * por cada transiciÃƒÂ³n de estado de la propuesta.
   * Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
   */
  /**
   * APPROVAL_DISPATCH_V1 (campana 14) - despacho de una accion programada
   * (ventana de undo). Revalida la conexion ANTES de reservar con CAS y, si
   * la credencial cambio, falla cerrado: no se llama al proveedor.
   */
  async dispatchScheduled(
    owner: string,
    actionId: string,
  ): Promise<{ executed: boolean; reason?: string }> {
    const proposal = await this.db.get<ActionProposal>(owner, "actions", actionId);
    if (!proposal) return { executed: false, reason: "action_not_found" };
    if (proposal.status === "outcome_unknown")
      return { executed: false, reason: "reconcile_previous_outcome" };
    if (proposal.status !== "scheduled")
      return { executed: false, reason: `invalid_state:${proposal.status}` };
    try {
      await this.assertFollowUpSendable(owner, proposal);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "seguimiento cancelado";
      await this.denyFollowUpAction(owner, proposal, reason);
      return { executed: false, reason };
    }
    if (this.options.connection) {
      const connection = await this.options.connection(owner).catch(() => null);
      const proposedGeneration =
        (proposal as { connectionGeneration?: string }).connectionGeneration ?? null;
      if (
        !connection ||
        connection.id !== proposal.connectionId ||
        connection.account !== proposal.account ||
        (connection.generation ?? null) !== proposedGeneration
      ) {
        await this.db.compareAndSwap<ActionProposal>(
          owner,
          "actions",
          actionId,
          { status: "scheduled" },
          {
            status: "failed",
            error: "Google connection changed before dispatch. Prepare a new action.",
            errorKind: "business",
          },
        );
        return { executed: false, reason: "connection_changed" };
      }
    }
    const claimed = await this.db.compareAndSwap<ActionProposal>(
      owner,
      "actions",
      actionId,
      { status: "scheduled" },
      { status: "executing", executeAt: null },
    );
    if (!claimed) return { executed: false, reason: "already_dispatched" };
    const finished = await this.run(owner, claimed);
    return finished.status === "succeeded"
      ? { executed: true }
      : { executed: false, reason: finished.error ?? finished.status };
  }

  private async followUpDomain(): Promise<{ tenantId: string; service: LeadsService }> {
    const scope = currentTenantScope();
    if (!scope?.tenantId) throw new AppError("El seguimiento necesita una empresa resuelta", 409);
    return {
      tenantId: scope.tenantId,
      service: new LeadsService(this.db as unknown as TenantScopedStore, NO_PLACES),
    };
  }

  private async followUpMeta(
    owner: string,
    idempotencyKey: string | undefined,
    input: ProposalInput,
    proposalId: string,
  ): Promise<FollowUpMeta | undefined> {
    if (!idempotencyKey?.startsWith("lead-follow-up:")) return undefined;
    const [, ref, rawStep] = idempotencyKey.split(":");
    const step = Number(rawStep);
    if (!ref || !Number.isInteger(step)) throw new AppError("Seguimiento invalido", 422);
    if (input.kind !== "email.send")
      throw new AppError("Un seguimiento solo prepara un correo", 422);
    const { tenantId, service } = await this.followUpDomain();
    const record = (await service.followUps(tenantId, ref)).find((item) => item.step === step);
    if (!record) throw new AppError("El seguimiento no esta programado", 409);
    if (record.status !== "scheduled" && record.status !== "awaiting_approval")
      throw new AppError(`El seguimiento ya no esta abierto (${record.status})`, 409);
    if (record.threadId !== input.data.threadId)
      throw new AppError("El borrador no responde al hilo del seguimiento", 409);
    if ((input.data.to[0] ?? "").toLowerCase() !== record.to.toLowerCase())
      throw new AppError("El borrador no va al contacto del seguimiento", 409);
    if (record.status === "scheduled")
      await service.markFollowUp(
        tenantId,
        ref,
        step,
        { status: "awaiting_approval", actionId: proposalId },
        "scheduled",
      );
    return {
      ref,
      step,
      threadId: record.threadId,
      to: record.to,
      baseline: record.sentAt ?? record.createdAt,
    };
  }

  /** Ningun envio de seguimiento sale si el contacto ya respondio o pidio la baja. */
  private async assertFollowUpSendable(
    owner: string,
    proposal: ActionProposal,
  ): Promise<void> {
    const meta = (proposal as ActionWithFollowUp).followUp;
    if (!meta) return;
    const { tenantId, service } = await this.followUpDomain();
    const record = (await service.followUps(tenantId, meta.ref)).find(
      (item) => item.step === meta.step,
    );
    if (!record) throw new AppError("El seguimiento ya no existe", 409);
    if (
      record.status !== "scheduled" &&
      record.status !== "awaiting_approval" &&
      record.status !== "sent"
    )
      throw new AppError(
        `El seguimiento esta cancelado (${record.cancelledReason ?? record.status})`,
        409,
      );
    if (await service.opposition(tenantId, meta.ref))
      throw new AppError("El contacto pidio la baja: no se envia el seguimiento", 409);
    if (typeof this.db.list !== "function") return;
    const mail = await this.db.list<InboundFollowUpMessage>(owner, "mail");
    const reply = detectFollowUpReply(record, mail);
    if (!reply) return;
    const optOut = looksLikeOptOut(`${reply.subject ?? ""} ${reply.body ?? ""}`);
    await service.recordInbound(tenantId, meta.ref, {
      messageId: reply.id,
      from: reply.from,
      at: reply.date,
      optOut,
    });
    throw new AppError(
      optOut
        ? "El contacto pidio la baja durante el seguimiento: no se envia"
        : "El contacto respondio durante el seguimiento: no se envia",
      409,
    );
  }

  private async denyFollowUpAction(
    owner: string,
    proposal: ActionProposal,
    reason: string,
  ): Promise<void> {
    if (proposal.status !== "awaiting_review" && proposal.status !== "scheduled") return;
    await this.db.compareAndSwap(owner, "actions", proposal.id, { status: proposal.status }, {
      status: "denied",
      error: reason.slice(0, 2000),
      errorKind: "business",
    });
  }

  private async markFollowUpSent(owner: string, proposal: ActionProposal): Promise<void> {
    const meta = (proposal as ActionWithFollowUp).followUp;
    if (!meta) return;
    try {
      const { tenantId, service } = await this.followUpDomain();
      const record = (await service.followUps(tenantId, meta.ref)).find(
        (item) => item.step === meta.step,
      );
      if (!record || record.status !== "awaiting_approval") return;
      await service.markFollowUp(
        tenantId,
        meta.ref,
        meta.step,
        {
          status: "sent",
          sentAt: new Date(this.now()).toISOString(),
          actionId: proposal.id,
        },
        "awaiting_approval",
      );
    } catch {
      // El correo ya salio: no se convierte un fallo de contabilidad en reenvio.
    }
  }

  private async audit(owner: string, action: ActionProposal, kind: string, detail: string, actorId?: string) {
    await this.db.put(owner, "action-audit", {
      id: `audit-${action.id}-${Date.now()}`,
      actionId: action.id,
      taskId: action.taskId ?? null,
      // ACTIONS_ACTOR_ID_V1 — actorId de quien ejecuta la transición.
      actorId: actorId ?? null,
      kind,
      detail: detail.slice(0, 2000),
      status: action.status,
      hash: action.hash,
      createdAt: new Date().toISOString(),
    });
  }

  private async record(owner: string, action: ActionProposal, detail: string) {
    await this.db.put(owner, "activity", {
      id: randomUUID(),
      actionId: action.id,
      title: action.title,
      detail,
      date: new Date(this.now()).toISOString(),
      status: action.status,
    });
  }
}

