// 04-holded - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "invoice.create_draft", title: "invoice.create_draft", kind: "action" as const, risk: "low" as const },
  { id: "invoice.issue", title: "invoice.issue", kind: "action" as const, risk: "low" as const },
  { id: "invoice.void", title: "invoice.void", kind: "action" as const, risk: "low" as const },
  { id: "credit_note.create", title: "credit_note.create", kind: "action" as const, risk: "low" as const },
  { id: "payment.register", title: "payment.register", kind: "action" as const, risk: "low" as const },
  { id: "expense.record", title: "expense.record", kind: "action" as const, risk: "low" as const },
  { id: "counterparty.upsert", title: "counterparty.upsert", kind: "action" as const, risk: "low" as const }
] as const;
