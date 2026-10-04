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

interface Options {
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
  connection?: (owner: string) => Promise<{ id: string; account: string } | null>;
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
    private readonly db: Store,
    private readonly options: Options,
    bus?: EventBus,
    policy?: PolicyEngine,
  ) {
    this.bus = bus;
    this.policy = policy;
    this.now = options.now ?? Date.now;
  }
  /**
   * ACTIONS_RETRY_V1 — reintenta una acción que falló con error determinista.
   * Solo permitido si el status es "failed" y el error no es outcome_unknown.
   * Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
   */
  async retry(owner: string, actionId: string): Promise<ActionProposal> {
    const action = await this.db.get<ActionProposal>(owner, "actions", actionId);
    if (!action) throw new AppError("Action not found", 404);
    if (action.status !== "failed") {
      throw new AppError(
        `Only failed actions can be retried (current: ${action.status})`,
        409,
      );
    }
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
      { status: "failed" },
      { status: "awaiting_review", error: null, result: null },
    );
    if (!reset) throw new AppError("Action changed; refresh and retry", 409);
    await this.audit(owner, reset, "retried", "Retried by user");
    return reset;
  }

  async propose(
    owner: string,
    raw: unknown,
    idempotencyKey?: string,
    taskId?: string,
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
        ? `Send “${input.data.subject}”`
        : input.kind === "calendar.delete"
          ? `Delete ${input.data.title}`
          : input.kind === "drive.trash"
            ? `Move “${input.data.name}” to trash`
            : input.kind === "drive.rename"
              ? `Rename file to “${input.data.name}”`
              : `${input.kind === "calendar.create" ? "Create" : "Update"} ${input.data.title}`;
    const createdAt = new Date(this.now()).toISOString();
    const proposal: ActionProposal = {
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
      expiresAt: new Date(this.now() + 30 * 60 * 1000).toISOString(),
    };
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
    await this.bus?.emit(owner, "action.proposed", { kind: "action", id: saved.id }, {
      actionId: saved.id,
      title: saved.title.slice(0, 300),
      kind: saved.kind,
    });
    return saved;
  }
  async decide(
    owner: string,
    id: string,
    hash: string,
    decision: "approve" | "deny",
  ): Promise<ActionProposal> {
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
      const expired = await this.db.compareAndSwap<ActionProposal>(
        owner,
        "actions",
        id,
        { status: "awaiting_review", hash, expiresAt: proposal.expiresAt },
        { status: "expired" },
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
    }
    // POLICY_GATE_V1 — si la accion esta vinculada a una tarea con rol activo,
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
    // ACTIONS_DEFERRED_WIRE_V1 — si hay deferred, aprobar no ejecuta ya.
    // Se programa para dentro de `windowMs` y el usuario puede deshacer.
    // Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
    if (this.options.deferred && decision === "approve") {
      const deferredRecord = await this.options.deferred.decide(
        owner,
        claimed.id,
        owner,
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
      // Si aún no se alcanzó el número de firmas, la propuesta vuelve a
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
    let finished: ActionProposal;
    try {
      const input = proposalSchema.parse({ kind: claimed.kind, data: claimed.data });
      const result = await this.options.execute(
        owner,
        input,
        claimed.connectionId,
        claimed.targetVersion,
      );
      finished = { ...claimed, status: "succeeded", result };
    } catch (error) {
      const unknown =
        error instanceof Error &&
        (("outcomeUnknown" in error && error.outcomeUnknown === true) ||
          ("code" in error && error.code === "outcome_unknown"));
      finished = {
        ...claimed,
        status: unknown ? "outcome_unknown" : "failed",
        error: error instanceof Error ? error.message : "Execution failed",
      };
    }
    await this.db.put(owner, "actions", finished);
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
   * ACTIONS_AUDIT_V1 — registra una entrada de auditoría estructurada
   * por cada transición de estado de la propuesta.
   * Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
   */
  private async audit(owner: string, action: ActionProposal, kind: string, detail: string) {
    await this.db.put(owner, "action-audit", {
      id: `audit-${action.id}-${Date.now()}`,
      actionId: action.id,
      taskId: action.taskId ?? null,
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

