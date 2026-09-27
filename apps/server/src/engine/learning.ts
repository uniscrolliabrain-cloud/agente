import type { AgentTask } from "../../../../packages/domain/src/agent.ts";
import type { MemoryService } from "./memory.ts";

/**
 * LearningService acepta SOLO hechos estructurales curados.
 * Delega en MemoryService, que deduplica por hash de texto normalizado (sin
 * task.id), asi que dos ejecuciones de la misma SOP no ensucian la memoria.
 */
export class LearningService {
  constructor(private readonly memory: MemoryService) {}

  async learn(owner: string, task: AgentTask, facts: string[]) {
    const clean = [...new Set(facts.map((x) => x.trim()).filter(Boolean))]
      .filter((text) => text.length <= 500)
      .slice(0, 20);
    let saved = 0;
    for (const text of clean) {
      const result = await this.memory.remember(owner, text, {
        source: `sop:${task.id}`,
        category: "proceso",
      });
      if (result.created) saved++;
    }
    return saved;
  }
}