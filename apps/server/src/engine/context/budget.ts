// CONTEXT_BUDGET_V1 - recorta items por presupuesto de tokens.

export interface ContextItem {
  value: string;
  tokens: number;
  score: number;
}

export interface BudgetAllocation {
  roleTokens?: number;
  entityTokens?: number;
  memoryTokens?: number;
  eventTokens?: number;
  documentTokens?: number;
}

const DEFAULT_BUDGET: Required<BudgetAllocation> = {
  roleTokens: 2000,
  entityTokens: 3000,
  memoryTokens: 5000,
  eventTokens: 2000,
  documentTokens: 10000,
};

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function selectWithinBudget(
  items: ContextItem[],
  budget: number,
): ContextItem[] {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const out: ContextItem[] = [];
  let used = 0;
  for (const item of sorted) {
    if (used + item.tokens > budget) continue;
    out.push(item);
    used += item.tokens;
  }
  return out;
}

export function allocationWithDefaults(
  partial?: BudgetAllocation,
): Required<BudgetAllocation> {
  return { ...DEFAULT_BUDGET, ...(partial ?? {}) };
}