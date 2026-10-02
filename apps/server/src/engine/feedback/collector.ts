// FEEDBACK_COLLECTOR_V1 - recoge feedback del usuario sobre outcomes.

import type { Store } from "../../db.ts";

export interface FeedbackEntry {
  id: string;
  tenantId: string;
  owner: string;
  goalId?: string;
  taskId?: string;
  rating: "useful" | "not_useful" | "neutral";
  comment?: string;
  createdAt: string;
}

export class FeedbackCollector {
  constructor(private readonly db: Store) {}

  async record(entry: Omit<FeedbackEntry, "id" | "createdAt">): Promise<FeedbackEntry> {
    const value: FeedbackEntry = {
      ...entry,
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    await this.db.put(entry.tenantId, "feedback", value);
    return value;
  }

  async listForTenant(tenantId: string): Promise<FeedbackEntry[]> {
    return this.db.list<FeedbackEntry>(tenantId, "feedback");
  }
}