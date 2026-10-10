// 10-perdoo - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "objective.create", title: "objective.create", kind: "action" as const, risk: "low" as const },
  { id: "objective.update_kr", title: "objective.update_kr", kind: "action" as const, risk: "low" as const },
  { id: "objective.link_strategy", title: "objective.link_strategy", kind: "action" as const, risk: "low" as const },
  { id: "objective.close", title: "objective.close", kind: "action" as const, risk: "low" as const },
  { id: "objective.list", title: "objective.list", kind: "action" as const, risk: "low" as const },
  { id: "objective.progress", title: "objective.progress", kind: "action" as const, risk: "low" as const }
] as const;
