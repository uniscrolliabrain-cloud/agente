// 26-odoo-inventory - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "stock.receive", title: "stock.receive", kind: "action" as const, risk: "low" as const },
  { id: "stock.issue", title: "stock.issue", kind: "action" as const, risk: "low" as const },
  { id: "stock.transfer", title: "stock.transfer", kind: "action" as const, risk: "low" as const },
  { id: "stock.adjust", title: "stock.adjust", kind: "action" as const, risk: "low" as const },
  { id: "stock.reserve", title: "stock.reserve", kind: "action" as const, risk: "low" as const },
  { id: "stock.list", title: "stock.list", kind: "action" as const, risk: "low" as const },
  { id: "stock.low_alerts", title: "stock.low_alerts", kind: "action" as const, risk: "low" as const }
] as const;
