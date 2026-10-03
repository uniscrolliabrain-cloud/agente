// LEARNING_OBSERVER_V1 - observa cada ejecucion y guarda hechos/patrones/fallos.

import type { Store } from "../../db.ts";
import type { TenantScopedStore } from "../../db-tenant.ts";
import type {
  Goal,
  Outcome,
  Plan,
} from "../../../../../packages/domain/src/index.ts";

export interface Observation {
  tenantId: string;
  goal: Goal;
  plan: Plan;
  outcome: Outcome;
}

export class LearningObserver {
  constructor(private readonly db: Store | TenantScopedStore) {}

  async observe(input: Observation): Promise<void> {
    const now = new Date().toISOString();
    const tenantId = input.tenantId;

    // Hecho: resumen del resultado.
    if (input.outcome.status === "achieved") {
      await this.db.put(tenantId, "learning-facts", {
        id: `fact-${input.goal.id}-${Date.now()}`,
        tenantId,
        text: `Goal "${input.goal.title}" logrado con plan ${input.plan.id}`,
        source: `goal:${input.goal.id}`,
        confidence: 0.9,
        evidenceIds: [],
        timesUsed: 0,
        successRate: 1,
        createdAt: now,
      });
    }

    // Patron: misma firma de plan.
    const signature = input.plan.steps.map((s) => s.capabilityId ?? s.id).join(">");
    const existing = await this.db.get<{
      id: string;
      successCount: number;
      failureCount: number;
    }>(tenantId, "learning-patterns", `pattern-${signature}`);
    if (existing) {
      existing.successCount += input.outcome.status === "achieved" ? 1 : 0;
      existing.failureCount += input.outcome.status === "failed" ? 1 : 0;
      await this.db.put(tenantId, "learning-patterns", existing as unknown as { id: string });
    } else {
      await this.db.put(tenantId, "learning-patterns", {
        id: `pattern-${signature}`,
        tenantId,
        goalKind: input.goal.title.slice(0, 100),
        planSignature: signature,
        successCount: input.outcome.status === "achieved" ? 1 : 0,
        failureCount: input.outcome.status === "failed" ? 1 : 0,
        avgDurationMs: 0,
        proposedAsSop: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    // LEARNING_OBSERVER_V2 - fallo: acumula ocurrencias.
    if (input.outcome.status === "failed" || input.outcome.status === "blocked") {
      const sig = input.outcome.summary.slice(0, 200);
      const lessonId = `lesson-${sig}`;
      const existing = await this.db.get<{ occurrences: number }>(tenantId, "failure-lessons", lessonId);
      if (existing) {
        await this.db.put(tenantId, "failure-lessons", {
          ...existing,
          id: lessonId,
          tenantId,
          errorSignature: sig,
          occurrences: (existing.occurrences ?? 0) + 1,
          lastSeenAt: now,
        });
      } else {
        await this.db.put(tenantId, "failure-lessons", {
          id: lessonId,
          tenantId,
          errorSignature: sig,
          cause: input.outcome.summary,
          correction: "",
          occurrences: 1,
          createdAt: now,
          lastSeenAt: now,
        });
      }
    }

    // LEARNING_OBSERVER_V2 - promueve patrón a SOP propuesto si supera umbral.
    const patternRow = await this.db.get<{ successCount: number; proposedAsSop: boolean; planSignature: string }>(
      tenantId,
      "learning-patterns",
      `pattern-${signature}`,
    );
    if (patternRow && patternRow.successCount >= 5 && !patternRow.proposedAsSop) {
      await this.db.put(tenantId, "procedural-learning", {
        id: `proc-${signature}`,
        tenantId,
        sourcePatternId: `pattern-${signature}`,
        proposedSop: { signature: patternRow.planSignature },
        status: "proposed",
        createdAt: now,
      });
      await this.db.put(tenantId, "learning-patterns", {
        ...patternRow,
        id: `pattern-${signature}`,
        tenantId,
        proposedAsSop: true,
      });
    }
  }
}