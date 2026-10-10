// 12-odoo-purchase - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "purchase.request", title: "purchase.request", kind: "action" as const, risk: "low" as const },
  { id: "purchase.approve", title: "purchase.approve", kind: "action" as const, risk: "low" as const },
  { id: "purchase.send", title: "purchase.send", kind: "action" as const, risk: "low" as const },
  { id: "purchase.receive", title: "purchase.receive", kind: "action" as const, risk: "low" as const },
  { id: "purchase.list", title: "purchase.list", kind: "action" as const, risk: "low" as const },
  { id: "purchase.read", title: "purchase.read", kind: "action" as const, risk: "low" as const }
] as const;
