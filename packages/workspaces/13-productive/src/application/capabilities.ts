// 13-productive - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "project.allocate", title: "project.allocate", kind: "action" as const, risk: "low" as const },
  { id: "project.read", title: "project.read", kind: "action" as const, risk: "low" as const },
  { id: "project.close", title: "project.close", kind: "action" as const, risk: "low" as const },
  { id: "time.log", title: "time.log", kind: "action" as const, risk: "low" as const },
  { id: "budget.adjust", title: "budget.adjust", kind: "action" as const, risk: "low" as const },
  { id: "profitability.read", title: "profitability.read", kind: "action" as const, risk: "low" as const }
] as const;
