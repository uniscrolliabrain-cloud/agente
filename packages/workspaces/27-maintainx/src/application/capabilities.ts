// 27-maintainx - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "asset.register", title: "asset.register", kind: "action" as const, risk: "low" as const },
  { id: "maintenance.open", title: "maintenance.open", kind: "action" as const, risk: "low" as const },
  { id: "maintenance.complete", title: "maintenance.complete", kind: "action" as const, risk: "low" as const },
  { id: "maintenance.schedule", title: "maintenance.schedule", kind: "action" as const, risk: "low" as const },
  { id: "inspection.record", title: "inspection.record", kind: "action" as const, risk: "low" as const },
  { id: "asset.registry", title: "asset.registry", kind: "action" as const, risk: "low" as const }
] as const;
