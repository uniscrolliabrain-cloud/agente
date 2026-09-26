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
