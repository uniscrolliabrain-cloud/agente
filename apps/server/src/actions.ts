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
import { classifyAdapterFailure } from "./engine/execution/outcome.ts";

// ACTIONS_STORE_CONTRACT_V1 - ActionService solo usa estas cinco operaciones.
// Declararlas aparte (en vez de pedir el Store completo) permite inyectar el
// TenantScopedStore, que no implementa select/rawQuery/close. Y hace explicito
// el contrato que importa aqui: la accion se guarda con la misma clave de
// tenant que leen el worker y las rutas de aprobacion.
export interface ActionsStore {
  transaction<T>(fn: (tx: Pick<ActionsStore, "claim" | "put">) => Promise<T>): Promise<T>;
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
  // APPROVAL_HASH_CLAIM_V1 - el quinto argumento ata la reclamacion a la
  // revision revisada. Sin el, editar entre la lectura y el claim aprobaba
  // un contenido que el usuario nunca vio.
  claim<T>(
    owner: string,
    id: string,
    status: string,
    now: string,
    expectedHash?: string,
  ): Promise<T | null>;
  // LEAD_FOLLOW_UP_V1 - la guarda del seguimiento necesita releer el hilo cuando
  // el store lo permite; el resto de acciones no depende de esta lectura.
  list?<T = Record<string, unknown>>(owner: string, kind: string): Promise<T[]>;
  // C05_SHARED_ACTIONS_V1 - lectura acotada al tenant resuelto por la peticion.
  // Opcional: con un store crudo (tests de servicio) la aprobacion sigue siendo
  // owner-scoped y las rutas que la necesitan responden 404, no adivinan.
  scanByPrefix?<T>(kind: string, tenantId: string, limit?: number): Promise<{ owner: string; value: T }[]>;
  // ACTION_DISPATCH_RECOVERY_V1 - el barrido de intenciones de despacho usa el
  // scan por estado que el store ya expone; es opcional para stores de test.
  scanByStatus?<T>(kind: string, statuses: string[], limit?: number): Promise<{ owner: string; value: T }[]>;
}

/**
 * ACTION_DISPATCH_INTENT_V1 - intencion durable escrita en la MISMA
 * transaccion que el claim. Si el proceso cae despues del commit y antes de
 * auditar, emitir o persistir el receipt, esta fila es la evidencia de que la
 * decision existio y de que el efecto pudo haberse despachado.
 */
export interface ActionDispatchIntent {
  id: string;
  actionId: string;
  tenantId?: string | null;
  status: "pending" | "settled" | "reconciled" | "orphaned";
  hash?: string;
  decidedBy?: string;
  decidedAt?: string;
  settledAt?: string;
  reconciledAt?: string;
  actionStatus?: string;
  workerId?: string;
  leaseExpiresAt?: string;
}

/**
 * C05_SHARED_ACTIONS_V1 - revision minima de una propuesta ajena. No se expone
 * el payload (`data`): quien la aprueba despacha la revision ya preparada por su
 * autor, no una copia editable por un tercero.
 */
export interface SharedActionReview {
  id: string;
  title: string;
  kind: ActionProposal["kind"];
  status: ActionProposal["status"];
  hash: string;
  createdAt: string;
  expiresAt: string;
  /** Actor que preparo la propuesta (owner del registro). */
  requestedBy: string;
  taskId?: string;
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
  private readonly workerId = randomUUID();
  private readonly dispatchLeaseMs = 300000;
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

  // C05_SHARED_ACTIONS_V1 - propuestas de la empresa.
  //
  // Cada accion se guarda en la zona de quien la preparo, porque es ese actor
  // quien tiene la conexion de Google con la que se reviso y con la que se
  // despacharia. Correcto para ejecutar, pero dejaba la propuesta invisible al
  // resto de la empresa: un `admin` con `actions.approve` no podia aprobar lo
  // que preparo un `member`. Estas dos lecturas la resuelven dentro del tenant
  // que la peticion ya resolvio; nunca recorren otro prefijo, asi que dos
  // empresas con el mismo userId siguen sin verse.
  async findInCompany(
    tenantId: string,
    actionId: string,
  ): Promise<{ owner: string; proposal: ActionProposal } | null> {
    if (typeof this.db.scanByPrefix !== "function") return null;
    const rows = await this.db.scanByPrefix<ActionProposal>("actions", tenantId, 2000);
    const found = rows.find((row) => row.value?.id === actionId);
    return found ? { owner: found.owner, proposal: found.value } : null;
  }

