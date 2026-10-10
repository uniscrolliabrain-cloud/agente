// 33-langsmith - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "run.record", title: "run.record", kind: "action" as const, risk: "low" as const },
  { id: "span.record", title: "span.record", kind: "action" as const, risk: "low" as const },
  { id: "evaluation.submit", title: "evaluation.submit", kind: "action" as const, risk: "low" as const },
  { id: "run.flag", title: "run.flag", kind: "action" as const, risk: "low" as const },
  { id: "trace.read", title: "trace.read", kind: "action" as const, risk: "low" as const },
  { id: "cost.by_agent", title: "cost.by_agent", kind: "action" as const, risk: "low" as const }
] as const;
