// 21-stripe - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "payment.record", title: "payment.record", kind: "action" as const, risk: "low" as const },
  { id: "refund.issue", title: "refund.issue", kind: "action" as const, risk: "low" as const },
  { id: "dispute.open", title: "dispute.open", kind: "action" as const, risk: "low" as const },
  { id: "dispute.resolve", title: "dispute.resolve", kind: "action" as const, risk: "low" as const },
  { id: "revenue.read", title: "revenue.read", kind: "action" as const, risk: "low" as const },
  { id: "payment.list", title: "payment.list", kind: "action" as const, risk: "low" as const },
  { id: "subscription.manage", title: "subscription.manage", kind: "action" as const, risk: "low" as const }
] as const;
