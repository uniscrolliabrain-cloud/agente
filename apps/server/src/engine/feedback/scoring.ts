// FEEDBACK_SCORING_V1 - ajusta el scoring del contexto segun feedback.

import type { Store } from "../../db.ts";

export interface FeedbackRow {
  id: string;
  tenantId: string;
  owner: string;
  goalId?: string;
  taskId?: string;
  rating: "useful" | "not_useful" | "neutral";
  comment?: string;
  createdAt: string;
}

export class FeedbackScoring {
  constructor(private readonly db: Store) {}

  async multipliersFor(tenantId: string): Promise<Record<string, number>> {
    const rows = await this.db.list<FeedbackRow>(tenantId, "feedback", { limit: 5000 }).catch(() => []);
    const bySource = new Map<string, number[]>();
    for (const r of rows) {
      const key = r.taskId ?? r.goalId ?? "unknown";
      const value = r.rating === "useful" ? 1.5 : r.rating === "not_useful" ? 0.5 : 1;
      const list = bySource.get(key) ?? [];
      list.push(value);
      bySource.set(key, list);
    }
    const out: Record<string, number> = {};
    for (const [key, values] of bySource) {
      out[key] = values.reduce((a, b) => a + b, 0) / values.length;
    }
    return out;
  }
}