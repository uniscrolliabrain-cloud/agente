import { createHash } from "node:crypto";
import type { AgentMemory, AgentTask } from "../../../../packages/domain/src/agent.ts";
import type { Store } from "../db.ts";

export class LearningService {
  constructor(private readonly db: Store) {}
  async learn(owner: string, task: AgentTask, facts: string[]) {
    const clean = [...new Set(facts.map((x) => x.trim()).filter(Boolean))].slice(0, 20);
    let saved = 0;
    for (const text of clean) {
      const id = `learn-${createHash("sha256").update(`${task.id}:${text}`).digest("hex").slice(0, 32)}`;
      const memory: AgentMemory = { id, text, source: `sop:${task.id}`, createdAt: new Date().toISOString() };
      if (await this.db.insertIfAbsent(owner, "memories", memory)) saved++;
    }
    return saved;
  }
}