  /** Revisiones pendientes de toda la empresa, la mas reciente primero. */
  async pendingInCompany(tenantId: string, limit = 100): Promise<SharedActionReview[]> {
    if (typeof this.db.scanByPrefix !== "function") return [];
    const rows = await this.db.scanByPrefix<ActionProposal>("actions", tenantId, 2000);
    return rows
      .filter((row) => row.value?.status === "awaiting_review")
      .sort((a, b) => (b.value.createdAt ?? "").localeCompare(a.value.createdAt ?? ""))
      .slice(0, Math.max(1, limit))
      .map(({ owner, value }) => ({
        id: value.id,
        title: value.title,
        kind: value.kind,
        status: value.status,
        hash: value.hash,
        createdAt: value.createdAt,
        expiresAt: value.expiresAt,
        requestedBy: (value as { principal?: string }).principal ?? owner,
        ...(value.taskId ? { taskId: value.taskId } : {}),
      }));
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
      // APPROVAL_CAPABILITY_BINDING_V1 - la aprobacion declara que capability
      // autoriza, con la misma convencion que el recibo formal
      // (`action:<kind>`). El runner exige ese vinculo en vez de omitirlo si
      // falta, asi que la propuesta lo escribe al nacer.
      capabilityId: `action:${input.kind}`,
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
      // APPROVAL_TENANT_BINDING_V1 - el tenant autorizado viaja con la
      // propuesta. Sin scope explicito no se inventa uno: el binding del
      // runner exige tenant en la ruta gobernada.
      ...(currentTenantScope()?.tenantId ? { tenantId: currentTenantScope()!.tenantId } : {}),
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
    // APPROVAL_DECIDE_IDEMPOTENT_V1 - decidir sobre una propuesta que ya no
    // esta `awaiting_review` devuelve el estado actual, no un error: cancelar
    // una tarea deniega su accion y la UI necesita leer ese `denied`
    // (tests/workflows.test.ts:127). Un 409 ahi rompia ese contrato.
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
    if (decision === "approve") await this.assertConnectionCurrent(owner, proposal);
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
      tenantId: currentTenantScope()?.tenantId ?? owner,
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
    const claimed = await this.db.transaction(async (tx) => {
      const winner = await tx.claim<ActionProposal>(
        owner,
        id,
        decision === "deny" ? "denied" : "executing",
        new Date(this.now()).toISOString(),
        hash,
      );
      // APPROVAL_HASH_CLAIM_V1 - el recibo formal se construye desde el
      // ganador del claim, no desde la copia leida antes de la transaccion.
      if (winner) {
        await tx.put(owner, "approval-requests", {
          ...approval,
          payload: { data: winner.data, hash: winner.hash, decision },
        });
        // ACTION_DECIDE_ATOMIC_V1 - auditoria, actividad e intencion de
        // despacho se escriben en la misma transaccion que el claim. Antes,
        // una caida justo despues del commit dejaba la accion `executing` sin
        // rastro de la decision.
        await this.recordIn(tx, owner, winner, decision === "deny" ? "Declined; no changes made" : "Approved; execution started");
        await this.auditIn(tx, owner, winner, decision, decision === "deny" ? "Declined by user" : "Approved by user");
        if (decision === "approve") {
          await tx.put(owner, "action-dispatch", {
            id: winner.id,
            actionId: winner.id,
            tenantId: currentTenantScope()?.tenantId ?? null,
            status: "pending",
            hash: winner.hash,
            decidedBy: userId ?? owner,
            decidedAt: new Date(this.now()).toISOString(),
            workerId: this.workerId,
            leaseExpiresAt: new Date(Date.now() + this.dispatchLeaseMs).toISOString(),
          } as ActionDispatchIntent & { id: string });
        }
      }
      return winner;
    });
    if (!claimed) {
      const current = await this.db.get<ActionProposal>(owner, "actions", id);
      if (!current) throw new AppError("Action not found", 404);
      // APPROVAL_HASH_RACE_V1 - si la revision cambio entre la lectura y el
      // claim, decidir ejecutaria algo distinto de lo revisado. Mismo hash
      // conserva APPROVAL_DECIDE_IDEMPOTENT_V1 (devolver estado actual).
      if (current.hash !== hash)
        throw new AppError(
          "This proposal changed. Open its latest review before deciding.",
          409,
        );
      return current;
    }
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
   * EFFECT_BOUNDARY_AUTHZ_V1 - vinculo revision/conexion vigente. Se usa al
   * decidir y otra vez inmediatamente antes de `options.execute`.
   */
  private async assertConnectionCurrent(
    owner: string,
    proposal: ActionProposal,
  ): Promise<void> {
    if (!this.options.connection) return;
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
    // ACTION_DISPATCH_STARTED_V1 - distingue un rechazo confirmado antes de
    // invocar al proveedor de un error posterior al despacho.
    let dispatched = false;
    const renew = () => this.db.compareAndSwap<ActionDispatchIntent>(
      owner, "action-dispatch", claimed.id,
      { status: "pending", workerId: this.workerId },
      { leaseExpiresAt: new Date(Date.now() + this.dispatchLeaseMs).toISOString() },
    );
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    try {
      if (!await renew()) throw new AppError("Dispatch lease unavailable", 409);
      heartbeat = setInterval(() => { void renew().catch(() => null); }, 30000);
      heartbeat.unref?.();
      // EFFECT_BOUNDARY_AUTHZ_V1 - la autorizacion de conexion se revalida
      // justo antes del efecto: una rotacion entre claim y despacho no puede
      // ejecutarse con la credencial nueva. No promete atomicidad remota.
      await this.assertConnectionCurrent(owner, claimed);
      const input = proposalSchema.parse({ kind: claimed.kind, data: claimed.data });
      const live = await this.db.transaction(async () => {
        const current = await this.db.compareAndSwap<ActionProposal>(
          owner, "actions", claimed.id, { status: "executing", hash: claimed.hash }, {},
        );
        return current && await renew();
      });
      if (!live) throw new AppError("Dispatch authority expired", 409);
      dispatched = true;
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
      // ACTION_OUTCOME_EVIDENCE_V1 - solo un rechazo confirmado ANTES del
      // despacho permite reintentar. Un error generico despues de invocar al
      // proveedor no prueba ausencia de efecto: se conserva como ambiguo y
      // exige conciliacion, nunca otro envio automatico.
      const message = error instanceof Error ? error.message : "Execution failed";
      const status = (error as { status?: number })?.status;
      const failure = classifyAdapterFailure(error);
      const rejectedBeforeDispatch =
        !dispatched && typeof status === "number" && status >= 400 && status < 500;
      const ambiguous = dispatched && !failure.retrySafe;
      const errorKind = ambiguous
        ? "outcome_unknown"
        : rejectedBeforeDispatch || failure.retrySafe
          ? "business"
          : "infra";
      finished = {
        ...claimed,
        status: ambiguous ? "outcome_unknown" : "failed",
        error: message,
        provider: "google",
        executedAt,
        ...(decidedBy ? { approvedBy: decidedBy } : {}),
        // APPROVAL_AMBIGUOUS_V1 - un resultado incierto exige conciliacion
        // humana: no hay recibo y no se reenvia automaticamente.
        ...(ambiguous
          ? { reconciliationRequired: true, errorKind: "outcome_unknown" as const }
          : { errorKind }),
      } as unknown as ActionProposal;
    }
    clearInterval(heartbeat);
    await this.db.transaction(async () => {
      await this.db.put(owner, "actions", finished);
      await this.settleDispatch(owner, finished.id, finished.status);
    });
    if (finished.status === "succeeded") await this.markFollowUpSent(owner, finished);
    // Preserve the human decision independently of the provider outcome.
    const approval = await this.db.get<ApprovalRequest>(owner, "approval-requests", finished.id);
    await this.db
      .put(owner, "approval-requests", {
        ...approval,
        id: finished.id,
        tenantId: currentTenantScope()?.tenantId ?? approval?.tenantId ?? owner,
        owner,
        status: approval?.status ?? "approved",
        executionStatus: finished.status,
        decidedAt: approval?.decidedAt ?? new Date().toISOString(),
        decidedBy: approval?.decidedBy ?? owner,
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
    const claimed = await this.db.transaction(async (tx) => {
      const winner = await this.db.compareAndSwap<ActionProposal>(
        owner, "actions", actionId,
        { status: "scheduled", hash: proposal.hash },
        { status: "executing", executeAt: null },
      );
      if (winner) await tx.put(owner, "action-dispatch", {
        id: actionId, actionId, status: "pending", hash: winner.hash,
        decidedAt: new Date(this.now()).toISOString(),
        workerId: this.workerId,
        leaseExpiresAt: new Date(Date.now() + this.dispatchLeaseMs).toISOString(),
      } satisfies ActionDispatchIntent);
      return winner;
    });
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

  /**
   * ACTION_DISPATCH_RECONCILE_V1 - barrido de recuperacion postcommit.
   *
   * Una intencion `pending` que supera la ventana de despacho significa que el
   * proceso pudo caer entre el commit de la decision y el receipt. Si la accion
   * sigue `executing` no hay evidencia del resultado: se marca
   * `outcome_unknown` para conciliacion humana y NUNCA se reenvia el efecto. Si
   * la accion ya es terminal, la intencion se cierra como `settled`.
   */
  async reconcileDispatchIntents(limit = 50): Promise<number> {
    if (typeof this.db.scanByStatus !== "function") return 0;
    const rows = await this.db.scanByStatus<ActionDispatchIntent>("action-dispatch", ["pending"], limit);
    const cutoff =
      Date.now() - (Number(process.env.ACTION_DISPATCH_STUCK_MS ?? "300000") || 300000);
    let reconciled = 0;
    for (const { owner, value } of rows) {
      await this.db.transaction(async () => {
        if (Date.parse(value.leaseExpiresAt ?? "") > Date.now()) return;
        const decidedAt = Date.parse(value.decidedAt ?? "");
        if (!Number.isFinite(decidedAt) || decidedAt > cutoff) return;
        const action = await this.db.get<ActionProposal>(owner, "actions", value.actionId);
        if (!action) {
          await this.db.compareAndSwap(owner, "action-dispatch", value.id, { status: "pending" }, {
            status: "orphaned",
            reconciledAt: new Date(this.now()).toISOString(),
          });
          return;
        }
        if (action.status !== "executing") {
          await this.db.compareAndSwap(owner, "action-dispatch", value.id, { status: "pending" }, {
            status: "settled",
            actionStatus: action.status,
            settledAt: new Date(this.now()).toISOString(),
          });
          return;
        }
        const moved = await this.db.compareAndSwap<ActionProposal>(
          owner,
          "actions",
          action.id,
          { status: "executing" },
          {
            status: "outcome_unknown",
            error:
              "Decision committed but no receipt was persisted. Check the provider before retrying.",
            errorKind: "outcome_unknown",
            reconciliationRequired: true,
          },
        );
        if (!moved) return;
        await this.db.compareAndSwap(owner, "action-dispatch", value.id, { status: "pending" }, {
          status: "reconciled",
          actionStatus: "outcome_unknown",
          reconciledAt: new Date(this.now()).toISOString(),
        });
        if (moved) reconciled += 1;
      });
    }
    return reconciled;
  }

  /** Cierra la intencion de despacho cuando la accion ya tiene receipt. */
  private async settleDispatch(owner: string, actionId: string, status: string): Promise<void> {
    const patch = {
      status: "settled",
      actionStatus: status,
      settledAt: new Date(this.now()).toISOString(),
    };
    const settled = await this.db.compareAndSwap(owner, "action-dispatch", actionId, { status: "pending" }, patch);
    if (!settled) {
      await this.db.compareAndSwap(owner, "action-dispatch", actionId, { status: "reconciled" }, patch);
    }
  }

  private async audit(owner: string, action: ActionProposal, kind: string, detail: string, actorId?: string) {
    await this.auditIn(this.db, owner, action, kind, detail, actorId);
  }

  private async auditIn(
    store: Pick<ActionsStore, "put">,
    owner: string,
    action: ActionProposal,
    kind: string,
    detail: string,
    actorId?: string,
  ) {
    await store.put(owner, "action-audit", {
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
    await this.recordIn(this.db, owner, action, detail);
  }

  private async recordIn(
    store: Pick<ActionsStore, "put">,
    owner: string,
    action: ActionProposal,
    detail: string,
  ) {
    await store.put(owner, "activity", {
      id: randomUUID(),
      actionId: action.id,
      title: action.title,
      detail,
      date: new Date(this.now()).toISOString(),
      status: action.status,
    });
  }
}

