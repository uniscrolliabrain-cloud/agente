// 28-odoo-manufacturing - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "production.plan", title: "production.plan", kind: "action" as const, risk: "low" as const },
  { id: "production.start", title: "production.start", kind: "action" as const, risk: "low" as const },
  { id: "production.consume", title: "production.consume", kind: "action" as const, risk: "low" as const },
  { id: "production.record_output", title: "production.record_output", kind: "action" as const, risk: "low" as const },
  { id: "production.close", title: "production.close", kind: "action" as const, risk: "low" as const },
  { id: "production.read", title: "production.read", kind: "action" as const, risk: "low" as const }
] as const;
