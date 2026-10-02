// LLM_PLANNER_V1 - genera planes usando el modelo (segunda capa sobre StubPlanner).

import type { Config } from "../../config.ts";
import type { Goal, Plan, PlanStep } from "../../../../../packages/domain/src/index.ts";
import type { Planner, PlannerInput } from "./planner.ts";

export class LlmPlanner implements Planner {
  constructor(
    private readonly config: Config,
    private readonly plannerModel?: string,
  ) {}

  async plan(input: PlannerInput): Promise<Plan> {
    const now = new Date().toISOString();
    const steps = await this.generateSteps(input);
    return {
      id: `plan-llm-${Date.now()}`,
      tenantId: input.goal.tenantId,
      owner: input.goal.owner,
      goalId: input.goal.id,
      version: 1,
      status: "draft",
      steps,
      reason: `Plan generado por LLM a partir de ${input.capabilities.length} capabilities`,
      createdAt: now,
      updatedAt: now,
    };
  }

  private async generateSteps(input: PlannerInput): Promise<PlanStep[]> {
    // Si no hay modelo configurado, delega en el stub.
    if (!this.config.model && !this.plannerModel) return [];

    // Fase 5: uso simplificado del modelo. El prompt describe el goal y las
    // capabilities disponibles, y se pide un array de steps en JSON.
    const caps = input.capabilities.map((c) => `${c.id} (${c.kind})`).join(", ");
    const prompt = [
      "Eres un planificador. Devuelve solo un array JSON de pasos.",
      `Objetivo: ${input.goal.title}`,
      `Descripcion: ${input.goal.description}`,
      `Capabilities: ${caps || "ninguna"}`,
      "Formato: [{id, title, capabilityId, inputs, dependsOn}]",
    ].join("\n");

    // La llamada real al modelo se hace via el runtime de AG-UI. Aqui
    // dejamos el stub con TODO para no inventar dependencias.
    void prompt;
    return [];
  }
}