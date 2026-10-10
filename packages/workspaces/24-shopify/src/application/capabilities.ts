// 24-shopify - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "order.create", title: "order.create", kind: "action" as const, risk: "low" as const },
  { id: "order.fulfill", title: "order.fulfill", kind: "action" as const, risk: "low" as const },
  { id: "order.return_register", title: "order.return_register", kind: "action" as const, risk: "low" as const },
  { id: "inventory.sync", title: "inventory.sync", kind: "action" as const, risk: "low" as const },
  { id: "refund.issue", title: "refund.issue", kind: "action" as const, risk: "low" as const },
  { id: "order.list", title: "order.list", kind: "action" as const, risk: "low" as const },
  { id: "order.read", title: "order.read", kind: "action" as const, risk: "low" as const }
] as const;
