// 20-ramp - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "expense.submit", title: "expense.submit", kind: "action" as const, risk: "low" as const },
  { id: "expense.approve", title: "expense.approve", kind: "action" as const, risk: "low" as const },
  { id: "expense.reject", title: "expense.reject", kind: "action" as const, risk: "low" as const },
  { id: "expense.receipt_attach", title: "expense.receipt_attach", kind: "action" as const, risk: "low" as const },
  { id: "spend_limit.set", title: "spend_limit.set", kind: "action" as const, risk: "low" as const },
  { id: "expense.list", title: "expense.list", kind: "action" as const, risk: "low" as const }
] as const;
