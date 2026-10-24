// VERIFIER_DISAGREEMENT_V1 - si el determinista y el LLM discrepan, se
// crea una ApprovalRequest para revision humana.

import { randomUUID } from "node:crypto";
import type { Store } from "../../db.ts";
import type { VerificationResult } from "../../../../../packages/domain/src/verification.ts";

export interface DisagreementInput {
  tenantId: string;
  owner: string;
  goalId?: string;
  taskId?: string;
  deterministic: VerificationResult;
  llm: VerificationResult;
}

export class VerifierDisagreement {
  constructor(private readonly db: Store) {}

  async record(input: DisagreementInput): Promise<void> {
    if (input.deterministic.verified === input.llm.verified) return;
    const id = randomUUID();
    await this.db.put(input.tenantId, "approval-requests", {
      id,
      tenantId: input.tenantId,
      owner: input.owner,
      ...(input.goalId ? { goalId: input.goalId } : {}),
      ...(input.taskId ? { taskId: input.taskId } : {}),
      capabilityId: "verification.disagreement",
      reason: `El verificador deterministico dijo ${input.deterministic.verified ? "OK" : "KO"} y el LLM dijo ${input.llm.verified ? "OK" : "KO"}. Revisa manualmente.`,
      risk: "medium",
      status: "pending",
      payload: {
        deterministic: input.deterministic,
        llm: input.llm,
      },
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
    });
  }
}