import { apiFetch } from "./client";
import type { ActionProposal, WorkspaceSnapshot } from "../types/api";

export async function getWorkspace(): Promise<WorkspaceSnapshot> {
  return apiFetch<WorkspaceSnapshot>("/api/workspace");
}

export async function decideAction(
  actionId: string,
  hash: string,
  decision: "approve" | "deny",
): Promise<ActionProposal> {
  return apiFetch<ActionProposal>(`/api/actions/${encodeURIComponent(actionId)}/decide`, {
    method: "POST",
    body: { hash, decision },
  });
}

/**
 * RECONCILE_ACTION_V1 — reconcilia una acción en outcome_unknown.
 * El operador confirma si el efecto externo se ejecutó o no.
 * Ver: docs/audits/06-aprobaciones-acciones/roadmap.md §8.
 */
export async function reconcileAction(
  actionId: string,
  outcome: "executed" | "not_executed",
  note?: string,
): Promise<ActionProposal> {
  return apiFetch<ActionProposal>(`/api/actions/${encodeURIComponent(actionId)}/reconcile`, {
    method: "POST",
    body: { outcome, ...(note ? { note } : {}) },
  });
}

/**
 * CANCEL_ACTION_V1 — cancela una acción programada (undo).
 * Ver: docs/audits/06-aprobaciones-acciones/roadmap.md §8.
 */
export async function cancelAction(actionId: string): Promise<ActionProposal> {
  return apiFetch<ActionProposal>(`/api/actions/${encodeURIComponent(actionId)}/cancel`, {
    method: "POST",
    body: {},
  });
}
