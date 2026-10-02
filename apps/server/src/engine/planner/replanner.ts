// REPLANNER_V1 - regenera un Plan cuando el anterior falla.

import type { Goal, Plan } from "../../../../../packages/domain/src/index.ts";

export interface ReplannerInput {
  goal: Goal;
  previousPlan: Plan;
  failedStepId: string;
  error: string;
}

export interface Replanner {
  replan(input: ReplannerInput): Promise<Plan | null>;
}

export class StubReplanner implements Replanner {
  async replan(_input: ReplannerInput): Promise<Plan | null> {
    return null;
  }
}