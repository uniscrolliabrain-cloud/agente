// 29-isms-online - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "risk.register", title: "risk.register", kind: "action" as const, risk: "low" as const },
  { id: "control.assign", title: "control.assign", kind: "action" as const, risk: "low" as const },
  { id: "evidence.attach", title: "evidence.attach", kind: "action" as const, risk: "low" as const },
  { id: "review.schedule", title: "review.schedule", kind: "action" as const, risk: "low" as const },
  { id: "risk.close", title: "risk.close", kind: "action" as const, risk: "low" as const },
  { id: "risk.register_view", title: "risk.register_view", kind: "action" as const, risk: "low" as const },
  { id: "compliance.overview", title: "compliance.overview", kind: "action" as const, risk: "low" as const }
] as const;
